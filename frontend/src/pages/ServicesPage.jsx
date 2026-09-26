import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";
import Reveal from "../components/motion/Reveal";
import SpotlightCard from "../components/motion/SpotlightCard";
import { services } from "../data/services";

export default function ServicesPage() {
  return <PageTransition><Seo title="Services" description="Landing pages, stores, business sites, custom applications, design, fixes and managed hosting from KAVINHQ."/><main className="services-page page-shell">
    <header className="page-hero"><span className="eyebrow">SERVICES</span><h1 aria-label="EVERYTHING YOUR SITE NEEDS. ONE ROOF.">EVERYTHING YOUR SITE<br/>NEEDS. <span className="text-gradient">ONE ROOF.</span></h1><p>From the first structure to the production server, one person stays responsible for the quality of the whole thing.</p></header>
    <section className="service-detail-grid">{services.map((service, index) => { const Icon = service.icon; return <Reveal key={service.title}><SpotlightCard className="service-detail" data-testid={`service-detail-${index + 1}`}><div><span>0{index + 1}</span><Icon/></div><h2>{service.title}</h2><p>{service.description} Every engagement is scoped around the outcome you need, with a clear path from decision to delivery.</p><Link to="/contact" data-testid={`service-enquire-${index + 1}`}>Discuss this service <ArrowRight size={15}/></Link></SpotlightCard></Reveal>; })}</section>
    <section className="service-closing glass"><div><span className="eyebrow">A GOOD PLACE TO START</span><h2>NOT SURE WHICH ONE YOU NEED?</h2><p>Tell me what is not working, what you want to launch, or what needs to feel better. I will help you define the right scope.</p></div><Link className="button button-primary" to="/contact" data-testid="services-contact"><MessageCircle size={15}/> Talk through the project</Link></section>
  </main></PageTransition>;
}
