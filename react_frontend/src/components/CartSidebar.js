import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function CartSidebar() {
  const [open, setOpen] = useState(false);
  const { cart, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener('openCart', handler);
    return () => window.removeEventListener('openCart', handler);
  }, []);

  const closeSidebar = () => setOpen(false);

  return (
    <>
      <div className={'cart-sidebar' + (open ? ' open' : '')} style={{ zIndex: 999 }}>
        <div className="cart-sidebar-header">
          Cart <span style={{ fontWeight: 400 }}>({totalItems} items)</span>
          <button className="btn secondary" style={{ marginLeft: 'auto' }} onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="cart-sidebar-body">
          {cart.length === 0 && <div className="text-small">Your cart is empty.</div>}
          {cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-img"
                width="48"
                height="48"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    style={{ width: 48, marginRight: 6 }}
                    aria-label="Quantity"
                    onChange={e => updateQty(item.id, parseInt(e.target.value, 10) || 1)}
                  />
                  <span className="cart-item-qty">
                    × ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                className="btn secondary"
                aria-label="Remove"
                style={{ marginLeft: 10 }}
                onClick={() => removeFromCart(item.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
        <div className="cart-sidebar-footer">
          <div>
            Subtotal: <strong>${totalPrice.toFixed(2)}</strong>
          </div>
          <button
            className="btn"
            disabled={cart.length === 0}
            style={{ width: '100%', marginTop: 15 }}
            onClick={() => {
              closeSidebar();
              navigate('/cart/checkout');
            }}>
            Checkout
          </button>
          <button
            className="btn secondary"
            style={{ width: '100%', marginTop: 7 }}
            disabled={cart.length === 0}
            onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
      {open && <div className="overlay" onClick={closeSidebar} />}
    </>
  );
}

export default CartSidebar;
