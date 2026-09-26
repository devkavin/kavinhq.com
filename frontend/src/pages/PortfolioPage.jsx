import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";
import ProjectGrid from "../components/projects/ProjectGrid";
import ScrambleLabel from "../components/motion/ScrambleLabel";
import { apiRequest } from "../lib/api";

const testId = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/api/projects").then(setProjects).catch((reason) => setError(reason.message)); }, []);
  const categories = useMemo(() => ["All", ...new Set(projects.map((project) => project.category))], [projects]);
  const filtered = filter === "All" ? projects : projects.filter((project) => project.category === filter);
  return <PageTransition><Seo title="Portfolio" description="Selected websites, stores and custom applications designed and built by KAVINHQ."/><main className="portfolio-page page-shell">
    <header className="page-hero"><ScrambleLabel text="01 / SELECTED WORK"/><h1>WORK THAT EARNS<br/><span className="text-gradient">ATTENTION.</span></h1><p>Each project starts with a real business problem and ends with a website built to make the next decision easier.</p></header>
    <div className="filter-row" role="group" aria-label="Filter projects">{categories.map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)} data-testid={`portfolio-filter-${testId(category)}`}>{category}{filter === category && <motion.span layoutId="filter-pill"/>}</button>)}</div>
    {error ? <div className="empty-state"><p>{error}</p></div> : <ProjectGrid projects={filtered}/>} 
  </main></PageTransition>;
}
