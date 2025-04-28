import { config } from 'dotenv';
import auth from './auth.js'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'; // Added for Cloudinary integration
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import multer from 'multer';
import rateLimit from 'express-rate-limit';


config();

const PORT = process.env.PORT || 5000; // Choose your desired port

// Configure Cloudinary (Replace with your credentials)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for handling file uploads (in-memory storage is simple for relaying to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB Atlas URL
const uri = `mongodb+srv://${process.env.HIDDEN_USERNAME}:${process.env.HIDDEN_PASSWORD}@chirscentportfolio.qj3tx5b.mongodb.net/IliganCityStores?retryWrites=true&w=majority`;
mongoose.connect(uri)
    .then(() => { console.log('Connected to MongoDB'); })
    .catch(err => { console.error('Error connecting to MongoDB:', err.message); });

// Define the product schema
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

const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true, required: true },
    product_name: { type: String, required: true },
    category_id: { type: String, required: true },
    updated_price: { type: Number, required: true },
    date_updated: String, //? Might come in handy someday { type: Date, default: Date.now }
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations' // Assuming 'Location' is the model name for the referenced collection
    },
    imageUrl: { type: String }
});

const locationSchema = new mongoose.Schema({
    location_name: String,
    location_address: String,
});

const User = mongoose.model('Authentication', authenticationSchema, 'users');
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.10:5173',
    'http://localhost:4173',
    'https://productprice-iligan.vercel.app',
    'https://productprice-iligan-git-main-kishonshrills-projects.vercel.app',
    'https://productprice-iligan-9zwdr32ax-kishonshrills-projects.vercel.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log("Origin Requests: " + origin);

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
app.use(express.json()); // Middleware to parse incoming JSON requests
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
    max: 100, // limit each IP to 100 requrest per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use([
    '/register',
    '/login',
    '/api',

], limiter);


/**
 * Structure locations for POST, GET, PUT, and DELETE
 * Authentication Endpoints
 */
// Resgister user to endpoint
app.post("/register", async (req, res) => {
    // Check if the required properties are present in the req body
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
        });

        const result = await user.save();
        res.status(201).send({
            message: "User Created Successfully",
            result,
        });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).send({
                message: "Email already exists",
                error: error.message,
            });
        }
        res.status(500).send({
            message: "Error creating user",
            error: error.message,
        });
    }
});

// Login user to endpoint
app.post("/login", async (req, res) => {
    try {
        // check if email exists
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({
                message: "Email not found",
            });
        }

        // compare the password entered and the hashed password found
        const passwordCheck = await bcrypt.compare(req.body.password, user.password);

        if (!passwordCheck) {
            return res.status(400).send({
                message: "Passwords does not match",
            });
        }

        //   create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                userEmail: user.email,
            },
            process.env.JWT_SECRET || "RANDOM-TOKEN", // Use env variable for secret
            { expiresIn: "24h" }
        );

        //   return success res
        res.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
        });

    } catch (error) {
        res.status(500).send({
            message: "Error during login",
            error: error.message,
        });
    }
});

// free endpoint
app.get("/free-endpoint", (req, res) => {
    res.json({ message: "You are free to access me anytime" });
});
// authentication endpoint
app.get("/auth-endpoint", auth, (req, res) => {
    res.json({ message: "You are authorized to access me" });
});


/* --- Product CRUD Endpoints --- */

//! [ ] CHECK IF THIS WORKS
// Helper function to generate product_id (Year-Sequential Number)
// TODO: Test this first before using it to the database
async function generateProductId() {
    const currentYear = new Date().getFullYear().toString();
    // Find the latest product from the current year
    const lastProduct = await Product.findOne({
        product_id: new RegExp(`^${currentYear}-\\d{4}$`) // Regex to match the pattern
    }).sort({ product_id: -1 }); // Sort descending to get the latest

    let nextItemNumber = 1;
    if (lastProduct) {
        const lastProductId = lastProduct.product_id;
        const lastItemNumber = praseInt(lastProductId.split('-')[1], 10);
        nextItemNumber = lastItemNumber + 1;
    }

    // Format the item number with leading zeros (e.g., 0001, 0010, 0100)
    const formattedItemNumber = nextItemNumber.toString().padStart(4, '0');

    console.log(`Generated Item Number: ${currentYear}-${formattedItemNumber}`);
    return `${currentYear}-${formattedItemNumber}`;
}


