import { useEffect, useRef } from "react";

const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useFocusTrap(containerRef, onClose, returnFocusRef) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const opener = returnFocusRef?.current || document.activeElement;
    const siblings = [...(container.parentElement?.children || [])].filter((element) => element !== container);
    const siblingState = siblings.map((element) => ({ element, inert: element.inert, ariaHidden: element.getAttribute("aria-hidden") }));
    siblings.forEach((element) => { element.inert = true; element.setAttribute("aria-hidden", "true"); });
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () => [...container.querySelectorAll(selector)].filter((element) => !element.hidden);
    focusable()[0]?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); container.focus(); return; }
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = priorOverflow;
      siblingState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden"); else element.setAttribute("aria-hidden", ariaHidden);
      });
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [containerRef, returnFocusRef]);
}
