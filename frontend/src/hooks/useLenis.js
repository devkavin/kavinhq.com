import { useEffect, useRef } from "react";
import Lenis from "lenis";
import useReducedMotionPreference from "./useReducedMotionPreference";

export default function useLenis() {
  const reduced = useReducedMotionPreference();
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    ref.current = lenis;
    let frame;
    const loop = (time) => { lenis.raf(time); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); ref.current = null; };
  }, [reduced]);
  return ref;
}
