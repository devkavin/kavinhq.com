import React from "react";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import PageTransition from "./components/layout/PageTransition";
import CustomCursor from "./components/motion/CustomCursor";
import ScrollProgress from "./components/motion/ScrollProgress";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import useLenis from "./hooks/useLenis";

function Placeholder({ name }) { return <PageTransition><main className="placeholder-page"><h1>{name}</h1></main></PageTransition>; }

export function AppRoutes() {
  useLenis();
  const location = useLocation();
  return <>
    <ScrollProgress /><CustomCursor /><Navbar />
    <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<Placeholder name="KAVINHQ" />} />
      <Route path="/portfolio" element={<Placeholder name="Portfolio" />} />
      <Route path="/portfolio/:slug" element={<Placeholder name="Case Study" />} />
      <Route path="/about" element={<Placeholder name="About" />} />
      <Route path="/services" element={<Placeholder name="Services" />} />
      <Route path="/contact" element={<Placeholder name="Contact" />} />
      <Route path="*" element={<Placeholder name="Page not found" />} />
    </Routes></AnimatePresence>
    <Footer /><Toaster theme="dark" richColors />
  </>;
}

export default function App() {
  return <HelmetProvider><BrowserRouter><AuthProvider><SettingsProvider><AppRoutes /></SettingsProvider></AuthProvider></BrowserRouter></HelmetProvider>;
}
