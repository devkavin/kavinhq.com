import React from "react";
import { services } from "../../data/services";
import Reveal from "../motion/Reveal";
import ScrambleLabel from "../motion/ScrambleLabel";
import SpotlightCard from "../motion/SpotlightCard";

export default function ServicesBento() {
  return <section className="section services-section"><div className="section-heading"><ScrambleLabel text="02 / WHAT I DO"/><h2>One partner from first idea to <span className="text-gradient">launch.</span></h2></div>
    <div className="services-bento">{services.map((service, index) => { const Icon = service.icon; return <Reveal key={service.title} className={service.span}><SpotlightCard className="service-card" data-testid={`service-card-${index + 1}`}><div className="service-top"><Icon/><span>0{index + 1}</span></div><h3>{service.title}</h3><p>{service.description}</p></SpotlightCard></Reveal>; })}</div>
  </section>;
}
