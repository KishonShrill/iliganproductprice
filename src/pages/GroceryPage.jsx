import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import useFetchProductsByLocation from '../hooks/useFetchProductsByLocation'
import Cart from "../components/Cart";
import ProductCard from '../components/ProductCard';
import '../styles/grocery.scss'


function GroceryPage({ cartItems, addNewCartItem, removeCartItem }) {
  document.title = "Grocery List - Budget Buddy"
  
  const [reciept, setReceipt] = useState("100%")
  const [active, setActive] = useState(false)
  // const storedCart = localStorage.getItem('cart');
  // const [cart, setCart] = useState(() => {
  //   return storedCart ? JSON.parse(storedCart) : {};
  // })

  // cartItems = JSON.parse(storedCart)
  // console.log(JSON.stringify(cartItems))

  const cartRef = useRef(null)

  // Fetch Location and put into useHook
  const path = window.location.pathname;  // "/locations/link"
  const segments = path.split('/');  // ["", "locations", "link"]
  const location = segments[segments.length - 1];  // "link"

  const { isLoading, data, isError, error, isFetching } = useFetchProductsByLocation(location)
  // console.log({ isLoading, isFetching })

  
  // Update Cart for localStorage to persist
  useEffect(() => {
    if (cartItems?.cart) {
      localStorage.setItem('cart', JSON.stringify(cartItems.cart));
    } else {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  

  // Remove Item from <Cart /> on Element Click
  useEffect(() => {
    if (cartRef.current) {
      cartRef.current.onItemClick = (productId) => {
        // setCart(prev => {
        //   const updated = { ...prev };
        //   if (updated[productId].quantity > 1) {
        //     updated[productId].quantity -= 1;
        //   } else {
        //     delete updated[productId];
        //   }
        //   return updated;
        // });
        removeCartItem(productId);
      };
    }
  }, [cartRef.current])


  // Add item on <Cart /> on Button Click on <ProductCard />
  const handleClick = useCallback((el) => {
    const productId = el.dataset.productId;
    const productName = el.dataset.productName;
    const productPrice = parseFloat(el.dataset.productPrice);
    const productLocation = el.dataset.productLocation;

    console.log(`${productId} | ${productName} | ${productPrice} | ${productLocation}`)
    // setCart(prevCart => {
    //   const updatedCart = {...prevCart}

    //   if (updatedCart[productId]) {
    //     updatedCart[productId].quantity += 1;
    //   } else {
    //     updatedCart[productId] = {
    //       name: productName,
    //       price: productPrice,
    //       quantity: 1
    //     };
    //   }
    //   return updatedCart;
    // });
    addNewCartItem(productId, productName, productPrice, productLocation);
  }, []);


  function openReciept() {
    setActive((prev) => !prev)
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
      <Cart ref={cartRef} storage={cartItems} onRemove={removeCartItem} reciept={reciept}/>
      <button className={`cart-btn phone fixed ${active ? 'active' : ''}`} onClick={openReciept}>
        {active 
          ? <img src="/UI/shopping-cart-02-stroke-rounded-white.svg" alt="My cart button" /> 
          : <img src="/UI/shopping-cart-02-stroke-rounded.svg" alt="My cart button" />
        }
      </button>
    </section>
  );
}

export default GroceryPage