import React, { useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import Cookies from "universal-cookie";
const cookies = new Cookies();
import './styles/App.scss'

import Homepage from './pages/Homepage.jsx';
import GroceryPage from "./pages/GroceryPage.jsx";
import Login from './components/Login.jsx'
import AuthComponent from './pages/AuthComponent.jsx';
import Header from "./components/Header.jsx";
import Cart from './components/Cart.jsx';
import NoPage from "./components/NoPage.jsx";

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
            <Route exact path="/groceries" element={<GroceryPage addToCart={addToCart} cartItems={cartItems} setCartItems={setCartItems}/>} />
            <Route exact path="/authenticate" element={<Login />} />
            <Route path="/dev-mode" element={token ? <AuthComponent /> : <Navigate to="/" replace />}/>
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpem={false} position='bottom-right'/>
      </QueryClientProvider>
    </>
  )
}

export default App
