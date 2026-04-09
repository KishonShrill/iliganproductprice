import { useState, useEffect, useCallback, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/homepage/Header";
import ToastContainer from "@/components/ToastContainer";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

import '@/styles/main-header.scss'

const cookies = new Cookies();

function ContributionLayout() {
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
            navigate("/authenticate")
        }
    }, [token, navigate])
    if (!token) return null;

    return (
        <>
            <Header />
            <Suspense fallback={
                <div className='errorDisplay'>
                    <h2 className="text-lg">Loading<span className="animated-dots"></span></h2>
                </div>
            }>
                <Outlet context={{ toasts, removeToast, addToast }} />
            </Suspense>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
    );
}

ContributionLayout.displayName = "Contribution Layout"

export default ContributionLayout

