import { useState } from "react";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { firstImg, EGYPT_GOVS, getShipping, FREE_SHIPPING_THRESHOLD, getEffectivePrice } from "../data/products";

const API = "https://back-end-production-afdf.up.railway.app";

const Field = ({ label, children, error }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
    <label style={{ fontSize:"8px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color: error?"#C0392B":"#1A1816" }}>
      {label}{error && <span style={{ marginLeft:"6px", color:"#C0392B", fontWeight:500, textTransform:"none", letterSpacing:0 }}> — {error}</span>}
    </label>
    {children}
  </div>
);

const inp = (hasError=false) => ({
  padding:"12px 14px", border:`1px solid ${hasError?"#C0392B":"#DDD8D2"}`,
  borderRadius:"3px", fontSize:"13px", fontFamily:"inherit",
  color:"#1A1816", backgroundColor:"#fff", outline:"none",
  transition:"border-color 0.15s", width:"100%", boxSizing:"border-box",
  // Supports Arabic text direction automatically
  direction:"auto", unicodeBidi:"plaintext",
});

export default function CheckoutPage({ cart, onBack, onPlaceOrder, onRemoveItem }) {
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", phone:"",
    address:"", apartment:"", city:"", governorate:"",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  // Calculate using live backend shipping
  const subtotal    = cart.reduce((s, i) => s + getEffectivePrice(i) * (i.qty||1), 0);
  const rawSubtotal = cart.reduce((s, i) => s + i.price * (i.qty||1), 0);
  const discountAmt = rawSubtotal - subtotal;  // total savings
  const shipping    = getShipping(subtotal);
  const total       = subtotal + shipping;
  const freeShip    = shipping === 0;

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName   = "Required";
    if (!form.lastName.trim())  e.lastName    = "Required";
    if (!form.phone.trim())     e.phone       = "Required";
    if (!form.address.trim())   e.address     = "Required";
    if (!form.city.trim())      e.city        = "Required";
    if (!form.governorate)      e.governorate = "Required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart.map(i => ({
            productId:  i._id || i.id,
            name:       i.name,
            description:i.description,
            badge:      i.badge || i.category,
            price:      i.price,          // original price
            salePrice:  getEffectivePrice(i) < i.price ? getEffectivePrice(i) : undefined,
            size:       i.size,
            color:      i.colorName,
            image:      firstImg(i),
          })),
          subtotal,
          discount: discountAmt,
          shipping,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      onPlaceOrder(data.orderNumber);
    } catch (err) {
      setServerErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor:"#FAF9F7", minHeight:"100vh", fontFamily:"inherit" }}>
      {/* Back bar */}
      <div style={{ padding:"16px clamp(16px,4vw,52px)", borderBottom:"1px solid #EDE9E3", position:"sticky", top:0, zIndex:100, backgroundColor:"rgba(250,249,247,.97)", backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={onBack}
            style={{ display:"flex", alignItems:"center", gap:"8px", background:"none", border:"none", cursor:"pointer", color:"#7A7570", fontSize:"8px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"inherit", transition:"color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#1A1816"} onMouseLeave={e=>e.currentTarget.style.color="#7A7570"}>
            <ArrowLeft size={13} strokeWidth={1.8}/> Continue Shopping
          </button>
          <span className="serif" style={{ fontSize:"18px", fontWeight:300, letterSpacing:"0.12em" }}>Checkout</span>
          <div style={{ width:"120px" }}/>
        </div>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"clamp(22px,4vw,48px) clamp(16px,4vw,52px)" }}>
        <div className="co-layout" style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:"clamp(22px,4vw,56px)", alignItems:"start" }}>

          {/* LEFT — Form */}
          <div>
            <h2 style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:"26px" }}>Delivery Information</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <Field label="First Name" error={errors.firstName}>
                  <input value={form.firstName} onChange={set("firstName")} placeholder="Ahmed" style={inp(!!errors.firstName)}
                    onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.firstName?"#C0392B":"#DDD8D2"}/>
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <input value={form.lastName} onChange={set("lastName")} placeholder="Hassan" style={inp(!!errors.lastName)}
                    onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.lastName?"#C0392B":"#DDD8D2"}/>
                </Field>
              </div>

              <Field label="Phone Number" error={errors.phone}>
                <input value={form.phone} onChange={set("phone")} placeholder="+20 100 000 0000" type="tel" style={inp(!!errors.phone)}
                  onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.phone?"#C0392B":"#DDD8D2"}/>
              </Field>

              <Field label="Email Address (optional)">
                <input value={form.email} onChange={set("email")} placeholder="ahmed@email.com" type="email" style={inp(!!errors.email)}
                  onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.email?"#C0392B":"#DDD8D2"}/>
              </Field>

              {/* Street — Arabic + English supported */}
              <Field label="Street Address / العنوان" error={errors.address}>
                <input value={form.address} onChange={set("address")}
                  placeholder="123 El Tahrir St / شارع التحرير ١٢٣"
                  style={{ ...inp(!!errors.address), direction:"auto" }}
                  onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.address?"#C0392B":"#DDD8D2"}/>
              </Field>

              <Field label="Apartment / Floor / الشقة (optional)">
                <input value={form.apartment} onChange={set("apartment")}
                  placeholder="Apt 5, Floor 2 / شقة ٥، الدور ٢"
                  style={{ ...inp(), direction:"auto" }}
                  onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor="#DDD8D2"}/>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <Field label="City / المدينة" error={errors.city}>
                  <input value={form.city} onChange={set("city")}
                    placeholder="Cairo / القاهرة"
                    style={{ ...inp(!!errors.city), direction:"auto" }}
                    onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.city?"#C0392B":"#DDD8D2"}/>
                </Field>
                <Field label="Governorate / المحافظة" error={errors.governorate}>
                  <select value={form.governorate} onChange={set("governorate")}
                    style={{ ...inp(!!errors.governorate), appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9590' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:"38px" }}
                    onFocus={e=>e.target.style.borderColor="#1A1816"} onBlur={e=>e.target.style.borderColor=errors.governorate?"#C0392B":"#DDD8D2"}>
                    <option value="">Select…</option>
                    {EGYPT_GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Payment badge */}
            <div style={{ marginTop:"28px", padding:"16px 18px", backgroundColor:"#F0FAF4", border:"1px solid #C3E6D0", borderRadius:"4px", display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"20px" }}>💵</span>
              <div>
                <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#2C5F3F", marginBottom:"3px" }}>Cash on Delivery</p>
                <p style={{ fontSize:"11px", color:"#3A7A56", fontWeight:300 }}>Pay when your order arrives. No prepayment needed.</p>
              </div>
            </div>

            {serverErr && (
              <div style={{ marginTop:"14px", padding:"12px 16px", backgroundColor:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"4px" }}>
                <p style={{ fontSize:"11px", color:"#C0392B" }}>{serverErr}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading||cart.length===0}
              style={{ marginTop:"26px", width:"100%", padding:"17px", backgroundColor: loading?"#7A7570":"#1A1816", color:"#FAF9F7", border:"none", cursor: loading?"not-allowed":"pointer", borderRadius:"3px", fontSize:"9px", fontWeight:700, letterSpacing:"0.26em", textTransform:"uppercase", fontFamily:"inherit", transition:"background 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
              onMouseEnter={e=>{ if(!loading)e.currentTarget.style.backgroundColor="#2D2A26"; }}
              onMouseLeave={e=>{ if(!loading)e.currentTarget.style.backgroundColor="#1A1816"; }}>
              {loading ? (
                <><span style={{ display:"inline-block", width:"12px", height:"12px", border:"2px solid rgba(250,249,247,.3)", borderTopColor:"#FAF9F7", borderRadius:"50%", animation:"spin .8s linear infinite" }} /> Placing Order…</>
              ) : (
                <><Check size={13} strokeWidth={2.5}/> Place Order — {total.toLocaleString()} EGP</>
              )}
            </button>
          </div>

          {/* RIGHT — Summary */}
          <div style={{ position:"sticky", top:"80px" }}>
            <h2 style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:"18px" }}>Order Summary</h2>
            <div style={{ backgroundColor:"#fff", border:"1px solid #EDE9E3", borderRadius:"4px", overflow:"hidden", marginBottom:"14px" }}>
              {cart.map((item, idx) => {
                const key = `${item._id||item.id}-${item.size}-${item.colorName}`;
                const sp  = getEffectivePrice(item);
                const hasD= sp < item.price;
                return (
                  <div key={key} style={{ display:"flex", gap:"12px", padding:"13px 16px", borderBottom: idx<cart.length-1?"1px solid #F5F2ED":"none" }}>
                    <div style={{ width:"52px", height:"64px", backgroundColor:"#EDEAE4", borderRadius:"2px", flexShrink:0, overflow:"hidden" }}>
                      {firstImg(item) && <img src={firstImg(item)} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="serif" style={{ fontSize:"15px", fontWeight:400, lineHeight:1.2, marginBottom:"3px" }}>{item.name}</p>
                      <div style={{ display:"flex", gap:"8px", marginBottom:"5px" }}>
                        {item.size && item.size!=="One Size" && <span style={{ fontSize:"8px", color:"#7A7570", backgroundColor:"#F0EDE8", padding:"1px 6px", borderRadius:"2px" }}>{item.size}</span>}
                        {item.colorName && <span style={{ fontSize:"8px", color:"#7A7570" }}>{item.colorName}</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"baseline", gap:"5px" }}>
                        <p style={{ fontSize:"12px", fontWeight:600, color: hasD?"#C0392B":"#1A1816" }}>{sp.toLocaleString()} EGP</p>
                        {hasD && <p style={{ fontSize:"10px", color:"#B8A898", textDecoration:"line-through" }}>{item.price.toLocaleString()}</p>}
                      </div>
                    </div>
                    <button onClick={()=>onRemoveItem(key)} style={{ background:"none", border:"none", cursor:"pointer", color:"#C5BFB8", flexShrink:0, display:"flex", alignSelf:"flex-start", marginTop:"2px" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#9A9590"} onMouseLeave={e=>e.currentTarget.style.color="#C5BFB8"}>
                      <Trash2 size={12} strokeWidth={1.8}/>
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor:"#fff", border:"1px solid #EDE9E3", borderRadius:"4px", padding:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"10px", color:"#9A9590" }}>Subtotal</span>
                <span style={{ fontSize:"10px", fontWeight:500 }}>{rawSubtotal.toLocaleString()} EGP</span>
              </div>
              {discountAmt > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontSize:"10px", color:"#C0392B", fontWeight:600 }}>Discount</span>
                  <span style={{ fontSize:"10px", fontWeight:600, color:"#C0392B" }}>-{discountAmt.toLocaleString()} EGP</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontSize:"10px", color:"#9A9590" }}>Delivery</span>
                <span style={{ fontSize:"10px", fontWeight:500, color: freeShip?"#2C5F3F":"#1A1816" }}>{freeShip?"Free":`${shipping} EGP`}</span>
              </div>
              {!freeShip && subtotal < FREE_SHIPPING_THRESHOLD && (
                <div style={{ padding:"8px 10px", backgroundColor:"#F5F2ED", borderRadius:"3px", marginBottom:"14px" }}>
                  <p style={{ fontSize:"9px", color:"#7A7570" }}>
                    Add <strong style={{ color:"#1A1816" }}>{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} EGP</strong> more for free delivery
                  </p>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"12px", borderTop:"1px solid #EDE9E3" }}>
                <span style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Total</span>
                <span className="serif" style={{ fontSize:"22px", fontWeight:400 }}>{total.toLocaleString()} <span style={{ fontSize:"11px", color:"#9A9590" }}>EGP</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}