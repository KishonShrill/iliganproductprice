import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import auth from './auth.js'
config();

const app = express();
const PORT = process.env.PORT || 5000; // Choose your desired port

// Middleware to parse incoming JSON requests
app.use(express.json());

// MongoDB Atlas URL
const uri = `mongodb+srv://${process.env.HIDDEN_USERNAME}:${process.env.HIDDEN_PASSWORD}@${process.env.CLUSTER}.qj3tx5b.mongodb.net/${process.env.COLLECTION}?retryWrites=true&w=majority`;
mongoose.connect(uri)
  .then(() => {console.log('Connected to MongoDB');})
  .catch(err => {console.error('Error connecting to MongoDB:', err.message);});

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

const Database = mongoose.model('Authentication', authenticationSchema, 'users');
const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173'];
const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in the allowed origins list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
};
app.use(cors(corsOptions));
// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

/**
 * Structure locations for POST, GET, PUT, and DELETE
 * methods for MongoDB Atlas for use in Database application
 */
// Resgister user to endpoint
app.post("/register", async (req, res) => {
  // Check if the required properties are present in the req body
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send({ message: "Email and password are required" });
  }
  
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = Database({
        email: req.body.email,
        password: hashedPassword,
      });

      // save the new user
      user.save()
        .then((result) => {
          res.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});
// Login user to endpoint
app.post("/login", (req, res) => {
  // check if email exists
  Database.findOne({ email: req.body.email })
    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(req.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return res.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success res
          res.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          res.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      res.status(404).send({
        message: "Email not found",
        e,
      });
    });
});
// free endpoint
app.get("/free-endpoint", (req, res) => {
  res.json({ message: "You are free to access me anytime" });
});
// authentication endpoint
app.get("/auth-endpoint", auth, (req, res) => {
  res.json({ message: "You are authorized to access me" });
});
/* Above this is authentication code for the web app */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});