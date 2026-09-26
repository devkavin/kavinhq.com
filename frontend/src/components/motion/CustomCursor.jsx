import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

export default function CustomCursor() {
  const reduced = useReducedMotionPreference();
  const fine = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const ringX = useSpring(x, { stiffness: 420, damping: 32 });
  const ringY = useSpring(y, { stiffness: 420, damping: 32 });
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (reduced || !fine) return undefined;
    const move = (event) => { x.set(event.clientX); y.set(event.clientY); };
    const over = (event) => {
      const target = event.target.closest?.("[data-cursor], a, button");
      setActive(Boolean(target));
      setLabel(target?.dataset?.cursor || "");
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerover", over); };
  }, [fine, reduced, x, y]);
  if (reduced || !fine) return null;
  return <><motion.div className="cursor-dot" style={{ x, y }} /><motion.div className="cursor-ring" animate={{ scale: label ? 2.2 : active ? 1.6 : 1 }} style={{ x: ringX, y: ringY }}>{label && <span>{label}</span>}</motion.div></>;
}
