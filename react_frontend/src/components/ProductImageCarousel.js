import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ProductImageCarousel displays a carousel/gallery of product images.
 * Props:
 *   - images (array of image URLs)
 *   - altBase (string, base name for alt attributes)
 */
function ProductImageCarousel({ images = [], altBase = "Product Image" }) {
  const [selected, setSelected] = useState(0);
  if (!images.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          margin: "0 auto"
        }}
      >
        <img
          src={images[selected]}
          alt={`${altBase} ${selected + 1}`}
          style={{
            width: "100%",
            height: 260,
            objectFit: "cover",
            borderRadius: 12,
            background: "#f2f2f2"
          }}
        />
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={() =>
                setSelected((selected - 1 + images.length) % images.length)
              }
              style={{
                position: "absolute",
                left: 8,
                top: "42%",
                background: "rgba(236,65,134,0.93)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                fontSize: 18,
                cursor: "pointer",
                zIndex: 2
              }}
              disabled={selected === 0 && images.length <= 1}
            >
              ‹
            </button>
            <button
              aria-label="Next image"
              onClick={() =>
                setSelected((selected + 1) % images.length)
              }
              style={{
                position: "absolute",
                right: 8,
                top: "42%",
                background: "rgba(236,65,134,0.93)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                fontSize: 18,
                cursor: "pointer",
                zIndex: 2
              }}
              disabled={selected === images.length - 1 && images.length <= 1}
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 7,
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 3
          }}
        >
          {images.map((img, idx) => (
            <img
              src={img}
              alt={`${altBase} ${idx + 1}`}
              key={img}
              style={{
                width: 45,
                height: 45,
                objectFit: "cover",
                borderRadius: 7,
                border: idx === selected ? "2.5px solid #ec4186" : "1px solid #ececec",
                cursor: "pointer",
                opacity: idx === selected ? 1 : 0.68,
                background: "#f2f2f2"
              }}
              onClick={() => setSelected(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageCarousel;
