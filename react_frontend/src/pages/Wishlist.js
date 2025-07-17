import React from "react";
import { useWishlist, useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Wishlist page lets users manage saved-for-later products and add them to cart.
 */
function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!wishlist.length)
    return (
      <div className="modal" style={{ margin: "3.5rem auto", textAlign: "center" }}>
        <h2>Your Wishlist</h2>
        <div>Your wishlist is empty.</div>
        <button className="btn" onClick={() => navigate("/")}>
          Shop Products
        </button>
      </div>
    );

  return (
    <div className="modal" style={{ maxWidth: 440, margin: "2.25rem auto" }}>
      <h2 style={{ textAlign: "center" }}>Wishlist</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {wishlist.map((item) => (
          <li
            key={item.id}
            style={{
              borderBottom: "1px solid #ececec",
              padding: "13px 2px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 44,
                height: 44,
                objectFit: "cover",
                borderRadius: 7,
                marginRight: 9,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{item.name}</div>
              <div style={{ color: "var(--primary)", fontWeight: 600 }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
            <button
              className="btn"
              style={{
                fontSize: "0.96em",
                padding: "0.4em 0.9em",
                marginRight: 3,
              }}
              onClick={() => {
                addToCart(item, 1);
                removeFromWishlist(item.id);
                window.dispatchEvent(new Event("openCart"));
              }}
            >
              Move to Cart
            </button>
            <button
              className="btn secondary"
              style={{
                fontSize: "0.92em",
                padding: "0.4em 0.7em",
                color: "#ec4186",
                background: "#fff",
                border: "1px solid #ec4186",
              }}
              aria-label="Remove from Wishlist"
              onClick={() => removeFromWishlist(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        className="btn secondary"
        style={{ width: "100%", marginTop: 18 }}
        onClick={clearWishlist}
        disabled={!wishlist.length}
      >
        Clear Wishlist
      </button>
      <button
        className="btn"
        style={{ width: "100%", marginTop: 12 }}
        onClick={() => navigate("/")}
      >
        Shop More Products
      </button>
    </div>
  );
}

export default Wishlist;
