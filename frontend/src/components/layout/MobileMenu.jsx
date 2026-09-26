import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import useFocusTrap from "../../hooks/useFocusTrap";

const links = [["/", "Home"], ["/portfolio", "Portfolio"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

export default function MobileMenu({ onClose, returnFocusRef }) {
  const menuRef = useRef(null);
  useFocusTrap(menuRef, onClose, returnFocusRef);
  return <motion.div ref={menuRef} className="mobile-menu" data-testid="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation" tabIndex={-1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button onClick={onClose} data-testid="mobile-menu-close" aria-label="Close menu"><X /></button>
    <div className="mobile-menu-inner">
      <nav aria-label="Mobile navigation">{links.map(([to, label]) => <Link key={to} to={to} onClick={onClose} data-testid={`mobile-link-${label.toLowerCase()}`}>{label}</Link>)}</nav>
      <div className="mobile-menu-cta">
        <Link className="button button-primary mobile-cta-btn" to="/contact" onClick={onClose} data-testid="mobile-start-project">
          Start a Project <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  </motion.div>;
}
