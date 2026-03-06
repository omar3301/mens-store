import { useState, memo } from "react";
import { firstImg } from "../data/products";

const ProductCard = memo(({ product, index, onOpenPopup }) => {
  const img = firstImg(product);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ animation: `fadeUp 0.7s ease ${0.08 * index}s both`, cursor: "pointer" }}
      onClick={() => onOpenPopup(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait image 3:4 */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}>
        {img
          ? <img src={img} alt={product.name} style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 1s cubic-bezier(0.25,0.46,0.45,0.94)",
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }} />
          : <div style={{ width: "100%", height: "100%", backgroundColor: "#EDEAE4" }} />
        }

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(26,24,22,0.22)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.45s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            color: "#FAF9F7", fontSize: "8px", fontWeight: 600,
            letterSpacing: "0.32em", textTransform: "uppercase",
            borderBottom: "1px solid rgba(250,249,247,0.65)", paddingBottom: "3px",
          }}>View Piece</span>
        </div>

        {/* Edition badge */}
        <div style={{
          position: "absolute", top: "14px", left: "14px",
          fontSize: "8px", fontWeight: 500, letterSpacing: "0.22em",
          color: "rgba(250,249,247,0.85)", textTransform: "uppercase",
        }}>{product.badge}</div>

        {/* Tag */}
        {product.tag && (
          <div style={{
            position: "absolute", top: "14px", right: "14px",
            backgroundColor: "rgba(26,24,22,0.72)", backdropFilter: "blur(8px)",
            color: "#FAF9F7", padding: "4px 10px",
            fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", borderRadius: "2px",
          }}>{product.tag}</div>
        )}
      </div>

      {/* Text info */}
      <div style={{ marginTop: "16px" }}>
        <p style={{ fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "6px" }}>{product.description}</p>
        <h3 className="serif" style={{ fontSize: "20px", fontWeight: 400, lineHeight: 1.15, marginBottom: "10px" }}>{product.name}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.04em" }}>{product.price.toLocaleString()} EGP</p>
          <span style={{ fontSize: "7px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B8A898", fontWeight: 500 }}>1 Piece Only</span>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;