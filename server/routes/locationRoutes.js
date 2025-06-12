// routes/locationRoutes.js
import express from 'express';
import mongoose from 'mongoose';

import { Product, Location } from '../models/models.js'; // adjust path

const router = express.Router();


//! [*] CHECK IF THIS WORKS
router.get('/api/locations', async (req, res) => {
    try {
        const locations = await Location.find().sort({location_name: -1})

        res.json(locations)

    } catch (error) {
        console.error(`Error fetching locations:`, error);
        res.status(500).json({ message: 'Failed to fetch locations.', error: error.message });
    }
});

//! [*] CHECK IF THIS WORKS
router.get('/api/location/:locationId', async (req, res) => {
    const locationId = req.params.locationId;
    const locationObjectId = new mongoose.Types.ObjectId(locationId);

    try {
        const products = await Product.aggregate([
            {
                $match: {
                    "location.id": locationObjectId
                }
            },
            { $sort: { "product_id": -1 } },
            {
                $project: {
                    "product_id": true,
                    "product_name": true,
                    "updated_price": true,
                    "date_updated": true,
                    "imageUrl": true,
                    "location.name": true,
                    "category.list": true,
                    "category.name": true,
                    "category.catalog": true,
                }
            },
        ]);

        res.json(products);

    } catch (error) {
        console.error(`Error fetching products for location ${locationId}:`, error);
        res.status(500).json({ message: 'Failed to fetch products by location.', error: error.message });
    }
});

export default router;