import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Link, Outlet, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

import '../styles/main-header.scss'

function Header({ token }) {
  // const location = window.location.pathname;
  const { pathname } = useLocation(); // ✅ also needs to be here, not in render logic
  const [nav, setNav] = useState("-300px")

  // Menu Navigation
  function openMenu() {
    if (nav === "-300px") setNav("0")
    if (nav === "0") setNav("-300px")
  }

  const shouldShowAuthLinks = useMemo(() => {
    return pathname !== "/authenticate" && pathname !== "/dev-mode";
  }, [pathname]);

  // const renderIfDevMode = useMemo(() => [
  //   <>
  //     {(location.pathname != '/authenticate' || location.pathname != '/dev-mode') && (
  //       !token ? (
  //         <>
  //           <Link className="nav-link" to="/receipt" onClick={openMenu}>
  //             <img className="phone" src="/UI/shopping-cart-02-stroke-rounded-white.svg" alt="" />
  //             Cart
  //           </Link>
  //           <Link className='nav-link' to="/authenticate" onClick={openMenu}>
  //             <img className="phone" src="/UI/user-03-stroke-rounded-white.svg" alt="Login Icon" />
  //             <img className="computer" src="/UI/user-03-stroke-rounded.svg" alt="Login Icon" />
  //             <p className="phone">Login</p>
  //           </Link>
  //         </>
  //       ) : (
  //         <>
  //           <Link className='nav-link login__devmode' to="/dev-mode" onClick={openMenu}>Dev Mode</Link>
  //           <button className="nav-link logout__devmode" type="submit" variant="danger" onClick={() => logout()}>
              // <svg className="computer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
              //     <path className="svg-path" d="M6 6.50006C4.15875 8.14802 3 10.3345 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 10.3345 19.8412 8.14802 18 6.50006" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              //     <path className="svg-path" d="M12 2V11M12 2C11.2998 2 9.99153 3.9943 9.5 4.5M12 2C12.7002 2 14.0085 3.9943 14.5 4.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              // </svg>
  //             <p className="phone">Logout</p>
  //           </button>
  //         </>
  //       )
  //     )}
  //   </>
  // ], [])  

  return (
    <>
      <header className="header">
        <button className="header__menu" onClick={openMenu}>
          <img src="/UI/menu-02-stroke-rounded.svg" alt="Menu Button" />
        </button>
        <Link to="/" className="header__name" style={{ fontWeight: 700 }}>Budget Buddy</Link>
        
        {shouldShowAuthLinks && (
          !token ? (
            <Link to="/authenticate" className="phone" style={{justifyContent: "center"}}>
              <img src="/UI/user-03-stroke-rounded.svg" alt="Login Button" />
            </Link>
          ) : (
            <Link className='phone' to="/dev-mode" style={{justifyContent: "center"}}>
              <img src="/UI/user-03-stroke-rounded.svg" alt="Developer Mode" />
            </Link>
          )
        )}

        <nav className="header__nav" style={{left: nav}}>
          <ul className='header__nav-links'>
            <button className="header__menu absolute" onClick={openMenu}>
              <img src="/UI/cancel-circle-stroke-rounded-white.svg" alt="Menu Button" />
            </button>
            <h1 className="header__name phone">Budget Buddy</h1>
            <li>
              <Link className="nav-link" to="/" onClick={openMenu}>
                <img className="phone" src="/UI/dashboard-square-01-stroke-rounded-white.svg" alt="Home Icon" />
                Home
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/locations" onClick={openMenu}>
                <img className="phone" src="/UI/package-stroke-rounded-white.svg" alt="" />
                Groceries
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="#" onClick={openMenu}>
                <img className="phone" src="/UI/noodles-stroke-rounded-white.svg" alt="" />
                Cuisines
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="#" onClick={openMenu}>
                <img className="phone" src="/UI/information-circle-stroke-rounded-white.svg" alt="About me Icon" />
                About
              </Link>
            </li>
          </ul>
          <div className="header__nav-login">
            <DevMode token={token} openMenu={openMenu} />
          </div>
        </nav>
      </header>
      <Outlet />
    </>
  );
}

function DevModeComponent({token, openMenu}) {
    // logout
  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  }

  return (
    (!token) ? (
      <>
        <Link className="nav-link" to="/receipt" onClick={openMenu}>
          <img className="phone" src="/UI/shopping-cart-02-stroke-rounded-white.svg" alt="" />
          Cart
        </Link>
        <Link className='nav-link' to="/authenticate" onClick={openMenu}>
          <img className="phone" src="/UI/user-03-stroke-rounded-white.svg" alt="Login Icon" />
          <img className="computer" src="/UI/user-03-stroke-rounded.svg" alt="Login Icon" />
          <p className="phone">Login</p>
        </Link>
      </>
    ) : (
      <>
        <Link className='nav-link login__devmode' to="/dev-mode" onClick={openMenu}>Dev Mode</Link>
        <button className="nav-link logout__devmode" type="submit" variant="danger" onClick={logout}>
          <svg className="computer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
            <path className="svg-path" d="M6 6.50006C4.15875 8.14802 3 10.3345 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 10.3345 19.8412 8.14802 18 6.50006" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path className="svg-path" d="M12 2V11M12 2C11.2998 2 9.99153 3.9943 9.5 4.5M12 2C12.7002 2 14.0085 3.9943 14.5 4.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <p className="phone">Logout</p>
        </button>
      </>
    )
  );
}

// 👇 Give the component a name for debugging purposes
Header.displayName = "Header"

// 👇 Define PropTypes
Header.propTypes = {
  token: PropTypes.string,
}
DevModeComponent.propTypes = {
  token: PropTypes.string,
  openMenu: PropTypes.func,
}


const DevMode = React.memo(DevModeComponent)
// I swear, I feel like I am over engineering my web portfolio just to make it run faster -w-

export default React.memo(Header)