//! [ ] CHECK IF THIS WORKS
// POST endpoint to create a new product
// Using upload.single('productImage') middleware to handle the file upload
// TODO: Let's disable this first and check if every steps works or not...
app.post('/api/products', upload.single('productImage'), async (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'Product image is required.' });
    }

    // Upload image to Cloudinary
    try {
        const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
            resource_type: "image",
            folder: "iligancitystores_products" // Specified folder where pictures will be stored
        });

        const newProductId = await generateProductId();

        const newProduct = new Product({
            product_id: newProductId,
            product_name: req.body.productName, // Match frontend field names
            category_id: req.body.categoryId,
            updated_price: req.body.updatedPrice,
            // date_updated will be set by default in schema
            location_id: req.body.locationId,
            imageUrl: result.secure_url // Store the secure URL from Cloudinary
        });

        // Save the product to MongoDB
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: 'Product added successfully!',
            product: savedProduct
        });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            message: 'Failed to add product.',
            error: error.message
        });
    }
});


//! [ ] CHECK IF THIS WORKS
// GET endpoint to fetch all products (consider adding pagination here too, or replace with search)
// This is similar to your existing /api/database but using the Product model name directly
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
        
        //TODO: See if we need pagination on this...

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Get endpoint to fetch a single product by _id
app.get('/api/products/:id', async (req, res) => {
    const id = req.params.id; // This is the MongoDB _id

    // Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        const product = await Product.findById(id); // Use findById for fetching by _id
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
// PUT endpoint to update a product by _id
// Requires upload.single('productImage') if image update is allowed
app.put('/api/products/:id', upload.single('productImage'), async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        const updateData = { ...req.body }; // Copy request body data

        // Handle image update if a new file is provided
        if (req.file) {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
                resource_type: "image",
                folder: "iligancitystores_products"
            });
            updateData.imageUrl = result.secure_url; // Add new image URL to update data

            // Optional: Delete the old image from Cloudinary
            // You would need to fetch the product first to get the old imageUrl
            // and then use cloudinary.uploader.destroy()
        }

        // Update the date_updated if price is being updated or always on update
        if (updateData.updatedPrice !== undefined) {
            updateData.date_updated = new Date(); // Update date if price is provided
        } else {
            // Decide if date_updated should always update or only with price
            // For now, let's update it whenever *any* field is updated
            updateData.date_updated = new Date();
        }


        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully!',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        // Handle Mongoose validation errors specifically if needed
        res.status(500).json({ message: 'Failed to update product.', error: error.message });
    }
});

//! [ ] CHECK IF THIS WORKS
// DELETE endpoint to delete a product by _id
app.delete('/api/products/:id', async (req, res) => {
    const id = req.params.id;

     if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }

    try {
        // Optional: Find the product first to get the image URL for Cloudinary deletion
        const productToDelete = await Product.findById(id);
        if (!productToDelete) {
             return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the product from MongoDB
        const deletedProduct = await Product.findByIdAndDelete(id);

         // Optional: Delete the image from Cloudinary using the productToDelete's imageUrl
         if (productToDelete.imageUrl) {
            try {
                 // Extract public ID from Cloudinary URL (logic depends on your upload settings)
                 // Example: https://res.cloudinary.com/your_cloud_name/image/upload/v.../folder/public_id.jpg
                 const urlParts = productToDelete.imageUrl.split('/');
                 const publicIdWithExtension = urlParts[urlParts.length - 1];
                 const publicId = publicIdWithExtension.split('.')[0];
                 const folder = urlParts[urlParts.length - 2]; // Assuming the folder is the second to last part

                 // If you used a specific folder in upload
                 const publicIdWithFolder = folder && folder !== 'upload' ? `${folder}/${publicId}` : publicId;


                 console.log(`Attempting to delete Cloudinary image with Public ID: ${publicIdWithFolder}`);
                 await cloudinary.uploader.destroy(publicIdWithFolder);
                 console.log('Cloudinary image deleted successfully.');

             } catch (cloudinaryError) {
                console.error('Error deleting Cloudinary image:', cloudinaryError);
                // Continue with product deletion even if image deletion fails
             }
         }


        res.json({
            message: 'Product deleted successfully!',
            product: deletedProduct
        });

    } catch (error) {
         console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }
});


