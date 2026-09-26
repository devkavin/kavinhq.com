import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Only verify the session when on admin routes — public visitors are never authenticated.
    const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    if (!isAdmin) { setLoading(false); return; }
    apiRequest("/api/auth/me", {}, true).then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  const login = async (credentials) => { const next = await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }); setUser(next); return next; };
  const logout = async () => { await apiRequest("/api/auth/logout", { method: "POST" }); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
