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

// ─── PRODUCTS — one unique piece each, no sizes or colors ─
export const PRODUCTS = [
  {
    id: 1,
    name: "Merino Atelier Coat",
    price: 3200,
    tag: "One of a Kind",
    badge: "01 / SS26",
    description: "Double-faced merino wool · Italy",
    details:
      "A double-faced merino wool coat cut in an unstructured silhouette. Handfinished seams, horn buttons, and a signature Sola interior label. This exact piece will never be reproduced.",
    material: "100% Merino Wool — Loro Piana cloth",
    care: "Dry clean only",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=85",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85",
    ],
  },
  {
    id: 2,
    name: "Cashmere Sculptural Blazer",
    price: 2800,
    tag: "Archive Piece",
    badge: "02 / SS26",
    description: "Grade A cashmere · Mongolia",
    details:
      "Structured yet soft — this blazer in Grade A Mongolian cashmere features hand-padded shoulders and a single-button closure. Lined in silk. One piece exists.",
    material: "Grade A Mongolian Cashmere — Silk lining",
    care: "Specialist dry clean",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=85",
      "https://images.unsplash.com/photo-1555069519-127aadecd47a?w=900&q=85",
    ],
  },
  {
    id: 3,
    name: "Japanese Selvedge Trousers",
    price: 1650,
    tag: "Exclusive",
    badge: "03 / SS26",
    description: "14oz selvedge cotton · Japan",
    details:
      "Cut from a single bolt of 14oz Japanese selvedge cotton. High-rise, wide leg, with hand-stitched belt loops. The fabric will develop a unique patina with wear.",
    material: "14oz Selvedge Cotton — Handstitched",
    care: "Cold wash, hang dry",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=85",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=85",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=85",
    ],
  },
  {
    id: 4,
    name: "Linen Sculpture Shirt",
    price: 1200,
    tag: null,
    badge: "04 / SS26",
    description: "Egyptian linen · Hand-pressed",
    details:
      "Oversized, architecturally cut from premium Egyptian linen. Hand-pressed collar, mother-of-pearl buttons, drop-shoulder seam that frames without constraint.",
    material: "100% Egyptian Linen — Hand-finished",
    care: "Hand wash cold, press damp",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=900&q=85",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&q=85",
    ],
  },
  {
    id: 5,
    name: "Wool Crepe Evening Jacket",
    price: 2400,
    tag: "Rare Find",
    badge: "05 / SS26",
    description: "Italian wool crepe · Canvassed",
    details:
      "A refined evening jacket in Italian wool crepe. Knife-sharp lapels, hand-padded chest, double-lined sleeves that hold shape for decades.",
    material: "Italian Wool Crepe — Canvassed construction",
    care: "Dry clean only",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85",
      "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=900&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85",
    ],
  },
  {
    id: 6,
    name: "Raw Silk Overshirt",
    price: 1850,
    tag: null,
    badge: "06 / SS26",
    description: "Raw dupioni silk · Hand-cut",
    details:
      "Raw dupioni silk in a relaxed overshirt silhouette. Natural slubs make each piece visually unique. Tonal buttons, unlined, generous body for layering.",
    material: "Dupioni Raw Silk — Unlined",
    care: "Dry clean recommended",
    images: [
      "https://images.unsplash.com/photo-1609873814058-a8928924184a?w=900&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85",
    ],
  },
];