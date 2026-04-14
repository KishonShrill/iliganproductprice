import { useState, useCallback, Suspense } from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Header from "@/components/homepage/Header";
import MainBottomNav from "@/components/MainBottomNav";
import ToastContainer from "@/components/ToastContainer";

function HomepageLayout() {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        // Radix handles state animations using `data-state='closed'`.
        setToasts(prev => prev.map(t => t.id === id ? { ...t, open: false } : t));

        // Clear it out of state entirely after the exit animation completes (400ms)
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 400);
    }, []);

    const addToast = useCallback((name, description = null, type) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, name, description, type, open: true }]);
    }, []);

    return (
        <>
            <Header />
            <Suspense fallback={
                <div className='errorDisplay'>
                    <h2 className="text-lg">Loading<span className="animated-dots"></span></h2>
                </div>
            }>
                <div className="h-[calc(100vh-62px)] overflow-y-auto">
                    <Outlet context={{ toasts, removeToast, addToast }} />
                </div>
            </Suspense>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <MainBottomNav />
        </>
    );
}

HomepageLayout.displayName = "Homepage Layout"
HomepageLayout.propTypes = {
    token: PropTypes.any
}

export default HomepageLayout
