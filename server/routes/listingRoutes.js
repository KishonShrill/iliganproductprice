// routes/productRoutes.js
import { user_verify, requireRole } from '../helpers/auth.js';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import express from 'express';
import mongoose from 'mongoose';
import getPaginationParams from '../helpers/getPaginationParams.js';

import { Listing } from '../models/models.js'; // adjust path

const router = express.Router();


router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Fetch all listing products.'
    try {
        const products = await Listing.find(
            {},
            {
                "category.catalog": 0,
                "location.id": 0,
            }
        ).sort({ "prouct.product_id": -1, date_updated: -1 });

        res.json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.post('/', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Create a new product listing.'

    const listingPayload = req.body;

    await ResultAsync.fromPromise(
        new Listing(listingPayload).save(),
        (error) => new Error(`Failed to save listing: ${error.message}`)
    )
        .match(
            (savedListing) => {
                return res.status(201).json({
                    message: 'Listing created successfully!',
                    listing: savedListing,
                });
            },
            (error) => {
                console.error('Error creating listing:', error);
                return res.status(500).json({
                    message: 'Failed to create listing.',
                    error: error.message
                });
            }
        );
});

router.put('/:id', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Update a listing by MongoDB _id'

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    const updatePayload = req.body;

    await ResultAsync.fromPromise(
        // { new: true } ensures Mongoose returns the updated document, not the old one
        // { runValidators: true } ensures any Mongoose schema rules are still enforced
        Listing.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true }),
        (error) => new Error(`Database update error: ${error.message}`)
    )
        .andThen((updatedListing) => {
            // Explicitly handle the case where the ID is valid but the document doesn't exist
            if (!updatedListing) return errAsync(new Error("Listing not found."));
            return okAsync(updatedListing);
        })
        .match(
            (savedListing) => {
                return res.status(200).json({
                    message: 'Listing updated successfully!',
                    listing: savedListing,
                });
            },
            (error) => {
                console.error('Error updating listing:', error);

                // Catch our specific 404 error
                if (error.message === "Listing not found.") {
                    return res.status(404).json({ message: error.message });
                }

                // Catch all other 500 errors
                return res.status(500).json({
                    message: 'Failed to update listing.',
                    error: error.message
                });
            }
        );
});

//! [ ] CHECK IF THIS WORKS
// Get endpoint to fetch a single product by _id
router.get('/:id', async (req, res) => {
    const id = req.params.id; // This is the MongoDB _id

    // Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        const product = await Listing.findById(id); // Use findById for fetching by _id
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
    const categoryId = req.params.categoryId;
    const { page, limit, skip } = getPaginationParams(req);

    try {
        // Build the filter by category_id
        const filter = { category_id: categoryId };

        // Get total count of products in this category
        const totalProducts = await Listing.countDocuments(filter);
        // Get the paginated products in this category
        const products = await Listing.find(filter)
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

router.delete('/:id', user_verify, requireRole("admin"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Delete a listing by MongoDB _id'

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    await ResultAsync.fromPromise(
        Listing.findByIdAndDelete(id),
        (error) => new Error(`Database delete error: ${error.message}`)
    )
        .andThen((deletedListing) => {
            // Explicitly handle the case where the ID is valid but the document doesn't exist
            if (!deletedListing) return errAsync(new Error("Listing not found."));
            return okAsync(deletedListing);
        })
        .match(
            (deletedListing) => {
                // SUCCESS ARM
                return res.status(200).json({
                    message: 'Listing deleted successfully!',
                    listing: deletedListing
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error deleting listing:', error);

                if (error.message === "Listing not found.") {
                    return res.status(404).json({ message: error.message });
                }

                return res.status(500).json({
                    message: 'Failed to delete listing.',
                    error: error.message
                });
            }
        );
});

export default router;
