import React, { useState } from "react";
import { Send } from "lucide-react";
import { buildWhatsAppUrl, composeWhatsAppMessage } from "../../lib/whatsapp";

const initial = { name: "", projectType: "", budget: "", brief: "" };

export default function ContactForm({ settings, form, setForm }) {
  const [error, setError] = useState("");
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.brief.trim()) { setError("Tell me your name and a little about the project."); return; }
    setError("");
    window.open(buildWhatsAppUrl(settings.whatsapp_number, composeWhatsAppMessage(settings.whatsapp_message, form)), "_blank", "noopener,noreferrer");
  };
  return <form className="contact-form glass" onSubmit={submit} data-testid="contact-form" noValidate>
    <div className="field"><label htmlFor="contact-name">Your name</label><input id="contact-name" value={form.name} onChange={update("name")} placeholder="What should I call you?" required data-testid="contact-name"/></div>
    <div className="field-grid"><div className="field"><label htmlFor="contact-type">Project type</label><select id="contact-type" value={form.projectType} onChange={update("projectType")} data-testid="contact-project-type"><option value="">Choose one</option><option>Landing Page</option><option>E-Commerce</option><option>Business Site</option><option>Custom App</option><option>Website Fix</option></select></div><div className="field"><label htmlFor="contact-budget">Budget</label><select id="contact-budget" value={form.budget} onChange={update("budget")} data-testid="contact-budget"><option value="">Choose a range</option><option>Under $2k</option><option>$2k to $5k</option><option>$5k to $10k</option><option>$10k and above</option></select></div></div>
    <div className="field"><label htmlFor="contact-brief">Project brief</label><textarea id="contact-brief" rows="6" value={form.brief} onChange={update("brief")} placeholder="What are you building, and what needs to change?" required data-testid="contact-brief"/></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" data-testid="contact-submit" data-cursor="CHAT">Continue on WhatsApp <Send size={15}/></button>
  </form>;
}
