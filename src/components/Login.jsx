import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Form, Button } from "react-bootstrap";
import Cookies from "universal-cookie";
import '../styles/login.scss'

const cookies = new Cookies();
// set the cookie

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);
  
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const logRef = useRef(null)

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

    console.log({configuration})

    axios(configuration)
      .then((result) => {console.log(result);})
      .catch((error) => {
        console.error(error);
        emailRef.current.style.border = "1px solid red"
        passwordRef.current.style.border = "1px solid red"
        logRef.current.textContent = "Email or Password does not exist"
        logRef.current.style.color = "red"
      })

    axios(configuration)
      .then((result) => {
        setLogin(true);
        cookies.set("TOKEN", result.data.token, {
          path: "/",
        });
        window.location.href = "/dev-mode";
      })
      .catch((error) => {
        error = new Error();
      });
    // make a popup alert showing the "submitted" text
    // alert("Submited");
  }

  return(
    <main>
      <Form onSubmit={(e)=>handleSubmit(e)}>
        <h2>LOGIN</h2>
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
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          LOGIN
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