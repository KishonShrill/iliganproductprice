import { config } from 'dotenv';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger-output.json' with { type: 'json' }
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import { requireRole } from './helpers/auth.js';

config();

const PORT = process.env.PORT || 5000; // Choose your desired port
const DEVELOPMENT = process.env.VITE_LOCALHOST || "localhost";
const uri = process.env.HIDDEN_URI;

// Initialize Database Connection
mongoose.connect(uri)
    .then(() => { console.log('✅ Connected to MongoDB'); })
    .catch(err => { console.error('❌ MongoDB connection error:', err.message); });

// CORS Configuration
const allowedOrigins = process.env.VITE_DEVELOPMENT
    ? [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://192.168.1.10:5173',
        `http://${DEVELOPMENT}:5173`,
        'http://localhost:5000',
        'https://productprice-iligan.vercel.app',
    ]
    : 'https://productprice-iligan.vercel.app';

const corsOptions = {
    origin: function(origin, callback) {
        console.log("Origin Requests: " + origin);
        console.log("Non-browser: " + !origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (process.env.VITE_DEVELOPMENT) {
            // ✅ Development: allow localhost, LAN IPs, curl, mobile apps
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)
            ) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS (Dev)"));
            }
        } else {
            // ✅ Production: strict allowedOrigins only
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS (Prod)"));
            }
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
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});

app.use(['/auth/register', '/auth/login', '/api'], limiter);
app.use('/api-docs', limiter, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Standardized Route Prefixes
app.use('/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/listings', listingRoutes);

// Root Endpoints
app.get('/', (req, res) => { res.status(200).json({ message: 'Server is healthy...', healthy: true }); });
app.use((req, res) => { res.status(404).json({ message: 'Endpoint not found' }); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
