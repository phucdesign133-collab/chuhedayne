import React, { useEffect, useMemo, useState } from "react";
import { Wallet, PartyPopper, Palette, Car, CircleDollarSign } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/MonthlyList.css";

export default function FundManager({ searchTerm = "", onCountChange }) {
  const [incomes, setIncomes] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // ============================================================
  // LOAD INCOME
  // ============================================================

  const loadIncomes = async () => {
    try {
      const { data, error } = await supabase
        .from("incomes")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setIncomes(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu Quỹ:", error);
      setIncomes([]);
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
    loadIncomes();
    loadPurchases();
  }, []);

  // ============================================================
  // FUND
  //
  // Tái đầu tư = 20% thực nhận.
  //
  // Nếu kết quả <= 0 -> 0.
  // Nếu kết quả > 0 -> lấy số nguyên.
  // ============================================================

  const calculateFund = (received) => {
    const value = Number(received || 0);

    if (!Number.isFinite(value)) {
      return 0;
    }

    const fund = value * 0.2;

    if (fund <= 0) {
      return 0;
    }

    return Math.floor(fund);
  };

  // ============================================================
  // FUND BY SOURCE
  // ============================================================

  const fundBySource = useMemo(() => {
    const result = {
      event: 0,
      design: 0,
      taxi: 0,
      other: 0,
    };

    incomes.forEach((income) => {
      const source = income.source || "other";
      const fund = calculateFund(income.received);

      if (result[source] !== undefined) {
        result[source] += fund;
      } else {
        result.other += fund;
      }
    });

    return result;
  }, [incomes]);

  // ============================================================
  // TOTAL FUND
  // ============================================================

  const totalFund = useMemo(() => {
    return Object.values(fundBySource).reduce((sum, value) => sum + value, 0);
  }, [fundBySource]);

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
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredIncomes = useMemo(() => {
    if (!activeSearchTerm) return incomes;

    return incomes.filter((income) => {
      return (
        String(income.source || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(income.date || "")
          .toLowerCase()
          .includes(activeSearchTerm)
      );
    });
  }, [incomes, activeSearchTerm]);

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredIncomes.length);
    }
  }, [filteredIncomes.length, onCountChange]);

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

  const sourceConfig = {
    event: {
      label: "Sự kiện",
      icon: PartyPopper,
    },

    design: {
      label: "Thiết kế",
      icon: Palette,
    },

    taxi: {
      label: "Taxi",
      icon: Car,
    },

    other: {
      label: "Khác",
      icon: CircleDollarSign,
    },
  };

  // ============================================================
  // MONTHLY LIST
  // ============================================================

  const groupedByMonth = useMemo(() => {
    const groups = {};

    filteredIncomes.forEach((income) => {
      if (!income.date) return;

      const monthKey = String(income.date).slice(0, 7);

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(income);
    });

    return Object.entries(groups).sort(([monthA], [monthB]) => monthB.localeCompare(monthA));
  }, [filteredIncomes]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      {/* ======================================================
        SUMMARY
      ====================================================== */}

      <div className="summary">
        <div className="summary-grid">
          {/* LEFT */}

          <div>
            {[
              ["Sự kiện", fundBySource.event],
              ["Thiết kế", fundBySource.design],
              ["Taxi", fundBySource.taxi],
              ["Khác", fundBySource.other],
            ].map(([label, value]) => (
              <div className="summary-row" key={label}>
                <span>{label}</span>

                <strong>{formatMoney(value)}</strong>
              </div>
            ))}
          </div>

          {/* DIVIDER */}

          <div className="summary-divider" />

          {/* RIGHT */}

          <div>
            <div className="summary-row">
              <span>Quỹ</span>

              <strong className="summary-positive summary-highlight">{formatMoney(totalFund)}</strong>
            </div>

            <div className="summary-row">
              <span>Nhập hàng</span>

              <strong className="summary-negative">{formatMoney(purchaseAmount)}</strong>
            </div>

            <div className="summary-row summary-total">
              <strong>Còn lại</strong>

              <strong className="summary-positive summary-highlight">{formatMoney(remainingFund)}</strong>
            </div>
          </div>
        </div>
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
          groupedByMonth.map(([monthKey, monthIncomes]) => {
            const monthlyTotal = monthIncomes.reduce((sum, income) => sum + calculateFund(income.received), 0);

            return (
              <div className="monthly-list-month" key={monthKey}>
                {/* MONTH HEADER */}

                <div className="monthly-list-header">
                  <span className="monthly-list-title">{formatMonth(`${monthKey}-01`)}</span>

                  <strong className="monthly-list-total">{formatMoney(monthlyTotal)}</strong>
                </div>

                {/* MONTH GROUP */}

                <div className="monthly-list-group">
                  {monthIncomes.map((income, index) => {
                    const config = sourceConfig[income.source] || sourceConfig.other;

                    const Icon = config.icon;

                    const fund = calculateFund(income.received);

                    return (
                      <div
                        className={`monthly-list-row${index < monthIncomes.length - 1 ? " monthly-list-row-border" : ""}`}
                        key={income.id || `fund-${monthKey}-${index}`}
                      >
                        {/* SOURCE */}

                        <div className="monthly-list-source">
                          <Icon size={20} strokeWidth={2} />

                          <strong>{config.label}</strong>
                        </div>

                        {/* DATE */}

                        <div className="monthly-list-date">{formatDate(income.date)}</div>

                        {/* FUND */}

                        <div className="monthly-list-amount">{formatMoney(fund)}</div>
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
