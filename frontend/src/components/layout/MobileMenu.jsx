import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const links = [["/", "Home"], ["/portfolio", "Portfolio"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

export default function MobileMenu({ onClose }) {
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current?.focus(); const key = (event) => event.key === "Escape" && onClose(); document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, [onClose]);
  return <motion.div className="mobile-menu" data-testid="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button ref={closeRef} onClick={onClose} data-testid="mobile-menu-close" aria-label="Close menu"><X /></button>
    <nav aria-label="Mobile navigation">{links.map(([to, label]) => <Link key={to} to={to} onClick={onClose} data-testid={`mobile-link-${label.toLowerCase()}`}>{label}</Link>)}</nav>
  </motion.div>;
}
