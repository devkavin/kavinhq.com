import React from "react";
import { motion } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function MaskedHeading({ lines, className = "", as = "h1" }) {
  const reduced = useReducedMotionPreference();
  const Tag = as;
  return <Tag className={className}>{lines.map((line, index) => <span className="heading-mask" key={line}><motion.span initial={reduced ? false : { y: "112%" }} animate={{ y: 0 }} transition={{ delay: index * 0.1, duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}>{line}</motion.span></span>)}</Tag>;
}
