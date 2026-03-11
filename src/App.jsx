import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ShoppingBag, X, ChevronLeft, ChevronRight, Plus, Minus,
  Trash2, Check, Search, Menu, ArrowRight, Package, ChevronDown
} from "lucide-react";

// ─── CONFIG ──────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "https://back-end-production-afdf.up.railway.app";

let SHIPPING_COST = 60;
let FREE_THRESHOLD = 1500;
let SHIPPING_ON = true;

const EGYPT_GOVS = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum",
  "Gharbia","Ismailia","Menofia","Minya","Qalyubia","New Valley","Suez",
  "Aswan","Assiut","Beni Suef","Port Said","Damietta","Sharkia",
  "South Sinai","Kafr El Sheikh","Matruh","Luxor","Qena","North Sinai","Sohag"
];

const CATS = [
  { id:"all", label:"All" },
  { id:"shirts", label:"Shirts" },
  { id:"tshirts", label:"T-Shirts" },
  { id:"coats", label:"Coats" },
  { id:"pants", label:"Pants" },
  { id:"shoes", label:"Shoes" },
];

const FALLBACK = [
  { id:1, category:"shirts", name:"Nordic Sailing Shirt", price:850, badge:"Shirts",
    description:"Oxford cotton · Button-down", sizes:["S","M","L","XL","XXL"],
    colors:[{name:"Sky Blue",hex:"#AECDE3"}],
    images:["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"],
    discount:{enabled:false} },
  { id:2, category:"shirts", name:"Pierre Cardin Sail Club", price:1200, badge:"Shirts", tag:"Pierre Cardin",
    description:"Slim fit · Embroidered", sizes:["S","M","L","XL"],
    colors:[{name:"Cream",hex:"#F5EEE0"}],
    images:["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80"],
    discount:{enabled:false} },
  { id:3, category:"coats", name:"Pierre Cardin Trench", price:3500, badge:"Coats", tag:"Pierre Cardin",
    description:"Double-breasted · Black", sizes:["S","M","L","XL"],
    colors:[{name:"Black",hex:"#1A1A1A"}],
    images:["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    discount:{enabled:false} },
  { id:4, category:"pants", name:"Slim Chinos", price:650, badge:"Pants",
    description:"Stretch twill · Tapered", sizes:["28","30","32","34","36"],
    colors:[{name:"Khaki",hex:"#C8B99A"},{name:"Black",hex:"#111"}],
    images:["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
    discount:{enabled:false} },
  { id:5, category:"tshirts", name:"Essential Cotton Tee", price:350, badge:"T-Shirts",
    description:"100% cotton · Regular fit", sizes:["S","M","L","XL","XXL"],
    colors:[{name:"White",hex:"#F5F5F0"},{name:"Black",hex:"#111"}],
    images:["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"],
    discount:{enabled:true,type:"percent",value:15} },
  { id:6, category:"shoes", name:"Leather Derby", price:1800, badge:"Shoes",
    description:"Full-grain leather · Goodyear", sizes:["40","41","42","43","44","45"],
    colors:[{name:"Brown",hex:"#6B3A2A"}],
    images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    discount:{enabled:false} },
];

// ─── HELPERS ─────────────────────────────────────────
const firstImg = (p) => p?.images?.[0] ?? null;

function effPrice(p) {
  const d = p.discount;
  if (!d?.enabled || !d?.value) return p.price;
  if (d.type === "percent") return Math.round(p.price * (1 - d.value / 100));
  return Math.max(0, p.price - d.value);
}

function discLabel(p) {
  const d = p.discount;
  if (!d?.enabled || !d?.value) return null;
  return d.type === "percent" ? `${d.value}% OFF` : `-${d.value} EGP`;
}

function getShip(sub) {
  if (!SHIPPING_ON) return 0;
  return sub >= FREE_THRESHOLD ? 0 : SHIPPING_COST;
}

// ─── GLOBAL CSS ──────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
  body{
    background:#0C0C0C;
    color:#F0EDEA;
    font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased;
    min-height:100vh;
  }
  a{text-decoration:none;color:inherit;}
  button{-webkit-tap-highlight-color:transparent;cursor:pointer;border:none;background:none;font-family:inherit;}
  input,select,textarea{-webkit-appearance:none;font-family:inherit;}

  :root {
    --bg: #0C0C0C;
    --surface: #161616;
    --surface2: #1E1E1E;
    --border: rgba(255,255,255,0.08);
    --text: #F0EDEA;
    --muted: rgba(240,237,234,0.45);
    --accent: #E8C170;
    --accent2: #C4955A;
    --red: #E05252;
    --green: #4CAF7D;
    --r: 12px;
    --r-sm: 8px;
  }

  .font-display { font-family: 'Syne', sans-serif; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes bump { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(232,193,112,0.1)} 50%{box-shadow:0 0 40px rgba(232,193,112,0.25)} }

  /* Shimmer for skeleton */
  @keyframes shimmer {
    0%{background-position:-400px 0}
    100%{background-position:400px 0}
  }
  .skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* Mobile-first product grid */
  .pgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  @media(min-width:640px) { .pgrid { grid-template-columns:repeat(3,1fr); gap:16px; } }
  @media(min-width:1024px) { .pgrid { grid-template-columns:repeat(4,1fr); gap:20px; } }

  /* Nav desktop links */
  .nav-links { display:none; }
  @media(min-width:768px) { .nav-links { display:flex; } }

  .cart-side { width: min(420px, 100vw); }
  
  /* Checkout layout */
  .co-grid { display:grid; grid-template-columns:1fr; gap:24px; }
  @media(min-width:768px) { .co-grid { grid-template-columns:1fr 360px; } }

  /* Glass card effect */
  .glass {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* Focus ring */
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px rgba(232,193,112,0.12);
  }

  /* Touch target minimum */
  .touch-target { min-height: 44px; min-width: 44px; }
`;

// ─── SKELETON ────────────────────────────────────────
const ProductSkeleton = () => (
  <div>
    <div className="skeleton" style={{ aspectRatio:"3/4", borderRadius:"var(--r)" }} />
    <div style={{ marginTop:12 }}>
      <div className="skeleton" style={{ height:12, width:"60%", marginBottom:8 }} />
      <div className="skeleton" style={{ height:16, width:"80%", marginBottom:8 }} />
      <div className="skeleton" style={{ height:14, width:"40%" }} />
    </div>
  </div>
);

// ─── PRODUCT CARD ────────────────────────────────────
const ProductCard = memo(({ product, idx, onTap }) => {
  const img = firstImg(product);
  const sp = effPrice(product);
  const disc = discLabel(product);
  const hasDisc = sp < product.price;

  return (
    <div
      onClick={() => onTap(product)}
      style={{
        animation: `fadeUp 0.5s ease ${idx * 0.06}s both`,
        cursor: "pointer",
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        aspectRatio: "3/4",
        borderRadius: "var(--r)",
        overflow: "hidden",
        background: "var(--surface)",
      }}>
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>
            👕
          </div>
        )}
        {/* Badges */}
        <div style={{ position:"absolute", top:10, left:10, display:"flex", flexDirection:"column", gap:5 }}>
          {disc && (
            <span style={{
              background: "var(--accent)", color: "#0C0C0C",
              padding: "3px 8px", borderRadius: 20,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              fontFamily: "'Syne', sans-serif"
            }}>{disc}</span>
          )}
          {product.tag && !disc && (
            <span style={{
              background: "rgba(12,12,12,0.85)", color: "#F0EDEA",
              padding: "3px 8px", borderRadius: 20,
              fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
              backdropFilter: "blur(8px)"
            }}>{product.tag}</span>
          )}
        </div>
        {/* Quick add overlay */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding:"10px", background:"linear-gradient(transparent, rgba(12,12,12,0.85))",
          opacity:0, transition:"opacity 0.25s",
        }}
          className="card-overlay"
        >
          <div style={{
            background:"var(--accent)", color:"#0C0C0C",
            borderRadius:"var(--r-sm)", padding:"8px",
            textAlign:"center", fontSize:11, fontWeight:700,
            fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em"
          }}>VIEW</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop:10, paddingInline:2 }}>
        <p style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
          {product.badge || product.category}
        </p>
        <h3 style={{
          fontFamily:"'Syne',sans-serif",
          fontSize:14, fontWeight:600,
          lineHeight:1.3, marginBottom:6,
          color:"var(--text)"
        }}>{product.name}</h3>
        <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
          <span style={{ fontSize:14, fontWeight:600, color: hasDisc ? "var(--accent)" : "var(--text)" }}>
            {sp.toLocaleString()} EGP
          </span>
          {hasDisc && (
            <span style={{ fontSize:11, color:"var(--muted)", textDecoration:"line-through" }}>
              {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <style>{`.card-overlay:hover,.card-overlay-show{opacity:1!important} [data-card]:hover .card-overlay{opacity:1}`}</style>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

// ─── PRODUCT POPUP ───────────────────────────────────
function ProductPopup({ product, onClose, onAddToCart }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [selSize, setSelSize] = useState("");
  const [selColor, setSelColor] = useState(product.colors?.[0] || null);
  const [added, setAdded] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef(null);
  const [sheetY, setSheetY] = useState(0);
  const dragStart = useRef(null);
  const isDragging = useRef(false);

  const imgs = product.images?.length ? product.images : null;
  const total = imgs?.length || 0;
  const sp = effPrice(product);
  const hasDisc = sp < product.price;
  const disc = discLabel(product);
  const needsSize = product.sizes?.length > 0;
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const close = () => { setClosing(true); setTimeout(onClose, 280); };

  const handleAdd = () => {
    if (needsSize && !selSize) { setSizeErr(true); return; }
    onAddToCart(product, selSize || "One Size", selColor?.name || "");
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // Swipe down to close on mobile
  const onHandleTouchStart = (e) => { isDragging.current = true; dragStart.current = e.touches[0].clientY; };
  const onHandleTouchMove = (e) => {
    if (!isDragging.current) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStart.current);
    setSheetY(dy);
  };
  const onHandleTouchEnd = () => {
    isDragging.current = false;
    sheetY > 100 ? close() : setSheetY(0);
  };

  return (
    <>
      <div onClick={close} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:900,
        backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
        animation:"fadeIn 0.2s ease",
        opacity: closing ? 0 : 1, transition:"opacity 0.28s"
      }}/>
      {isMobile ? (
        // Mobile: bottom sheet
        <div
          ref={sheetRef}
          style={{
            position:"fixed", bottom:0, left:0, right:0, zIndex:901,
            background:"var(--surface)", borderRadius:"20px 20px 0 0",
            maxHeight:"92vh", overflow:"hidden",
            display:"flex", flexDirection:"column",
            transform: closing ? "translateY(100%)" : `translateY(${sheetY}px)`,
            transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.25,1,0.5,1)",
            animation: closing ? "none" : "slideUp 0.35s cubic-bezier(0.25,1,0.5,1)",
          }}
        >
          {/* Drag handle */}
          <div
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
            style={{ padding:"12px 0 4px", display:"flex", justifyContent:"center", flexShrink:0 }}
          >
            <div style={{ width:36, height:4, background:"var(--border)", borderRadius:2 }}/>
          </div>

          <div style={{ overflowY:"auto", flex:1, paddingBottom:"env(safe-area-inset-bottom,16px)" }}>
            {/* Image gallery */}
            {imgs && (
              <div style={{ position:"relative", aspectRatio:"4/3", background:"var(--surface2)" }}>
                <img src={imgs[imgIdx]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                {total > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i-1+total)%total)} style={{
                      position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                      width:36, height:36, borderRadius:"50%",
                      background:"rgba(12,12,12,0.7)", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}><ChevronLeft size={16}/></button>
                    <button onClick={() => setImgIdx(i => (i+1)%total)} style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      width:36, height:36, borderRadius:"50%",
                      background:"rgba(12,12,12,0.7)", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}><ChevronRight size={16}/></button>
                    <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
                      {imgs.map((_,i) => (
                        <button key={i} onClick={() => setImgIdx(i)} style={{
                          width:i===imgIdx?18:6, height:6, borderRadius:3,
                          background: i===imgIdx ? "var(--accent)" : "rgba(255,255,255,0.3)",
                          transition:"all 0.2s"
                        }}/>
                      ))}
                    </div>
                  </>
                )}
                {disc && <div style={{
                  position:"absolute", top:12, left:12,
                  background:"var(--accent)", color:"#0C0C0C",
                  padding:"4px 10px", borderRadius:20,
                  fontSize:11, fontWeight:700, fontFamily:"'Syne',sans-serif"
                }}>{disc}</div>}
              </div>
            )}

            <div style={{ padding:"18px 20px" }}>
              <p style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                {product.badge || product.category}
              </p>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, marginBottom:10, lineHeight:1.2 }}>
                {product.name}
              </h2>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:16 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color: hasDisc ? "var(--accent)" : "var(--text)" }}>
                  {sp.toLocaleString()} EGP
                </span>
                {hasDisc && <span style={{ fontSize:14, color:"var(--muted)", textDecoration:"line-through" }}>{product.price.toLocaleString()}</span>}
              </div>

              {product.description && (
                <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7, marginBottom:16 }}>{product.description}</p>
              )}

              {/* Colors */}
              {product.colors?.length > 1 && (
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
                    Color — <span style={{ color:"var(--text)" }}>{selColor?.name}</span>
                  </p>
                  <div style={{ display:"flex", gap:8 }}>
                    {product.colors.map(c => (
                      <button key={c.name} onClick={() => setSelColor(c)} title={c.name} style={{
                        width:28, height:28, borderRadius:"50%", background:c.hex,
                        border: selColor?.name===c.name ? "3px solid var(--accent)" : "2px solid var(--border)",
                        outline: selColor?.name===c.name ? "2px solid var(--accent)" : "none",
                        outlineOffset: 1, transition:"all 0.2s"
                      }}/>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {needsSize && (
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8,
                    color: sizeErr ? "var(--red)" : "var(--muted)"
                  }}>
                    Size {sizeErr && "— Please select"}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {product.sizes.map(s => (
                      <button key={s} onClick={() => { setSelSize(s); setSizeErr(false); }} style={{
                        minWidth:44, padding:"8px 12px",
                        borderRadius:"var(--r-sm)",
                        border: selSize===s ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: selSize===s ? "rgba(232,193,112,0.12)" : "var(--surface2)",
                        color: selSize===s ? "var(--accent)" : "var(--text)",
                        fontSize:13, fontWeight:600,
                        transition:"all 0.15s"
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add button */}
              <button onClick={handleAdd} style={{
                width:"100%", padding:"16px",
                borderRadius:"var(--r)",
                background: added ? "var(--green)" : "var(--accent)",
                color: "#0C0C0C",
                fontSize:13, fontWeight:700,
                fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"all 0.2s", transform: added ? "scale(0.98)" : "scale(1)"
              }}>
                {added ? <><Check size={16}/> Added to Bag</> : <><ShoppingBag size={16}/> Add to Bag</>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Desktop: centered modal
        <div style={{
          position:"fixed", top:"50%", left:"50%",
          transform: closing ? "translate(-50%,-50%) scale(0.95)" : "translate(-50%,-50%) scale(1)",
          zIndex:901,
          width:"min(900px,95vw)", maxHeight:"88vh",
          background:"var(--surface)", borderRadius:"var(--r)",
          overflow:"hidden", display:"flex",
          animation: closing ? "none" : "scaleIn 0.3s cubic-bezier(0.25,1,0.5,1)",
          transition:"transform 0.28s, opacity 0.28s",
          opacity: closing ? 0 : 1,
          boxShadow:"0 40px 100px rgba(0,0,0,0.7)"
        }}>
          {/* Left: image */}
          <div style={{ flex:"0 0 50%", background:"var(--surface2)", position:"relative", overflow:"hidden" }}>
            {imgs ? (
              <>
                <img src={imgs[imgIdx]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                {total > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i-1+total)%total)} style={{
                      position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                      width:38, height:38, borderRadius:"50%",
                      background:"rgba(12,12,12,0.8)", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}><ChevronLeft size={16}/></button>
                    <button onClick={() => setImgIdx(i => (i+1)%total)} style={{
                      position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                      width:38, height:38, borderRadius:"50%",
                      background:"rgba(12,12,12,0.8)", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}><ChevronRight size={16}/></button>
                    {/* Thumbnails */}
                    <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6 }}>
                      {imgs.map((_,i) => (
                        <button key={i} onClick={() => setImgIdx(i)} style={{
                          width:i===imgIdx?24:8, height:8, borderRadius:4,
                          background: i===imgIdx ? "var(--accent)" : "rgba(255,255,255,0.35)",
                          transition:"all 0.2s"
                        }}/>
                      ))}
                    </div>
                  </>
                )}
                {disc && <div style={{
                  position:"absolute", top:16, left:16,
                  background:"var(--accent)", color:"#0C0C0C",
                  padding:"5px 12px", borderRadius:20,
                  fontSize:11, fontWeight:700, fontFamily:"'Syne',sans-serif"
                }}>{disc}</div>}
              </>
            ) : (
              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60 }}>👕</div>
            )}
          </div>

          {/* Right: info */}
          <div style={{ flex:1, overflowY:"auto", padding:"32px" }}>
            <button onClick={close} style={{
              position:"absolute", top:16, right:16,
              width:36, height:36, borderRadius:"50%",
              background:"var(--surface2)", color:"var(--muted)",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.15s"
            }} onMouseEnter={e => e.currentTarget.style.color="var(--text)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}>
              <X size={16}/>
            </button>

            <p style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>
              {product.badge || product.category}
            </p>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, lineHeight:1.2, marginBottom:12 }}>
              {product.name}
            </h2>
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:20 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color: hasDisc ? "var(--accent)" : "var(--text)" }}>
                {sp.toLocaleString()} EGP
              </span>
              {hasDisc && <span style={{ fontSize:14, color:"var(--muted)", textDecoration:"line-through" }}>{product.price.toLocaleString()}</span>}
            </div>

            {product.description && (
              <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.75, marginBottom:20 }}>{product.description}</p>
            )}
            {product.details && (
              <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.75, marginBottom:20, paddingTop:16, borderTop:"1px solid var(--border)" }}>{product.details}</p>
            )}

            {/* Colors */}
            {product.colors?.length > 1 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
                  Color — <span style={{ color:"var(--text)" }}>{selColor?.name}</span>
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setSelColor(c)} title={c.name} style={{
                      width:30, height:30, borderRadius:"50%", background:c.hex,
                      border: selColor?.name===c.name ? "3px solid var(--accent)" : "2px solid var(--border)",
                      outline: selColor?.name===c.name ? "2px solid var(--accent)" : "none",
                      outlineOffset:1, transition:"all 0.2s"
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {needsSize && (
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10,
                  color: sizeErr ? "var(--red)" : "var(--muted)"
                }}>Size {sizeErr && <span style={{ color:"var(--red)" }}>— Select a size</span>}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => { setSelSize(s); setSizeErr(false); }} style={{
                      minWidth:48, padding:"9px 14px",
                      borderRadius:"var(--r-sm)",
                      border: selSize===s ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: selSize===s ? "rgba(232,193,112,0.12)" : "transparent",
                      color: selSize===s ? "var(--accent)" : "var(--muted)",
                      fontSize:13, fontWeight:600,
                      transition:"all 0.15s"
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAdd} style={{
              width:"100%", padding:"16px",
              borderRadius:"var(--r)",
              background: added ? "var(--green)" : "var(--accent)",
              color: "#0C0C0C",
              fontSize:13, fontWeight:700,
              fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.2s"
            }}>
              {added ? <><Check size={16}/> Added!</> : <><ShoppingBag size={16}/> Add to Bag</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── CART DRAWER ─────────────────────────────────────
function CartDrawer({ cart, onClose, onCheckout, onUpdateQty, onRemoveItem }) {
  const [closing, setClosing] = useState(false);
  const subtotal = cart.reduce((s, i) => s + effPrice(i) * (i.qty||1), 0);
  const ship = getShip(subtotal);
  const total = subtotal + ship;
  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const close = () => { setClosing(true); setTimeout(onClose, 280); };

  return (
    <>
      <div onClick={close} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:800,
        backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
        animation:"fadeIn 0.2s ease",
        opacity: closing ? 0 : 1, transition:"opacity 0.28s"
      }}/>
      <div className="cart-side" style={{
        position:"fixed", top:0, right:0, bottom:0, zIndex:801,
        background:"var(--surface)",
        display:"flex", flexDirection:"column",
        borderLeft:"1px solid var(--border)",
        transform: closing ? "translateX(100%)" : "translateX(0)",
        transition:"transform 0.3s cubic-bezier(0.25,1,0.5,1)",
        animation: closing ? "none" : "slideRight 0.35s cubic-bezier(0.25,1,0.5,1)",
        paddingBottom:"env(safe-area-inset-bottom,0px)"
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 20px 16px",
          borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <ShoppingBag size={18} color="var(--accent)"/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>
              Your Bag
            </span>
            {cart.length > 0 && (
              <span style={{
                background:"var(--accent)", color:"#0C0C0C",
                width:20, height:20, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:800
              }}>{cart.length}</span>
            )}
          </div>
          <button onClick={close} style={{
            width:34, height:34, borderRadius:"50%",
            background:"var(--surface2)", color:"var(--muted)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.15s"
          }} onMouseEnter={e => e.currentTarget.style.color="var(--text)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}>
            <X size={15}/>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 20px" }}>
          {cart.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, color:"var(--muted)" }}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p style={{ fontSize:14 }}>Your bag is empty</p>
            </div>
          ) : (
            <div style={{ paddingBlock:16, display:"flex", flexDirection:"column", gap:14 }}>
              {cart.map(item => {
                const key = `${item._id||item.id}-${item.size}-${item.colorName||item.color}`;
                const sp = effPrice(item);
                const hasD = sp < item.price;
                const img = firstImg(item);
                return (
                  <div key={key} style={{
                    display:"flex", gap:12,
                    padding:"14px", borderRadius:"var(--r)",
                    background:"var(--surface2)", border:"1px solid var(--border)"
                  }}>
                    <div style={{
                      width:64, height:78, borderRadius:"var(--r-sm)",
                      overflow:"hidden", background:"#111", flexShrink:0
                    }}>
                      {img && <img src={img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, marginBottom:4, lineHeight:1.3 }}>{item.name}</p>
                      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        {item.size && item.size!=="One Size" && (
                          <span style={{ fontSize:10, color:"var(--muted)", background:"rgba(255,255,255,0.05)", padding:"2px 7px", borderRadius:4 }}>{item.size}</span>
                        )}
                        {(item.colorName||item.color) && (
                          <span style={{ fontSize:10, color:"var(--muted)" }}>{item.colorName||item.color}</span>
                        )}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        {/* Qty controls */}
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <button onClick={() => onUpdateQty(key, -1)} style={{
                            width:26, height:26, borderRadius:6,
                            background:"var(--surface)", border:"1px solid var(--border)",
                            color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center"
                          }}><Minus size={12}/></button>
                          <span style={{ fontSize:13, fontWeight:600, minWidth:18, textAlign:"center" }}>{item.qty||1}</span>
                          <button onClick={() => onUpdateQty(key, 1)} style={{
                            width:26, height:26, borderRadius:6,
                            background:"var(--surface)", border:"1px solid var(--border)",
                            color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center"
                          }}><Plus size={12}/></button>
                        </div>
                        {/* Price */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
                          <span style={{ fontSize:14, fontWeight:700, color: hasD ? "var(--accent)" : "var(--text)" }}>
                            {(sp * (item.qty||1)).toLocaleString()} EGP
                          </span>
                          {hasD && <span style={{ fontSize:10, color:"var(--muted)", textDecoration:"line-through" }}>{(item.price*(item.qty||1)).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onRemoveItem(key)} style={{
                      color:"var(--muted)", alignSelf:"flex-start", marginTop:2,
                      padding:4, display:"flex", borderRadius:4,
                      transition:"color 0.15s"
                    }} onMouseEnter={e => e.currentTarget.style.color="var(--red)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            padding:"16px 20px 20px",
            borderTop:"1px solid var(--border)",
            flexShrink:0,
            background:"var(--surface)"
          }}>
            {/* Shipping progress */}
            {ship > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>Add <strong style={{ color:"var(--accent)" }}>{(FREE_THRESHOLD-subtotal).toLocaleString()} EGP</strong> for free shipping</span>
                </div>
                <div style={{ height:3, background:"var(--surface2)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:2,
                    background:"var(--accent)",
                    width:`${Math.min(100, subtotal/FREE_THRESHOLD*100)}%`,
                    transition:"width 0.3s"
                  }}/>
                </div>
              </div>
            )}
            {/* Totals */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--muted)" }}>
                <span>Subtotal</span><span style={{ color:"var(--text)" }}>{subtotal.toLocaleString()} EGP</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--muted)" }}>
                <span>Delivery</span>
                <span style={{ color: ship===0 ? "var(--green)" : "var(--text)" }}>{ship===0 ? "Free" : `${ship} EGP`}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"var(--accent)" }}>
                  {total.toLocaleString()} EGP
                </span>
              </div>
            </div>
            <button onClick={() => { close(); setTimeout(onCheckout, 280); }} style={{
              width:"100%", padding:"16px",
              borderRadius:"var(--r)",
              background:"var(--accent)", color:"#0C0C0C",
              fontSize:13, fontWeight:700,
              fontFamily:"'Syne',sans-serif", letterSpacing:"0.06em",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.opacity="0.9"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              Checkout <ArrowRight size={16}/>
            </button>
            <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"var(--muted)" }}>💵</span>
              <span style={{ fontSize:11, color:"var(--muted)" }}>Cash on delivery</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CHECKOUT ────────────────────────────────────────
function CheckoutPage({ cart, onBack, onPlaceOrder, onUpdateQty, onRemoveItem }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", phone:"", email:"", address:"", apartment:"", city:"", governorate:"" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const subtotal = cart.reduce((s,i) => s + effPrice(i)*(i.qty||1), 0);
  const rawSub = cart.reduce((s,i) => s + i.price*(i.qty||1), 0);
  const disc = rawSub - subtotal;
  const ship = getShip(subtotal);
  const total = subtotal + ship;

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errs[f]) setErrs(p => ({ ...p, [f]:"" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.governorate) e.governorate = "Required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/api/orders`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          customer: form,
          items: cart.map(i => ({
            productId: i._id||i.id, name:i.name, price:i.price,
            salePrice: effPrice(i)<i.price ? effPrice(i) : undefined,
            size:i.size, color:i.colorName||i.color, image:firstImg(i),
          })),
          subtotal, discount:disc, shipping:ship, total
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Order failed");
      onPlaceOrder(data.orderNumber);
    } catch(err) {
      setServerErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
    width:"100%", padding:"13px 14px",
    background:"var(--surface2)", border:`1px solid ${hasErr?"var(--red)":"var(--border)"}`,
    borderRadius:"var(--r-sm)", color:"var(--text)", fontSize:14,
    outline:"none", transition:"border-color 0.15s, box-shadow 0.15s",
    appearance:"none"
  });

  const Field = ({ label, error, children }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:error?"var(--red)":"var(--muted)" }}>
        {label}{error && <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, marginLeft:6 }}>— {error}</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", color:"var(--text)" }}>
      {/* Header */}
      <div style={{
        padding:"16px 20px", borderBottom:"1px solid var(--border)",
        position:"sticky", top:0, zIndex:100,
        background:"rgba(12,12,12,0.9)", backdropFilter:"blur(16px)",
        display:"flex", alignItems:"center", justifyContent:"space-between"
      }}>
        <button onClick={onBack} style={{
          display:"flex", alignItems:"center", gap:8,
          color:"var(--muted)", fontSize:11, fontWeight:600, letterSpacing:"0.08em",
          textTransform:"uppercase", transition:"color 0.15s"
        }} onMouseEnter={e => e.currentTarget.style.color="var(--text)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}>
          <ChevronLeft size={14}/> Back
        </button>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>Checkout</span>
        <div style={{ width:60 }}/>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 48px" }}>
        <div className="co-grid">
          {/* Form */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>
              Delivery Info
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="First Name" error={errs.firstName}>
                <input value={form.firstName} onChange={set("firstName")} placeholder="Ahmed" style={inputStyle(!!errs.firstName)}/>
              </Field>
              <Field label="Last Name" error={errs.lastName}>
                <input value={form.lastName} onChange={set("lastName")} placeholder="Hassan" style={inputStyle(!!errs.lastName)}/>
              </Field>
            </div>
            <Field label="Phone" error={errs.phone}>
              <input value={form.phone} onChange={set("phone")} placeholder="+20 100 000 0000" type="tel" style={inputStyle(!!errs.phone)}/>
            </Field>
            <Field label="Email (optional)" error={errs.email}>
              <input value={form.email} onChange={set("email")} placeholder="ahmed@email.com" type="email" style={inputStyle(!!errs.email)}/>
            </Field>
            <Field label="Street Address / العنوان" error={errs.address}>
              <input value={form.address} onChange={set("address")} placeholder="123 El Tahrir St" style={{ ...inputStyle(!!errs.address), direction:"auto" }}/>
            </Field>
            <Field label="Apartment / الشقة (optional)">
              <input value={form.apartment} onChange={set("apartment")} placeholder="Apt 5, Floor 2" style={{ ...inputStyle(false), direction:"auto" }}/>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="City / المدينة" error={errs.city}>
                <input value={form.city} onChange={set("city")} placeholder="Cairo" style={{ ...inputStyle(!!errs.city), direction:"auto" }}/>
              </Field>
              <Field label="Governorate" error={errs.governorate}>
                <div style={{ position:"relative" }}>
                  <select value={form.governorate} onChange={set("governorate")} style={{
                    ...inputStyle(!!errs.governorate),
                    paddingRight:36, cursor:"pointer"
                  }}>
                    <option value="">Select…</option>
                    {EGYPT_GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)", pointerEvents:"none" }}/>
                </div>
              </Field>
            </div>

            {/* COD */}
            <div style={{
              padding:"14px 16px", borderRadius:"var(--r)",
              background:"rgba(76,175,125,0.1)", border:"1px solid rgba(76,175,125,0.25)",
              display:"flex", alignItems:"center", gap:12
            }}>
              <span style={{ fontSize:22 }}>💵</span>
              <div>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--green)", marginBottom:3 }}>Cash on Delivery</p>
                <p style={{ fontSize:12, color:"rgba(76,175,125,0.7)" }}>Pay when your order arrives. No prepayment needed.</p>
              </div>
            </div>

            {serverErr && (
              <div style={{ padding:"12px 16px", borderRadius:"var(--r-sm)", background:"rgba(224,82,82,0.12)", border:"1px solid rgba(224,82,82,0.3)" }}>
                <p style={{ fontSize:12, color:"var(--red)" }}>{serverErr}</p>
              </div>
            )}

            <button onClick={submit} disabled={loading||cart.length===0} style={{
              padding:"17px", borderRadius:"var(--r)",
              background: loading ? "var(--surface2)" : "var(--accent)",
              color: loading ? "var(--muted)" : "#0C0C0C",
              fontSize:13, fontWeight:700,
              fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              transition:"all 0.2s", cursor: loading ? "not-allowed" : "pointer"
            }}>
              {loading ? (
                <><span style={{ width:14, height:14, border:"2px solid rgba(0,0,0,0.2)", borderTopColor:"#0C0C0C", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }}/> Placing Order…</>
              ) : (
                <><Check size={15}/> Place Order — {total.toLocaleString()} EGP</>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--r)", overflow:"hidden",
              position:"sticky", top:80
            }}>
              <div style={{ padding:"16px 18px", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  Order Summary
                </span>
              </div>
              <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
                {cart.map((item,idx) => {
                  const key = `${item._id||item.id}-${item.size}-${item.colorName||item.color}`;
                  const sp = effPrice(item);
                  const img = firstImg(item);
                  return (
                    <div key={key} style={{ display:"flex", gap:12, paddingBottom:12, borderBottom:idx<cart.length-1?"1px solid var(--border)":"none" }}>
                      <div style={{ width:50, height:60, borderRadius:8, overflow:"hidden", background:"var(--surface2)", flexShrink:0 }}>
                        {img && <img src={img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, marginBottom:3, lineHeight:1.3 }}>{item.name}</p>
                        <p style={{ fontSize:11, color:"var(--muted)", marginBottom:5 }}>{item.size} · {item.colorName||item.color}</p>
                        <p style={{ fontSize:13, fontWeight:700, color:"var(--accent)" }}>{(sp*(item.qty||1)).toLocaleString()} EGP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"14px 18px", background:"var(--surface2)", display:"flex", flexDirection:"column", gap:8 }}>
                {disc > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                    <span style={{ color:"var(--muted)" }}>Discount</span>
                    <span style={{ color:"var(--red)", fontWeight:600 }}>-{disc.toLocaleString()} EGP</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>Delivery</span>
                  <span style={{ color: ship===0 ? "var(--green)" : "var(--text)" }}>{ship===0 ? "Free" : `${ship} EGP`}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700 }}>Total</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"var(--accent)" }}>
                    {total.toLocaleString()} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [orderNum, setOrderNum] = useState(null);
  const searchRef = useRef();
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  // Inject CSS
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r=>r.json()).catch(()=>null),
      fetch(`${API}/api/products`).then(r=>r.json()).catch(()=>null),
    ]).then(([settings, prods]) => {
      if (settings) {
        if (settings.shippingCost !== undefined) SHIPPING_COST = settings.shippingCost;
        if (settings.freeShippingThreshold !== undefined) FREE_THRESHOLD = settings.freeShippingThreshold;
        if (settings.shippingEnabled !== undefined) SHIPPING_ON = settings.shippingEnabled;
      }
      setProducts(Array.isArray(prods) && prods.length ? prods : FALLBACK);
    }).finally(() => setLoading(false));
  }, []);

  // Filter products
  const filtered = (cat === "all" ? products : products.filter(p => (p.category||"").toLowerCase() === cat))
    .filter(p => !searchQ.trim() || p.name.toLowerCase().includes(searchQ.toLowerCase()) || (p.description||"").toLowerCase().includes(searchQ.toLowerCase()));

  const addToCart = (product, size, colorName) => {
    const key = `${product._id||product.id}-${size}-${colorName}`;
    setCart(prev => {
      const ex = prev.find(i => `${i._id||i.id}-${i.size}-${i.colorName||i.color}` === key);
      if (ex) return prev.map(i => `${i._id||i.id}-${i.size}-${i.colorName||i.color}`===key ? {...i,qty:(i.qty||1)+1} : i);
      return [...prev, { ...product, size, colorName, color:colorName, qty:1 }];
    });
  };

  const updateQty = (key, delta) =>
    setCart(prev => prev.map(i => `${i._id||i.id}-${i.size}-${i.colorName||i.color}`===key ? {...i,qty:Math.max(1,(i.qty||1)+delta)} : i));

  const removeItem = (key) =>
    setCart(prev => prev.filter(i => `${i._id||i.id}-${i.size}-${i.colorName||i.color}`!==key));

  const cartCount = cart.reduce((s,i) => s+(i.qty||1), 0);

  if (page === "checkout") {
    return <CheckoutPage cart={cart} onBack={() => setPage("home")} onUpdateQty={updateQty} onRemoveItem={removeItem}
      onPlaceOrder={num => { setOrderNum(num); setCart([]); setPage("confirm"); }}/>;
  }

  if (page === "confirm") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ textAlign:"center", maxWidth:480, animation:"fadeUp 0.6s ease" }}>
          <div style={{
            width:80, height:80, borderRadius:"50%",
            background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 24px", animation:"glow 2s ease-in-out infinite"
          }}>
            <Check size={40} color="#fff" strokeWidth={2.5}/>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, marginBottom:12 }}>Order Confirmed!</h1>
          <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8, marginBottom:24 }}>
            Thank you! Our team will contact you to confirm delivery.
          </p>
          {orderNum && (
            <div style={{ padding:"16px 20px", borderRadius:"var(--r)", background:"var(--surface)", border:"1px solid var(--border)", marginBottom:20 }}>
              <p style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Order Number</p>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"var(--accent)" }}>{orderNum}</p>
            </div>
          )}
          <div style={{ padding:"12px 16px", borderRadius:"var(--r-sm)", background:"rgba(76,175,125,0.1)", border:"1px solid rgba(76,175,125,0.2)", marginBottom:28, display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
            <span style={{ fontSize:18 }}>💵</span>
            <span style={{ fontSize:13, color:"var(--green)" }}>You'll pay cash when the order arrives</span>
          </div>
          <button onClick={() => setPage("home")} style={{
            width:"100%", padding:"16px", borderRadius:"var(--r)",
            background:"var(--accent)", color:"#0C0C0C",
            fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em"
          }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"var(--bg)", color:"var(--text)", minHeight:"100vh" }}>
      {/* Search overlay */}
      {searchOpen && (
        <>
          <div onClick={() => { setSearchOpen(false); setSearchQ(""); }} style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1100,
            backdropFilter:"blur(8px)", animation:"fadeIn 0.2s"
          }}/>
          <div style={{
            position:"fixed", top:0, left:0, right:0, zIndex:1101,
            background:"var(--surface)", borderBottom:"1px solid var(--border)",
            padding:"16px 20px", animation:"slideDown 0.3s cubic-bezier(0.25,1,0.5,1)",
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)"
          }}>
            <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", gap:12 }}>
              <Search size={18} color="var(--accent)"/>
              <input
                ref={searchRef}
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search products…"
                style={{ flex:1, background:"none", border:"none", color:"var(--text)", fontSize:18, outline:"none" }}
              />
              {searchQ && <button onClick={() => setSearchQ("")} style={{ color:"var(--muted)", display:"flex" }}><X size={16}/></button>}
              <button onClick={() => { setSearchOpen(false); setSearchQ(""); }} style={{ color:"var(--muted)", fontSize:12, fontWeight:600, padding:"6px 12px", borderLeft:"1px solid var(--border)" }}>Close</button>
            </div>
            {searchQ.trim() && (
              <div style={{ maxWidth:700, margin:"12px auto 0", paddingTop:12, borderTop:"1px solid var(--border)" }}>
                <p style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
                  {filtered.length} result{filtered.length!==1?"s":""} for "{searchQ}"
                </p>
                <div style={{ maxHeight:"55vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
                  {filtered.length === 0 ? (
                    <p style={{ fontSize:14, color:"var(--muted)", padding:"12px 0" }}>No products found.</p>
                  ) : filtered.map(p => (
                    <button key={p._id||p.id} onClick={() => { setSearchOpen(false); setSearchQ(""); setPopup(p); }} style={{
                      display:"flex", alignItems:"center", gap:14,
                      padding:"10px", borderRadius:"var(--r-sm)",
                      textAlign:"left", transition:"background 0.15s",
                      color:"var(--text)"
                    }} onMouseEnter={e => e.currentTarget.style.background="var(--surface2)"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                      <div style={{ width:44, height:52, borderRadius:8, overflow:"hidden", background:"var(--surface2)", flexShrink:0 }}>
                        {firstImg(p) && <img src={firstImg(p)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{p.name}</p>
                        <p style={{ fontSize:11, color:"var(--muted)" }}>{p.description}</p>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:"var(--accent)", flexShrink:0 }}>{effPrice(p).toLocaleString()} EGP</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {popup && <ProductPopup product={popup} onClose={() => setPopup(null)} onAddToCart={addToCart}/>}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onCheckout={() => setPage("checkout")} onUpdateQty={updateQty} onRemoveItem={removeItem}/>}

      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:700,
        background:"rgba(12,12,12,0.85)", backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        borderBottom:"1px solid var(--border)",
        padding:"0 20px"
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src="/logo.jpg" alt="Sola" style={{ height:32, width:32, objectFit:"contain", borderRadius:6 }} onError={e => e.currentTarget.style.display="none"}/>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, letterSpacing:"0.18em", lineHeight:1.1 }}>SOLA</div>
              <div style={{ fontSize:8, fontWeight:500, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted)", lineHeight:1 }}>Brand & Boutique</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="nav-links" style={{ gap:32, fontSize:12, fontWeight:500, color:"var(--muted)" }}>
            {["Shop","About","Contact"].map(l => (
              <a key={l} href="#" style={{ transition:"color 0.15s", letterSpacing:"0.06em" }}
                onMouseEnter={e => e.currentTarget.style.color="var(--text)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}>{l}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80); }} style={{
              width:40, height:40, borderRadius:10,
              background:"var(--surface)", border:"1px solid var(--border)",
              color:"var(--muted)", display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.15s"
            }} onMouseEnter={e => { e.currentTarget.style.color="var(--text)"; e.currentTarget.style.borderColor="var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.borderColor="var(--border)"; }}>
              <Search size={16}/>
            </button>

            <button onClick={() => setCartOpen(true)} style={{
              height:40, borderRadius:10, padding:"0 14px",
              background: cartCount > 0 ? "var(--accent)" : "var(--surface)",
              border:`1px solid ${cartCount > 0 ? "var(--accent)" : "var(--border)"}`,
              color: cartCount > 0 ? "#0C0C0C" : "var(--muted)",
              display:"flex", alignItems:"center", gap:7,
              fontSize:12, fontWeight:600, transition:"all 0.2s"
            }}>
              <ShoppingBag size={15}/>
              {cartCount > 0 && <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{cartCount}</span>}
            </button>

            {/* Mobile burger */}
            <button
              className="touch-target"
              onClick={() => setMobileNav(!mobileNav)}
              style={{
                display:"none", // hidden on desktop, shown via CSS below
                width:40, height:40, borderRadius:10,
                background:"var(--surface)", border:"1px solid var(--border)",
                color:"var(--text)", alignItems:"center", justifyContent:"center"
              }}
              id="burger-btn"
            >
              {mobileNav ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>

        {/* Mobile nav menu */}
        {mobileNav && (
          <div style={{
            borderTop:"1px solid var(--border)",
            padding:"16px 0", display:"flex", flexDirection:"column", gap:2
          }}>
            {["Shop","About","Contact"].map(l => (
              <a key={l} href="#" onClick={() => setMobileNav(false)} style={{
                padding:"12px 4px", fontSize:15, fontWeight:600,
                color:"var(--muted)", letterSpacing:"0.04em",
                transition:"color 0.15s", fontFamily:"'Syne',sans-serif"
              }}>{l}</a>
            ))}
          </div>
        )}
      </nav>
      <style>{`
        @media(max-width:767px) { #burger-btn { display:flex !important; } }
      `}</style>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{
        minHeight:"88vh", display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg, #0C0C0C 0%, #161616 50%, #0C0C0C 100%)"
      }}>
        {/* Background decoration */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 80% 60% at 60% 40%, rgba(232,193,112,0.06) 0%, transparent 70%)",
          pointerEvents:"none"
        }}/>
        <div style={{
          position:"absolute", top:-100, right:-100,
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(232,193,112,0.04) 0%, transparent 70%)",
          pointerEvents:"none"
        }}/>
        {/* Grid lines */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize:"60px 60px",
          pointerEvents:"none"
        }}/>

        <div style={{
          textAlign:"center", padding:"clamp(80px,12vh,120px) 24px 60px",
          maxWidth:700, position:"relative", zIndex:2,
          animation:"fadeUp 0.9s ease 0.1s both"
        }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:24, padding:"6px 14px", borderRadius:20, background:"rgba(232,193,112,0.1)", border:"1px solid rgba(232,193,112,0.2)" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--accent)" }}>Spring / Summer 2026</span>
          </div>

          <h1 style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:"clamp(42px,10vw,96px)",
            fontWeight:800, lineHeight:1.0,
            letterSpacing:"-0.03em",
            marginBottom:20,
            background:"linear-gradient(135deg, #F0EDEA 0%, #E8C170 50%, #F0EDEA 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text"
          }}>
            Elevate<br/>the Everyday.
          </h1>

          <p style={{ fontSize:"clamp(13px,1.8vw,15px)", color:"var(--muted)", lineHeight:1.85, marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>
            Refined fashion for the modern man. Crafted with intention. Worn without effort.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="#collection" style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"14px 28px", borderRadius:"var(--r)",
              background:"var(--accent)", color:"#0C0C0C",
              fontSize:12, fontWeight:700, fontFamily:"'Syne',sans-serif", letterSpacing:"0.08em",
              textTransform:"uppercase", transition:"all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.opacity="0.88"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              Shop Collection <ArrowRight size={13}/>
            </a>
            <a href="#collection" style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"14px 28px", borderRadius:"var(--r)",
              background:"transparent", color:"var(--text)",
              fontSize:12, fontWeight:600, letterSpacing:"0.08em",
              textTransform:"uppercase", border:"1px solid var(--border)", transition:"all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}>
              Our Story
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:4, opacity:0.4 }}>
          <span style={{ fontSize:8, letterSpacing:"0.22em", textTransform:"uppercase" }}>Scroll</span>
          <ChevronDown size={12} strokeWidth={1.5}/>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────── */}
      <div style={{ background:"var(--accent)", padding:"10px 0", overflow:"hidden", whiteSpace:"nowrap" }}>
        <div style={{ display:"inline-flex", gap:48, animation:"marquee 20s linear infinite" }}>
          {Array(8).fill(["New Collection SS26","Sola Brand & Boutique · Menofia","Cash on Delivery","Free Shipping Over 1500 EGP"]).flat().map((t,i) => (
            <span key={i} style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#0C0C0C", opacity:0.8 }}>
              {t} &nbsp;·
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTION ──────────────────────────────── */}
      <section id="collection" style={{ padding:"clamp(40px,7vw,80px) 20px", maxWidth:1280, margin:"0 auto" }}>
        {/* Section header */}
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>
              {products.length} items
            </p>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(22px,4vw,36px)", fontWeight:800, letterSpacing:"-0.02em" }}>
              The Collection
            </h2>
          </div>
        </div>

        {/* Category filter — horizontal scroll on mobile */}
        <div style={{
          display:"flex", gap:8, marginBottom:28,
          overflowX:"auto", paddingBottom:4,
          scrollbarWidth:"none", msOverflowStyle:"none"
        }}>
          <style>{`[data-cats]::-webkit-scrollbar{display:none}`}</style>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding:"8px 16px", borderRadius:20, flexShrink:0,
              background: cat===c.id ? "var(--accent)" : "var(--surface)",
              border: `1px solid ${cat===c.id ? "var(--accent)" : "var(--border)"}`,
              color: cat===c.id ? "#0C0C0C" : "var(--muted)",
              fontSize:12, fontWeight:600,
              fontFamily: cat===c.id ? "'Syne',sans-serif" : "inherit",
              transition:"all 0.15s", cursor:"pointer", whiteSpace:"nowrap"
            }}>{c.label}</button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="pgrid">
            {Array(6).fill(0).map((_, i) => <ProductSkeleton key={i}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--muted)" }}>
            <Package size={48} strokeWidth={1} style={{ marginBottom:16, opacity:0.4 }}/>
            <p style={{ fontSize:16, marginBottom:8 }}>No products found</p>
            <button onClick={() => setCat("all")} style={{ color:"var(--accent)", fontSize:13, fontWeight:600, border:"none", background:"none", cursor:"pointer" }}>
              View all products →
            </button>
          </div>
        ) : (
          <div className="pgrid">
            {filtered.map((p,i) => (
              <ProductCard key={p._id||p.id} product={p} idx={i} onTap={setPopup}/>
            ))}
          </div>
        )}
      </section>

      {/* ── QUOTE BAND ──────────────────────────────── */}
      <section style={{
        padding:"clamp(52px,8vw,80px) 24px",
        background:"var(--surface)",
        borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
        textAlign:"center"
      }}>
        <div style={{ maxWidth:520, margin:"0 auto", animation:"fadeUp 0.6s ease" }}>
          <div style={{ width:24, height:2, background:"var(--accent)", margin:"0 auto 24px" }}/>
          <blockquote style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:"clamp(16px,2.5vw,24px)",
            fontWeight:600, lineHeight:1.65, color:"var(--text)",
            marginBottom:18
          }}>
            "We don't design clothes. We design the space between who you are and who you could be."
          </blockquote>
          <p style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)" }}>— Sola Brand & Boutique</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ background:"var(--surface)", borderTop:"1px solid var(--border)", padding:"clamp(40px,6vw,64px) 20px 24px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",
            gap:36, marginBottom:48
          }}>
            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <img src="/logo.jpg" alt="Sola" style={{ height:30, width:30, objectFit:"contain", borderRadius:6, filter:"invert(1)" }} onError={e => e.currentTarget.style.display="none"}/>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, letterSpacing:"0.18em" }}>SOLA</div>
                  <div style={{ fontSize:8, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted)" }}>Brand & Boutique</div>
                </div>
              </div>
              <p style={{ fontSize:12, lineHeight:1.8, color:"var(--muted)", maxWidth:200 }}>
                Refined essentials crafted for the considered man. Based in Menofia, Egypt.
              </p>
              <div style={{ display:"flex", gap:12, marginTop:16 }}>
                {[
                  { href:"https://www.instagram.com/sola.boutiquee", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg> },
                  { href:"https://www.facebook.com/share/14VnCCFNwL1/", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                  { href:"https://www.tiktok.com/@sola.boutiquee", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg> },
                ].map((s,i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{
                    width:34, height:34, borderRadius:10,
                    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"var(--muted)", transition:"all 0.15s"
                  }} onMouseEnter={e => { e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.borderColor="var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.borderColor="var(--border)"; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { label:"Company", links:[{name:"About",href:"#"},{name:"Careers",href:"#"},{name:"Journal",href:"#"}] },
              { label:"Support", links:[{name:"Shipping",href:"#"},{name:"Returns",href:"#"},{name:"Size Guide",href:"#"},{name:"Contact",href:"mailto:hello@solastore.com"}] },
            ].map(col => (
              <div key={col.label}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)", marginBottom:16 }}>{col.label}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(l => (
                    <a key={l.name} href={l.href} target={l.href.startsWith("http")||l.href.startsWith("mailto")?"_blank":"_self"} rel="noreferrer" style={{
                      fontSize:13, color:"rgba(240,237,234,0.5)", transition:"color 0.15s"
                    }} onMouseEnter={e => e.currentTarget.style.color="var(--text)"} onMouseLeave={e => e.currentTarget.style.color="rgba(240,237,234,0.5)"}>{l.name}</a>
                  ))}
                </div>
              </div>
            ))}

            {/* Newsletter */}
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)", marginBottom:14 }}>Newsletter</p>
              <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.75, marginBottom:14 }}>New arrivals & exclusives.</p>
              {subbed ? (
                <p style={{ fontSize:12, color:"var(--green)", display:"flex", alignItems:"center", gap:6 }}>
                  <Check size={13}/> You're subscribed!
                </p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && email.includes("@") && (setSubbed(true), setEmail(""))}
                    style={{
                      padding:"11px 14px", background:"rgba(255,255,255,0.05)",
                      border:"1px solid var(--border)", borderRadius:"var(--r-sm)",
                      color:"var(--text)", fontSize:13, width:"100%"
                    }}/>
                  <button onClick={() => email.includes("@") && (setSubbed(true), setEmail(""))} style={{
                    padding:"11px", borderRadius:"var(--r-sm)",
                    background:"var(--accent)", color:"#0C0C0C",
                    fontSize:11, fontWeight:700, fontFamily:"'Syne',sans-serif", letterSpacing:"0.1em", textTransform:"uppercase"
                  }}>Subscribe</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop:"1px solid var(--border)", paddingTop:18, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <p style={{ fontSize:11, color:"rgba(240,237,234,0.2)" }}>© 2026 Sola Brand & Boutique. All rights reserved.</p>
            <p style={{ fontSize:11, color:"rgba(240,237,234,0.2)" }}>Privacy · Terms · Cookies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}