import React, { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Wallet,
  PartyPopper,
  Palette,
  Car,
  CircleDollarSign,
  Package,
} from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/MonthlyList.css";

export default function FundManager({ searchTerm = "", onCountChange }) {
  const [incomes, setIncomes] = useState([]);

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

  useEffect(() => {
    loadIncomes();
  }, []);

  // ============================================================
  // FUND
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
      const fund = Number(income.received || 0) * 0.2;

      if (result[source] !== undefined) {
        result[source] += fund;
      } else {
        result.other += fund;
      }
    });

    return result;
  }, [incomes]);

  const totalFund = useMemo(() => {
    return Object.values(fundBySource).reduce(
      (sum, value) => sum + value,
      0
    );
  }, [fundBySource]);

  // Tạm thời chưa liên kết nhập hàng
  const purchaseAmount = 0;

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
  //
  // Hiển thị danh sách theo từng tháng.
  //
  // Mỗi tháng gồm:
  // - Tiêu đề tháng
  // - Tổng tiền của riêng tháng đó
  // - Một cụm nền trắng
  // - Các khoản nằm chung trong cụm
  // - Các row ngăn nhau bằng đường line
  //
  // Layout:
  // [Tháng MM/YYYY]                     [Tổng tháng]
  //
  // Trong cụm:
  // [Icon + Nguồn] [Ngày] [Tiền]
  //
  // Pattern này được tái sử dụng cho PurchaseManager.
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

    return Object.entries(groups).sort(([monthA], [monthB]) =>
      monthB.localeCompare(monthA)
    );
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

              <strong className="summary-positive summary-highlight">
                {formatMoney(totalFund)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Nhập hàng</span>

              <strong className="summary-negative">
                {formatMoney(purchaseAmount)}
              </strong>
            </div>

            <div className="summary-row summary-total">
              <strong>Còn lại</strong>

              <strong className="summary-positive summary-highlight">
                {formatMoney(remainingFund)}
              </strong>
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
            const monthlyTotal = monthIncomes.reduce(
              (sum, income) =>
                sum + Number(income.received || 0) * 0.2,
              0
            );

            return (
              <div className="monthly-list-month" key={monthKey}>
                {/* MONTH HEADER */}
                <div className="monthly-list-header">
                  <span className="monthly-list-title">
                    {formatMonth(`${monthKey}-01`)}
                  </span>

                  <strong className="monthly-list-total">
                    {formatMoney(monthlyTotal)}
                  </strong>
                </div>

                {/* MONTH GROUP */}
                <div className="monthly-list-group">
                  {monthIncomes.map((income, index) => {
                    const config =
                      sourceConfig[income.source] || sourceConfig.other;

                    const Icon = config.icon;
                    const fund =
                      Number(income.received || 0) * 0.2;

                    return (
                      <div
                        className={`monthly-list-row${
                          index < monthIncomes.length - 1
                            ? " monthly-list-row-border"
                            : ""
                        }`}
                        key={
                          income.id ||
                          `fund-${monthKey}-${index}`
                        }
                      >
                        {/* SOURCE */}
                        <div className="monthly-list-source">
                          <Icon size={20} strokeWidth={2} />

                          <strong>{config.label}</strong>
                        </div>

                        {/* DATE */}
                        <div className="monthly-list-date">
                          {formatDate(income.date)}
                        </div>

                        {/* FUND */}
                        <div className="monthly-list-amount">
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