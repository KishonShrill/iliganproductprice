import { useState } from 'react';
import { Form, Button } from "react-bootstrap";
import PropTypes from 'prop-types';
import axios from 'axios';
import { ResultAsync } from 'neverthrow';

const LOCALHOST = import.meta.env.VITE_LOCALHOST || "localhost";

const RegisterForm = ({ debugMode }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation: Check if passwords match before hitting the API
        if (password !== confirmPassword) {
            setStatus("error");
            setErrorMessage("Passwords do not match.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        const url = debugMode
            ? `http://${LOCALHOST}:5000/auth/register`
            : "https://iliganproductprice-mauve.vercel.app/auth/register";

        await ResultAsync.fromPromise(
            axios.post(url, { email, password }),
            (error) => {
                // Your backend specifically returns a 409 for duplicate emails
                if (error.response?.status === 409) {
                    return "This email is already registered.";
                }
                return error.response?.data?.message || "Unable to connect to the server.";
            }
        )
            .map((response) => response.data)
            .match(
                (data) => {
                    setStatus("success");
                    // Clear the form fields on success
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");

                    // If using React Router, you could do: navigate("/login?registered=true")
                    // For now, we will just rely on the success message below.
                },
                (errorMsg) => {
                    setStatus("error");
                    setErrorMessage(errorMsg);
                }
            );
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2>CREATE ACCOUNT</h2>
            <p>Register as a new developer</p>

            <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    isInvalid={status === "error" && errorMessage !== "Passwords do not match."}
                    required
                />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    isInvalid={status === "error"}
                    required
                />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    isInvalid={status === "error" && errorMessage === "Passwords do not match."}
                    required
                />
            </Form.Group>

            <Button
                variant={status === "error" ? "danger" : "success"}
                type="submit"
                disabled={status === "loading" || !email || !password || !confirmPassword}
                className="w-100 mb-3"
            >
                {status === "loading" ? "REGISTERING..." : "SIGN UP"}
            </Button>

            <div className="text-center font-weight-bold">
                {status === "success" && (
                    <div className="text-success">
                        <p className="mb-1">Account created successfully!</p>
                        <a href="/login" style={{ textDecoration: 'underline', color: 'green' }}>Click here to log in.</a>
                    </div>
                )}
                {status === "error" && (
                    <p className="text-danger">{errorMessage}</p>
                )}
            </div>
        </Form>
    );
};

RegisterForm.displayName = "RegisterForm";

RegisterForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
};

export default RegisterForm;
