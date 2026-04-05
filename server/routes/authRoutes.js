// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { ResultAsync, ok, err, errAsync, okAsync } from 'neverthrow'
import { user_verify, requireRole } from '../helpers/auth.js';
import { User } from '../models/models.js';

const router = express.Router();
const client = new OAuth2Client(process.env.VITE_CLIENT_ID);

// free endpoint
router.get("/free-endpoint", (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Sample of Free for All Endpoint'

    res.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.post("/me", user_verify, requireRole("regular"), (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Return your information inside bearer token.'

    res.json(req.user);
});

// ==========================================
// REGISTER ENDPOINT
// ==========================================
router.post("/register", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to register a new user.'
    const { token, email, password } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_CLIENT_ID,
    });

    // 2. Extract the safe, verified user payload
    const payload = ticket.getPayload();

    const {
        iss,
        email: googleEmail,
        email_verified,
        name,
        picture,
    } = payload;

    console.log(payload)

    if (iss !== "https://accounts.google.com" && typeof email !== "string") {
        return res.status(400).send({ message: "Invalid email" });
    }

    if (iss === "https://accounts.google.com" && !email_verified) {
        return res.status(400).send({ message: "Please verify your google account" });
    }
    if (iss !== "https://accounts.google.com" && (!email || !password)) {
        return res.status(400).send({ message: "Email and password are required" });
    }

    const prepareUser = () => {
        if (iss === "https://accounts.google.com") {
            return okAsync(new User({
                email: googleEmail,
                role: "regular",
                profile_picture: picture,
                username: name
            }));
        }

        return ResultAsync.fromPromise(
            bcrypt.hash(password, 10),
            (error) => ({ status: 500, message: "Failed to secure password", error })
        ).map((hashedPassword) => new User({
            email,
            password: hashedPassword,
            role: "regular",
            username: name
        }));
    };

    await prepareUser()
        .andThen((user) =>
            ResultAsync.fromPromise(
                user.save(),
                (error) => {
                    // Catch MongoDB duplicate email error cleanly
                    if (error.code === 11000 || error.cause?.code === 11000) return { status: 409, message: "Email is already used" };
                    return { status: 500, message: "Error creating user", error: error.message };
                }
            )
        ).map((user) => {
            const payload = {
                user_id: user._id,
                user_email: user.email,
                user_role: user.role,
                username: user.username,
            };

            if (iss === "https://accounts.google.com") {
                payload.user_picture = user.profile_picture;
            }

            // BUG FIX: Replaced `const token` with standard return
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

            return {
                message: "Login Successful",
                token
            };
        })
        .match(
            (successData) => res.status(201).send({ message: "User Created Successfully", result: successData }),
            (errorData) => res.status(errorData.status).send({ message: errorData.message, error: errorData.error })
        );
});


// ==========================================
// LOGIN ENDPOINT
// ==========================================
router.post("/login", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to login as a user.'
    const { token, email, password } = req.body;

    const ticket = token ? await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_CLIENT_ID,
    }) : null;

    const payload = ticket ? ticket.getPayload() : null;

    if (typeof email !== "string" && !token) {
        return res.status(400).send({ message: "Invalid email" });
    }

    await ResultAsync
        .fromPromise(token ? User.findOne({ email: { $eq: payload.email } }) : User.findOne({ email: { $eq: email } }).exec(),
            () => ({ status: 500, message: "Database connection failed" })
        )
        .andThen((user) =>
            user ? okAsync(user) : errAsync({ status: 404, message: "User not found" })
        )
        .andThen((user) => {
            if (payload?.iss === "https://accounts.google.com") {
                return okAsync(user);
            }

            return ResultAsync.fromPromise(
                bcrypt.compare(password, user.password),
                () => ({ status: 500, message: "Encryption validation failed" })
            ).andThen((isMatch) =>
                isMatch ? ok(user) : err({ status: 400, message: "Passwords do not match" })
            );
        }).map((user) => {
            const payload = {
                user_id: user._id,
                user_email: user.email,
                user_role: user.role,
                username: user.username,
            };

            if (payload?.iss === "https://accounts.google.com") {
                payload.user_picture = user.profile_picture;
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

            return {
                message: "Login Successful",
                token
            };
        })
        .match(
            (successData) => res.status(200).send(successData),
            (errorData) => res.status(errorData.status).send({ message: errorData.message })
        );
});

export default router;
