import React from "react";
import { Route, Routes } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AdminRoutes() {
  return <Routes><Route index element={<LoginPage/>}/><Route path="dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/></Routes>;
}
