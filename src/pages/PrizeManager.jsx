import React, { useEffect, useMemo, useState } from "react";
import { PackageOpen } from "lucide-react";

import { fetchAllPrizesFromCloud } from "../datas/spinEngine";
import { supabase } from "../components/utils/supabaseClient";

import "../css/Manager.css";

export default function PrizeManager({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [prizes, setPrizes] = useState([]);

  const [swipeState, setSwipeState] = useState({
    id: null,
    x: 0,
    startX: 0,
    startY: 0,
    dragging: false,
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadPrizes = async () => {
    try {
      const data = await fetchAllPrizesFromCloud();

      setPrizes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách quà:", error);
      setPrizes([]);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, []);

  // ============================================================
  // NHẬN DATA SAU KHI SAVE
  // ============================================================

  useEffect(() => {
    if (!savedData) return;

    setPrizes((prev) => {
      if (!savedData.id) {
        return [savedData, ...prev];
      }

      const exists = prev.some((item) => item.id === savedData.id);

      if (exists) {
        return prev.map((item) => (item.id === savedData.id ? savedData : item));
      }

      return [savedData, ...prev];
    });
  }, [savedData]);

  // ============================================================
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredPrizes = useMemo(() => {
    if (!activeSearchTerm) {
      return prizes;
    }

    return prizes.filter((prize) => {
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
  }, [prizes, activeSearchTerm]);

  // ============================================================
  // SORT
  // TỒN KHO THẤP LÊN CAO
  // ============================================================

  const sortedPrizes = useMemo(() => {
    return [...filteredPrizes].sort((a, b) => {
      return Number(a.quantity || 0) - Number(b.quantity || 0);
    });
  }, [filteredPrizes]);

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(sortedPrizes.length);
    }
  }, [sortedPrizes.length, onCountChange]);

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (prize) => {
    if (typeof onEdit === "function") {
      onEdit(prize);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (prize) => {
    const confirmed = window.confirm(`Xóa món "${prize.text || "quà"}" khỏi kho?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("prizes").delete().eq("id", prize.id);

      if (error) throw error;

      setPrizes((prev) => prev.filter((item) => item.id !== prize.id));
    } catch (error) {
      console.error("❌ Lỗi xóa món quà:", error);

      alert(`Không thể xóa món quà:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  // ============================================================
  // NOTE CLASS
  // ============================================================

  const getNoteClass = (note) => {
    if (!note) return "";

    const normalized = String(note).toLowerCase();

    if (normalized.includes("giảm")) {
      return "prize-note-decrease";
    }

    if (normalized.includes("tăng")) {
      return "prize-note-increase";
    }

    return "";
  };

  // ============================================================
  // SWIPE
  // Giống cơ chế PurchaseManager
  //
  // Vuốt phải > 85% width -> Sửa
  // Vuốt trái  > 85% width -> Xóa
  // Dưới hoặc bằng 85% -> trả về
  // ============================================================

  const handlePointerDown = (event, prize) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    setSwipeState({
      id: prize.id,
      x: 0,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    });

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (swipeState.id === null) return;

    const deltaX = event.clientX - swipeState.startX;
    const deltaY = event.clientY - swipeState.startY;

    // Nếu đang vuốt dọc thì nhường cho scroll trang.
    if (!swipeState.dragging) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        setSwipeState((prev) => ({
          ...prev,
          id: null,
          x: 0,
          dragging: false,
        }));

        return;
      }

      if (Math.abs(deltaX) < 8) {
        return;
      }

      setSwipeState((prev) => ({
        ...prev,
        dragging: true,
      }));
    }

    event.preventDefault();

    const cardWidth = event.currentTarget.getBoundingClientRect().width;

    // Không cho card trượt quá chính chiều rộng của nó.
    const limitedX = Math.max(-cardWidth, Math.min(cardWidth, deltaX));

    setSwipeState((prev) => ({
      ...prev,
      x: limitedX,
      dragging: true,
    }));
  };

  const handlePointerUp = async (event, prize) => {
    if (swipeState.id !== prize.id) return;

    const cardWidth = event.currentTarget.getBoundingClientRect().width;

    const threshold = cardWidth * 0.85;

    const deltaX = event.clientX - swipeState.startX;

    setSwipeState({
      id: null,
      x: 0,
      startX: 0,
      startY: 0,
      dragging: false,
    });

    // PHẢI LỚN HƠN 85% mới thực hiện.
    if (Math.abs(deltaX) <= threshold) {
      return;
    }

    // Vuốt trái = Xóa
    if (deltaX < 0) {
      await handleDelete(prize);
      return;
    }

    // Vuốt phải = Sửa
    if (deltaX > 0 && typeof onEdit === "function") {
      onEdit(prize);
    }
  };

  const handlePointerCancel = () => {
    setSwipeState({
      id: null,
      x: 0,
      startX: 0,
      startY: 0,
      dragging: false,
    });
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      <div className="list">
        {sortedPrizes.length === 0 ? (
          <div className="empty">
            <PackageOpen size={32} />
            <span>Không có quà phù hợp</span>
          </div>
        ) : (
          sortedPrizes.map((prize, index) => {
            const isSwiping = swipeState.id === prize.id;
            const swipeX = isSwiping ? swipeState.x : 0;

            const quantity = Number(prize.quantity || 0);
            const isLowStock = quantity >= 0 && quantity <= 9;

            const firstImage = Array.isArray(prize.images) ? prize.images[0] || "" : typeof prize.images === "string" ? prize.images : "";

            return (
              <div
                key={prize.id || `prize-${index}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {/* ==================================================
                    NỀN PHÍA SAU CARD
                ================================================== */}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#fff",
                    pointerEvents: "none",
                  }}
                />

                {/* ==================================================
                    CARD
                ================================================== */}

                <div
                  className="card"
                  onPointerDown={(event) => handlePointerDown(event, prize)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(event) => handlePointerUp(event, prize)}
                  onPointerCancel={handlePointerCancel}
                  style={{
                    transform: `translateX(${swipeX}px)`,
                    transition: isSwiping && swipeState.dragging ? "none" : "transform 180ms ease",
                    touchAction: "pan-y",
                    userSelect: "none",
                    cursor: isSwiping && swipeState.dragging ? "grabbing" : "default",
                    position: "relative",
                    zIndex: 1,
                    background: "#fff",
                  }}
                >
                  <div className="card-main">
                    <div className="info">
                      <div className="row name">{prize.text || ""}</div>

                      {isLowStock && <div className="row prize-stock-warning">⚠️ Chuẩn bị nhập</div>}

                      <div className="row">
                        <span>Đơn giá: </span>
                        <strong>{formatMoney(prize.unit_cost)}</strong>
                      </div>

                      <div className="row">
                        <span>Đơn vị: </span>
                        <strong>{prize.unit || ""}</strong>
                      </div>

                      <div className="row">
                        <span>Đóng gói: </span>
                        <strong>{prize.packaging ?? 0}</strong>
                      </div>

                      <div className="row">
                        <span>Tồn kho: </span>
                        <strong>{prize.quantity ?? 0}</strong>
                      </div>

                      <div className="row">
                        <span>Ưu tiên: </span>

                        <strong className={prize.priority ? "priority-yes" : "priority-no"}>{prize.priority ? "Có" : "Không"}</strong>
                      </div>

                      {prize.note && <div className={`row prize-note ${getNoteClass(prize.note)}`}>{prize.note}</div>}
                    </div>

                    {/* ==================================================
                        IMAGE
                    ================================================== */}

                    <div className="image-box">
                      {firstImage ? (
                        <img src={firstImage} alt={prize.text || "Quà"} className="image" draggable={false} />
                      ) : (
                        <div className="image-empty">
                          <PackageOpen size={28} />
                        </div>
                      )}

                      {Array.isArray(prize.images) && prize.images.length > 1 && <div className="image-count">{prize.images.length}</div>}
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
