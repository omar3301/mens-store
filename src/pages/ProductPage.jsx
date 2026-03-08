import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, ShoppingBag } from "lucide-react";

export default function ProductPage({ product, onAddToCart, onBuyNow }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded]   = useState(false);

  const mobImgRef     = useRef(null);
  const mobHoldTimer  = useRef(null);
  const mobTouchStart = useRef(null);
  const swipeXRef     = useRef(null);
  const [mobZoom, setMobZoom]       = useState(false);
  const [mobZoomPos, setMobZoomPos] = useState({ x: 50, y: 50 });

  // Desktop zoom
  const deskImgRef = useRef(null);
  const deskDivRef = useRef(null);
  const deskTimer  = useRef(null);
  const [deskZoom, setDeskZoom] = useState(false);

  const imgs  = product.images?.length > 0 ? product.images : [];
  const total = imgs.length;

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const prev = () => setImgIdx(i => (i - 1 + total) % total);
  const next = () => setImgIdx(i => (i + 1) % total);

  // Desktop zoom handlers
  const onDeskMove  = (e) => {
    if (!deskDivRef.current || !deskImgRef.current) return;
    const r = deskDivRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width)  * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top)  / r.height) * 100));
    deskImgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };
  const onDeskDown  = () => { deskTimer.current = setTimeout(() => { if (deskImgRef.current) deskImgRef.current.style.transform = "scale(2.4)"; setDeskZoom(true); }, 120); };
  const onDeskUp    = () => { clearTimeout(deskTimer.current); if (deskImgRef.current) deskImgRef.current.style.transform = "scale(1)"; setDeskZoom(false); };

  // Mobile touch handlers
  const onMobStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    swipeXRef.current = t.clientX;
    mobTouchStart.current = { x: t.clientX, y: t.clientY };
    mobHoldTimer.current = setTimeout(() => {
      if (mobImgRef.current) {
        const r = mobImgRef.current.getBoundingClientRect();
        setMobZoomPos({ x: Math.max(0, Math.min(100, ((t.clientX-r.left)/r.width)*100)), y: Math.max(0, Math.min(100, ((t.clientY-r.top)/r.height)*100)) });
      }
      setMobZoom(true);
    }, 350);
  };
  const onMobMove = (e) => {
    if (!mobTouchStart.current) return;
    if (Math.abs(e.touches[0].clientX - mobTouchStart.current.x) > 8 || Math.abs(e.touches[0].clientY - mobTouchStart.current.y) > 8) clearTimeout(mobHoldTimer.current);
    if (mobZoom) e.preventDefault();
  };
  const onMobEnd = (e) => {
    clearTimeout(mobHoldTimer.current);
    if (mobZoom) { setMobZoom(false); return; }
    const dx = (swipeXRef.current || 0) - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 44 && total > 1) { dx > 0 ? next() : prev(); }
    swipeXRef.current = null; mobTouchStart.current = null;
  };

  const handleAdd = () => { onAddToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };

  const InfoPanel = ({ mobile = false }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Badge */}
      <p style={{ fontSize: "8px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: mobile ? "10px" : "14px" }}>{product.badge}</p>

      {/* Name — bigger and bolder on mobile */}
      <h1 className="serif" style={{ fontSize: mobile ? "clamp(34px,9vw,44px)" : "clamp(28px,3vw,44px)", fontWeight: 300, lineHeight: 1.05, marginBottom: "6px", color: "#1A1816" }}>{product.name}</h1>

      {/* Description */}
      <p style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: mobile ? "20px" : "26px" }}>{product.description}</p>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: mobile ? "22px" : "30px" }}>
        <span className="serif" style={{ fontSize: mobile ? "36px" : "40px", fontWeight: 300, color: "#1A1816" }}>{product.price?.toLocaleString()}</span>
        <span style={{ fontSize: "13px", color: "#9A9590", letterSpacing: "0.05em" }}>EGP</span>
      </div>

      {/* One-piece notice */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "13px 15px", backgroundColor: "#F5F0E8", borderRadius: "4px", marginBottom: mobile ? "22px" : "28px", border: "1px solid #E8DDD0" }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "5px" }} />
        <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: mobile ? "28px" : "32px" }}>
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

      <div style={{ height: "1px", backgroundColor: "#EDEBE7", marginBottom: "20px" }} />

      {/* Details */}
      {product.details && (
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "10px" }}>About This Piece</p>
          <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.95, fontWeight: 300 }}>{product.details}</p>
        </div>
      )}

      {/* Material / Care */}
      {(product.material || product.care) && (
        <div>
          {[["Material", product.material], ["Care", product.care]].filter(([,v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "12px 0", borderBottom: "1px solid #EDEBE7" }}>
              <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: "12px", color: "#1A1816", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAFAF9", minHeight: "100vh" }}>

      {/* ══════════ DESKTOP (≥769px) ══════════ */}
      <div className="pp-desk" style={{ display: "grid", gridTemplateColumns: "1fr 400px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 58px)" }}>

        {/* Left: thumbnails + main image */}
        <div style={{ display: "flex", gap: "14px", padding: "32px 28px 32px 48px", alignItems: "flex-start" }}>

          {/* Thumbnail column */}
          {total > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: "68px", height: "86px", border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`, borderRadius: "3px", overflow: "hidden", padding: 0, cursor: "pointer", backgroundColor: "#EDEBE7", transition: "border-color 0.2s" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div ref={deskDivRef}
            onMouseMove={onDeskMove} onMouseDown={onDeskDown} onMouseUp={onDeskUp} onMouseLeave={onDeskUp}
            style={{ flex: 1, position: "relative", backgroundColor: "#EDEBE7", borderRadius: "4px", overflow: "hidden", aspectRatio: "2/3", cursor: deskZoom ? "zoom-in" : "default", userSelect: "none" }}>
            {imgs.length > 0
              ? <img ref={deskImgRef} src={imgs[imgIdx]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s", transform: "scale(1)", pointerEvents: "none" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>🧥</div>}
            {product.tag && <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "rgba(26,24,22,0.75)", backdropFilter: "blur(6px)", color: "#FAF9F7", padding: "5px 12px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>}
            {total > 1 && <>
              <button onClick={prev} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", zIndex: 2 }}><ChevronLeft size={14} strokeWidth={1.8} /></button>
              <button onClick={next} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", zIndex: 2 }}><ChevronRight size={14} strokeWidth={1.8} /></button>
            </>}
            {!deskZoom && imgs.length > 0 && (
              <div style={{ position: "absolute", bottom: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.45)", backdropFilter: "blur(4px)", color: "#FAF9F7", padding: "5px 10px", borderRadius: "2px", fontSize: "8px", letterSpacing: "0.1em", pointerEvents: "none" }}>Hold to zoom</div>
            )}
          </div>
        </div>

        {/* Right: info panel */}
        <div style={{ padding: "40px 48px 40px 0", borderLeft: "1px solid #EDEBE7", position: "sticky", top: "58px", height: "calc(100vh - 58px)", overflowY: "auto" }}>
          <InfoPanel />
        </div>
      </div>

      {/* ══════════ MOBILE (≤768px) ══════════ */}
      <div className="pp-mob" style={{ flexDirection: "column" }}>

        {/* Main image — full width */}
        <div ref={mobImgRef} onTouchStart={onMobStart} onTouchMove={onMobMove} onTouchEnd={onMobEnd}
          style={{ position: "relative", backgroundColor: "#EDEBE7", overflow: "hidden", aspectRatio: "3/4", userSelect: "none", touchAction: mobZoom ? "none" : "pan-y" }}>
          {imgs.length > 0
            ? <img src={imgs[imgIdx]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", transition: "transform 0.3s",
                ...(mobZoom ? { transform: "scale(2.2)", transformOrigin: `${mobZoomPos.x}% ${mobZoomPos.y}%` } : {}) }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🧥</div>}
          {product.tag && <div style={{ position: "absolute", top: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.75)", color: "#FAF9F7", padding: "4px 10px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>}
          {total > 1 && (
            <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
              {imgs.map((_, i) => <div key={i} style={{ width: imgIdx === i ? "20px" : "5px", height: "4px", borderRadius: "2px", backgroundColor: imgIdx === i ? "#1A1816" : "rgba(26,24,22,0.2)", transition: "all 0.25s" }} />)}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div style={{ display: "flex", gap: "6px", padding: "10px 16px", backgroundColor: "#FAFAF9", overflowX: "auto" }}>
            {imgs.map((src, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: "60px", height: "76px", flexShrink: 0, border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`, borderRadius: "3px", overflow: "hidden", padding: 0, cursor: "pointer", backgroundColor: "#EDEBE7", transition: "border-color 0.2s" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        )}

        {/* Mobile info */}
        <div style={{ padding: "24px 18px 80px" }}>
          <InfoPanel mobile />
        </div>
      </div>

    </div>
  );
}
