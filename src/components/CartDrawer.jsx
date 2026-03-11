import { memo } from "react";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
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
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(26,24,22,0.45)",
        zIndex: 300, backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 301,
        backgroundColor: "#FAF9F7", width: "min(400px,96vw)",
        display: "flex", flexDirection: "column",
        animation: "slideInRight 0.32s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "-8px 0 48px rgba(26,24,22,0.18)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #EDE9E3",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase" }}>Your Bag</h2>
            {cart.length > 0 && (
              <p style={{ fontSize: "9px", color: "#9A9590", letterSpacing: "0.1em", marginTop: "2px" }}>
                {cart.reduce((s, i) => s + (i.qty || 1), 0)} {cart.length === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#7A7570", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#1A1816"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A7570"}>
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Free shipping progress */}
        {cart.length > 0 && (
          <div style={{ padding: "12px 24px", borderBottom: "1px solid #EDE9E3", flexShrink: 0, backgroundColor: "#F5F2ED" }}>
            {freeShip ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#B8966E", fontSize: "10px" }}>✦</span>
                <p style={{ fontSize: "9px", fontWeight: 600, color: "#2C5F3F", letterSpacing: "0.1em", textTransform: "uppercase" }}>Free delivery unlocked!</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", color: "#7A7570", marginBottom: "8px" }}>
                  <strong style={{ color: "#1A1816" }}>{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} EGP</strong> away from free delivery
                </p>
                <div style={{ height: "2px", backgroundColor: "#E0D8CE", borderRadius: "1px", overflow: "hidden" }}>
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
              <p style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Your bag is empty</p>
            </div>
          ) : (
            cart.map(item => {
              const key = `${item._id || item.id}-${item.size}-${item.colorName}`;
              return (
                <div key={key} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "18px 0", borderBottom: "1px solid #EDE9E3" }}>
                  {/* Image */}
                  <div style={{ width: "60px", height: "76px", backgroundColor: "#EDEAE4", borderRadius: "2px", flexShrink: 0, overflow: "hidden" }}>
                    {firstImg(item) && <img src={firstImg(item)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="serif" style={{ fontSize: "16px", fontWeight: 400, marginBottom: "2px", lineHeight: 1.2 }}>{item.name}</p>
                    <p style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A9590", marginBottom: "4px" }}>
                      {item.description}
                    </p>
                    {/* Size & color */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                      {item.size && item.size !== "One Size" && (
                        <span style={{ fontSize: "8px", color: "#7A7570", backgroundColor: "#EDE9E3", padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.06em" }}>
                          {item.size}
                        </span>
                      )}
                      {item.colorName && (
                        <span style={{ fontSize: "8px", color: "#7A7570", letterSpacing: "0.06em" }}>{item.colorName}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#1A1816" }}>{item.price.toLocaleString()} EGP</p>
                  </div>
                  {/* Remove */}
                  <button onClick={() => onRemoveItem(key)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#C5BFB8", transition: "color 0.15s", flexShrink: 0, display: "flex", marginTop: "2px" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#9A9590"}
                    onMouseLeave={e => e.currentTarget.style.color = "#C5BFB8"}>
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #EDE9E3", flexShrink: 0 }}>
            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", color: "#9A9590", letterSpacing: "0.08em" }}>Subtotal</span>
              <span style={{ fontSize: "10px", color: "#1A1816", fontWeight: 500 }}>{subtotal.toLocaleString()} EGP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "10px", color: "#9A9590", letterSpacing: "0.08em" }}>Delivery</span>
              <span style={{ fontSize: "10px", color: freeShip ? "#2C5F3F" : "#1A1816", fontWeight: 500 }}>
                {freeShip ? "Free" : `${shipping} EGP`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px", paddingTop: "12px", borderTop: "1px solid #EDE9E3" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</span>
              <span className="serif" style={{ fontSize: "20px", fontWeight: 400 }}>{total.toLocaleString()} <span style={{ fontSize: "11px", color: "#9A9590" }}>EGP</span></span>
            </div>
            <p style={{ fontSize: "9px", color: "#9A9590", textAlign: "center", marginBottom: "14px", letterSpacing: "0.08em" }}>
              💵 Cash on Delivery — payment at your door
            </p>
            <button
              onClick={onCheckout}
              style={{
                width: "100%", padding: "16px",
                backgroundColor: "#1A1816", color: "#FAF9F7",
                border: "none", cursor: "pointer", borderRadius: "3px",
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", fontFamily: "inherit",
                transition: "background 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2D2A26"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1A1816"}>
              Proceed to Checkout <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export default CartDrawer;