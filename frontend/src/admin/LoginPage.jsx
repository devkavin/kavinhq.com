import React, { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/brand/Logo";
import Seo from "../components/layout/Seo";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (!loading && user) navigate("/admin/dashboard", { replace: true }); }, [loading, user, navigate]);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await login(form); navigate("/admin/dashboard", { replace: true }); }
    catch (reason) { setError(reason.message); }
    finally { setSubmitting(false); }
  };
  if (loading) return <main className="admin-loading">Checking your session</main>;
  return <main className="admin-login"><Seo title="Admin Login" description="KAVINHQ administration login." noindex/><form className="admin-login-card glass" onSubmit={submit}><Logo/><div className="admin-login-heading"><span>PRIVATE ACCESS</span><h1>Welcome back.</h1><p>Sign in to manage projects and contact settings.</p></div><div className="field"><label htmlFor="admin-email">Email</label><input id="admin-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="username" required/></div><div className="field"><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required/></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={submitting} data-testid="admin-login-submit"><LockKeyhole size={15}/>{submitting ? "Signing in" : "Sign in"}</button></form></main>;
}
