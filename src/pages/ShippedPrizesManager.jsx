import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PackageOpen } from "lucide-react";

import { supabase } from "../components/utils/supabaseClient";

import "../css/Manager.css";

export default function ShippedPrizesManager({
  searchTerm = "",
  savedData = null,
  onCountChange,
  onEdit,
}) {
  const [shippedPrizes, setShippedPrizes] = useState([]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadShippedPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from("shipped_prizes")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setShippedPrizes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách quà đã gửi:", error);
      setShippedPrizes([]);
    }
  };

  useEffect(() => {
    loadShippedPrizes();
  }, []);

  // ============================================================
  // CẬP NHẬT SAU KHI SAVE
  // ============================================================

  useEffect(() => {
    if (!savedData) return;

    setShippedPrizes((prev) => {
      if (savedData.id) {
        const exists = prev.some(
          (item) => item.id === savedData.id
        );

        if (exists) {
          return prev.map((item) =>
            item.id === savedData.id
              ? savedData
              : item
          );
        }
      }

      return [savedData, ...prev];
    });
  }, [savedData]);

  // ============================================================
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm
    .trim()
    .toLowerCase();

  const filteredShippedPrizes = shippedPrizes.filter(
    (item) => {
      if (!activeSearchTerm) return true;

      return (
        String(item.customer_name || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(item.phone || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(item.address || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(item.note || "")
          .toLowerCase()
          .includes(activeSearchTerm)
      );
    }
  );

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredShippedPrizes.length);
    }
  }, [
    filteredShippedPrizes.length,
    onCountChange,
  ]);

  // ============================================================
  // ACTION
  // ============================================================

  const handleEdit = (item) => {
    if (typeof onEdit === "function") {
      onEdit(item);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Xóa thông tin quà đã gửi cho "${item.customer_name}"?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("shipped_prizes")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setShippedPrizes((prev) =>
        prev.filter((row) => row.id !== item.id)
      );
    } catch (error) {
      console.error(
        "❌ Lỗi xóa quà đã gửi:",
        error
      );

      alert(
        `Không thể xóa:\n${
          error?.message || "Lỗi không xác định"
        }`
      );
    }
  };

  // ============================================================
  // FORMAT
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const [year, month, day] = String(dateValue)
      .slice(0, 10)
      .split("-");

    if (!year || !month || !day) {
      return String(dateValue);
    }

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      <div className="list">
        {filteredShippedPrizes.length === 0 ? (
          <div className="empty">
            <PackageOpen size={32} />
            <span>
              Không có quà đã gửi phù hợp
            </span>
          </div>
        ) : (
          filteredShippedPrizes.map(
            (item, index) => {
              const images = Array.isArray(item.images)
                ? item.images
                : [];

              const firstImage =
                images[0] || "";

              return (
                <div
                  className="card"
                  key={
                    item.id ||
                    `shipped-prize-${index}`
                  }
                >
                  <div className="card-main">
                    <div className="info">
                      <div className="row name">
                        {item.customer_name || ""}
                      </div>

                      <div className="row">
                        <span>
                          Số điện thoại:{" "}
                        </span>
                        <strong>
                          {item.phone || ""}
                        </strong>
                      </div>

                      <div className="row">
                        <span>
                          Địa chỉ:{" "}
                        </span>
                        <strong>
                          {item.address || ""}
                        </strong>
                      </div>

                      <div className="row">
                        <span>
                          Ngày gửi:{" "}
                        </span>
                        <strong>
                          {formatDate(item.date)}
                        </strong>
                      </div>

                      {item.note && (
                        <div className="row">
                          {item.note}
                        </div>
                      )}
                    </div>

                    <div className="image-box">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={
                            item.customer_name ||
                            "Quà đã gửi"
                          }
                          className="image"
                        />
                      ) : (
                        <div className="image-empty">
                          <PackageOpen
                            size={28}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      <Pencil size={16} />
                      Sửa
                    </button>

                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() =>
                        handleDelete(item)
                      }
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
}