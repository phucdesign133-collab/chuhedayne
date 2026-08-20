import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { dropdownData } from "./datas/dropdownData";
import { supabase } from "./components/utils/supabaseClient"; 
import "./App.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import CalculatorLogin from "./components/CalculatorLogin";

// Pages
import Finance from "./pages/Finance";
import Goal from "./pages/Goal";
// import Client from "./pages/Client";
import Social from "./pages/Social";
// import Supplies from "./pages/Supplies";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();

  // State quản lý trạng thái đăng nhập ẩn qua máy tính (Mặc định là false - chưa đăng nhập)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/goal")) return "goal";
    if (path.includes("/client")) return "client";
    if (path.includes("/social")) return "social";
    if (path.includes("/supplies")) return "supplies";
    return "finance";
  };

  const currentTab = getCurrentTab();

  const [selectedValue, setSelectedValue] = useState(() => {
    const options = dropdownData[currentTab] || dropdownData.finance;
    return options[0]?.value || "";
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State lưu tên series đang mở trong tab Social để ẩn Header khi vào SocialList
  const [activeSocialSeries, setActiveSocialSeries] = useState(null);

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
  // ----------------------------------------------------

  // Reset activeSocialSeries mỗi khi đổi tab hoặc đổi URL
  useEffect(() => {
    setActiveSocialSeries(null);
  }, [location.pathname]);

  useEffect(() => {
    const options = dropdownData[currentTab] || dropdownData.finance;
    if (options.length > 0) {
      setSelectedValue(options[0].value);
    }
    setSearchTerm("");
  }, [location.pathname]);

  useEffect(() => {
    if (window.location.search.includes("fbclid")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("fbclid");
      window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
  }, []);

  const handleUpdateClick = () => {
    setIsPopupOpen(true);
  };

  // Nếu chưa đăng nhập, bắt buộc hiển thị màn hình máy tính đè lên toàn bộ app
  if (!isAuthenticated) {
    return <CalculatorLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <ScrollToTop />

      {!(currentTab === "social" && activeSocialSeries) && (
        <Header
          currentTab={currentTab}
          value={selectedValue}
          onChange={setSelectedValue}
          onUpdate={handleUpdateClick}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
      
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/finance" replace />} />
          <Route path="/finance" element={<Finance selectedFilter={selectedValue} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />} />
          <Route path="/goal" element={<Goal selectedFilter={selectedValue} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />} />
          {/* <Route path="/client" element={<Client selectedFilter={selectedValue} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />} /> */}
          <Route path="/social" element={<Social selectedFilter={selectedValue} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} onActiveSeriesChange={setActiveSocialSeries} />} />
          {/* <Route path="/supplies" element={<Supplies selectedFilter={selectedValue} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />} /> */}
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;