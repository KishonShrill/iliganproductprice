// routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
import cloudinary from '../cloudinary.js'; // adjust if separate
import getPaginationParams from '../helpers/getPaginationParams.js'; // adjust if separate

import { Listing } from '../models/models.js'; // adjust path

const router = express.Router();


//! [*] CHECK IF THIS WORKS
// Display to Groceries and to Dev Mode
router.get('/api/listings', async (req, res) => {
    try {
        const products = await Listing.find(
            {},
            {
                "category.catalog": 0,
                "location.id": 0,
            }
        ).sort({product_id: -1});

        res.json(products);
        //TODO: See if we need pagination on this... probably...

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//! [ ] CHECK IF THIS WORKS
// Get endpoint to fetch a single product by _id
router.get('/api/listing/:id', async (req, res) => {
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
router.get('/api/listings/category/:categoryId', async (req, res) => {
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

export default router;
