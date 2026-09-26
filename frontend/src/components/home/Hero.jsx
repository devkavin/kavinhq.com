import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, CheckCircle2, Lock, MessageCircle, Terminal, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import MagneticButton from "../motion/MagneticButton";
import TiltVisual from "../motion/TiltVisual";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function KineticDemand({ text, reduced }) {
  const [display, setDisplay] = useState(text);
  const isRunning = useRef(false);

  const triggerScramble = () => {
    if (reduced || isRunning.current) return;
    isRunning.current = true;
    let iteration = 0;
    const maxIterations = 14;
    const interval = setInterval(() => {
      iteration += 1;
      setDisplay(
        text
          .split("")
          .map((char, idx) => {
            if (char === " " || idx < (iteration / maxIterations) * text.length) {
              return char;
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplay(text);
        isRunning.current = false;
      }
    }, 28);
  };

  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(triggerScramble, 450);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <span
      className="text-iridescent"
      onMouseEnter={triggerScramble}
      onTouchStart={triggerScramble}
      data-cursor="DECRYPT"
      title="Hover or tap to decrypt"
    >
      {display}
    </span>
  );
}

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
      <h1 aria-label="WEBSITES THAT DEMAND ATTENTION.">{lines.map((line, index) => <span className="heading-mask" key={line}><motion.span initial={reduced ? false : { y: "112%" }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { delay: .12 + index * .1, duration: .9, ease: [0.16,1,.3,1] }}>{line === "DEMAND" ? <KineticDemand text="DEMAND" reduced={reduced} /> : line}</motion.span></span>)}</h1>
      <motion.p initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { delay: .55 }}>I'm Kavin. I design and engineer landing pages, e-commerce stores and custom web experiences that are fast, SEO-ready and impossible to scroll past.</motion.p>
      <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduced ? { duration: 0 } : { delay: .7 }}>
        <MagneticButton><a className="button button-primary" href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noreferrer" data-testid="hero-cta-whatsapp" data-cursor="CHAT"><MessageCircle size={16}/> Start a Project</a></MagneticButton>
        <Link className="button button-ghost" to="/portfolio" data-testid="hero-cta-portfolio" data-cursor="OPEN">Explore My Work <ArrowDownRight size={16}/></Link>
      </motion.div>
    </div>
    <div className="hero-visual-wrap">
      <TiltVisual className="hero-visual glass">
        <div className="browser-frame">
          <div className="browser-header">
            <div className="browser-dots">
              <span className="dot dot-red" />
              <span className="dot dot-amber" />
              <span className="dot dot-green" />
            </div>
            <div className="browser-address">
              <Lock size={10} className="address-lock" />
              <span>kavinhq.com/engine</span>
            </div>
            <div className="browser-ping">
              <span className="ping-dot" />
              <span>18ms</span>
            </div>
          </div>

          <div className="browser-body">
            <div className="audit-header">
              <span className="audit-title">LIGHTHOUSE AUDIT</span>
              <span className="audit-badge"><CheckCircle2 size={12} /> VERIFIED 100s</span>
            </div>

            <div className="audit-grid">
              <div className="audit-card">
                <div className="audit-score">100</div>
                <span>PERF</span>
              </div>
              <div className="audit-card">
                <div className="audit-score">100</div>
                <span>SEO</span>
              </div>
              <div className="audit-card">
                <div className="audit-score">100</div>
                <span>ACCESS</span>
              </div>
              <div className="audit-card">
                <div className="audit-score">100</div>
                <span>BEST</span>
              </div>
            </div>

            <div className="engine-terminal">
              <div className="terminal-header-bar">
                <Terminal size={11} />
                <span>kavinhq-production.ts</span>
              </div>
              <div className="terminal-code">
                <p><span className="tok-kw">const</span> app = <span className="tok-fn">createPlatform</span>({'{'}</p>
                <p className="tok-indent">speed: <span className="tok-str">"sub-second"</span>,</p>
                <p className="tok-indent">seo: <span className="tok-str">"built-in"</span>,</p>
                <p className="tok-indent">deploy: <span className="tok-val">"docker-ready"</span></p>
                <p>{'}'});</p>
                <p className="tok-comment">// status: ready for deployment</p>
              </div>
            </div>

            <div className="telemetry-bar">
              <div className="telemetry-stat">
                <span className="stat-num text-gradient">99.99%</span>
                <span className="stat-label">UPTIME</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-num text-cyan">0.3s</span>
                <span className="stat-label">LCP SPEED</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-num text-green">A+</span>
                <span className="stat-label">GRADE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="visual-scan" />
      </TiltVisual>
      <div className="floating-badge badge-top glass"><span className="badge-dot" /> SEO-FIRST BUILDS</div>
      <div className="floating-badge badge-bottom glass"><span className="badge-dot dot-cyan" /> DOCKER HOSTED • DONE-FOR-YOU</div>
    </div>
    <div className="hero-index">001 / KAVINHQ</div>
  </section>;
}
