// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from '../helpers/auth.js';

import { User } from '../models/models.js'; // adjust this path if needed

const router = express.Router();

// Resgister user to endpoint
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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
router.get("/free-endpoint", (req, res) => {
    res.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.get("/auth-endpoint", auth, (req, res) => {
    res.json({ message: "You are authorized to access me" });
});

export default router;