import React, { useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import ResilientImage from "../../components/media/ResilientImage";

export default function ProjectTable({ projects, onEdit, onDelete }) {
  const [armed, setArmed] = useState(null);
  return <div className="admin-project-list">{projects.length ? projects.map((project) => <article className="admin-project-row glass" key={project.id}>
    <ResilientImage src={project.image_url} alt=""/><div className="admin-project-info"><div><h3>{project.title}</h3>{project.featured && <span>Featured</span>}</div><p>{project.category} / {project.year} / Order {project.sort_order}</p></div>
    <div className="admin-row-actions"><button onClick={() => onEdit(project)} data-testid={`admin-edit-${project.slug}`}><Edit3 size={15}/> Edit</button><button className={armed === project.id ? "danger armed" : "danger"} onClick={() => { if (armed === project.id) { onDelete(project); setArmed(null); } else setArmed(project.id); }} data-testid={`admin-delete-${project.slug}`}><Trash2 size={15}/> {armed === project.id ? "Confirm delete" : "Delete"}</button></div>
  </article>) : <div className="admin-empty">No projects yet.</div>}</div>;
}
