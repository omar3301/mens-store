import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Check, ShoppingBag } from "lucide-react";
import { getEffectivePrice, getDiscountLabel } from "../data/products";

export default function ProductPopup({ product, onClose, onAddToCart, onBuyNow }) {
  const [imgIdx, setImgIdx]      = useState(0);
  const [selectedSize, setSize]  = useState("");
  const [selectedColor, setColor]= useState(product.colors?.[0] || null);
  const [added, setAdded]        = useState(false);
  const [closing, setClosing]    = useState(false);
  const [sizeError, setSizeError]= useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const zoomImgRef = useRef(null); const zoomDivRef = useRef(null); const holdTimer = useRef(null);
  const [sheetY, setSheetY]      = useState(0);
  const sheetDragStart = useRef(null); const isDraggingSheet = useRef(false);
  const [mobZoom, setMobZoom]    = useState(false);
  const [mobZoomPos, setMobZoomPos] = useState({ x:50, y:50 });
  const mobImgRef = useRef(null); const mobHoldTimer = useRef(null);
  const mobTouchStart = useRef(null); const swipeXRef = useRef(null);

  const imgs  = product.images?.length > 0 ? product.images : [];
  const total = imgs.length;
  const salePrice  = getEffectivePrice(product);
  const discLabel  = getDiscountLabel(product);
  const hasDiscount = discLabel !== null;

  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = sw > 0 ? `${sw}px` : "";
    return () => { document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, []);

  const smoothClose = () => { setClosing(true); setTimeout(onClose, 260); };
  const prev = () => setImgIdx(i => (i-1+total)%total);
  const next = () => setImgIdx(i => (i+1)%total);

  const onDeskMove  = (e) => { if (!zoomDivRef.current||!zoomImgRef.current) return; const r=zoomDivRef.current.getBoundingClientRect(); zoomImgRef.current.style.transformOrigin=`${Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100))}% ${Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100))}%`; };
  const onDeskDown  = () => { holdTimer.current=setTimeout(()=>{ if(zoomImgRef.current)zoomImgRef.current.style.transform="scale(2.2)"; setZoomActive(true); },120); };
  const onDeskUp    = () => { clearTimeout(holdTimer.current); if(zoomImgRef.current)zoomImgRef.current.style.transform="scale(1)"; setZoomActive(false); };
  const onDeskLeave = () => { clearTimeout(holdTimer.current); if(zoomImgRef.current)zoomImgRef.current.style.transform="scale(1)"; setZoomActive(false); };

  const onHandleStart=(e)=>{ isDraggingSheet.current=true; sheetDragStart.current=e.touches[0].clientY; };
  const onHandleMove =(e)=>{ if(!isDraggingSheet.current)return; setSheetY(Math.max(0,e.touches[0].clientY-sheetDragStart.current)); };
  const onHandleEnd  =()=>{ isDraggingSheet.current=false; sheetY>90?smoothClose():setSheetY(0); };

  const onMobStart=(e)=>{ if(e.touches.length!==1)return; const t=e.touches[0]; swipeXRef.current=t.clientX; mobTouchStart.current={x:t.clientX,y:t.clientY}; mobHoldTimer.current=setTimeout(()=>{ if(mobImgRef.current){const r=mobImgRef.current.getBoundingClientRect();setMobZoomPos({x:Math.max(0,Math.min(100,((t.clientX-r.left)/r.width)*100)),y:Math.max(0,Math.min(100,((t.clientY-r.top)/r.height)*100))});} setMobZoom(true); },350); };
  const onMobMove =(e)=>{ if(!mobTouchStart.current)return; const t=e.touches[0]; if(Math.abs(t.clientX-mobTouchStart.current.x)>8||Math.abs(t.clientY-mobTouchStart.current.y)>8)clearTimeout(mobHoldTimer.current); if(mobZoom)e.preventDefault(); };
  const onMobEnd  =(e)=>{ clearTimeout(mobHoldTimer.current); if(mobZoom){setMobZoom(false);return;} const dx=(swipeXRef.current||0)-e.changedTouches[0].clientX; if(Math.abs(dx)>44&&total>1){dx>0?next():prev();} swipeXRef.current=null; mobTouchStart.current=null; };

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) { setSizeError(true); setTimeout(()=>setSizeError(false),2000); return; }
    onAddToCart(product, selectedSize, selectedColor);
    setAdded(true); setTimeout(()=>setAdded(false), 1800);
  };
  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) { setSizeError(true); setTimeout(()=>setSizeError(false),2000); return; }
    onBuyNow(product, selectedSize, selectedColor);
    smoothClose();
  };

  const InfoPanel = ({ mobile = false }) => (
    <div style={{ display:"flex", flexDirection:"column" }}>
      {/* Category + tag */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom: mobile?"10px":"14px" }}>
        <p style={{ fontSize:"8px", letterSpacing:"0.26em", textTransform:"uppercase", color:"#B8966E", fontWeight:600 }}>{product.badge||product.category}</p>
        {product.tag && <span style={{ fontSize:"7px", letterSpacing:"0.14em", textTransform:"uppercase", backgroundColor:"#1A1816", color:"#FAF9F7", padding:"2px 7px", borderRadius:"2px" }}>{product.tag}</span>}
        {hasDiscount && <span style={{ fontSize:"9px", fontWeight:700, backgroundColor:"#C0392B", color:"#fff", padding:"2px 9px", borderRadius:"3px" }}>{discLabel}</span>}
      </div>

      <h1 className="serif" style={{ fontSize: mobile?"clamp(28px,7vw,36px)":"clamp(24px,2.5vw,34px)", fontWeight:300, lineHeight:1.1, marginBottom:"6px" }}>{product.name}</h1>
      <p style={{ fontSize:"9px", letterSpacing:"0.14em", textTransform:"uppercase", color:"#9A9590", fontWeight:500, marginBottom: mobile?"16px":"20px" }}>{product.description}</p>

      {/* Price */}
      <div style={{ display:"flex", alignItems:"baseline", gap:"8px", marginBottom: mobile?"20px":"26px" }}>
        {hasDiscount ? (
          <>
            <span className="serif" style={{ fontSize: mobile?"32px":"36px", fontWeight:300, color:"#C0392B" }}>{salePrice.toLocaleString()}</span>
            <span style={{ fontSize:"13px", color:"#9A9590" }}>EGP</span>
            <span style={{ fontSize:"16px", color:"#B8A898", textDecoration:"line-through", marginLeft:"4px" }}>{product.price.toLocaleString()}</span>
          </>
        ) : (
          <>
            <span className="serif" style={{ fontSize: mobile?"32px":"36px", fontWeight:300 }}>{product.price.toLocaleString()}</span>
            <span style={{ fontSize:"13px", color:"#9A9590" }}>EGP</span>
          </>
        )}
      </div>

      {/* Color */}
      {product.colors?.length > 1 && (
        <div style={{ marginBottom: mobile?"16px":"20px" }}>
          <p style={{ fontSize:"8px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"10px" }}>
            Color: <span style={{ color:"#7A7570", fontWeight:500 }}>{selectedColor?.name}</span>
          </p>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {product.colors.map(c => (
              <button key={c.name} title={c.name} onClick={() => setColor(c)}
                style={{ width:"28px", height:"28px", borderRadius:"50%", backgroundColor:c.hex, border: selectedColor?.name===c.name?"2px solid #1A1816":"2px solid transparent", outline: selectedColor?.name===c.name?"1px solid #1A1816":"1px solid #DDD8D2", outlineOffset:"2px", cursor:"pointer", transition:"all 0.15s" }} />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes?.length > 0 && (
        <div style={{ marginBottom: mobile?"20px":"26px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <p style={{ fontSize:"8px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color: sizeError?"#C0392B":"#1A1816" }}>
              {sizeError ? "⚠ Please select a size" : "Size"}
              {selectedSize && <span style={{ fontWeight:500, color:"#7A7570" }}> — {selectedSize}</span>}
            </p>
            <button style={{ fontSize:"8px", color:"#B8966E", background:"none", border:"none", cursor:"pointer", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"inherit", fontWeight:600 }}>Size Guide</button>
          </div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {product.sizes.map(s => (
              <button key={s} onClick={() => { setSize(s); setSizeError(false); }}
                style={{ minWidth:"40px", padding:"8px 10px", border: selectedSize===s?"2px solid #1A1816":"1px solid #DDD8D2", backgroundColor: selectedSize===s?"#1A1816":"#fff", color: selectedSize===s?"#FAF9F7":"#1A1816", fontSize:"10px", fontWeight:600, cursor:"pointer", borderRadius:"2px", transition:"all 0.15s", fontFamily:"inherit" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material / care */}
      {(product.material||product.care) && (
        <div style={{ padding:"12px 14px", backgroundColor:"#F5F2ED", borderRadius:"3px", marginBottom: mobile?"18px":"22px", border:"1px solid #EDE9E3" }}>
          {product.material && <p style={{ fontSize:"10px", color:"#6B5230", marginBottom: product.care?"4px":0, lineHeight:1.6 }}><span style={{ fontWeight:600 }}>Material:</span> {product.material}</p>}
          {product.care     && <p style={{ fontSize:"10px", color:"#6B5230", lineHeight:1.6 }}><span style={{ fontWeight:600 }}>Care:</span> {product.care}</p>}
        </div>
      )}

      {product.details && <p style={{ fontSize:"12px", color:"#5A5550", lineHeight:1.75, marginBottom: mobile?"22px":"28px", fontWeight:300 }}>{product.details}</p>}

      {/* CTAs */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <button onClick={handleAdd}
          style={{ padding:"16px", border:"none", cursor:"pointer", borderRadius:"3px", backgroundColor: added?"#2C5F3F":"#1A1816", color:"#FAF9F7", fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"inherit", transition:"all 0.25s", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
          {added ? <><Check size={13} strokeWidth={2.5}/> Added to Bag</> : <><ShoppingBag size={13} strokeWidth={1.8}/> Add to Bag</>}
        </button>
        <button onClick={handleBuyNow}
          style={{ padding:"15px", border:"1px solid #DDD8D2", cursor:"pointer", borderRadius:"3px", backgroundColor:"transparent", color:"#1A1816", fontSize:"9px", fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"inherit", transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.backgroundColor="#F5F2ED"; e.currentTarget.style.borderColor="#1A1816"; }}
          onMouseLeave={e=>{ e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.borderColor="#DDD8D2"; }}>
          Buy Now
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={smoothClose} style={{ position:"fixed", inset:0, backgroundColor:"rgba(26,24,22,.55)", zIndex:400, backdropFilter:"blur(5px)", animation: closing?"fadeOut .26s ease forwards":"fadeIn .2s ease" }} />

      {/* Desktop */}
      <div className="pp-desk" style={{ position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:401, backgroundColor:"#FAF9F7", width:"min(900px,92vw)", maxHeight:"90vh", borderRadius:"4px", overflow:"hidden", display:"flex", animation: closing?"modalOut .26s ease forwards":"modalIn .3s cubic-bezier(.22,1,.36,1)", boxShadow:"0 24px 80px rgba(26,24,22,.3)" }}>
        <div style={{ flex:"0 0 50%", position:"relative", backgroundColor:"#EDEAE4", overflow:"hidden" }}>
          {imgs.length > 0 && (
            <div ref={zoomDivRef} onMouseMove={onDeskMove} onMouseDown={onDeskDown} onMouseUp={onDeskUp} onMouseLeave={onDeskLeave}
              style={{ width:"100%", height:"100%", cursor: zoomActive?"zoom-out":"zoom-in", overflow:"hidden" }}>
              <img ref={zoomImgRef} src={imgs[imgIdx]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .2s ease", userSelect:"none" }} />
            </div>
          )}
          {total > 1 && <>
            <button onClick={prev} style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(250,249,247,.9)", border:"none", borderRadius:"50%", width:"32px", height:"32px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronLeft size={14} strokeWidth={2}/></button>
            <button onClick={next} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(250,249,247,.9)", border:"none", borderRadius:"50%", width:"32px", height:"32px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={14} strokeWidth={2}/></button>
            <div style={{ position:"absolute", bottom:"14px", left:0, right:0, display:"flex", justifyContent:"center", gap:"6px" }}>
              {imgs.map((_,i) => <button key={i} onClick={()=>setImgIdx(i)} style={{ width:i===imgIdx?"18px":"6px", height:"6px", borderRadius:"3px", backgroundColor:i===imgIdx?"#FAF9F7":"rgba(250,249,247,.5)", border:"none", cursor:"pointer", transition:"all .25s", padding:0 }} />)}
            </div>
          </>}
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"34px 34px 34px 30px", position:"relative" }}>
          <button onClick={smoothClose} style={{ position:"absolute", top:"18px", right:"18px", background:"none", border:"none", cursor:"pointer", color:"#7A7570", display:"flex" }}
            onMouseEnter={e=>e.currentTarget.style.color="#1A1816"} onMouseLeave={e=>e.currentTarget.style.color="#7A7570"}>
            <X size={16} strokeWidth={1.8}/>
          </button>
          <InfoPanel/>
        </div>
      </div>

      {/* Mobile sheet */}
      <div className="pp-mob" style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:401, backgroundColor:"#FAF9F7", borderRadius:"16px 16px 0 0", maxHeight:"92vh", transform:`translateY(${sheetY}px)`, transition: sheetY>0?"none":"transform .25s ease", animation: closing?"none":"mobSheetIn .35s cubic-bezier(.22,1,.36,1)", display:"flex", flexDirection:"column", boxShadow:"0 -12px 48px rgba(26,24,22,.2)" }}>
        <div onTouchStart={onHandleStart} onTouchMove={onHandleMove} onTouchEnd={onHandleEnd}
          style={{ padding:"12px", display:"flex", justifyContent:"center", cursor:"grab", flexShrink:0 }}>
          <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"#DDD8D2" }} />
        </div>
        <div style={{ overflowY:"auto", padding:"0 20px 32px" }}>
          {imgs.length > 0 && (
            <div style={{ position:"relative", aspectRatio:"4/3", backgroundColor:"#EDEAE4", borderRadius:"6px", overflow:"hidden", marginBottom:"20px" }}>
              <img ref={mobImgRef} src={imgs[imgIdx]} alt={product.name}
                onTouchStart={onMobStart} onTouchMove={onMobMove} onTouchEnd={onMobEnd}
                style={{ width:"100%", height:"100%", objectFit:"cover", transformOrigin:`${mobZoomPos.x}% ${mobZoomPos.y}%`, transform: mobZoom?"scale(2)":"scale(1)", transition: mobZoom?"none":"transform .3s ease", userSelect:"none" }} />
              {total > 1 && <div style={{ position:"absolute", bottom:"10px", left:0, right:0, display:"flex", justifyContent:"center", gap:"5px" }}>
                {imgs.map((_,i) => <button key={i} onClick={()=>setImgIdx(i)} style={{ width:i===imgIdx?"16px":"5px", height:"5px", borderRadius:"2.5px", backgroundColor:i===imgIdx?"#1A1816":"rgba(26,24,22,.3)", border:"none", cursor:"pointer", transition:"all .2s", padding:0 }} />)}
              </div>}
            </div>
          )}
          <InfoPanel mobile/>
        </div>
      </div>
    </>
  );
}