import { scan } from 'react-scan'

// --- React Query Setup ---
scan({ enabled: import.meta.env.VITE_SCAN === "true", });

import React, { useState, lazy, Suspense, useMemo } from 'react'
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
const ConsolePage = lazy(() => import("./pages/Console.jsx"))
const CRUDPage = lazy(() => import('./components/CRUD.jsx'));
const NoPage = lazy(() => import("./pages/NoPage.jsx"))

const queryClient = new QueryClient();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const cookies = new Cookies();
const token = cookies.get("TOKEN");

function App() {

  // const routes = useMemo(() => (
    
  // ), [token, DEVELOPMENT]);

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
                <Route index element={<Homepage />} />
                <Route path="locations" element={<Suspense fallback={renderLoading}><LocationPage /></Suspense>} />
                <Route path="location/*" element={<Suspense fallback={renderLoading}><GroceryPage /></Suspense>} />
                <Route path="receipt" element={<Suspense fallback={renderLoading}><ReceiptPage /></Suspense>} />

                <Route path="dev-mode" element={token ? <Suspense fallback={renderLoading}><ConsolePage debugMode={DEVELOPMENT} /></Suspense> : <Navigate to="/" replace />} />
                <Route path='groceries/edit-item' element={token ? <CRUDPage debugMode={DEVELOPMENT} /> : <Navigate to="/" replace />} />
                <Route path='groceries/add-item' element={token ? <CRUDPage debugMode={DEVELOPMENT} /> : <Navigate to="/" replace />} />

                <Route path="authenticate" element={!token ? <Suspense fallback={renderLoading}><LoginPage debugMode={DEVELOPMENT} /></Suspense> : <Navigate to="/dev-mode" replace />} />
                <Route path="*" element={<NoPage />} />
              </Route>
            </Routes>
          </Provider>
          <SpeedInsights />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpem={false} position='bottom-right' />
      </QueryClientProvider>
    </>
  )
}

export default App
