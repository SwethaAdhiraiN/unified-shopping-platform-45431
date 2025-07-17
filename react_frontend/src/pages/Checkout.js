import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StripePaymentForm from "../components/StripePaymentForm";

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(user?.name || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentStage, setPaymentStage] = useState("form"); // "form" | "processing" | "done"
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

  // Handler for successful Stripe payment
  const handlePaymentSuccess = async (paymentIntent) => {
    setError('');
    setProcessing(true);
    try {
      // Place order in backend (mock for now, pass paymentIntent)
      const resp = await placeOrder({
        customer,
        items: cart,
        total: totalPrice,
        paymentIntentId: paymentIntent?.id
      });
      setProcessing(false);
      clearCart();
      if (resp.success) {
        setPaymentStage("done");
        navigate('/order/confirmation', { state: { orderId: resp.orderId } });
      } else {
        setError('Order failed after payment. Please contact support.');
      }
    } catch {
      setError('Order failed after payment. Please try again.');
      setProcessing(false);
    }
  };

  // Handler for Stripe payment error
  const handlePaymentError = (msg) => {
    setError(msg);
    setProcessing(false);
  };

  // Payment details + Stripe form view
  return (
    <div
      className="modal"
      style={{ margin: "2.5rem auto", maxWidth: 480 }}
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
      <StripePaymentForm
        amount={totalPrice}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        disabled={processing || !customer}
      />
    </div>
  );
}

export default Checkout;
