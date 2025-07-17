import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';

// Pages
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import './App.css';

/**
 * Restricts access to admin-only routes.
 * If not authenticated as admin, redirects to the admin login page.
 * @param {object} props - React props containing children.
 */
function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

/**
 * Root of the application.
 *  - Wraps children in theme, auth and cart providers, so the context is available everywhere.
 *  - Sets up the main routing using React Router.
 *  - Places Navbar and CartSidebar on every page.
 *  - Handles both customer and admin sections, with route guards for admin pages.
 */
function App() {
  return (
    // ThemeProvider manages light/dark theme via context
    <ThemeProvider>
      {/* AuthProvider keeps admin authentication state */}
      <AuthProvider>
        {/* CartProvider manages cart state and operations for buyers */}
        <CartProvider>
          {/* Top-level Router for page navigation */}
          <Router>
            {/* Navbar visible across all pages */}
            <Navbar />
            {/* CartSidebar is available as an overlay and listens for openCart events */}
            <CartSidebar />
            {/* Main app content, routes below */}
            <div className="main-content">
              <Routes>
                {/* Customer/shopper routes */}
                <Route path="/" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart/checkout" element={<Checkout />} />
                <Route path="/order/confirmation" element={<OrderConfirmation />} />
                {/* Admin interface entry points */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* The following admin routes are protected and require admin login. */}
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminDashboard />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <RequireAdmin>
                      <AdminProducts />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <RequireAdmin>
                      <AdminOrders />
                    </RequireAdmin>
                  }
                />
                {/* Fallback route: anything else redirects to the catalog */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
