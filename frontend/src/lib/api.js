import { normalizeApiError } from "./errors";

export const API_BASE = import.meta.env.VITE_API_BASE || "";

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); }
  catch { throw new Error("The server returned an unreadable response."); }
}

export async function apiRequest(path, options = {}, allowRefresh = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (response.status === 401 && allowRefresh && path !== "/api/auth/refresh") {
    const refresh = await fetch(`${API_BASE}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (refresh.ok) return apiRequest(path, options, false);
  }
  const body = await parseResponse(response);
  if (!response.ok) throw new Error(normalizeApiError(body));
  return body;
}
