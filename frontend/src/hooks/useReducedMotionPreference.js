// Re-exports the context value so existing consumers don't need to change their import.
// The single matchMedia listener lives in ReducedMotionProvider (wrapped in App.jsx).
export { useReducedMotion as default } from "../context/ReducedMotionContext";
