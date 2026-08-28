// src/components/PrizeManager.jsx

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PackageOpen } from "lucide-react";

import { fetchAllPrizesFromCloud } from "../datas/spinEngine";
import { supabase } from "./utils/supabaseClient";

import "../css/PrizeManager.css";

export default function PrizeManager({
  searchTerm = "",
  savedData = null,
  onCountChange,
  onEdit,
}) {
  const [prizes, setPrizes] = useState([]);

  const loadPrizes = async () => {
    try {
      const data = await fetchAllPrizesFromCloud();
      const list = Array.isArray(data) ? data : [];

      setPrizes(list);
    } catch (error) {
      console.error(
        "❌ Lỗi tải danh sách quà:",
        error
      );

      setPrizes([]);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, []);

  useEffect(() => {
    if (!savedData) return;

    setPrizes((prev) => {
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

        return [savedData, ...prev];
      }

      return [savedData, ...prev];
    });
  }, [savedData]);

  const activeSearchTerm =
    searchTerm.trim().toLowerCase();

  const filteredPrizes = prizes.filter((prize) => {
    if (!activeSearchTerm) {
      return true;
    }

    return (
      String(prize.text || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(prize.unit || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(prize.packaging ?? "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(prize.note || "")
        .toLowerCase()
        .includes(activeSearchTerm)
    );
  });

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredPrizes.length);
    }
  }, [filteredPrizes.length, onCountChange]);

  const handleEdit = (prize) => {
    if (typeof onEdit === "function") {
      onEdit(prize);
    }
  };

  const handleDelete = async (prize) => {
    const confirmed = window.confirm(
      `Xóa món "${prize.text}" khỏi kho?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("prizes")
        .delete()
        .eq("id", prize.id);

      if (error) {
        throw error;
      }

      setPrizes((prev) =>
        prev.filter(
          (item) => item.id !== prize.id
        )
      );
    } catch (error) {
      console.error(
        "❌ Lỗi xóa món quà:",
        error
      );

      alert(
        `Không thể xóa món quà:\n${
          error?.message ||
          "Lỗi không xác định"
        }`
      );
    }
  };

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  const formatPrizeName = (text) => {
    if (!text) return "";

    return String(text)
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  const getNoteClass = (note) => {
    if (!note) return "";

    const normalized =
      String(note).toLowerCase();

    if (normalized.includes("giảm")) {
      return "prize-note-decrease";
    }

    if (normalized.includes("tăng")) {
      return "prize-note-increase";
    }

    return "";
  };

  return (
    <div className="prize-manager">
      <div className="prize-list">
        {filteredPrizes.length === 0 ? (
          <div className="prize-empty">
            <PackageOpen size={32} />
            <span>
              Không có quà phù hợp
            </span>
          </div>
        ) : (
          filteredPrizes.map((prize, index) => (
            <div
              className="prize-card"
              key={
                prize.id ||
                `prize-${index}`
              }
            >
              <div className="prize-info">
                <div className="prize-row prize-name">
                  {formatPrizeName(
                    prize.text
                  )}
                </div>

                <div className="prize-row">
                  <span>Đơn giá: </span>
                  <strong>
                    {formatMoney(
                      prize.unit_cost
                    )}
                  </strong>
                </div>

                <div className="prize-row">
                  <span>Đơn vị: </span>
                  {prize.unit || ""}
                </div>

                <div className="prize-row">
                  <span>Đóng gói: </span>
                  {prize.packaging ?? 0}
                </div>

                <div className="prize-row">
                  <span>Tồn kho: </span>
                  <strong>
                    {prize.quantity ?? 0}
                  </strong>
                </div>

                <div className="prize-row">
                  <span>Ưu tiên: </span>
                  <strong
                    className={
                      prize.priority
                        ? "priority-yes"
                        : "priority-no"
                    }
                  >
                    {prize.priority
                      ? "Có"
                      : "Không"}
                  </strong>
                </div>

                {prize.note && (
                  <div
                    className={`prize-row prize-note ${getNoteClass(
                      prize.note
                    )}`}
                  >
                    {prize.note}
                  </div>
                )}
              </div>

              <div className="prize-image-wrapper">
                {Array.isArray(prize.image) &&
                prize.image.length > 0 ? (
                  <img
                    src={prize.image[0]}
                    alt={
                      prize.text || "Quà"
                    }
                    className="prize-image"
                  />
                ) : typeof prize.image ===
                  "string" &&
                  prize.image ? (
                  <img
                    src={prize.image}
                    alt={
                      prize.text || "Quà"
                    }
                    className="prize-image"
                  />
                ) : (
                  <div className="prize-image-empty">
                    <PackageOpen size={28} />
                  </div>
                )}
              </div>

              <div className="prize-card-footer">
                <button
                  type="button"
                  className="prize-action-btn prize-edit-btn"
                  onClick={() =>
                    handleEdit(prize)
                  }
                >
                  <Pencil size={16} />
                  Sửa
                </button>

                <button
                  type="button"
                  className="prize-action-btn prize-delete-btn"
                  onClick={() =>
                    handleDelete(prize)
                  }
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