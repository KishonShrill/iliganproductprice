// routes/productRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import cloudinary from '../cloudinary.js'; // adjust if separate
import getPaginationParams from '../helpers/getPaginationParams.js'; // adjust if separate
import generateProductId from '../helpers/generateProductId.js';
import { upload, streamUpload } from '../helpers/upload.js';
import { user_verify, requireRole } from '../helpers/auth.js';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';

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
router.post('/', user_verify, requireRole("moderator"), upload.single('imageUrl'), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Endpoint for uploading images to cloudinary'
    const { product_id, product_name, category: rawCategory, formType } = req.body;
    const category = rawCategory ? JSON.parse(rawCategory) : null;
    const imageFile = req.file;

    // Safely handles the Cloudinary upload. If no file, returns a successful empty result.
    const handleUpload = (file, idToUse) => {
        if (!file) return okAsync(null);

        return ResultAsync.fromPromise(
            streamUpload(file.buffer, idToUse),
            (error) => new Error(`Cloudinary upload failed: ${error.message}`)
        );
    };

    // Chain for EDITING a product
    const editProductFlow = () => {
        return ResultAsync.fromPromise(
            Product.findOne({ product_id: product_id }),
            (error) => new Error(`Database find error: ${error.message}`)
        )
            .andThen((product) => {
                // Explicitly handle the 404 case as an Error Result
                if (!product) return errAsync(new Error("Product not found."));

                // Handle the upload, then map the new values onto the existing product
                return handleUpload(imageFile, product_id).map((uploadResult) => {
                    if (uploadResult) {
                        product.imageUrl = uploadResult.secure_url;
                    }

                    // Update fields (using your original fallback logic)
                    product.product_id = product_id || product.product_id;
                    product.product_name = product_name || product_name || product.product_name;
                    product.category = category || product.category;
                    // product.date_updated = new Date().toISOString().split('T')[0];

                    return product;
                });
            });
    };

    // Chain for ADDING a product
    const addProductFlow = () => {
        return ResultAsync.fromPromise(
            generateProductId(),
            (error) => new Error(`Failed to generate product ID: ${error.message}`)
        )
            .andThen((newProductId) => {
                return handleUpload(imageFile, newProductId).map((uploadResult) => {
                    return new Product({
                        product_id: newProductId,
                        product_name: product_name,
                        imageUrl: uploadResult ? uploadResult.secure_url : null,
                        category: category,
                        // date_updated: new Date().toISOString().split('T')[0],
                    });
                });
            });
    };


    console.log("Type: ", formType)
    const processAction = formType === "edit" ? editProductFlow() : addProductFlow();
    await processAction
        .andThen((readyProduct) => {
            // Save the product to MongoDB (works for both updated and new instances)
            return ResultAsync.fromPromise(
                readyProduct.save(),
                (error) => new Error(`Failed to save product: ${error.message}`)
            );
        })
        .match(
            (savedProduct) => {
                // SUCCESS ARM
                return res.status(201).json({
                    message: `Product ${formType === 'edit' ? 'updated' : 'added'} successfully!`,
                    product: savedProduct,
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error processing product:', error);

                // Catch our specific 404 error
                if (error.message === "Product not found.") {
                    return res.status(404).json({ message: error.message });
                }

                // Catch all other 500 errors
                return res.status(500).json({
                    message: 'Failed to process product.',
                    error: error.message
                });
            }
        );
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
