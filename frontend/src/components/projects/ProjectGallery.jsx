import React from "react";
import ResilientImage from "../media/ResilientImage";
import Reveal from "../motion/Reveal";

export default function ProjectGallery({ images, title }) {
  return <div className="case-gallery">{images.map((image, index) => <Reveal key={image} className={`gallery-item gallery-span-${index % 3}`}><div data-testid={`gallery-image-${index + 1}`}><ResilientImage src={image} alt={`${title} detail ${index + 1}`} loading="lazy"/></div></Reveal>)}</div>;
}
