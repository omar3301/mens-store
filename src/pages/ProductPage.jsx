import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, ShoppingBag } from "lucide-react";

export default function ProductPage({ product, onBack, onAddToCart, onBuyNow }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded]   = useState(false);

  const mobImgRef    = useRef(null);
  const mobHoldTimer = useRef(null);
  const mobTouchStart= useRef(null);
  const swipeXRef    = useRef(null);
  const [mobZoom, setMobZoom]     = useState(false);
  const [mobZoomPos, setMobZoomPos] = useState({ x: 50, y: 50 });

  const imgs  = product.images?.length > 0 ? product.images : [];
  const total = imgs.length;

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const prev = () => setImgIdx(i => (i - 1 + total) % total);
  const next = () => setImgIdx(i => (i + 1) % total);

  // Mobile swipe
  const onMobTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    swipeXRef.current     = t.clientX;
    mobTouchStart.current = { x: t.clientX, y: t.clientY };
    mobHoldTimer.current  = setTimeout(() => {
      if (mobImgRef.current) {
        const r = mobImgRef.current.getBoundingClientRect();
        setMobZoomPos({
          x: Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width)  * 100)),
          y: Math.max(0, Math.min(100, ((t.clientY - r.top)  / r.height) * 100)),
        });
      }
      setMobZoom(true);
    }, 350);
  };
  const onMobTouchMove = (e) => {
    if (!mobTouchStart.current) return;
    const dx = Math.abs(e.touches[0].clientX - mobTouchStart.current.x);
    const dy = Math.abs(e.touches[0].clientY - mobTouchStart.current.y);
    if (dx > 8 || dy > 8) clearTimeout(mobHoldTimer.current);
    if (mobZoom) e.preventDefault();
  };
  const onMobTouchEnd = (e) => {
    clearTimeout(mobHoldTimer.current);
    if (mobZoom) { setMobZoom(false); return; }
    if (!swipeXRef.current) return;
    const dx = swipeXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 44 && total > 1) { dx > 0 ? next() : prev(); }
    swipeXRef.current = null; mobTouchStart.current = null;
  };

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ backgroundColor: "#FAFAF9", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ padding: "14px clamp(16px,4vw,48px)", borderBottom: "1px solid #EDEBE7", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FAFAF9", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "7px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "inherit", padding: 0, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
          onMouseLeave={e => e.currentTarget.style.color = "#888"}>
          <ArrowLeft size={12} strokeWidth={2} /> Back to Collection
        </button>
        <span style={{ fontSize: "9px", color: "#C5BFB8", letterSpacing: "0.22em", textTransform: "uppercase" }}>{product.badge}</span>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT  (≥ 769px)
         ══════════════════════════════════════════ */}
      <div className="pp-desk" style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 0,
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "calc(100vh - 53px)",
      }}>

        {/* LEFT — large image area */}
        <div style={{ display: "flex", gap: "16px", padding: "32px 32px 32px 48px", alignItems: "flex-start" }}>

          {/* Thumbnail column */}
          {total > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{
                  width: "72px", height: "90px", border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`,
                  borderRadius: "3px", overflow: "hidden", padding: 0, cursor: "pointer",
                  backgroundColor: "#EDEBE7", transition: "border-color 0.2s", flexShrink: 0,
                }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div style={{ flex: 1, position: "relative", backgroundColor: "#EDEBE7", borderRadius: "4px", overflow: "hidden", aspectRatio: "2/3" }}>
            {imgs.length > 0
              ? <img src={imgs[imgIdx]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>🧥</div>
            }

            {/* Tag */}
            {product.tag && (
              <div style={{ position: "absolute", top: "18px", right: "18px", backgroundColor: "rgba(26,24,22,0.75)", backdropFilter: "blur(6px)", color: "#FAF9F7", padding: "5px 12px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>
            )}

            {/* Arrows */}
            {total > 1 && <>
              <button onClick={prev} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}><ChevronLeft size={15} strokeWidth={1.8} /></button>
              <button onClick={next} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}><ChevronRight size={15} strokeWidth={1.8} /></button>
            </>}
          </div>
        </div>

        {/* RIGHT — product info */}
        <div style={{
          padding: "40px 48px 40px 0",
          borderLeft: "1px solid #EDEBE7",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          position: "sticky",
          top: "53px",
          height: "calc(100vh - 53px)",
          overflowY: "auto",
        }}>
          {/* Badge */}
          <p style={{ fontSize: "8px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: "14px" }}>{product.badge}</p>

          {/* Name */}
          <h1 className="serif" style={{ fontSize: "clamp(28px,3vw,42px)", fontWeight: 300, lineHeight: 1.1, marginBottom: "6px", color: "#1A1816" }}>{product.name}</h1>

          {/* Description */}
          <p style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "28px" }}>{product.description}</p>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "32px" }}>
            <span className="serif" style={{ fontSize: "36px", fontWeight: 300, color: "#1A1816" }}>{product.price?.toLocaleString()}</span>
            <span style={{ fontSize: "13px", color: "#9A9590", letterSpacing: "0.06em" }}>EGP</span>
          </div>

          {/* One-piece notice */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px 16px", backgroundColor: "#F5F0E8", borderRadius: "4px", marginBottom: "28px", border: "1px solid #E8DDD0" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "5px" }} />
            <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "36px" }}>
            <button onClick={() => onBuyNow(product)} style={{ width: "100%", padding: "17px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "9px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2D2A26"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1A1816"}>
              Buy Now
            </button>
            <button onClick={handleAdd} style={{ width: "100%", padding: "15px", backgroundColor: added ? "#2C5F3F" : "transparent", color: added ? "#FAF9F7" : "#1A1816", border: `1.5px solid ${added ? "#2C5F3F" : "#D8D4CE"}`, fontSize: "9px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onMouseEnter={e => { if (!added) e.currentTarget.style.borderColor = "#1A1816"; }}
              onMouseLeave={e => { if (!added) e.currentTarget.style.borderColor = "#D8D4CE"; }}>
              {added ? <><Check size={12} strokeWidth={2.5} /> Added to Cart</> : <><ShoppingBag size={12} strokeWidth={1.8} /> Add to Cart</>}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#EDEBE7", marginBottom: "24px" }} />

          {/* Details */}
          {product.details && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "10px" }}>About This Piece</p>
              <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.95, fontWeight: 300 }}>{product.details}</p>
            </div>
          )}

          {/* Material / Care */}
          {(product.material || product.care) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["Material", product.material], ["Care", product.care]].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px", borderBottom: "1px solid #F0EDE8", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: "12px", color: "#1A1816", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (≤ 768px)
         ══════════════════════════════════════════ */}
      <div className="pp-mob" style={{ flexDirection: "column" }}>

        {/* Main image */}
        <div
          ref={mobImgRef}
          onTouchStart={onMobTouchStart}
          onTouchMove={onMobTouchMove}
          onTouchEnd={onMobTouchEnd}
          style={{ position: "relative", backgroundColor: "#EDEBE7", overflow: "hidden", aspectRatio: "3/4", userSelect: "none", touchAction: mobZoom ? "none" : "pan-y" }}
        >
          {imgs.length > 0
            ? <img src={imgs[imgIdx]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", transition: "transform 0.3s",
                ...(mobZoom ? { transform: "scale(2.2)", transformOrigin: `${mobZoomPos.x}% ${mobZoomPos.y}%` } : {}) }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🧥</div>
          }
          {product.tag && <div style={{ position: "absolute", top: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.75)", color: "#FAF9F7", padding: "4px 10px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>}
          {total > 1 && (
            <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
              {imgs.map((_, i) => <div key={i} style={{ width: imgIdx === i ? "18px" : "5px", height: "4px", borderRadius: "2px", backgroundColor: imgIdx === i ? "#1A1816" : "rgba(26,24,22,0.25)", transition: "all 0.2s" }} />)}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div style={{ display: "flex", gap: "6px", padding: "10px 16px", backgroundColor: "#FAFAF9", overflowX: "auto" }}>
            {imgs.map((src, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: "58px", height: "72px", flexShrink: 0, border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`, borderRadius: "3px", overflow: "hidden", padding: 0, cursor: "pointer", backgroundColor: "#EDEBE7" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div style={{ padding: "24px 16px 48px" }}>
          <p style={{ fontSize: "8px", letterSpacing: "0.26em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: "8px" }}>{product.badge}</p>
          <h1 className="serif" style={{ fontSize: "30px", fontWeight: 300, lineHeight: 1.1, marginBottom: "4px", color: "#1A1816" }}>{product.name}</h1>
          <p style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "20px" }}>{product.description}</p>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "22px" }}>
            <span className="serif" style={{ fontSize: "32px", fontWeight: 300, color: "#1A1816" }}>{product.price?.toLocaleString()}</span>
            <span style={{ fontSize: "13px", color: "#9A9590" }}>EGP</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", backgroundColor: "#F5F0E8", borderRadius: "4px", marginBottom: "20px", border: "1px solid #E8DDD0" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "4px" }} />
            <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            <button onClick={() => onBuyNow(product)} style={{ width: "100%", padding: "17px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "9px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer" }}>
              Buy Now
            </button>
            <button onClick={handleAdd} style={{ width: "100%", padding: "15px", backgroundColor: added ? "#2C5F3F" : "transparent", color: added ? "#FAF9F7" : "#1A1816", border: `1.5px solid ${added ? "#2C5F3F" : "#D8D4CE"}`, fontSize: "9px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {added ? <><Check size={12} strokeWidth={2.5} /> Added to Cart</> : <><ShoppingBag size={12} strokeWidth={1.8} /> Add to Cart</>}
            </button>
          </div>

          <div style={{ height: "1px", backgroundColor: "#EDEBE7", marginBottom: "20px" }} />

          {product.details && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "10px" }}>About This Piece</p>
              <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.9, fontWeight: 300 }}>{product.details}</p>
            </div>
          )}

          {(product.material || product.care) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[["Material", product.material], ["Care", product.care]].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "12px 0", borderBottom: "1px solid #EDEBE7" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: "12px", color: "#1A1816", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
