// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ResultAsync, ok, err, errAsync, okAsync } from 'neverthrow'
import user_verify from '../helpers/auth.js';

import { User } from '../models/models.js'; // adjust this path if needed

const router = express.Router();

// free endpoint
router.get("/free-endpoint", (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Sample of Free for All Endpoint'

    res.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.get("/auth-endpoint", user_verify, (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Sample of Authorized Endpoint.'

    res.json({ message: "You are authorized to access me" });
});

// Resgister user to endpoint
router.post("/register", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to register a new user.'

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

router.post("/login", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to login as a user.'
    const { email, password } = req.body;

    await ResultAsync
        .fromPromise(User.findOne({ email: email }).exec(),
            () => ({ status: 500, message: "Database connection failed" })
        )
        .andThen((user) =>
            user ? okAsync(user) : errAsync({ status: 404, message: "User not found" })
        )
        .andThen((user) =>
            ResultAsync.fromPromise(
                bcrypt.compare(password, user.password),
                () => ({ status: 500, message: "Encryption validation failed" })
            ).andThen((isMatch) =>
                isMatch ? ok(user) : err({ status: 400, message: "Passwords do not match" })
            )
        ).map((user) => {
            const token = jwt.sign(
                { userId: user._id, userEmail: user.email },
                process.env.JWT_SECRET || "RANDOM-TOKEN",
                { expiresIn: "24h" }
            );
            console.log("what happened?")
            return { message: "Login Successful", email: user.email, token };
        })
        .match(
            (successData) => res.status(200).send(successData),
            (errorData) => res.status(errorData.status).send({ message: errorData.message })
        );
});

export default router;
