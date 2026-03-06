import { useState, useRef, useEffect, memo } from "react";
import { ChevronLeft, ChevronDown, Trash2, Package, Loader } from "lucide-react";
import { EGYPT_GOVS, FREE_SHIPPING_THRESHOLD, getShipping, firstImg } from "../data/products";

// ─── API base URL ─────────────────────────────────────

// After deploy: set VITE_API_URL in your .env file
const API_URL = import.meta.env.VITE_API_URL || "https://back-end-production-afdf.up.railway.app";

// ─── Reusable Input ───────────────────────────────────
const UInput = memo(function UInput({ label, name, type = "text", error, inputRef, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: error ? "#c0392b" : "#888" }}>
        {label}{error ? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> — {error}</span> : ""}
      </label>
      <input
        type={type} name={name} ref={inputRef} placeholder={placeholder}
        style={{ padding: "13px 14px", border: error ? "1px solid #c0392b" : "1px solid #DDD8D2", borderRadius: "3px", fontSize: "13px", outline: "none", backgroundColor: "#fff", transition: "border-color 0.2s", width: "100%", fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = "#1A1816"}
        onBlur={e => e.target.style.borderColor = error ? "#c0392b" : "#DDD8D2"}
      />
    </div>
  );
});

// ─── CheckoutPage ─────────────────────────────────────
export default function CheckoutPage({ cart, onBack, onPlaceOrder, onRemoveItem }) {
  const [step, setStep]             = useState(1);
  const [errors, setErrors]         = useState({});
  const [govVal, setGovVal]         = useState("");
  const [saved, setSaved]           = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState("");

  const refs = {
    email: useRef(), firstName: useRef(), lastName: useRef(),
    address: useRef(), apartment: useRef(), city: useRef(), phone: useRef(),
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const subtotal    = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping    = getShipping(subtotal);
  const total       = subtotal + shipping;
  const freeShip    = shipping === 0;
  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const validate1 = () => {
    const e = {}, v = (k) => refs[k]?.current?.value?.trim() || "";
    if (!v("firstName"))                          e.firstName   = "Required";
    if (!v("lastName"))                           e.lastName    = "Required";
    if (!v("email") || !v("email").includes("@")) e.email       = "Valid email required";
    if (!v("phone"))                              e.phone       = "Required";
    if (!v("address"))                            e.address     = "Required";
    if (!v("city"))                               e.city        = "Required";
    if (!govVal)                                  e.governorate = "Required";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSaved({ firstName: v("firstName"), lastName: v("lastName"), email: v("email"),
        phone: v("phone"), address: v("address"), apartment: v("apartment"),
        city: v("city"), governorate: govVal });
      return true;
    }
    return false;
  };

  // ── Call backend API ─────────────────────────────────
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: saved,
          items: cart.map(item => ({
            productId: item.id, name: item.name,
            description: item.description, badge: item.badge,
            price: item.price, image: item.images?.[0] || "",
          })),
          subtotal, shipping, total,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || "Something went wrong."); setSubmitting(false); return; }
      onPlaceOrder(data.orderNumber); // pass real order number to confirm page
    } catch {
      setApiError("Cannot reach the server. Please check your connection.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF9F7", fontFamily: "'Montserrat',sans-serif", animation: "pageIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#FAF9F7", borderBottom: "1px solid #EDE9E3", padding: "16px clamp(14px,4vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontWeight: 600, color: "#9A9590", fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <ChevronLeft size={13} strokeWidth={1.8} /> Back
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase" }}>SOLA</div>
          <div style={{ fontSize: "6px", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590" }}>Brand & Boutique</div>
        </div>
        <div style={{ width: "70px" }} />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", justifyContent: "center", padding: "26px 16px 0" }}>
        {[{ n: 1, label: "Delivery" }, { n: 2, label: "Review" }, { n: 3, label: "Done" }].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: step >= s.n ? "#1A1816" : "#E5E0D8", color: step >= s.n ? "#FAF9F7" : "#AAA4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, transition: "background 0.4s" }}>{step > s.n ? "✓" : s.n}</div>
              <span style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: step >= s.n ? "#1A1816" : "#C5C0B8", transition: "color 0.4s" }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ width: "clamp(32px,8vw,70px)", height: "1px", backgroundColor: step > s.n ? "#1A1816" : "#E5E0D8", margin: "0 8px 20px", transition: "background 0.4s" }} />}
          </div>
        ))}
      </div>

      <div className="co-layout" style={{ maxWidth: "960px", margin: "0 auto", padding: "26px clamp(14px,4vw,24px) 80px", display: "grid", gap: "20px" }}>

        {/* Form card */}
        <div style={{ backgroundColor: "#fff", borderRadius: "4px", padding: "clamp(20px,4vw,32px)", boxShadow: "0 2px 20px rgba(26,24,22,0.06)", border: "1px solid #EDE9E3" }}>

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "20px" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "30px" }}>
                <UInput label="Email" name="email" placeholder="your@email.com" type="email" error={errors.email} inputRef={refs.email} />
              </div>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "20px" }}>Delivery Address</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "12px 14px", border: "1px solid #EDE9E3", borderRadius: "3px", backgroundColor: "#F5F2ED" }}>
                  <p style={{ fontSize: "8px", color: "#9A9590", marginBottom: "2px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Country</p>
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>Egypt</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <UInput label="First Name" name="firstName" placeholder="First name" error={errors.firstName} inputRef={refs.firstName} />
                  <UInput label="Last Name" name="lastName" placeholder="Last name" error={errors.lastName} inputRef={refs.lastName} />
                </div>
                <UInput label="Address" name="address" placeholder="Street address" error={errors.address} inputRef={refs.address} />
                <UInput label="Apartment / Floor (optional)" name="apartment" placeholder="Apt, suite, floor..." inputRef={refs.apartment} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <UInput label="City" name="city" placeholder="City" error={errors.city} inputRef={refs.city} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: errors.governorate ? "#c0392b" : "#888" }}>
                      Governorate{errors.governorate ? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> — {errors.governorate}</span> : ""}
                    </label>
                    <div style={{ position: "relative" }}>
                      <select value={govVal} onChange={e => { setGovVal(e.target.value); setErrors(p => ({ ...p, governorate: undefined })); }}
                        style={{ width: "100%", padding: "13px 34px 13px 14px", border: errors.governorate ? "1px solid #c0392b" : "1px solid #DDD8D2", borderRadius: "3px", fontSize: "13px", fontFamily: "inherit", outline: "none", backgroundColor: "#fff", WebkitAppearance: "none", appearance: "none", cursor: "pointer" }}
                        onFocus={e => e.target.style.borderColor = "#1A1816"} onBlur={e => e.target.style.borderColor = errors.governorate ? "#c0392b" : "#DDD8D2"}>
                        <option value="">Select...</option>
                        {EGYPT_GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown size={12} strokeWidth={1.8} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }} />
                    </div>
                  </div>
                </div>
                <UInput label="Phone" name="phone" placeholder="+20..." type="tel" error={errors.phone} inputRef={refs.phone} />
              </div>
              <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#F5F2ED", borderRadius: "3px", border: "1px solid #E8E3DB" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "6px" }}>Cash on Delivery</p>
                <p style={{ fontSize: "12px", color: "#7A7570", lineHeight: 1.75, fontWeight: 300 }}>Our concierge will contact you to arrange delivery at your convenience. Payment is collected upon arrival.</p>
              </div>
              <button onClick={() => validate1() && setStep(2)}
                style={{ marginTop: "22px", width: "100%", padding: "15px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "8px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.32em"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.28em"; }}>
                Continue to Review →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "pageIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "24px" }}>
                <Package size={14} strokeWidth={1.6} />
                <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>Confirm Your Order</p>
              </div>
              <div style={{ backgroundColor: "#F5F2ED", borderRadius: "3px", padding: "16px", marginBottom: "12px", border: "1px solid #E8E3DB" }}>
                <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", marginBottom: "8px" }}>Delivering To</p>
                <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "3px" }}>{saved.firstName} {saved.lastName}</p>
                <p style={{ fontSize: "12px", color: "#5A5550", fontWeight: 300 }}>{saved.address}{saved.apartment ? `, ${saved.apartment}` : ""}</p>
                <p style={{ fontSize: "12px", color: "#5A5550", fontWeight: 300 }}>{saved.city}, {saved.governorate} — Egypt</p>
                <p style={{ fontSize: "11px", color: "#9A9590", marginTop: "6px" }}>{saved.email} · {saved.phone}</p>
              </div>
              <div style={{ backgroundColor: "#F5F2ED", borderRadius: "3px", padding: "16px", marginBottom: "24px", border: "1px solid #E8E3DB" }}>
                <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9590", marginBottom: "6px" }}>Payment</p>
                <p style={{ fontSize: "12px" }}>Cash on Delivery</p>
              </div>

              {/* API error */}
              {apiError && (
                <div style={{ padding: "13px 16px", backgroundColor: "#FFF0F0", border: "1px solid #FFCCCC", borderRadius: "3px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#c0392b", fontWeight: 500 }}>⚠️ {apiError}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setStep(1)} disabled={submitting}
                  style={{ flex: 1, padding: "14px", backgroundColor: "transparent", color: "#7A7570", border: "1px solid #DDD8D2", fontSize: "8px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>
                  ← Back
                </button>
                <button onClick={handlePlaceOrder} disabled={submitting}
                  style={{ flex: 2, padding: "14px", backgroundColor: submitting ? "#4A7A62" : "#2C5F3F", color: "#FAF9F7", border: "none", fontSize: "8px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "inherit", borderRadius: "3px", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#235a40"; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = submitting ? "#4A7A62" : "#2C5F3F"; }}>
                  {submitting
                    ? <><Loader size={12} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Placing Order…</>
                    : "Confirm Order ✓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ backgroundColor: "#fff", borderRadius: "4px", padding: "clamp(16px,3vw,24px)", boxShadow: "0 2px 20px rgba(26,24,22,0.06)", position: "sticky", top: "18px", border: "1px solid #EDE9E3" }}>
            <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "16px", color: "#9A9590" }}>Order Summary</p>
            <div style={{ marginBottom: "14px", padding: "12px", backgroundColor: "#F5F2ED", borderRadius: "3px" }}>
              {freeShip
                ? <p style={{ fontSize: "9px", fontWeight: 600, color: "#2C5F3F", letterSpacing: "0.1em" }}>✦ Complimentary delivery included</p>
                : <>
                    <p style={{ fontSize: "10px", color: "#7A7570", marginBottom: "8px" }}><strong style={{ color: "#1A1816" }}>{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} EGP</strong> to complimentary delivery</p>
                    <div style={{ height: "1px", backgroundColor: "#E0D8CE", overflow: "hidden" }}><div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#B8966E", transition: "width 0.4s" }} /></div>
                  </>}
            </div>
            {cart.map(item => {
              const key = `${item.id}-${item.size}-${item.color}`;
              return (
                <div key={key} style={{ display: "flex", gap: "12px", padding: "14px 0", borderBottom: "1px solid #EDE9E3" }}>
                  <div style={{ width: "50px", height: "62px", backgroundColor: "#EDEAE4", borderRadius: "2px", flexShrink: 0, overflow: "hidden" }}>
                    {firstImg(item) && <img src={firstImg(item)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="serif" style={{ fontSize: "15px", fontWeight: 400, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A9590", marginBottom: "8px" }}>{item.description}</p>
                    <button onClick={() => onRemoveItem(key)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#C5BFB8", fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit", padding: 0, transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#c0392b"} onMouseLeave={e => e.currentTarget.style.color = "#C5BFB8"}>
                      <Trash2 size={9} strokeWidth={1.6} /> Remove
                    </button>
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>{item.price.toLocaleString()} EGP</p>
                </div>
              );
            })}
            <div style={{ paddingTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px", fontSize: "10px", color: "#9A9590" }}><span>Subtotal</span><span>{subtotal.toLocaleString()} EGP</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "10px", color: "#9A9590" }}>
                <span>Delivery</span>
                {freeShip ? <span style={{ color: "#2C5F3F", fontWeight: 600 }}>Complimentary</span> : <span>{shipping} EGP</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #EDE9E3" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>Total</span>
                <span className="serif" style={{ fontSize: "20px", fontWeight: 400 }}>{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}