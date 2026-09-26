import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 24 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
