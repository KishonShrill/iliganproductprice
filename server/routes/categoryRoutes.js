// routes/locationRoutes.js
import express from 'express';
import mongoose from 'mongoose';

import { Category } from '../models/models.js'; // adjust path

const router = express.Router();


//! [*] CHECK IF THIS WORKS
router.get('/api/v1/category', async (req, res) => {
    try {
        const categories = await Category.find().sort({category_list: -1})

        res.json(categories)

    } catch (error) {
        console.error(`Error fetching categories:`, error);
        res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
    }
});

export default router;
