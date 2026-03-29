// routes/productRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import cloudinary from '../cloudinary.js'; // adjust if separate
import getPaginationParams from '../helpers/getPaginationParams.js'; // adjust if separate
import generateProductId from '../helpers/generateProductId.js';
import { upload, streamUpload } from '../helpers/upload.js';
import { user_verify, requireRole } from '../helpers/auth.js';

import { Product } from '../models/models.js'; // adjust path

const router = express.Router();



router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Fetch all products.'
    try {
        const products = await Product.find(
            {},
            {
                "category.catalog": 0,
                "location.id": 0,
            }
        ).sort({ product_id: -1 });

        res.json(products);
        //TODO: See if we need pagination on this... probably...

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})


router.get('/:id', async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Fetch a single product by _id'
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
// 2. Fetch items according to category with pagination
// GET /api/products/category/:categoryId?page=1&limit=20
router.get('/category/:categoryId', async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Fetch products according to category (paginated) ?page=1&limit=20'
    const id = req.params.id; // This is the MongoDB _id

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


//? [ ] CHECK IF THIS WORKS
// Using upload.single('productImage') middleware to handle the file upload
// TODO: Edit works, let's make it detect for New Created Product...
router.post('/', user_verify, requireRole("moderator"), upload.single('productImage'), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Endpoint for uploading images to cloudinary'

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
router.put('/:id', user_verify, requireRole("moderator"), upload.single('productImage'), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Update a product information by _id'
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
router.delete('/:id', user_verify, requireRole("admin"), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Delete a product by _id'
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
