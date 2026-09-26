import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function MagneticButton({ children, className = "" }) {
  const reduced = useReducedMotionPreference();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const move = (event) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };
  return <motion.span className={`magnetic ${className}`} style={{ x, y }} onMouseMove={move} onMouseLeave={reset}>{children}</motion.span>;
}
