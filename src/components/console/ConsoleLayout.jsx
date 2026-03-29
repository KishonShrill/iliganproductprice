import { useEffect, Suspense } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "universal-cookie";
import '../../styles/admin_console.scss'

import Sidebar from "./Sidebar";
const cookies = new Cookies();

export default function CRUDInterface({ debugMode }) {
    const navigate = useNavigate()
    const token = cookies.get("budgetbuddy_token")

    useEffect(() => {
        if (!token) {
            navigate("/")
        }
    }, [token, navigate])
    if (!token) return null;

    return (
        <div className="flex h-screen bg-gray-100 overflow-auto">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto">
                    <Suspense fallback={
                        <div className='errorDisplay'>
                            <h2>Loading<span className="animated-dots"></span></h2>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

// 👇 Give the component a name for debugging purposes
CRUDInterface.displayName = "Console";

// 👇 Define PropTypes
CRUDInterface.propTypes = {
    debugMode: PropTypes.bool,
}
