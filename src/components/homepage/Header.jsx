import React, { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings, LogIn, LogOut, Menu, X, LayoutDashboard, Package, Utensils, Info, ShoppingCart, User, Computer, CircleUserRound, Scroll } from "lucide-react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

const cookies = new Cookies();


const Header = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const token = cookies.get("budgetbuddy_token")
    let isAdvancedUser = false;

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

    const showAuthLinks = useMemo(() =>
        !["/authenticate", "/dev-mode"].includes(pathname),
        [pathname]);

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

    return (
        <header className="header flex items-center justify-between px-6 py-2 dark:bg-gray-700 dark:border-b-gray-600">
            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={toggleMenu}>
                <Menu size={24} className="dark:text-white" />
            </button>


            <Link to="/" className="header__name" style={{ fontWeight: 700 }}>Budget Buddy</Link>

            {/* Quick Mobile Auth Icon */}
            <div className="flex gap-3">
                <Link to="/settings" className="md:hidden">
                    <Settings size={24} className="dark:text-white" />
                </Link>
                {!token ? (
                    <>
                        <Link to="/authenticate" className="md:hidden">
                            <LogIn size={24} className="dark:text-white" />
                        </Link>
                    </>
                ) : (
                    <>
                        {isAdvancedUser ? (
                            <Link to={token ? "/dev-mode" : "/authenticate"} className="md:hidden">
                                <User size={24} className="dark:text-white" />
                            </Link>
                        ) : (
                            <Link className="md:hidden" to="/profile">
                                <CircleUserRound size={24} className="dark:text-white" />
                            </Link>
                        )}
                    </>
                )}
            </div>

            {/* Navigation Overlay */}
            <nav className={`fixed md:static top-0 left-0 h-full md:h-auto w-[300px] md:w-auto bg-slate-800 md:bg-transparent transition-transform duration-300 z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

                <ul className="flex flex-col md:flex-row py-6 md:p-0 h-full md:items-center md:h-auto md:gap-6">
                    <button className="md:hidden self-end mb-4 mr-4" onClick={toggleMenu}><X color="white" /></button>

                    {navLinks.map((link, index) => (
                        <li key={link.label}>
                            <Link title={link.disabled && `Coming soon...`} className={`nav-link ${index !== 0 && 'max-md:border-t'} max-md:border-gray-500 text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 ${link.disabled && 'md:!text-gray-300 !text-gray-600'}`} to={link.to} onClick={toggleMenu}>
                                <span className="md:hidden">{link.icon}</span>
                                {link.label}
                            </Link>
                        </li>
                    ))}

                    {/* Integrated Auth Section */}
                    <div className="flex flex-col mt-auto md:flex-row md:border-t-0 md:border-l border-gray-600 pt-4 md:pt-0 md:pl-4 md:mt-0 md:items-center md:gap-4">
                        <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500" to="/settings" onClick={toggleMenu}>
                            <Settings size={20} /> <span className="md:hidden">Settings</span>
                        </Link>
                        {!token ? (
                            <>
                                <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500" to="/authenticate" onClick={toggleMenu}>
                                    <LogIn size={20} /> <span className="md:hidden">Login</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Toggle between Dev Mode and Profile based on role */}
                                {isAdvancedUser ? (
                                    <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 font-medium" to="/dev-mode" onClick={toggleMenu}>
                                        <Computer size={20} /> <span className="md:hidden">Dev Mode</span>
                                    </Link>
                                ) : (
                                    <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500 max-md:border-t max-md:border-gray-500 font-medium" to="/profile" onClick={toggleMenu}>
                                        <CircleUserRound size={20} /> <span className="md:hidden">Profile</span>
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
