import React, { useEffect, useState } from "react";
import { Pencil, Trash2, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import Popup from "../components/popup/Popup";
import "../css/Manager.css";

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [showHistory, setShowHistory] = useState(false);

  // ============================================================
  // FORMAT NGÀY UI
  //
  // DB: YYYY-MM-DD
  // UI: DD/MM/YYYY
  //
  // Không dùng new Date("YYYY-MM-DD") để tránh lệch timezone.
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const value = String(dateString).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) return value;

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // DATE KEY
  //
  // Dùng chuỗi YYYY-MM-DD để so sánh ngày.
  // Không phụ thuộc timezone.
  // ============================================================

  const getTodayKey = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // FORMAT KHUNG GIỜ
  //
  // 1800
  // → 18:00
  //
  // 13001500
  // → 13:00 - 15:00
  //
  // Nếu DB đã lưu dạng đẹp thì giữ nguyên.
  // ============================================================

  const formatTimeSlot = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (!raw) return "";

    const digits = raw.replace(/\D/g, "");

    if (digits.length === 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    if (digits.length === 8) {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4, 6)}:${digits.slice(6, 8)}`;
    }

    return raw;
  };

  // ============================================================
  // FORMAT TIỀN
  // ============================================================

  const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0 đ";
    }

    return `${number.toLocaleString("vi-VN")} đ`;
  };

  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("bookings").select("*").order("date", { ascending: true });

      if (error) throw error;

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải Booking:", error);
      alert(`Không thể tải lịch Booking:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ============================================================
  // PHÂN LOẠI
  //
  // Hôm nay + tương lai
  // → currentBookings
  //
  // Quá khứ
  // → historyBookings
  // ============================================================

  const todayKey = getTodayKey();

  const currentBookings = bookings
    .filter((item) => {
      if (!item.date) return false;
      return String(item.date).slice(0, 10) >= todayKey;
    })
    .sort((a, b) => {
      const dateCompare = String(a.date).slice(0, 10).localeCompare(String(b.date).slice(0, 10));

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return Number(a.id || 0) - Number(b.id || 0);
    });

  const historyBookings = bookings
    .filter((item) => {
      if (!item.date) return true;
      return String(item.date).slice(0, 10) < todayKey;
    })
    .sort((a, b) => {
      const dateCompare = String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10));

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

  // ============================================================
  // ADD
  // ============================================================

  const handleAdd = () => {
    setEditingBooking(null);
    setIsPopupOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setIsPopupOpen(true);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (booking) => {
    if (!booking?.id) return;

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa booking "${booking.title || "Sự kiện"}" không?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);

      if (error) throw error;

      await fetchBookings();
    } catch (error) {
      console.error("❌ Lỗi xóa Booking:", error);

      alert(`Không thể xóa Booking:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSavePopup = async (formData) => {
    try {
      const payload = {
        title: String(formData.title || "").trim(),
        category: String(formData.category || "").trim(),
        date: formData.date || null,
        time_slot: String(formData.time_slot || "").trim(),
        staff_note: formData.staff_note || null,
        amount: formData.amount !== "" && formData.amount !== null && formData.amount !== undefined ? Number(formData.amount) || 0 : 0,
      };

      if (!payload.date) {
        throw new Error("Vui lòng nhập ngày Booking.");
      }

      let data;

      // UPDATE
      if (formData.id) {
        const { data: updatedData, error } = await supabase.from("bookings").update(payload).eq("id", formData.id).select("*").single();

        if (error) throw error;

        data = updatedData;
      }

      // INSERT
      else {
        const { data: insertedData, error } = await supabase.from("bookings").insert(payload).select("*").single();

        if (error) throw error;

        data = insertedData;
      }

      console.log("☁️ Booking lưu thành công:", data);

      await fetchBookings();

      setIsPopupOpen(false);
      setEditingBooking(null);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("❌ Lỗi lưu Booking:", error);

      return {
        success: false,
        error,
      };
    }
  };

  // ============================================================
  // RENDER CARD
  // ============================================================

  const renderBookingCard = (booking, index) => {
    const staffStatus = booking.staff_note || "";

    return (
      <div className="card" key={booking.id || `booking-${index}`}>
        <div className="info">
          {/* NGÀY */}
          <div className="row name">
            <CalendarDays size={15} />
            <strong>{formatDate(booking.date)}</strong>
          </div>

          {/* SỰ KIỆN */}
          <div className="row">
            <span>Công việc: </span>
            <strong>{booking.category || "Sự kiện"}</strong>
          </div>

          {/* ĐỊA ĐIỂM */}
          <div className="row">
            <span>Địa điểm: </span>
            <strong>{booking.title || ""}</strong>
          </div>

          {/* THỜI GIAN */}
          <div className="row">
            <span>Thời gian: </span>
            {formatTimeSlot(booking.time_slot) || "Cả ngày"}
          </div>

          {/* THỰC NHẬN */}
          <div className="row">
            <span>Thực nhận: </span>
            <strong>{formatMoney(booking.amount)}</strong>
          </div>

          {/* NHÂN SỰ */}
          {staffStatus && (
            <div className="row">
              <span>Nhân sự: </span>
              <strong>{staffStatus}</strong>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="card-footer">
          <button type="button" className="action-btn edit-btn" onClick={() => handleEdit(booking)}>
            <Pencil size={16} />
            Sửa
          </button>

          <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(booking)}>
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // BODY
  // ============================================================

  return (
    <div className="manager">
      {/* ========================================================
            DANH SÁCH
        ======================================================== */}

      <div className="list">
        {loading ? (
          <div className="empty">
            <span>Đang tải lịch Booking...</span>
          </div>
        ) : (
          <>
            {/* ==================================================
                    SỰ KIỆN SẮP DIỄN RA
                ================================================== */}

            <div className="booking-section-title">Sự kiện sắp diễn ra</div>

            {currentBookings.length === 0 ? (
              <div className="empty">
                <CalendarDays size={32} />
                <span>Không có sự kiện sắp diễn ra</span>
              </div>
            ) : (
              currentBookings.map((booking, index) => renderBookingCard(booking, index))
            )}

            {/* ==================================================
                    LỊCH SỬ
                ================================================== */}

            {historyBookings.length > 0 && (
              <>
                <button type="button" className="booking-history-toggle" onClick={() => setShowHistory((prev) => !prev)}>
                  {showHistory ? (
                    <>
                      <ChevronUp size={16} />
                      Sự kiện đã diễn ra
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Sự kiện đã diễn ra
                    </>
                  )}
                </button>

                {showHistory && <>{historyBookings.map((booking, index) => renderBookingCard(booking, index))}</>}
              </>
            )}
          </>
        )}
      </div>

      {/* ========================================================
            POPUP
        ======================================================== */}

      <Popup
        isOpen={isPopupOpen}
        onClose={() => {
          if (!loading) {
            setIsPopupOpen(false);
            setEditingBooking(null);
          }
        }}
        onSave={handleSavePopup}
        categoryId="calendar"
        initialData={editingBooking}
      />
    </div>
  );
}
