import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects }) {
  if (!projects.length) return <div className="empty-state"><p>No projects match this filter.</p></div>;
  return <motion.div className="portfolio-grid" layout><AnimatePresence mode="popLayout">{projects.map((project) => <motion.div key={project.id} layout initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }}><ProjectCard project={project}/></motion.div>)}</AnimatePresence></motion.div>;
}
