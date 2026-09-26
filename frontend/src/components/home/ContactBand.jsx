import React from "react";
import { MessageCircle } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import MagneticButton from "../motion/MagneticButton";

export default function ContactBand() {
  const settings = useSettings();
  return <section className="contact-band"><p>HAVE A PROJECT IN MIND?</p><h2>LET'S MAKE IT<br/><span className="text-gradient">IMPOSSIBLE TO IGNORE.</span></h2><MagneticButton><a className="button button-primary" href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noreferrer" data-testid="home-contact-whatsapp" data-cursor="CHAT"><MessageCircle size={17}/> Let's talk on WhatsApp</a></MagneticButton></section>;
}
