import React from "react";
import { Helmet } from "react-helmet-async";

export default function Seo({ title, description, image = "/og-image.jpg", noindex = false }) {
  const fullTitle = title === "KAVINHQ" ? title : `${title} | KAVINHQ`;
  const imageUrl = typeof window === "undefined" ? image : new URL(image, window.location.origin).href;
  return <Helmet>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
  </Helmet>;
}
