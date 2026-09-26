import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectNavigation({ projects, current }) {
  const index = projects.findIndex((project) => project.slug === current.slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;
  return <nav className="project-navigation" aria-label="Adjacent projects">
    {previous ? <Link to={`/portfolio/${previous.slug}`} data-testid="project-previous"><ArrowLeft/> <span><small>Previous project</small>{previous.title}</span></Link> : <span/>}
    {next ? <Link to={`/portfolio/${next.slug}`} data-testid="project-next"><span><small>Next project</small>{next.title}</span> <ArrowRight/></Link> : <span/>}
  </nav>;
}
