import React from "react";

export default function Logo({ compact = false }) {
  return (
    <span className="brand-lockup" role="img" aria-label="KAVINHQ">
      <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="k-gradient" x1="8" y1="8" x2="40" y2="40"><stop stopColor="#00F0FF"/><stop offset="1" stopColor="#00FF87"/></linearGradient></defs>
        <rect x="3" y="3" width="42" height="42" rx="13" fill="#0B0F17" stroke="rgba(255,255,255,.14)"/>
        <path d="M16 12v24M17 25l15-13M17 25l16 12" fill="none" stroke="url(#k-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="37" cy="11" r="2.5" fill="#00F0FF"/>
      </svg>
      {!compact && <span className="brand-word">KAVIN<span>HQ</span></span>}
    </span>
  );
}
