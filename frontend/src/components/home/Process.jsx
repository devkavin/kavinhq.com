import React from "react";
import Reveal from "../motion/Reveal";
import ScrambleLabel from "../motion/ScrambleLabel";

const steps = [
  ["01", "Discover", "We define the audience, the decision your site must support, and what success looks like."],
  ["02", "Design", "I shape the structure, type, rhythm, and interactions into a clear visual direction."],
  ["03", "Build", "The approved direction becomes a fast, accessible, responsive production build."],
  ["04", "Launch & Host", "I deploy, test, connect the essentials, and keep the site in good hands."],
];

export default function Process() {
  return <section className="section process-section"><div className="section-heading"><ScrambleLabel text="03 / THE PROCESS"/><h2>Clear steps. No mystery.</h2></div><div className="process-grid">{steps.map(([number, title, text], index) => <Reveal key={number} className="process-step"><article data-testid={`process-step-${index + 1}`}><span>{number}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div></section>;
}
