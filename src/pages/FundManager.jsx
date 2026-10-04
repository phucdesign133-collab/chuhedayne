import React, { useEffect, useMemo, useState } from "react";
import { Wallet, PartyPopper, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/MonthlyList.css";

export default function FundManager({ searchTerm = "", onCountChange }) {
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, date, amount, runner, outs_price,category")
        .order("date", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu Booking cho Quỹ:", error);
      setBookings([]);
    }
  };

  // ============================================================
  // LOAD PURCHASE
  // ============================================================

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, amount, date, created_at")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu nhập hàng cho Quỹ:", error);

      setPurchases([]);
    }
  };

  useEffect(() => {
    loadBookings();
    loadPurchases();
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
  // FUND
  //
  // Tái đầu tư = 20% thực nhận.
  //
  // Cho phép lấy số âm
  // ============================================================

  const calculateFund = (received) => {
    const value = Number(received || 0);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.floor(value * 0.2);
  };

  // ============================================================
  // COMPLETED BOOKINGS
  // ============================================================

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSearchTerm = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (!booking.date) return false;

      const bookingDate = new Date(`${booking.date}T00:00:00`);
      if (bookingDate >= today) return false;

      if (!activeSearchTerm) return true;

      const received = getReceivedAmount(booking);

      return (
        String(booking.category || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(booking.date || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(received || "")
          .toLowerCase()
          .includes(activeSearchTerm)
      );
    });
  }, [bookings, searchTerm]);

  // ============================================================
  // TOTAL FUND
  // ============================================================

  const totalFund = useMemo(() => {
    return filteredBookings.reduce((sum, booking) => {
      return sum + calculateFund(getReceivedAmount(booking));
    }, 0);
  }, [filteredBookings]);

  // ============================================================
  // PURCHASE
  // ============================================================

  const purchaseAmount = useMemo(() => {
    return purchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  }, [purchases]);

  // ============================================================
  // REMAINING FUND
  // ============================================================

  const remainingFund = totalFund - purchaseAmount;

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

  const formatDate = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return value;

    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
  };

  const formatMonth = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4})-(\d{2})-\d{2}$/);

    if (!match) return "";

    const [, year, month] = match;

    return `Tháng ${month}/${year}`;
  };

  // ============================================================
  // MONTHLY LIST
  // ============================================================

  const groupedByMonth = useMemo(() => {
    const groups = {};

    filteredBookings.forEach((booking) => {
      if (!booking.date) return;

      const monthKey = String(booking.date).slice(0, 7);

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(booking);
    });

    return Object.entries(groups).sort(([monthA], [monthB]) => monthB.localeCompare(monthA));
  }, [filteredBookings]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      {/* ======================================================
      SUMMARY
    ====================================================== */}

      <div className={`summary${isSummaryOpen ? " summary-open" : ""}`}>
        {!isSummaryOpen ? (
          <button type="button" className="summary-row purchase-summary-closed" onClick={() => setIsSummaryOpen(true)}>
            <strong>Còn lại</strong>

            <strong
              className={
                remainingFund > 0
                  ? "summary-positive summary-highlight"
                  : remainingFund < 0
                    ? "summary-negative summary-highlight"
                    : "summary-neutral summary-highlight"
              }
            >
              {formatMoney(remainingFund)}
            </strong>

            <ChevronDown size={20} strokeWidth={2} />
          </button>
        ) : (
          <div
            className="summary-grid purchase-summary-open"
            style={{
              overflow: "hidden",
            }}
          >
            <div
              className="purchase-summary-list"
              style={{
                maxHeight: "calc(3 * 44px)",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {totalFund !== 0 && (
                <div className="summary-row">
                  <span>Thu nhập</span>

                  <strong className={totalFund > 0 ? "summary-positive" : "summary-negative"}>{formatMoney(totalFund)}</strong>
                </div>
              )}

              {purchaseAmount > 0 && (
                <div className="summary-row">
                  <span>Nhập hàng</span>

                  <strong className="summary-negative">{formatMoney(purchaseAmount)}</strong>
                </div>
              )}
            </div>

            <div className="summary-row summary-total purchase-summary-total">
              <strong>Còn lại</strong>

              <div className="purchase-summary-total-right">
                <strong
                  className={
                    remainingFund > 0
                      ? "summary-positive summary-highlight"
                      : remainingFund < 0
                        ? "summary-negative summary-highlight"
                        : "summary-neutral summary-highlight"
                  }
                >
                  {formatMoney(remainingFund)}
                </strong>

                <button type="button" className="purchase-summary-toggle" onClick={() => setIsSummaryOpen(false)} aria-label="Thu gọn Quỹ">
                  <ChevronUp size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
      MONTHLY LIST
    ====================================================== */}

      <div className="list monthly-list">
        {groupedByMonth.length === 0 ? (
          <div className="empty">
            <Wallet size={32} />

            <span>Chưa có khoản Quỹ phù hợp</span>
          </div>
        ) : (
          groupedByMonth.map(([monthKey, monthBookings]) => {
            const monthlyTotal = monthBookings.reduce((sum, booking) => {
              return sum + calculateFund(getReceivedAmount(booking));
            }, 0);

            return (
              <div className="monthly-list-month" key={monthKey}>
                {/* MONTH HEADER */}

                <div className="monthly-list-header">
                  <span className="monthly-list-title">{formatMonth(`${monthKey}-01`)}</span>

                  <strong
                    className={
                      monthlyTotal > 0
                        ? "monthly-list-total summary-positive"
                        : monthlyTotal < 0
                          ? "monthly-list-total summary-negative"
                          : "monthly-list-total summary-neutral"
                    }
                  >
                    {formatMoney(monthlyTotal)}
                  </strong>
                </div>

                {/* MONTH GROUP */}

                <div className="monthly-list-group">
                  {monthBookings.map((booking, index) => {
                    const fund = calculateFund(getReceivedAmount(booking));

                    return (
                      <div
                        className={`monthly-list-row${index < monthBookings.length - 1 ? " monthly-list-row-border" : ""}`}
                        key={booking.id || `fund-${monthKey}-${index}`}
                      >
                        {/* SOURCE */}

                        <div className="monthly-list-source">
                          {/* <PartyPopper size={20} strokeWidth={2} /> */}

                          <strong>{booking.category || ""}</strong>
                        </div>

                        {/* DATE */}

                        <div className="monthly-list-date">{formatDate(booking.date)}</div>

                        {/* FUND */}

                        <div
                          className={
                            fund > 0
                              ? "monthly-list-amount summary-positive"
                              : fund < 0
                                ? "monthly-list-amount summary-negative"
                                : "monthly-list-amount summary-neutral"
                          }
                        >
                          {formatMoney(fund)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
