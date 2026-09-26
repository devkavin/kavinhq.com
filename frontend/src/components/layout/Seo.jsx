import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export default function Seo({ title, description, image = "/og-image.jpg", noindex = false, type = "website", schema }) {
  const location = useLocation();
  const fullTitle = title === "KAVINHQ" ? "KAVINHQ | High-Performance Web Development & Engineering" : `${title} | KAVINHQ`;
  const domain = "https://www.kavinhq.com";
  const canonicalUrl = `${domain}${location.pathname === "/" ? "" : location.pathname}`;
  const imageUrl = image.startsWith("http") ? image : `${domain}${image.startsWith("/") ? "" : "/"}${image}`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "KAVINHQ",
    "url": domain,
    "logo": `${domain}/favicon.svg`,
    "image": `${domain}/og-image.jpg`,
    "description": description || "Kavin designs and engineers landing pages, e-commerce stores and custom web experiences that are fast, SEO-ready and impossible to scroll past.",
    "founder": {
      "@type": "Person",
      "name": "Kavin"
    },
    "serviceType": [
      "Web Design",
      "Web Development",
      "Landing Pages",
      "Headless E-Commerce",
      "Performance Optimization"
    ],
    "areaServed": "Worldwide"
  };

  const activeSchema = schema || defaultSchema;

  return <Helmet>
    <title>{fullTitle}</title>
    <link rel="canonical" href={canonicalUrl} />
    <meta name="description" content={description} />
    <meta property="og:site_name" content="KAVINHQ" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:type" content={type} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    {!noindex && <script type="application/ld+json">{JSON.stringify(activeSchema)}</script>}
  </Helmet>;
}
