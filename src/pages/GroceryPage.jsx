import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import useFetchProductsByLocation from '../hooks/useFetchProductsByLocation'
import Cart from "../components/Cart";
import ProductCard from '../components/ProductCard';
import '../styles/grocery.scss'


export default function GroceryPage() {
  document.title = "Grocery List - Budget Buddy"
  
  const path = window.location.pathname;  // "/locations/link"
  const segments = path.split('/');  // ["", "locations", "link"]
  const location = segments[segments.length - 1];  // "link"

  const { isLoading, data, isError, error, isFetching } = useFetchProductsByLocation(location)
  // console.log({ isLoading, isFetching })

  const [reciept, setReceipt] = useState("100%")
  
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

  function openReciept() {
    if (reciept === "100%") setReceipt("0%")
    if (reciept === "0%") setReceipt("100%")
  }

  // Display when fetched elements are empty or is loading...
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading<span className="animated-dots"></span></h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  // console.log("Data:" + data.data)

  return (
    <section className="grocery">
      <main className='product-container' id="productContainer">
        <Suspense fallback={(
          <main className='errorDisplay'>
            <h2>Loading<span className="animated-dots"></span></h2>
          </main>
        )}>
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
        </Suspense>
      </main>
      <Cart ref={cartRef} cart={cart} setCart={setCart} reciept={reciept}/>
      <button className="cart-btn phone fixed" onClick={openReciept}>
        <img src="/UI/shopping-cart-02-stroke-rounded.svg" alt="My cart button" />
      </button>
    </section>
  );
}