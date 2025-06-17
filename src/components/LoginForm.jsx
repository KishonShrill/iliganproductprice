import { useState, useRef } from 'react'
import { Form, Button } from "react-bootstrap";
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";
import axios from 'axios'
import '../styles/login.scss'

import { useThrottleCallback } from '../helpers/useDebounce';

const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const cookies = new Cookies();

const LoginForm = ({ debugMode }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const logRef = useRef(null)
    const submitRef = useRef(null);

    const handleSubmitBtn = (e) => {
        e.preventDefault();
        debouncedLogin();
    }

    const handleSubmit = () => {
        // prevent the form from refreshing the whole page
        setLoading(true);
        submitRef.current.style.background = "#ee4d2da0";

        let url = debugMode
            ? `http://${LOCALHOST}:5000/login`
            : "https://iliganproductprice-mauve.vercel.app/login";

        const configuration = {
            method: "post",
            url,
            data: {
                email,
                password,
            },
        };

        // console.log({ configuration })

        axios(configuration)
            .then((result) => {
                setLogin(true);
                emailRef.current.style.borderColor = "green";
                passwordRef.current.style.borderColor = "green";
                logRef.current.style.color = "green";
                cookies.set("TOKEN", result.data.token, {
                    path: "/",
                });
                window.location.href = "/dev-mode";
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
                emailRef.current.style.borderColor = "red";
                passwordRef.current.style.borderColor = "red";
                logRef.current.textContent = "Email or Password does not exist";
                logRef.current.style.color = "red";
                submitRef.current.style.background = "#ee4d2d";
            });
        // make a popup alert showing the "submitted" text
        // alert("Submited");
    };

    const debouncedLogin = useThrottleCallback(handleSubmit, 1000)

    return (
        <Form>
            <h2>DEVELOPER LOGIN</h2>
            <p>Insert your credentials</p>
            {/* email */}
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    ref={emailRef}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                />
            </Form.Group>

            {/* password */}
            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    ref={passwordRef}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                />
            </Form.Group>

            <p className="forget">Forgot your Password?</p>

            {/* submit button */}
            <Button
                ref={submitRef}
                variant="primary"
                type="submit"
                onClick={(e) => handleSubmitBtn(e)}
            >
                {loading ? "LOADING..." : "LOGIN"}
            </Button>
            {login ? (
                <p className="text-success">You Are Logged in Successfully</p>
            ) : (
                <p ref={logRef} className="text-danger">
                    You Are Not Logged in
                </p>
            )}
        </Form>
    );
};

// 👇 Give the component a name for debugging purposes
LoginForm.displayName = "Debug Form"

// 👇 Define PropTypes
LoginForm.propTypes = {
    debugMode: PropTypes.bool.isRequired,
}

export default LoginForm