import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Wallet, PartyPopper, Palette, Car, CircleDollarSign, Package } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

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
    return Object.values(fundBySource).reduce((sum, value) => sum + value, 0);
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
  // UI
  // ============================================================

  return (
    <div className="manager fund-manager">
      {/* ======================================================
        FUND SUMMARY
    ====================================================== */}

      <div
        className="fund-summary"
        style={{
          position: "fixed",
          top: 90,
          left: 0,
          right: 0,
          zIndex: 20,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          {/* LEFT */}
          <div>
            {[
              ["Sự kiện", fundBySource.event],
              ["Thiết kế", fundBySource.design],
              ["Taxi", fundBySource.taxi],
              ["Khác", fundBySource.other],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  minHeight: "30px",
                  fontSize: "14px",
                }}
              >
                <span>{label}</span>

                <strong>{formatMoney(value)}</strong>
              </div>
            ))}
          </div>

          {/* DIVIDER */}
          <div
            style={{
              width: "1px",
              background: "#e5e7eb",
            }}
          />

          {/* RIGHT */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "30px",
                fontSize: "14px",
              }}
            >
              <span>Quỹ</span>

              <strong
                style={{
                  color: "#15803d",
                  fontSize: "15px",
                }}
              >
                {formatMoney(totalFund)}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "30px",
                fontSize: "14px",
              }}
            >
              <span>Nhập hàng</span>

              <strong
                style={{
                  color: "#b91c1c",
                }}
              >
                {formatMoney(purchaseAmount)}
              </strong>
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                marginTop: "5px",
                paddingTop: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "30px",
                fontSize: "14px",
              }}
            >
              <strong>Còn lại</strong>

              <strong
                style={{
                  color: "#15803d",
                  fontSize: "15px",
                }}
              >
                {formatMoney(remainingFund)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
        LIST
    ====================================================== */}

      <div
        className="list"
        style={{
          paddingTop: "145px",
        }}
      >
        {filteredIncomes.length === 0 ? (
          <div className="empty">
            <Wallet size={32} />
            <span>Chưa có khoản Quỹ phù hợp</span>
          </div>
        ) : (
          filteredIncomes.map((income, index) => {
            const config = sourceConfig[income.source] || sourceConfig.other;

            const Icon = config.icon;

            const fund = Number(income.received || 0) * 0.2;

            return (
              <div className="card" key={income.id || `fund-${index}`}>
                <div className="info">
                  <div
                    className="row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(90px, 0.7fr) auto",
                      alignItems: "center",
                      columnGap: "12px",
                      width: "100%",
                    }}
                  >
                    {/* CỘT 1 — ICON + NGUỒN */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        minWidth: 0,
                      }}
                    >
                      <Icon size={20} strokeWidth={2} />

                      <strong
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {config.label}
                      </strong>
                    </div>

                    {/* CỘT 2 — NGÀY */}
                    <div
                      style={{
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(income.date)}
                    </div>

                    {/* CỘT 3 — QUỸ */}
                    <div
                      style={{
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        fontWeight: 700,
                        color: "#15803d",
                      }}
                    >
                      {formatMoney(fund)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
