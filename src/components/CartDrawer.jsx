import { memo } from "react";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { firstImg, FREE_SHIPPING_THRESHOLD, getShipping } from "../data/products";

const CartDrawer = memo(function CartDrawer({ cart, onClose, onCheckout, onRemoveItem }) {
  const subtotal    = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping    = getShipping(subtotal);
  const total       = subtotal + shipping;
  const freeShip    = shipping === 0;
  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,24,22,0.45)", zIndex: 300, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }} />

      {/* Drawer */}
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 301, backgroundColor: "#FAF9F7", width: "min(400px,96vw)", display: "flex", flexDirection: "column", animation: "slideInRight 0.35s cubic-bezier(0.22,1,0.36,1)", boxShadow: "-8px 0 48px rgba(26,24,22,0.18)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #EDE9E3", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase" }}>Your Selection</h2>
            {cart.length > 0 && (
              <p style={{ fontSize: "9px", color: "#9A9590", letterSpacing: "0.1em", marginTop: "2px" }}>
                {cart.reduce((s, i) => s + (i.qty || 1), 0)} {cart.length === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#7A7570", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Shipping progress */}
        {cart.length > 0 && (
          <div style={{ padding: "12px 24px", borderBottom: "1px solid #EDE9E3", flexShrink: 0, backgroundColor: "#F5F2ED" }}>
            {freeShip ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#B8966E", fontSize: "10px" }}>✦</span>
                <p style={{ fontSize: "9px", fontWeight: 600, color: "#2C5F3F", letterSpacing: "0.1em", textTransform: "uppercase" }}>Complimentary delivery unlocked</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", color: "#7A7570", marginBottom: "8px" }}>
                  <strong style={{ color: "#1A1816" }}>{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} EGP</strong> away from complimentary delivery
                </p>
                <div style={{ height: "1px", backgroundColor: "#E0D8CE", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#B8966E", transition: "width 0.4s ease" }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", opacity: 0.35 }}>
              <ShoppingBag size={30} strokeWidth={1.2} />
              <p style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Your selection is empty</p>
            </div>
          ) : cart.map(item => {
            const key = `${item._id || item.id}`;
            return (
              <div key={key} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "18px 0", borderBottom: "1px solid #EDE9E3" }}>
                <div style={{ width: "56px", height: "70px", backgroundColor: "#EDEAE4", borderRadius: "2px", flexShrink: 0, overflow: "hidden" }}>
                  {firstImg(item) && <img src={firstImg(item)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="serif" style={{ fontSize: "16px", fontWeight: 400, marginBottom: "2px", lineHeight: 1.2 }}>{item.name}</p>
                  <p style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", marginBottom: "8px" }}>{item.description}</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#1A1816" }}>{item.price.toLocaleString()} EGP</p>
                </div>
                <button onClick={() => onRemoveItem(key)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C5BFB8", padding: "2px", display: "flex", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.color = "#C5BFB8"}>
                  <Trash2 size={13} strokeWidth={1.6} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #EDE9E3", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px", fontSize: "10px", color: "#9A9590" }}>
              <span>Subtotal</span><span>{subtotal.toLocaleString()} EGP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px", fontSize: "10px", color: "#9A9590" }}>
              <span>Delivery</span>
              {freeShip
                ? <span style={{ color: "#2C5F3F", fontWeight: 600 }}>Complimentary</span>
                : <span>{shipping} EGP</span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #EDE9E3", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em" }}>Total</span>
              <span className="serif" style={{ fontSize: "20px", fontWeight: 400 }}>{total.toLocaleString()} EGP</span>
            </div>
            <button
              onClick={() => { onClose(); onCheckout(); }}
              style={{ width: "100%", padding: "16px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "8px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.32em"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.28em"; }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export default CartDrawer;