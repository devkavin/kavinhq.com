import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function SettingsPanel({ settings, onSave, saving = false }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);
  return <form className="admin-settings glass" data-testid="admin-settings-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <div className="field"><label htmlFor="admin-whatsapp">WhatsApp number</label><input id="admin-whatsapp" value={form.whatsapp_number || ""} onChange={(event) => setForm({ ...form, whatsapp_number: event.target.value })} required/><small>Use the full international number without spaces or a plus sign.</small></div>
    <div className="field"><label htmlFor="admin-message">Opening message</label><textarea id="admin-message" aria-label="Opening message" rows="7" value={form.whatsapp_message || ""} onChange={(event) => setForm({ ...form, whatsapp_message: event.target.value })} required/><small>This appears before the visitor's project details.</small></div>
    <button className="button button-primary" type="submit" disabled={saving} data-testid="admin-settings-save"><Save size={15}/> {saving ? "Saving" : "Save settings"}</button>
  </form>;
}
