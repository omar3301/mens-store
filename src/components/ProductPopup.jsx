import { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function ProductPopup({ product, onClose, onAddToCart }) {
  const [imgIdx, setImgIdx]   = useState(0);
  const [added, setAdded]     = useState(false);
  const [closing, setClosing] = useState(false);

  // Desktop zoom — direct DOM, zero re-renders on mousemove
  const [zoomActive, setZoomActive] = useState(false);
  const zoomImgRef  = useRef(null);
  const zoomDivRef  = useRef(null);
  const holdTimer   = useRef(null);

  // Mobile swipe-down-to-close
  const [sheetY, setSheetY]   = useState(0);
  const sheetDragStart        = useRef(null);
  const isDraggingSheet       = useRef(false);

  // Mobile touch zoom
  const [mobZoom, setMobZoom]       = useState(false);
  const [mobZoomPos, setMobZoomPos] = useState({ x: 50, y: 50 });
  const mobImgRef    = useRef(null);
  const mobHoldTimer = useRef(null);
  const mobTouchStart= useRef(null);
  const swipeXRef    = useRef(null);

  const imgs  = product.images?.length > 0 ? product.images : null;
  const total = imgs ? imgs.length : 0;

  // Lock scroll + compensate scrollbar width
  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow     = "hidden";
    document.body.style.paddingRight = sw > 0 ? `${sw}px` : "";
    return () => {
      document.body.style.overflow     = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const smoothClose = () => { setClosing(true); setTimeout(onClose, 300); };
  const prev = () => setImgIdx(i => (i - 1 + total) % total);
  const next = () => setImgIdx(i => (i + 1) % total);

  // ── Desktop zoom (no re-renders on mousemove) ────────
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
  const onDesktopMouseLeave = () => {
    clearTimeout(holdTimer.current);
    if (zoomImgRef.current) zoomImgRef.current.style.transform = "scale(1)";
    setZoomActive(false);
  };

  // ── Mobile swipe-down handle ─────────────────────────
  const onHandleTouchStart = (e) => {
    isDraggingSheet.current = true;
    sheetDragStart.current  = e.touches[0].clientY;
  };
  const onHandleTouchMove = (e) => {
    if (!isDraggingSheet.current) return;
    setSheetY(Math.max(0, e.touches[0].clientY - sheetDragStart.current));
  };
  const onHandleTouchEnd = () => {
    isDraggingSheet.current = false;
    sheetY > 90 ? smoothClose() : setSheetY(0);
  };

  // ── Mobile image touch (swipe gallery + long-press zoom) ─
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
    swipeXRef.current     = null;
    mobTouchStart.current = null;
  };

  const handleAdd = () => {
    onAddToCart(product, "One Size", "");
    setAdded(true);
    setTimeout(() => smoothClose(), 1300);
  };

  // ── Image panel (shared desktop/mobile) ─────────────
  const ImagePanel = ({ mobile = false }) => (
    <div
      ref={mobile ? mobImgRef : zoomDivRef}
      onMouseMove={!mobile ? onDesktopMouseMove : undefined}
      onMouseDown={!mobile ? onDesktopMouseDown : undefined}
      onMouseUp={!mobile ? onDesktopMouseUp : undefined}
      onMouseLeave={!mobile ? onDesktopMouseLeave : undefined}
      onTouchStart={mobile ? onMobImgTouchStart : undefined}
      onTouchMove={mobile ? onMobImgTouchMove : undefined}
      onTouchEnd={mobile ? onMobImgTouchEnd : undefined}
      style={{
        position: "relative", backgroundColor: "#EDEAE4",
        overflow: "hidden", userSelect: "none",
        cursor: zoomActive ? "zoom-in" : "default",
        touchAction: mobZoom ? "none" : "pan-y",
        ...(mobile ? { width: "100%", aspectRatio: "4/5" } : { width: "52%", flexShrink: 0 }),
      }}
    >
      {imgs ? (
        <img
          ref={!mobile ? zoomImgRef : undefined}
          src={imgs[imgIdx]} alt={product.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: "scale(1)", transformOrigin: "50% 50%",
            pointerEvents: "none",
            ...(mobile && mobZoom
              ? { transform: "scale(2.2)", transformOrigin: `${mobZoomPos.x}% ${mobZoomPos.y}%` }
              : {}),
          }}
        />
      ) : <div style={{ width: "100%", height: "100%", backgroundColor: "#EDEAE4" }} />}

      {/* Zoom hint */}
      {imgs && !zoomActive && !mobZoom && (
        <div style={{ position: "absolute", bottom: "14px", right: "14px", backgroundColor: "rgba(26,24,22,0.55)", backdropFilter: "blur(4px)", color: "#FAF9F7", padding: "5px 11px", borderRadius: "2px", fontSize: "8px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "0.12em", pointerEvents: "none" }}>
          <ZoomIn size={9} strokeWidth={1.8} /> Hold to zoom
        </div>
      )}

      {/* Edition badge */}
      <div style={{ position: "absolute", top: "16px", left: "16px", fontSize: "8px", fontWeight: 500, letterSpacing: "0.22em", color: "rgba(250,249,247,0.88)", textTransform: "uppercase" }}>{product.badge}</div>

      {/* Tag */}
      {product.tag && (
        <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "rgba(26,24,22,0.72)", backdropFilter: "blur(6px)", color: "#FAF9F7", padding: "4px 10px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "2px" }}>{product.tag}</div>
      )}

      {/* Arrows */}
      {total > 1 && <>
        <button onClick={prev} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}><ChevronLeft size={14} strokeWidth={1.8} /></button>
        <button onClick={next} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(250,249,247,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}><ChevronRight size={14} strokeWidth={1.8} /></button>
      </>}

      {/* Dots */}
      {total > 1 && (
        <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px", zIndex: 2 }}>
          {imgs.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} style={{ width: imgIdx === i ? "18px" : "5px", height: "5px", borderRadius: "3px", backgroundColor: imgIdx === i ? "#FAF9F7" : "rgba(250,249,247,0.4)", border: "none", padding: 0, transition: "all 0.2s", cursor: "pointer" }} />
          ))}
        </div>
      )}
    </div>
  );

  // ── Info panel (shared desktop/mobile) ──────────────
  const InfoPanel = ({ mobile = false }) => (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {/* Close */}
      <div style={{ padding: mobile ? "16px 20px 0" : "20px 26px 0", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        <button onClick={smoothClose} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#EDEAE4", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#E0DBD4"}
          onMouseLeave={e => e.currentTarget.style.background = "#EDEAE4"}>
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: mobile ? "8px 20px 32px" : "8px 28px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ fontSize: "8px", letterSpacing: "0.26em", textTransform: "uppercase", color: "#B8966E", fontWeight: 600, marginBottom: "10px" }}>{product.badge}</p>
        <h2 className="serif" style={{ fontSize: mobile ? "28px" : "36px", fontWeight: 400, lineHeight: 1.05, marginBottom: "6px" }}>{product.name}</h2>
        <p style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", fontWeight: 500, marginBottom: "22px" }}>{product.description}</p>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
          <span className="serif" style={{ fontSize: mobile ? "28px" : "34px", fontWeight: 400 }}>{product.price.toLocaleString()}</span>
          <span style={{ fontSize: "13px", color: "#9A9590" }}>EGP</span>
        </div>

        {/* One-piece notice */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", padding: "13px 16px", backgroundColor: "#F5F0E8", borderRadius: "3px", marginBottom: "18px", border: "1px solid #E8DDD0" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8966E", flexShrink: 0, marginTop: "4px" }} />
          <p style={{ fontSize: "11px", color: "#6B5230", fontWeight: 500, lineHeight: 1.7 }}>This is a singular, unrepeatable piece. Once acquired, it is permanently removed from the collection.</p>
        </div>

        {/* Free shipping */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "11px" }}>🚚</span>
          <p style={{ fontSize: "10px", color: "#9A9590" }}>Free delivery on orders above <strong style={{ color: "#1A1816" }}>1,000 EGP</strong></p>
        </div>

        {/* Details */}
        <p style={{ fontSize: "13px", color: "#5A5550", lineHeight: 1.9, marginBottom: "20px", fontWeight: 300 }}>{product.details}</p>

        {/* Material / Care */}
        <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "16px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {[["Material", product.material], ["Care", product.care]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: "11px", color: "#1A1816", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "auto" }}>
          <button onClick={handleAdd} style={{
            width: "100%", padding: "17px 24px",
            backgroundColor: added ? "#2C5F3F" : "#1A1816",
            color: "#FAF9F7", border: "none",
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase",
            fontFamily: "inherit", borderRadius: "3px",
            transition: "all 0.3s", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "9px", cursor: "pointer",
          }}
            onMouseEnter={e => { if (!added) { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.3em"; } }}
            onMouseLeave={e => { if (!added) { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.26em"; } }}
          >
            {added ? <><Check size={13} strokeWidth={2.5} /> Reserved — Closing</> : "Acquire This Piece"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={smoothClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,24,22,0.7)", zIndex: 400, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: closing ? "fadeOut 0.3s ease forwards" : "fadeIn 0.22s ease" }} />

      {/* Desktop modal */}
      <div className="pp-desk" style={{ position: "fixed", top: "50%", left: "50%", zIndex: 401, backgroundColor: "#FAF9F7", width: "min(980px,95vw)", maxHeight: "90vh", borderRadius: "4px", overflow: "hidden", animation: closing ? "modalOut 0.3s ease forwards" : "modalIn 0.42s cubic-bezier(0.22,1,0.36,1)", boxShadow: "0 48px 120px rgba(26,24,22,0.36)" }}>
        <div style={{ display: "flex", height: "100%", maxHeight: "90vh" }}>
          <ImagePanel />
          <InfoPanel />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="pp-mob" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, backgroundColor: "#FAF9F7", borderRadius: "16px 16px 0 0", maxHeight: "94vh", flexDirection: "column", transform: `translateY(${sheetY}px)`, transition: isDraggingSheet.current ? "none" : "transform 0.32s cubic-bezier(0.22,1,0.36,1)", animation: closing ? "none" : "mobSheetIn 0.4s cubic-bezier(0.22,1,0.36,1)", boxShadow: "0 -8px 48px rgba(26,24,22,0.22)" }}>
        <div onTouchStart={onHandleTouchStart} onTouchMove={onHandleTouchMove} onTouchEnd={onHandleTouchEnd} style={{ display: "flex", justifyContent: "center", padding: "13px 0 6px", flexShrink: 0, cursor: "grab", touchAction: "none" }}>
          <div style={{ width: "40px", height: "3px", backgroundColor: "#D8D2CA", borderRadius: "2px" }} />
        </div>
        <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
          <ImagePanel mobile />
          <InfoPanel mobile />
        </div>
      </div>
    </>
  );
}