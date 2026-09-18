// src/App.jsx

import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

import Footer from "./components/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Tools from "./pages/Tools";
import LuckySpin from "./pages/LuckySpin";
import Detail from "./components/Detail";

import FooterAdmin from "./components/FooterAdmin";
import HubIcon from "./components/HubIcon";
import Grid from "./components/Grid";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isGridPage = /^\/admin\/[^/]+\/(?:[^/]+)(?:\/[^/]+)?$/.test(location.pathname);

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
    <div className="app-container">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/tools" element={<Tools isAuthenticated={isAuthenticated} onAdminLogin={handleAdminLoginSuccess} />} />
          <Route path="/spin" element={<LuckySpin />} />
          <Route path="/post/:slug" element={<Detail />} />

          <Route path="/admin/content" element={isAuthenticated ? <HubIcon currentTab="content" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/booking" element={isAuthenticated ? <HubIcon currentTab="booking" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/warehouse" element={isAuthenticated ? <HubIcon currentTab="warehouse" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/finance" element={isAuthenticated ? <HubIcon currentTab="finance" /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/tools" element={isAuthenticated ? <HubIcon currentTab="tools" /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/content/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/booking/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/warehouse/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route
            path="/admin/finance/bills/gift-orders"
            element={isAuthenticated ? <Grid categoryIdOverride="bills/gift-orders" /> : <Navigate to="/tools" replace />}
          />

          <Route path="/admin/finance/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />
          <Route path="/admin/tools/:categoryId" element={isAuthenticated ? <Grid isAdmin={true} /> : <Navigate to="/tools" replace />} />

          <Route path="/admin/posts/:id" element={isAuthenticated ? <Detail /> : <Navigate to="/tools" replace />} />
        </Routes>
      </div>

      {!isGridPage && (isAuthenticated ? <FooterAdmin onLogout={handleAdminLogout} /> : <Footer />)}
    </div>
  );
}
