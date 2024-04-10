import React, { useState } from 'react'
import axios from 'axios'
import { Form, Button } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();
// set the cookie

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);

  const handleSubmit = (e) => {
    // prevent the form from refreshing the whole page
    e.preventDefault();
    const configuration = {
      method: "post",
      url: "https://iliganproductprice-mauve.vercel.app/login",
      data: {
        email,
        password,
      },
    };
    axios(configuration)
      .then((result) => {console.log(result);})
      .catch((error) => {console.log(error);})
    axios(configuration)
      .then((result) => {
        setLogin(true);
        cookies.set("TOKEN", result.data.token, {
          path: "/",
        });
        window.location.href = "/auth";
      })
      .catch((error) => {
        error = new Error();
      });
    // make a popup alert showing the "submitted" text
    // alert("Submited");
  }

  return(
    <>
      <Form onSubmit={(e)=>handleSubmit(e)}>
        {/* email */}
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </Form.Group>

        {/* password */}
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </Form.Group>

        {/* submit button */}
        <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Login
        </Button>
        {login ? (
          <p className="text-success">You Are Logged in Successfully</p>
        ) : (
          <p className="text-danger">You Are Not Logged in</p>
        )}
      </Form>
    </>
  )
}
export default Login