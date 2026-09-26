import React from "react";
import Reveal from "../motion/Reveal";

export default function ProjectGallery({ images, title }) {
  return <div className="case-gallery">{images.map((image, index) => <Reveal key={image} className={`gallery-item gallery-span-${index % 3}`}><div data-testid={`gallery-image-${index + 1}`}><img src={image} alt={`${title} detail ${index + 1}`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement.classList.add("is-broken"); }}/></div></Reveal>)}</div>;
}
