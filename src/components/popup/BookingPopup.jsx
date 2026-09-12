import React, { useEffect, useState } from "react";

export default function BookingPopup({ onClose, onSave, initialData = null }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [amount, setAmount] = useState("");
  const [staffNote, setStaffNote] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDate("");
    setTimeSlot("");
    setAmount("");
    setStaffNote("");
  };

  // ============================================================
  // FORMAT DATE INPUT
  //
  // 05092026
  // → 05/09/2026
  //
  // Không dùng Date object.
  // ============================================================

  const formatDateInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  // ============================================================
  // DB DATE → UI DATE
  //
  // DB:
  // 2026-09-05
  //
  // UI:
  // 05/09/2026
  //
  // Không dùng new Date()
  // ============================================================

  const dateToDisplay = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (raw.includes("/")) {
      return formatDateInput(raw);
    }

    const parts = raw.slice(0, 10).split("-");

    if (parts.length !== 3) {
      return raw;
    }

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // LOAD DATA
  //
  // THÊM MỚI:
  // → tất cả trống
  //
  // SỬA:
  // → lấy đúng dữ liệu hiện tại
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      resetForm();
      return;
    }

    setTitle(initialData.title || "");
    setCategory(initialData.category || "");

    // DB YYYY-MM-DD
    // → UI DD/MM/YYYY
    setDate(dateToDisplay(initialData.date));

    setTimeSlot(
      String(initialData.time_slot || "")
        .replace(/\D/g, "")
        .slice(0, 8),
    );

    setAmount(initialData.amount !== null && initialData.amount !== undefined ? String(initialData.amount) : "");

    setStaffNote(initialData.staff_note || "");
  }, [initialData]);

  // ============================================================
  // UI DATE → DB DATE
  //
  // 05/09/2026
  // → 2026-09-05
  // ============================================================

  const dateToDatabase = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (digits.length !== 8) {
      return "";
    }

    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // FORMAT TIME
  //
  // 1800
  // → 18:00
  //
  // 13001500
  // → 13:00 - 15:00
  // ============================================================

  const formatTimeInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4, 6)}:${digits.slice(6, 8)}`;
  };

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoneyInput = (value) => {
    return String(value ?? "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getRawMoney = (value) => {
    return String(value ?? "").replace(/\D/g, "");
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    const databaseDate = dateToDatabase(date);

    // Ngày vẫn bắt buộc vì DB bookings.date đang NOT NULL.
    if (!databaseDate) {
      alert("Vui lòng nhập ngày theo dạng DD/MM/YYYY.");
      return;
    }

    if (typeof onSave !== "function") {
      alert("Không thể lưu Booking.");
      return;
    }

    const formData = {
      id: initialData?.id || null,

      title: title.trim(),

      category: category.trim(),

      date: databaseDate,

      time_slot: timeSlot.trim(),

      amount: amount !== "" ? Number(getRawMoney(amount)) || 0 : 0,

      staff_note: staffNote.trim() || null,
    };

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu Booking.");
      }

      onClose();
    } catch (error) {
      console.error("❌ BookingPopup save error:", error);

      alert(`Không thể lưu Booking:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  //
  // Popup.jsx bên ngoài quản lý khung Popup.
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      {/* ========================================================
          ĐỊA ĐIỂM
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Địa điểm</label>

        <input className="popup-input" placeholder="Địa điểm" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} />
      </div>

      {/* ========================================================
          CÔNG VIỆC
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Công việc</label>

        <input className="popup-input" placeholder="Công việc" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSaving} />
      </div>

      {/* ========================================================
          NGÀY
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Ngày</label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={formatDateInput(date)}
          onChange={(e) => setDate(formatDateInput(e.target.value))}
          disabled={isSaving}
        />
      </div>

      {/* ========================================================
          KHUNG GIỜ
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Khung giờ</label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="1800 hoặc 13001500"
          value={formatTimeInput(timeSlot)}
          onChange={(e) => setTimeSlot(e.target.value.replace(/\D/g, "").slice(0, 8))}
          disabled={isSaving}
        />
      </div>

      {/* ========================================================
          THỰC NHẬN
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Thực nhận</label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Thực nhận"
          value={formatMoneyInput(amount)}
          onChange={(e) => setAmount(getRawMoney(e.target.value))}
          disabled={isSaving}
        />
      </div>

      {/* ========================================================
          NHÂN SỰ CÒN LẠI
      ======================================================== */}

      <div className="popup-row">
        <label className="popup-label">Nhân sự còn lại</label>

        <div className="popup-inline">
          {["Hết", "Ít", "Nhiều"].map((option) => (
            <label className="popup-checkbox" key={option}>
              <input
                type="radio"
                name="booking-staff-note"
                value={option}
                checked={staffNote === option}
                onChange={(e) => setStaffNote(e.target.value)}
                disabled={isSaving}
              />

              {option}
            </label>
          ))}
        </div>
      </div>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
