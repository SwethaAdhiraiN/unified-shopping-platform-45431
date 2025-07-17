import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(user?.name || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (cart.length === 0)
    return <div className="text-center">Your cart is empty.</div>;

  // Only logged-in customers can order.
  if (!user)
    return (
      <div className="modal" style={{ maxWidth: 380, margin: "3rem auto", textAlign: "center" }}>
        <h2>Sign in to Checkout</h2>
        <p>
          Please <b>log in or sign up</b> before checking out.
        </p>
        <button className="btn" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );

  const handleSubmit = async e => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    try {
      const resp = await placeOrder({
        customer, items: cart, total: totalPrice
      });
      setProcessing(false);
      clearCart();
      if (resp.success) {
        navigate('/order/confirmation', { state: { orderId: resp.orderId } });
      } else {
        setError('Order failed. Please try again.');
      }
    } catch {
      setError('Order failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form
      className="modal"
      style={{ margin: "2.5rem auto", maxWidth: 480 }}
      onSubmit={handleSubmit}
      aria-label="Checkout"
    >
      <h2 style={{ textAlign: "center" }}>Checkout</h2>
      <div>
        <label>
          Name:
          <input
            value={customer}
            required
            minLength={2}
            maxLength={40}
            disabled={processing}
            onChange={e => setCustomer(e.target.value)}
          />
        </label>
      </div>
      <div className="mt-1 mb-2">
        <strong>Order Preview:</strong>
        <ul>
          {cart.map(item => (
            <li key={item.id}>
              {item.qty} × {item.name} — ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <div>
          <span>Total:</span>{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <button className="btn" disabled={processing}>
        {processing ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}

export default Checkout;
