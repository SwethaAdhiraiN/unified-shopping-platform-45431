import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function OrderConfirmation() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="modal" style={{ margin: "3.5rem auto", textAlign: "center" }}>
      <h2>Thank you for your order!</h2>
      <p>
        Your order <strong>#{orderId || '—'}</strong> has been placed.
        We appreciate your business.
      </p>
      <Link className="btn" to="/">
        Continue shopping
      </Link>
    </div>
  );
}

export default OrderConfirmation;
