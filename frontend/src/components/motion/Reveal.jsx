import React from "react";
import { motion } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const reduced = useReducedMotionPreference();
  const Component = motion[as] || motion.div;
  return <Component className={className} initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduced ? 0 : 0.7, delay }}>{children}</Component>;
}
