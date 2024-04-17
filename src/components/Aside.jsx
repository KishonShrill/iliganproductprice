import { Link, useLocation } from 'react-router-dom';

export default function Aside() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isGrocery = location.pathname === '/groceries';

  return (
    <div className="aside">
      <div className="aside__name-container"><h1 className="aside__name">Price Check</h1></div>
      <nav className="aside__nav">
        <Link className="aside__btn" variant="primary" style={{"backgroundColor": isHomePage ? "var(--clr-tertiary)" : ""}} to="/">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            className="aside__icon"
            fill={isHomePage ? "var(--clr-highlight)" : ""}
            id="home"><path d="M20,8h0L14,2.74a3,3,0,0,0-4,0L4,8a3,3,0,0,0-1,2.26V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V10.25A3,3,0,0,0,20,8ZM14,20H10V15a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1Zm5-1a1,1,0,0,1-1,1H16V15a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3v5H6a1,1,0,0,1-1-1V10.25a1,1,0,0,1,.34-.75l6-5.25a1,1,0,0,1,1.32,0l6,5.25a1,1,0,0,1,.34.75Z"></path></svg>
          Home
        </Link>
        <Link className="aside__btn" variant="primary" style={{"backgroundColor": isGrocery ? "var(--clr-tertiary)" : ""}} to="/groceries">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            className="aside__icon"
            fill={isGrocery ? "var(--clr-highlight)" : ""}
            id="cart"><path d="M21.5,15a3,3,0,0,0-1.9-2.78l1.87-7a1,1,0,0,0-.18-.87A1,1,0,0,0,20.5,4H6.8L6.47,2.74A1,1,0,0,0,5.5,2h-2V4H4.73l2.48,9.26a1,1,0,0,0,1,.74H18.5a1,1,0,0,1,0,2H5.5a1,1,0,0,0,0,2H6.68a3,3,0,1,0,5.64,0h2.36a3,3,0,1,0,5.82,1,2.94,2.94,0,0,0-.4-1.47A3,3,0,0,0,21.5,15Zm-3.91-3H9L7.34,6H19.2ZM9.5,20a1,1,0,1,1,1-1A1,1,0,0,1,9.5,20Zm8,0a1,1,0,1,1,1-1A1,1,0,0,1,17.5,20Z"></path></svg>
          Grocery
        </Link>
        <Link className="aside__btn" variant="primary" to="#">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 32 32" 
          className="aside__icon"
          id="plate"><g data-name="Layer 3"><path d="M16,31A15,15,0,1,0,1,16,15,15,0,0,0,16,31ZM16,3A13,13,0,1,1,3,16,13,13,0,0,1,16,3Z"></path><path d="M23.42 16a7.42 7.42 0 0 1-12.66 5.25 1 1 0 0 0-1.41 1.41A9.41 9.41 0 1 0 22.65 9.34a1 1 0 0 0-1.41 1.41A7.37 7.37 0 0 1 23.42 16zM7.58 17a1 1 0 0 0 1-1A7.43 7.43 0 0 1 16 8.59a1 1 0 0 0 0-2A9.43 9.43 0 0 0 6.58 16 1 1 0 0 0 7.58 17z"></path></g></svg>
          Cuisine
        </Link>
        <div className="attribution" hidden>
          <a href="https://iconscout.com/icons/plate" className="text-underline font-size-sm" target="_blank">Plate</a> by <a href="https://iconscout.com/contributors/fauzanadiima" className="text-underline font-size-sm">Kreasi Kanvas</a> on <a href="https://iconscout.com" className="text-underline font-size-sm">IconScout</a>
        </div>
      </nav>
      <hr className="aside__hr" />
      <div className="aside__pref">
        <Link className="aside__btn" variant="primary" to="#">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 36 36"
          className="aside__icon" 
          id="settings"><path d="m19.7 3.6.4 2.8.2 1.6 1.5.6c.8.3 1.6.8 2.3 1.3l1.3 1 1.6-.6 2.6-1.1 1.7 2.9-2.2 1.9-1.3 1 .2 1.7c.1.9.1 1.8 0 2.6l-.2 1.7 1.3 1 2.2 1.8-1.7 2.9-2.6-1.1-1.5-.6-1.3 1c-.7.5-1.5 1-2.3 1.3l-1.6.7-.2 1.6-.4 2.8h-3.4l-.4-2.8-.2-1.6-1.5-.6c-.8-.3-1.6-.8-2.2-1.4l-1.3-1-1.7.6-2.6 1.1-1.7-2.9L6.9 22l1.3-1-.2-1.7c-.1-.4-.1-.9-.1-1.3s0-.9.1-1.3l.2-1.7-1.3-1-2.2-1.8 1.7-2.9L9 10.4l1.5.6 1.3-1c.7-.5 1.5-1 2.3-1.3l1.6-.7.2-1.6.4-2.8h3.4M21.5.7h-7c-.4 0-.8.3-.8.7L13 6c-1 .4-2 1-2.9 1.7L5.8 6c-.1 0-.2-.1-.3-.1-.3 0-.6.2-.7.4l-3.5 6c-.2.4-.1.8.2 1.1l3.7 2.8C5 16.9 5 17.4 5 18c0 .6 0 1.1.1 1.7l-3.6 2.9c-.3.3-.4.7-.2 1.1l3.5 6c.2.3.4.4.8.4.1 0 .2 0 .3-.1l4.3-1.7C11 29 12 29.6 13 30l.6 4.6c.1.4.4.7.8.7h7c.4 0 .8-.3.8-.7L23 30c1-.4 2-1 2.9-1.7l4.3 1.7c.1 0 .2.1.3.1.3 0 .6-.2.7-.4l3.5-6c.2-.4.1-.8-.2-1.1l-3.6-2.8c.1-1.1.1-2.3 0-3.4l3.6-2.9c.3-.3.4-.7.2-1.1l-3.5-6c-.2-.3-.4-.4-.8-.4-.1 0-.2 0-.3.1l-4.3 1.7C25 7 24 6.4 23 6l-.7-4.6c0-.4-.4-.7-.8-.7z"></path><path d="M18 24.1c-3.4 0-6.1-2.7-6.1-6.1s2.7-6.1 6.1-6.1 6.1 2.7 6.1 6.1c0 3.3-2.8 6.1-6.1 6.1z"></path></svg>
          Settings
        </Link>
        <div className="attribution" hidden>
        <a href="https://iconscout.com/icons/settings" className="text-underline font-size-sm" target="_blank">settings</a> by <a href="https://iconscout.com/contributors/ateeq" className="text-underline font-size-sm">Ateeq Ahmed</a> on <a href="https://iconscout.com" className="text-underline font-size-sm">IconScout</a>
        </div>
        <Link className="aside__btn" variant="primary" to="#">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          data-name="Layer 1" 
          className="aside__icon" 
          viewBox="0 0 29 29" id="info"><path d="M16.837 19.198h-.753v-6.01a1 1 0 0 0-1-1h-2.92a1 1 0 0 0 0 2h1.92v5.01h-1.92a1 1 0 1 0 0 2h4.673a1 1 0 1 0 0-2ZM14.5 10.013a1.5 1.5 0 1 0-1.5-1.5 1.5 1.5 0 0 0 1.5 1.5ZM14.5 2A12.514 12.514 0 0 0 2 14.5 12.521 12.521 0 0 0 14.5 27a12.5 12.5 0 0 0 0-25Zm7.33 20.006A10.491 10.491 0 1 1 25 14.5a10.411 10.411 0 0 1-3.17 7.506Z"></path></svg>
          About
        </Link>
        <div className="attribution" hidden>
        <a href="https://iconscout.com/icons/info" className="text-underline font-size-sm" target="_blank">Info</a> by <a href="https://iconscout.com/contributors/iconscout" className="text-underline font-size-sm" target="_blank">IconScout Store</a>
        </div>
      </div>
    </div>
  );
}