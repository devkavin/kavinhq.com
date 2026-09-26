import React, { lazy, Suspense } from "react";
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
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { SettingsProvider } from "./context/SettingsContext";
import useLenis from "./hooks/useLenis";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import CaseStudyPage from "./pages/CaseStudyPage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";

const AdminRoutes = lazy(() => import("./admin/AdminRoutes"));

function Placeholder({ name }) { return <PageTransition><main className="placeholder-page"><h1>{name}</h1></main></PageTransition>; }

export function AppRoutes() {
  useLenis();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return <>
    {!isAdmin && <><ScrollProgress/><CustomCursor/><Navbar/></>}
    <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin/*" element={<Suspense fallback={<main className="admin-loading">Loading admin</main>}><AdminRoutes/></Suspense>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></AnimatePresence>
    {!isAdmin && <Footer/>}<Toaster theme="dark" richColors />
  </>;
}

export default function App() {
  return <HelmetProvider><BrowserRouter><ReducedMotionProvider><AuthProvider><SettingsProvider><AppRoutes /></SettingsProvider></AuthProvider></ReducedMotionProvider></BrowserRouter></HelmetProvider>;
}
