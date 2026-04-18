import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogIn, Menu, X, LayoutDashboard, Package, Utensils, Info, ShoppingCart, Computer, CircleUserRound, Scroll, ChevronDown, Wallet } from "lucide-react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

import useFetchListingsByLocation from '@/hooks/useFetchListingsByLocation';
const cookies = new Cookies();

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(cookies.get("budgetbuddy_token"));
    const location = useLocation();
    const currentLocation = location.pathname
    const headerRef = useRef(null);
    let isAdvancedUser = false;

    const getLocationName = () => {
        const pathParts = currentLocation.split('/');
        if (pathParts[1] === 'location' && pathParts[2]) return decodeURIComponent(pathParts[2]);
        return null;
    };
    let locationTitle = getLocationName();

    const { data } = useFetchListingsByLocation(locationTitle);

    locationTitle = currentLocation.split('/')[1]

    if (token) {
        try {
            const decoded = jwtDecode(token);
            const role = decoded.user_role;
            isAdvancedUser = role === "admin" || role === "moderator";
        } catch (error) {
            console.error("Failed to decode token", error);
        }
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    // Updated Navigation Array with Dropdown Logic
    const navLinks = [
        { to: "/", label: "Home", icon: <LayoutDashboard size={20} /> },
        ...(token
            ? [{ to: "/contribution", label: "Contribute", icon: <Scroll size={20} /> }]
            : []),
        {
            to: "/budget-hub",
            label: "Budget Hub",
            icon: <Wallet size={20} />,
            isDropdown: true,
            subLinks: [
                { to: "/locations", label: "Groceries", icon: <Package size={18} /> },
                { to: "#", label: "Cuisines", icon: <Utensils size={18} />, disabled: true },
                { to: "/receipt", label: "Receipt", icon: <ShoppingCart size={18} /> },
            ]
        },
        { to: "/docs", label: "About", icon: <Info size={20} /> },
    ];

    const checkIsActive = (path) => {
        if (path === "/") return location.pathname === "/";
        if (path === "#") return false;
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && headerRef.current && !headerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // Listen for both clicks and touches
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            // Cleanup listeners
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

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

    const activeStyles = "!text-orange-500 font-bold";
    const inactiveStyles = "text-gray-600 dark:text-gray-300";
    const keepWidthStyles = "inline-flex flex-col after:content-[attr(data-text)] after:font-bold after:h-0 after:invisible after:overflow-hidden after:select-none";

    return (
        <header ref={headerRef} className="header relative flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-30">

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

            {/* Navigation Overlay */}
            <nav className={`
                absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-4 transition-all duration-200 origin-top
                md:static md:flex md:p-0 md:bg-transparent md:border-none md:shadow-none md:mt-0 md:backdrop-blur-none md:w-auto
                ${isOpen ? "scale-y-100 opacity-100 pointer-events-auto" : "scale-y-95 opacity-0 pointer-events-none md:scale-y-100 md:opacity-100 md:pointer-events-auto"}
            `}>
                <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
                    {/* Dynamic Links */}
                    {navLinks.map((link, index) => (
                        <li key={link.label} className={link.isDropdown ? "relative group" : ""}>
                            {link.label === "About"
                                ? (
                                    <a href="/docs/" className={`nav-link ${index !== 0 && 'max-md:border-t'} max-md:border-gray-500 text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 ${link.disabled && 'md:!text-gray-300 !text-gray-600'}`}>
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        title={link.disabled ? `Coming soon...` : undefined}
                                        className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${link.disabled && 'opacity-50 pointer-events-none'} ${checkIsActive(link.to) ? activeStyles : inactiveStyles}`}
                                        to={link.to}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="md:hidden">{link.icon}</span>
                                        <span data-text={link.label} className={`flex flex-row items-center ${keepWidthStyles}`}>
                                            <div className="flex items-center gap-2 inter-regular">
                                                {link.label}
                                                {/* Chevron Icon for Dropdown */}
                                                {link.isDropdown && <ChevronDown size={14} className="hidden md:block transition-transform duration-200 group-hover:rotate-180" />}
                                            </div>
                                        </span>
                                    </Link>
                                )
                            }

                            {/* Dropdown Menu (Desktop Hover / Mobile Inline) */}
                            {link.isDropdown && link.subLinks && (
                                <div className="
                                    md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:pt-4
                                    md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-30
                                ">
                                    {/* Invisible Bridge to keep hover active in the gap */}
                                    <div className="absolute top-0 left-0 w-full h-4 hidden md:block"></div>

                                    <ul className="
                                        flex flex-col gap-1 mt-2 ml-9 md:ml-0 md:mt-0
                                        md:bg-white md:dark:bg-gray-800 md:border md:border-gray-100 md:dark:border-gray-700 md:shadow-xl md:rounded-2xl md:p-2 md:w-48
                                    ">
                                        {link.subLinks.map((sub) => (
                                            <li key={sub.label}>
                                                <Link
                                                    title={sub.disabled ? `Coming soon...` : undefined}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-500 ${sub.disabled && 'opacity-50 pointer-events-none'} ${checkIsActive(sub.to) ? '!text-orange-500 font-bold bg-orange-50 dark:bg-gray-700/50' : inactiveStyles}`}
                                                    to={sub.to}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <span className="text-gray-400 dark:text-gray-500">{sub.icon}</span>
                                                    <span className="text-sm font-medium">{sub.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}

                    {/* Integrated Auth Section */}
                    {/* ... (The rest of your code remains identical) ... */}
                    <div className="flex flex-col md:flex-row md:border-l border-gray-200 dark:border-gray-600 mt-2 pt-2 md:mt-0 md:pt-0 md:pl-4 gap-1 md:gap-4">
                        <hr className="mb-2 md:hidden" />
                        <Link
                            className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 ${checkIsActive("/settings") ? activeStyles : inactiveStyles}`}
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={20} />
                            <span data-text="Settings" className={`md:hidden ${keepWidthStyles}`}>Settings</span>
                        </Link>

                        {!checkIsActive("/authenticate") && (!token ? (
                            <Link
                                className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors max-md:bg-orange-500 hover:bg-gray-200 md:hover:bg-transparent max-md:text-white hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-white ${checkIsActive("/authenticate") ? activeStyles : inactiveStyles}`}
                                to="/authenticate"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogIn size={20} />
                                <span data-text="Login" className={`md:hidden ${keepWidthStyles}`}>Login</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 font-medium ${checkIsActive("/profile") ? activeStyles : inactiveStyles}`}
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <CircleUserRound size={20} />
                                    <span data-text="Profile" className={`md:hidden ${keepWidthStyles}`}>Profile</span>
                                </Link>
                                {isAdvancedUser && (
                                    <Link
                                        className={`nav-link flex items-center gap-3 px-3 py-2.5 md:p-0 rounded-xl transition-colors hover:bg-gray-200 md:hover:bg-transparent hover:text-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-500 font-medium ${checkIsActive("/dev-mode") ? activeStyles : inactiveStyles}`}
                                        to="/dev-mode"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Computer size={20} />
                                        <span data-text="Dev Mode" className={`md:hidden ${keepWidthStyles}`}>Dev Mode</span>
                                    </Link>
                                )}
                            </>
                        ))}
                    </div>
                </ul>
            </nav>
        </header>
    );
};

Header.displayName = "Header"

export default React.memo(Header)
