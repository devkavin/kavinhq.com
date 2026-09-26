import React from "react";
import { composeWhatsAppMessage } from "../../lib/whatsapp";

export default function WhatsAppPreview({ opening, form }) {
  return <div className="preview-phone glass"><div className="preview-header"><span>K</span><div><b>KAVINHQ</b><small>online</small></div></div><div className="preview-chat"><div className="whatsapp-bubble" data-testid="whatsapp-preview">{composeWhatsAppMessage(opening, form)}</div><small className="delivered">Delivered</small></div></div>;
}
