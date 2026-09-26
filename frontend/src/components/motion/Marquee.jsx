import React from "react";

export default function Marquee({ items, className = "" }) {
  const content = (copy = false) => <div className="marquee-group" data-testid={copy ? "marquee-copy" : undefined} aria-hidden={copy ? "true" : undefined}>{items.map((item) => <span key={`${copy}-${item}`}><b>{item}</b><i aria-hidden="true" /></span>)}</div>;
  return <div className={`marquee ${className}`}><div className="marquee-track">{content()}{content(true)}</div></div>;
}
