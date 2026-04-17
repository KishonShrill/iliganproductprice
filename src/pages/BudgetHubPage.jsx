import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { User, MapPin, Utensils, Package, ReceiptText, ServerCrash, Lock } from "lucide-react";
import useFetchListings from "@/hooks/useFetchListings";
import Cookies from "universal-cookie";

import ProductCard from "@/components/ProductCard";

import '../styles/grocery.scss'

const cookies = new Cookies();

const BudgetHub = () => {
    const navigate = useNavigate();
    const token = cookies.get("budgetbuddy_token")
    const userData = token ? jwtDecode(token) : { username: "Guest" };

    const { data, isLoading, isError } = useFetchListings(token, 10)

    const recentListings = data;

    return (
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col p-4 sm:p-6 lg:p-10">

            {/* Welcome Section */}
            <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 sm:p-8 text-white shadow-lg">
                <div>
                    <p className="text-sm sm:text-base font-medium opacity-90">Welcome back,</p>
                    <h1 className="text-xl sm:text-4xl font-black tracking-tight">{userData.username}!</h1>
                </div>
                <Link to='/profile' className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-inner">
                    {userData.profile_picture ? (
                        <img src={userData.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User size={32} className="text-orange-500" />
                    )}
                </Link>
            </div>

            {/* Quick Actions (Three Buttons) */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-6">
                <button
                    onClick={() => navigate('/locations')}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="mb-2 sm:mb-3 rounded-full bg-blue-100 p-3 sm:p-4 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                        <MapPin size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-gray-800">Groceries</span>
                </button>

                <button
                    onClick={() => navigate("#")}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="mb-2 sm:mb-3 rounded-full bg-green-100 p-3 sm:p-4 text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <Utensils size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-gray-800">Cuisines</span>
                </button>

                <button
                    onClick={() => navigate('/receipt')}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="mb-2 sm:mb-3 rounded-full bg-purple-100 p-3 sm:p-4 text-purple-500 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                        <ReceiptText size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-gray-800">Receipt</span>
                </button>
            </div>

            {/* Top 10 Newest Listings */}
            <div className="mt-8 sm:mt-12 flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">Newest Additions</h2>
                    <button onClick={() => navigate('/locations')} className="text-sm font-bold text-orange-500 hover:text-orange-600 hover:underline">
                        View All Locations
                    </button>
                </div>

                {/* State 0: Not Logged In */}
                {!token ? (
                    <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                            <Lock size={32} />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">Sign in to view listings</h3>
                        <p className="mb-6 max-w-sm text-sm text-gray-500">Create an account or log in to see the newest product additions and start budgeting.</p>
                        <button
                            onClick={() => navigate('/authenticate')}
                            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
                        >
                            Sign In / Register
                        </button>
                    </div>
                ) : (
                    <>
                        {/* State 1: Loading (Skeleton UI) */}
                        {isLoading && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse">
                                        <div className="h-32 w-full rounded-xl bg-gray-200"></div>
                                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* State 2: Error (Server down or no internet) */}
                        {isError && !isLoading && (
                            <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-12 text-center text-red-500">
                                <ServerCrash size={48} className="mb-4 text-red-400" />
                                <h3 className="mb-1 text-lg font-bold">Failed to load listings</h3>
                                <p className="text-sm text-red-400">Please check your network connection or try again later.</p>
                            </div>
                        )}

                        {/* State 3: Success but Empty */}
                        {!isLoading && !isError && (!recentListings || recentListings.length === 0) && (
                            <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
                                <Package size={48} className="mb-4 text-gray-300" />
                                <h3 className="mb-1 text-lg font-bold">No products found</h3>
                                <p className="text-sm">We couldn't find any recent additions right now.</p>
                            </div>
                        )}

                        {/* State 4: Success with Data */}
                        {!isLoading && !isError && recentListings?.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {recentListings.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        item={product}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
                <p>© 2026 Budget Buddy. All rights reserved.</p>
                <div className="mt-3 flex justify-center gap-6">
                    <button onClick={() => navigate('privacy')} className="font-medium hover:text-orange-500 hover:underline">Privacy Policy</button>
                    <button onClick={() => navigate('terms')} className="font-medium hover:text-orange-500 hover:underline">Terms of Service</button>
                </div>
            </footer>
        </div >
    );
};

export default BudgetHub;
