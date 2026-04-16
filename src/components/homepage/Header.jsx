import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogIn, Menu, X, LayoutDashboard, Package, Utensils, Info, ShoppingCart, Computer, CircleUserRound, Scroll } from "lucide-react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

import useFetchListingsByLocation from '@/hooks/useFetchListingsByLocation';
const cookies = new Cookies();

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(cookies.get("budgetbuddy_token"));
    const location = useLocation();
    const currentLocation = location.pathname
    let isAdvancedUser = false;

    const getLocationName = () => {
        const pathParts = currentLocation.split('/');
        if (pathParts[1] === 'location' && pathParts[2]) return decodeURIComponent(pathParts[2]);
        return null;
    };
    let locationTitle = getLocationName();

    const { data } = useFetchListingsByLocation(locationTitle);

    locationTitle = currentLocation.split('/')[1]


    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if they are above a regular user. 
                // (Note: use decoded.userRole if that's what you named it in your backend JWT payload!)
                const role = decoded.user_role;
                isAdvancedUser.current = role === "admin" || role === "moderator";
            } catch (error) {
                console.error("Failed to decode token", error);
            }
        }
    })

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { to: "/", label: "Home", icon: <LayoutDashboard size={20} /> },
        { to: "/locations", label: "Groceries", icon: <Package size={20} /> },
        { to: "#", label: "Cuisines", icon: <Utensils size={20} />, disabled: true },
        { to: "/receipt", label: "Receipt", icon: <ShoppingCart size={20} /> },
        ...(token
            ? [{ to: "/contribution", label: "Contribute", icon: <Scroll size={20} /> }]
            : []),
        { to: "/docs", label: "About", icon: <Info size={20} /> },
    ];

    // Helper function to check if a path is active
    const checkIsActive = (path) => {
        if (path === "/") return location.pathname === "/";
        if (path === "#") return false;
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const handleCookieChange = (changeEvent) => {
            if (changeEvent.name === "budgetbuddy_token") {
                setToken(changeEvent.value);
            }
        };

        cookies.addChangeListener(handleCookieChange);
        return () => {
            cookies.removeChangeListener(handleCookieChange);
        };
    }, []);

    // Helper to dynamically extract the location name from the URL
    // e.g., "/location/Shoppe%2024" -> "Shoppe 24"


    const activeStyles = "!text-orange-500 font-bold";
    const inactiveStyles = "text-gray-600 dark:text-gray-300";
    const keepWidthStyles = "inline-flex flex-col after:content-[attr(data-text)] after:font-bold after:h-0 after:invisible after:overflow-hidden after:select-none";

    return (
        <header className="header relative flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-50">

            {/* LEFT: Logo & Desktop Title */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <img src="/budgetbuddy-logo.svg" className='w-[36px] h-[36px] rounded-full object-cover shadow-sm select-none' alt="Budget Buddy" />
                <span className={`inter-bold text-xl text-orange-500 dark:text-white ${currentLocation !== '/' && 'hidden'}`}>Budget Buddy</span>
            </Link>

            {/* CENTER: Dynamic Location Title */}
            <div className="flex-1 flex justify-center text-center px-4 min-w-0">
                {locationTitle && (
                    <h1 className={`truncate text-sm md:text-base capitalize font-bold py-1 px-2 rounded-lg text-white bg-orange-500 ${currentLocation === '/' && '!text-orange-500 bg-transparent text-xl pointer-events-none select-none'}`}>
                        {data?.location_name || locationTitle}
                    </h1>
                )}
            </div>

            {/* RIGHT: Settings & Menu Button (Mobile) */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <button
                    className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={toggleMenu}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Navigation Overlay (Floating Dropdown on Mobile / Inline on Desktop) */}
            <nav className={`
                absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-4 transition-all duration-200 origin-top
                md:static md:flex md:p-0 md:bg-transparent md:border-none md:shadow-none md:mt-0 md:backdrop-blur-none md:w-auto
                ${isOpen ? "scale-y-100 opacity-100 pointer-events-auto" : "scale-y-95 opacity-0 pointer-events-none md:scale-y-100 md:opacity-100 md:pointer-events-auto"}
            `}>
                <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
                    {/* Dynamic Links */}
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            {link.label === "About"
                                ? (
                                    <a href="/docs/" className={`nav-link ${index !== 0 && 'max-md:border-t'} max-md:border-gray-500 text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 ${link.disabled && 'md:!text-gray-300 !text-gray-600'}`}>
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link title={link.disabled && `Coming soon...`} className={`nav-link ${index !== 0 && 'max-md:border-t'} max-md:border-gray-500 text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 ${link.disabled && 'md:!text-gray-300 !text-gray-600'}`} to={link.to} onClick={toggleMenu}>
                                        <span className="md:hidden">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                )}
                        </li>
                    ))}

                    {/* Integrated Auth Section */}
                    <div className="flex flex-col md:flex-row md:border-l border-gray-200 dark:border-gray-600 mt-2 pt-2 md:mt-0 md:pt-0 md:pl-4 gap-1 md:gap-4">
                        <hr className="mb-2" />
                        {/* Desktop Settings (Mobile has it in header) */}
                        <Link
                            className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-50 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${checkIsActive("/settings") ? activeStyles : inactiveStyles}`}
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={20} />
                            <span data-text="Settings" className={`md:hidden ${keepWidthStyles}`}>Settings</span>

                        </Link>


                        {!token ? (
                            <Link
                                className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-50 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${checkIsActive("/authenticate") ? activeStyles : inactiveStyles}`}
                                to="/authenticate"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogIn size={20} />
                                <span data-text="Login" className={`md:hidden ${keepWidthStyles}`}>Login</span>
                            </Link>
                        ) : (
                            <>
                                {isAdvancedUser ? (
                                    <Link
                                        className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-50 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 font-medium ${checkIsActive("/dev-mode") ? activeStyles : inactiveStyles}`}
                                        to="/dev-mode"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Computer size={20} />
                                        <span data-text="Dev Mode" className={`md:hidden ${keepWidthStyles}`}>Dev Mode</span>
                                    </Link>
                                ) : (
                                    <Link
                                        className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-50 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 font-medium ${checkIsActive("/profile") ? activeStyles : inactiveStyles}`}
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CircleUserRound size={20} />
                                        <span data-text="Profile" className={`md:hidden ${keepWidthStyles}`}>Profile</span>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </ul>
            </nav>
        </header >
    );
};

Header.displayName = "Header"

export default React.memo(Header)
