import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const fallback = { whatsapp_number: "15550192834", whatsapp_message: "Hello KAVINHQ! I checked out your portfolio and would like to discuss a project with you." };
const SettingsContext = createContext(fallback);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(fallback);
  useEffect(() => { apiRequest("/api/settings").then(setSettings).catch(() => {}); }, []);
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
