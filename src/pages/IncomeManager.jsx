import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function IncomeManager({
  searchTerm = "",
  savedData = null,
  onCountChange,
  onEdit,
}) {
  const [incomes, setIncomes] = useState([]);

  // ============================================================
  // LOAD DATA
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
      console.error("❌ Lỗi tải thu nhập:", error);
      setIncomes([]);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  // ============================================================
  // NHẬN DATA SAU KHI SAVE
  // ============================================================

  useEffect(() => {
    if (!savedData) return;

    setIncomes((prev) => {
      if (!savedData.id) {
        return [savedData, ...prev];
      }

      const exists = prev.some(
        (item) => item.id === savedData.id,
      );

      return exists
        ? prev.map((item) =>
            item.id === savedData.id ? savedData : item,
          )
        : [savedData, ...prev];
    });
  }, [savedData]);

  // ============================================================
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredIncomes = useMemo(() => {
    if (!activeSearchTerm) return incomes;

    return incomes.filter((income) => {
      return (
        String(income.title || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(income.source || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(income.date || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(income.received || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(income.note || "")
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
  // EDIT
  // ============================================================

  const handleEdit = (income) => {
    if (typeof onEdit === "function") {
      onEdit(income);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (income) => {
    const confirmed = window.confirm(
      `Xóa khoản thu "${income.title || "không tên"}" khỏi danh sách?`,
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("incomes")
        .delete()
        .eq("id", income.id);

      if (error) throw error;

      setIncomes((prev) =>
        prev.filter((item) => item.id !== income.id),
      );
    } catch (error) {
      console.error("❌ Lỗi xóa thu nhập:", error);

      alert(
        `Không thể xóa thu nhập:\n${
          error?.message || "Lỗi không xác định"
        }`,
      );
    }
  };

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

    const match = String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

    if (!match) return value;

    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // SOURCE
  // ============================================================

  const formatSource = (value) => {
    const sourceMap = {
      event: "Sự kiện",
      design: "Thiết kế",
      taxi: "Taxi",
      other: "Khác",
    };

    return sourceMap[value] || value || "Khác";
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      <div className="list">
        {filteredIncomes.length === 0 ? (
          <div className="empty">
            <Wallet size={32} />
            <span>Chưa có khoản thu nhập phù hợp</span>
          </div>
        ) : (
          filteredIncomes.map((income, index) => (
            <div
              className="card"
              key={income.id || `income-${index}`}
            >
              <div className="info">

                {/* NỘI DUNG */}
                <div className="row name">
                  {income.title || ""}
                </div>

                {/* NGUỒN */}
                {income.source && (
                  <div className="row">
                    <span>Nguồn: </span>
                    <strong>
                      {formatSource(income.source)}
                    </strong>
                  </div>
                )}

                {/* NGÀY */}
                {income.date && (
                  <div className="row">
                    <span>Ngày: </span>
                    {formatDate(income.date)}
                  </div>
                )}

                {/* THỰC NHẬN */}
                {income.received !== null &&
                  income.received !== undefined && (
                    <div className="row">
                      <span>Thực nhận: </span>
                      <strong>
                        {formatMoney(income.received)}
                      </strong>
                    </div>
                  )}

                {/* GHI CHÚ - CHỈ RENDER KHI CÓ DATA */}
                {income.note && (
                  <div className="row">
                    <span>Ghi chú: </span>
                    {income.note}
                  </div>
                )}

              </div>

              <div className="card-footer">
                <button
                  type="button"
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(income)}
                >
                  <Pencil size={16} />
                  Sửa
                </button>

                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(income)}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}