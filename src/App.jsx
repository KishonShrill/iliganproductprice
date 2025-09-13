// --- React Query Setup ---
if (import.meta.env.VITE_SCAN === "true") {
  import('react-scan').then(({ scan }) => {
    scan({ enabled: true });
  });
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import { SpeedInsights } from "@vercel/speed-insights/react"; // <-- add this at the top
import { Provider } from 'react-redux';
import Cookies from "universal-cookie";
import store from './redux/store/store.js';

import HomepageLayout from "./components/HomepageLayout.jsx"
import Homepage from "./pages/Homepage.jsx"

const LocationPage = lazy(() => import("./pages/LocationPage.jsx"))
const GroceryPage = lazy(() => import("./containers/GroceryPageContainer.jsx"))
const ReceiptPage = lazy(() => import("./pages/ReceiptPage.jsx"))
const SettingsPage = lazy(() => import("./pages/Settings.jsx"))
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"))
const NotFound = lazy(() => import("./pages/NotFound.jsx"))

const ConsoleLayout = lazy(() => import("./components/console/ConsoleLayout.jsx"))
const ConsoleDashboardPage = lazy(() => import("./pages/ConsoleDashboard.jsx"))
const ConsoleProductsPage = lazy(() => import("./pages/ConsoleProductsPage.jsx"))
const ConsoleListingsPage = lazy(() => import("./pages/ConsoleListingsPage.jsx"))
const ConsoleLocationsPage = lazy(() => import("./pages/ConsoleLocationsPage.jsx"))
const CRUDPage = lazy(() => import('./pages/console/ConsoleProductForm.jsx'));

const queryClient = new QueryClient();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const cookies = new Cookies();
const token = cookies.get("TOKEN");

function App() {

  const renderLoading = () => {
    return (
      <div className='errorDisplay'>
        <h2>Loading<span className="animated-dots"></span></h2>
      </div>
    )
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Provider store={store}>
            <Suspense fallback={renderLoading}>
              <Routes>
                <Route path="/" element={<HomepageLayout token={token} />}>
                  <Route index element={<Homepage />} />
                  <Route path="locations" element={<LocationPage />} />
                  <Route path="location/*" element={<GroceryPage />} />
                  <Route path="receipt" element={<ReceiptPage />} />
                  <Route path="settings" element={<SettingsPage />} />

                  <Route
                    path="authenticate"
                    element={
                      !token ? <LoginPage debugMode={DEVELOPMENT} /> : <Navigate to="/dev-mode" replace />
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
      
                <Route
                  path="/dev-mode"
                  element={
                    token ? <ConsoleLayout debugMode={DEVELOPMENT} /> : <Navigate to="/" replace />
                  }
                >
                  <Route index element={<ConsoleDashboardPage debugMode={DEVELOPMENT} />} />
                  <Route path="products" element={<ConsoleProductsPage debugMode={DEVELOPMENT} />} />
                  <Route path="locations" element={<ConsoleLocationsPage debugMode={DEVELOPMENT} />} />
                  <Route path="listings" element={<ConsoleListingsPage debugMode={DEVELOPMENT} />} />
                  <Route path="products/edit/*" element={<CRUDPage debugMode={DEVELOPMENT} />} />
                  <Route path="products/new" element={<CRUDPage debugMode={DEVELOPMENT} />} />
                </Route>
              </Routes>
            </Suspense>
          </Provider>
          <SpeedInsights />
        </BrowserRouter>
        {DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
      </QueryClientProvider>
    </>
  )
}

export default App
