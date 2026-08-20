import React, { useState, useEffect } from "react";
import "../css/Tab.css";
import { supabase } from "../components/utils/supabaseClient";
import IconTools from "../components/icon/iconTools";
import CalculatorLogin from "../components/CalculatorLogin"; // Đảm bảo đường dẫn import đúng nơi anh đặt file

const getCurrentDateFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getCurrentDayOfWeek = () => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return days[new Date().getDay()];
};

export default function Tools({ selectedFilter, isPopupOpen, setIsPopupOpen, onAdminLogin }) {
  const [selectedDate, setSelectedDate] = useState(getCurrentDateFormatted());
  const [totalBalanceData, setTotalBalanceData] = useState([]);
  
  // State điều khiển hiển thị màn hình máy tính
  const [showCalculator, setShowCalculator] = useState(false);

  const fetchFinanceData = async () => {
    try {
      const { data, error } = await supabase.from('finance_tables').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const balances = data.find(item => item.id === 'total_balance_data')?.content || [{
          dayOfWeek: getCurrentDayOfWeek(),
          date: getCurrentDateFormatted(),
          summe: 43375199,
          bilanz: 0,
          details: { techKonto: 37225655, vibKonto: 150000, tpKonto: 479, vpKonto: 0, grabKonto: 330783, kassenfrisch: 3736000, dasBargeld: 1771000, eWallet: 124007 }
        }];
        setTotalBalanceData(balances);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Finance:", err);
    }
  };

  useEffect(() => {
    fetchFinanceData();

    const handleRealtimeChange = () => fetchFinanceData();
    window.addEventListener('supabase-data-changed', handleRealtimeChange);

    const channel = supabase
      .channel('public:finance_tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_tables' }, () => {
        fetchFinanceData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('supabase-data-changed', handleRealtimeChange);
      supabase.removeChannel(channel);
    };
  }, []);

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
      {showCalculator && (
        <CalculatorLogin 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowCalculator(false)} 
        />
      )}

      {/* Phần giữ chỗ cho tính năng tổng số dư sau này */}
      {/* 
      {selectedFilter === "tong-so-du" && (
        <>
          <TotalBalanceGrid rawData={totalBalanceData} />
          <TotalBalancePopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onSave={() => {}} currentDate={selectedDate} lastSavedData={null} />
        </>
      )} 
      */}
    </div>
  );
}