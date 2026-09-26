import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import Reveal from "../motion/Reveal";
import ScrambleLabel from "../motion/ScrambleLabel";
import SpotlightCard from "../motion/SpotlightCard";

export default function SelectedWork() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => { apiRequest("/api/projects?featured=true").then(setProjects).catch(() => setError(true)); }, []);
  return <section className="section work-section" id="selected-work">
    <div className="section-heading"><ScrambleLabel text="01 / SELECTED WORK"/><h2>Built to be <span className="text-gradient">remembered.</span></h2><Link to="/portfolio" data-testid="home-view-all">View all work <ArrowUpRight size={16}/></Link></div>
    {error && <p className="section-note">Project details are taking a moment. The full portfolio is still available.</p>}
    <div className="featured-grid">{projects.map((project, index) => <Reveal key={project.id} className={index % 3 === 0 ? "project-span-7" : index % 3 === 1 ? "project-span-5" : "project-span-6"}>
      <SpotlightCard className="featured-project" data-testid={`featured-project-${project.slug}`} data-cursor="VIEW">
        <Link to={`/portfolio/${project.slug}`}>
          <div className="project-media"><img src={project.image_url} alt={`${project.title} website preview`} onError={(event) => event.currentTarget.classList.add("image-error")} /></div>
          <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
          <h3>{project.title}</h3><p>{project.description}</p>
        </Link>
      </SpotlightCard>
    </Reveal>)}</div>
  </section>;
}
