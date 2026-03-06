import { useState } from "react";

export default function OrderConfirmPage({ orderNumber, onContinue }) {

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF9F7", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Montserrat',sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "520px", animation: "fadeUp 0.8s ease" }}>

        {/* Gold divider line */}
        <div style={{ width: "1px", height: "60px", backgroundColor: "#B8966E", margin: "0 auto 32px" }} />

        <p style={{ fontSize: "8px", letterSpacing: "0.32em", textTransform: "uppercase", color: "#9A9590", marginBottom: "16px" }}>
          Sola Brand & Boutique
        </p>

        <h1 className="serif" style={{ fontSize: "clamp(38px,7vw,52px)", fontWeight: 300, marginBottom: "18px", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
          Order Received
        </h1>

        <p style={{ fontSize: "12px", color: "#7A7570", lineHeight: 1.9, marginBottom: "32px", fontWeight: 300 }}>
          Thank you for your acquisition. Our concierge team will reach out within 24 hours to arrange white-glove delivery at your convenience.
        </p>

        {/* Order reference */}
        <div style={{ padding: "22px 26px", borderRadius: "3px", marginBottom: "18px", border: "1px solid #DDD8D2", backgroundColor: "#fff" }}>
          <p style={{ fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A9590", marginBottom: "9px" }}>Reference Number</p>
          <p className="serif" style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "0.08em" }}>{orderNumber}</p>
        </div>

        {/* COD badge */}
        <div style={{ padding: "14px 18px", borderRadius: "3px", marginBottom: "36px", backgroundColor: "#F0FAF4", border: "1px solid #C3E6D0", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <span>💵</span>
          <p style={{ fontSize: "11px", color: "#2C5F3F", fontWeight: 500 }}>Payment collected upon delivery</p>
        </div>

        <button
          onClick={onContinue}
          style={{ padding: "16px 52px", backgroundColor: "#1A1816", color: "#FAF9F7", border: "none", fontSize: "8px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", borderRadius: "3px", cursor: "pointer", transition: "all 0.25s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2D2A26"; e.currentTarget.style.letterSpacing = "0.32em"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1A1816"; e.currentTarget.style.letterSpacing = "0.28em"; }}
        >
          Return to Collection
        </button>
      </div>
    </div>
  );
}