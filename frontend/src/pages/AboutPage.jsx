import React from "react";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";
import Reveal from "../components/motion/Reveal";
import SpotlightCard from "../components/motion/SpotlightCard";

const stack = ["React", "Next.js", "TypeScript", "Tailwind", "FastAPI", "Node", "PostgreSQL", "Docker", "Coolify", "SEO", "Figma", "Motion"];
const principles = [
  ["Clarity before decoration", "Every layout and interaction should help someone understand, decide, or act."],
  ["Fast is part of the design", "Performance is shaped from the first sketch, not added after launch."],
  ["Built for your ownership", "You receive clean work, clear access, and a system you can take anywhere."],
];

export default function AboutPage() {
  return <PageTransition><Seo title="About" description="Meet Kavin, the designer and developer behind KAVINHQ."/><main className="about-page page-shell">
    <header className="page-hero about-hero"><span className="eyebrow">ABOUT KAVIN</span><h1 aria-label="THE PERSON BEHIND THE PIXELS">THE PERSON BEHIND<br/>THE <span className="text-gradient">PIXELS.</span></h1></header>
    <section className="about-story"><Reveal className="story-copy"><p className="lead">I help ambitious teams turn a rough idea, an underperforming site, or a complex product into a web experience people understand and remember.</p><p>My work sits between design and engineering. That means decisions stay connected from the first layout through the final deployment. There is no handoff gap, and no detail gets lost between disciplines.</p><p>I care about the quiet parts as much as the visible ones: how fast a page responds, how clearly search engines can read it, and whether the person paying for it truly owns the result.</p></Reveal>
      <Reveal className="terminal-card glass"><div className="terminal-bar"><i/><i/><i/><span>kavin@hq</span></div><div className="terminal-line"><b>$ whoami</b><p>Kavin / web designer and engineer</p></div><div className="terminal-line"><b>$ cat specialties.txt</b><p>direction, interface, frontend, backend, deployment</p></div><div className="terminal-line"><b>$ status</b><p className="terminal-live"><span/> available for the right project</p></div></Reveal>
    </section>
    <section className="stack-section"><span className="eyebrow">TOOLS I TRUST</span><div className="stack-cloud">{stack.map((item) => <span key={item} data-testid={`stack-${item.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`}><CheckCircle2 size={14}/>{item}</span>)}</div></section>
    <section className="principles"><div className="section-heading"><span className="eyebrow">HOW I WORK</span><h2>Principles that hold up.</h2></div><div className="principle-grid">{principles.map(([title, text], index) => <SpotlightCard className="principle-card" data-testid={`principle-card-${index + 1}`} key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></SpotlightCard>)}</div></section>
    <section className="about-actions"><Link className="button button-primary" to="/contact" data-testid="about-contact"><MessageCircle size={15}/> Start a project</Link><Link className="button button-ghost" to="/portfolio" data-testid="about-work">See the work <ArrowRight size={15}/></Link></section>
  </main></PageTransition>;
}
