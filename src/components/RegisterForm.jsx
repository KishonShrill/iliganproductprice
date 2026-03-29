import { useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from "react-bootstrap";
import PropTypes from 'prop-types';
import axios from 'axios';
import { ResultAsync } from 'neverthrow';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

const LOCALHOST = import.meta.env.VITE_LOCALHOST || "localhost";
const cookies = new Cookies();

const RegisterForm = ({ debugMode, onSwitch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const url = debugMode
        ? `http://${LOCALHOST}:5000/auth/register`
        : "https://iliganproductprice-mauve.vercel.app/auth/register";

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
                () => {
                    setStatus("success");
                    // Clear the form fields on success
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");

                    navigate("/locations")
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
                className="w-100"
            >
                {status === "loading" ? "REGISTERING..." : "SIGN UP"}
            </Button>

            <div className='flex flex-col mt-4'>
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        await ResultAsync
                            .fromPromise(axios.post(url, jwtDecode(credentialResponse.credential)), (error) => {
                                return error.response?.data?.message || "Unable to connect to server. Please try again later.";
                            })
                            .map((response) => response.data)
                            .match(
                                (data) => {
                                    console.log(jwtDecode(data.token))
                                    cookies.set("budgetbuddy_token", data.token, { path: "/" });
                                    setStatus("success")
                                    startTransition(() => {
                                        navigate("/locations");
                                    });
                                },
                                (errorMsg) => {
                                    setStatus("error")
                                    setErrorMessage(errorMsg)
                                }
                            );
                    }}
                    onError={() => console.log("Login Error")}
                />
            </div>

            <div className="text-center font-weight-bold">
                {status === "success" && (
                    <div className="text-success">
                        <p className="mb-1">Account created successfully!</p>
                        <a href="/locations" style={{ textDecoration: 'underline', color: 'green' }}>Click here to log in.</a>
                    </div>
                )}
                {status === "error" && (
                    <p className="text-danger">{errorMessage}</p>
                )}
            </div>

            {/* 👇 Add the Toggle Link Here 👇 */}
            {status !== "success" && (
                <div className="mt-4 text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <span
                            onClick={onSwitch}
                            className="text-blue-600 font-medium cursor-pointer hover:underline"
                        >
                            Log in
                        </span>
                    </p>
                </div>
            )}
        </Form>
    );
};

RegisterForm.displayName = "RegisterForm";

RegisterForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
    onSwitch: PropTypes.func.isRequired,
};

export default RegisterForm;
