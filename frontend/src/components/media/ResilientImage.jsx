import React, { useEffect, useState } from "react";

export default function ResilientImage({ alt, fallback = "Preview unavailable", className = "", ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [props.src]);
  if (failed) return <div className={`image-fallback ${className}`.trim()} role="img" aria-label={`${alt}. ${fallback}`}>{fallback}</div>;
  return <img className={className} alt={alt} {...props} onError={() => setFailed(true)} />;
}
