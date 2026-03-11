import React, { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings, LogIn, LogOut, Menu, X, LayoutDashboard, Package, Utensils, Info, ShoppingCart, User } from "lucide-react";
import Cookies from "universal-cookie";
import PropTypes from "prop-types";

const cookies = new Cookies();

const navLinks = [
    {
        to: "/",
        label: "Home",
        icon: "/UI/dashboard-square-01-stroke-rounded-white.svg",
        alt: "Home Icon",
    },
    {
        to: "/locations",
        label: "Groceries",
        icon: "/UI/package-stroke-rounded-white.svg",
        alt: "Groceries Icon",
    },
    {
        to: "#",
        label: "Cuisines",
        icon: "/UI/noodles-stroke-rounded-white.svg",
        alt: "Cuisines Icon",
    },
    {
        to: "#",
        label: "About",
        icon: "/UI/information-circle-stroke-rounded-white.svg",
        alt: "About me Icon",
    },
    {
        to: "/receipt",
        label: "Cart",
        icon: "/UI/shopping-cart-02-stroke-rounded-white.svg",
        alt: "Cart Icon",
    },
];


const Header = ({ token }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const logout = () => {
        cookies.remove("TOKEN", { path: "/" });
        setIsOpen(false);
        navigate("/");
        window.location.reload(); // Ensures state clears
    };

    const showAuthLinks = useMemo(() =>
        !["/authenticate", "/dev-mode"].includes(pathname),
        [pathname]);

    const navLinks = [
        { to: "/", label: "Home", icon: <LayoutDashboard size={20} /> },
        { to: "/locations", label: "Groceries", icon: <Package size={20} /> },
        { to: "#", label: "Cuisines", icon: <Utensils size={20} /> },
        { to: "#", label: "About", icon: <Info size={20} /> },
        { to: "/receipt", label: "Cart", icon: <ShoppingCart size={20} /> },
    ];

    return (
        <header className="header flex items-center justify-between p-4 dark:bg-gray-700 dark:border-b-gray-600">
            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={toggleMenu}>
                <Menu className="dark:text-white" />
            </button>


            <Link to="/" className="header__name" style={{ fontWeight: 700 }}>Budget Buddy</Link>

            {/* Quick Mobile Auth Icon */}
            {showAuthLinks && (
                <Link to={token ? "/dev-mode" : "/authenticate"} className="md:hidden">
                    <User className="dark:text-white" />
                </Link>
            )}

            {/* Navigation Overlay */}
            <nav className={`fixed md:static top-0 left-0 h-full md:h-auto w-[300px] md:w-auto bg-slate-800 md:bg-transparent transition-transform duration-300 z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

                <ul className="flex flex-col md:flex-row p-6 md:p-0 h-full md:items-center md:h-auto md:gap-6">
                    <button className="md:hidden self-end mb-4" onClick={toggleMenu}><X color="white" /></button>

                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500" to={link.to} onClick={toggleMenu}>
                                <span className="md:hidden">{link.icon}</span>
                                {link.label}
                            </Link>
                        </li>
                    ))}

                    {/* Integrated Auth Section */}
                    <div className="flex flex-col mt-auto md:flex-row md:border-t-0 md:border-l border-gray-600 pt-4 md:pt-0 md:pl-4 md:mt-0 md:items-center md:gap-4">
                        {!token ? (
                            <>
                                <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500" to="/settings" onClick={toggleMenu}>
                                    <Settings size={20} /> <span className="md:hidden">Settings</span>
                                </Link>
                                <Link className="nav-link text-white md:text-black dark:md:text-white hover:text-orange-500 dark:hover:text-orange-500" to="/authenticate" onClick={toggleMenu}>
                                    <LogIn size={20} /> <span className="md:hidden">Login</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link text-orange-500 font-medium" to="/dev-mode" onClick={toggleMenu}>Dev Mode</Link>
                                <button className="flex items-center gap-2 text-white md:text-gray-400 hover:text-red-400" onClick={logout}>
                                    <LogOut size={20} /> <span className="md:hidden">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </ul>
            </nav>
        </header>
    );
};

// 👇 Give the component a name for debugging purposes
Header.displayName = "Header"

// 👇 Define PropTypes
Header.propTypes = {
    token: PropTypes.string,
}

export default React.memo(Header)
