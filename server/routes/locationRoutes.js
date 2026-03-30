// routes/locationRoutes.js
import express from 'express';
import mongoose from 'mongoose';

import { Listing, Location } from '../models/models.js'; // adjust path

const router = express.Router();


//! [*] CHECK IF THIS WORKS
router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Location']
    // #swagger.description = 'Fetch all locations.'

    try {
        const locations = await Location.find()

        res.json(locations)

    } catch (error) {
        console.error(`Error fetching locations:`, error);
        res.status(500).json({ message: 'Failed to fetch locations.', error: error.message });
    }
});

//! [*] CHECK IF THIS WORKS
router.get('/:locationId', async (req, res) => {
    // #swagger.tags = ['v1 | Location']
    // #swagger.description = 'Fetch products from this location.'

    const locationId = req.params.locationId;
    const locationObjectId = new mongoose.Types.ObjectId(locationId);

    try {
        const products = await Listing.aggregate([
            {
                $match: {
                    "location.id": locationObjectId
                }
            },
            {
                $project: {
                    "product.product_id": true,
                    "product.product_name": true,
                    "updated_price": true,
                    "date_updated": true,
                    "product.imageUrl": true,
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
