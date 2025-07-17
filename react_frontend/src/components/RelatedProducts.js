import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * RelatedProducts: shows a list of related products as clickable cards.
 * Props:
 *   - products: array of {id, name, image, price}
 */
function RelatedProducts({ products }) {
  const navigate = useNavigate();
  if (!products || !products.length) return null;
  return (
    <section style={{ marginTop: 40 }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.15em",
          marginBottom: 13,
          marginLeft: 2,
        }}
      >
        Customers also bought
      </div>
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {products.map((prod) => (
          <div
            key={prod.id}
            onClick={() => navigate(`/product/${prod.id}`)}
            style={{
              cursor: "pointer",
              width: 130,
              background: "#faf9fc",
              borderRadius: 8,
              boxShadow: "0 1px 7px rgba(56,18,74,0.05)",
              border: "1px solid #ececec",
              padding: 8,
              textAlign: "center",
              flex: "0 0 130px",
              transition: "box-shadow 0.18s, transform 0.18s"
            }}
            tabIndex={0}
            aria-label={`View ${prod.name}`}
          >
            <img
              src={prod.image}
              alt={prod.name}
              style={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 6,
                background: "#eee",
                marginBottom: 5
              }}
            />
            <div
              style={{
                fontWeight: 500,
                fontSize: "0.99em",
                marginBottom: 2
              }}
            >
              {prod.name}
            </div>
            <div style={{ color: "#ec4186", fontWeight: 600, fontSize: "0.99em" }}>
              ${prod.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
