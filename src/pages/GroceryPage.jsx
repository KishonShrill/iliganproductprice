import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import useFetchListingsByLocation from '../hooks/useFetchListingsByLocation'
import Cart from "../components/Cart";
import ProductCard from '../components/ProductCard';
import Searchbar from "../components/Searchbar";
import useSettings from "../hooks/useSettings";

import '../styles/grocery.scss'


function GroceryPage({ cartItems, addNewCartItem, removeCartItem }) {
    document.title = "Grocery List - Budget Buddy"
    const { settings } = useSettings()

    const [count, setCount] = useState(0)
    const [reciept, setReceipt] = useState("100%")
    const [active, setActive] = useState(false)
    const [search, setSearch] = useState('')
    const [animatingCards, setAnimatingCards] = useState([])
    const [windowWidth] = useState(window.innerWidth);

    const cartButtonRef = useRef(null)
    const cartRef = useRef(null)
    const searchbarRef = useRef(null)
    const audioRef = useRef(null);

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
    }, [removeCartItem])


    // Add item on <Cart /> on Button Click on <ProductCard />
    const handleClick = useCallback((el) => {
        const productId = el.dataset.productId;
        const productName = el.dataset.productName;
        const productPrice = parseFloat(el.dataset.productPrice);
        const productLocation = el.dataset.productLocation;
        const productImage = el.dataset.productImage;
        const card = el.closest('.product-card');
        const cartButton = (windowWidth < 700) ? cartButtonRef.current : cartRef.current; //TODO: this is a one time fetch thing, static fetch

        if (!card || !cartButton) return;

        console.log(settings.soundEffects)
        if (audioRef.current) {
            audioRef.current.currentTime = 0; // rewind so it can replay fast
            audioRef.current.play();
        }

        // Get positions
        const cardRect = card.getBoundingClientRect();
        const cartShape = cartButton.getBoundingClientRect();

        // Create animating card
        const animatingCard = {
            count,
            productId,
            productName,
            productPrice,
            productImage,
            startX: cardRect.left,
            startY: cardRect.top,
            targetX: cartShape.left + cartShape.width / 2 - 80,
            targetY: cartShape.top + cartShape.height / 2 - 100,
        };

        setCount(prev => prev + 1)
        setAnimatingCards(prev => [...prev, animatingCard]);

        // Remove animating card after animation completes
        setTimeout(() => {
            setAnimatingCards(prev => prev.filter(card => card.count !== animatingCard.count));
        }, 800);

        // console.log(`${productId} | ${productName} | ${productPrice} | ${productLocation} | ${productImage}`)
        addNewCartItem(productId, productName, productPrice, productLocation);
    }, [count]);

    const searchTerm = (search || "").toLowerCase();
    const filteredProducts = data?.data.filter(item => {
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
    if (isLoading || isFetching) {
        return (
            <main className='errorDisplay'>
                <h2>Loading<span className="animated-dots"></span></h2>
            </main>
        )
    }
    if (isError) {
        return (
            <main className='errorDisplay'>
                <h2>Error: {error.message}</h2>
            </main>
        )
    }

    return (
        <>
            <div style={{
                zIndex: 5,
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
            }}>
                {/* 🔊 Hidden audio element */}
                <audio ref={audioRef} src="/sounds/click-pop.mp3" preload="auto" muted={!settings.soundEffects} />

                <Searchbar ref={searchbarRef} type={"text"} onChange={(e) => setSearch(e.target.value)}>
                    <Link to={"/locations"}>
                        <img className="go-back" src="/UI/arrow-left-02-stroke-rounded.svg" alt="Go Back!" />
                    </Link>
                </Searchbar>

            </div>
            <section className="grocery bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <main className='mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 xl:grid-cols-4' id="productContainer">
                    <Suspense fallback={(
                        <main className='errorDisplay'>
                            <h2>Loading<span className="animated-dots"></span></h2>
                        </main>
                    )}>
                        {filteredProducts
                            .sort((a, b) => a.product.product_name.localeCompare(b.product.product_name))
                            .map((item) => (
                                <ProductCard
                                    key={item._id}
                                    item={item}
                                    onAdd={(event) => handleClick(event.currentTarget)}
                                    settings={settings}
                                />
                            ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                No products found for {search}
                            </div>
                        )}
                    </Suspense>
                </main>

                {/* Animating Cards */}
                {animatingCards.map((animatingCard) => (
                    <div
                        key={animatingCard.count}
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: animatingCard.startX,
                            top: animatingCard.startY,
                            width: '160px',
                            height: '200px',
                            animation: `flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                            '--start-x': `${animatingCard.startX}px`,
                            '--start-y': `${animatingCard.startY}px`,
                            '--target-x': `${animatingCard.targetX}px`,
                            '--target-y': `${animatingCard.targetY}px`,
                        }}
                    >
                        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                            <div className="relative aspect-square w-full bg-gray-50">
                                <img src={animatingCard.productImage} alt={animatingCard.productName} className="h-full w-full object-cover" />
                            </div>
                            <div className="p-2">
                                <h3 className="line-clamp-1 text-[10px] font-bold text-gray-800">{animatingCard.productName}</h3>
                                <p className="text-xs font-black text-orange-500">₱{animatingCard.productPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <Cart ref={cartRef} storage={cartItems} onRemove={removeCartItem} reciept={reciept} />
                <button ref={cartButtonRef} className={`cart-btn phone fixed ${active ? 'active' : ''}`} onClick={openReciept}>
                    {active
                        ? <img src="/UI/shopping-cart-02-stroke-rounded-white.svg" alt="My cart button" />
                        : <img src="/UI/shopping-cart-02-stroke-rounded.svg" alt="My cart button" />
                    }
                    {cartItems && cartItems.cart && (
                        (() => {
                            const totalQty = Object.values(cartItems.cart).reduce(
                                (sum, item) => sum + item.quantity,
                                0
                            );

                            if (totalQty == 0) return null;

                            return (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[1.25rem] h-[1.25rem]">
                                    {totalQty}
                                </span>
                            );
                        })()
                    )}
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
