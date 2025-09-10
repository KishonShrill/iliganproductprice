import { config } from 'dotenv';
import mongoose from 'mongoose';


config();

// MongoDB Atlas URI
const uri = process.env.HIDDEN_URI;

mongoose.connect(uri)
    .then(() => { console.log('✅ Connected to MongoDB'); })
    .catch(err => { console.error('❌ MongoDB connection error:', err.message);});


// User Schema
const authenticationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    }
});

// Product Schema
const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true, required: true },
    product_name: { type: String, required: true },
    category_id: { type: String, required: false },
    updated_price: { type: Number, required: true },
    date_updated: String, //? Might come in handy someday { type: Date, default: Date.now }
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations' // Assuming 'Location' is the model name for the referenced collection
    },
    imageUrl: { type: String }
});

// Location Schema
const locationSchema = new mongoose.Schema({
    location_name: String,
    address: {
        street: String,
        barangay: String,
        city: String,
        province: String,
        region: String,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    store_hours: {
        open: String,   // Format: "HH:mm"
        close: String,  // Format: "HH:mm"
    },
    is_open_24hrs: { 
        type: String,
        enum: ["active", "inactive"],
        default: "inactive" 
    },
    type: String
});

// Listing Schema
const listingSchema = new mongoose.Schema({
    product: {
        product_name: String,
        product_id: String,
        imageUrl: String,
    },
    location: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
    },
    category: {
        list: String,
        name: String,
        catalog: String,
    },
    updated_price: { type: Number, required: true },
    date_updated: String,
});

const User = mongoose.model('Authentication', authenticationSchema, 'users');
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');
const Listing = mongoose.model('Listing', listingSchema, 'listings');

// Export the models
export { User, Product, Location, Listing };
