import { Link, useLocation } from "react-router-dom";
import '../styles/main-header.scss'

export default function Header({ token }) {
  const location = useLocation(); // ✅ also needs to be here, not in render logic
  console.log({location})

  return (
    <>
      <header className="header">
        <Link to="/" className="header__name" style={{fontWeight: 700}}>Budget Buddy</Link>
        <nav className="header__nav">
          <ul className='header__nav-links'>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/groceries">Groceries</Link></li>
            <li><Link to="#">Cuisines</Link></li>
            <li><Link to="#">About</Link></li>
          </ul>
          <div className="header__nav-login">
            {!token ? (
                <Link className='login__devmode' href="/authenticate">Login</Link>
              ) : (
                <Link className='login__devmode' href="/dev-mode">Dev Mode</Link>
            )}
            <Link to="/receipt">Cart</Link>
          </div>
        </nav>
      </header>
    </>
  );
}