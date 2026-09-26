import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";
import useReducedMotionPreference from "./useReducedMotionPreference";

export default function useLenis() {
  const reduced = useReducedMotionPreference();
  const location = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    ref.current = lenis;
    let frame;
    const loop = (time) => { lenis.raf(time); frame = requestAnimationFrame(loop); };
    const backToTop = () => lenis.scrollTo(0);
    window.addEventListener("kavinhq:scroll-top", backToTop);
    frame = requestAnimationFrame(loop);
    return () => { window.removeEventListener("kavinhq:scroll-top", backToTop); cancelAnimationFrame(frame); lenis.destroy(); ref.current = null; };
  }, [reduced]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = location.hash ? document.querySelector(location.hash) : 0;
      if (reduced || !ref.current) {
        if (target instanceof Element) target.scrollIntoView();
        else window.scrollTo({ top: 0, behavior: "auto" });
      } else ref.current.scrollTo(target || 0, { immediate: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, reduced]);
  return ref;
}
