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

import Header from "./components/Header.jsx"
import Homepage from "./pages/Homepage.jsx"

const LocationPage = lazy(() => import("./pages/LocationPage.jsx"))
const GroceryPage = lazy(() => import("./containers/GroceryPageContainer.jsx"))
const ReceiptPage = lazy(() => import("./pages/ReceiptPage.jsx"))
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"))
const NoPage = lazy(() => import("./pages/NoPage.jsx"))

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
            <Routes>
              <Route path="/" element={<Header token={token} />}>
                <Route index element={<Suspense fallback={renderLoading}><Homepage /></Suspense>} />
                <Route path="locations" element={<Suspense fallback={renderLoading}><LocationPage /></Suspense>} />
                <Route path="location/*" element={<Suspense fallback={renderLoading}><GroceryPage /></Suspense>} />
                <Route path="receipt" element={<Suspense fallback={renderLoading}><ReceiptPage /></Suspense>} />


                <Route path="authenticate" element={!token ? <Suspense fallback={renderLoading}><LoginPage debugMode={DEVELOPMENT} /></Suspense> : <Navigate to="/dev-mode" replace />} />
                <Route path="*" element={<NoPage />} />
              </Route>
              <Route path="/dev-mode" element={token ? <Suspense fallback={renderLoading}><ConsoleLayout debugMode={DEVELOPMENT} /></Suspense> : <Navigate to="/" replace />} >
                <Route index element={<Suspense fallback={renderLoading}><ConsoleDashboardPage debugMode={DEVELOPMENT} /></Suspense>} />
                <Route path="products" element={<Suspense fallback={renderLoading}><ConsoleProductsPage debugMode={DEVELOPMENT} /></Suspense>} />
                <Route path="locations" element={<Suspense fallback={renderLoading}><ConsoleLocationsPage debugMode={DEVELOPMENT} /></Suspense>} />
                <Route path="listings" element={<Suspense fallback={renderLoading}><ConsoleListingsPage debugMode={DEVELOPMENT} /></Suspense>} />
                <Route path='products/edit/*' element={<Suspense fallback={renderLoading}><CRUDPage debugMode={DEVELOPMENT} /></Suspense>} />
                <Route path='products/new' element={<Suspense fallback={renderLoading}><CRUDPage debugMode={DEVELOPMENT} /></Suspense>} />
              </Route>
            </Routes>
          </Provider>
          <SpeedInsights />
        </BrowserRouter>
        {DEVELOPMENT ? <ReactQueryDevtools initialIsOpen={false} position='bottom-right' /> : <></>}
      </QueryClientProvider>
    </>
  )
}

export default App
