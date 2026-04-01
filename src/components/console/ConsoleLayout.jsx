import { useState, useEffect, useCallback } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "universal-cookie";
import '../../styles/admin_console.scss'

import Sidebar from "./Sidebar";
import ToastContainer from "@/components/ToastContainer";
const cookies = new Cookies();

export default function CRUDInterface({ debugMode }) {
    const navigate = useNavigate()
    const token = cookies.get("budgetbuddy_token")
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        // Radix handles state animations using `data-state='closed'`.
        setToasts(prev => prev.map(t => t.id === id ? { ...t, open: false } : t));

        // Clear it out of state entirely after the exit animation completes (400ms)
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 400);
    }, []);

    const addToast = useCallback((name, description = null) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, name, description, open: true }]);
    }, []);

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
                <main className="flex-1 ">
                    <Outlet context={{ toasts, removeToast, addToast }} />
                </main>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}

// 👇 Give the component a name for debugging purposes
CRUDInterface.displayName = "Console";

// 👇 Define PropTypes
CRUDInterface.propTypes = {
    debugMode: PropTypes.bool,
}
