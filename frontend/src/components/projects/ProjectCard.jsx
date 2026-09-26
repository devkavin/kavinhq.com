import React from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import ResilientImage from "../media/ResilientImage";
import SpotlightCard from "../motion/SpotlightCard";

export default function ProjectCard({ project }) {
  return <SpotlightCard className="project-card" data-testid={`project-card-${project.slug}`} data-cursor="VIEW">
    <Link to={`/portfolio/${project.slug}`} data-testid={`project-case-${project.slug}`} aria-label={`View ${project.title} case study`}>
      <div className="project-media"><ResilientImage src={project.image_url} alt={`${project.title} website preview`} loading="lazy"/></div>
      <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
      <h2>{project.title}</h2><p>{project.description}</p>
    </Link>
    <a className="live-link" href={project.live_url} target="_blank" rel="noreferrer" data-testid={`project-live-${project.slug}`} data-cursor="OPEN">Live site <ExternalLink size={14}/></a>
  </SpotlightCard>;
}
