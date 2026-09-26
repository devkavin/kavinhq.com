import React, { useRef, useState } from "react";
import { Save, X } from "lucide-react";
import useFocusTrap from "../../hooks/useFocusTrap";
import ResilientImage from "../../components/media/ResilientImage";
import { formToPayload, projectToForm } from "../lib/projectForm";

const categories = ["Landing Pages", "E-Commerce", "Business Sites", "Custom Apps & Fixing", "Templates & Custom", "Hosting & Infrastructure"];

export default function ProjectModal({ project, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => projectToForm(project));
  const backdropRef = useRef(null);
  useFocusTrap(backdropRef, onClose);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  return <div ref={backdropRef} className="admin-modal-backdrop" role="presentation"><section className="admin-modal glass" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" tabIndex={-1}>
    <header><div><span>{project ? "EDIT PROJECT" : "NEW PROJECT"}</span><h2 id="project-modal-title">{project ? project.title : "Add a portfolio project"}</h2></div><button onClick={onClose} aria-label="Close project form" data-testid="admin-project-modal-close"><X/></button></header>
    <form onSubmit={(event) => { event.preventDefault(); onSave(formToPayload(form)); }}>
      <div className="field-grid"><div className="field"><label htmlFor="project-title">Title</label><input id="project-title" data-testid="admin-project-title" value={form.title} onChange={update("title")} required/></div><div className="field"><label htmlFor="project-slug">Slug</label><input id="project-slug" data-testid="admin-project-slug" value={form.slug} onChange={update("slug")} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required/></div></div>
      <div className="field-grid"><div className="field"><label htmlFor="project-category">Category</label><input id="project-category" data-testid="admin-project-category" list="project-categories" value={form.category} onChange={update("category")} required/><datalist id="project-categories">{categories.map((item) => <option key={item} value={item}/>)}</datalist></div><div className="field"><label htmlFor="project-year">Year</label><input id="project-year" data-testid="admin-project-year" type="number" min="2000" max="2100" value={form.year} onChange={update("year")} required/></div></div>
      <div className="field"><label htmlFor="project-description">Description</label><textarea id="project-description" data-testid="admin-project-description" rows="3" value={form.description} onChange={update("description")} required/></div>
      <div className="field"><label htmlFor="project-image">Image URL</label><input id="project-image" data-testid="admin-project-image" type="url" value={form.image_url} onChange={update("image_url")} required/>{form.image_url && <ResilientImage className="admin-image-preview" src={form.image_url} alt="Project preview"/>}</div>
      <div className="field"><label htmlFor="project-live">Live URL</label><input id="project-live" data-testid="admin-project-live" type="url" value={form.live_url} onChange={update("live_url")} required/></div>
      <div className="field-grid"><div className="field"><label htmlFor="project-stack">Stack</label><input id="project-stack" data-testid="admin-project-stack" value={form.stack} onChange={update("stack")} placeholder="React, FastAPI, Docker"/></div><div className="field"><label htmlFor="project-order">Sort order</label><input id="project-order" data-testid="admin-project-order" type="number" value={form.sort_order} onChange={update("sort_order")}/></div></div>
      <div className="field"><label htmlFor="project-gallery">Gallery URLs</label><textarea id="project-gallery" data-testid="admin-project-gallery" rows="4" value={form.gallery} onChange={update("gallery")} placeholder="One URL per line"/></div>
      <div className="field"><label htmlFor="project-story">Build story</label><textarea id="project-story" data-testid="admin-project-story" rows="7" value={form.story} onChange={update("story")} placeholder="Separate paragraphs with a blank line"/></div>
      <label className="checkbox-field"><input data-testid="admin-project-featured" type="checkbox" checked={form.featured} onChange={update("featured")}/><span>Feature this project on the home page</span></label>
      <footer><button type="button" className="button button-ghost" onClick={onClose} data-testid="admin-project-cancel">Cancel</button><button className="button button-primary" type="submit" disabled={saving} data-testid="admin-project-save"><Save size={15}/> {saving ? "Saving" : "Save project"}</button></footer>
    </form>
  </section></div>;
}
