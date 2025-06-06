// routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
import cloudinary from '../cloudinary.js'; // adjust if separate
import getPaginationParams from '../helpers/getPaginationParams.js'; // adjust if separate

import { Product } from '../models/models.js'; // adjust path

const router = express.Router();

// Set up Multer for handling file uploads (in-memory storage is simple for relaying to Cloudinary)
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Cloudinary Upload Helper
const streamUpload = (reqFileBuffer, publicId) => {
    return new Promise((resolve, reject) => {
        console.log("PUBLIC ID: ", publicId)
        const stream = cloudinary.uploader.upload_stream({
                resource_type: 'image',
                folder: 'iligancitystores_products',
                public_id: publicId,
                overwrite: true,
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        )
    
        streamifier.createReadStream(reqFileBuffer).pipe(stream);
    });
};

//! [ ] CHECK IF THIS WORKS
// Helper function to generate product_id (Year-Sequential Number)
// TODO: Test this first before using it to the database
async function generateProductId() {
    const currentYear = new Date().getFullYear().toString();
    // Find the latest product from the current year
    const lastProduct = await Product.findOne({
        product_id: new RegExp(`^${currentYear}-\\d{4}$`) // Regex to match the pattern
    }).sort({ product_id: -1 }); // Sort descending to get the latest

    let nextItemNumber = 1;
    if (lastProduct) {
        const lastProductId = lastProduct.product_id;
        const lastItemNumber = praseInt(lastProductId.split('-')[1], 10);
        nextItemNumber = lastItemNumber + 1;
    }

    // Format the item number with leading zeros (e.g., 0001, 0010, 0100)
    const formattedItemNumber = nextItemNumber.toString().padStart(4, '0');

    console.log(`Generated Item Number: ${currentYear}-${formattedItemNumber}`);
    return `${currentYear}-${formattedItemNumber}`;
}

//! [*] CHECK IF THIS WORKS
// GET endpoint to fetch all products (consider adding pagination here too, or replace with search)
// Display to Groceries and to Dev Mode
router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "location_info"
                }
            },
            {
                $lookup: {
                    from: "category",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_info",
                }
            },
            { $unwind: { path: "$location_info", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$category_info", preserveNullAndEmptyArrays: true } },
            { $sort: { "product_id": -1 } },
            {
                $project: {
                    "product_id": true,
                    "product_name": true,
                    "updated_price": true,
                    "date_updated": true,
                    "imageUrl": true,
                    "location_info.location_name": true,
                    "category_info.category_list": true,
                    "category_info.category_name": true,
                    "category_info.category_catalog": true,
                }
            },
        ]);

        res.json(products);
        //TODO: See if we need pagination on this...

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//! [ ] CHECK IF THIS WORKS
// Get endpoint to fetch a single product by _id
router.get('/api/products/:id', async (req, res) => {
    const id = req.params.id; // This is the MongoDB _id

    // Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        const product = await Product.findById(id); // Use findById for fetching by _id
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);

    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: error.message });
    }
});

//! [ ] CHECK IF THIS WORKS
// 1. Fetch items that match the query with pagination
// GET /api/products/search?query=search_term&page=1&limit=20
router.get('/api/products/search', async (req, res) => {
    const searchTerm = req.query.query;
    const { page, limit, skip } = getPaginationParams(req);

    if (!searchTerm) {
        // If no search term, return an empty list or perhaps recent items (optional)
        // For now, return an empty list
        return res.status(200).json({
            message: 'Please provide a search query.',
            products: [],
            totalProducts: 0,
            totalPages: 0,
            currentPage: page
        });
    }

    try {
        // Create a case-insensitive regex for searching product name
        const queryRegex = new RegExp(searchTerm, 'i');

        // Build the search query filter
        const filter = { product_name: queryRegex };

        // Get total count of matching products (for pagination info)
        const totalProducts = await Product.countDocuments(filter);

        // Get the paginated products
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            message: 'Products fetched successfully',
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error('Error fetching products by search term:', error);
        res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
    }
});

//! [ ] CHECK IF THIS WORKS
// 2. Fetch items according to category with pagination
// GET /api/products/category/:categoryId?page=1&limit=20
router.get('/api/products/category/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;
    const { page, limit, skip } = getPaginationParams(req);

    try {
        // Build the filter by category_id
        const filter = { category_id: categoryId };

        // Get total count of products in this category
        const totalProducts = await Product.countDocuments(filter);

        // Get the paginated products in this category
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            message: `Products for category ${categoryId} fetched successfully`,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });

    } catch (error) {
         console.error(`Error fetching products for category ${categoryId}:`, error);
        res.status(500).json({ message: 'Failed to fetch products by category.', error: error.message });
    }
});


