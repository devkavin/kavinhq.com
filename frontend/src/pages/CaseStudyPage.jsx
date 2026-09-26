import React, { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";
import ProjectGallery from "../components/projects/ProjectGallery";
import ProjectNavigation from "../components/projects/ProjectNavigation";
import { useSettings } from "../context/SettingsContext";
import { apiRequest } from "../lib/api";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import NotFoundPage from "./NotFoundPage";

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CaseStudyPage() {
  const { slug } = useParams();
  const settings = useSettings();
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    Promise.all([apiRequest(`/api/projects/${slug}`), apiRequest("/api/projects")])
      .then(([current, all]) => { setProject(current); setProjects(all); })
      .catch(() => setMissing(true));
  }, [slug]);
  if (missing) return <PageTransition><NotFoundPage project/></PageTransition>;
  if (!project) return <main className="case-loading"><span>Loading project</span></main>;
  const message = `${settings.whatsapp_message}\n\nI am interested in a project like ${project.title}.`;
  return <PageTransition><Seo title={project.title} description={project.description} image={project.image_url}/><main className="case-page">
    <header className="case-header page-shell">
      <Link className="case-back" to="/portfolio" data-testid="case-back"><ArrowLeft size={15}/> Back to portfolio</Link>
      <div className="case-eyebrow"><span>{project.category}</span><span>{project.year}</span></div>
      <h1 aria-label={project.title}>{project.title}</h1>
      <p>{project.description}</p>
      <div className="stack-row">{project.stack.split(",").map((item) => <span key={item} data-testid={`stack-${slugify(item.trim())}`}>{item.trim()}</span>)}</div>
      <div className="case-actions"><a className="button button-ghost" href={project.live_url} target="_blank" rel="noreferrer" data-testid="case-live">Visit live site <ExternalLink size={15}/></a><a className="button button-primary" href={buildWhatsAppUrl(settings.whatsapp_number, message)} target="_blank" rel="noreferrer" data-testid="case-whatsapp" data-cursor="CHAT"><MessageCircle size={15}/> Start a project like this</a></div>
    </header>
    <div className="case-cover"><img src={project.image_url} alt={`${project.title} hero view`} /></div>
    <section className="build-story page-shell"><div><span className="eyebrow">THE BUILD STORY</span></div><div>{project.story.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>
    <ProjectGallery images={project.gallery} title={project.title}/>
    <div className="page-shell"><ProjectNavigation projects={projects} current={project}/></div>
  </main></PageTransition>;
}
