import React, { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/IncomeManager.css";

export default function IncomeManager({ searchTerm = "", onCountChange }) {
  const [bookings, setBookings] = useState([]);

  // ============================================================
  // LOAD DATA FROM BOOKINGS
  // ============================================================

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase.from("bookings").select("*").order("date", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải Booking cho Income:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ============================================================
  // RECEIVED
  // ============================================================

  const getReceivedAmount = (booking) => {
    const amount = Number(booking?.amount || 0);
    const runner = String(booking?.runner || "")
      .trim()
      .toLowerCase();
    const outsPrice = Number(booking?.outs_price || 0);

    if (!runner || runner === "phúc") {
      return amount;
    }

    return amount - outsPrice;
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatSearch = (value) => String(value || "").toLowerCase();

    return bookings
      .filter((booking) => {
        if (!booking.date) return false;

        const bookingDate = new Date(`${booking.date}T00:00:00`);

        return bookingDate < today;
      })
      .filter((booking) => {
        if (!activeSearchTerm) return true;

        const received = getReceivedAmount(booking);

        return (
          formatSearch(booking.program).includes(activeSearchTerm) ||
          formatSearch(booking.category).includes(activeSearchTerm) ||
          formatSearch(booking.title).includes(activeSearchTerm) ||
          formatSearch(booking.customer_name).includes(activeSearchTerm) ||
          formatSearch(booking.customer_phone).includes(activeSearchTerm) ||
          formatSearch(booking.runner).includes(activeSearchTerm) ||
          formatSearch(booking.note).includes(activeSearchTerm) ||
          formatSearch(booking.date).includes(activeSearchTerm) ||
          formatSearch(received).includes(activeSearchTerm)
        );
      });
  }, [bookings, activeSearchTerm]);

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredBookings.length);
    }
  }, [filteredBookings.length, onCountChange]);

  // ============================================================
  // FORMAT
  // ============================================================

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  // ============================================================
  // YYYY-MM-DD → DD/MM/YYYY
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return value;

    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // TIME
  // ============================================================

  const formatTimeSlot = (value) => {
    if (!value) return "";

    return String(value)
      .replace(/\s*-\s*/g, " - ")
      .trim();
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="income-manager">
      <div className="income-list">
        {filteredBookings.length === 0 ? (
          <div className="empty">
            <Wallet size={32} />
            <span>Chưa có khoản thu nhập phù hợp</span>
          </div>
        ) : (
          filteredBookings.map((booking, index) => {
            const received = getReceivedAmount(booking);

            return (
              <div className="income-card" key={booking.id || `income-${index}`}>
                <div className="income-info">
                  <div className="income-title">
                    {formatDate(booking.date)} — {booking.program || ""}
                  </div>

                  <div className="income-meta">
                    {booking.category || ""} — {booking.title || ""}
                  </div>

                  <div className={`income-received ${received >= 0 ? "income-positive" : "income-negative"}`}>Thực nhận: {formatMoney(received)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
