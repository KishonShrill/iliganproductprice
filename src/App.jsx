import { scan } from 'react-scan'

// --- React Query Setup ---
scan({ enabled: import.meta.env.VITE_SCAN === "true", });

import React, { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import { SpeedInsights } from "@vercel/speed-insights/react"; // <-- add this at the top

import Cookies from "universal-cookie";
const cookies = new Cookies();
import './styles/App.scss'

import Header from "./components/Header.jsx"
import Homepage from "./pages/Homepage.jsx"
const GroceryPage = lazy(() => import("./pages/GroceryPage.jsx"))
const ReceiptPage = lazy(() => import("./pages/ReceiptPage.jsx"))

const Login = lazy(() => import("./components/Login.jsx"))
const AuthComponent = lazy(() => import("./pages/AuthComponent.jsx"))
const CreateItem = lazy(() => import("./components/CreateItem.jsx"))
const NoPage = lazy(() => import("./pages/NoPage.jsx"))


const queryClient = new QueryClient();

function App() {
  const token = cookies.get("TOKEN");

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header token={token} />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route exact path="/" element={<Homepage />} />
              <Route exact path="/groceries" element={<GroceryPage />} />
              <Route exact path="/receipt" element={<ReceiptPage />} />

              <Route exact path="/authenticate" element={<Login />} />
              <Route path="/dev-mode" element={token ? <AuthComponent /> : <Navigate to="/" replace />} />
              <Route path='/groceries/add-item' element={<CreateItem />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </Suspense>
          <SpeedInsights />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpem={false} position='bottom-right' />
      </QueryClientProvider>
    </>
  )
}

export default App
