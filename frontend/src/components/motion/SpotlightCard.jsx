import React, { useRef } from "react";
import { motion } from "framer-motion";

export default function SpotlightCard({ children, className = "", ...props }) {
  const rectRef = useRef(null);
  const enter = (event) => { rectRef.current = event.currentTarget.getBoundingClientRect(); };
  const move = (event) => {
    if (!rectRef.current) return;
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rectRef.current.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rectRef.current.top}px`);
  };
  return <motion.article {...props} onMouseEnter={enter} onMouseMove={move} className={`spotlight-card glass ${className}`}>{children}</motion.article>;
}
