import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import useFetchListingsByLocation from '../hooks/useFetchListingsByLocation'
import Cart from "../components/Cart";
import ProductCard from '../components/ProductCard';
import Searchbar from "../components/Searchbar";
import BottomNavigation from "../components/BottomNavigation";

import '../styles/grocery.scss'


function GroceryPage({ cartItems, addNewCartItem, removeCartItem }) {
  document.title = "Grocery List - Budget Buddy"
  
  const [reciept, setReceipt] = useState("100%")
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState('')

  const cartRef = useRef(null)
  const searchbarRef = useRef(null)

  // Fetch Location and put into useHook
  const path = window.location.pathname;  // "/locations/link"
  const segments = path.split('/');  // ["", "locations", "link"]
  const location = segments[segments.length - 1];  // "link"

  const { isLoading, data, isError, error, isFetching } = useFetchListingsByLocation(location)

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
    addNewCartItem(productId, productName, productPrice, productLocation);
  }, []);

  const searchTerm = (search || "").toLowerCase();
  const filteredData = data?.data.filter(item => {
    const matchesSearch = 
      searchTerm === '' ||
      item.product.product_name?.toLowerCase().includes(searchTerm);
      
    return matchesSearch;
  }) || [];

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
    <>
      <div style={{
        padding: "1rem",
        display: "flex", 
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}>
        <Searchbar ref={searchbarRef} type={"text"} onChange={(e) => setSearch(e.target.value)}>
          <Link to={"/locations"}>
            <img className="go-back" src="/UI/arrow-left-02-stroke-rounded.svg" alt="Go Back!" />
          </Link>
        </Searchbar>
        
      </div>
      <section className="grocery bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className='product-container' id="productContainer">
          <Suspense fallback={(
            <main className='errorDisplay'>
              <h2>Loading<span className="animated-dots"></span></h2>
            </main>
          )}>
            {data
            ? filteredData.map((item) => (
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
    </>
  );
}

// 👇 Give the component a name for debugging purposes
GroceryPage.displayName = "Grocery Page"

// 👇 Define PropTypes
GroceryPage.propTypes = {
  cartItems: PropTypes.shape({
    cart: PropTypes.objectOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
        location: PropTypes.string.isRequired,
      })
    )
  }).isRequired,
  addNewCartItem: PropTypes.func.isRequired,
  removeCartItem: PropTypes.func.isRequired,
};

export default GroceryPage
