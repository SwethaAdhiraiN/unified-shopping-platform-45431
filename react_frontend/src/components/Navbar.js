import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const { user, isAdmin, isCustomer, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Only show Admin links if at /admin*
  const adminPath = location.pathname.startsWith('/admin');
  return (
    <header className="navbar" role="banner">
      <NavLink className="brand" to="/">
        🛒 KAVIA SHOP
      </NavLink>
      <nav>
        {!adminPath && (
          <>
            <NavLink end to="/" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              Products
            </NavLink>
            <button
              className="navbar-link btn secondary"
              style={{ position: "relative" }}
              aria-label="Cart"
              onClick={() => window.dispatchEvent(new Event('openCart'))}
            >
              Cart
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    left: 'calc(100% + 2px)',
                    background: '#ec4186',
                    color: '#fff',
                    borderRadius: '1em',
                    padding: '0 .5em',
                    fontSize: '0.9em',
                    fontWeight: 700,
                    minWidth: '22px',
                    textAlign: 'center'
                  }}
                  aria-label={`${totalItems} item${totalItems > 1 ? 's' : ''} in cart`}
                >
                  {totalItems}
                </span>
              )}
            </button>
            {!isAuthenticated ? (
              <NavLink to="/login" className="navbar-link">
                Login
              </NavLink>
            ) : (
              <>
                <span className="navbar-link" style={{ color: "#fff", fontWeight: 500 }}>
                  {user?.name || "Customer"}
                </span>
                <button className="navbar-link btn secondary" onClick={() => { logout(); navigate("/"); }}>
                  Logout
                </button>
              </>
            )}
            <NavLink to="/admin" className="navbar-link">
              Admin
            </NavLink>
          </>
        )}
        {adminPath && isAdmin && (
          <>
            <NavLink end to="/admin" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              Products
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              Orders
            </NavLink>
            <button className="navbar-link btn secondary" onClick={() => { logout(); navigate('/'); }}>
              Logout
            </button>
          </>
        )}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