/* --- New Fetching/Filtering Endpoints with Pagination --- */

// Helper function to get pagination parameters
function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
    const skip = (page - 1) * limit;
    // Ensure limit is positive
    const effectiveLimit = Math.max(1, limit);
    const effectiveSkip = Math.max(0, skip);

    return { page, limit: effectiveLimit, skip: effectiveSkip };
}


//! [ ] CHECK IF THIS WORKS
// 1. Fetch items that match the query with pagination
// GET /api/products/search?query=search_term&page=1&limit=20
app.get('/api/products/search', async (req, res) => {
    const searchTerm = req.query.query;
    const { page, limit, skip } = getPaginationParams(req);

    if (!searchTerm) {
        // If no search term, return an empty list or perhaps recent items (optional)
        // For now, return an empty list
        return res.status(200).json({
            message: 'Please provide a search query.',
            products: [],
            totalProducts: 0,
            totalPages: 0,
            currentPage: page
        });
    }

    try {
        // Create a case-insensitive regex for searching product name
        const queryRegex = new RegExp(searchTerm, 'i');

        // Build the search query filter
        const filter = { product_name: queryRegex };

        // Get total count of matching products (for pagination info)
        const totalProducts = await Product.countDocuments(filter);

        // Get the paginated products
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            message: 'Products fetched successfully',
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error('Error fetching products by search term:', error);
        res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
    }
});

//! [ ] CHECK IF THIS WORKS
// 2. Fetch items according to category with pagination
// GET /api/products/category/:categoryId?page=1&limit=20
app.get('/api/products/category/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;
    const { page, limit, skip } = getPaginationParams(req);

    try {
        // Build the filter by category_id
        const filter = { category_id: categoryId };

        // Get total count of products in this category
        const totalProducts = await Product.countDocuments(filter);

        // Get the paginated products in this category
        const products = await Product.find(filter)
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

//! [ ] CHECK IF THIS WORKS
// 3. Fetch items according to location with pagination
// GET /api/products/location/:locationId?page=1&limit=20
app.get('/api/products/location/:locationId', async (req, res) => {
    const locationId = req.params.locationId;
    const { page, limit, skip } = getPaginationParams(req);

    // Optional: If location_id in schema was ObjectId and frontend sends ObjectIds, validate here:
    // if (!mongoose.Types.ObjectId.isValid(locationId)) {
    //     return res.status(400).json({ message: 'Invalid location ID format' });
    // }


    try {
        // Build the filter by location_id
        const filter = { location_id: locationId };

        // Get total count of products in this location
        const totalProducts = await Product.countDocuments(filter);

        // Get the paginated products in this location
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            message: `Products for location ${locationId} fetched successfully`,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error(`Error fetching products for location ${locationId}:`, error);
        res.status(500).json({ message: 'Failed to fetch products by location.', error: error.message });
    }
});



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


//! ONLY DELETE THIS AFTER CHECKING IF THE NEW ENDPOINTS WORKS
// Fetsh all data from Product
app.get('/api/database', async (req, res) => {
    try {
        const database = await Product.find();
        res.json(database);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Fetsh data by id
app.get('/api/database/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const database = await Product.findOne({ id }); // Note that .findOne({ id }) and .findOne(id) is different
        if (!database) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(database);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
