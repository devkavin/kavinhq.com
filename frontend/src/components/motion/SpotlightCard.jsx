import React from "react";
import { motion } from "framer-motion";

export default function SpotlightCard({ children, className = "", ...props }) {
  const move = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };
  return <motion.article {...props} onMouseMove={move} className={`spotlight-card glass ${className}`}>{children}</motion.article>;
}
