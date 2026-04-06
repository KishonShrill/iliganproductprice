// --- React Query Setup ---
if (import.meta.env.VITE_SCAN === "true") {
    import('react-scan').then(({ scan }) => {
        scan({ enabled: true });
    });
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './redux/store/store.js';

import MainLayout from "./components/MainLayout.jsx"
import Homepage from "./pages/Homepage.jsx"

const LocationPage = lazy(() => import("./pages/LocationPage.jsx"))
const GroceryPage = lazy(() => import("./containers/GroceryPageContainer.jsx"))
const ReceiptPage = lazy(() => import("./pages/ReceiptPage.jsx"))
const SettingsPage = lazy(() => import("./pages/Settings.jsx"))
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"))
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"))
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage.jsx"))
const TermsOfServicePage = lazy(() => import("./pages/TermsOfService.jsx"))
const NotFound = lazy(() => import("./pages/NotFound.jsx"))

const ConsoleLayout = lazy(() => import("./components/console/ConsoleLayout.jsx"))
const ConsoleDashboardPage = lazy(() => import("./pages/ConsoleDashboard.jsx"))
const ConsoleProductsPage = lazy(() => import("./pages/ConsoleProductsPage.jsx"))
const ConsoleListingsPage = lazy(() => import("./pages/ConsoleListingsPage.jsx"))
const ConsoleLocationsPage = lazy(() => import("./pages/ConsoleLocationsPage.jsx"))
const ConsoleUsersPage = lazy(() => import("./pages/ConsoleUsersPage.jsx"))
const ProductForm = lazy(() => import('@/pages/console/ConsoleProductForm.jsx'));
const ListingForm = lazy(() => import('@/pages/console/ConsoleListingForm.jsx'))

const queryClient = new QueryClient();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";

import './styles/toast.scss'

function App() {

    return (
        <>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Provider store={store}>
                            <Suspense fallback={
                                <div className='errorDisplay'>
                                    <h2>Loading<span className="animated-dots"></span></h2>
                                </div>
                            }>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={<MainLayout />}
                                    >
                                        <Route index element={<Homepage />} />
                                        <Route path="locations" element={<LocationPage />} />
                                        <Route path="location/*" element={<GroceryPage />} />
                                        <Route path="receipt" element={<ReceiptPage />} />
                                        <Route path="settings" element={<SettingsPage />} />
                                        <Route path="profile" element={<ProfilePage />} />
                                        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                                        <Route path="terms-of-service" element={<TermsOfServicePage />} />

                                        <Route
                                            path="authenticate"
                                            element={<LoginPage debugMode={DEVELOPMENT} />}
                                        />
                                        <Route path="*" element={<NotFound />} />
                                    </Route>

                                    <Route
                                        path="/dev-mode"
                                        element={<ConsoleLayout debugMode={DEVELOPMENT} />}
                                    >
                                        <Route index element={<ConsoleDashboardPage debugMode={DEVELOPMENT} />} />
                                        <Route path="products" element={<ConsoleProductsPage debugMode={DEVELOPMENT} />} />
                                        <Route path="locations" element={<ConsoleLocationsPage debugMode={DEVELOPMENT} />} />
                                        <Route path="listings" element={<ConsoleListingsPage debugMode={DEVELOPMENT} />} />
                                        <Route path="users" element={<ConsoleUsersPage debugMode={DEVELOPMENT} />} />
                                        <Route path="products/*" element={<ProductForm debugMode={DEVELOPMENT} />} />
                                        <Route path="listings/*" element={<ListingForm debugMode={DEVELOPMENT} />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </Provider>
                        <SpeedInsights />
                    </BrowserRouter>
                    {DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
                </QueryClientProvider >
            </HelmetProvider>
        </>
    )
}

export default App
