import { useState } from 'react'
import { Form, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";
import axios from 'axios'
import { ResultAsync } from 'neverthrow';

import '../styles/login.scss'

const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const cookies = new Cookies();

const LoginForm = ({ debugMode }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Using a single status state is often cleaner than multiple booleans
    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus("loading");
        setErrorMessage("");

        let url = debugMode
            ? `http://${LOCALHOST}:5000/auth/login`
            : "https://iliganproductprice-mauve.vercel.app/auth/login";

        await ResultAsync
            .fromPromise(axios.post(url, { email, password }), (error) => {
                return error.response?.data?.message || "Unable to connect to server. Please try again later.";
            })
            .map((response) => response.data)
            .match(
                (data) => {
                    console.log(data.token)
                    cookies.set("budgetbuddy_token", data.token, { path: "/" });
                    setStatus("success")
                    navigate("/dev-mode")
                },
                (errorMsg) => {
                    setStatus("error")
                    setErrorMessage(errorMsg)
                }
            );
    }

    return (
        // 4. Attach onSubmit to the Form, not the Button (Allows 'Enter' key to submit)
        <Form onSubmit={handleSubmit}>
            <h2>DEVELOPER LOGIN</h2>
            <p>Insert your credentials</p>

            <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    // React-Bootstrap automatically handles red/green borders with these props:
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

            <p className="forget">Forgot your Password?</p>

            <Button
                variant={status === "error" ? "danger" : "primary"}
                type="submit"
                // 5. Disable button to prevent double-clicks instead of using a complex debounce
                disabled={status === "loading" || !email || !password}
            >
                {status === "loading" ? "LOADING..." : "LOGIN"}
            </Button>

            {/* 6. Clean Conditional Rendering for Messages */}
            <div className="mt-3 font-weight-bold">
                {status === "success" && (
                    <p className="text-green-700">You Are Logged in Successfully</p>
                )}
                {status === "error" && (
                    <p className="text-red-600">{errorMessage || "You Are Not Logged in"}</p>
                )}
            </div>
        </Form>
    );
};

LoginForm.displayName = "LoginForm";

LoginForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
};

export default LoginForm;
