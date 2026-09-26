import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Seo from "../components/layout/Seo";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import AdminHeader from "./components/AdminHeader";
import ProjectModal from "./components/ProjectModal";
import ProjectTable from "./components/ProjectTable";
import SettingsPanel from "./components/SettingsPanel";

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("projects");
  const [health, setHealth] = useState(null);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState({ whatsapp_number: "", whatsapp_message: "" });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const [healthData, projectData, settingData] = await Promise.all([apiRequest("/api/health"), apiRequest("/api/projects"), apiRequest("/api/settings")]);
    setHealth(healthData); setProjects(projectData); setSettings(settingData);
  }, []);
  useEffect(() => { load().catch((reason) => toast.error(reason.message)); }, [load]);
  const saveProject = async (payload) => {
    setSaving(true);
    try { await apiRequest(modal?.id ? `/api/projects/${modal.id}` : "/api/projects", { method: modal?.id ? "PUT" : "POST", body: JSON.stringify(payload) }, true); toast.success(modal?.id ? "Project updated" : "Project added"); setModal(null); setProjects(await apiRequest("/api/projects")); }
    catch (reason) { toast.error(reason.message); }
    finally { setSaving(false); }
  };
  const removeProject = async (project) => { try { await apiRequest(`/api/projects/${project.id}`, { method: "DELETE" }, true); setProjects((current) => current.filter((item) => item.id !== project.id)); toast.success("Project deleted"); } catch (reason) { toast.error(reason.message); } };
  const saveSettings = async (payload) => { setSaving(true); try { const next = await apiRequest("/api/settings", { method: "PUT", body: JSON.stringify(payload) }, true); setSettings(next); toast.success("WhatsApp settings saved"); } catch (reason) { toast.error(reason.message); } finally { setSaving(false); } };
  const signOut = async () => { await logout(); navigate("/admin", { replace: true }); };
  return <main className="admin-dashboard"><Seo title="Admin Dashboard" description="Manage KAVINHQ projects and settings." noindex/><AdminHeader health={health} onLogout={signOut}/><div className="admin-content"><div className="admin-tabs" role="tablist"><button className={tab === "projects" ? "active" : ""} onClick={() => setTab("projects")} data-testid="admin-tab-projects">Projects</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")} data-testid="admin-tab-settings">Settings</button></div>{tab === "projects" ? <section><div className="admin-section-heading"><div><span>PORTFOLIO</span><h1>Manage projects</h1></div><button className="button button-primary" onClick={() => setModal({})} data-testid="admin-add-project"><Plus size={15}/> Add project</button></div><ProjectTable projects={projects} onEdit={setModal} onDelete={removeProject}/></section> : <section><div className="admin-section-heading"><div><span>CONTACT</span><h1>WhatsApp settings</h1></div></div><SettingsPanel settings={settings} onSave={saveSettings} saving={saving}/></section>}</div>{modal && <ProjectModal project={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveProject} saving={saving}/>}</main>;
}
