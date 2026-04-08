import { useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from "react-bootstrap";
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { ResultAsync } from 'neverthrow';
import { GoogleLogin } from '@react-oauth/google';
//import { jwtDecode } from 'jwt-decode';

const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const cookies = new Cookies();

const RegisterForm = ({ debugMode, onSwitch }) => {
    const [username, setUsername] = useState("");
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
            axios.post(url, { username, email, password }),
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
                    console.log(data)
                    cookies.set("budgetbuddy_token", data.token, { path: "/" });
                    setStatus("success");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    startTransition(() => {
                        navigate("/locations");
                    });
                },
                (errorMsg) => {
                    setStatus("error");
                    setErrorMessage(errorMsg);
                }
            );
    };

    return (
        <Form
            className='my-8 mx-auto p-8 max-w-[400px] border-2 border-solid border-black rounded-md bg-white shadow-[0.5rem_0.5rem_0_#ee4d2d]'
            onSubmit={handleSubmit}
        >
            <h2 className="text-center font-bold text-xl mb-2">CREATE ACCOUNT</h2>
            <p className="text-center text-[0.8rem]">Register as a new user</p>

            {/* Added mt-6 (1.5rem) to match :first-of-type, plus w-full flex flex-col */}
            <Form.Group controlId="formBasicUsername" className="mb-3 mt-6 w-full flex flex-col">
                <Form.Label className="mb-1 text-[0.8rem]">Username</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="skengker777"
                    isInvalid={status === "error"}
                    isValid={status === "success"}
                    required
                    className="px-[0.8rem] py-[0.4rem] border border-black"
                />
            </Form.Group>

            <Form.Group controlId="formBasicEmail" className="mb-3 w-full flex flex-col">
                <Form.Label className="mb-1 text-[0.8rem]">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    isInvalid={status === "error" && errorMessage !== "Passwords do not match."}
                    required
                    className="px-[0.8rem] py-[0.4rem] border border-black"
                />
            </Form.Group>

            {/* Added w-full flex flex-col */}
            <Form.Group controlId="formBasicPassword" className="mb-3 w-full flex flex-col">
                <Form.Label className="mb-1 text-[0.8rem]">Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    isInvalid={status === "error"}
                    required
                    className="px-[0.8rem] py-[0.4rem] border border-black"
                />
            </Form.Group>

            {/* Added w-full flex flex-col */}
            <Form.Group controlId="formConfirmPassword" className="mb-3 w-full flex flex-col">
                <Form.Label className="mb-1 text-[0.8rem]">Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    isInvalid={status === "error" && errorMessage === "Passwords do not match."}
                    required
                    className="px-[0.8rem] py-[0.4rem] border border-black"
                />
            </Form.Group>

            <Button
                variant={status === "error" ? "danger" : "success"}
                type="submit"
                disabled={status === "loading" || !email || !password || !confirmPassword}
                className="w-full mt-6 py-3 text-white border-none rounded bg-[#ee4d2d] hover:bg-[#d43d1f] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === "loading" ? "REGISTERING..." : "SIGN UP"}
            </Button>

            {/* Added w-full */}
            <div className='flex flex-col mt-4 w-full'>
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        await ResultAsync
                            .fromPromise(axios.post(url, { token: credentialResponse.credential }), (error) => {
                                return error.response?.data?.message || "Unable to connect to server. Please try again later.";
                            })
                            .map((response) => response.data)
                            .match(
                                (data) => {
                                    cookies.set("budgetbuddy_token", data.result.token, { path: "/" });
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
                    locale="en"
                    width={"100%"}
                />
            </div>

            {/* Replaced Bootstrap text utility classes with Tailwind */}
            <div className="mt-3 text-center font-bold w-full flex flex-col">
                {status === "success" && (
                    <div className="text-green-700 text-[0.8rem]">
                        <p className="mb-1">Account created successfully!</p>
                        <a href="/locations" className="underline hover:text-green-800 transition-colors">Click here to log in.</a>
                    </div>
                )}
                {status === "error" && (
                    <p className="text-red-600 text-[0.8rem]">{errorMessage}</p>
                )}
            </div>

            {/* Changed mt-4 to mt-5 (1.25rem) to match :last-of-type logic */}
            {status !== "success" && (
                <div className="mt-5 text-center text-sm w-full flex flex-col">
                    <p className="text-gray-600 text-[0.8rem] mt-4">
                        Already have an account?{' '}
                        <span
                            onClick={onSwitch}
                            className="text-blue-600 font-medium cursor-pointer hover:underline hover:text-[#ee4d2d]"
                        >
                            Log in
                        </span>
                    </p>
                </div>
            )}
        </Form>
    );
}

RegisterForm.displayName = "RegisterForm";

RegisterForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
    onSwitch: PropTypes.func.isRequired,
};

export default RegisterForm;
