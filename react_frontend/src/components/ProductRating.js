import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProductRating displays average rating, review count, and reviews. Allows new review submission if authenticated.
 * Props:
 *   - ratings (array of {user, rating, comment, date})
 *   - onAddReview (function to add review, receives {rating, comment})
 */
function ProductRating({ ratings = [], onAddReview }) {
  const { user, isCustomer } = useAuth();
  // Compute avg (0-5), count, etc.
  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasReviewed =
    !!user && !!ratings.find((r) => r.user && user.name && r.user === user.name);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    if (!myRating) {
      setError("Rating is required.");
      setSubmitting(false);
      return;
    }
    try {
      await onAddReview({ rating: myRating, comment: myComment });
      setMyRating(5);
      setMyComment("");
      setShowForm(false);
    } catch (e) {
      setError("Failed to add review. Try again.");
    }
    setSubmitting(false);
  };

  // Render star icons
  const renderStars = (value, size = 19) => {
    const out = [];
    const count = Math.floor(value);
    for (let i = 0; i < 5; i++) {
      out.push(
        <span
          key={i}
          style={{
            color: i < Math.round(value) ? "#ec4186" : "#ececec",
            fontSize: size,
            marginRight: 1,
          }}
        >
          ★
        </span>
      );
    }
    return out;
  };

  return (
    <section
      style={{
        margin: "16px 0 18px 0",
        padding: "0 0 0 4px",
        borderBottom: "1px solid #ececec",
        paddingBottom: 18,
      }}
      aria-label="Ratings and Reviews"
    >
      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "1.13em" }}>
          {avg ? avg.toFixed(1) : "—"}
        </span>
        {renderStars(avg, 18)}
        <span style={{ color: "#888" }}>
          ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
        </span>
        {isCustomer && !hasReviewed && (
          <button
            className="btn secondary"
            type="button"
            style={{ marginLeft: 17, fontSize: ".95em", background: "#fff", color: "#ec4186" }}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>
      {/* Review form */}
      {showForm && isCustomer && !hasReviewed && (
        <form
          style={{ margin: "11px 0 18px 3px" }}
          onSubmit={handleSubmit}
          aria-label="Add Review"
        >
          <div>
            <span style={{ marginRight: 9 }}>Your Rating: </span>
            {Array.from({ length: 5 }).map((x, i) => (
              <button
                key={i}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: i < myRating ? "#ec4186" : "#ececec",
                  fontSize: 22,
                  cursor: "pointer",
                  outline: "none",
                  marginRight: 1
                }}
                onClick={() => setMyRating(i + 1)}
                aria-label={`Give ${i + 1} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Brief feedback (optional)"
            value={myComment}
            style={{
              margin: "7px 0 0 0",
              width: "98%",
              border: "1px solid #ececec"
            }}
            onChange={(e) => setMyComment(e.target.value)}
          />
          {error && <div style={{ color: "red", marginTop: 3 }}>{error}</div>}
          <button
            className="btn"
            style={{ marginTop: 5, padding: "0.5em 1.2em" }}
            type="submit"
            disabled={submitting}
          >
            Submit
          </button>
        </form>
      )}
      {/* Reviews */}
      <div style={{ marginTop: 6 }}>
        {ratings.length === 0 ? (
          <div style={{ color: "#bbb", fontSize: "0.98em", marginTop: 3 }}>
            No reviews yet.
          </div>
        ) : (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {ratings
              .slice()
              .reverse()
              .map((r, i) => (
                <li
                  key={i}
                  style={{
                    borderBottom: "1px solid #f1ebf8",
                    padding: "9px 0 2px 0",
                  }}
                >
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    {renderStars(r.rating, 17)}
                    <span style={{ color: "#888", fontSize: ".98em" }}>
                      {r.user || "Anonymous"}
                    </span>
                    <span style={{ flex: 1 }}></span>
                    {r.date && (
                      <span
                        style={{
                          color: "#bbb",
                          fontSize: "0.90em",
                          marginLeft: "auto"
                        }}
                      >
                        {r.date}
                      </span>
                    )}
                  </div>
                  <div style={{ marginLeft: 3, color: "#38124a", fontSize: "1em", marginTop: 2 }}>
                    {r.comment}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ProductRating;
