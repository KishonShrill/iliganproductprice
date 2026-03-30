// routes/locationRoutes.js
import express from 'express';
import { Category } from '../models/models.js'; // adjust path

const router = express.Router();


//! [*] CHECK IF THIS WORKS
router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Category']
    // #swagger.description = 'Fetch all categories.'

    try {
        const categories = await v1 | Category.find()
        res.json(categories)

    } catch (error) {
        console.error(`Error fetching categories:`, error);
        res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
    }
});

export default router;
