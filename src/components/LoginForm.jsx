import { useState, startTransition } from 'react'
import { Form, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";
import axios from 'axios'
import { ResultAsync } from 'neverthrow';
import { GoogleLogin } from '@react-oauth/google';
//import { jwtDecode } from 'jwt-decode'

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
            <h2 className="text-center font-bold text-xl mb-2">CUSTOMER LOGIN</h2>
            <p className="text-center text-[0.8rem]">Insert your credentials</p>

            {/* Added mt-6 (1.5rem) to match :first-of-type, plus w-full flex flex-col */}
            <Form.Group controlId="formBasicEmail" className="mb-3 mt-6 w-full flex flex-col">
                <Form.Label className="mb-1 text-[0.8rem]">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    isInvalid={status === "error"}
                    isValid={status === "success"}
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
                    placeholder="password"
                    isInvalid={status === "error"}
                    isValid={status === "success"}
                    required
                    className="px-[0.8rem] py-[0.4rem] border border-black"
                />
            </Form.Group>

            {/* Converted the nth-of-type(2) hover logic if you ever uncomment this */}
            {/* <p className="mt-4 text-right hover:text-[#ee4d2d] text-[0.8rem] cursor-pointer transition-colors">Forgot your Password?</p> */}

            <Button
                variant={status === "error" ? "danger" : "primary"}
                type="submit"
                disabled={status === "loading" || !email || !password}
                // Converted the submit button styles directly here
                className="w-full mt-6 py-3 text-white border-none rounded bg-[#ee4d2d] hover:bg-[#d43d1f] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === "loading" ? "LOADING..." : "LOGIN"}
            </Button>

            {/* Added w-full */}
            <div className='flex flex-col mt-4 w-full'>
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
                    locale="en"
                    width='100%'
                />
            </div>

            {/* Clean Conditional Rendering for Messages */}
            <div className="mt-3 font-weight-bold w-full flex flex-col">
                {status === "success" && (
                    <p className="text-green-700 text-center text-[0.8rem]">You Are Logged in Successfully</p>
                )}
                {status === "error" && (
                    <p className="text-red-600 text-center text-[0.8rem]">{errorMessage || "You Are Not Logged in"}</p>
                )}
            </div>

            {/* Changed mt-4 to mt-5 (1.25rem) to match :last-of-type logic */}
            <div className="mt-5 text-center text-sm w-full flex flex-col">
                {/* Added mt-4 to match p:last-of-type styling */}
                <p className="text-gray-600 text-[0.8rem] mt-4">
                    Don&apos;t have an account?{' '}
                    <span
                        onClick={onSwitch}
                        className="text-blue-600 font-medium cursor-pointer hover:underline hover:text-[#ee4d2d]"
                    >
                        Register here
                    </span>
                </p>
            </div>
        </Form>
    )
};

LoginForm.displayName = "LoginForm";

LoginForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
    onSwitch: PropTypes.func.isRequired,
};

export default LoginForm;
