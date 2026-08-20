import React, { useState, useEffect } from "react";
import "../../css/Popup.css";
import { supabase } from "../utils/supabaseClient"; // Kết nối Supabase chung

const getCurrentDateFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function GoalPopup({ isOpen, onClose, onSave, currentDate, editingGoal, goalType }) {
  // goalType nhận vào 'short' hoặc 'long' để phân loại lưu trữ trên Supabase
  const [startDate, setStartDate] = useState(currentDate || "");
  const [endDate, setEndDate] = useState("");
  const [goalName, setGoalName] = useState("");
  const [cost, setCost] = useState("");
  const [currentSaved, setCurrentSaved] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setStartDate(editingGoal.startDate || currentDate || "");
        setEndDate(editingGoal.endDate || "");
        setGoalName(editingGoal.goalName || "");
        setCost(editingGoal.cost ? editingGoal.cost.toLocaleString("vi-VN") : "");
        setCurrentSaved(editingGoal.currentSaved ? editingGoal.currentSaved.toLocaleString("vi-VN") : "");
        setPurpose(editingGoal.purpose || "");
      } else {
        setStartDate(currentDate || "");
        setEndDate("");
        setGoalName("");
        setCost("");
        setCurrentSaved("");
        setPurpose("");
      }
    }
  }, [isOpen, currentDate, editingGoal]);

  const handleDateInput = (val, setter) => {
    const numbers = val.replace(/\D/g, "").slice(0, 8);
    let formatted = numbers;

    if (numbers.length > 4) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else if (numbers.length > 2) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }
    setter(formatted);
  };

  const calculateDurationAndDaily = () => {
    const parseDate = (str) => {
      if (!str) return null;
      const parts = str.split("/");
      if (parts.length !== 3) return null;
      const [d, m, y] = parts.map(Number);
      const dateObj = new Date(y, m - 1, d);
      return !isNaN(dateObj.getTime()) ? dateObj : null;
    };

    const startObj = parseDate(startDate);
    const endObj = parseDate(endDate);

    if (!startObj || !endObj || endObj < startObj) {
      return { totalMonths: 0, totalDays: 0, dailySaving: 0 };
    }

    const diffTime = Math.abs(endObj - startObj);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const totalMonths = (
      (endObj.getFullYear() - startObj.getFullYear()) * 12 +
      (endObj.getMonth() - startObj.getMonth()) +
      (endObj.getDate() - startObj.getDate()) / 30
    ).toFixed(1);

    const numericCost = Number(cost.replace(/\D/g, "")) || 0;
    const numericSaved = Number(currentSaved.replace(/\D/g, "")) || 0;
    
    const remainingCost = Math.max(0, numericCost - numericSaved);
    const dailySaving = totalDays > 0 ? Math.ceil(remainingCost / totalDays) : 0;

    return { totalMonths, totalDays, dailySaving };
  };

  const { totalMonths, totalDays, dailySaving } = calculateDurationAndDaily();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const numericCost = Number(cost.replace(/\D/g, "")) || 0;
    const numericSaved = Number(currentSaved.replace(/\D/g, "")) || 0;

    const goalData = {
      updatedAt: getCurrentDateFormatted(),
      startDate,
      endDate,
      goalName,
      cost: numericCost,
      currentSaved: numericSaved,
      purpose,
      totalMonths,
      totalDays,
      dailySaving,
    };

    // Xác định Key Supabase dựa vào loại mục tiêu (ngắn hay dài hạn)
    const dbKey = goalType === 'long' ? 'goals_long_data' : 'goals_short_data';

    try {
      // 1. Lấy danh sách hiện tại từ Supabase
      const { data: remoteRows } = await supabase
        .from('app_data')
        .select('*')
        .eq('key', dbKey)
        .single();

      let currentList = remoteRows && remoteRows.value && Array.isArray(remoteRows.value) ? remoteRows.value : [];

      if (editingGoal && typeof editingGoal.index === 'number') {
        // Cập nhật mục tiêu cũ tại vị trí index
        currentList[editingGoal.index] = goalData;
      } else {
        // Thêm mới mục tiêu vào danh sách
        currentList.push(goalData);
      }

      // 2. Đẩy ngược danh sách mới lên Supabase
      await supabase
        .from('app_data')
        .upsert({ key: dbKey, value: currentList });

    } catch (err) {
      console.error("Lỗi đồng bộ Supabase mục tiêu:", err);
    } finally {
      setLoading(false);
    }

    if (onSave) {
      onSave(goalData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="popup-container">
        <div className="popup-header">
          <h3>{editingGoal ? "Chỉnh sửa Mục tiêu" : "Thiết lập Mục tiêu"}</h3>
          <button type="button" className="popup-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label>Ngày bắt đầu (dd/mm/yyyy):</label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => handleDateInput(e.target.value, setStartDate)}
              placeholder="Nhập 8 số (VD: 01082026)"
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày kết thúc (dd/mm/yyyy):</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => handleDateInput(e.target.value, setEndDate)}
              placeholder="Nhập 8 số (VD: 31122026)"
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label>Tên mục tiêu:</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="VD: Mua xe, Đi du lịch..."
              required
            />
          </div>

          <div className="form-group">
            <label>Dự trù chi phí (VNĐ):</label>
            <input
              type="text"
              value={cost}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setCost(raw ? Number(raw).toLocaleString("vi-VN") : "");
              }}
              placeholder="VD: 100.000.000"
              required
            />
          </div>

          <div className="form-group">
            <label>Số tiền đã chuẩn bị / tiết kiệm được (VNĐ):</label>
            <input
              type="text"
              value={currentSaved}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setCurrentSaved(raw ? Number(raw).toLocaleString("vi-VN") : "");
              }}
              placeholder="VD: 10.000.000"
            />
          </div>

          <div className="form-group">
            <label>Mục đích:</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Nhập chi tiết mục đích..."
              rows={2}
            />
          </div>

          <div style={{ background: "var(--bg-color, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--text-color, #334155)" }}>
              ⏳ <strong>Tổng thời gian:</strong> {totalMonths} tháng ({totalDays} ngày) - 
              <span className="highlight-val" style={{ marginLeft: "5px" }}>
                {totalDays <= 365 ? "Ngắn hạn" : "Dài hạn"}
              </span>
            </p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#166534" }}>
              🐖 <strong>Bỏ heo mỗi ngày:</strong> {dailySaving.toLocaleString("vi-VN")} đ/ngày
            </p>
          </div>

          <div className="popup-footer" style={{ margin: "0 -18px -16px -18px" }}>
            <button type="submit" className="popup-submit-btn" disabled={loading}>
              {loading ? "Đang đồng bộ..." : (editingGoal ? "Lưu thay đổi" : "Thêm mới")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}