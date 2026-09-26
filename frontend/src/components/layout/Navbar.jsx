import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../brand/Logo";
import MagneticButton from "../motion/MagneticButton";
import MobileMenu from "./MobileMenu";

const links = [["/", "Home"], ["/portfolio", "Portfolio"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 24); update(); window.addEventListener("scroll", update); return () => window.removeEventListener("scroll", update); }, []);
  return <>
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <Link to="/" data-testid="nav-logo" aria-label="KAVINHQ home"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(([to, label]) => {
        const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return <Link key={to} to={to} data-testid={`nav-link-${label.toLowerCase()}`} aria-current={active ? "page" : undefined}>{label}{active && <motion.span className="nav-underline" layoutId="nav-underline" />}</Link>;
      })}</nav>
      <MagneticButton className="nav-cta-wrap"><Link className="button button-primary" to="/contact" data-testid="nav-start-project" data-cursor="CHAT">Start a Project</Link></MagneticButton>
      <button className="menu-toggle" aria-label="Open menu" data-testid="nav-mobile-toggle" onClick={() => setOpen(true)}><Menu /></button>
    </header>
    <AnimatePresence>{open && <MobileMenu onClose={() => setOpen(false)} />}</AnimatePresence>
  </>;
}
