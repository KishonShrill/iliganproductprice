import { config } from 'dotenv';
import mongoose from 'mongoose';


config();

// MongoDB Atlas URI
const uri = process.env.HIDDEN_URI;

mongoose.connect(uri)
    .then(() => { console.log('✅ Connected to MongoDB'); })
    .catch(err => { console.error('❌ MongoDB connection error:', err.message); });


// User Schema
const authenticationSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "This username is taken..."],
    },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password: { type: String },
    role: {
        type: String,
        enum: ["admin", "moderator", "regular"],
    },
    profile_picture: { type: String },
    daily_votes: { type: Number, default: 0 },
    daily_submissions: { type: Number, default: 0 },
    last_vote_date: { type: Date, default: null },
    last_submission_date: { type: Date, default: null },
    stats: {
        points: { type: Number, default: 0 },
        approved: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
    }
});

// Product Schema
const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true, required: true },
    product_name: { type: String, required: true },
    imageUrl: { type: String },
    category: {
        list: { type: String, required: true },
        name: { type: String },
        catalog: { type: String },
    }
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
    date_updated: { type: Number, required: true },
    shelf: { type: String, required: true },
});

// Category Schema
const categorySchema = new mongoose.Schema({
    category_list: { type: String, required: true },
    category_name: { type: String, required: true },
    category_catalog: { type: String, required: true },
});

// Pending Listing Schema
const pendingListingSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Instead of just a number, we track the actual voters!
    voters: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['up', 'down'] },
    }],

    upvoteCount: { type: Number, default: 0 },
    downvoteCount: { type: Number, default: 0 },

    status: { type: String, default: 'pending' }
}, { timestamps: true });

const User = mongoose.model('Authentication', authenticationSchema, 'users');
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');
const Listing = mongoose.model('Listing', listingSchema, 'listings');
const PendingListing = mongoose.model('PendingListing', pendingListingSchema, 'pendingListings');
const Category = mongoose.model('Category', categorySchema, 'category');

// Export the models
export {
    User,
    Product,
    Location,
    Listing, PendingListing,
    Category
};