//! [ ] CHECK IF THIS WORKS
// Get endpoint to fetch a single product by _id
router.get('/api/products/', async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "location_info"
                }
            },
            {
                $lookup: {
                    from: "category",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_info",
                }
            },
            { $unwind: { path: "$location_info", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$category_info", preserveNullAndEmptyArrays: true } },
            { $sort: { "product_id": -1 } },
            {
                $project: {
                    "product_id": true,
                    "product_name": true,
                    "updated_price": true,
                    "date_updated": true,
                    "imageUrl": true,
                    "location_info.location_name": true,
                    "category_info.category_list": true,
                    "category_info.category_name": true,
                    "category_info.category_catalog": true,
                }
            },
        ]);

        res.json(products);
        // TODO [ ]: See if we need pagination on this...

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})


//? [ ] CHECK IF THIS WORKS
// Using upload.single('productImage') middleware to handle the file upload
// TODO: Edit works, let's make it detect for New Created Product...
router.post('/api/products', upload.single('productImage'), async (req, res) => {
    // Initialize variable for image
    var uploadResult = null;
    var product = null;

    // Upload image to Cloudinary
    try {
        console.log("Type: ", req.body.formType)
        if (req?.body.formType === "edit") {
            product = await Product.findOne({ product_id: req.body.productId });
            if (!product) return res.status(404).json({ message: 'Product not found.' });

            if (req.file) {
                uploadResult = await streamUpload(req.file.buffer, req.body.productId);
                product.imageUrl = uploadResult.secure_url || product.imageUrl;
            }

            product.product_id = req.body.productId || product.product_id;
            product.product_name = req.body.productName || product.product_name;
            product.category_id = req.body.categoryId || product.category_id;
            product.updated_price = req.body.updatedPrice || product.updated_price;
            product.location_id = req.body.locationId || product.location_id;
            product.date_updated = new Date().toISOString().split('T')[0];

        } else {
            const newProductId = await generateProductId();

            if (req.file) {
                uploadResult = await streamUpload(req.file.buffer, newProductId);
            }

            product = new Product({
                product_id: newProductId,
                product_name: req.body.productName,
                category_id: req.body.categoryId || null,
                updated_price: req.body.updatedPrice,
                location_id: req.body.locationId || null,
                date_updated: new Date().toISOString().split('T')[0],
                imageUrl: uploadResult.secure_url || null, // cloudinary hosted image URL
            });
        }

        // Save the product to MongoDB
        const updatedProduct = await product.save();

        res.status(201).json({
            message: 'Product added successfully!',
            product: updatedProduct,
        });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            message: 'Failed to add product.',
            error: error.message
        });
    }
});


//! [ ] CHECK IF THIS WORKS
// PUT endpoint to update a product by _id
// Requires upload.single('productImage') if image update is allowed
router.put('/api/products/:id', upload.single('productImage'), async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        const updateData = { ...req.body }; // Copy request body data

        // Handle image update if a new file is provided
        if (req.file) {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
                resource_type: "image",
                folder: "iligancitystores_products"
            });
            updateData.imageUrl = result.secure_url; // Add new image URL to update data

            // Optional: Delete the old image from Cloudinary
            // You would need to fetch the product first to get the old imageUrl
            // and then use cloudinary.uploader.destroy()
        }

        // Update the date_updated if price is being updated or always on update
        if (updateData.updatedPrice !== undefined) {
            updateData.date_updated = new Date(); // Update date if price is provided
        } else {
            // Decide if date_updated should always update or only with price
            // For now, let's update it whenever *any* field is updated
            updateData.date_updated = new Date();
        }


        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully!',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        // Handle Mongoose validation errors specifically if needed
        res.status(500).json({ message: 'Failed to update product.', error: error.message });
    }
});

//! [ ] CHECK IF THIS WORKS
// DELETE endpoint to delete a product by _id
router.delete('/api/products/:id', async (req, res) => {
    const id = req.params.id;

     if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        // Optional: Find the product first to get the image URL for Cloudinary deletion
        const productToDelete = await Product.findById(id);
        if (!productToDelete) {
             return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the product from MongoDB
        const deletedProduct = await Product.findByIdAndDelete(id);

         // Optional: Delete the image from Cloudinary using the productToDelete's imageUrl
         if (productToDelete.imageUrl) {
            try {
                 // Extract public ID from Cloudinary URL (logic depends on your upload settings)
                 // Example: https://res.cloudinary.com/your_cloud_name/image/upload/v.../folder/public_id.jpg
                 const urlParts = productToDelete.imageUrl.split('/');
                 const publicIdWithExtension = urlParts[urlParts.length - 1];
                 const publicId = publicIdWithExtension.split('.')[0];
                 const folder = urlParts[urlParts.length - 2]; // Assuming the folder is the second to last part

                 // If you used a specific folder in upload
                 const publicIdWithFolder = folder && folder !== 'upload' ? `${folder}/${publicId}` : publicId;


                 console.log(`Attempting to delete Cloudinary image with Public ID: ${publicIdWithFolder}`);
                 await cloudinary.uploader.destroy(publicIdWithFolder);
                 console.log('Cloudinary image deleted successfully.');

             } catch (cloudinaryError) {
                console.error('Error deleting Cloudinary image:', cloudinaryError);
                // Continue with product deletion even if image deletion fails
             }
         }


        res.json({
            message: 'Product deleted successfully!',
            product: deletedProduct
        });

    } catch (error) {
         console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }
});

export default router;