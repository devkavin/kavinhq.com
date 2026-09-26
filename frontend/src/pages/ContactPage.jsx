import React, { useState } from "react";
import { Clock3, MessageCircle } from "lucide-react";
import ContactForm from "../components/contact/ContactForm";
import WhatsAppPreview from "../components/contact/WhatsAppPreview";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";
import { useSettings } from "../context/SettingsContext";
import { buildWhatsAppUrl } from "../lib/whatsapp";

export default function ContactPage() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", projectType: "", budget: "", brief: "" });
  return <PageTransition><Seo title="Contact" description="Tell KAVINHQ what you want to build and continue the conversation on WhatsApp."/><main className="contact-page page-shell">
    <header className="page-hero contact-heading"><span className="eyebrow">START A PROJECT</span><h1 aria-label="LET'S BUILD YOURS.">LET'S BUILD<br/><span className="text-gradient">YOURS.</span></h1><p>A few useful details are enough to begin. Your message stays with you until WhatsApp opens.</p></header>
    <section className="contact-layout"><ContactForm settings={settings} form={form} setForm={setForm}/><aside className="contact-aside">
      <a className="direct-whatsapp glass" href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noreferrer" data-testid="contact-direct-whatsapp" data-cursor="CHAT"><MessageCircle/><div><span>Prefer a direct message?</span><b>Open WhatsApp</b></div></a>
      <WhatsAppPreview opening={settings.whatsapp_message} form={form}/>
      <div className="availability-card glass"><Clock3/><div><span>Current availability</span><b>Taking on new projects</b><p>Typical reply within one business day.</p></div></div>
    </aside></section>
  </main></PageTransition>;
}
