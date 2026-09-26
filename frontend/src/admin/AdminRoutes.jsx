import React from "react";
import { Route, Routes } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AdminRoutes() {
  return <Routes><Route path="/admin" element={<LoginPage/>}/><Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/></Routes>;
}
