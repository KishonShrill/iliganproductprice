import { useState, useEffect, startTransition } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Form, Button } from "react-bootstrap";
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";
import SEO from '@/components/SEO';

const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const cookies = new Cookies();

const AuthForm = ({ debugMode }) => {
    const navigate = useNavigate();
    const { addToast } = useOutletContext();
    const token = cookies.get("budgetbuddy_token");

    // --- UNIFIED STATE ---
    const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Register
    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (token) {
            navigate("/budget-hub");
        }
    }, [token, navigate]);

    // Dynamically set the URL based on the current mode (login vs register)
    const actionPath = isLogin ? "login" : "register";
    const url = debugMode
        ? `http://${LOCALHOST}:5000/auth/${actionPath}`
        : `https://iliganproductprice-mauve.vercel.app/auth/${actionPath}`;

    // --- UNIFIED HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processAuth = async (payload) => {
        setStatus("loading");
        setErrorMessage("");

        await ResultAsync
            .fromPromise(axios.post(url, payload), (error) => {
                return error.response?.data?.message || "Unable to connect to server. Please try again later.";
            })
            .map((response) => response.data)
            .match(
                (data) => {
                    const user = jwtDecode(data.token);
                    cookies.set("budgetbuddy_token", data.token, { path: "/" });
                    addToast("Success", isLogin ? `Welcome back ${user.username}!` : "Account created successfully!");
                    setStatus("success");
                    startTransition(() => {
                        navigate("/budget-hub");
                    });
                },
                (errorMsg) => {
                    setStatus("error");
                    addToast("User not found", "Please register an account first!", "destructive")
                    setIsLogin(false)
                    setErrorMessage(errorMsg);
                }
            );
    };

    const customGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            await processAuth({ token: tokenResponse.access_token, iss: tokenResponse.iss || "" });
        },
        onError: (error) => {
            setStatus("error");
            setErrorMessage("Google Authentication failed or was cancelled.");
            console.error("Auth Error:", error);
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extra validation for registration
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setStatus("error");
            setErrorMessage("Passwords do not match.");
            return;
        }

        // Construct payload based on mode
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : { username: formData.username, email: formData.email, password: formData.password };

        await processAuth(payload);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStatus("idle");
        setErrorMessage("");
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    };

    if (token) return null;

    return (
        <main className="px-8 flex justify-center items-center min-h-[calc(100vh-7.75rem)] py-8">
            <SEO
                title={isLogin ? "Login | Budget Buddy" : "Register | Budget Buddy"}
                specificUrl='authenticate'
                description="Get all the max benefits of budget buddy by logging in."
            />
            <div className="w-full max-w-md">
                <Form
                    className='mx-auto p-8 border-2 border-solid border-black rounded-md bg-white shadow-[0.5rem_0.5rem_0_#ee4d2d]'
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-center font-bold text-xl mb-2">
                        {isLogin ? "CUSTOMER LOGIN" : "CREATE ACCOUNT"}
                    </h2>
                    <p className="text-center text-[0.8rem] mb-6">
                        {isLogin ? "Insert your credentials" : "Register as a new user"}
                    </p>

                    {/* Username (Register Only) */}
                    {!isLogin && (
                        <Form.Group controlId="formBasicUsername" className="mb-3 w-full flex flex-col">
                            <Form.Label className="mb-1 text-[0.8rem]">Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="skengker777"
                                isInvalid={status === "error"}
                                isValid={status === "success"}
                                required={!isLogin}
                                className="px-[0.8rem] py-[0.4rem] border border-black"
                            />
                        </Form.Group>
                    )}

                    {/* Email (Both) */}
                    <Form.Group controlId="formBasicEmail" className="mb-3 w-full flex flex-col">
                        <Form.Label className="mb-1 text-[0.8rem]">Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@gmail.com"
                            isInvalid={status === "error" && errorMessage !== "Passwords do not match."}
                            isValid={status === "success"}
                            required
                            className="px-[0.8rem] py-[0.4rem] border border-black"
                        />
                    </Form.Group>

                    {/* Password (Both) */}
                    <Form.Group controlId="formBasicPassword" className="mb-3 w-full flex flex-col">
                        <Form.Label className="mb-1 text-[0.8rem]">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            isInvalid={status === "error"}
                            isValid={status === "success"}
                            required
                            className="px-[0.8rem] py-[0.4rem] border border-black"
                        />
                    </Form.Group>

                    {/* Confirm Password (Register Only) */}
                    {!isLogin && (
                        <Form.Group controlId="formConfirmPassword" className="mb-3 w-full flex flex-col">
                            <Form.Label className="mb-1 text-[0.8rem]">Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                                isInvalid={status === "error" && errorMessage === "Passwords do not match."}
                                required={!isLogin}
                                className="px-[0.8rem] py-[0.4rem] border border-black"
                            />
                        </Form.Group>
                    )}

                    <Button
                        variant={status === "error" ? "danger" : (isLogin ? "primary" : "success")}
                        type="submit"
                        disabled={status === "loading" || !formData.email || !formData.password || (!isLogin && (!formData.username || !formData.confirmPassword))}
                        className="w-full mt-6 py-3 text-white border-none rounded bg-[#ee4d2d] hover:bg-[#d43d1f] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === "loading"
                            ? (isLogin ? "LOADING..." : "REGISTERING...")
                            : (isLogin ? "LOGIN" : "SIGN UP")}
                    </Button>

                    {/* GOOGLE AUTH BUTTON */}
                    <div className='flex flex-col w-full mt-3'>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-2 inter-regular border rounded flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-100 text-black"
                            onClick={() => customGoogleLogin()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isLogin ? "Sign in with Google" : "Sign up with Google"}
                        </Button>
                    </div>

                    {/* STATUS MESSAGES */}
                    <div className={`${status !== 'idle' ? 'mt-4' : ''} text-center font-bold w-full flex flex-col`}>
                        {status === "error" && (
                            <p className="text-red-600 text-[0.8rem] m-0">{errorMessage}</p>
                        )}
                    </div>

                    {/* BOTTOM SWITCH */}
                    {status !== "success" && (
                        <div className="mt-4 text-center text-sm w-full flex flex-col">
                            <p className="text-gray-600 text-[0.8rem] m-0">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span
                                    onClick={toggleMode}
                                    className="text-blue-600 font-medium cursor-pointer hover:underline hover:text-[#ee4d2d]"
                                >
                                    {isLogin ? "Register here" : "Log in"}
                                </span>
                            </p>
                        </div>
                    )}
                </Form>
            </div>
        </main>
    );
};

AuthForm.displayName = "AuthForm";

AuthForm.propTypes = {
    debugMode: PropTypes.bool.isRequired
};

export default AuthForm;
