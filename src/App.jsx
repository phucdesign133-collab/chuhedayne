import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { supabase } from "./components/utils/supabaseClient"; 
import "./App.css";

// Components
import Footer from "./components/Footer"; // Footer cố định 5 tab user
import FooterAdmin from "./components/FooterAdmin"; // Footer 3 tab quản trị Admin

//Tabs
import Home from "./pages/Home";
import Tools from "./pages/Tools";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();

  // State quản lý trạng thái đăng nhập ẩn qua máy tính (Tab Tools / Admin)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- LẮNG NGHE REALTIME CHO TOÀN BỘ APP ---
  useEffect(() => {
    const channel = supabase
      .channel('global-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
        },
        (payload) => {
          console.log('Phát hiện thay đổi dữ liệu từ thiết bị khác:', payload);
          window.dispatchEvent(new CustomEvent('supabase-data-changed', { detail: payload }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Xử lý loại bỏ rác fbclid trên URL nếu có
  useEffect(() => {
    if (window.location.search.includes("fbclid")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("fbclid");
      window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      <ScrollToTop />

      {/* 1. Safe Area Spacer: Thanh trạng thái giả lập mobile */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '32px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#2C3E50',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <span>09:41</span>
        <div 
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '8px',
            width: '64px',
            height: '12px',
            backgroundColor: '#000000',
            borderRadius: '6px'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* 2. Main Content Area */}
      <div className="flex-1 pb-24 p-4 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route 
            path="/tools" 
            element={
              <Tools 
                isAuthenticated={isAuthenticated} 
                onAdminLogin={() => setIsAuthenticated(true)} 
              />
            } 
          />
        </Routes>
      </div>

      {/* 3. Footer Động: Chuyển đổi giữa Footer User và Footer Admin */}
      {isAuthenticated ? (
        <FooterAdmin />
      ) : (
        <Footer />
      )}
    </div>
  );
}

export default App;