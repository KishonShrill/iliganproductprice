import React, { useCallback, useEffect, useRef, useState } from "react";
import useProductsData from '../hooks/useProductsData';
import Cart from "../components/Cart";
import ProductCard from '../components/ProductCard';

export default function GroceryPage() {
  useEffect(() => {
    document.title = "Grocery List - Budget Buddy"
    import('../styles/grocery.scss')
  }, [])

  const { isLoading, data, isError, error, isFetching } = useProductsData()
  console.log({ isLoading, isFetching })
  
  // Initialize Cart for localStorage to persist
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : {};
  })
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // cartRef from <Cart />
  const cartRef = useRef(null)

  // Remove Item from <Cart /> on Element Click
  useEffect(() => {
    if (cartRef.current) {
      cartRef.current.onItemClick = (productId) => {
        setCart(prev => {
          const updated = { ...prev };
          if (updated[productId].quantity > 1) {
            updated[productId].quantity -= 1;
          } else {
            delete updated[productId];
          }
          return updated;
        });
      };
    }
  }, [cartRef.current])

  // Add item on <Cart /> on Button Click on <ProductCard />
  const handleClick = useCallback((el) => {
    const productId = el.dataset.productId;
    const productName = el.dataset.productName;
    const productPrice = parseFloat(el.dataset.productPrice);

    // Check if product is already in the cart
    setCart(prevCart => {
      const updatedCart = {...prevCart}

      if (updatedCart[productId]) {
        updatedCart[productId].quantity += 1;
      } else {
        updatedCart[productId] = {
          name: productName,
          price: productPrice, // Store the original price
          quantity: 1
        };
      }
      return updatedCart;
    });
  }, []);

  // Display when fetched elements are empty or is loading...
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading...</h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  return (
    <section className="grocery">
      <main className='product-container' id="productContainer">
        {data
        ? data?.data.map((item) => (
          <ProductCard 
            key={item._id} 
            item={item} 
            onAdd={(event) => handleClick(event.currentTarget)} 
          />
        ))
        : <h2>No products found...</h2>
        }
      </main>
      <Cart ref={cartRef} cart={cart} setCart={setCart}/>
    </section>
  );
}