// routes/productRoutes.js
import { user_verify, requireRole } from '../helpers/auth.js';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import express from 'express';
import mongoose from 'mongoose';
import getPaginationParams from '../helpers/getPaginationParams.js';

import { Listing, PriceLog } from '../models/models.js'; // adjust path

const router = express.Router();


router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Fetch all listing products.'
    try {
        const limitStr = req.query.limit;
        const limit = limitStr ? parseInt(limitStr, 10) : 0;

        let query = Listing.find(
            {},
            {
                "location.id": 0,
            }
        ).sort({ "prouct.product_id": -1, date_updated: -1 });

        if (limit > 0) {
            query = query.limit(limit);
        }

        const products = await query;

        res.json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.post('/', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Create a new product listing.'

    const listingPayload = req.body;

    const existingListing = await Listing.findOne({
        "product.product_id": listingPayload.product.product_id,
        "location.id": listingPayload.location.id
    }).sort({ "product.product_id": -1, "location.id": -1 });

    if (existingListing) {
        return res.status(409).json({
            message: `This product is already listed at ${listingPayload.location.name}. Please edit the existing listing instead.`
        });
    }

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

router.post('/bulk', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Bulk create new product listings.'

    const listingsArray = req.body;

    const incomingProductIds = listingsArray.map(item => item.product.product_id);
    const targetLocationId = listingsArray[0].location.id;

    // 3. Find if any of these products ALREADY exist at this location
    const existingListings = await Listing.find({
        "location.id": targetLocationId,
        "product.product_id": { $in: incomingProductIds }
    }).sort({ "product.product_id": -1, "location.id": -1 });

    if (existingListings.length > 0) {
        const duplicateNames = existingListings.map(l => l.product.product_name).join(', ');
        return res.status(409).json({
            message: `Cannot process bulk upload. The following products are already listed at this location: ${duplicateNames}`
        });
    }

    // 1. Validate that we actually received an array
    if (!Array.isArray(listingsArray) || listingsArray.length === 0) {
        return res.status(400).json({ message: 'Payload must be a non-empty array of listings.' });
    }

    // 2. Use Mongoose's insertMany for bulk operations
    await ResultAsync.fromPromise(
        Listing.insertMany(listingsArray),
        (error) => new Error(`Failed to save bulk listings: ${error.message}`)
    )
        .match(
            (savedListings) => {
                return res.status(201).json({
                    message: `Successfully created ${savedListings.length} listings!`,
                    count: savedListings.length
                });
            },
            (error) => {
                console.error('Error creating bulk listings:', error);
                return res.status(500).json({
                    message: 'Failed to create bulk listings.',
                    error: error.message
                });
            }
        );
});

router.put('/:id', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Update a listing by MongoDB _id and log price changes'

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    const updatePayload = req.body;

    try {
        // 1. Fetch the EXISTING listing BEFORE updating
        const existingListing = await Listing.findById(id);

        if (!existingListing) {
            return res.status(404).json({ message: "Listing not found." });
        }

        // 2. Compare prices. We only want to log it if the price ACTUALLY changed.
        // (This prevents logging if the admin just fixed a typo in the category)
        if (updatePayload.updated_price && existingListing.updated_price !== updatePayload.updated_price) {

            // 3. Save the OLD price and OLD date to the PriceLog
            await PriceLog.create({
                listing_id: existingListing._id,
                old_price: existingListing.updated_price,
                // Fallback to current date if the old listing somehow lacked a date
                date_recorded: existingListing.date_updated || new Date()
            });
        }

        // 4. Now perform your original update logic using ResultAsync
        await ResultAsync.fromPromise(
            Listing.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true }),
            (error) => new Error(`Database update error: ${error.message}`)
        )
            .match(
                (savedListing) => {
                    return res.status(200).json({
                        message: 'Listing updated successfully!',
                        listing: savedListing,
                    });
                },
                (error) => {
                    console.error('Error updating listing:', error);
                    return res.status(500).json({
                        message: 'Failed to update listing.',
                        error: error.message
                    });
                }
            );

    } catch (error) {
        console.error('Server error during update process:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred.',
            error: error.message
        });
    }
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
