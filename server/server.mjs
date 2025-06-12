import { config } from 'dotenv';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import locationRoutes from './routes/locationRoutes.js';


config();

const PORT = process.env.PORT || 5000; // Choose your desired port

// CORS Configuration
const allowedOrigins = process.env.VITE_DEVELOPMENT
    ? [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://192.168.1.10:5173',
        'https://productprice-iligan.vercel.app',
    ]
    : 'https://productprice-iligan.vercel.app';

const corsOptions = {
    origin: function (origin, callback) {
        console.log("Origin Requests: " + origin);
        console.log("Non-browser: " + !origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if the origin is in the allowed origins list
        if (allowedOrigins.includes(origin)) {
            // ✅ Origin is allowed
            callback(null, true);
        } else {
            // ❌ Origin not allowed
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true, // Allow cookies, authorization headers if needed
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
};

const app = express();
app.set('trust proxy', 1); // Trust the first proxy since we are hosting in vercel
app.use(express.json());
app.use(cors(corsOptions));


// Old Method
// /**app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "https://productprice-iligan.vercel.app");
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//     );
//     next();
// });*/

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use([
    '/register',
    '/login',
    '/api',

], limiter);


/**
 * The code below is old but will 
 * only be deleted if the code above works
 * 
 * Migration Checks:
 * [ ] Generation of Product ID
 * [ ] Upload image
 * [ ] Fetch all Products
 * [ ] Fetch product by _id
 * [ ] Update product by _id
 * [ ] Delete product by _id
 * [ ] Getting Pagination Parameters
 * [ ] Product search with pagination
 * [ ] Category search with pagination
 * [ ] Location search with pagination
 */

// User Routes
app.use(authRoutes);
app.use(productRoutes);
app.use(locationRoutes);

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});