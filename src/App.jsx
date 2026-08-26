// src/App.jsx
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { supabase } from "./components/utils/supabaseClient";
import "./App.css";

import Footer from "./components/Footer";
import FooterAdmin from "./components/FooterAdmin";

import Home from "./pages/Home";
import Tools from "./pages/Tools";

// IMPORT CÁC COMPONENT QUẢN TRỊ
import HubIcon from "./components/HubIcon";
import Grid from "./components/Grid"; 
import Detail from "./components/Detail";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

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
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tools" element={<Tools isAuthenticated={isAuthenticated} onAdminLogin={handleAdminLoginSuccess} />} />

          {/* --- ROUTE QUẢN TRỊ ADMIN --- */}
          <Route path="/admin/content" element={isAuthenticated ? <HubIcon currentTab="content" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/booking" element={isAuthenticated ? <HubIcon currentTab="booking" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/warehouse" element={isAuthenticated ? <HubIcon currentTab="warehouse" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/finance" element={isAuthenticated ? <HubIcon currentTab="finance" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/tools" element={isAuthenticated ? <HubIcon currentTab="tools" /> : <Navigate to="/tools" replace />} />

          <Route
            path="/admin/content/:categoryId"
            element={isAuthenticated ? <Grid key={location.pathname} isAdmin={true} /> : <Navigate to="/tools" replace />}
          />

          {/* Trang Chi tiết dùng chung cho cả User & Admin */}
          <Route path="/posts/:id" element={<Detail />} />
          <Route path="/admin/posts/:id" element={<Detail />} />
        </Routes>
      </div>

      {isAuthenticated ? <FooterAdmin onLogout={handleAdminLogout} /> : <Footer />}
    </div>
  );
}

export default App;