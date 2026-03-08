import { useState, useEffect, useRef, memo } from "react";
import { ShoppingBag, Menu, X, ArrowRight, Instagram, ChevronDown, Search } from "lucide-react";

import { fetchProducts, firstImg } from "./data/products";
import ProductCard      from "./components/ProductCard";
import ProductPage      from "./pages/ProductPage";
import CartDrawer       from "./components/CartDrawer";
import CheckoutPage     from "./pages/CheckoutPage";
import OrderConfirmPage from "./pages/OrderConfirmPage";

import "./styles/global.css";

const FadeIn = memo(({ children, style }) =>
  <div style={{ animation: "fadeUp 0.8s ease 0.1s both", ...style }}>{children}</div>
);

// ── Shared Navbar ─────────────────────────────────────
// Used on both home and product page so it's always consistent
function Navbar({ totalQty, onCartOpen, onSearchOpen, onBack, isProductPage, searchRef, searchOpen, searchQuery, setSearchQuery, closeSearch, filteredProducts, setSelectedProduct, setPage }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        backgroundColor: "rgba(250,249,247,0.97)",
        borderBottom: "1px solid #EDE9E3",
        padding: "0 clamp(14px,4vw,52px)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "58px" }}>

          {/* Left: logo or back button */}
          {isProductPage ? (
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#9A9590", fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "inherit", padding: 0, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
              onMouseLeave={e => e.currentTarget.style.color = "#9A9590"}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Collection
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo.jpg" alt="Sola" style={{ height: "34px", width: "34px", objectFit: "contain" }} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", lineHeight: 1.1 }}>SOLA</div>
                <div style={{ fontSize: "6px", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#9A9590", lineHeight: 1 }}>Brand & Boutique</div>
              </div>
            </div>
          )}

          {/* Centre: desktop nav links */}
          {!isProductPage && (
            <div className="d-nav" style={{ gap: "44px", fontSize: "8px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              {["Collection", "About", "Atelier", "Contact"].map(l => (
                <a key={l} href="#" style={{ color: "#7A7570", transition: "color 0.2s,border-color 0.2s", paddingBottom: "3px", borderBottom: "1px solid transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#1A1816"; e.currentTarget.style.borderBottomColor = "#1A1816"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#7A7570"; e.currentTarget.style.borderBottomColor = "transparent"; }}>{l}</a>
              ))}
            </div>
          )}

          {/* Right: search + cart (always visible on all screen sizes) */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button onClick={onSearchOpen} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", color: "#7A7570", transition: "color 0.2s", borderRadius: "2px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1816"} onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
              <Search size={16} strokeWidth={1.6} />
            </button>
            <button onClick={onCartOpen} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "40px", height: "40px", color: "#7A7570", transition: "color 0.2s", borderRadius: "2px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1816"} onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
              <ShoppingBag size={17} strokeWidth={1.6} />
              {totalQty > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "#B8966E", color: "#fff", fontSize: "7px", fontWeight: 700, width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>{totalQty}</span>
              )}
            </button>
            {/* Burger — mobile only, hidden on desktop via CSS */}
            {!isProductPage && (
              <button className="m-burger" onClick={() => setMobileNav(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", color: "#1A1816" }}>
                {mobileNav ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNav && !isProductPage && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "18px 0 22px", borderTop: "1px solid #EDE9E3" }}>
            {["Collection", "About", "Atelier", "Contact"].map(l => (
              <a key={l} href="#" onClick={() => setMobileNav(false)} style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#7A7570" }}>{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <>
          <div onClick={closeSearch} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,24,22,0.5)", zIndex: 1100, backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1101, backgroundColor: "#FAF9F7", padding: "20px clamp(14px,4vw,52px)", boxShadow: "0 4px 30px rgba(26,24,22,0.1)", animation: "searchDown 0.28s ease" }}>
            <div style={{ maxWidth: "740px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px" }}>
              <Search size={15} strokeWidth={1.6} style={{ color: "#9A9590", flexShrink: 0 }} />
              <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search the collection…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", fontFamily: "inherit", color: "#1A1816", backgroundColor: "transparent" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9A9590", display: "flex" }}><X size={13} /></button>}
              <button onClick={closeSearch} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7570", fontFamily: "inherit", fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", padding: "7px 14px", borderLeft: "1px solid #EDE9E3", flexShrink: 0 }}>Close</button>
            </div>
            {searchQuery.trim() && (
              <div style={{ maxWidth: "740px", margin: "14px auto 0", paddingTop: "14px", borderTop: "1px solid #EDE9E3" }}>
                <p style={{ fontSize: "8px", color: "#9A9590", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "12px" }}>{filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "55vh", overflowY: "auto" }}>
                  {filteredProducts.length === 0
                    ? <p style={{ fontSize: "13px", color: "#9A9590", padding: "12px 0", fontWeight: 300 }}>No pieces found.</p>
                    : filteredProducts.map(p => (
                        <button key={p._id || p.id} onClick={() => { closeSearch(); setSelectedProduct(p); setPage("product"); }}
                          style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "3px", border: "none", background: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s", fontFamily: "inherit" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#EDEAE4"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}>
                          <div style={{ width: "40px", height: "50px", backgroundColor: "#EDEAE4", borderRadius: "2px", flexShrink: 0, overflow: "hidden" }}>
                            {firstImg(p) && <img src={firstImg(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="serif" style={{ fontSize: "16px", fontWeight: 400, color: "#1A1816", marginBottom: "2px" }}>{p.name}</p>
                            <p style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590" }}>{p.description}</p>
                          </div>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#1A1816", flexShrink: 0 }}>{p.price?.toLocaleString()} EGP</p>
                        </button>
                      ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ── APP ───────────────────────────────────────────────
export default function App() {
  const [page, setPage]                       = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen]               = useState(false);
  const [subscribed, setSub]                  = useState(false);
  const [email, setEmail]                     = useState("");
  const [searchOpen, setSearchOpen]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [toast, setToast]                     = useState(null);
  const [orderNum, setOrderNum]               = useState("");
  const [products, setProducts]               = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const searchRef = useRef();

  useEffect(() => {
    fetchProducts()
      .then(data => { setProducts(data); setProductsLoading(false); })
      .catch(() => setProductsLoading(false));
  }, []);

  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem("sola_cart"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("sola_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  const openSearch  = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80); };
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(""); };

  const addToCart = (product) => {
    const key = `${product._id || product.id}`;
    setCart(prev => {
      if (prev.find(i => `${i._id || i.id}` === key)) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added`);
    setCartOpen(true);
  };

  const buyNow = (product) => {
    const key = `${product._id || product.id}`;
    setCart(prev => {
      if (prev.find(i => `${i._id || i.id}` === key)) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
    setPage("checkout");
  };

  const removeItem = (key) => setCart(prev => prev.filter(i => `${i._id || i.id}` !== key));
  const totalQty   = cart.reduce((s, i) => s + (i.qty || 1), 0);

  // Shared navbar props
  const navProps = {
    totalQty, onCartOpen: () => setCartOpen(true), onSearchOpen: openSearch,
    searchRef, searchOpen, searchQuery, setSearchQuery, closeSearch,
    filteredProducts, setSelectedProduct, setPage,
  };

  // ── Pages ──────────────────────────────────────────
  if (page === "checkout") return (
    <CheckoutPage cart={cart}
      onBack={() => setPage(selectedProduct ? "product" : "home")}
      onPlaceOrder={(num) => { setCart([]); setOrderNum(num); setPage("orderConfirm"); }}
      onRemoveItem={removeItem} />
  );
  if (page === "orderConfirm") return (
    <OrderConfirmPage orderNumber={orderNum} onContinue={() => { setPage("home"); setSelectedProduct(null); }} />
  );

  if (page === "product" && selectedProduct) return (
    <div style={{ backgroundColor: "#FAFAF9", minHeight: "100vh" }}>
      <Navbar {...navProps} isProductPage onBack={() => { setPage("home"); setSelectedProduct(null); window.scrollTo({ top: 0 }); }} />
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onCheckout={() => setPage("checkout")} onRemoveItem={removeItem} />}
      <ProductPage product={selectedProduct} onAddToCart={addToCart} onBuyNow={buyNow} />
    </div>
  );

  // ── HOME ──────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "#FAF9F7", color: "#1A1816", minHeight: "100vh" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", zIndex: 2000, backgroundColor: "#1A1816", color: "#FAF9F7", padding: "12px 28px", borderRadius: "2px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 8px 36px rgba(26,24,22,0.28)", animation: "toastIn 0.3s cubic-bezier(0.22,1,0.36,1)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#B8966E" }}>✦</span> {toast}
        </div>
      )}

      {/* WhatsApp */}
      <a href="https://wa.me/201010886611" target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: "28px", right: "22px", zIndex: 1500, width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Cart drawer */}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onCheckout={() => setPage("checkout")} onRemoveItem={removeItem} />}

      {/* Navbar */}
      <Navbar {...navProps} isProductPage={false} />

      {/* ── Hero ── */}
      <section style={{ width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85" alt="Hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(250,249,247,0.94) 0%,rgba(250,249,247,0.62) 55%,rgba(26,24,22,0.12) 100%)" }} />
        <div style={{ position: "absolute", right: 0, bottom: "8px", fontSize: "clamp(80px,13vw,190px)", fontWeight: 800, letterSpacing: "-0.05em", color: "rgba(26,24,22,0.035)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>SS26</div>
        <div style={{ textAlign: "center", maxWidth: "700px", padding: "clamp(100px,14vh,150px) clamp(18px,5vw,52px) 80px", position: "relative", zIndex: 2, animation: "fadeUp 1s ease 0.1s both", width: "100%" }}>
          <div style={{ width: "1px", height: "52px", backgroundColor: "#B8966E", margin: "0 auto 30px" }} />
          <p style={{ fontSize: "7px", letterSpacing: "0.46em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, marginBottom: "22px" }}>Sola Brand & Boutique · Spring / Summer 2026</p>
          <h1 className="serif" style={{ fontSize: "clamp(52px,10vw,116px)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.02em", color: "#1A1816", marginBottom: "26px" }}>
            Worn Once.<br /><em style={{ fontStyle: "italic", fontWeight: 200, color: "#5A5550" }}>Never Forgotten.</em>
          </h1>
          <p style={{ fontSize: "13px", color: "#7A7570", letterSpacing: "0.04em", lineHeight: 1.95, marginBottom: "44px", fontWeight: 300 }}>
            Each garment is a singular creation.<br />One owner. No repetition. No compromise.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#collection" style={{ display: "inline-flex", alignItems: "center", gap: "9px", backgroundColor: "#1A1816", color: "#FAF9F7", padding: "16px 36px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", borderRadius: "2px", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.34em"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.3em"; }}>
              Enter the Collection <ArrowRight size={10} strokeWidth={2} />
            </a>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "16px 36px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", border: "1px solid rgba(26,24,22,0.22)", borderRadius: "2px", transition: "border-color 0.2s,color 0.2s", color: "#5A5550" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A1816"; e.currentTarget.style.color = "#1A1816"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,24,22,0.22)"; e.currentTarget.style.color = "#5A5550"; }}>
              Our Story
            </a>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "26px", left: "50%", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", opacity: 0.28, animation: "bounceY 2.4s ease-in-out infinite" }}>
          <span style={{ fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase" }}>Discover</span>
          <ChevronDown size={11} strokeWidth={1.4} />
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ backgroundColor: "#1A1816", color: "#FAF9F7", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", gap: "80px", animation: "marquee 32s linear infinite" }}>
          {Array(8).fill(["New Collection — SS26", "Sola Brand & Boutique", "One Piece · One Owner", "Free Delivery Over 1,000 EGP", "Original. Unrepeatable."]).flat().map((t, i) => (
            <span key={i} style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5 }}>{t}&nbsp;&nbsp;✦</span>
          ))}
        </div>
      </div>

      {/* ── Collection grid ── */}
      <section id="collection" style={{ padding: "clamp(64px,9vw,108px) clamp(14px,5vw,52px)", backgroundColor: "#FAF9F7" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "52px", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <p style={{ fontSize: "7px", letterSpacing: "0.36em", textTransform: "uppercase", color: "#9A9590", fontWeight: 600, marginBottom: "11px" }}>Spring / Summer 2026 — {products.length} singular pieces</p>
                <h2 className="serif" style={{ fontSize: "clamp(30px,5.5vw,52px)", fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.05 }}>The Collection</h2>
              </div>
              <a href="#" style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "7px", color: "#7A7570", borderBottom: "1px solid #C5BFB8", paddingBottom: "2px", whiteSpace: "nowrap", transition: "color 0.2s,border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#1A1816"; e.currentTarget.style.borderBottomColor = "#1A1816"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#7A7570"; e.currentTarget.style.borderBottomColor = "#C5BFB8"; }}>
                All Pieces <ArrowRight size={9} strokeWidth={2} />
              </a>
            </div>
          </FadeIn>
          <div className="pgrid" style={{ display: "grid", gap: "44px 28px" }}>
            {productsLoading
              ? <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#9A9590", letterSpacing: "0.2em", fontSize: "11px", textTransform: "uppercase" }}>Loading collection…</p>
              : products.length === 0
              ? <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#9A9590", letterSpacing: "0.2em", fontSize: "11px", textTransform: "uppercase" }}>No pieces available at this time.</p>
              : filteredProducts.map((p, i) => (
                  <ProductCard key={p._id || p.id} product={p} index={i}
                    onOpenPopup={(product) => { setSelectedProduct(product); setPage("product"); window.scrollTo({ top: 0 }); }} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section style={{ backgroundColor: "#1A1816", padding: "clamp(80px,11vw,120px) clamp(18px,5vw,52px)", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "580px", textAlign: "center" }}>
          <div style={{ width: "1px", height: "52px", backgroundColor: "#B8966E", margin: "0 auto 30px" }} />
          <blockquote className="serif" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.5, fontStyle: "italic", color: "#FAF9F7" }}>
            "We don't make collections. We make objects for people who understand that true luxury is the privilege of being the only one."
          </blockquote>
          <div style={{ width: "1px", height: "40px", backgroundColor: "rgba(184,150,110,0.4)", margin: "28px auto 0" }} />
          <p style={{ marginTop: "16px", fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(250,249,247,0.3)", fontWeight: 500 }}>— Sola Brand & Boutique</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#120F0D", color: "#FAF9F7", padding: "clamp(56px,8vw,88px) clamp(14px,5vw,52px) 36px" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
          <div className="fgrid" style={{ display: "grid", gap: "48px", marginBottom: "60px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <img src="/logo.jpg" alt="Sola" style={{ height: "30px", width: "30px", objectFit: "contain", borderRadius: "3px", filter: "invert(1) brightness(0.75)" }} />
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", lineHeight: 1.1 }}>SOLA</div>
                  <div style={{ fontSize: "6px", fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(250,249,247,0.28)", lineHeight: 1 }}>Brand & Boutique</div>
                </div>
              </div>
              <p style={{ fontSize: "11px", lineHeight: 1.9, color: "rgba(250,249,247,0.36)", maxWidth: "185px", fontWeight: 300 }}>Unrepeatable garments for those who value the singular. Based in Menofia, Egypt.</p>
              <div style={{ display: "flex", gap: "16px", marginTop: "22px", alignItems: "center" }}>
                <a href="https://www.instagram.com/sola.boutiquee" target="_blank" rel="noreferrer" style={{ color: "rgba(250,249,247,0.38)", transition: "color 0.2s", display: "flex" }} onMouseEnter={e => e.currentTarget.style.color = "#FAF9F7"} onMouseLeave={e => e.currentTarget.style.color = "rgba(250,249,247,0.38)"}><Instagram size={14} strokeWidth={1.4} /></a>
                <a href="https://www.facebook.com/share/14VnCCFNwL1/" target="_blank" rel="noreferrer" style={{ color: "rgba(250,249,247,0.38)", transition: "color 0.2s", display: "flex" }} onMouseEnter={e => e.currentTarget.style.color = "#FAF9F7"} onMouseLeave={e => e.currentTarget.style.color = "rgba(250,249,247,0.38)"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                <a href="https://www.tiktok.com/@sola.boutiquee" target="_blank" rel="noreferrer" style={{ color: "rgba(250,249,247,0.38)", transition: "color 0.2s", display: "flex" }} onMouseEnter={e => e.currentTarget.style.color = "#FAF9F7"} onMouseLeave={e => e.currentTarget.style.color = "rgba(250,249,247,0.38)"}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z" /></svg></a>
              </div>
            </div>
            {[
              { label: "Maison", links: [{ name: "About", href: "#" }, { name: "Atelier", href: "#" }, { name: "Press", href: "#" }, { name: "Journal", href: "#" }] },
              { label: "Client", links: [{ name: "Delivery", href: "#" }, { name: "Returns", href: "#" }, { name: "Authentication", href: "#" }, { name: "Contact", href: "mailto:hello@solaboutique.com" }] },
            ].map(col => (
              <div key={col.label}>
                <p style={{ fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(250,249,247,0.22)", fontWeight: 700, marginBottom: "18px" }}>{col.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map(link => (
                    <a key={link.name} href={link.href} target={link.href.startsWith("http") || link.href.startsWith("mailto") ? "_blank" : "_self"} rel="noreferrer"
                      style={{ fontSize: "11px", color: "rgba(250,249,247,0.42)", transition: "color 0.2s", fontWeight: 300 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#FAF9F7"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(250,249,247,0.42)"}>{link.name}</a>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p style={{ fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(250,249,247,0.22)", fontWeight: 700, marginBottom: "18px" }}>Private List</p>
              <p style={{ fontSize: "11px", color: "rgba(250,249,247,0.36)", marginBottom: "16px", lineHeight: 1.85, fontWeight: 300 }}>First access to new arrivals and private viewings.</p>
              {subscribed ? (
                <p style={{ fontSize: "10px", color: "#B8966E", letterSpacing: "0.14em" }}>✦ Welcome to the list.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && email.includes("@") && (setSub(true), setEmail(""))}
                    style={{ backgroundColor: "rgba(250,249,247,0.05)", border: "1px solid rgba(250,249,247,0.1)", padding: "11px 14px", color: "#FAF9F7", fontSize: "11px", outline: "none", width: "100%", fontFamily: "inherit", borderRadius: "2px" }} />
                  <button onClick={() => email.includes("@") && (setSub(true), setEmail(""))}
                    style={{ backgroundColor: "rgba(250,249,247,0.07)", color: "rgba(250,249,247,0.65)", border: "1px solid rgba(250,249,247,0.12)", padding: "11px", fontSize: "7px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "2px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(250,249,247,0.13)"; e.currentTarget.style.color = "#FAF9F7"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(250,249,247,0.07)"; e.currentTarget.style.color = "rgba(250,249,247,0.65)"; }}>
                    Request Access
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(250,249,247,0.06)", paddingTop: "22px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "8px", color: "rgba(250,249,247,0.18)", letterSpacing: "0.1em" }}>© 2026 Sola Brand & Boutique. All rights reserved.</p>
            <p style={{ fontSize: "8px", color: "rgba(250,249,247,0.18)", letterSpacing: "0.1em" }}>Privacy · Terms · Authentication Policy</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
