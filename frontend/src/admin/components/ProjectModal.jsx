import React, { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { formToPayload, projectToForm } from "../lib/projectForm";

const categories = ["Landing Pages", "E-Commerce", "Business Sites", "Custom Apps & Fixing", "Templates & Custom", "Hosting & Infrastructure"];

export default function ProjectModal({ project, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => projectToForm(project));
  useEffect(() => { const key = (event) => event.key === "Escape" && onClose(); document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, [onClose]);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  return <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal glass" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
    <header><div><span>{project ? "EDIT PROJECT" : "NEW PROJECT"}</span><h2 id="project-modal-title">{project ? project.title : "Add a portfolio project"}</h2></div><button onClick={onClose} aria-label="Close project form" data-testid="admin-project-modal-close"><X/></button></header>
    <form onSubmit={(event) => { event.preventDefault(); onSave(formToPayload(form)); }}>
      <div className="field-grid"><div className="field"><label htmlFor="project-title">Title</label><input id="project-title" value={form.title} onChange={update("title")} required/></div><div className="field"><label htmlFor="project-slug">Slug</label><input id="project-slug" value={form.slug} onChange={update("slug")} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required/></div></div>
      <div className="field-grid"><div className="field"><label htmlFor="project-category">Category</label><input id="project-category" list="project-categories" value={form.category} onChange={update("category")} required/><datalist id="project-categories">{categories.map((item) => <option key={item} value={item}/>)}</datalist></div><div className="field"><label htmlFor="project-year">Year</label><input id="project-year" type="number" min="2000" max="2100" value={form.year} onChange={update("year")} required/></div></div>
      <div className="field"><label htmlFor="project-description">Description</label><textarea id="project-description" rows="3" value={form.description} onChange={update("description")} required/></div>
      <div className="field"><label htmlFor="project-image">Image URL</label><input id="project-image" type="url" value={form.image_url} onChange={update("image_url")} required/>{form.image_url && <img className="admin-image-preview" src={form.image_url} alt="Project preview" onError={(event) => { event.currentTarget.hidden = true; }}/>}</div>
      <div className="field"><label htmlFor="project-live">Live URL</label><input id="project-live" type="url" value={form.live_url} onChange={update("live_url")} required/></div>
      <div className="field-grid"><div className="field"><label htmlFor="project-stack">Stack</label><input id="project-stack" value={form.stack} onChange={update("stack")} placeholder="React, FastAPI, Docker"/></div><div className="field"><label htmlFor="project-order">Sort order</label><input id="project-order" type="number" value={form.sort_order} onChange={update("sort_order")}/></div></div>
      <div className="field"><label htmlFor="project-gallery">Gallery URLs</label><textarea id="project-gallery" rows="4" value={form.gallery} onChange={update("gallery")} placeholder="One URL per line"/></div>
      <div className="field"><label htmlFor="project-story">Build story</label><textarea id="project-story" rows="7" value={form.story} onChange={update("story")} placeholder="Separate paragraphs with a blank line"/></div>
      <label className="checkbox-field"><input type="checkbox" checked={form.featured} onChange={update("featured")}/><span>Feature this project on the home page</span></label>
      <footer><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={saving} data-testid="admin-project-save"><Save size={15}/> {saving ? "Saving" : "Save project"}</button></footer>
    </form>
  </section></div>;
}
