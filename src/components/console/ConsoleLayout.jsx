import { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import '../../styles/admin_console.scss'

const Sidebar = lazy(() => import("./Sidebar"));

export default function CRUDInterface({ debugMode }) {

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
