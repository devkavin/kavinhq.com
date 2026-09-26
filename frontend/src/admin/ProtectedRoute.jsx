import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="admin-loading">Checking your session</main>;
  if (!user) return <Navigate to="/admin" replace/>;
  if (user.role !== "admin") return <main className="not-found"><span>403</span><h1>ACCESS DENIED</h1><p>This account does not have administrator access.</p></main>;
  return children;
}
