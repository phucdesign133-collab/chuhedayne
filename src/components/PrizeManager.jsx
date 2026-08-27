// src/components/PrizeManager.jsx

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PackageOpen } from "lucide-react";
import { useParams, useOutletContext } from "react-router-dom";

import { fetchAllPrizesFromCloud } from "../datas/spinEngine";
import { supabase } from "../components/utils/supabaseClient";

import Popup from "./popup/Popup";

import "../css/PrizeManager.css";

export default function PrizeManager() {
  const { categoryId } = useParams();

  const { searchTerm: gridSearchTerm = "" } = useOutletContext() || {};

  // ============================================================
  // STATE
  // ============================================================

  const [prizes, setPrizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  // ============================================================
  // 1. LOAD TOÀN BỘ KHO QUÀ
  // ============================================================

  const loadPrizes = async () => {
    try {
      const data = await fetchAllPrizesFromCloud();

      setPrizes(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách quà:", error);

      setPrizes([]);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, []);

  // ============================================================
  // 2. NÚT THÊM MỚI TỪ GRID
  // ============================================================

  useEffect(() => {
    const handleAddNew = () => {
      setEditingPrize(null);
      setIsPopupOpen(true);
    };

    window.addEventListener("grid-add-new-clicked", handleAddNew);

    return () => {
      window.removeEventListener("grid-add-new-clicked", handleAddNew);
    };
  }, []);

  // ============================================================
  // 3. NÚT SỬA
  // ============================================================

  useEffect(() => {
    const handleEditEvent = (event) => {
      setEditingPrize(event.detail || null);
      setIsPopupOpen(true);
    };

    window.addEventListener("prize-edit-clicked", handleEditEvent);

    return () => {
      window.removeEventListener("prize-edit-clicked", handleEditEvent);
    };
  }, []);

  // ============================================================
  // 4. ĐÓNG POPUP
  // ============================================================

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingPrize(null);
  };

  // ============================================================
  // 5. LƯU QUÀ
  //    CREATE + UPDATE
  // ============================================================

  const handleSave = async (formData) => {
  try {
    const payload = {
      text: formData.text,
      cost: Number(formData.cost) || 0,
      unit: formData.unit || "",
      packaging: Number(formData.packaging) || 0,
      quantity: Number(formData.quantity) || 0,
      unit_cost: Number(formData.unit_cost) || 0,
      priority: Boolean(formData.priority),
      is_active: true,
      note: formData.note || "",
      image: "",
    };

    // =========================
    // UPDATE
    // =========================

    if (editingPrize?.id) {
      const { error } = await supabase
        .from("prizes")
        .update(payload)
        .eq("id", editingPrize.id);

      if (error) throw error;

      alert("Đã cập nhật món quà!");
    }

    // =========================
    // INSERT
    // =========================

    else {
      const { error } = await supabase
        .from("prizes")
        .insert(payload);

      if (error) throw error;

      alert("Đã thêm món quà!");
    }

    // =========================
    // LOAD LẠI GRID
    // =========================

    await loadPrizes();

    handleClosePopup();

  } catch (error) {
    console.error("LỖI SAVE PRIZE:", error);

    alert(
      `Không thể lưu món quà:\n${
        error?.message || "Lỗi không xác định"
      }`
    );
  }
};

  // ============================================================
  // 6. TÌM KIẾM
  // ============================================================

  const activeSearchTerm = searchTerm.trim() || gridSearchTerm.trim();

  const filteredPrizes = prizes.filter((prize) => {
    const term = activeSearchTerm.toLowerCase();

    if (!term) return true;

    return (
      (prize.text || "").toLowerCase().includes(term) ||
      (prize.unit || "").toLowerCase().includes(term) ||
      String(prize.packaging ?? "")
        .toLowerCase()
        .includes(term) ||
      (prize.note || "").toLowerCase().includes(term)
    );
  });

  // ============================================================
  // 7. FORMAT TIỀN
  // ============================================================

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  // ============================================================
  // 8. FORMAT TÊN
  // ============================================================

  const formatPrizeName = (text) => {
    if (!text) return "";

    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ============================================================
  // 9. NOTE COLOR
  // ============================================================

  const getNoteClass = (note) => {
    if (!note) return "";

    const normalized = note.toLowerCase();

    if (normalized.includes("giảm")) {
      return "prize-note-decrease";
    }

    if (normalized.includes("tăng")) {
      return "prize-note-increase";
    }

    return "";
  };

  // ============================================================
  // 10. EDIT
  // ============================================================

  const handleEdit = (prize) => {
    window.dispatchEvent(
      new CustomEvent("prize-edit-clicked", {
        detail: prize,
      }),
    );
  };

  // ============================================================
  // 11. DELETE
  // ============================================================

  const handleDelete = async (prize) => {
    const confirmed = window.confirm(`Xóa món "${prize.text}" khỏi kho?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("prizes").delete().eq("id", prize.id);

      if (error) {
        throw error;
      }

      // Xóa ngay khỏi UI
      setPrizes((prev) => prev.filter((item) => item.id !== prize.id));

      alert("Đã xóa món quà!");
    } catch (error) {
      console.error("Lỗi xóa món quà:", error);

      alert(`Không thể xóa món quà:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // ============================================================
  // 12. UI
  // ============================================================

  return (
    <div className="prize-manager">
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="prize-manager-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm quà..."
          className="prize-search-input"
        />
      </div>

      {/* ======================================================
          PRIZE LIST
      ====================================================== */}

      <div className="prize-list">
        {filteredPrizes.length === 0 ? (
          <div className="prize-empty">
            <PackageOpen size={32} />

            <span>Không có quà phù hợp</span>
          </div>
        ) : (
          filteredPrizes.map((prize) => (
            <div className="prize-card" key={prize.id}>
              {/* ==================================================
                  INFO
              ================================================== */}

              <div className="prize-info">
                <div className="prize-row prize-name">{formatPrizeName(prize.text)}</div>

                <div className="prize-row">
                  <span>Giá nhập:</span>

                  <strong>{formatMoney(prize.cost)}</strong>
                </div>

                <div className="prize-row">
                  <span>Đơn vị:</span>

                  {prize.unit || ""}
                </div>

                <div className="prize-row">
                  <span>Đóng gói:</span>

                  {prize.packaging ?? 0}
                </div>

                <div className="prize-row">
                  <span>Số lượng:</span>

                  <strong>{prize.quantity ?? 0}</strong>
                </div>

                <div className="prize-row">
                  <span>Ưu tiên:</span>

                  <strong className={prize.priority ? "priority-yes" : "priority-no"}>{prize.priority ? "Có" : "Không"}</strong>
                </div>

                {prize.note && <div className={`prize-row prize-note ${getNoteClass(prize.note)}`}>{prize.note}</div>}
              </div>

              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div className="prize-image-wrapper">
                {prize.image ? (
                  <img src={prize.image} alt={prize.text || "Quà"} className="prize-image" />
                ) : (
                  <div className="prize-image-empty">
                    <PackageOpen size={28} />
                  </div>
                )}
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="prize-card-footer">
                <button type="button" className={"prize-action-btn " + "prize-edit-btn"} onClick={() => handleEdit(prize)}>
                  <Pencil size={16} />
                  Sửa
                </button>

                <button type="button" className={"prize-action-btn " + "prize-delete-btn"} onClick={() => handleDelete(prize)}>
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================================
          POPUP
      ====================================================== */}

      <Popup isOpen={isPopupOpen} onClose={handleClosePopup} onSave={handleSave} categoryId={categoryId} initialData={editingPrize} />
    </div>
  );
}
