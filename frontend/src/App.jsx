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
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import CaseStudyPage from "./pages/CaseStudyPage";
import NotFoundPage from "./pages/NotFoundPage";

function Placeholder({ name }) { return <PageTransition><main className="placeholder-page"><h1>{name}</h1></main></PageTransition>; }

export function AppRoutes() {
  useLenis();
  const location = useLocation();
  return <>
    <ScrollProgress /><CustomCursor /><Navbar />
    <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
      <Route path="/about" element={<Placeholder name="About" />} />
      <Route path="/services" element={<Placeholder name="Services" />} />
      <Route path="/contact" element={<Placeholder name="Contact" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></AnimatePresence>
    <Footer /><Toaster theme="dark" richColors />
  </>;
}

export default function App() {
  return <HelmetProvider><BrowserRouter><AuthProvider><SettingsProvider><AppRoutes /></SettingsProvider></AuthProvider></BrowserRouter></HelmetProvider>;
}
