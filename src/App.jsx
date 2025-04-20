import { scan } from 'react-scan'

// --- React Query Setup ---
scan({enabled: import.meta.env.VITE_SCAN === "true",});

import React, { useState, lazy } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import Cookies from "universal-cookie";
const cookies = new Cookies();
import './styles/App.scss'

import Header from "./components/Header.jsx";
import Homepage from './pages/Homepage.jsx';

import Login from './components/Login.jsx'
import AuthComponent from './pages/AuthComponent.jsx';

const GroceryPage = lazy(() => import("./pages/GroceryPage.jsx"));
const NoPage = lazy(() => import("./components/NoPage.jsx"));

const queryClient = new QueryClient();

function App() {
  const [cartItems, setCartItems] = useState([]);
  const token = cookies.get("TOKEN");

  function addToCart(product) {
    setCartItems([...cartItems, product]);
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header token={token} />
          <Routes>
            <Route exact path="/" element={<Homepage />} />
            <Route exact path="/groceries" element={<GroceryPage/>} />
            <Route exact path="/authenticate" element={<Login />} />
            <Route path="/dev-mode" element={token ? <AuthComponent /> : <Navigate to="/" replace />}/>
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
        {/* <ReactQueryDevtools initialIsOpem={false} position='bottom-right'/> */}
      </QueryClientProvider>
    </>
  )
}

export default App
