import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductDetail } from '../api/api';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProductDetail(id).then(p => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center mt-1">Loading...</div>;
  if (!product) return <div className="text-center mt-1">Product not found.</div>;

  return (
    <div style={{ maxWidth: 500, margin: "2.5rem auto" }}>
      <img className="product-img" src={product.image} alt={product.name} style={{ height: 260, objectFit: "cover" }} />
      <h2>{product.name}</h2>
      <div style={{ color: "var(--text-secondary)", fontSize: "1em" }}>{product.category}</div>
      <div style={{ margin: ".7em 0", color: "var(--primary)", fontWeight: 600 }}>
        ${product.price.toFixed(2)}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "1.05em", marginBottom: 30 }}>
        {product.description}
      </div>
      <div style={{ marginBottom: "1em" }}>
        <label>
          Quantity:
          <input
            type="number"
            min="1"
            value={qty}
            style={{ width: 60, marginLeft: 10 }}
            onChange={e => setQty(Number(e.target.value))}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "18px" }}>
        <button
          className="btn"
          onClick={() => {
            addToCart(product, qty);
            window.dispatchEvent(new Event('openCart'));
          }}>
          Add to Cart
        </button>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
