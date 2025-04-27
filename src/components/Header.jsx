import { Link, useLocation } from "react-router-dom";

import '../styles/main-header.scss'

export default function Header({ token }) {
  const location = useLocation(); // ✅ also needs to be here, not in render logic
  console.log({ location })

  // logout
  const logout = () => {
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    window.location.href = "/";
  }

  return (
    <>
      <header className="header">
        <Link to="/" className="header__name" style={{ fontWeight: 700 }}>Budget Buddy</Link>
        <nav className="header__nav">
          <ul className='header__nav-links'>
            <li><Link className="nav-link" to="/">Home</Link></li>
            <li><Link className="nav-link" to="/groceries">Groceries</Link></li>
            <li><Link className="nav-link" to="#">Cuisines</Link></li>
            <li><Link className="nav-link" to="#">About</Link></li>
          </ul>
          <div className="header__nav-login">
            {(location.pathname != '/authenticate') && (
              !token ? (
                <>
                  <Link className='nav-link' to="/authenticate">Login</Link>
                  <Link className="nav-link" to="/receipt">Cart</Link>
                </>
              ) : (
                <>
                  <Link className='nav-link login__devmode' to="/dev-mode">Dev Mode</Link>
                  <button className="nav-link logout__devmode" type="submit" variant="danger" onClick={() => logout()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                        <path className="svg-path" d="M6 6.50006C4.15875 8.14802 3 10.3345 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 10.3345 19.8412 8.14802 18 6.50006" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path className="svg-path" d="M12 2V11M12 2C11.2998 2 9.99153 3.9943 9.5 4.5M12 2C12.7002 2 14.0085 3.9943 14.5 4.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </>
              )
            )}
          </div>
        </nav>
      </header>
    </>
  );
}