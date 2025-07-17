import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/api';
import { useCart, useWishlist } from '../context/CartContext';

function ProductCard({ product, onView, onAddToCart, onWishlist, inWishlist }) {
  return (
    <div className="product-card" tabIndex={0} role="group" aria-label={product.name}>
      <img className="product-img" src={product.image} alt={product.name} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="product-title">{product.name}</div>
        <button
          onClick={() => onWishlist(product)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: inWishlist ? "#ec4186" : "#bbb",
            fontSize: "1.35em",
            marginLeft: "6px"
          }}
          aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </div>
      <div style={{ fontSize: "0.98em", color: "var(--text-secondary)" }}>{product.category}</div>
      <div className="product-price">${product.price.toFixed(2)}</div>
      <div className="product-actions">
        <button className="btn" onClick={() => onView(product)}>
          Details
        </button>
        <button className="btn secondary" onClick={() => onAddToCart(product)}>
          Add to Cart
        </button>
        <button
          className="btn secondary"
          style={{ background: "#fff", color: "#ec4186", border: "1px solid #ec4186" }}
          onClick={() => onWishlist(product)}
        >
          {inWishlist ? "Wishlisted" : "Wishlist"}
        </button>
      </div>
    </div>
  );
}

function ProductCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  // Add/Remove for wishlist (heart)
  const handleWishlistToggle = (product) => {
    if (wishlist.some((item) => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts({ search, category }).then((data) => {
      setProducts(data);
      // Extract unique categories for filter dropdown
      setAllCategories([
        "",
        ...Array.from(new Set(data.map((p) => p.category).filter(Boolean))),
      ]);
      setLoading(false);
    });
  }, [search, category]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }} className="mb-2">
        Products
      </h1>
      <form
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 26,
          flexWrap: "wrap",
        }}
        onSubmit={(e) => e.preventDefault()}
        role="search"
        aria-label="Product Search and Filter"
      >
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          style={{ minWidth: 170, maxWidth: 260 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat ? cat : "All Categories"}
            </option>
          ))}
        </select>
        <button
          className="btn"
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("");
          }}
        >
          Clear
        </button>
      </form>
      {loading ? (
        <div className="text-center mt-1">Loading...</div>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <div className="text-center" style={{ gridColumn: "1/-1" }}>
              No products found.
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => navigate(`/product/${product.id}`)}
                onAddToCart={() => addToCart(product, 1)}
                onWishlist={handleWishlistToggle}
                inWishlist={wishlist.some((item) => item.id === product.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
