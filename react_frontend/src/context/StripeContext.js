import React, { createContext, useContext, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

/**
 * StripeContext provides access to the Stripe.js and Elements objects and allows child components
 * to use the Elements and payment context.
 */
const StripeContext = createContext();

/**
 * PUBLIC_INTERFACE
 * StripeProvider wraps the application in Stripe Elements context.
 * It loads the Stripe object with the publishable key loaded from the environment (.env).
 */
export function StripeProvider({ children }) {
  // Set up Stripe in test mode using the publishable key from .env
  const stripePromise = useMemo(() => {
    // The key is loaded in test mode, fallback is a Stripe test publishable key (public, safe).
    const key =
      process.env.REACT_APP_STRIPE_PUBLIC_KEY ||
      "pk_test_51NXSzMJNeSrx5ZNqxb7gjQTdJpW0lYjFOHtQmLCkWwRxDiJkXIOapyjop0wJVLXZGg8qb80rQDjw3O6JD9pBJekL00dpuU6byN";
    return loadStripe(key);
  }, []);

  return (
    <StripeContext.Provider value={{}}>
      <Elements stripe={stripePromise}>{children}</Elements>
    </StripeContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useStripeContext() {
  return useContext(StripeContext);
}
