import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ShoppingBag, X, ChevronLeft, ChevronRight, Plus, Minus,
  Trash2, Check, Search, Menu, ArrowRight, Package, ChevronDown,
  MapPin, Clock, MessageCircle, Home, Store, Flame, AlertTriangle
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
    colors:[{name:"Sky Blue",hex:"#AECDE3"}], stockQty:null,
    images:["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"],
    discount:{enabled:false} },
  { id:2, category:"shirts", name:"Pierre Cardin Sail Club", price:1200, badge:"Shirts", tag:"Pierre Cardin",
    description:"Slim fit · Embroidered", sizes:["S","M","L","XL"],
    colors:[{name:"Cream",hex:"#F5EEE0"}], stockQty:1,
    images:["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80"],
    discount:{enabled:false} },
  { id:3, category:"coats", name:"Pierre Cardin Trench", price:3500, badge:"Coats", tag:"Pierre Cardin",
    description:"Double-breasted · Black", sizes:["S","M","L","XL"],
    colors:[{name:"Black",hex:"#1A1A1A"}], stockQty:3,
    images:["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    discount:{enabled:false} },
  { id:4, category:"pants", name:"Slim Chinos", price:650, badge:"Pants",
    description:"Stretch twill · Tapered", sizes:["28","30","32","34","36"],
    colors:[{name:"Khaki",hex:"#C8B99A"},{name:"Black",hex:"#111"}], stockQty:null,
    images:["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
    discount:{enabled:false} },
  { id:5, category:"tshirts", name:"Essential Cotton Tee", price:350, badge:"T-Shirts",
    description:"100% cotton · Regular fit", sizes:["S","M","L","XL","XXL"],
    colors:[{name:"White",hex:"#F5F5F0"},{name:"Black",hex:"#111"}], stockQty:null,
    images:["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"],
    discount:{enabled:true,type:"percent",value:15} },
  { id:6, category:"shoes", name:"Leather Derby", price:1800, badge:"Shoes",
    description:"Full-grain leather · Goodyear", sizes:["40","41","42","43","44","45"],
    colors:[{name:"Brown",hex:"#6B3A2A"}], stockQty:2,
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

// Stock status: null = unlimited, number = exact count
function stockStatus(p) {
  const qty = p.stockQty;
  if (qty === null || qty === undefined || qty === 0) return { type: "ok", label: null };
  if (qty === 1) return { type: "last", label: "one piece left" };
  if (qty <= 3) return { type: "low", label: `Only ${qty} left` };
  return { type: "ok", label: null };
}

// ─── GLOBAL CSS ──────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
  body{background:#0C0C0C;color:#F0EDEA;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
  a{text-decoration:none;color:inherit;}
  button{-webkit-tap-highlight-color:transparent;cursor:pointer;border:none;background:none;font-family:inherit;}
  input,select,textarea{-webkit-appearance:none;font-family:inherit;}

  :root {
    --bg:#0C0C0C; --surface:#161616; --surface2:#1E1E1E;
    --border:rgba(255,255,255,0.08); --text:#F0EDEA;
    --muted:rgba(240,237,234,0.45); --accent:#E8C170; --accent2:#C4955A;
    --red:#E05252; --green:#4CAF7D; --orange:#F59E42;
    --r:12px; --r-sm:8px;
  }

  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:var(--bg);} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(232,193,112,0.1)}50%{box-shadow:0 0 40px rgba(232,193,112,0.25)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes urgentPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}

  .skeleton{background:linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%);background-size:800px 100%;animation:shimmer 1.4s infinite;border-radius:8px;}

  .pgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  @media(min-width:640px){.pgrid{grid-template-columns:repeat(3,1fr);gap:16px;}}
  @media(min-width:1024px){.pgrid{grid-template-columns:repeat(4,1fr);gap:20px;}}

  .nav-links{display:none;}
  @media(min-width:768px){.nav-links{display:flex;}}

  .cart-side{width:min(420px,100vw);}

  .co-grid{display:grid;grid-template-columns:1fr;gap:24px;}
  @media(min-width:768px){.co-grid{grid-template-columns:1fr 360px;}}

  .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  @media(min-width:640px){.trust-grid{grid-template-columns:repeat(4,1fr);}}

  .showroom-grid{display:grid;grid-template-columns:1fr;gap:12px;}
  @media(min-width:640px){.showroom-grid{grid-template-columns:1fr 1fr;}}

  input:focus,select:focus,textarea:focus{outline:none;border-color:var(--accent)!important;box-shadow:0 0 0 3px rgba(232,193,112,0.12);}

  .touch-target{min-height:44px;min-width:44px;}
`;

// ─── SKELETON ────────────────────────────────────────
const ProductSkeleton = () => (
  <div>
    <div className="skeleton" style={{ aspectRatio:"3/4", borderRadius:"var(--r)" }} />
    <div style={{ marginTop:12 }}>
      <div className="skeleton" style={{ height:11,width:"55%",marginBottom:8 }} />
      <div className="skeleton" style={{ height:15,width:"80%",marginBottom:8 }} />
      <div className="skeleton" style={{ height:13,width:"38%" }} />
    </div>
  </div>
);

// ─── STOCK BADGE (for card) ───────────────────────────
const StockBadge = ({ product, style = {} }) => {
  const s = stockStatus(product);
  if (s.type === "ok") return null;
  const isLast = s.type === "last";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 9px", borderRadius:20,
      background: isLast ? "rgba(224,82,82,0.15)" : "rgba(245,158,66,0.15)",
      border: `1px solid ${isLast ? "rgba(224,82,82,0.4)" : "rgba(245,158,66,0.4)"}`,
      animation: isLast ? "urgentPulse 2s ease-in-out infinite" : "none",
      ...style
    }}>
      {isLast ? <Flame size={10} color="var(--red)"/> : <AlertTriangle size={10} color="var(--orange)"/>}
      <span style={{ fontSize:10, fontWeight:700, color: isLast ? "var(--red)" : "var(--orange)", letterSpacing:"0.04em" }}>
        {s.label}
      </span>
    </div>
  );
};

// ─── PRODUCT CARD ────────────────────────────────────
const ProductCard = memo(({ product, idx, onTap }) => {
  const img = firstImg(product);
  const sp = effPrice(product);
  const disc = discLabel(product);
  const hasDisc = sp < product.price;
  const stock = stockStatus(product);

  return (
    <div onClick={() => onTap(product)} style={{ animation:`fadeUp 0.5s ease ${idx*0.06}s both`, cursor:"pointer" }}>
      <div style={{ position:"relative", aspectRatio:"3/4", borderRadius:"var(--r)", overflow:"hidden", background:"var(--surface)" }}>
        {img ? (
          <img src={img} alt={product.name} loading="lazy"
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
        ) : (
          <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>👕</div>
        )}
        {/* Top badges */}
        <div style={{ position:"absolute",top:10,left:10,display:"flex",flexDirection:"column",gap:5 }}>
          {disc && (
            <span style={{ background:"var(--accent)",color:"#0C0C0C",padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>{disc}</span>
          )}
          {product.tag && !disc && (
            <span style={{ background:"rgba(12,12,12,0.85)",color:"var(--text)",padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:600,backdropFilter:"blur(8px)" }}>{product.tag}</span>
          )}
        </div>
        {/* Stock urgency badge top-right */}
        {stock.type !== "ok" && (
          <div style={{ position:"absolute",top:10,right:10 }}>
            <StockBadge product={product}/>
          </div>
        )}
      </div>
      <div style={{ marginTop:10, paddingInline:2 }}>
        <p style={{ fontSize:10,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>
          {product.badge||product.category}
        </p>
        <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:600,lineHeight:1.3,marginBottom:6 }}>{product.name}</h3>
        <div style={{ display:"flex",alignItems:"baseline",gap:6 }}>
          <span style={{ fontSize:14,fontWeight:600,color:hasDisc?"var(--accent)":"var(--text)" }}>{sp.toLocaleString()} EGP</span>
          {hasDisc && <span style={{ fontSize:11,color:"var(--muted)",textDecoration:"line-through" }}>{product.price.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

// ─── PRODUCT PAGE (full page, not popup) ─────────────
function ProductPage({ product, onClose, onAddToCart }) {
  // Support both new format (product.variants) and legacy (product.colors)
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Build a unified colors array from whichever format exists
  const colors = hasVariants
    ? variants.map(v => ({ name: v.colorName, hex: v.colorHex, images: v.images || [], available: v.available !== false }))
    : (product.colors || []);

  const [selColorIdx, setSelColorIdx] = useState(0);
  const selColor = colors[selColorIdx] || null;

  // Images: if current color has its own images use those, else fall back to product.images
  const variantImgs = hasVariants && selColor?.images?.length ? selColor.images : null;
  const imgs = variantImgs || (product.images?.length ? product.images : null);

  const [imgIdx, setImgIdx] = useState(0);
  const [selSize, setSelSize] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);

  const total = imgs?.length || 0;
  const sp = effPrice(product);
  const hasDisc = sp < product.price;
  const disc = discLabel(product);
  const needsSize = product.sizes?.length > 0;
  const stock = stockStatus(product);

  const handleColorChange = (idx) => {
    setSelColorIdx(idx);
    setImgIdx(0); // reset to first image of new color
  };

  useEffect(() => {
    window.scrollTo({ top:0, behavior:"instant" });
    document.body.style.overflow = "";
  }, []);

  const handleAdd = () => {
    if (needsSize && !selSize) { setSizeErr(true); return; }
    onAddToCart(product, selSize || "One Size", selColor?.name || "");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", animation:"fadeIn 0.25s ease" }}>
      {/* Breadcrumb */}
      <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:8, fontSize:11, color:"var(--muted)" }}>
        <button onClick={onClose} style={{ color:"var(--muted)", display:"flex", alignItems:"center", gap:5, transition:"color 0.15s", fontSize:11 }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>
          <Home size={12}/> Home
        </button>
        <span style={{ opacity:0.3 }}>›</span>
        <button onClick={onClose} style={{ color:"var(--muted)", transition:"color 0.15s", fontSize:11 }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>
          {product.badge || product.category}
        </button>
        <span style={{ opacity:0.3 }}>›</span>
        <span style={{ color:"var(--text)", fontWeight:500 }}>{product.name}</span>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px 60px", display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:isMobile?24:48, alignItems:"start" }}>
        {/* Left: Images */}
        <div>
          {/* Main image */}
          <div style={{ position:"relative", aspectRatio:"3/4", borderRadius:"var(--r)", overflow:"hidden", background:"var(--surface)", marginBottom:10 }}>
            {imgs ? (
              <>
                <img src={imgs[imgIdx]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.2s" }}/>
                {total > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i=>(i-1+total)%total)} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",background:"rgba(12,12,12,0.7)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}><ChevronLeft size={16}/></button>
                    <button onClick={() => setImgIdx(i=>(i+1)%total)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",background:"rgba(12,12,12,0.7)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}><ChevronRight size={16}/></button>
                  </>
                )}
                {disc && <div style={{ position:"absolute",top:14,left:14,background:"var(--accent)",color:"#0C0C0C",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>{disc}</div>}
              </>
            ) : (
              <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64 }}>👕</div>
            )}
          </div>
          {/* Thumbnail strip */}
          {imgs && imgs.length > 1 && (
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
              {imgs.map((src,i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{
                  width:72, height:88, flexShrink:0, borderRadius:"var(--r-sm)",
                  overflow:"hidden", border:`2px solid ${i===imgIdx?"var(--accent)":"var(--border)"}`,
                  transition:"border-color 0.15s", background:"var(--surface2)"
                }}>
                  <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div style={{ paddingTop: isMobile ? 0 : 16 }}>
          <p style={{ fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
            {product.badge||product.category}
          </p>
          {product.tag && (
            <span style={{ display:"inline-block",marginBottom:10,padding:"3px 10px",borderRadius:20,background:"rgba(232,193,112,0.12)",border:"1px solid rgba(232,193,112,0.3)",fontSize:10,fontWeight:700,color:"var(--accent)" }}>
              {product.tag}
            </span>
          )}
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(24px,5vw,34px)",fontWeight:800,lineHeight:1.15,marginBottom:14 }}>
            {product.name}
          </h1>

          {/* Price */}
          <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:14 }}>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:hasDisc?"var(--accent)":"var(--text)" }}>
              {sp.toLocaleString()} EGP
            </span>
            {hasDisc && <span style={{ fontSize:15,color:"var(--muted)",textDecoration:"line-through" }}>{product.price.toLocaleString()}</span>}
          </div>

          {/* Stock urgency */}
          {stock.type !== "ok" && (
            <div style={{ marginBottom:16 }}>
              <StockBadge product={product}/>
              {stock.type === "last" && (
                <p style={{ fontSize:11,color:"var(--muted)",marginTop:6,lineHeight:1.6 }}>
                  Someone else might be looking at this right now. Don't miss out.
                </p>
              )}
              {stock.type === "low" && (
                <p style={{ fontSize:11,color:"var(--muted)",marginTop:6,lineHeight:1.6 }}>
                  Selling fast — grab yours before it's gone.
                </p>
              )}
            </div>
          )}

          {product.description && (
            <p style={{ fontSize:14,color:"var(--muted)",lineHeight:1.75,marginBottom:20 }}>{product.description}</p>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10 }}>
                Color — <span style={{ color:"var(--text)",fontWeight:600 }}>{selColor?.name}</span>
              </p>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                {colors.map((c,i) => (
                  <button key={c.name} onClick={() => handleColorChange(i)} title={c.name} style={{
                    display:"flex",alignItems:"center",gap:8,
                    padding:"6px 12px",borderRadius:20,
                    border:`2px solid ${selColorIdx===i?"var(--accent)":"var(--border)"}`,
                    background: selColorIdx===i?"rgba(232,193,112,0.08)":"transparent",
                    transition:"all 0.15s"
                  }}>
                    <div style={{ width:16,height:16,borderRadius:"50%",background:c.hex,flexShrink:0 }}/>
                    <span style={{ fontSize:12,fontWeight:600,color:selColorIdx===i?"var(--accent)":"var(--muted)" }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {needsSize && (
            <div style={{ marginBottom:22 }}>
              <p style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10,color:sizeErr?"var(--red)":"var(--muted)" }}>
                Size {sizeErr && <span style={{ color:"var(--red)",fontWeight:600 }}>— Please select a size</span>}
              </p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {product.sizes.map(s => (
                  <button key={s} onClick={() => { setSelSize(s); setSizeErr(false); }} style={{
                    minWidth:48,padding:"9px 14px",borderRadius:"var(--r-sm)",
                    border:`${selSize===s?"2px":"1px"} solid ${selSize===s?"var(--accent)":"var(--border)"}`,
                    background:selSize===s?"rgba(232,193,112,0.1)":"transparent",
                    color:selSize===s?"var(--accent)":"var(--muted)",
                    fontSize:13,fontWeight:600,transition:"all 0.15s"
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button onClick={handleAdd} style={{
            width:"100%",padding:"17px",borderRadius:"var(--r)",
            background:added?"var(--green)":"var(--accent)",
            color:"#0C0C0C",fontSize:14,fontWeight:700,
            fontFamily:"'Syne',sans-serif",letterSpacing:"0.08em",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            transition:"all 0.2s",marginBottom:14
          }}>
            {added ? <><Check size={17}/> Added to Bag!</> : <><ShoppingBag size={17}/> Add to Bag</>}
          </button>

          {/* COD notice */}
          <div style={{ padding:"12px 16px",borderRadius:"var(--r-sm)",background:"rgba(76,175,125,0.08)",border:"1px solid rgba(76,175,125,0.2)",display:"flex",alignItems:"center",gap:10,marginBottom:24 }}>
            <span style={{ fontSize:18 }}>💵</span>
            <span style={{ fontSize:12,color:"var(--green)" }}>Cash on delivery — pay when it arrives</span>
          </div>

          {/* Product details */}
          {(product.details || product.material || product.care) && (
            <div style={{ borderTop:"1px solid var(--border)",paddingTop:20,display:"flex",flexDirection:"column",gap:12 }}>
              {product.details && <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.8 }}>{product.details}</p>}
              {product.material && (
                <div style={{ display:"flex",gap:10 }}>
                  <span style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--muted)",minWidth:70 }}>Material</span>
                  <span style={{ fontSize:12,color:"var(--text)" }}>{product.material}</span>
                </div>
              )}
              {product.care && (
                <div style={{ display:"flex",gap:10 }}>
                  <span style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--muted)",minWidth:70 }}>Care</span>
                  <span style={{ fontSize:12,color:"var(--text)" }}>{product.care}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CART DRAWER ─────────────────────────────────────
function CartDrawer({ cart, onClose, onCheckout, onUpdateQty, onRemoveItem }) {
  const [closing, setClosing] = useState(false);
  const subtotal = cart.reduce((s,i) => s+effPrice(i)*(i.qty||1), 0);
  const ship = getShip(subtotal);
  const total = subtotal + ship;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const close = () => { setClosing(true); setTimeout(onClose, 280); };

  return (
    <>
      <div onClick={close} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:800,backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",animation:"fadeIn 0.2s ease",opacity:closing?0:1,transition:"opacity 0.28s" }}/>
      <div className="cart-side" style={{ position:"fixed",top:0,right:0,bottom:0,zIndex:801,background:"var(--surface)",display:"flex",flexDirection:"column",borderLeft:"1px solid var(--border)",transform:closing?"translateX(100%)":"translateX(0)",transition:"transform 0.3s cubic-bezier(0.25,1,0.5,1)",animation:closing?"none":"slideRight 0.35s cubic-bezier(0.25,1,0.5,1)",paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        {/* Header */}
        <div style={{ padding:"20px 20px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <ShoppingBag size={18} color="var(--accent)"/>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700 }}>Your Bag</span>
            {cart.length>0 && <span style={{ background:"var(--accent)",color:"#0C0C0C",width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800 }}>{cart.length}</span>}
          </div>
          <button onClick={close} style={{ width:34,height:34,borderRadius:"50%",background:"var(--surface2)",color:"var(--muted)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}><X size={15}/></button>
        </div>

        {/* Items */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 20px" }}>
          {cart.length===0 ? (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:16,color:"var(--muted)" }}>
              <ShoppingBag size={48} strokeWidth={1}/>
              <p style={{ fontSize:14 }}>Your bag is empty</p>
            </div>
          ) : (
            <div style={{ paddingBlock:16,display:"flex",flexDirection:"column",gap:14 }}>
              {cart.map(item => {
                const key = `${item._id||item.id}-${item.size}-${item.colorName||item.color}`;
                const sp = effPrice(item);
                const hasD = sp < item.price;
                const img = firstImg(item);
                return (
                  <div key={key} style={{ display:"flex",gap:12,padding:"14px",borderRadius:"var(--r)",background:"var(--surface2)",border:"1px solid var(--border)" }}>
                    <div style={{ width:64,height:78,borderRadius:"var(--r-sm)",overflow:"hidden",background:"#111",flexShrink:0 }}>
                      {img && <img src={img} alt={item.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.3 }}>{item.name}</p>
                      <div style={{ display:"flex",gap:6,marginBottom:8,flexWrap:"wrap" }}>
                        {item.size&&item.size!=="One Size"&&<span style={{ fontSize:10,color:"var(--muted)",background:"rgba(255,255,255,0.05)",padding:"2px 7px",borderRadius:4 }}>{item.size}</span>}
                        {(item.colorName||item.color)&&<span style={{ fontSize:10,color:"var(--muted)" }}>{item.colorName||item.color}</span>}
                      </div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <button onClick={()=>onUpdateQty(key,-1)} style={{ width:26,height:26,borderRadius:6,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",display:"flex",alignItems:"center",justifyContent:"center" }}><Minus size={12}/></button>
                          <span style={{ fontSize:13,fontWeight:600,minWidth:18,textAlign:"center" }}>{item.qty||1}</span>
                          <button onClick={()=>onUpdateQty(key,1)} style={{ width:26,height:26,borderRadius:6,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",display:"flex",alignItems:"center",justifyContent:"center" }}><Plus size={12}/></button>
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end" }}>
                          <span style={{ fontSize:14,fontWeight:700,color:hasD?"var(--accent)":"var(--text)" }}>{(sp*(item.qty||1)).toLocaleString()} EGP</span>
                          {hasD&&<span style={{ fontSize:10,color:"var(--muted)",textDecoration:"line-through" }}>{(item.price*(item.qty||1)).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>onRemoveItem(key)} style={{ color:"var(--muted)",alignSelf:"flex-start",marginTop:2,padding:4,display:"flex",borderRadius:4,transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="var(--red)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}><Trash2 size={14}/></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length>0 && (
          <div style={{ padding:"16px 20px 20px",borderTop:"1px solid var(--border)",flexShrink:0,background:"var(--surface)" }}>
            {ship>0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:11,color:"var(--muted)" }}>Add <strong style={{ color:"var(--accent)" }}>{(FREE_THRESHOLD-subtotal).toLocaleString()} EGP</strong> for free shipping</span>
                </div>
                <div style={{ height:3,background:"var(--surface2)",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",borderRadius:2,background:"var(--accent)",width:`${Math.min(100,subtotal/FREE_THRESHOLD*100)}%`,transition:"width 0.3s" }}/>
                </div>
              </div>
            )}
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--muted)" }}>
                <span>Subtotal</span><span style={{ color:"var(--text)" }}>{subtotal.toLocaleString()} EGP</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--muted)" }}>
                <span>Delivery</span>
                <span style={{ color:ship===0?"var(--green)":"var(--text)" }}>{ship===0?"Free":`${ship} EGP`}</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid var(--border)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"var(--accent)" }}>{total.toLocaleString()} EGP</span>
              </div>
            </div>
            <button onClick={()=>{close();setTimeout(onCheckout,280);}} style={{ width:"100%",padding:"16px",borderRadius:"var(--r)",background:"var(--accent)",color:"#0C0C0C",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              Checkout <ArrowRight size={16}/>
            </button>
            <div style={{ marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <span style={{ fontSize:12,color:"var(--muted)" }}>💵</span>
              <span style={{ fontSize:11,color:"var(--muted)" }}>Cash on delivery</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CHECKOUT HELPERS (defined outside component to prevent remount on re-render) ──
const checkoutInputStyle = (hasErr) => ({
  width:"100%",padding:"13px 14px",
  background:"var(--surface2)",border:`1px solid ${hasErr?"var(--red)":"var(--border)"}`,
  borderRadius:"var(--r-sm)",color:"var(--text)",fontSize:14,
  outline:"none",transition:"border-color 0.15s",appearance:"none"
});

function CheckoutField({ label, error, children }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <label style={{ fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:error?"var(--red)":"var(--muted)" }}>
        {label}{error&&<span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6 }}>— {error}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── CHECKOUT ────────────────────────────────────────
function CheckoutPage({ cart, onBack, onPlaceOrder, onUpdateQty, onRemoveItem }) {
  const [form, setForm] = useState({ firstName:"",lastName:"",phone:"",email:"",address:"",apartment:"",city:"",governorate:"",deliveryMethod:"delivery" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const isPickup = form.deliveryMethod === "pickup";
  const subtotal = cart.reduce((s,i)=>s+effPrice(i)*(i.qty||1),0);
  const rawSub = cart.reduce((s,i)=>s+i.price*(i.qty||1),0);
  const disc = rawSub - subtotal;
  const ship = isPickup ? 0 : getShip(subtotal);
  const total = subtotal + ship;

  const set = f => e => { setForm(p=>({...p,[f]:e.target.value})); if(errs[f]) setErrs(p=>({...p,[f]:""})); };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName="Required";
    if (!form.lastName.trim()) e.lastName="Required";
    if (!form.phone.trim()) e.phone="Required";
    if (!isPickup) {
      if (!form.address.trim()) e.address="Required";
      if (!form.city.trim()) e.city="Required";
      if (!form.governorate) e.governorate="Required";
    }
    if (form.email&&!/\S+@\S+\.\S+/.test(form.email)) e.email="Invalid email";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/api/orders`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          customer:{...form,deliveryMethod:form.deliveryMethod},
          items:cart.map(i=>({ productId:i._id||i.id,name:i.name,price:i.price,salePrice:effPrice(i)<i.price?effPrice(i):undefined,size:i.size,color:i.colorName||i.color,image:firstImg(i) })),
          subtotal,discount:disc,shipping:ship,total,
          deliveryMethod:form.deliveryMethod
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Order failed");
      onPlaceOrder(data.orderNumber,form.deliveryMethod);
    } catch(err) {
      setServerErr(err.message||"Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  // Alias for convenience inside JSX
  const inputStyle = checkoutInputStyle;
  const Field = CheckoutField;

  return (
    <div style={{ background:"var(--bg)",minHeight:"100vh",color:"var(--text)" }}>
      <div style={{ padding:"16px 20px",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100,background:"rgba(12,12,12,0.9)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:8,color:"var(--muted)",fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}><ChevronLeft size={14}/> Back</button>
        <span style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700 }}>Checkout</span>
        <div style={{ width:60 }}/>
      </div>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"24px 20px 60px" }}>
        <div className="co-grid">
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

            {/* Delivery method */}
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14 }}>How to Receive It?</h2>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {/* Home delivery */}
                <label style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:"var(--r)",border:`2px solid ${!isPickup?"var(--accent)":"var(--border)"}`,background:!isPickup?"rgba(232,193,112,0.06)":"var(--surface2)",cursor:"pointer",transition:"all 0.15s" }}>
                  <input type="radio" name="delivery" value="delivery" checked={!isPickup} onChange={set("deliveryMethod")} style={{ display:"none" }}/>
                  <div style={{ width:36,height:36,borderRadius:10,background:!isPickup?"rgba(232,193,112,0.15)":"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Home size={17} color={!isPickup?"var(--accent)":"var(--muted)"}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:2 }}>Home Delivery</p>
                    <p style={{ fontSize:11,color:"var(--muted)" }}>3–5 days · Egypt-wide</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"var(--accent)" }}>{SHIPPING_COST} EGP</p>
                    <p style={{ fontSize:10,color:"var(--green)" }}>Free over {FREE_THRESHOLD.toLocaleString()} EGP</p>
                  </div>
                </label>

                {/* Store pickup */}
                <label style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:"var(--r)",border:`2px solid ${isPickup?"var(--accent)":"var(--border)"}`,background:isPickup?"rgba(232,193,112,0.06)":"var(--surface2)",cursor:"pointer",transition:"all 0.15s" }}>
                  <input type="radio" name="delivery" value="pickup" checked={isPickup} onChange={set("deliveryMethod")} style={{ display:"none" }}/>
                  <div style={{ width:36,height:36,borderRadius:10,background:isPickup?"rgba(232,193,112,0.15)":"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Store size={17} color={isPickup?"var(--accent)":"var(--muted)"}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:2 }}>Store Pickup</p>
                    <p style={{ fontSize:11,color:"var(--muted)" }}>Sola Brand & Boutique .Al Gala Al Bahari · Shebin El Kom · Menofia</p>
                  </div>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"var(--green)" }}>Free</span>
                </label>
              </div>
            </div>

            {/* Contact */}
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:4 }}>Contact Info</h2>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="First Name" error={errs.firstName}><input value={form.firstName} onChange={set("firstName")} placeholder="Ahmed" style={inputStyle(!!errs.firstName)}/></Field>
              <Field label="Last Name" error={errs.lastName}><input value={form.lastName} onChange={set("lastName")} placeholder="Hassan" style={inputStyle(!!errs.lastName)}/></Field>
            </div>
            <Field label="Phone" error={errs.phone}><input value={form.phone} onChange={set("phone")} placeholder="+20 100 000 0000" type="tel" style={inputStyle(!!errs.phone)}/></Field>
            <Field label="Email (optional)" error={errs.email}><input value={form.email} onChange={set("email")} placeholder="ahmed@email.com" type="email" style={inputStyle(!!errs.email)}/></Field>

            {/* Delivery address — only if not pickup */}
            {!isPickup && (
              <>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:4 }}>Delivery Address</h2>
                <Field label="Street Address / العنوان" error={errs.address}><input value={form.address} onChange={set("address")} placeholder="123 El Tahrir St" style={{ ...inputStyle(!!errs.address),direction:"auto" }}/></Field>
                <Field label="Apartment / الشقة (optional)"><input value={form.apartment} onChange={set("apartment")} placeholder="Apt 5, Floor 2" style={{ ...inputStyle(false),direction:"auto" }}/></Field>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <Field label="City / المدينة" error={errs.city}><input value={form.city} onChange={set("city")} placeholder="Cairo" style={{ ...inputStyle(!!errs.city),direction:"auto" }}/></Field>
                  <Field label="Governorate" error={errs.governorate}>
                    <div style={{ position:"relative" }}>
                      <select value={form.governorate} onChange={set("governorate")} style={{ ...inputStyle(!!errs.governorate),paddingRight:36,cursor:"pointer" }}>
                        <option value="">Select…</option>
                        {EGYPT_GOVS.map(g=><option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"var(--muted)",pointerEvents:"none" }}/>
                    </div>
                  </Field>
                </div>
              </>
            )}

            {/* Pickup info */}
            {isPickup && (
              <div style={{ padding:"14px 16px",borderRadius:"var(--r)",background:"rgba(76,175,125,0.08)",border:"1px solid rgba(76,175,125,0.2)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <MapPin size={15} color="var(--green)"/>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"var(--green)" }}>Pickup Address</span>
                </div>
                <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.7 }}>Sola Brand & Boutique, Al Gala Al Bahari, Shebin El Kom, Menofia Governorate, Egypt</p>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
                  <Clock size={13} color="var(--muted)"/>
                  <span style={{ fontSize:11,color:"var(--muted)" }}>Open Sat–Fri · 6:00 PM – 12:00 AM</span>
                </div>
              </div>
            )}

            {/* Payment */}
            <div style={{ padding:"14px 16px",borderRadius:"var(--r)",background:"rgba(76,175,125,0.08)",border:"1px solid rgba(76,175,125,0.2)",display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:22 }}>💵</span>
              <div>
                <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--green)",marginBottom:3 }}>Cash on Delivery</p>
                <p style={{ fontSize:12,color:"rgba(76,175,125,0.7)" }}>Pay when your order arrives. No prepayment needed.</p>
              </div>
            </div>

            {serverErr && (
              <div style={{ padding:"12px 16px",borderRadius:"var(--r-sm)",background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)" }}>
                <p style={{ fontSize:12,color:"var(--red)" }}>{serverErr}</p>
              </div>
            )}

            <button onClick={submit} disabled={loading||cart.length===0} style={{ padding:"17px",borderRadius:"var(--r)",background:loading?"var(--surface2)":"var(--accent)",color:loading?"var(--muted)":"#0C0C0C",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.2s",cursor:loading?"not-allowed":"pointer" }}>
              {loading ? (
                <><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#0C0C0C",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/> Placing Order…</>
              ) : (
                <><Check size={15}/> Place Order — {total.toLocaleString()} EGP</>
              )}
            </button>
          </div>

          {/* Summary */}
          <div>
            <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r)",overflow:"hidden",position:"sticky",top:80 }}>
              <div style={{ padding:"16px 18px",borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>Order Summary</span>
              </div>
              <div style={{ padding:"16px 18px",display:"flex",flexDirection:"column",gap:12 }}>
                {cart.map((item,idx)=>{
                  const key=`${item._id||item.id}-${item.size}-${item.colorName||item.color}`;
                  const sp=effPrice(item); const img=firstImg(item);
                  return (
                    <div key={key} style={{ display:"flex",gap:12,paddingBottom:12,borderBottom:idx<cart.length-1?"1px solid var(--border)":"none" }}>
                      <div style={{ width:50,height:60,borderRadius:8,overflow:"hidden",background:"var(--surface2)",flexShrink:0 }}>
                        {img&&<img src={img} alt={item.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:600,marginBottom:3,lineHeight:1.3 }}>{item.name}</p>
                        <p style={{ fontSize:11,color:"var(--muted)",marginBottom:5 }}>{item.size} · {item.colorName||item.color} · ×{item.qty||1}</p>
                        <p style={{ fontSize:13,fontWeight:700,color:"var(--accent)" }}>{(sp*(item.qty||1)).toLocaleString()} EGP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"14px 18px",background:"var(--surface2)",display:"flex",flexDirection:"column",gap:8 }}>
                {disc>0&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span style={{ color:"var(--muted)" }}>Discount</span><span style={{ color:"var(--red)",fontWeight:600 }}>-{disc.toLocaleString()} EGP</span></div>}
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>Delivery</span>
                  <span style={{ color:ship===0?"var(--green)":"var(--text)" }}>{ship===0?"Free":`${ship} EGP`}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700 }}>Total</span>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"var(--accent)" }}>{total.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRUST CARDS ────────────────────────────────────
const TRUST = [
  { icon:"⭐", title:"Genuine Gear Only", desc:"Every product ships from official brand distributors. No fakes, ever." },
  { icon:"🔄", title:"Changed Your Mind?", desc:"Refund and exchange within 14 days — no awkward questions." },
  { icon:"🛡️", title:"Covered for 6 Months", desc:"All item carries full manufacturer warranty." },
  { icon:"👕", title:"Tried & Tested", desc:"Our team personally wears every piece we sell. We only stock what we believe in." },
];

// ─── SHOWROOM SECTION ────────────────────────────────
function ShowroomSection() {
  const now = new Date();
  const hour = now.getHours();
  const isOpen = hour >= 18 || hour < 0; // 6PM–midnight
  return (
    <section style={{ padding:"clamp(40px,7vw,72px) 20px", maxWidth:1280, margin:"0 auto" }}>
      <div className="showroom-grid">
        {/* Left card */}
        <div style={{ borderRadius:"var(--r)",overflow:"hidden",background:"var(--surface)",border:"1px solid var(--border)",padding:"28px 28px 32px",position:"relative",minHeight:280 }}>
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 80%, rgba(76,175,125,0.08) 0%, transparent 60%)",pointerEvents:"none" }}/>
          <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:20,background:"rgba(232,193,112,0.15)",border:"1px solid rgba(232,193,112,0.3)",fontSize:10,fontWeight:700,letterSpacing:"0.14em",color:"var(--accent)",textTransform:"uppercase",marginBottom:20 }}>Showroom</span>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(30px,5vw,46px)",fontWeight:800,lineHeight:1.1,marginBottom:16 }}>Come<br/>see us.</h2>
          <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.7,marginBottom:24 }}>
            Sola Brand & Boutique - Al Gala Al Bahari — Shebin El Kom<br/>Menofia Governorate, Egypt
          </p>
          <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.7,marginBottom:24 }}>
            Try before you buy. Our team will help you find the right fit — no pressure, just great style.
          </p>
          <a href="https://maps.app.goo.gl/GceirPiDPp7rkwGx9" target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:"var(--r-sm)",border:"1px solid var(--border)",color:"var(--text)",fontSize:12,fontWeight:600,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text)";}}>
            <MapPin size={14}/> Open in Maps
          </a>
        </div>
        {/* Right card */}
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {/* Hours */}
          <div style={{ borderRadius:"var(--r)",background:"var(--surface)",border:"1px solid var(--border)",padding:"22px 24px",flex:1 }}>
            <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",marginBottom:12 }}>Open Hours</p>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:isOpen?"var(--green)":"var(--red)",animation:isOpen?"pulse 2s ease-in-out infinite":"none" }}/>
              <span style={{ fontSize:12,fontWeight:600,color:isOpen?"var(--green)":"var(--red)" }}>{isOpen?"Open now":"Closed now"}</span>
              <span style={{ marginLeft:"auto",fontSize:11,color:"var(--muted)" }}>Sat – Fri</span>
            </div>
            <p style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(22px,4vw,32px)",fontWeight:800,marginBottom:8 }}>6:00 PM – 12:00 AM</p>
            <p style={{ fontSize:12,color:"var(--muted)" }}>Drop in for a fitting or same-day pickup on in-stock items.</p>
          </div>
          {/* WhatsApp */}
          <div style={{ borderRadius:"var(--r)",background:"var(--surface)",border:"1px solid var(--border)",padding:"22px 24px" }}>
            <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",marginBottom:8 }}>Talk to us</p>
            <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,lineHeight:1.2,marginBottom:10 }}>Not sure<br/>what to get?</h3>
            <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.7,marginBottom:16 }}>Send us a message and a real person on our team will point you in the right direction — no bots.</p>
            <a href="https://wa.me/201010886611" target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:"var(--r-sm)",background:"rgba(37,211,102,0.15)",border:"1px solid rgba(37,211,102,0.3)",color:"#25D366",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",transition:"all 0.15s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(37,211,102,0.22)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(37,211,102,0.15)"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Trust cards */}
      <div className="trust-grid" style={{ marginTop:16 }}>
        {TRUST.map((t,i) => (
          <div key={i} style={{ borderRadius:"var(--r)",background:"var(--surface)",border:"1px solid var(--border)",padding:"20px 18px" }}>
            <span style={{ fontSize:22,display:"block",marginBottom:12 }}>{t.icon}</span>
            <h4 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:8,lineHeight:1.3 }}>{t.title}</h4>
            <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.7 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // home | product | checkout | confirm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [orderNum, setOrderNum] = useState(null);
  const [orderMethod, setOrderMethod] = useState("delivery");
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r=>r.json()).catch(()=>null),
      fetch(`${API}/api/products`).then(r=>r.json()).catch(()=>null),
    ]).then(([settings,prods]) => {
      if (settings) {
        if (settings.shippingCost!==undefined) SHIPPING_COST=settings.shippingCost;
        if (settings.freeShippingThreshold!==undefined) FREE_THRESHOLD=settings.freeShippingThreshold;
        if (settings.shippingEnabled!==undefined) SHIPPING_ON=settings.shippingEnabled;
      }
      setProducts(Array.isArray(prods)&&prods.length?prods:FALLBACK);
    }).finally(()=>setLoading(false));
  }, []);

  const filtered = (cat==="all"?products:products.filter(p=>(p.category||"").toLowerCase()===cat))
    .filter(p=>!searchQ.trim()||p.name.toLowerCase().includes(searchQ.toLowerCase())||(p.description||"").toLowerCase().includes(searchQ.toLowerCase()));

  const openProduct = (p) => {
    history.pushState({ solaPage:"product", productId:p._id||p.id }, "");
    setActiveProduct(p); setPage("product"); window.scrollTo({top:0,behavior:"instant"});
  };
  const closeProduct = () => { setPage("home"); setActiveProduct(null); };

  // Phone back button — when user hits back, return to home instead of leaving site
  useEffect(() => {
    const onPop = () => {
      setPage("home"); setActiveProduct(null); window.scrollTo({top:0,behavior:"instant"});
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const addToCart = (product, size, colorName) => {
    const key = `${product._id||product.id}-${size}-${colorName}`;
    setCart(prev => {
      const ex = prev.find(i=>`${i._id||i.id}-${i.size}-${i.colorName||i.color}`===key);
      if (ex) return prev.map(i=>`${i._id||i.id}-${i.size}-${i.colorName||i.color}`===key?{...i,qty:(i.qty||1)+1}:i);
      return [...prev,{...product,size,colorName,color:colorName,qty:1}];
    });
    setCartOpen(true);
  };

  const updateQty = (key,delta) => setCart(prev=>prev.map(i=>`${i._id||i.id}-${i.size}-${i.colorName||i.color}`===key?{...i,qty:Math.max(1,(i.qty||1)+delta)}:i));
  const removeItem = (key) => setCart(prev=>prev.filter(i=>`${i._id||i.id}-${i.size}-${i.colorName||i.color}`!==key));
  const cartCount = cart.reduce((s,i)=>s+(i.qty||1),0);

  // Render pages
  if (page==="product"&&activeProduct) {
    return (
      <>
        {/* Minimal nav for product page */}
        <nav style={{ position:"sticky",top:0,zIndex:700,background:"rgba(12,12,12,0.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)",padding:"0 20px" }}>
          <div style={{ maxWidth:1280,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <button onClick={closeProduct} style={{ display:"flex",alignItems:"center",gap:8,color:"var(--muted)",fontSize:12,fontWeight:600,letterSpacing:"0.06em",transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}><ChevronLeft size={15}/> Back</button>
            <button onClick={closeProduct} style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,letterSpacing:"0.18em",background:"none",border:"none",color:"var(--text)",cursor:"pointer" }}>SOLA</button>
            <button onClick={()=>setCartOpen(true)} style={{ height:36,borderRadius:10,padding:"0 12px",background:cartCount>0?"var(--accent)":"var(--surface)",border:`1px solid ${cartCount>0?"var(--accent)":"var(--border)"}`,color:cartCount>0?"#0C0C0C":"var(--muted)",display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:600,transition:"all 0.2s" }}>
              <ShoppingBag size={15}/>
              {cartCount>0&&<span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800 }}>{cartCount}</span>}
            </button>
          </div>
        </nav>
        <ProductPage product={activeProduct} onClose={closeProduct} onAddToCart={(p,s,c)=>{addToCart(p,s,c);}}/>
        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onCheckout={()=>{setCartOpen(false);setPage("checkout");}} onUpdateQty={updateQty} onRemoveItem={removeItem}/>}
      </>
    );
  }

  if (page==="checkout") {
    return <CheckoutPage cart={cart} onBack={()=>setPage("home")} onUpdateQty={updateQty} onRemoveItem={removeItem}
      onPlaceOrder={(num,method)=>{setOrderNum(num);setOrderMethod(method);setCart([]);setPage("confirm");}}/>;
  }

  if (page==="confirm") {
    const isPickup = orderMethod==="pickup";
    return (
      <div style={{ minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
        <div style={{ textAlign:"center",maxWidth:480,animation:"fadeUp 0.6s ease" }}>
          <div style={{ width:80,height:80,borderRadius:"50%",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",animation:"glow 2s ease-in-out infinite" }}>
            <Check size={40} color="#fff" strokeWidth={2.5}/>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,marginBottom:12 }}>Order Confirmed!</h1>
          <p style={{ fontSize:14,color:"var(--muted)",lineHeight:1.8,marginBottom:24 }}>
            {isPickup ? "Come pick it up at our Shebin El Kom showroom anytime during opening hours." : "Our team will contact you soon to confirm delivery details."}
          </p>
          {orderNum&&(
            <div style={{ padding:"16px 20px",borderRadius:"var(--r)",background:"var(--surface)",border:"1px solid var(--border)",marginBottom:20 }}>
              <p style={{ fontSize:10,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6 }}>Order Number</p>
              <p style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"var(--accent)" }}>{orderNum}</p>
            </div>
          )}
          {isPickup ? (
            <div style={{ padding:"14px 16px",borderRadius:"var(--r-sm)",background:"rgba(76,175,125,0.1)",border:"1px solid rgba(76,175,125,0.2)",marginBottom:28,display:"flex",alignItems:"center",gap:10,justifyContent:"center" }}>
              <Store size={16} color="var(--green)"/>
              <div style={{ textAlign:"left" }}>
                <p style={{ fontSize:12,color:"var(--green)",fontWeight:600 }}>Pickup · Sola Brand & Boutique,Al Gala Al Bahari, Shebin El Kom</p>
                <p style={{ fontSize:11,color:"rgba(76,175,125,0.7)" }}>Sat–Fri · 6:00 PM – 12:00 AM</p>
              </div>
            </div>
          ) : (
            <div style={{ padding:"12px 16px",borderRadius:"var(--r-sm)",background:"rgba(76,175,125,0.1)",border:"1px solid rgba(76,175,125,0.2)",marginBottom:28,display:"flex",alignItems:"center",gap:10,justifyContent:"center" }}>
              <span style={{ fontSize:18 }}>💵</span>
              <span style={{ fontSize:13,color:"var(--green)" }}>You'll pay cash when the order arrives</span>
            </div>
          )}
          <button onClick={()=>setPage("home")} style={{ width:"100%",padding:"16px",borderRadius:"var(--r)",background:"var(--accent)",color:"#0C0C0C",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.08em" }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"var(--bg)",color:"var(--text)",minHeight:"100vh" }}>
      {/* Search overlay */}
      {searchOpen&&(
        <>
          <div onClick={()=>{setSearchOpen(false);setSearchQ("");}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1100,backdropFilter:"blur(8px)",animation:"fadeIn 0.2s" }}/>
          <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:1101,background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 20px",animation:"slideDown 0.3s cubic-bezier(0.25,1,0.5,1)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
            <div style={{ maxWidth:700,margin:"0 auto",display:"flex",alignItems:"center",gap:12 }}>
              <Search size={18} color="var(--accent)"/>
              <input ref={searchRef} autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search products…" style={{ flex:1,background:"none",border:"none",color:"var(--text)",fontSize:18,outline:"none" }}/>
              {searchQ&&<button onClick={()=>setSearchQ("")} style={{ color:"var(--muted)",display:"flex" }}><X size={16}/></button>}
              <button onClick={()=>{setSearchOpen(false);setSearchQ("");}} style={{ color:"var(--muted)",fontSize:12,fontWeight:600,padding:"6px 12px",borderLeft:"1px solid var(--border)" }}>Close</button>
            </div>
            {searchQ.trim()&&(
              <div style={{ maxWidth:700,margin:"12px auto 0",paddingTop:12,borderTop:"1px solid var(--border)" }}>
                <p style={{ fontSize:10,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10 }}>{filtered.length} result{filtered.length!==1?"s":""} for "{searchQ}"</p>
                <div style={{ maxHeight:"55vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:4 }}>
                  {filtered.length===0?(
                    <p style={{ fontSize:14,color:"var(--muted)",padding:"12px 0" }}>No products found.</p>
                  ):filtered.map(p=>(
                    <button key={p._id||p.id} onClick={()=>{setSearchOpen(false);setSearchQ("");openProduct(p);}} style={{ display:"flex",alignItems:"center",gap:14,padding:"10px",borderRadius:"var(--r-sm)",textAlign:"left",transition:"background 0.15s",color:"var(--text)" }} onMouseEnter={e=>e.currentTarget.style.background="var(--surface2)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      <div style={{ width:44,height:52,borderRadius:8,overflow:"hidden",background:"var(--surface2)",flexShrink:0 }}>
                        {firstImg(p)&&<img src={firstImg(p)} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13,fontWeight:600,marginBottom:2 }}>{p.name}</p>
                        <p style={{ fontSize:11,color:"var(--muted)" }}>{p.description}</p>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:"var(--accent)",flexShrink:0 }}>{effPrice(p).toLocaleString()} EGP</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onCheckout={()=>{setCartOpen(false);setPage("checkout");}} onUpdateQty={updateQty} onRemoveItem={removeItem}/>}

      {/* NAV */}
      <nav style={{ position:"sticky",top:0,zIndex:700,background:"rgba(12,12,12,0.85)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)",padding:"0 20px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto",height:60,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <button onClick={()=>{setPage("home");setActiveProduct(null);window.scrollTo({top:0,behavior:"instant"});}} style={{ display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",color:"inherit" }}>
            <img src="/logo.jpg" alt="Sola" style={{ height:32,width:32,objectFit:"contain",borderRadius:6 }} onError={e=>e.currentTarget.style.display="none"}/>
            <div>
              <div style={{ fontFamily: "'Michroma', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.25em", lineHeight: 1 }}>SOLA</div>
              <div style={{ fontSize:8,fontWeight:500,letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--muted)",lineHeight:1 }}>Brand & Boutique</div>
            </div>
          </button>
          <div className="nav-links" style={{ gap:32,fontSize:12,fontWeight:500,color:"var(--muted)" }}>
            {["Shop","About","Contact"].map(l=>(
              <a key={l} href={l==="Shop"?"#collection":"#"} style={{ transition:"color 0.15s",letterSpacing:"0.06em" }} onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>{l}</a>
            ))}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <button onClick={()=>{setSearchOpen(true);setTimeout(()=>searchRef.current?.focus(),80);}} style={{ width:40,height:40,borderRadius:10,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--muted)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="var(--accent)";}} onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="var(--border)";}}><Search size={16}/></button>
            <button onClick={()=>setCartOpen(true)} style={{ height:40,borderRadius:10,padding:"0 14px",background:cartCount>0?"var(--accent)":"var(--surface)",border:`1px solid ${cartCount>0?"var(--accent)":"var(--border)"}`,color:cartCount>0?"#0C0C0C":"var(--muted)",display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:600,transition:"all 0.2s" }}>
              <ShoppingBag size={15}/>{cartCount>0&&<span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800 }}>{cartCount}</span>}
            </button>
            <button id="burger-btn" onClick={()=>setMobileNav(!mobileNav)} style={{ display:"none",width:40,height:40,borderRadius:10,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",alignItems:"center",justifyContent:"center" }}>
              {mobileNav?<X size={16}/>:<Menu size={16}/>}
            </button>
          </div>
        </div>
        {mobileNav&&(
          <div style={{ borderTop:"1px solid var(--border)",padding:"16px 0",display:"flex",flexDirection:"column",gap:2 }}>
            {["Shop","About","Contact"].map(l=>(
              <a key={l} href={l==="Shop"?"#collection":"#"} onClick={()=>setMobileNav(false)} style={{ padding:"12px 4px",fontSize:15,fontWeight:600,color:"var(--muted)",letterSpacing:"0.04em",transition:"color 0.15s",fontFamily:"'Syne',sans-serif" }}>{l}</a>
            ))}
          </div>
        )}
      </nav>
      <style>{`@media(max-width:767px){#burger-btn{display:flex!important;}}`}</style>

      {/* ANNOUNCEMENT BAR */}
      <div style={{ background:"linear-gradient(90deg,#C0392B 0%,#E05252 40%,#C0392B 100%)",padding:"10px 16px",textAlign:"center",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0,rgba(255,255,255,0.04) 1px,transparent 0,transparent 50%)",backgroundSize:"8px 8px",pointerEvents:"none" }}/>
        <div style={{ display:"inline-flex",alignItems:"center",gap:10,position:"relative",zIndex:1,flexWrap:"wrap",justifyContent:"center" }}>
          <Flame size={13} style={{ color:"#FFD700",flexShrink:0 }}/>
          <span style={{ fontSize:11,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",color:"#fff" }}>
            SALE — UP TO <span style={{ color:"#FFD700",fontSize:13 }}>70% OFF</span> · LIMITED TIME ONLY
          </span>
          <span style={{ fontSize:10,color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em" }}>·</span>
          <a href="#collection" style={{ fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#FFD700",textDecoration:"underline",textUnderlineOffset:3,whiteSpace:"nowrap" }}>
            Shop Now →
          </a>
          <Flame size={13} style={{ color:"#FFD700",flexShrink:0 }}/>
        </div>
      </div>

      {/* HERO */}
      <section style={{ minHeight:"88vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0C0C0C 0%,#161616 50%,#0C0C0C 100%)" }}>
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 60% 40%,rgba(232,193,112,0.06) 0%,transparent 70%)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none" }}/>
        <div style={{ textAlign:"center",padding:"clamp(80px,12vh,120px) 24px 60px",maxWidth:700,position:"relative",zIndex:2,animation:"fadeUp 0.9s ease 0.1s both" }}>

          {/* Sale badge row */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20,flexWrap:"wrap" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 16px",borderRadius:20,background:"rgba(224,82,82,0.15)",border:"1px solid rgba(224,82,82,0.4)" }}>
              <Flame size={11} style={{ color:"#E05252" }}/>
              <span style={{ fontSize:10,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",color:"#E05252" }}>UP TO 70% OFF</span>
            </div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:20,background:"rgba(232,193,112,0.1)",border:"1px solid rgba(232,193,112,0.2)" }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--accent)" }}>Spring / Summer 2026</span>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(42px,10vw,96px)",fontWeight:800,lineHeight:1.0,letterSpacing:"-0.03em",marginBottom:20,background:"linear-gradient(135deg,#F0EDEA 0%,#E8C170 50%,#F0EDEA 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
            Elevate<br/>the Everyday.
          </h1>
          <p style={{ fontSize:"clamp(13px,1.8vw,15px)",color:"var(--muted)",lineHeight:1.85,marginBottom:16,maxWidth:480,margin:"0 auto 16px" }}>
            Refined fashion for the modern man. Crafted with intention. Worn without effort.
          </p>

          {/* Urgency line */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,marginBottom:32,padding:"8px 18px",borderRadius:"var(--r-sm)",background:"rgba(224,82,82,0.08)",border:"1px solid rgba(224,82,82,0.25)" }}>
            <AlertTriangle size={11} style={{ color:"#E05252",flexShrink:0 }}/>
            <span style={{ fontSize:11,color:"rgba(240,237,234,0.7)",letterSpacing:"0.06em" }}>
              Sale ends soon — <span style={{ color:"#E05252",fontWeight:700 }}>limited stock available</span>
            </span>
          </div>

          <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
            <a href="#collection" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:"var(--r)",background:"var(--accent)",color:"#0C0C0C",fontSize:12,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              Shop Sale Now <ArrowRight size={13}/>
            </a>
            <a href="#showroom" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:"var(--r)",background:"transparent",color:"var(--text)",fontSize:12,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",border:"1px solid var(--border)",transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              Visit Showroom
            </a>
          </div>
        </div>
        <div style={{ position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:0.4 }}>
          <span style={{ fontSize:8,letterSpacing:"0.22em",textTransform:"uppercase" }}>Scroll</span>
          <ChevronDown size={12} strokeWidth={1.5}/>
        </div>
      </section>

      {/* MARQUEE — slower (35s) */}
      <div style={{ background:"var(--accent)",padding:"10px 0",overflow:"hidden",whiteSpace:"nowrap" }}>
        <div style={{ display:"inline-flex",gap:48,animation:"marquee 35s linear infinite" }}>
          {Array(8).fill(["🔥 SALE UP TO 70% OFF","New Collection SS26","Sola Brand & Boutique · Menofia","Cash on Delivery","Free Shipping Over 1500 EGP","Visit our Showroom · 6PM–12AM"]).flat().map((t,i)=>(
            <span key={i} style={{ fontSize:10,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"#0C0C0C",opacity:0.8 }}>{t} &nbsp;·</span>
          ))}
        </div>
      </div>

      {/* COLLECTION */}
      <section id="collection" style={{ padding:"clamp(40px,7vw,80px) 20px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12 }}>
          <div>
            <p style={{ fontSize:10,color:"var(--muted)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8 }}>{products.length} items</p>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(22px,4vw,36px)",fontWeight:800,letterSpacing:"-0.02em" }}>The Collection</h2>
          </div>
        </div>
        {/* Category pills */}
        <div style={{ display:"flex",gap:8,marginBottom:28,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",msOverflowStyle:"none" }}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} style={{ padding:"8px 16px",borderRadius:20,flexShrink:0,background:cat===c.id?"var(--accent)":"var(--surface)",border:`1px solid ${cat===c.id?"var(--accent)":"var(--border)"}`,color:cat===c.id?"#0C0C0C":"var(--muted)",fontSize:12,fontWeight:600,fontFamily:cat===c.id?"'Syne',sans-serif":"inherit",transition:"all 0.15s",cursor:"pointer",whiteSpace:"nowrap" }}>{c.label}</button>
          ))}
        </div>
        {/* Grid */}
        {loading ? (
          <div className="pgrid">{Array(6).fill(0).map((_,i)=><ProductSkeleton key={i}/>)}</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"60px 20px",color:"var(--muted)" }}>
            <Package size={48} strokeWidth={1} style={{ marginBottom:16,opacity:0.4 }}/>
            <p style={{ fontSize:16,marginBottom:8 }}>No products found</p>
            <button onClick={()=>setCat("all")} style={{ color:"var(--accent)",fontSize:13,fontWeight:600,border:"none",background:"none",cursor:"pointer" }}>View all →</button>
          </div>
        ) : (
          <div className="pgrid">
            {filtered.map((p,i)=><ProductCard key={p._id||p.id} product={p} idx={i} onTap={openProduct}/>)}
          </div>
        )}
      </section>

      {/* SHOWROOM */}
      <div id="showroom"><ShowroomSection/></div>

      {/* QUOTE */}
      <section style={{ padding:"clamp(52px,8vw,80px) 24px",background:"var(--surface)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",textAlign:"center" }}>
        <div style={{ maxWidth:520,margin:"0 auto" }}>
          <div style={{ width:24,height:2,background:"var(--accent)",margin:"0 auto 24px" }}/>
          <blockquote style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(16px,2.5vw,24px)",fontWeight:600,lineHeight:1.65,color:"var(--text)",marginBottom:18 }}>
            "We don't design clothes. We design the space between who you are and who you could be."
          </blockquote>
          <p style={{ fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--muted)" }}>— Sola Brand & Boutique</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"var(--surface)",borderTop:"1px solid var(--border)",padding:"clamp(40px,6vw,64px) 20px 24px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:36,marginBottom:48 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <img src="/logo.jpg" alt="Sola" style={{ height:30,width:30,objectFit:"contain",borderRadius:6,filter:"invert(1)" }} onError={e=>e.currentTarget.style.display="none"}/>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,letterSpacing:"0.18em" }}>SOLA</div>
                  <div style={{ fontSize:8,letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--muted)" }}>Brand & Boutique</div>
                </div>
              </div>
              <p style={{ fontSize:12,lineHeight:1.8,color:"var(--muted)",maxWidth:200 }}>Refined fashion for the considered man. Based in Menofia, Egypt.</p>
              <div style={{ display:"flex",gap:12,marginTop:16 }}>
                {[
                  {href:"https://www.instagram.com/sola.boutiquee",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg>},
                  {href:"https://www.facebook.com/share/14VnCCFNwL1/",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>},
                  {href:"https://www.tiktok.com/@sola.boutiquee",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>},
                ].map((s,i)=>(
                  <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{ width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.color="var(--accent)";e.currentTarget.style.borderColor="var(--accent)";}} onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="var(--border)";}}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {[
              {label:"Company",links:[{name:"About",href:"#"},{name:"Journal",href:"#"},{name:"Showroom",href:"#showroom"}]},
              {label:"Support",links:[{name:"Shipping",href:"#"},{name:"Returns",href:"#"},{name:"Size Guide",href:"#"},{name:"Contact",href:"https://wa.me/201010886611"}]},
            ].map(col=>(
              <div key={col.label}>
                <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)",marginBottom:16 }}>{col.label}</p>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {col.links.map(l=>(
                    <a key={l.name} href={l.href} style={{ fontSize:13,color:"rgba(240,237,234,0.5)",transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="var(--text)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(240,237,234,0.5)"}>{l.name}</a>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)",marginBottom:14 }}>Newsletter</p>
              <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.75,marginBottom:14 }}>New arrivals & exclusives.</p>
              {subbed ? (
                <p style={{ fontSize:12,color:"var(--green)",display:"flex",alignItems:"center",gap:6 }}><Check size={13}/> You're subscribed!</p>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&(setSubbed(true),setEmail(""))} style={{ padding:"11px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:"var(--r-sm)",color:"var(--text)",fontSize:13,width:"100%",outline:"none" }}/>
                  <button onClick={()=>email.includes("@")&&(setSubbed(true),setEmail(""))} style={{ padding:"11px",borderRadius:"var(--r-sm)",background:"var(--accent)",color:"#0C0C0C",fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase" }}>Subscribe</button>
                </div>
              )}
            </div>
          </div>
          <div style={{ borderTop:"1px solid var(--border)",paddingTop:18,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
            <p style={{ fontSize:11,color:"rgba(240,237,234,0.2)" }}>© 2026 Sola Brand & Boutique. All rights reserved.</p>
            <p style={{ fontSize:11,color:"rgba(240,237,234,0.2)" }}>Privacy · Terms · Cookies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}