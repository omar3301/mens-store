// ─── DEFAULTS (overridden by backend settings) ────────
export let SHIPPING_COST           = 60;
export let FREE_SHIPPING_THRESHOLD = 1500;
export let SHIPPING_ENABLED        = true;

// ─── EGYPT GOVERNORATES ──────────────────────────────
export const EGYPT_GOVS = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum",
  "Gharbia","Ismailia","Menofia","Minya","Qalyubia","New Valley","Suez",
  "Aswan","Assiut","Beni Suef","Port Said","Damietta","Sharkia",
  "South Sinai","Kafr El Sheikh","Matruh","Luxor","Qena","North Sinai","Sohag"
];

// ─── CATEGORIES ──────────────────────────────────────
export const CATEGORIES = [
  { id: "all",     label: "All" },
  { id: "shirts",  label: "Shirts" },
  { id: "tshirts", label: "T-Shirts" },
  { id: "coats",   label: "Coats" },
  { id: "pants",   label: "Pants" },
  { id: "shoes",   label: "Shoes" },
];

// ─── HELPERS ─────────────────────────────────────────
export const firstImg = (p) => p.images?.[0] ?? null;

/** Actual charged price for a product (after discount) */
export function getEffectivePrice(product) {
  const d = product.discount;
  if (!d?.enabled || !d?.value) return product.price;
  if (d.type === "percent") return Math.round(product.price * (1 - d.value / 100));
  return Math.max(0, product.price - d.value);
}

/** Returns discount label string e.g. "20% OFF" or "-200 EGP" */
export function getDiscountLabel(product) {
  const d = product.discount;
  if (!d?.enabled || !d?.value) return null;
  return d.type === "percent" ? `${d.value}% OFF` : `-${d.value} EGP`;
}

/** Shipping cost for a given subtotal */
export function getShipping(subtotal) {
  if (!SHIPPING_ENABLED) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

// ─── BACKEND ─────────────────────────────────────────
const API = "https://back-end-production-afdf.up.railway.app";

/** Fetch shipping settings from backend and update local vars */
export async function fetchSettings() {
  try {
    const res  = await fetch(`${API}/api/settings`);
    const data = await res.json();
    if (data.shippingCost          !== undefined) SHIPPING_COST           = data.shippingCost;
    if (data.freeShippingThreshold !== undefined) FREE_SHIPPING_THRESHOLD = data.freeShippingThreshold;
    if (data.shippingEnabled       !== undefined) SHIPPING_ENABLED        = data.shippingEnabled;
    return data;
  } catch { return null; }
}

/** Fetch products from backend */
export async function fetchProducts() {
  const res = await fetch(`${API}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// ─── STATIC FALLBACK PRODUCTS ─────────────────────────
export const PRODUCTS = [
  {
    id: 1, category: "shirts",
    name: "Nordic Sailing Shirt", price: 850, tag: "New", badge: "Shirts",
    description: "Oxford cotton · Button-down",
    details: "Premium Oxford cotton with Nordic Sailing Federation embroidery on the back yoke.",
    material: "100% Cotton Oxford", care: "Machine wash cold",
    sizes: ["S","M","L","XL","XXL"],
    colors: [{ name: "Sky Blue", hex: "#AECDE3" }],
    images: ["/images/blue_front_shirt.png", "/images/2_black_blue_shirt.png"],
    discount: { enabled: false, type: "percent", value: 0 },
  },
  {
    id: 2, category: "shirts",
    name: "Pierre Cardin Sail Club", price: 1200, tag: "Pierre Cardin", badge: "Shirts",
    description: "Slim fit · Embroidered chest",
    details: "Pierre Cardin slim-fit shirt in crisp off-white cotton with Sail Club embroidery. New with tags.",
    material: "100% Egyptian Cotton", care: "Machine wash 30°C",
    sizes: ["S","M","L","XL","XXL"],
    colors: [{ name: "Cream", hex: "#F5EEE0" }],
    images: ["/images/front_shirt.png", "/images/back_shirt.png"],
    discount: { enabled: false, type: "percent", value: 0 },
  },
  {
    id: 3, category: "coats",
    name: "Pierre Cardin Trench", price: 3500, tag: "Pierre Cardin", badge: "Coats",
    description: "Double-breasted · Classic black",
    details: "Iconic Pierre Cardin double-breasted coat in jet black with peaked lapels and epaulettes.",
    material: "Cotton-Polyester blend", care: "Dry clean only",
    sizes: ["S","M","L","XL","XXL"],
    colors: [{ name: "Black", hex: "#1A1A1A" }],
    images: ["/images/black_coat.jpg", "/images/back_black_coat.png"],
    discount: { enabled: false, type: "percent", value: 0 },
  },
];