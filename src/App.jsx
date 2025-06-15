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
const Login = lazy(() => import("./components/Login.jsx"))
const CRUDInterface = lazy(() => import("./pages/Console.jsx"))
const CRUDProduct = lazy(() => import('./components/CRUD.jsx'));
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
          <Header token={token} />
            <Suspense fallback={renderLoading}>
              <Provider store={store}>
                <Routes>
                  <Route exact path="/" element={<Homepage />} />
                  <Route exact path="/locations" element={<LocationPage />} />
                  <Route exact path="/location/*" element={<GroceryPage />} />
                  <Route exact path="/receipt" element={<ReceiptPage />} />
                  <Route path="*" element={<NoPage />} />

                  <Route exact path="/authenticate" element={<Login debugMode={DEVELOPMENT} />} />
                  <Route path="/dev-mode" element={token ? <CRUDInterface debugMode={DEVELOPMENT} /> : <Navigate to="/" replace />} />
                  <Route path='/groceries/edit-item' element={<CRUDProduct debugMode={DEVELOPMENT} />} />
                  <Route path='/groceries/add-item' element={<CRUDProduct debugMode={DEVELOPMENT} />} />
                </Routes>
              </Provider>
            </Suspense>
          <SpeedInsights />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpem={false} position='bottom-right' />
      </QueryClientProvider>
    </>
  )
}

export default App
