export const emptyProjectForm = {
  title: "", slug: "", category: "", description: "", image_url: "", live_url: "", year: new Date().getFullYear().toString(), stack: "", gallery: "", story: "", featured: false, sort_order: "0",
};

export function projectToForm(project) {
  if (!project) return { ...emptyProjectForm };
  return { ...project, year: String(project.year), sort_order: String(project.sort_order), gallery: (project.gallery || []).join("\n") };
}

export function formToPayload(form) {
  return {
    title: form.title.trim(), slug: form.slug.trim(), category: form.category.trim(), description: form.description.trim(), image_url: form.image_url.trim(), live_url: form.live_url.trim(), year: Number(form.year), stack: form.stack.trim(), gallery: form.gallery.split(/\r?\n/).map((value) => value.trim()).filter(Boolean), story: form.story.trim(), featured: Boolean(form.featured), sort_order: Number(form.sort_order),
  };
}
