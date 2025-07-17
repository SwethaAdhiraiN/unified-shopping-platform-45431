import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductDetail } from '../api/api';
import { useCart, useWishlist } from '../context/CartContext';
import ProductImageCarousel from '../components/ProductImageCarousel';
import ProductRating from '../components/ProductRating';
import RelatedProducts from '../components/RelatedProducts';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProductDetail(id).then((p) => {
      setProduct(p);
      setRatings(p?.ratings ? [...p.ratings] : []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center mt-1">Loading...</div>;
  if (!product) return <div className="text-center mt-1">Product not found.</div>;

  const inWishlist = wishlist.some((item) => item.id === product.id);

  // Add a new review (in-memory only)
  const handleAddReview = async ({ rating, comment }) => {
    setRatings((old) => [
      ...old,
      {
        user: (JSON.parse(localStorage.getItem("auth_user")) || {}).name || "You",
        rating,
        comment,
        date: new Date().toISOString().slice(0, 10)
      }
    ]);
  };

  return (
    <div style={{ maxWidth: 530, margin: "2.5rem auto" }}>
      <ProductImageCarousel
        images={product.images && product.images.length ? product.images : [product.image]}
        altBase={product.name}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {product.name}
          <button
            onClick={() =>
              inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)
            }
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: inWishlist ? "#ec4186" : "#bbb",
              fontSize: "1.45em",
            }}
            aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {inWishlist ? "♥" : "♡"}
          </button>
        </h2>
        {/* product tags */}
        <div style={{ display: "flex", gap: 5 }}>
          {(product.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-block",
                fontSize: "0.98em",
                padding: "2px 10px",
                color: "#fff",
                background: tag === "new"
                  ? "#21ab37"
                  : tag === "trending"
                  ? "#ec4186"
                  : tag === "sale"
                  ? "#f2a63e"
                  : "#888",
                borderRadius: 12,
                fontWeight: 500,
                letterSpacing: 0.5,
                marginLeft: 2
              }}
            >
              {tag[0].toUpperCase() + tag.slice(1)}
            </span>
          ))}
        </div>
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "1em", marginBottom: 5 }}>
        {product.category}
      </div>
      <div style={{ margin: ".7em 0", color: "var(--primary)", fontWeight: 600 }}>
        ${product.price.toFixed(2)}
      </div>
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: "1.05em",
          marginBottom: 30,
        }}
      >
        {product.description}
      </div>
      {/* Ratings and reviews */}
      <ProductRating ratings={ratings} onAddReview={handleAddReview} />
      <div style={{ marginBottom: "1.2em" }}>
        <label>
          Quantity:
          <input
            type="number"
            min="1"
            value={qty}
            style={{ width: 60, marginLeft: 10 }}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "18px", marginBottom: 18 }}>
        <button
          className="btn"
          onClick={() => {
            addToCart(product, qty);
            window.dispatchEvent(new Event("openCart"));
          }}
        >
          Add to Cart
        </button>
        <button
          className="btn secondary"
          type="button"
          style={{ background: "#fff", color: "#ec4186", border: "1px solid #ec4186" }}
          onClick={() =>
            inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)
          }
        >
          {inWishlist ? "Wishlisted" : "Wishlist"}
        </button>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      {/* Related products */}
      {product.relatedProducts && !!product.relatedProducts.length && (
        <RelatedProducts products={product.relatedProducts} />
      )}
    </div>
  );
}

export default ProductDetail;
