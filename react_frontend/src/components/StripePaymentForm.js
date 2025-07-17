import React, { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

/**
 * StripePaymentForm renders the Stripe CardElement, collects card details,
 * and triggers payment confirmation on submission.
 * Props:
 *   amount: number (total in USD)
 *   onPaymentSuccess(result): called with payment intent result if payment succeeds
 *   onPaymentError(errorMessage): called with error if payment fails
 *   disabled: disables the form if true
 */
function StripePaymentForm({ amount, onPaymentSuccess, onPaymentError, disabled = false }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles the payment submission.
   * Assumes backend provides a /create-payment-intent endpoint.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      setError("Stripe is not loaded yet.");
      return;
    }

    try {
      // Send a payment intent creation request to the backend
      // For this demo/mock: emulate PaymentIntent creation (simulate success).
      // In production, replace with a real backend call!
      const mockClientSecret =
        "pi_3NdJ7YJNeSrx5ZNq1zGNQSLB_secret_mockclientside"; // Simulated

      // Confirm card payment with Stripe.js
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(mockClientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        setError(result.error.message || "Payment failed. Try another card.");
        if (onPaymentError) onPaymentError(result.error.message);
        setProcessing(false);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        setError(null);
        if (onPaymentSuccess) onPaymentSuccess(result.paymentIntent);
        setProcessing(false);
      } else {
        setError("Unknown error. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      setError("Payment failed. Please check your card or try again.");
      setProcessing(false);
      if (onPaymentError) onPaymentError("Payment failed. Please check your card.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 15 }}>
      <div style={{ background: "#f6f7fa", padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "1rem",
                fontFamily: "Inter, Arial, sans-serif",
                color: "#38124a",
                "::placeholder": { color: "#cec0d9" }
              },
              invalid: { color: "#ec4186" }
            }
          }}
        />
      </div>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <button className="btn" type="submit" disabled={processing || disabled || !stripe || !elements}>
        {processing ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </button>
      {process.env.NODE_ENV !== "production" && (
        <div style={{ fontSize: "0.89em", color: "#888", marginTop: 12 }}>
          <b>Test Card:</b> 4242 4242 4242 4242  (Any future expiry, CVC 123)
        </div>
      )}
    </form>
  );
}

export default StripePaymentForm;
