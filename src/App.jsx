// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import "./App.css";

// ==============================
// USER
// ==============================
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Tools from "./pages/Tools";
import LuckySpin from "./pages/LuckySpin";
import Detail from "./components/Detail";

// ==============================
// ADMIN
// ==============================
import FooterAdmin from "./components/FooterAdmin";
import HubIcon from "./components/HubIcon";
import Grid from "./components/Grid";

export default function App() {
  const navigate = useNavigate();

  // ==============================
  // ADMIN AUTH
  // ==============================
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAdminLoggedIn") === "true";
  });

  const handleAdminLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAdminLoggedIn", "true");
    navigate("/admin/content");
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/tools");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      <div className="flex-1 pb-24 p-4 overflow-y-auto">
        <Routes>
          {/* ========================================
              USER ROUTES
          ======================================== */}

          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<Home />} />

          <Route path="/tools" element={<Tools isAuthenticated={isAuthenticated} onAdminLogin={handleAdminLoginSuccess} />} />

          <Route path="/spin" element={<LuckySpin />} />

          <Route path="/posts/:id" element={<Detail />} />

          {/* ========================================
              ADMIN HUB
              5 TAB FOOTER
          ======================================== */}

          <Route path="/admin/content" element={isAuthenticated ? <HubIcon currentTab="content" /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/booking" element={isAuthenticated ? <HubIcon currentTab="booking" /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/warehouse" element={isAuthenticated ? <HubIcon currentTab="warehouse" /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/finance" element={isAuthenticated ? <HubIcon currentTab="finance" /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/tools" element={isAuthenticated ? <HubIcon currentTab="tools" /> : <Navigate to="/tools" replace />} />

          {/* ========================================
              ADMIN GRID
              HubIcon → Grid → Outlet
          ======================================== */}

          <Route path="/admin/content/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/booking/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/warehouse/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/finance/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/tools/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          {/* ========================================
              ADMIN DETAIL
          ======================================== */}

          <Route path="/admin/posts/:id" element={isAuthenticated ? <Detail /> : <Navigate to="/tools" replace />} />
        </Routes>
      </div>

      {/* ========================================
          FOOTER
          USER / ADMIN
      ======================================== */}

      {isAuthenticated ? <FooterAdmin onLogout={handleAdminLogout} /> : <Footer />}
    </div>
  );
}
