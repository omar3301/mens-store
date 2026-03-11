import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ShoppingBag, Menu, X, ArrowRight, Instagram,
  ChevronDown, Search, Check, ChevronLeft, ChevronRight,
} from "lucide-react";

import {
  CATEGORIES, PRODUCTS, firstImg,
  FREE_SHIPPING_THRESHOLD, getShipping, EGYPT_GOVS,
  fetchProducts,
} from "./data/products";
import ProductCard    from "./components/ProductCard";
import ProductPopup   from "./components/ProductPopup";
import CartDrawer     from "./components/CartDrawer";
import CheckoutPage   from "./pages/CheckoutPage";
import OrderConfirmPage from "./pages/OrderConfirmPage";

// ─── TINY FADE-IN ────────────────────────────────────
const FadeIn = memo(({ children, style, delay = 0 }) => (
  <div style={{ animation: `fadeUp 0.7s ease ${delay}s both`, ...style }}>
    {children}
  </div>
));

// ─── APP ─────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("home");
  const [popup, setPopup]             = useState(null);
  const [cartOpen, setCartOpen]       = useState(false);
  const [mobileNav, setMobileNav]     = useState(false);
  const [subscribed, setSub]          = useState(false);
  const [email, setEmail]             = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast]             = useState(null);
  const [orderNum, setOrderNum]       = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const searchRef = useRef();

  // ── Products (backend with static fallback) ──────────
  const [products, setProducts]       = useState(PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    fetchProducts()
      .then(data => { if (data?.length) setProducts(data); })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  // ── Cart — persisted to localStorage ─────────────────
  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem("store_cart"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("store_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  // ── Toast ─────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  // ── Filter products ───────────────────────────────────
  const filteredProducts = (() => {
    let list = activeCategory === "all"
      ? products
      : products.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q)
      );
    }
    return list;
  })();

  const openSearch  = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80); };
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(""); };

  // ── Cart actions ──────────────────────────────────────
  const addToCart = useCallback((product, size, color) => {
    const sizeKey  = size  || "One Size";
    const colorKey = (color && typeof color === "object") ? color.name : (color || "");
    const key = `${product._id || product.id}-${sizeKey}-${colorKey}`;
    setCart(prev => {
      if (prev.find(i => `${i._id || i.id}-${i.size}-${i.colorName}` === key)) {
        showToast("Already in your bag");
        return prev;
      }
      showToast(`${product.name} added`);
      return [...prev, { ...product, size: sizeKey, colorName: colorKey, qty: 1 }];
    });
  }, [showToast]);

  const removeItem = useCallback((key) =>
    setCart(prev => prev.filter(i => `${i._id || i.id}-${i.size}-${i.colorName}` !== key))
  , []);

  const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);

  // ── Category counts ───────────────────────────────────
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === "all"
      ? products.length
      : products.filter(p => p.category === cat.id).length;
    return acc;
  }, {});

  // ── Page routing ──────────────────────────────────────
  if (page === "checkout") return (
    <CheckoutPage
      cart={cart}
      onBack={() => setPage("home")}
      onPlaceOrder={(num) => { setCart([]); setOrderNum(num); setPage("orderConfirm"); }}
      onRemoveItem={removeItem}
    />
  );
  if (page === "orderConfirm") return (
    <OrderConfirmPage orderNumber={orderNum} onContinue={() => setPage("home")} />
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", color: "#1A1816", minHeight: "100vh" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%",
          transform: "translateX(-50%)", zIndex: 2000,
          backgroundColor: "#1A1816", color: "#FAF9F7",
          padding: "12px 28px", borderRadius: "2px",
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", whiteSpace: "nowrap",
          boxShadow: "0 8px 36px rgba(26,24,22,0.28)",
          animation: "toastIn 0.3s cubic-bezier(0.22,1,0.36,1)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ color: "#B8966E" }}>✦</span> {toast}
        </div>
      )}

      {/* ── WhatsApp floating button ── */}
      <a href="https://wa.me/201XXXXXXXXX" target="_blank" rel="noreferrer"
        style={{
          position: "fixed", bottom: "28px", right: "22px", zIndex: 1500,
          width: "50px", height: "50px", borderRadius: "50%",
          backgroundColor: "#25D366", display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)", transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ── Mobile Nav overlay ── */}
      {mobileNav && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          backgroundColor: "#FAF9F7",
          animation: "fadeIn 0.2s ease",
          display: "flex", flexDirection: "column",
          padding: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <span className="serif" style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.08em" }}>Menu</span>
            <button onClick={() => setMobileNav(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setMobileNav(false); window.scrollTo({ top: 350, behavior: "smooth" }); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 0", background: "none", border: "none",
                  borderBottom: "1px solid #EDE9E3", cursor: "pointer",
                  fontSize: "13px", fontWeight: activeCategory === cat.id ? 600 : 400,
                  letterSpacing: "0.08em", color: activeCategory === cat.id ? "#1A1816" : "#7A7570",
                  fontFamily: "inherit",
                }}>
                <span style={{ textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "10px" }}>{cat.label}</span>
                <span style={{ fontSize: "10px", color: "#B8966E" }}>{categoryCounts[cat.id] || 0}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        backgroundColor: "rgba(250,249,247,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #EDE9E3",
      }}>
        {/* Top bar */}
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "0 clamp(16px,4vw,52px)",
          height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Mobile burger */}
          <button className="m-burger" onClick={() => setMobileNav(true)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "none", color: "#1A1816" }}>
            <Menu size={20} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button onClick={() => { setPage("home"); setActiveCategory("all"); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <span className="serif" style={{
                fontSize: "clamp(20px,3vw,26px)", fontWeight: 300,
                letterSpacing: "0.18em", color: "#1A1816", textTransform: "uppercase",
              }}>
                Sola
              </span>
            </button>
          </div>

          {/* Right actions */}
          <div className="d-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button onClick={openSearch}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7570", transition: "color 0.15s", display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
              onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
              <Search size={16} strokeWidth={1.8} />
            </button>
            <button onClick={() => setCartOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7570", transition: "color 0.15s", display: "flex", position: "relative" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
              onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
              <ShoppingBag size={16} strokeWidth={1.8} />
              {totalQty > 0 && (
                <span style={{
                  position: "absolute", top: "-6px", right: "-7px",
                  width: "15px", height: "15px", borderRadius: "50%",
                  backgroundColor: "#1A1816", color: "#FAF9F7",
                  fontSize: "8px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{totalQty}</span>
              )}
            </button>
          </div>

          {/* Mobile cart */}
          <button className="m-burger" onClick={() => setCartOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1A1816", display: "none", position: "relative" }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalQty > 0 && (
              <span style={{
                position: "absolute", top: "-5px", right: "-6px",
                width: "14px", height: "14px", borderRadius: "50%",
                backgroundColor: "#1A1816", color: "#FAF9F7",
                fontSize: "8px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{totalQty}</span>
            )}
          </button>
        </div>

        {/* ── Category Nav ── */}
        <div style={{
          borderTop: "1px solid #EDE9E3",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            padding: "0 clamp(16px,4vw,52px)",
            display: "flex", alignItems: "center", gap: "0",
            minWidth: "max-content",
          }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.id;
              const count  = categoryCounts[cat.id] || 0;
              return (
                <button key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{
                    position: "relative",
                    padding: "14px 20px",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "9px", fontWeight: active ? 700 : 500,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: active ? "#1A1816" : "#9A9590",
                    transition: "color 0.2s",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#1A1816"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#9A9590"; }}>
                  {cat.label}
                  {count > 0 && !active && (
                    <span style={{ marginLeft: "4px", fontSize: "8px", color: "#C5BFB8" }}>
                      {count}
                    </span>
                  )}
                  {/* Active underline */}
                  {active && (
                    <span style={{
                      position: "absolute", bottom: 0, left: "20px", right: "20px",
                      height: "2px", backgroundColor: "#1A1816",
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Search bar ── */}
        {searchOpen && (
          <div style={{
            borderTop: "1px solid #EDE9E3",
            padding: "12px clamp(16px,4vw,52px)",
            animation: "searchDown 0.2s ease",
            backgroundColor: "rgba(250,249,247,0.99)",
          }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
              <Search size={14} strokeWidth={1.8} style={{
                position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                color: "#9A9590",
              }} />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Escape" && closeSearch()}
                placeholder="Search products..."
                style={{
                  width: "100%", background: "none", border: "none", outline: "none",
                  paddingLeft: "26px", paddingRight: "32px",
                  fontSize: "13px", color: "#1A1816",
                  fontFamily: "inherit",
                }}
              />
              <button onClick={closeSearch}
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9A9590" }}>
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO — compact, with category shown ── */}
      {activeCategory === "all" && !searchQuery && (
        <section style={{
          padding: "clamp(48px,8vw,96px) clamp(16px,4vw,52px) clamp(32px,5vw,64px)",
          textAlign: "center",
          borderBottom: "1px solid #EDE9E3",
        }}>
          <FadeIn>
            <p style={{ fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#B8966E", marginBottom: "20px", fontWeight: 600 }}>
              New Collection
            </p>
            <h1 className="serif" style={{
              fontSize: "clamp(40px,8vw,80px)", fontWeight: 300,
              lineHeight: 1.0, marginBottom: "20px",
              letterSpacing: "-0.01em", color: "#1A1816",
            }}>
              Refined Essentials
            </h1>
            <p style={{ fontSize: "12px", color: "#9A9590", maxWidth: "420px", margin: "0 auto 32px", lineHeight: 1.8, fontWeight: 300 }}>
              Premium shirts, coats, and essentials — carefully selected pieces for the modern wardrobe.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
              {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: "none", border: "1px solid #DDD8D2",
                    padding: "10px 24px", cursor: "pointer",
                    fontSize: "8px", fontWeight: 600, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "#7A7570",
                    borderRadius: "2px", transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A1816"; e.currentTarget.style.color = "#1A1816"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#DDD8D2"; e.currentTarget.style.color = "#7A7570"; }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── PRODUCTS SECTION ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,52px)" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "clamp(24px,4vw,40px)" }}>
          <div>
            <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 300, letterSpacing: "0.02em" }}>
              {CATEGORIES.find(c => c.id === activeCategory)?.label || "All"}
            </h2>
            {searchQuery && (
              <p style={{ fontSize: "10px", color: "#9A9590", marginTop: "4px", letterSpacing: "0.08em" }}>
                {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}
          </div>
          <p style={{ fontSize: "9px", color: "#B8A898", letterSpacing: "0.12em" }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Loading skeleton */}
        {productsLoading ? (
          <div className="pgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,3vw,32px)" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ animation: "pulse 1.5s ease infinite" }}>
                <div style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4", borderRadius: "2px", marginBottom: "16px" }} />
                <div style={{ height: "12px", backgroundColor: "#EDEAE4", borderRadius: "2px", marginBottom: "8px", width: "60%" }} />
                <div style={{ height: "18px", backgroundColor: "#EDEAE4", borderRadius: "2px", width: "80%" }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9A9590" }}>
            <ShoppingBag size={32} strokeWidth={1.2} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
            <p style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" }}>No products found</p>
          </div>
        ) : (
          <div className="pgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,3vw,40px) clamp(12px,2vw,28px)" }}>
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                index={i}
                onOpenPopup={setPopup}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── MARQUEE STRIP ── */}
      <div style={{ borderTop: "1px solid #EDE9E3", borderBottom: "1px solid #EDE9E3", padding: "14px 0", overflow: "hidden", backgroundColor: "#F5F2ED" }}>
        <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ fontSize: "8px", letterSpacing: "0.32em", textTransform: "uppercase", color: "#9A9590", paddingRight: "60px", whiteSpace: "nowrap", fontWeight: 500 }}>
              Free delivery over {FREE_SHIPPING_THRESHOLD.toLocaleString()} EGP &nbsp;·&nbsp; Cash on Delivery &nbsp;·&nbsp; All governorates &nbsp;·&nbsp; New arrivals weekly
            </span>
          ))}
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: "clamp(48px,7vw,96px) clamp(16px,4vw,52px)", textAlign: "center", borderBottom: "1px solid #EDE9E3" }}>
        <FadeIn>
          <p style={{ fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#B8966E", marginBottom: "16px", fontWeight: 600 }}>Stay in the Loop</p>
          <h2 className="serif" style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 300, marginBottom: "10px" }}>New arrivals, first.</h2>
          <p style={{ fontSize: "11px", color: "#9A9590", marginBottom: "32px", fontWeight: 300 }}>Be the first to know when new pieces drop.</p>
          {subscribed ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#2C5F3F" }}>
              <Check size={14} strokeWidth={2} />
              <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>You're subscribed</span>
            </div>
          ) : (
            <div style={{ display: "flex", maxWidth: "380px", margin: "0 auto", border: "1px solid #DDD8D2", borderRadius: "2px", overflow: "hidden", backgroundColor: "#fff" }}>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email.includes("@") && setSub(true)}
                placeholder="your@email.com"
                style={{ flex: 1, border: "none", outline: "none", padding: "14px 18px", fontSize: "12px", fontFamily: "inherit", color: "#1A1816" }}
              />
              <button
                onClick={() => email.includes("@") && setSub(true)}
                style={{
                  padding: "14px 24px", backgroundColor: "#1A1816", color: "#FAF9F7",
                  border: "none", cursor: "pointer", fontSize: "8px",
                  fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                  fontFamily: "inherit", transition: "background 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2D2A26"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1A1816"}>
                Subscribe
              </button>
            </div>
          )}
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "clamp(32px,5vw,60px) clamp(16px,4vw,52px)" }}>
        <div className="fgrid" style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr", gap: "40px", marginBottom: "48px" }}>
          <div>
            <p className="serif" style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.14em", marginBottom: "14px" }}>Sola</p>
            <p style={{ fontSize: "11px", color: "#9A9590", lineHeight: 1.8, fontWeight: 300 }}>
              Premium clothing for the modern man. Carefully curated pieces from trusted brands, delivered across Egypt.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "16px" }}>Shop</p>
            {CATEGORIES.filter(c => c.id !== "all").map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); window.scrollTo({ top: 0 }); }}
                style={{ display: "block", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#7A7570", fontFamily: "inherit", marginBottom: "8px", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
                onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
                {cat.label}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "16px" }}>Info</p>
            {["Size Guide", "Delivery & Returns", "About Us", "Contact"].map(l => (
              <p key={l} style={{ fontSize: "11px", color: "#7A7570", marginBottom: "8px" }}>{l}</p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "16px" }}>Contact</p>
            <p style={{ fontSize: "11px", color: "#9A9590", lineHeight: 1.8, marginBottom: "16px", fontWeight: 300 }}>
              Cash on Delivery across all Egyptian governorates.
            </p>
            <a href="https://wa.me/201XXXXXXXXX" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "#25D366" }}>
              <span>💬</span> WhatsApp Us
            </a>
            <div style={{ marginTop: "20px", display: "flex", gap: "14px" }}>
              <Instagram size={15} strokeWidth={1.5} style={{ color: "#9A9590", cursor: "pointer" }} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #EDE9E3", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "9px", color: "#B8A898", letterSpacing: "0.1em" }}>© 2025 Sola Brand & Boutique. All rights reserved.</p>
          <p style={{ fontSize: "9px", color: "#B8A898", letterSpacing: "0.1em" }}>Cash on Delivery · Egypt</p>
        </div>
      </footer>

      {/* ── Drawers & Popups ── */}
      {popup && (
        <ProductPopup
          product={popup}
          onClose={() => setPopup(null)}
          onAddToCart={addToCart}
          onBuyNow={(product, size, color) => {
            addToCart(product, size, color);
            setPopup(null);
            setPage("checkout");
          }}
        />
      )}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onCheckout={() => { setCartOpen(false); setPage("checkout"); }}
          onRemoveItem={removeItem}
        />
      )}
    </div>
  );
}