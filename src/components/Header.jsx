import { Link } from "react-router-dom";

export default function Header({ token }) {
  return (
    <>
      <header className="header">
        <h1 className="header__name">Budget Buddy</h1>
        <nav className="header__nav">
          <ul className='header__nav-links'>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/groceries">Groceries</Link></li>
            <li><Link to="#">Cuisines</Link></li>
            <li><Link to="#">About</Link></li>
          </ul>
          <div className="header__nav-login">
            {!token ? (
                <a className='login__devmode' href="/authenticate">Login</a>
              ) : (
                <a className='login__devmode' href="/dev-mode">Dev Mode</a>
            )}
            <Link to="/cart" >Cart</Link>
          </div>
        </nav>
      </header>
    </>
  );
}