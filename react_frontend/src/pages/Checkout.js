import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StripePaymentForm from "../components/StripePaymentForm";
import { validateCoupon, getDiscountAmount } from "../api/coupons";

const LS_COUPON_KEY = "applied_coupon";

// PUBLIC_INTERFACE
function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(user?.name || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, ... }
  const [couponMsg, setCouponMsg] = useState('');
  const [paymentStage, setPaymentStage] = useState("form"); // "form" | "processing" | "done"
  const navigate = useNavigate();

  // Load applied coupon from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(LS_COUPON_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Re-validate coupon with current cart
        if (parsed && parsed.code) {
          const res = validateCoupon(parsed.code, totalPrice);
          if (res.valid) {
            setAppliedCoupon(res.coupon);
            setCouponInput(res.coupon.code);
          } else {
            localStorage.removeItem(LS_COUPON_KEY);
          }
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);
  // Also clear coupon if cart is $0
  useEffect(() => {
    if (cart.length === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem(LS_COUPON_KEY);
    }
  }, [cart]);

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

  // Apply coupon handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponMsg('');
    const result = validateCoupon(couponInput, totalPrice);
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setCouponMsg('Coupon applied: ' + result.coupon.description);
      localStorage.setItem(LS_COUPON_KEY, JSON.stringify(result.coupon));
    } else {
      setAppliedCoupon(null);
      setCouponMsg(result.reason || 'Invalid coupon');
      localStorage.removeItem(LS_COUPON_KEY);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg('');
    localStorage.removeItem(LS_COUPON_KEY);
  };

  // Compute discount and new total
  const discount = getDiscountAmount(totalPrice, appliedCoupon);
  const newTotal = Math.max(0, +(totalPrice - discount).toFixed(2));

  // Handler for successful Stripe payment
  const handlePaymentSuccess = async (paymentIntent) => {
    setError('');
    setProcessing(true);
    try {
      // Place order in backend (mock for now, pass paymentIntent)
      const resp = await placeOrder({
        customer,
        items: cart,
        total: newTotal,
        discount,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined,
        paymentIntentId: paymentIntent?.id
      });
      setProcessing(false);
      clearCart();
      // Also clear coupon after successful order
      setAppliedCoupon(null);
      localStorage.removeItem(LS_COUPON_KEY);
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
      {/* Coupon code entry */}
      <div style={{ margin: "1em 0 8px 0" }}>
        <form style={{ display: "flex", gap: 6, alignItems: "center" }} onSubmit={handleApplyCoupon} autoComplete="off">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={e => setCouponInput(e.target.value.replace(/\s/g, '').toUpperCase())}
            disabled={processing || cart.length === 0}
            style={{ flex: 1, minWidth: 120, maxWidth: 170, letterSpacing: 1.5 }}
            autoCapitalize="characters"
            aria-label="Coupon code"
            name="coupon"
          />
          <button className="btn secondary"
            type="submit"
            disabled={
              processing || cart.length === 0 ||
              (!couponInput.trim()) ||
              (appliedCoupon && couponInput.toUpperCase() === appliedCoupon.code)
            }
            style={{ background: "#fff", color: "#ec4186", border: "1px solid #ec4186" }}
          >
            Apply
          </button>
          {appliedCoupon && (
            <button
              type="button"
              style={{
                marginLeft: 0,
                padding: ".6em",
                background: "#ececec",
                color: "#d23b3b",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
              title="Remove coupon"
              onClick={handleRemoveCoupon}
              aria-label="Remove coupon"
              disabled={processing}
            >
              ✕
            </button>
          )}
        </form>
        {!!couponMsg && (
          <div style={{
            color: appliedCoupon ? "#21ab37" : "#ec4186",
            fontSize: ".98em",
            marginTop: 3,
            marginLeft: 2,
            minHeight: 18
          }}>
            {couponMsg}
          </div>
        )}
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
          <span>Subtotal:</span>{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>${totalPrice.toFixed(2)}</span>
        </div>
        {!!appliedCoupon && discount > 0 && (
          <div style={{ color: "#21ab37", marginTop: 1, fontWeight: 500 }}>
            Coupon ({appliedCoupon.code}): −${discount.toFixed(2)} <span style={{ color: "#888", fontWeight: 400 }}>({appliedCoupon.description})</span>
          </div>
        )}
        <div style={{ fontSize: "1.09em", marginTop: 2 }}>
          <span style={{ fontWeight: 600 }}>Total after discount:</span>{" "}
          <span style={{ color: discount > 0 ? "#21ab37" : "var(--primary)", fontWeight: 700, fontSize: "1.07em" }}>${newTotal.toFixed(2)}</span>
        </div>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <StripePaymentForm
        amount={newTotal}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        disabled={processing || !customer}
      />
    </div>
  );
}

export default Checkout;
