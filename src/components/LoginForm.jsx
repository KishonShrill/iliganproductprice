import { useState, startTransition } from 'react'
import { Form, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";
import axios from 'axios'
import { ResultAsync } from 'neverthrow';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'

import '../styles/login.scss'

const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const cookies = new Cookies();

const LoginForm = ({ debugMode, onSwitch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Using a single status state is often cleaner than multiple booleans
    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    let url = debugMode
        ? `http://${LOCALHOST}:5000/auth/login`
        : "https://iliganproductprice-mauve.vercel.app/auth/login";

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus("loading");
        setErrorMessage("");

        await ResultAsync
            .fromPromise(axios.post(url, { email, password }), (error) => {
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
    }

    return (
        <Form
            className='my-8 mx-auto p-8 max-w-[400px] border-2 border-solid border-black rounded-md bg-white shadow-[0.5rem_0.5rem_0_#ee4d2d]'
            onSubmit={handleSubmit}
        >
            <h2>CUSTOMER LOGIN</h2>
            <p>Insert your credentials</p>

            <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    isInvalid={status === "error"}
                    isValid={status === "success"}
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
                    placeholder="password"
                    isInvalid={status === "error"}
                    isValid={status === "success"}
                    required
                />
            </Form.Group>

            {/* <p className="forget">Forgot your Password?</p> */}

            <Button
                variant={status === "error" ? "danger" : "primary"}
                type="submit"
                // 5. Disable button to prevent double-clicks instead of using a complex debounce
                disabled={status === "loading" || !email || !password}
            >
                {status === "loading" ? "LOADING..." : "LOGIN"}
            </Button>

            <div className='flex flex-col mt-4'>
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {

                        setStatus("loading");
                        setErrorMessage("");

                        await ResultAsync
                            .fromPromise(axios.post(url, { token: credentialResponse.credential }), (error) => {
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

            {/* 6. Clean Conditional Rendering for Messages */}
            <div className="mt-3 font-weight-bold">
                {status === "success" && (
                    <p className="text-green-700">You Are Logged in Successfully</p>
                )}
                {status === "error" && (
                    <p className="text-red-600">{errorMessage || "You Are Not Logged in"}</p>
                )}
            </div>

            {/* 👇 Add the Toggle Link Here 👇 */}
            <div className="mt-4 text-center text-sm">
                <p className="text-gray-600">
                    Don&apos;t have an account?{' '}
                    <span
                        onClick={onSwitch}
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                    >
                        Register here
                    </span>
                </p>
            </div>
        </Form>
    );
};

LoginForm.displayName = "LoginForm";

LoginForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
    onSwitch: PropTypes.func.isRequired,
};

export default LoginForm;
