import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import Popup from "../components/popup/Popup";
import "../css/Manager.css";
import "../css/Tab.css";
import "../css/BookingManager.css";

export default function BookingManager({ searchTerm = "", savedData = null, onCountChange }) {
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
    if (digits.length >= 4) return Number(digits.slice(0, 4));
    return 0;
  };

  const formatTimeSlot = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 4) return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    if (digits.length === 8) return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4, 6)}:${digits.slice(6, 8)}`;
    return raw;
  };

  const formatMoney = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "0 đ";
    return `${number.toLocaleString("vi-VN")} đ`;
  };

  const getReceivedAmount = (booking) => {
    const bill = Number(booking?.amount || 0);
    const runner = String(booking?.runner || "").trim();
    const outS = Number(booking?.outs_price || 0);
    if (!runner || runner.toLowerCase() === "phúc") return bill;
    return bill - outS;
  };

  const normalizeName = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("vi-VN");

  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

  const normalizeContact = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase("vi-VN");

  const getHistoryItem = (booking) => ({
    id: String(booking.id),
    booking_id: booking.id,
    event_name: String(booking.program || booking.category || booking.title || "").trim(),
    event_date: formatDate(booking.date),
    order_value: Number(booking.amount || 0),
    cashback: 0,
    remaining: getReceivedAmount(booking),
    tips: 0,
    repeat: false,
  });

  const findMatchingCustomer = async (customerName, customerPhone, customerZalo) => {
    const name = normalizeName(customerName);
    const phone = normalizePhone(customerPhone);
    const zalo = normalizeContact(customerZalo);

    if (!name || (!phone && !zalo)) return null;

    const { data, error } = await supabase.from("customer").select("*");

    if (error) throw error;

    const customers = Array.isArray(data) ? data : [];

    return (
      customers.find((customer) => {
        if (normalizeName(customer.customer_name) !== name) return false;

        const existingPhone = normalizePhone(customer.phone);
        const existingZalo = normalizeContact(customer.zalo);
        const legacyContact = normalizeContact(customer.contact_value);

        const phoneMatch = phone && (existingPhone === phone || (customer.contact_type === "phone" && normalizePhone(legacyContact) === phone));

        const zaloMatch = zalo && (existingZalo === zalo || (customer.contact_type === "zalo" && legacyContact === zalo));

        return Boolean(phoneMatch || zaloMatch);
      }) || null
    );
  };

  const syncCustomerFromBooking = async (booking) => {
    const customerName = String(booking?.customer_name || "")
      .replace(/\s+/g, " ")
      .trim();

    const customerPhone = normalizePhone(booking?.customer_phone || "");
    const customerZalo = String(booking?.customer_zalo || "").trim();

    if (!customerName || (!customerPhone && !customerZalo)) {
      console.log("⚠️ Booking không đủ thông tin Customer:", {
        customer_name: booking?.customer_name,
        customer_phone: booking?.customer_phone,
        customer_zalo: booking?.customer_zalo,
      });
      return null;
    }

    const existingCustomer = await findMatchingCustomer(customerName, customerPhone, customerZalo);
    const historyItem = getHistoryItem(booking);

    if (existingCustomer) {
      const currentHistory = Array.isArray(existingCustomer.history) ? [...existingCustomer.history] : [];
      const historyIndex = currentHistory.findIndex((item) => String(item?.booking_id || item?.id || "") === String(booking.id));

      if (historyIndex >= 0) {
        currentHistory[historyIndex] = { ...currentHistory[historyIndex], ...historyItem };
      } else {
        currentHistory.push(historyItem);
      }

      const latest = [...currentHistory].sort((a, b) => {
        const parseDate = (value) => {
          const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (!match) return 0;
          const [, day, month, year] = match;
          return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
        };

        return parseDate(b.event_date) - parseDate(a.event_date);
      })[0];

      const updatePayload = {
        customer_name: customerName,
        phone: customerPhone || "",
        zalo: customerZalo || "",
        contact_type: customerPhone ? "phone" : "zalo",
        contact_value: customerPhone || customerZalo,
        history: currentHistory,
        event_name: latest?.event_name || historyItem.event_name || "",
        event_date: latest?.event_date || historyItem.event_date || "",
        order_value: Number(latest?.order_value ?? historyItem.order_value ?? 0),
        is_active: true,
      };

      const { data, error } = await supabase.from("customer").update(updatePayload).eq("id", existingCustomer.id).select("*").single();

      if (error) {
        console.error("❌ UPDATE CUSTOMER ERROR:", error);
        throw error;
      }

      return data;
    }

    const payload = {
      customer_name: customerName,
      phone: customerPhone || "",
      zalo: customerZalo || "",
      contact_type: customerPhone ? "phone" : "zalo",
      contact_value: customerPhone || customerZalo,
      address: "",
      referral_phone: "",
      referral_contact_type: "phone",
      referral_name: "",
      referral_bank: "",
      referral_account: "",
      member_tier: 0,
      member_percent: 0,
      note: "",
      history: [historyItem],
      event_name: historyItem.event_name || "",
      event_date: historyItem.event_date || "",
      order_value: Number(historyItem.order_value || 0),
      is_active: true,
    };

    const { data, error } = await supabase.from("customer").insert([payload]).select("*").single();

    if (error) {
      console.error("❌ INSERT CUSTOMER ERROR:", error);
      throw error;
    }

    return data;
  };

  const removeBookingFromPreviousCustomer = async (booking, keepCustomerId = null) => {
    const oldName = String(booking.customer_name || "").trim();
    const oldPhone = normalizePhone(booking.customer_phone);
    const oldZalo = normalizeContact(booking.customer_zalo);

    if (!oldName || (!oldPhone && !oldZalo)) return;

    const oldCustomer = await findMatchingCustomer(oldName, oldPhone, oldZalo);

    if (!oldCustomer || String(oldCustomer.id) === String(keepCustomerId || "")) return;

    const history = Array.isArray(oldCustomer.history) ? oldCustomer.history : [];
    const nextHistory = history.filter((item) => String(item.booking_id || item.id || "") !== String(booking.id));

    const latest = [...nextHistory].sort((a, b) => {
      const parseDate = (value) => {
        const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!match) return 0;
        const [, day, month, year] = match;
        return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
      };

      return parseDate(b.event_date) - parseDate(a.event_date);
    })[0];

    const updatePayload = {
      history: nextHistory,
      event_name: latest?.event_name || "",
      event_date: latest?.event_date || "",
      order_value: latest?.order_value || 0,
    };

    const { error } = await supabase.from("customer").update(updatePayload).eq("id", oldCustomer.id);

    if (error) throw error;
  };

  const removeBookingHistory = async (bookingId) => {
    if (!bookingId) return;

    const { data, error } = await supabase.from("customer").select("id, history");

    if (error) throw error;

    const customers = Array.isArray(data) ? data : [];

    const affectedCustomers = customers.filter((customer) => {
      const history = Array.isArray(customer.history) ? customer.history : [];
      return history.some((item) => String(item.booking_id || item.id || "") === String(bookingId));
    });

    for (const customer of affectedCustomers) {
      const history = Array.isArray(customer.history) ? customer.history : [];
      const nextHistory = history.filter((item) => String(item.booking_id || item.id || "") !== String(bookingId));

      const latest = [...nextHistory].sort((a, b) => {
        const parseDate = (value) => {
          const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (!match) return 0;
          const [, day, month, year] = match;
          return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
        };

        return parseDate(b.event_date) - parseDate(a.event_date);
      })[0];

      const updatePayload = {
        history: nextHistory,
        event_name: latest?.event_name || "",
        event_date: latest?.event_date || "",
        order_value: latest?.order_value || 0,
      };

      const { error: updateError } = await supabase.from("customer").update(updatePayload).eq("id", customer.id);

      if (updateError) throw updateError;
    }
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

      if (exists) return prev.map((item) => (item.id === savedData.id ? { ...item, ...savedData } : item));

      return [...prev, savedData];
    });
  }, [savedData]);

  const activeSearchTerm = searchTerm.trim().toLowerCase();
  const todayKey = getTodayKey();

  const searchedBookings = bookings.filter((item) => {
    if (!activeSearchTerm) return true;

    return [
      item.program,
      item.title,
      item.category,
      item.date,
      formatDate(item.date),
      item.time_slot,
      formatTimeSlot(item.time_slot),
      item.runner,
      item.customer_name,
      item.customer_phone,
      item.customer_zalo,
      item.note,
      item.staff_note,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(activeSearchTerm),
    );
  });

  const currentBookings = searchedBookings
    .filter((item) => {
      if (!item.date) return false;
      return String(item.date).slice(0, 10) >= todayKey;
    })
    .sort((a, b) => {
      const dateA = String(a.date || "").slice(0, 10);
      const dateB = String(b.date || "").slice(0, 10);
      const dateCompare = dateA.localeCompare(dateB);

      if (dateCompare !== 0) return dateCompare;

      const timeCompare = getTimeSortValue(a.time_slot) - getTimeSortValue(b.time_slot);

      if (timeCompare !== 0) return timeCompare;

      return Number(a.id || 0) - Number(b.id || 0);
    });

  const historyBookings = searchedBookings
    .filter((item) => {
      if (!item.date) return true;
      return String(item.date).slice(0, 10) < todayKey;
    })
    .sort((a, b) => {
      const dateA = String(a.date || "").slice(0, 10);
      const dateB = String(b.date || "").slice(0, 10);
      const dateCompare = dateB.localeCompare(dateA);

      if (dateCompare !== 0) return dateCompare;

      const timeCompare = getTimeSortValue(b.time_slot) - getTimeSortValue(a.time_slot);

      if (timeCompare !== 0) return timeCompare;

      return Number(b.id || 0) - Number(a.id || 0);
    });

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(activeTab === "first" ? currentBookings.length : historyBookings.length);
    }
  }, [activeTab, currentBookings.length, historyBookings.length, onCountChange]);

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
      await removeBookingHistory(booking.id);

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
      const previousBooking = formData.id ? bookings.find((item) => String(item.id) === String(formData.id)) : null;

      const payload = {
        program: String(formData.program ?? previousBooking?.program ?? "").trim(),
        title: String(formData.title ?? previousBooking?.title ?? "").trim(),
        category: String(formData.category ?? previousBooking?.category ?? "").trim(),
        date: formData.date || previousBooking?.date || null,
        time_slot: String(formData.time_slot ?? previousBooking?.time_slot ?? "").trim(),
        staff_note: formData.staff_note !== undefined ? formData.staff_note || null : previousBooking?.staff_note || null,
        amount:
          formData.amount !== "" && formData.amount !== null && formData.amount !== undefined
            ? Number(formData.amount) || 0
            : Number(previousBooking?.amount || 0),
        runner: String(formData.runner ?? previousBooking?.runner ?? "").trim() || null,
        note: formData.note !== undefined ? String(formData.note || "").trim() || null : previousBooking?.note || null,
        outs_price:
          formData.outs_price !== "" && formData.outs_price !== null && formData.outs_price !== undefined
            ? Number(formData.outs_price) || 0
            : Number(previousBooking?.outs_price || 0),
        customer_name: String(formData.customer_name ?? previousBooking?.customer_name ?? "").trim() || null,
        customer_phone:
          String(formData.customer_phone ?? previousBooking?.customer_phone ?? "")
            .replace(/\D/g, "")
            .slice(0, 10) || null,
        customer_zalo: String(formData.customer_zalo ?? previousBooking?.customer_zalo ?? "").trim() || null,
      };

      if (!payload.date) throw new Error("Vui lòng nhập ngày Booking.");

      if (!payload.runner || payload.runner.toLowerCase() === "phúc") payload.outs_price = 0;

      if ((payload.customer_phone || payload.customer_zalo) && !payload.customer_name) {
        throw new Error("Booking có thông tin liên hệ nhưng thiếu tên khách hàng.");
      }

      let data;

      if (formData.id) {
        await removeBookingFromPreviousCustomer(previousBooking);

        const { data: updatedData, error } = await supabase.from("bookings").update(payload).eq("id", formData.id).select("*").single();

        if (error) throw error;

        data = updatedData;
      } else {
        const { data: insertedData, error: insertError } = await supabase.from("bookings").insert([payload]).select("*").single();

        if (insertError) throw insertError;

        data = insertedData;
      }

      await syncCustomerFromBooking(data);

      setBookings((prev) => {
        const exists = prev.some((item) => String(item.id) === String(data.id));

        if (exists) return prev.map((item) => (String(item.id) === String(data.id) ? data : item));

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

    if (distance < -85) handleDelete(booking);
  };

  const renderInfoRow = (label, value) => {
    if (!String(value ?? "").trim()) return null;

    return (
      <div className="row">
        <span>{label}: </span>
        <strong>{value}</strong>
      </div>
    );
  };

  const renderBookingCard = (booking, index) => {
    const runner = String(booking.runner || "").trim();
    const received = getReceivedAmount(booking);
    const customerName = String(booking.customer_name || "").trim();
    const customerPhone = String(booking.customer_phone || "").trim();
    const customerZalo = String(booking.customer_zalo || "").trim();
    const customerContact = [customerPhone ? `SĐT: ${customerPhone}` : "", customerZalo ? `Zalo: ${customerZalo}` : ""].filter(Boolean).join(" | ");

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

          {renderInfoRow("Chương trình", booking.program)}
          {renderInfoRow("Công việc", booking.category)}
          {renderInfoRow("Địa điểm", booking.title)}
          {renderInfoRow("Thời gian", formatTimeSlot(booking.time_slot))}
          {renderInfoRow("Bill", formatMoney(booking.amount))}

          {runner || booking.outs_price ? (
            <div className="row">
              <span>Người chạy / OutS: </span>
              <strong>
                {runner}
                {runner && booking.outs_price ? " | " : ""}
                {booking.outs_price ? formatMoney(booking.outs_price) : ""}
              </strong>
            </div>
          ) : null}

          {customerName || customerPhone || customerZalo ? (
            <div className="row">
              <span>{customerName ? "Khách: " : ""}</span>
              <strong>
                {customerName}
                {customerName && (customerPhone || customerZalo) ? " | " : ""}
                {customerPhone ? `SĐT: ${customerPhone}` : ""}
                {customerPhone && customerZalo ? " | " : ""}
                {customerZalo ? `Zalo: ${customerZalo}` : ""}
              </strong>
            </div>
          ) : null}

          {renderInfoRow("Thực nhận", formatMoney(received))}
          {renderInfoRow("Note", booking.note)}
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
