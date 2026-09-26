import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function TiltVisual({ children, className = "" }) {
  const reduced = useReducedMotionPreference();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]));
  const ry = useSpring(useTransform(px, [0, 1], [-7, 7]));
  const move = (event) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };
  return <motion.div className={className} onMouseMove={move} onMouseLeave={() => { px.set(0.5); py.set(0.5); }} style={{ rotateX: reduced ? 0 : rx, rotateY: reduced ? 0 : ry, transformPerspective: 1000 }}>{children}</motion.div>;
}
