import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm"; // Make sure to import this!
import PropTypes from "prop-types";
import Cookies from 'universal-cookie';
import SEO from '../components/SEO';

const cookies = new Cookies();

const Login = ({ debugMode }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const navigate = useNavigate();

    const token = cookies.get("budgetbuddy_token");
    useEffect(() => {
        if (token) {
            navigate("/locations")
        }
    }, [token, navigate])
    if (token) return null;

    return (
        <main className="px-8 flex justify-center items-center h-[calc(100vh-12rem)]">
            <SEO
                title={"Login | Budget Buddy"}
                specificUrl='authenticate'
                description={"Get all the max benefits of budget buddy by logging in."}
            />
            <div className="w-full max-w-md">
                {isLoginView ? (
                    <LoginForm
                        debugMode={debugMode}
                        onSwitch={() => setIsLoginView(false)}
                    />
                ) : (
                    <RegisterForm
                        debugMode={debugMode}
                        onSwitch={() => setIsLoginView(true)}
                    />
                )}
            </div>
        </main>
    )
}

// 👇 Give the component a name for debugging purposes
Login.displayName = "Login Page"

// 👇 Define PropTypes
Login.propTypes = {
    debugMode: PropTypes.bool.isRequired,
}

export default Login
