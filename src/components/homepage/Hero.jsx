import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Shield, Github, Facebook, Twitter, Check, Share2, X, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Hero = () => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const appUrl = "https://productprice-iligan.vercel.app/";
    const shareMessage = "Check out Budget Buddy! It's a smart shopping tool to track and compare grocery prices in Iligan City. 🛒📉";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`, '_blank');
    };

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareMessage)}`, '_blank');
    };

    return (
        <section className="flex items-center pt-12 pb-16 bg-orange-50 dark:from-gray-800 dark:to-gray-800 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 max-md:gap-6 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        <div className="select-none inline-flex items-center bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 dark:from-white dark:to-orange-100 px-4 py-2 rounded-full text-[#ee4d2d] font-medium text-sm mb-6 hover:scale-105 transition-transform duration-300">
                            <Shield className="w-4 h-4 mr-2" />
                            100% Free • Non-Profit Initiative
                        </div>

                        <h1 className="flex flex-wrap justify-center lg:justify-start gap-x-2 inter-black text-shadow-xl text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-gray-50 mb-6 leading-tight">
                            Shop Smarter,
                            <span className="inter-black text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]">
                                Spend Less
                            </span>
                        </h1>

                        <p className="text-lg max-md:text-base text-gray-600 dark:text-slate-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Track your shopping cart total in real-time before checkout. Budget Buddy helps you make informed decisions and stick to your budget effortlessly.
                        </p>

                        <div className="flex flex-col max-md:px-4 sm:flex-row gap-4 items-center justify-center lg:justify-start">
                            <Link to="/budget-hub" className="flex items-center w-fit bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 group">
                                Start Budgeting
                                <ShoppingCart className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>

                            <a href="https://github.com/KishonShrill/BudgetBuddy-IliganCity" target='_blank' className="flex items-center w-fit border-2 border-[#ee4d2d] text-[#ee4d2d] px-8 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:bg-[#ee4d2d] hover:text-white transition-all duration-300 hover:scale-105">
                                Github
                                <Github className='w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300' />
                            </a>

                            {/* --- NEW SHARE BUTTON --- */}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center w-fit border-2 border-gray-300 text-gray-600 dark:border-gray-500 dark:text-gray-300 px-6 py-4 max-md:py-3 rounded-full font-semibold text-lg hover:border-[#ee4d2d] hover:text-[#ee4d2d] dark:hover:border-[#ee4d2d] dark:hover:text-[#ee4d2d] transition-all duration-300 hover:scale-105"
                            >
                                Share
                                <Share2 className='w-5 h-5 ml-2 inline' />
                            </button>
                        </div>

                        {/* Stats */}
                        {/* <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                            {[
                                { number: '50K+', label: 'Happy Users' },
                                { number: '$2M+', label: 'Money Saved' },
                                { number: '4.9★', label: 'User Rating' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group cursor-pointer">
                                    <div className="text-2xl font-bold text-gray-900 group-hover:text-[#ee4d2d] transition-colors duration-300">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div> */}
                    </div>

                    {/* Right Content - Mockup */}
                    <div className="relative">
                        <div className="select-none relative z-10 bg-white dark:bg-gray-700 dark:border dark:border-gray-600 rounded-3xl shadow-2xl max-md:m-4 max-md:p-4 p-8 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] rounded-2xl p-6 mb-3 md:mb-6">
                                <div className="flex items-center justify-between text-white mb-4">
                                    <h3 className="text-lg font-semibold">Shopping Cart</h3>
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold text-white">₱127.50</div>
                                <div className="text-orange-100 text-sm">Budget: ₱150.00</div>
                            </div>

                            <div className="space-y-2 md:space-y-4">
                                {[
                                    { name: 'Catsan Light Cat Litter 3L', price: '₱159.8' },
                                    { name: 'Slurpee Large', price: '₱40' },
                                    { name: 'Ottogi Cheese Ramen Pouch 111g', price: '₱89' },
                                    { name: 'Century Tuna Flakes in Oil 180g', price: '₱52' }
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-2 justify-between items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                        <span className="text-gray-700 dark:text-gray-50 text-sm">{item.name}</span>
                                        <span className="font-semibold text-[#ee4d2d]">{item.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 md:mt-6 p-4 bg-green-50 dark:bg-gray-800 border border-green-200 rounded-lg">
                                <div className="text-green-800 dark:text-green-500 font-medium">✓ Under Budget!</div>
                                <div className="text-green-600 text-sm">You have ₱22.50 remaining</div>
                            </div>
                        </div>

                        {/* Background Elements */}
                        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-[#ee4d2d]/20 to-orange-200/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-orange-200/20 to-[#ee4d2d]/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>

            {/* --- SHARE MODAL OVERLAY --- */}
            {isShareModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsShareModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing modal
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsShareModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Budget Buddy</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scan the QR code or share the link below!</p>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                                <QRCodeSVG
                                    value={appUrl}
                                    size={180}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"Q"}
                                />
                            </div>
                        </div>

                        {/* Link Copy Box */}
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-6 border border-gray-200 dark:border-gray-600">
                            <input
                                type="text"
                                readOnly
                                value={appUrl}
                                className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none px-2 truncate"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-200" />}
                            </button>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={shareToFacebook}
                                className="flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg font-medium transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                                Facebook
                            </button>
                            <button
                                onClick={shareToTwitter}
                                className="flex items-center justify-center gap-2 py-2.5 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white rounded-lg font-medium transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                                Twitter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Hero;
