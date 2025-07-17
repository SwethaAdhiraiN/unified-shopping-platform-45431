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

// Restrict admin routes
function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <CartSidebar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart/checkout" element={<Checkout />} />
                <Route path="/order/confirmation" element={<OrderConfirmation />} />
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
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
                {/* fallback */}
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
