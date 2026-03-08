import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, Check, ShoppingBag } from "lucide-react";

export default function ProductPage({ product, onBack, onAddToCart, onBuyNow }) {
  const [imgIdx, setImgIdx]     = useState(0);
  const [added, setAdded]       = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [mobZoom, setMobZoom]   = useState(false);
  const [mobZoomPos, setMobZoomPos] = useState({ x: 50, y: 50 });

  const zoomImgRef   = useRef(null);
  const zoomDivRef   = useRef(null);
  const holdTimer    = useRef(null);
  const mobImgRef    = useRef(null);
  const mobHoldTimer = useRef(null);
  const mobTouchStart= useRef(null);
  const swipeXRef    = useRef(null);

  const imgs  = product.images?.length > 0 ? product.images : [];
  const total = imgs.length;

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const prev = () => setImgIdx(i => (i - 1 + total) % total);
  const next = () => setImgIdx(i => (i + 1) % total);

  // Desktop zoom
  const onDesktopMouseMove = (e) => {
    if (!zoomDivRef.current || !zoomImgRef.current) return;
    const r = zoomDivRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width)  * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top)  / r.height) * 100));
    zoomImgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };
  const onDesktopMouseDown = () => {
    holdTimer.current = setTimeout(() => {
      if (zoomImgRef.current) zoomImgRef.current.style.transform = "scale(2.4)";
      setZoomActive(true);
    }, 120);
  };
  const onDesktopMouseUp = () => {
    clearTimeout(holdTimer.current);
    if (zoomImgRef.current) zoomImgRef.current.style.transform = "scale(1)";
    setZoomActive(false);
  };

  // Mobile touch
  const onMobImgTouchStart = (e) => {
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
  const onMobImgTouchMove = (e) => {
    if (!mobTouchStart.current) return;
    const t  = e.touches[0];
    const dx = Math.abs(t.clientX - mobTouchStart.current.x);
    const dy = Math.abs(t.clientY - mobTouchStart.current.y);
    if (dx > 8 || dy > 8) clearTimeout(mobHoldTimer.current);
    if (mobZoom) {
      e.preventDefault();
      if (mobImgRef.current) {
        const r = mobImgRef.current.getBoundingClientRect();
        setMobZoomPos({
          x: Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width)  * 100)),
          y: Math.max(0, Math.min(100, ((t.clientY - r.top)  / r.height) * 100)),
        });
      }
    }
  };
  const onMobImgTouchEnd = (e) => {
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

  const handleBuyNow = () => {
    onBuyNow(product);
  };

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh", animation: "fadeUp 0.5s ease" }}>

      {/* Back bar */}
      <div style={{ padding: "16px clamp(16px,4vw,52px)", borderBottom: "1px solid #EDE9E3", backgroundColor: "rgba(250,249,247,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#7A7570", fontSize: "8px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "inherit", transition: "color 0.2s", padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
            <ArrowLeft size={13} strokeWidth={1.8} /> Back to Collection
          </button>
          <div style={{ marginLeft: "auto", fontSize: "8px", color: "#C5BFB8", letterSpacing: "0.2em", textTransform: "uppercase" }}>{product.badge}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(16px,4vw,52px) 80px" }}>

        {/* Desktop layout */}
        <div className="pp-desk" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", paddingTop: "48px", alignItems: "start" }}>

          {/* Left — image gallery */}
          <div style={{ position: "sticky", top: "80px" }}>
            {/* Main image */}
            <div
              ref={zoomDivRef}
              onMouseMove={onDesktopMouseMove}
              onMouseDown={onDesktopMouseDown}
              onMouseUp={onDesktopMouseUp}
              onMouseLeave={onDesktopMouseUp}
              style={{ position: "relative", backgroundColor: "#EDEAE4", overflow: "hidden", aspectRatio: "3/4", borderRadius: "4px", cursor: zoomActive ? "zoom-in" : "default", userSelect: "none", marginBottom: "12px" }}
            >
              {imgs.length > 0 ? (
                <img
                  ref={zoomImgRef}
                  src={imgs[imgIdx]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: "scale(1)", pointerEvents: "none" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#EDEAE4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🧥</div>
              )}

              {/* Badges */}
              <div style={{ position: "absolute", top: "16px", left: "16px", fontSize: "8px", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,249,247,0.88)", textTransform: "uppercase" }}>{product.badge}</div>
              {product.tag && (
                <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "rgba(26,24,22,0.72)", backdropFilter: "blur(6px)", color: "#FAF9F7", padding: "4px 10px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>
              )}

              {/* Arrows */}
              {total > 1 && <>
                <button onClick={prev} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", zIndex: 2 }}><ChevronLeft size={14} strokeWidth={1.8} /></button>
                <button onClick={next} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", zIndex: 2 }}><ChevronRight size={14} strokeWidth={1.8} /></button>
              </>}

              {/* Zoom hint */}
              {!zoomActive && imgs.length > 0 && (
                <div style={{ position: "absolute", bottom: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.5)", backdropFilter: "blur(4px)", color: "#FAF9F7", padding: "5px 11px", borderRadius: "2px", fontSize: "8px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "0.12em", pointerEvents: "none" }}>
                  <ZoomIn size={9} strokeWidth={1.8} /> Hold to zoom
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {total > 1 && (
              <div style={{ display: "flex", gap: "8px" }}>
                {imgs.map((src, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{ flex: 1, aspectRatio: "3/4", overflow: "hidden", borderRadius: "3px", border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`, padding: 0, cursor: "pointer", backgroundColor: "#EDEAE4", transition: "border-color 0.2s" }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — product info */}
          <div style={{ paddingTop: "8px" }}>
            <p style={{ fontSize: "8px", letterSpacing: "0.26em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: "12px" }}>{product.badge}</p>
            <h1 className="serif" style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 300, lineHeight: 1.05, marginBottom: "8px" }}>{product.name}</h1>
            <p style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "28px" }}>{product.description}</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "28px" }}>
              <span className="serif" style={{ fontSize: "42px", fontWeight: 300 }}>{product.price?.toLocaleString()}</span>
              <span style={{ fontSize: "14px", color: "#9A9590" }}>EGP</span>
            </div>

            {/* One-piece notice */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", padding: "14px 18px", backgroundColor: "#F5F0E8", borderRadius: "4px", marginBottom: "24px", border: "1px solid #E8DDD0" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
            </div>

            {/* Shipping */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
              <span style={{ fontSize: "13px" }}>🚚</span>
              <p style={{ fontSize: "11px", color: "#9A9590" }}>Free delivery on orders above <strong style={{ color: "#1A1816" }}>1,000 EGP</strong> · Cash on delivery</p>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "36px" }}>
              <button onClick={handleBuyNow} style={{ width: "100%", padding: "18px 24px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "9px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.32em"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.28em"; }}>
                Buy Now — Checkout Directly
              </button>
              <button onClick={handleAdd} style={{ width: "100%", padding: "16px 24px", backgroundColor: added ? "#2C5F3F" : "transparent", color: added ? "#FAF9F7" : "#1A1816", border: `1.5px solid ${added ? "#2C5F3F" : "#1A1816"}`, fontSize: "9px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}>
                {added ? <><Check size={13} strokeWidth={2.5} /> Added — Cart Opens</> : <><ShoppingBag size={13} strokeWidth={1.8} /> Add to Cart</>}
              </button>
            </div>

            {/* Details */}
            {product.details && (
              <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "24px", marginBottom: "24px" }}>
                <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "12px" }}>About This Piece</p>
                <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.95, fontWeight: 300 }}>{product.details}</p>
              </div>
            )}

            {/* Material / Care */}
            {(product.material || product.care) && (
              <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[["Material", product.material], ["Care", product.care]].filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                    <span style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: "12px", color: "#1A1816", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="pp-mob" style={{ flexDirection: "column", paddingTop: "24px" }}>
          {/* Mobile image */}
          <div
            ref={mobImgRef}
            onTouchStart={onMobImgTouchStart}
            onTouchMove={onMobImgTouchMove}
            onTouchEnd={onMobImgTouchEnd}
            style={{ position: "relative", backgroundColor: "#EDEAE4", overflow: "hidden", aspectRatio: "3/4", borderRadius: "4px", marginBottom: "12px", userSelect: "none", touchAction: mobZoom ? "none" : "pan-y" }}
          >
            {imgs.length > 0 ? (
              <img src={imgs[imgIdx]} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", pointerEvents: "none",
                  ...(mobZoom ? { transform: "scale(2.2)", transformOrigin: `${mobZoomPos.x}% ${mobZoomPos.y}%` } : {}) }}
              />
            ) : <div style={{ width: "100%", height: "100%", backgroundColor: "#EDEAE4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🧥</div>}

            <div style={{ position: "absolute", top: "14px", left: "14px", fontSize: "8px", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,249,247,0.88)", textTransform: "uppercase" }}>{product.badge}</div>
            {product.tag && <div style={{ position: "absolute", top: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.72)", color: "#FAF9F7", padding: "4px 10px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>}

            {total > 1 && (
              <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
                {imgs.map((_, i) => (
                  <div key={i} style={{ width: imgIdx === i ? "18px" : "5px", height: "5px", borderRadius: "3px", backgroundColor: imgIdx === i ? "#FAF9F7" : "rgba(250,249,247,0.4)", transition: "all 0.2s" }} />
                ))}
              </div>
            )}
          </div>

          {/* Mobile thumbnails */}
          {total > 1 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ flex: 1, aspectRatio: "3/4", overflow: "hidden", borderRadius: "3px", border: `2px solid ${imgIdx === i ? "#1A1816" : "transparent"}`, padding: 0, cursor: "pointer", backgroundColor: "#EDEAE4" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          )}

          {/* Mobile info */}
          <p style={{ fontSize: "8px", letterSpacing: "0.26em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: "10px" }}>{product.badge}</p>
          <h1 className="serif" style={{ fontSize: "32px", fontWeight: 300, lineHeight: 1.05, marginBottom: "6px" }}>{product.name}</h1>
          <p style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "20px" }}>{product.description}</p>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
            <span className="serif" style={{ fontSize: "36px", fontWeight: 300 }}>{product.price?.toLocaleString()}</span>
            <span style={{ fontSize: "13px", color: "#9A9590" }}>EGP</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", padding: "13px 16px", backgroundColor: "#F5F0E8", borderRadius: "4px", marginBottom: "20px", border: "1px solid #E8DDD0" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "4px" }} />
            <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
          </div>

          {/* Mobile CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
            <button onClick={handleBuyNow} style={{ width: "100%", padding: "18px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "9px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer" }}>
              Buy Now — Checkout Directly
            </button>
            <button onClick={handleAdd} style={{ width: "100%", padding: "16px", backgroundColor: added ? "#2C5F3F" : "transparent", color: added ? "#FAF9F7" : "#1A1816", border: `1.5px solid ${added ? "#2C5F3F" : "#1A1816"}`, fontSize: "9px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {added ? <><Check size={13} strokeWidth={2.5} /> Added — Cart Opens</> : <><ShoppingBag size={13} strokeWidth={1.8} /> Add to Cart</>}
            </button>
          </div>

          {product.details && (
            <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "20px", marginBottom: "20px" }}>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "12px" }}>About This Piece</p>
              <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.95, fontWeight: 300 }}>{product.details}</p>
            </div>
          )}

          {(product.material || product.care) && (
            <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {[["Material", product.material], ["Care", product.care]].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
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
