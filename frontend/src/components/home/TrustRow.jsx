import React from "react";
import { Check } from "lucide-react";

const items = ["Speed obsessed", "SEO built in", "You own everything"];
export default function TrustRow() { return <div className="trust-row">{items.map((item, index) => <div key={item} data-testid={`trust-item-${index + 1}`}><Check size={16}/><span>{item}</span></div>)}</div>; }
