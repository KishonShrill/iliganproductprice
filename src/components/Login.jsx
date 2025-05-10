import React, { useState, useRef } from 'react'
import { Form, Button } from "react-bootstrap";
import Cookies from "universal-cookie";
import axios from 'axios'
import '../styles/login.scss'

import { useDebouncedCallback } from '../helpers/useDebounce';

const cookies = new Cookies();
// set the cookie

const Login = ({ debugMode }) => {
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

  const handleSubmit = (e) => {
    // prevent the form from refreshing the whole page
    setLoading(true);
    submitRef.current.style.background = "#ee4d2da0";
    

    let url = debugMode
      ? "http://localhost:5000/login"
      : "https://iliganproductprice-mauve.vercel.app/login";

    console.log("URL: ", url)

    const configuration = {
      method: "post",
      url,
      data: {
        email,
        password,
      },
    };

    console.log({ configuration })

    axios(configuration)
      .then((result) => {
        setLogin(true);
        cookies.set("TOKEN", result.data.token, {
          path: "/",
        });
        window.location.href = "/dev-mode";
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        emailRef.current.style.borderColor = "red"
        passwordRef.current.style.borderColor = "red"
        logRef.current.textContent = "Email or Password does not exist"
        logRef.current.style.color = "red"
        submitRef.current.style.background = "#ee4d2d";
      })
    // make a popup alert showing the "submitted" text
    // alert("Submited");
  }

  const debouncedLogin = useDebouncedCallback(handleSubmit, 1000)

  return (
    <main>
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

        <p className='forget'>Forgot your Password?</p>

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
          <p ref={logRef} className="text-danger">You Are Not Logged in</p>
        )}
      </Form>
    </main>
  )
}
export default Login