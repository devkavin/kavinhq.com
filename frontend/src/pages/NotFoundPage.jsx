import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/layout/Seo";

export default function NotFoundPage({ project = false }) {
  return <main className="not-found"><Seo title="Not Found" description="The requested KAVINHQ page could not be found." noindex/><span>404</span><h1>{project ? "PROJECT NOT FOUND" : "PAGE NOT FOUND"}</h1><p>The address may have changed, or the project may no longer be public.</p><Link className="button button-primary" to={project ? "/portfolio" : "/"} data-testid="not-found-back"><ArrowLeft size={16}/> {project ? "Back to portfolio" : "Back home"}</Link></main>;
}
