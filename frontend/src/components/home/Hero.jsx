import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import MagneticButton from "../motion/MagneticButton";
import TiltVisual from "../motion/TiltVisual";

export default function Hero() {
  const settings = useSettings();
  const reduced = useReducedMotionPreference();
  const ref = useRef(null);
  const mx = useSpring(useMotionValue(900), { stiffness: 90, damping: 26 });
  const my = useSpring(useMotionValue(120), { stiffness: 90, damping: 26 });
  const glow = useMotionTemplate`radial-gradient(640px circle at ${mx}px ${my}px, rgba(0,240,255,.07), transparent 65%)`;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const lines = ["WEBSITES THAT", "DEMAND", "ATTENTION."];
  return <section ref={ref} className="hero blueprint-grid" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); mx.set(event.clientX - rect.left); my.set(event.clientY - rect.top); }}>
    <motion.div className="hero-pointer-glow" style={{ background: glow }} aria-hidden="true" />
    <motion.div className="hero-orb" style={reduced ? undefined : { y: orbY }} aria-hidden="true" />
    <div className="hero-copy">
      <div className="availability"><span /> AVAILABLE FOR NEW PROJECTS</div>
      <h1 aria-label="WEBSITES THAT DEMAND ATTENTION.">{lines.map((line, index) => <span className="heading-mask" key={line}><motion.span className={line === "DEMAND" ? "text-gradient" : ""} initial={reduced ? false : { y: "112%" }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { delay: .12 + index * .1, duration: .9, ease: [0.16,1,.3,1] }}>{line}</motion.span></span>)}</h1>
      <motion.p initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { delay: .55 }}>I'm Kavin. I design and engineer landing pages, e-commerce stores and custom web experiences that are fast, SEO-ready and impossible to scroll past.</motion.p>
      <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduced ? { duration: 0 } : { delay: .7 }}>
        <MagneticButton><a className="button button-primary" href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noreferrer" data-testid="hero-cta-whatsapp" data-cursor="CHAT"><MessageCircle size={16}/> Start a Project</a></MagneticButton>
        <Link className="button button-ghost" to="/portfolio" data-testid="hero-cta-portfolio" data-cursor="OPEN">Explore My Work <ArrowDownRight size={16}/></Link>
      </motion.div>
    </div>
    <div className="hero-visual-wrap">
      <TiltVisual className="hero-visual glass">
        <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?crop=entropy&cs=srgb&fm=webp&q=80&w=900" alt="A dark web development workspace" width="900" height="600" fetchpriority="high" />
        <div className="visual-scan" />
      </TiltVisual>
      <div className="floating-badge badge-top glass">SEO-FIRST BUILDS</div>
      <div className="floating-badge badge-bottom glass">DOCKER-HOSTED<br/>DONE-FOR-YOU</div>
    </div>
    <div className="hero-index">001 / KAVINHQ</div>
  </section>;
}
