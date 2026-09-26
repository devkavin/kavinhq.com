import React from "react";
import { motion } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function PageTransition({ children }) {
  const reduced = useReducedMotionPreference();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? {} : { opacity: 0, y: -12 }} transition={{ duration: reduced ? 0 : .35 }}>{children}</motion.div>;
}
