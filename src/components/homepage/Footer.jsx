import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResultAsync } from 'neverthrow';
import { Heart, Github, Linkedin, Facebook } from 'lucide-react';
import axios from 'axios';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;

const Footer = () => {
    // State to track the server health: 'checking' | 'operational' | 'offline'
    const [systemStatus, setSystemStatus] = useState('checking');

    const handleScroll = (e, href) => {
        // Only intercept if it's a hash link AND we are currently on the homepage
        if (href.startsWith('/#') && window.location.pathname === '/') {
            e.preventDefault();
            const id = href.substring(2); // removes the '/#'
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // Optional: update the URL so the hash shows in the address bar
                window.history.pushState(null, '', href);
            }
        }
    };

    useEffect(() => {
        // Ping the backend root to check health
        ResultAsync.fromPromise(
            axios.get(DEVELOPMENT
                ? `http://${LOCALHOST}:5000/`
                : "https://iliganproductprice-mauve.vercel.app/"),
            (error) => error // Catch network errors (e.g., server is completely down)
        )
            .map((response) => response.data)
            .match(
                (data) => {
                    // Check if the payload explicitly says healthy === true
                    console.log({ data })
                    if (data && data.healthy === true) {
                        setSystemStatus('operational');
                    } else {
                        setSystemStatus('offline');
                    }
                },
                (error) => {
                    // If the promise fails (500 error, CORS, or server sleep), mark as offline
                    console.error("System check failed:", error.message);
                    setSystemStatus('offline');
                }
            );
    }, []);

    const footerLinks = {
        product: [
            { name: 'Features', href: '/#features' },
            { name: 'How It Works', href: '/#how-it-works' },
        ],
        company: [
            { name: 'Developer', href: 'https://chriscent.is-a.dev/' },
        ],
        resources: [
            { name: 'Help Center', href: 'https://github.com/KishonShrill/BudgetBuddy-IliganCity/discussions' },
            { name: 'Budgeting Tips', href: '#' },
            { name: 'Community', href: '#' },
            { name: 'Blog', href: '#' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-of-service' },
            { name: 'Accessibility', href: '#' }
        ]
    };

    const socialLinks = [
        { icon: Facebook, href: 'https://www.facebook.com/Perseque/', label: 'Facebook' },
        { icon: Github, href: 'https://github.com/KishonShrill', label: 'GitHub' },
        { icon: Linkedin, href: 'https://ph.linkedin.com/in/chriscent-louis-june-pingol', label: 'LinkedIn' }
    ];

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-6 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-6 group">
                            <img src="/budgetbuddy.svg" />
                            <span className="text-xl font-bold">Budget Buddy</span>
                        </div>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering smart financial decisions through free, accessible budgeting tools. Join thousands of users who have taken control of their shopping habits.
                        </p>

                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
                            <Heart className="w-4 h-4 text-[#ee4d2d]" />
                            <span>Made with love as a non-profit initiative</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <Link
                                    key={index}
                                    to={social.href}
                                    target='_blank'
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#ee4d2d] transition-colors duration-300 group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4 text-white">Product</h3>
                            <ul className="space-y-3">
                                {footerLinks.product.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.href}
                                            onClick={(e) => handleScroll(e, link.href)}
                                            className="text-gray-400 hover:text-[#ee4d2d] transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-white">Author</h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-[#ee4d2d] transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-white">Resources</h3>
                            <ul className="space-y-3">
                                {footerLinks.resources.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-[#ee4d2d] transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-white">Legal</h3>
                            <ul className="space-y-3">
                                {footerLinks.legal.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-[#ee4d2d] transition-colors duration-300 hover:translate-x-1 inline-block"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get budgeting tips and product updates delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#ee4d2d] transition-colors duration-300"
                />
              </div>
              <button className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-gray-400 text-sm max-md:text-center">
                            <p>© 2024 Budget Buddy. All rights reserved.</p><p>Built with ❤️ for the community.</p>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end max-md:space-x-3 text-sm text-gray-400">
                            <span className="flex items-center">
                                {/* Dynamic Dot Color */}
                                <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus === 'operational' ? 'bg-green-500' :
                                    systemStatus === 'offline' ? 'bg-red-500' :
                                        'bg-yellow-500 animate-pulse'
                                    }`}></div>

                                {/* Dynamic Text */}
                                {systemStatus === 'operational' && "All systems operational"}
                                {systemStatus === 'offline' && "Systems offline"}
                                {systemStatus === 'checking' && "Checking systems..."}
                            </span>
                            <span>Version 2.1.3</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
