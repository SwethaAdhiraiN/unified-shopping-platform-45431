import React, { useState, useEffect } from 'react';
import { useCart, useWishlist } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function CartSidebar() {
  const [open, setOpen] = useState(false);
  const { cart, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener('openCart', handler);
    return () => window.removeEventListener('openCart', handler);
  }, []);

  const closeSidebar = () => setOpen(false);

  // Save for later: move item to wishlist, remove from cart
  const handleSaveForLater = (item) => {
    addToWishlist(item);
    removeFromCart(item.id);
  };

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
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <button
                  className="btn secondary"
                  aria-label="Remove"
                  style={{ marginLeft: 10, marginBottom: 3 }}
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑
                </button>
                <button
                  className="btn secondary"
                  style={{
                    fontSize: "0.94em",
                    padding: "0.4em 0.7em",
                    background: "#fff",
                    color: "#ec4186",
                    border: "1px solid #ec4186",
                  }}
                  onClick={() => handleSaveForLater(item)}
                  aria-label="Save for Later"
                  title="Move to Wishlist"
                >
                  ♥ Save for Later
                </button>
              </div>
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
