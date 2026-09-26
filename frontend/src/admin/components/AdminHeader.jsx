import React from "react";
import { ExternalLink, LogOut } from "lucide-react";
import Logo from "../../components/brand/Logo";

export default function AdminHeader({ health, onLogout }) {
  const connected = health?.database === "connected";
  return <header className="admin-header"><Logo/><div className="admin-header-actions"><span className={`health-badge ${connected ? "connected" : ""}`} data-testid="admin-db-health"><i/>{connected ? "Connected" : "Unavailable"}</span><a href="/" target="_blank" data-testid="admin-view-site">View site <ExternalLink size={14}/></a><button onClick={onLogout} data-testid="admin-logout"><LogOut size={14}/> Logout</button></div></header>;
}
