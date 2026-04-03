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


router.post('/', user_verify, requireRole("moderator"), upload.single('imageUrl'), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Endpoint for posting new products (Single upload with image, or Bulk JSON array)'

    // ==========================================
    // 1. BULK IMPORT HANDLER
    // ==========================================
    if (req.query.bulk === 'true') {
        const productsArray = req.body;

        if (!Array.isArray(productsArray)) {
            return res.status(400).json({ message: "Bulk import payload must be an array." });
        }

        await ResultAsync.fromPromise(
            (async () => {
                const startingIdString = await generateProductId();

                // 2. Split it into the prefix ("2026") and the number (32)
                const [prefix, sequenceStr] = startingIdString.split('-');
                const startingSequence = parseInt(sequenceStr, 10);

                // 3. Determine the padding length (e.g., "0032" is 4 characters)
                const paddingLength = sequenceStr.length;

                const productsToInsert = productsArray.map((item, index) => {
                    const currentSeq = startingSequence + index;

                    // Rebuild the string with the correct zero-padding (e.g., "2026-0033")
                    const newId = `${prefix}-${String(currentSeq).padStart(paddingLength, '0')}`;

                    return {
                        product_id: newId,
                        product_name: item.product_name,
                        imageUrl: item.imageUrl || null,
                        category: item.category,
                    };
                });

                console.log(JSON.stringify(productsToInsert))

                // insertMany is highly optimized in Mongoose for saving large arrays at once
                return Product.insertMany(productsToInsert);
            })(),
            (error) => new Error(`Bulk database insert failed: ${error.message}`)
        )
            .match(
                (savedProducts) => {
                    // SUCCESS ARM
                    return res.status(201).json({
                        message: `Successfully bulk imported ${savedProducts.length} products!`,
                        products: savedProducts,
                    });
                },
                (error) => {
                    // ERROR ARM
                    console.error('Error processing bulk import:', error);
                    return res.status(500).json({
                        message: 'Failed to process bulk import.',
                        error: error.message
                    });
                }
            );

        return;
    }

    // ==========================================
    // 2. STANDARD SINGLE PRODUCT HANDLER
    // ==========================================
    const { product_name, category: rawCategory } = req.body;
    const category = rawCategory ? JSON.parse(rawCategory) : null;
    const imageFile = req.file;

    const handleUpload = (file, idToUse) => {
        if (!file) return okAsync(null);

        return ResultAsync.fromPromise(
            streamUpload(file.buffer, idToUse),
            (error) => new Error(`Cloudinary upload failed: ${error.message}`)
        );
    };

    await ResultAsync.fromPromise(
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
        })
        .andThen((newProduct) => {
            // Save the product to MongoDB (works for both updated and new instances)
            return ResultAsync.fromPromise(
                newProduct.save(),
                (error) => new Error(`Failed to save product: ${error.message}`)
            );
        })
        .match(
            (savedProduct) => {
                // SUCCESS ARM
                return res.status(201).json({
                    message: `Product added successfully!`,
                    product: savedProduct,
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error processing product:', error);
                return res.status(500).json({
                    message: 'Failed to process product.',
                    error: error.message
                });
            }
        );
});

router.put('/:id', user_verify, requireRole("moderator"), upload.single('productImage'), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Update a product information by MongoDB _id'
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const { product_id, product_name, category: rawCategory } = req.body;
    const category = rawCategory ? JSON.parse(rawCategory) : null;
    const imageFile = req.file;

    const handleUpload = (file, idToUse) => {
        if (!file) return okAsync(null);
        return ResultAsync.fromPromise(
            streamUpload(file.buffer, idToUse),
            (error) => new Error(`Cloudinary upload failed: ${error.message}`)
        );
    };

    await ResultAsync.fromPromise(
        Product.findById(id),
        (error) => new Error(`Database find error: ${error.message}`)
    )
        .andThen((product) => {
            // Explicitly handle the 404 case
            if (!product) return errAsync(new Error("Product not found."));

            // If an image was provided, upload it using the existing product_id for the naming convention
            return handleUpload(imageFile, product.product_id).map((uploadResult) => {
                if (uploadResult) {
                    product.imageUrl = uploadResult.secure_url;
                }

                // Update fields if they were provided in the request
                if (product_id) product.product_id = product_id;
                if (product_name) product.product_name = product_name;
                if (category) product.category = category;

                // product.date_updated = new Date().toISOString().split('T')[0];

                return product;
            });
        })
        .andThen((readyProduct) => {
            // Save the updated product to MongoDB
            return ResultAsync.fromPromise(
                readyProduct.save(),
                (error) => new Error(`Failed to save updated product: ${error.message}`)
            );
        })
        .match(
            (savedProduct) => {
                // Return 200 OK for updates instead of 201 Created
                return res.status(200).json({
                    message: 'Product updated successfully!',
                    product: savedProduct,
                });
            },
            (error) => {
                console.error('Error updating product:', error);

                if (error.message === "Product not found.") {
                    return res.status(404).json({ message: error.message });
                }

                return res.status(500).json({
                    message: 'Failed to update product.',
                    error: error.message
                });
            }
        );
});

//! [ ] CHECK IF THIS WORKS
// DELETE endpoint to delete a product by _id
router.delete('/:id', user_verify, requireRole("admin"), async (req, res) => {
    // #swagger.tags = ['v1 | Product']
    // #swagger.description = 'Delete a product by MongoDB _id'
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    await ResultAsync.fromPromise(
        Product.findById(id),
        (error) => new Error(`Database find error: ${error.message}`)
    )
        .andThen((product) => {
            if (!product) return errAsync(new Error("Product not found."));

            // Clean up Cloudinary in the background if an image exists
            if (product.imageUrl) {
                // We know exactly what the public ID is based on our POST/PUT routes!
                const exactPublicId = `iligancitystores_products/${product.product_id}`;

                console.log(`Attempting to delete Cloudinary image: ${exactPublicId}`);

                // Fire and forget: We don't await this in the main chain so a Cloudinary 
                // failure doesn't prevent the MongoDB document from being deleted.
                cloudinary.uploader.destroy(exactPublicId).catch(err => {
                    console.error('Non-fatal error cleaning up Cloudinary:', err);
                });
            }

            // Proceed to delete the product from MongoDB
            return ResultAsync.fromPromise(
                Product.findByIdAndDelete(id),
                (error) => new Error(`Database delete error: ${error.message}`)
            );
        })
        .match(
            (deletedProduct) => {
                // SUCCESS ARM
                return res.status(200).json({
                    message: 'Product deleted successfully!',
                    product: deletedProduct
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error deleting product:', error);

                if (error.message === "Product not found.") {
                    return res.status(404).json({ message: error.message });
                }

                return res.status(500).json({
                    message: 'Failed to delete product.',
                    error: error.message
                });
            }
        );
});

export default router;
