import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import Popup from "../components/popup/Popup";
import "../css/Manager.css";
import "../css/Tab.css";

export default function BookingManager({ savedData = null }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [activeTab, setActiveTab] = useState("first");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const value = String(dateString).slice(0, 10);
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTimeSortValue = (value) => {
    if (!value) return 0;

    const digits = String(value).replace(/\D/g, "");

    if (digits.length >= 4) {
      return Number(digits.slice(0, 4));
    }

    return 0;
  };

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

  const formatMoney = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "0 đ";
    }
    return `${number.toLocaleString("vi-VN")} đ`;
  };

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

  useEffect(() => {
    if (!savedData) return;

    setBookings((prev) => {
      const exists = prev.some((item) => item.id === savedData.id);

      if (exists) {
        return prev.map((item) => (item.id === savedData.id ? savedData : item));
      }

      return [...prev, savedData];
    });
  }, [savedData]);

  const todayKey = getTodayKey();

  const currentBookings = bookings
    .filter((item) => {
      if (!item.date) return false;
      return String(item.date).slice(0, 10) >= todayKey;
    })
    .sort((a, b) => {
      const dateA = String(a.date || "").slice(0, 10);
      const dateB = String(b.date || "").slice(0, 10);
      const dateCompare = dateA.localeCompare(dateB);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      const timeCompare = getTimeSortValue(a.time_slot) - getTimeSortValue(b.time_slot);

      if (timeCompare !== 0) {
        return timeCompare;
      }

      return Number(a.id || 0) - Number(b.id || 0);
    });

  const historyBookings = bookings
    .filter((item) => {
      if (!item.date) return true;
      return String(item.date).slice(0, 10) < todayKey;
    })
    .sort((a, b) => {
      const dateA = String(a.date || "").slice(0, 10);
      const dateB = String(b.date || "").slice(0, 10);
      const dateCompare = dateB.localeCompare(dateA);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      const timeCompare = getTimeSortValue(b.time_slot) - getTimeSortValue(a.time_slot);

      if (timeCompare !== 0) {
        return timeCompare;
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

  const handleAdd = () => {
    setEditingBooking(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setIsPopupOpen(true);
  };

  const handleDelete = async (booking) => {
    if (!booking?.id) return;

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa booking "${booking.title || "Sự kiện"}" không?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);

      if (error) throw error;

      setBookings((prev) => prev.filter((item) => item.id !== booking.id));
    } catch (error) {
      console.error("❌ Lỗi xóa Booking:", error);
      alert(`Không thể xóa Booking:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  const handleSavePopup = async (formData) => {
    try {
      const payload = {
        program: String(formData.program ?? "").trim(),
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

      if (formData.id) {
        const { data: updatedData, error } = await supabase.from("bookings").update(payload).eq("id", formData.id).select("*").single();

        if (error) throw error;

        data = updatedData;
      } else {
        const { data: insertedData, error: insertError } = await supabase.from("bookings").insert([payload]).select("*").single();

        if (insertError) throw insertError;

        if (payload.program) {
          const { data: fixedData, error: updateError } = await supabase
            .from("bookings")
            .update({ program: payload.program })
            .eq("id", insertedData.id)
            .select("*")
            .single();

          if (updateError) throw updateError;

          data = fixedData;
        } else {
          data = insertedData;
        }
      }

      setBookings((prev) => {
        const exists = prev.some((item) => item.id === data.id);

        if (exists) {
          return prev.map((item) => (item.id === data.id ? data : item));
        }

        return [...prev, data];
      });

      setIsPopupOpen(false);
      setEditingBooking(null);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Lỗi lưu Booking:", error);
      return { success: false, error };
    }
  };

  const handleTouchStart = (e) => {
    e.currentTarget.dataset.startX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, booking) => {
    const startX = Number(e.currentTarget.dataset.startX || 0);
    const endX = e.changedTouches[0].clientX;
    const distance = endX - startX;

    delete e.currentTarget.dataset.startX;

    if (distance > 85) {
      handleEdit(booking);
      return;
    }

    if (distance < -85) {
      handleDelete(booking);
    }
  };

  const renderBookingCard = (booking, index) => {
    const staffStatus = booking.staff_note || "";

    return (
      <div
        className="card booking-card"
        key={booking.id || `booking-${index}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, booking)}
      >
        <div className="info">
          <div className="row name">
            <CalendarDays size={15} />
            <strong>{formatDate(booking.date)}</strong>
          </div>

          <div className="row booking-program">
            <span>Chương trình: </span>
            <strong>{booking.program || ""}</strong>
          </div>

          <div className="row">
            <span>Công việc: </span>
            <strong>{booking.category || "Sự kiện"}</strong>
          </div>

          <div className="row">
            <span>Địa điểm: </span>
            <strong>{booking.title || ""}</strong>
          </div>

          <div className="row">
            <span>Thời gian: </span>
            <strong>{formatTimeSlot(booking.time_slot) || "Cả ngày"}</strong>
          </div>

          <div className="row">
            <span>Thực nhận: </span>
            <strong>{formatMoney(booking.amount)}</strong>
          </div>

          {staffStatus && (
            <div className="row">
              <span>Nhân sự: </span>
              <strong>{staffStatus}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  const visibleBookings = activeTab === "first" ? currentBookings : historyBookings;

  return (
    <div className="manager booking-manager">
      <div className="tabs">
        <button type="button" className={`tab ${activeTab === "first" ? "active" : ""}`} onClick={() => setActiveTab("first")}>
          SẮP DIỄN RA
        </button>

        <button type="button" className={`tab ${activeTab === "second" ? "active" : ""}`} onClick={() => setActiveTab("second")}>
          ĐÃ DIỄN RA
        </button>
      </div>

      <div className="list">
        {loading ? (
          <div className="empty">
            <span>Đang tải lịch Booking...</span>
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="empty">
            <CalendarDays size={32} />
            <span>{activeTab === "first" ? "Không có sự kiện sắp diễn ra" : "Chưa có sự kiện đã diễn ra"}</span>
          </div>
        ) : (
          visibleBookings.map((booking, index) => renderBookingCard(booking, index))
        )}
      </div>

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
