// ─── SHIPPING ─────────────────────────────────────────
export const SHIPPING_COST = 50;
export const FREE_SHIPPING_THRESHOLD = 1000;
export const getShipping = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

// ─── EGYPT GOVERNORATES ──────────────────────────────
export const EGYPT_GOVS = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum",
  "Gharbia","Ismailia","Menofia","Minya","Qalyubia","New Valley","Suez",
  "Aswan","Assiut","Beni Suef","Port Said","Damietta","Sharkia",
  "South Sinai","Kafr El Sheikh","Matruh","Luxor","Qena","North Sinai","Sohag"
];

// ─── HELPER ───────────────────────────────────────────
export const firstImg = (p) => p.images?.[0] ?? null;

// ─── API URL ─────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "https://back-end-production-afdf.up.railway.app";

// ─── Fetch products from backend ─────────────────────
export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
