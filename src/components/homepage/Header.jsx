import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogIn, Menu, X, LayoutDashboard, Package, Utensils, Info, ShoppingCart, User, Computer, CircleUserRound, Scroll } from "lucide-react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

const cookies = new Cookies();


const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(cookies.get("budgetbuddy_token"));
    const location = useLocation();
    let isAdvancedUser = false;

    useEffect(() => {
        const handleCookieChange = (changeEvent) => {
            // Check if the specific token cookie was the one that changed
            if (changeEvent.name === "budgetbuddy_token") {
                setToken(changeEvent.value); // This triggers the re-render!
            }
        };

        // Attach the listener
        cookies.addChangeListener(handleCookieChange);

        // Cleanup the listener when the component unmounts
        return () => {
            cookies.removeChangeListener(handleCookieChange);
        };
    }, []);

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Check if they are above a regular user. 
            // (Note: use decoded.userRole if that's what you named it in your backend JWT payload!)
            const role = decoded.user_role;
            isAdvancedUser = role === "admin" || role === "moderator";
        } catch (error) {
            console.error("Failed to decode token", error);
        }
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { to: "/", label: "Home", icon: <LayoutDashboard size={20} /> },
        { to: "/locations", label: "Groceries", icon: <Package size={20} /> },
        { to: "#", label: "Cuisines", icon: <Utensils size={20} />, disabled: true },
        { to: "/receipt", label: "Receipt", icon: <ShoppingCart size={20} /> },
        ...(token
            ? [{ to: "/contribution", label: "Contribute", icon: <Scroll size={20} /> }]
            : []),
        { to: "#", label: "About", icon: <Info size={20} />, disabled: true },
    ];

    const checkIsActive = (path) => {
        if (path === "/") return location.pathname === "/"; // Exact match for home
        if (path === "#") return false;
        return location.pathname.startsWith(path); // Highlights parent tab even if on child page
    };

    const activeStyles = "!text-orange-500 font-bold";
    const inactiveStyles = "text-white md:text-black dark:md:text-white";
    const keepWidthStyles = "inline-flex flex-col after:content-[attr(data-text)] after:font-bold after:h-0 after:invisible after:overflow-hidden after:select-none";

    return (
        <header className="header flex items-center justify-between px-6 py-2 dark:bg-gray-700 dark:border-b-gray-600">
            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={toggleMenu}>
                <Menu size={24} className="dark:text-white" />
            </button>


            <Link to="/" className="header__name" style={{ fontWeight: 700 }}>Budget Buddy</Link>

            {/* Quick Mobile Auth Icon */}
            <div className="flex gap-3">
                {!token ? (
                    <>
                        <Link to="/authenticate" className="md:hidden">
                            <LogIn size={24} className={`dark:text-white ${checkIsActive("/authenticate")}`} />
                        </Link>
                    </>
                ) : (
                    <Link to="/profile" className="md:hidden">
                        <CircleUserRound size={24} className={`dark:text-white ${checkIsActive("/profile")}`} />
                    </Link>
                )}
            </div>

            {/* Navigation Overlay */}
            <nav className={`fixed md:static top-0 left-0 h-full md:h-auto w-[300px] md:w-auto bg-slate-800 md:bg-transparent transition-transform duration-300 z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

                <ul className="flex flex-col md:flex-row py-6 md:p-0 h-full md:items-center md:h-auto md:gap-6">
                    <button className="md:hidden self-end mb-4 mr-4" onClick={toggleMenu}><X color="white" /></button>

                    {navLinks.map((link, index) => (
                        <li key={link.label}>
                            <Link
                                title={link.disabled && `Coming soon...`}
                                className={`nav-link ${index !== 0 && 'max-md:border-t'} max-md:border-gray-500 text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 ${link.disabled && 'md:!text-gray-300 !text-gray-600'} ${checkIsActive(link.to) ? activeStyles : inactiveStyles}`}
                                to={link.to}
                                onClick={toggleMenu}
                            >
                                <span className="md:hidden">{link.icon}</span>
                                <span data-text={link.label} className={keepWidthStyles}>{link.label}</span>
                            </Link>
                        </li>
                    ))}

                    {/* Integrated Auth Section */}
                    <div className="flex flex-col mt-auto md:flex-row md:border-t-0 md:border-l border-gray-600 pt-4 md:pt-0 md:pl-4 md:mt-0 md:items-center md:gap-4">
                        <Link
                            className={`nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 ${checkIsActive("/settings")}`}
                            to="/settings"
                            onClick={toggleMenu}
                        >
                            <Settings size={24} />
                            <span data-text="Settings" className={`md:hidden ${keepWidthStyles}`}>Settings</span>
                        </Link>
                        {!token ? (
                            <>
                                <Link
                                    className={`nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 ${checkIsActive("/authenticate")}`}
                                    to="/authenticate"
                                    onClick={toggleMenu}
                                >
                                    <LogIn size={24} />
                                    <span data-text="Login" className={`md:hidden ${keepWidthStyles}`}>Login</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Toggle between Dev Mode and Profile based on role */}
                                {isAdvancedUser ? (
                                    <Link
                                        className={`nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 font-medium ${checkIsActive("/dev-mode")}`}
                                        to="/dev-mode"
                                        onClick={toggleMenu}
                                    >
                                        <Computer size={24} />
                                        <span data-text="Dev Mode" className={`md:hidden ${keepWidthStyles}`}>Dev Mode</span>
                                    </Link>
                                ) : (
                                    <Link
                                        className={`nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 font-medium ${checkIsActive("/profile")}`}
                                        to="/profile"
                                        onClick={toggleMenu}
                                    >
                                        <CircleUserRound size={24} />
                                        <span data-text={"Profile"} className={`md:hidden ${keepWidthStyles}`}>Profile</span>
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

// 👇 Give the component a name for debugging purposes
Header.displayName = "Header"

export default React.memo(Header)
