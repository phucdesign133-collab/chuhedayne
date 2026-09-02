import React, { useState, useEffect } from "react";
import "../css/Tab.css";
import { supabase } from "../components/utils/supabaseClient";
import IconTools from "../components/icon/iconTools";
import CalculatorLogin from "../components/CalculatorLogin"; // Đảm bảo đường dẫn import đúng nơi anh đặt file

export default function Tools({ selectedFilter, isPopupOpen, setIsPopupOpen, onAdminLogin }) {
  // State điều khiển hiển thị màn hình máy tính
  const [showCalculator, setShowCalculator] = useState(false);

  // Khi nhập đúng mã PIN trên máy tính
  const handleLoginSuccess = () => {
    setShowCalculator(false);
    if (onAdminLogin) onAdminLogin(); // Kích hoạt chuyển sang chế độ Admin ở cấp App
  };

  return (
    <div className="tools-wrapper" style={{ padding: "16px" }}>
      {/* Component cụm icon dịch vụ, truyền hàm mở máy tính vào */}
      <IconTools onOpenCalculator={() => setShowCalculator(true)} />

      {/* Hiển thị màn hình máy tính đăng nhập khi được kích hoạt */}
      {showCalculator && <CalculatorLogin onLoginSuccess={handleLoginSuccess} onClose={() => setShowCalculator(false)} />}
    </div>
  );
}
