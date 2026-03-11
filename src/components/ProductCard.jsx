import { useState, memo } from "react";
import { firstImg, getEffectivePrice, getDiscountLabel } from "../data/products";

const ProductCard = memo(({ product, index, onOpenPopup }) => {
  const img        = firstImg(product);
  const [hovered, setHovered] = useState(false);
  const salePrice  = getEffectivePrice(product);
  const discLabel  = getDiscountLabel(product);
  const hasDiscount = discLabel !== null;

  return (
    <div
      style={{ animation: `fadeUp 0.6s ease ${Math.min(0.06 * index, 0.4)}s both`, cursor: "pointer" }}
      onClick={() => onOpenPopup(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", backgroundColor: "#EDEAE4", borderRadius: "2px" }}>
        {img
          ? <img src={img} alt={product.name} loading="lazy"
              style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)", transform: hovered ? "scale(1.06)" : "scale(1)" }}
            />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", opacity:.2 }}>🛍️</div>
        }

        {/* Hover overlay */}
        <div style={{ position:"absolute", inset:0, backgroundColor:"rgba(26,24,22,.18)", opacity: hovered ? 1 : 0, transition:"opacity 0.35s ease", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#FAF9F7", fontSize:"8px", fontWeight:600, letterSpacing:"0.3em", textTransform:"uppercase", borderBottom:"1px solid rgba(250,249,247,.6)", paddingBottom:"3px" }}>View Details</span>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div style={{ position:"absolute", top:"12px", left:"12px", backgroundColor:"#C0392B", color:"#fff", padding:"4px 10px", fontSize:"9px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", borderRadius:"3px" }}>
            {discLabel}
          </div>
        )}

        {/* Tag badge */}
        {product.tag && (
          <div style={{ position:"absolute", top:"12px", right:"12px", backgroundColor: product.tag === "New" ? "#1A1816" : "rgba(184,150,110,.92)", backdropFilter:"blur(6px)", color:"#FAF9F7", padding:"4px 10px", fontSize:"7px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", borderRadius:"2px" }}>
            {product.tag}
          </div>
        )}

        {/* Sizes on hover */}
        {product.sizes?.length > 0 && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(transparent,rgba(26,24,22,.52))", opacity: hovered ? 1 : 0, transition:"opacity 0.35s", display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {product.sizes.slice(0,6).map(s => (
              <span key={s} style={{ fontSize:"7px", fontWeight:600, color:"rgba(250,249,247,.85)", letterSpacing:"0.06em" }}>{s}</span>
            ))}
            {product.sizes.length > 6 && <span style={{ fontSize:"7px", color:"rgba(250,249,247,.6)" }}>+{product.sizes.length-6}</span>}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ marginTop:"14px" }}>
        <p style={{ fontSize:"8px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#9A9590", fontWeight:500, marginBottom:"5px" }}>{product.description}</p>
        <h3 className="serif" style={{ fontSize:"18px", fontWeight:400, lineHeight:1.2, marginBottom:"10px", color:"#1A1816" }}>{product.name}</h3>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"6px" }}>
            {hasDiscount ? (
              <>
                <span style={{ fontSize:"15px", fontWeight:700, color:"#C0392B" }}>{salePrice.toLocaleString()}</span>
                <span style={{ fontSize:"10px", color:"#9A9590" }}>EGP</span>
                <span style={{ fontSize:"12px", color:"#B8A898", textDecoration:"line-through" }}>{product.price.toLocaleString()}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize:"14px", fontWeight:500, color:"#1A1816" }}>{product.price.toLocaleString()}</span>
                <span style={{ fontSize:"10px", color:"#9A9590" }}>EGP</span>
              </>
            )}
          </div>
          {/* Color dots */}
          {product.colors?.length > 1 && (
            <div style={{ display:"flex", gap:"4px" }}>
              {product.colors.slice(0,4).map(c => (
                <span key={c.name} title={c.name} style={{ width:"8px", height:"8px", borderRadius:"50%", backgroundColor:c.hex, border:"1px solid rgba(26,24,22,.15)", display:"inline-block" }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;