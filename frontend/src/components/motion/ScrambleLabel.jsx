import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function ScrambleLabel({ text, className = "eyebrow" }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotionPreference();
  const [value, setValue] = useState(text);
  useEffect(() => {
    if (!visible || reduced) { setValue(text); return undefined; }
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      setValue(text.split("").map((letter, index) => letter === " " || index < frame / 2 ? letter : CHARS[(frame + index) % CHARS.length]).join(""));
      if (frame >= 22) { clearInterval(timer); setValue(text); }
    }, 28);
    return () => clearInterval(timer);
  }, [visible, reduced, text]);
  return <span ref={ref} className={className}>{value}</span>;
}
