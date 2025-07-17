import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StripePaymentForm from "../components/StripePaymentForm";
import { validateCoupon, getDiscountAmount } from "../api/coupons";

/**
 * LocalStorage key for shipping details.
 * In a real app, if user is authenticated, these would be saved to their user profile (backend API).
 */
const LS_SHIPPING_KEY = "shipping_info";
const LS_COUPON_KEY = "applied_coupon";

/**
 * Returns default (empty) shipping details object
 */
function getDefaultShipping(user) {
  return {
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    email: user?.email || ""
  };
}

// Helper: basic email/phone validation for UX
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function isValidPhone(phone) {
  return !phone || /^\+?[\d\s()\-.]{7,}$/.test(phone);
}

/**
 * PUBLIC_INTERFACE
 * Checkout page now supports persistent, auto-filled shipping information.
 */
function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [customer, setCustomer] = useState(user?.name || '');

  // Shipping form state
  const [shipping, setShipping] = useState(getDefaultShipping(user));
  const [shippingSaved, setShippingSaved] = useState(false);
  const [shippingTouched, setShippingTouched] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [shippingMsg, setShippingMsg] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, ... }
  const [couponMsg, setCouponMsg] = useState('');
  const [paymentStage, setPaymentStage] = useState("form"); // "form" | "processing" | "done"
  const navigate = useNavigate();

  // Hydrate shipping info for authenticated user, if available.
  useEffect(() => {
    // In a real app, replace this with fetch profile if authenticated.
    let found = null;
    if (isAuthenticated && user) {
      // Placeholder: try getting from localStorage, or if profile available from backend, fetch there.
      const item = localStorage.getItem(`${LS_SHIPPING_KEY}_${user.email}`) || localStorage.getItem(LS_SHIPPING_KEY);
      try {
        found = item && JSON.parse(item);
      } catch {}
      if (found && typeof found === "object" && found.email === user.email) {
        setShipping(found);
        setShippingSaved(true);
        setShippingMsg("Loaded saved shipping details.");
      } else {
        setShipping(getDefaultShipping(user));
        setShippingSaved(false);
      }
    } else {
      // Guest user or unauthenticated: load generic shipping info
      const item = localStorage.getItem(LS_SHIPPING_KEY);
      try {
        found = item && JSON.parse(item);
      } catch {}
      if (found && typeof found === "object" && found.email && found.email.length > 0) {
        setShipping(found);
        setShippingSaved(true);
        setShippingMsg("Loaded saved shipping details (device).");
      } else {
        setShipping(getDefaultShipping(user));
        setShippingSaved(false);
      }
    }
  // only on mount or when user changes
  // eslint-disable-next-line
  }, [user?.email]);

  // Flag: track if user has edited the form fields since loading.
  function handleShippingChange(e) {
    const { name, value } = e.target;
    setShipping((curr) => ({ ...curr, [name]: value }));
    setShippingTouched(true);
    setShippingSaved(false); // reset saved state if editing
    setShippingMsg('');
  }

  // Save shipping info to localStorage/user profile
  function saveShippingInfo(saveMsg) {
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.zip || !shipping.country || !shipping.email) {
      setShippingMsg("Fill out all required fields first.");
      return;
    }
    if (!isValidEmail(shipping.email)) {
      setShippingMsg("Please enter a valid email.");
      return;
    }
    if (!isValidPhone(shipping.phone)) {
      setShippingMsg("Enter valid phone (optional).");
      return;
    }
    try {
      // Save per-user if authenticated, otherwise generic for guests
      if (isAuthenticated && user?.email) {
        localStorage.setItem(`${LS_SHIPPING_KEY}_${user.email}`, JSON.stringify(shipping));
      }
      localStorage.setItem(LS_SHIPPING_KEY, JSON.stringify(shipping));
      setShippingSaved(true);
      setShippingTouched(false);
      setShippingMsg(saveMsg || "Shipping details saved.");
    } catch (err) {
      setShippingMsg("Error saving shipping info to your browser.");
    }
  }

  function clearShippingInfo() {
    try {
      if (isAuthenticated && user?.email) {
        localStorage.removeItem(`${LS_SHIPPING_KEY}_${user.email}`);
      }
      localStorage.removeItem(LS_SHIPPING_KEY);
    } catch {}
    setShipping(getDefaultShipping(user));
    setShippingSaved(false);
    setShippingTouched(false);
    setShippingMsg("Shipping details cleared.");
  }

  // Coupon logic (original)
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
  useEffect(() => {
    if (cart.length === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem(LS_COUPON_KEY);
    }
  }, [cart]);

  if (cart.length === 0)
    return <div className="text-center">Your cart is empty.</div>;

  // If not logged in, force login for checkout (as before, but note we now hydrate/can prefill shipping even pre-login for guests if needed).
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

  // Apply coupon handler (original)
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

  // Handler for successful Stripe payment (include shipping info in order)
  const handlePaymentSuccess = async (paymentIntent) => {
    setError('');
    setProcessing(true);
    try {
      // Place order in backend (mock for now, pass paymentIntent)
      const resp = await placeOrder({
        customer,
        shipping,
        items: cart,
        total: newTotal,
        discount,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined,
        paymentIntentId: paymentIntent?.id
      });
      setProcessing(false);
      clearCart();
      setAppliedCoupon(null);
      localStorage.removeItem(LS_COUPON_KEY);
      // Save shipping on successful order!
      saveShippingInfo("Shipping details saved for future checkouts.");
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
      style={{ margin: "2rem auto", maxWidth: 540 }}
      aria-label="Checkout"
    >
      <h2 style={{ textAlign: "center", marginBottom: 12 }}>Checkout</h2>

      {/* --- Begin Shipping Section --- */}
      <section style={{
        margin: "0 0 1em 0",
        padding: "1rem 1.1rem 1.1rem 1.1rem",
        border: "1.5px solid #ececec",
        borderRadius: 10,
        background: "#faf9fc"
      }}>
        <h3 style={{ margin: "0 0 .4rem 0", fontSize: "1.13em" }}>
          Shipping Information
        </h3>
        <form
          autoComplete="on"
          spellCheck={false}
          style={{ display: "grid", gap: "8px 14px", gridTemplateColumns: "1fr 1fr" }}
          onSubmit={e => { e.preventDefault(); saveShippingInfo("Shipping details saved."); }}
        >
          <div style={{ gridColumn: "span 2" }}>
            <label>
              Name:<span style={{ color: "#ec4186" }}> *</span>
              <input
                name="name"
                required
                minLength={2}
                maxLength={40}
                value={shipping.name}
                disabled={processing}
                onChange={handleShippingChange}
                autoComplete="name"
              />
            </label>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label>
              Address:<span style={{ color: "#ec4186" }}> *</span>
              <input
                name="address"
                required
                minLength={5}
                maxLength={80}
                value={shipping.address}
                disabled={processing}
                onChange={handleShippingChange}
                autoComplete="street-address"
              />
            </label>
          </div>
          <label>
            City:<span style={{ color: "#ec4186" }}> *</span>
            <input
              name="city"
              required
              minLength={2}
              maxLength={40}
              value={shipping.city}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="address-level2"
            />
          </label>
          <label>
            State/Province:<span style={{ color: "#ec4186" }}> *</span>
            <input
              name="state"
              required
              minLength={2}
              maxLength={30}
              value={shipping.state}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="address-level1"
            />
          </label>
          <label>
            ZIP/Postal Code:<span style={{ color: "#ec4186" }}> *</span>
            <input
              name="zip"
              required
              minLength={3}
              maxLength={12}
              value={shipping.zip}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="postal-code"
            />
          </label>
          <label>
            Country:<span style={{ color: "#ec4186" }}> *</span>
            <input
              name="country"
              required
              minLength={2}
              maxLength={40}
              value={shipping.country}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="country"
            />
          </label>
          <label>
            Email:<span style={{ color: "#ec4186" }}> *</span>
            <input
              name="email"
              type="email"
              required
              minLength={4}
              maxLength={60}
              value={shipping.email}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="email"
            />
          </label>
          <label>
            Phone:
            <input
              name="phone"
              type="tel"
              minLength={7}
              maxLength={24}
              value={shipping.phone}
              disabled={processing}
              onChange={handleShippingChange}
              autoComplete="tel"
            />
          </label>
          <div style={{ gridColumn: "span 2", display: "flex", gap: 12, marginTop: 4 }}>
            <button
              className="btn"
              type="button"
              disabled={!shippingTouched || processing}
              onClick={() => saveShippingInfo("Shipping details saved.")}
              style={{ minWidth: 120 }}
            >
              {shippingSaved ? "Saved" : "Save"}
            </button>
            <button
              className="btn secondary"
              type="button"
              disabled={processing}
              onClick={clearShippingInfo}
              style={{ background: "#fff", color: "#ec4186", border: "1px solid #ec4186", minWidth: 100 }}
            >
              Clear
            </button>
            {shippingMsg &&
              <span style={{
                color: shippingSaved ? "#21ab37" : "#ec4186",
                fontSize: "0.97em", margin: "6px 0 0 11px", letterSpacing: ".01em"
              }}>
                {shippingMsg}
              </span>
            }
          </div>
        </form>
        <div className="text-small" style={{ marginTop: 8, color: "#8d8e95" }}>
          {shippingSaved
            ? "Your shipping info is saved for quick future checkouts."
            : "You can save or clear your shipping details here."}
        </div>
      </section>
      {/* --- End Shipping Section --- */}

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
        disabled={
          processing
          || !customer
          || !shipping.name || !shipping.address || !shipping.city
          || !shipping.state || !shipping.zip || !shipping.country
          || !isValidEmail(shipping.email)
        }
      />
    </div>
  );
}

export default Checkout;
