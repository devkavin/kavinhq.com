import React from "react";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../brand/Logo";

export default function Footer() {
  return <footer className="site-footer">
    <div><Logo /><p>Focused websites for businesses that care about the details.</p></div>
    <div><span className="footer-label">Navigate</span><Link to="/portfolio" data-testid="footer-portfolio">Portfolio</Link><Link to="/about" data-testid="footer-about">About</Link><Link to="/contact" data-testid="footer-contact">Contact</Link></div>
    <div><span className="footer-label">Services</span><span>Landing pages</span><span>E-commerce</span><span>Custom applications</span></div>
    <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="footer-back-to-top" aria-label="Back to top"><ArrowUp /></button>
    <small>Copyright {new Date().getFullYear()} KAVINHQ. All rights reserved.</small>
  </footer>;
}
