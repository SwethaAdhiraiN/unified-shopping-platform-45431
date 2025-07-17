import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../api/api";

/**
 * PUBLIC_INTERFACE
 * Customer-facing order tracking page.
 * Shows all of the current user's orders and a graphical status stepper for each order.
 */
const STATUS_FLOW = ["New", "Packed", "Shipped", "Delivered"];
const STATUS_LABELS = {
  New: "Order Placed",
  Packed: "Packed",
  Shipped: "Shipped",
  Delivered: "Delivered"
};

function StatusStepper({ status }) {
  const currentIdx = STATUS_FLOW.indexOf(status);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 5,
      marginBottom: 16
    }}>
      {STATUS_FLOW.map((s, idx) => (
        <React.Fragment key={s}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: idx <= currentIdx ? "var(--primary)" : "#ececec",
                color: idx <= currentIdx ? "#fff" : "#888",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1em",
                border: idx === currentIdx ? "2.5px solid var(--secondary)" : "2px solid #ececec"
              }}
              aria-current={idx === currentIdx ? "step" : undefined}
            >
              {/* Step number if not done yet, checkmark if completed */}
              {idx < currentIdx
                ? <span style={{ fontSize: 12 }}>✓</span>
                : idx === currentIdx
                  ? <span>{idx + 1}</span>
                  : <span>{idx + 1}</span>
              }
            </div>
            <div
              style={{
                marginTop: 5,
                fontSize: "0.87em",
                color: idx <= currentIdx ? "var(--primary)" : "#bbb",
                textAlign: "center",
                width: 78,
                fontWeight: idx === currentIdx ? 600 : 400
              }}
            >
              {STATUS_LABELS[s]}
            </div>
          </div>
          {idx !== STATUS_FLOW.length - 1 && (
            <div style={{
              height: 3,
              width: 28,
              background: idx < currentIdx ? "var(--primary)" : "#ececec"
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderTracking() {
  const { user, isCustomer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCustomer) return;
    setFetching(true);
    fetchOrders().then((allOrders) => {
      // In a real app: filter orders by user/customer.
      // Here, mock: show orders if 'customer' field matches user.name, or all for demo.
      const myOrders = allOrders.filter(o =>
        !user?.name || o.customer === user.name
      );
      setOrders(myOrders);
      setFetching(false);
    });
  }, [user, isCustomer]);

  if (!isCustomer)
    return (
      <div className="modal" style={{ textAlign: "center", margin: "2.5rem auto" }}>
        <h2>Order Tracking</h2>
        <p>Please log in as a customer to view your orders.</p>
        <button className="btn" onClick={() => navigate("/login")}>Log In</button>
      </div>
    );

  return (
    <div className="modal" style={{ maxWidth: 520, margin: "2.5rem auto" }}>
      <h2 style={{ textAlign: "center" }}>Order Tracking</h2>
      {fetching ? (
        <div>Loading your orders…</div>
      ) : !orders.length ? (
        <div style={{ margin: "2rem 0", textAlign: "center" }}>
          <div>You don't have any orders yet.</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={() => navigate("/")}>Shop Products</button>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map(order => (
            <li
              key={order.id}
              style={{
                border: "1px solid #ececec",
                padding: "1.2em",
                marginBottom: 18,
                borderRadius: 10,
                background: "#faf9fc",
                boxShadow: "0 1px 3px rgba(236,65,134,0.05)"
              }}
            >
              <div style={{ marginBottom: 7, fontWeight: 500 }}>
                Order <span style={{ color: "var(--primary)" }}>#{order.id}</span>
                <span style={{ float: "right", color: "#999", fontWeight: 400, fontSize: "0.98em" }}>Placed: {order.created}</span>
              </div>
              <div style={{ marginBottom: 7 }}>
                <strong>Status: </strong>
                <span style={{
                  color:
                    order.status === "Delivered" ? "#21ab37"
                      : order.status === "Shipped" ? "#ec4186"
                        : "#38124a",
                  fontWeight: 600
                }}>{order.status}</span>
              </div>
              <StatusStepper status={order.status} />
              <div style={{ marginTop: 6, marginBottom: 2 }}>
                <strong>Items:</strong>
                <ul style={{ margin: "0 0 0 .95em", padding: 0 }}>
                  {order.items.map((item, i) => (
                    <li key={i} style={{ fontSize: "0.97em", color: "#333" }}>
                      {item.qty}× <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ marginLeft: 9, color: "var(--primary)", fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 7 }}>
                <strong>Total:</strong>
                <span style={{ color: "var(--primary)", fontWeight: 700, marginLeft: 8 }}>${order.total.toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrderTracking;
