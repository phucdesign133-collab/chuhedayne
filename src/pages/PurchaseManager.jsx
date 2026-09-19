import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/MonthlyList.css";

export default function PurchaseManager({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [purchases, setPurchases] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
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

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải mua hàng:", error);
      setPurchases([]);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // ============================================================
  // NHẬN DATA SAU KHI SAVE
  // ============================================================

  useEffect(() => {
    if (!savedData) return;

    setPurchases((prev) => {
      if (!savedData.id) {
        return [savedData, ...prev];
      }

      const exists = prev.some((item) => item.id === savedData.id);

      return exists ? prev.map((item) => (item.id === savedData.id ? savedData : item)) : [savedData, ...prev];
    });
  }, [savedData]);

  // ============================================================
  // SEARCH
  // ============================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredPurchases = useMemo(() => {
    if (!activeSearchTerm) return purchases;

    return purchases.filter((purchase) => {
      return (
        String(purchase.title || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(purchase.unit || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(purchase.note || "")
          .toLowerCase()
          .includes(activeSearchTerm)
      );
    });
  }, [purchases, activeSearchTerm]);

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredPurchases.length);
    }
  }, [filteredPurchases.length, onCountChange]);

  // ============================================================
  // FORMAT
  // ============================================================

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const formatQuantity = (value) => {
    const number = Number(value || 0);

    if (Number.isInteger(number)) {
      return number.toLocaleString("vi-VN");
    }

    return number.toLocaleString("vi-VN", {
      maximumFractionDigits: 3,
    });
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "Không xác định";

    const [year, month, day] = String(dateValue).slice(0, 10).split("-");

    if (!year || !month || !day) {
      return String(dateValue);
    }

    return `${day}/${month}/${year}`;
  };

  const formatMonth = (dateValue) => {
    if (!dateValue) return "";

    const [year, month] = String(dateValue).slice(0, 7).split("-");

    if (!year || !month) return "";

    return `Tháng ${month}/${year}`;
  };

  // ============================================================
  // TOTAL PURCHASE
  // ============================================================

  const totalPurchase = useMemo(() => {
    return filteredPurchases.reduce((total, purchase) => total + Number(purchase.amount || 0), 0);
  }, [filteredPurchases]);

  // ============================================================
  // SUMMARY
  // GOM THEO TITLE
  // ============================================================

  const purchaseSummary = useMemo(() => {
    const map = new Map();

    filteredPurchases.forEach((purchase) => {
      const title = String(purchase.title || "Không tên").trim();

      if (!map.has(title)) {
        map.set(title, {
          title,
          quantity: 0,
          unit: purchase.unit || "",
          packaging: 0,
          amount: 0,
        });
      }

      const item = map.get(title);

      item.quantity += Number(purchase.quantity || 0);

      item.amount += Number(purchase.amount || 0);

      if (Number(purchase.packaging || 0) > 0) {
        item.packaging += Number(purchase.quantity || 0) * Number(purchase.packaging || 0);
      }
    });

    return Array.from(map.values());
  }, [filteredPurchases]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(`Xóa "${purchase.title || "vật tư"}" khỏi danh sách mua hàng?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("purchases").delete().eq("id", purchase.id);

      if (error) throw error;

      setPurchases((prev) => prev.filter((item) => item.id !== purchase.id));
    } catch (error) {
      console.error("❌ Lỗi xóa mua hàng:", error);

      alert(`Không thể xóa mua hàng:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // ============================================================
  // SWIPE
  // ============================================================
  //
  // Row trượt theo đúng khoảng cách ngón tay.
  //
  // Vuốt trái:
  // - Ngày created_at nằm phía bên phải.
  // - >= 85% width row -> Xóa.
  //
  // Vuốt phải:
  // - Ngày created_at nằm phía bên trái.
  // - >= 85% width row -> Sửa.
  //
  // Dưới 85% -> tự trả row về.
  // Khoảng 30% đã đủ để nhìn thấy ngày rõ ràng.
  // ============================================================

  const handlePointerDown = (event, purchase) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    setSwipeState({
      id: purchase.id,
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

    // Nếu người dùng đang vuốt dọc -> không can thiệp.
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

    const rowWidth = event.currentTarget.getBoundingClientRect().width;

    // Không cho row trượt quá chính chiều rộng của nó.
    const limitedX = Math.max(-rowWidth, Math.min(rowWidth, deltaX));

    setSwipeState((prev) => ({
      ...prev,
      x: limitedX,
      dragging: true,
    }));
  };

  const handlePointerUp = async (event, purchase) => {
    if (swipeState.id !== purchase.id) return;

    const rowWidth = event.currentTarget.getBoundingClientRect().width;
    const threshold = rowWidth * 0.85;
    const deltaX = event.clientX - swipeState.startX;

    setSwipeState({
      id: null,
      x: 0,
      startX: 0,
      startY: 0,
      dragging: false,
    });

    if (Math.abs(deltaX) < threshold) {
      return;
    }

    if (deltaX < 0) {
      await handleDelete(purchase);
      return;
    }

    if (deltaX > 0 && typeof onEdit === "function") {
      onEdit(purchase);
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
  // MONTHLY LIST
  // ============================================================

  const groupedByMonth = useMemo(() => {
    const groups = {};

    filteredPurchases.forEach((purchase) => {
      if (!purchase.date) return;

      const monthKey = String(purchase.date).slice(0, 7);

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(purchase);
    });

    return Object.entries(groups).sort(([monthA], [monthB]) => monthB.localeCompare(monthA));
  }, [filteredPurchases]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      {/* ======================================================
          PURCHASE SUMMARY
      ====================================================== */}

      <div className={`summary purchase-summary${isSummaryOpen ? " summary-open" : ""}`}>
        {!isSummaryOpen ? (
          /* ====================================================
             SUMMARY CLOSED
          ==================================================== */

          <button type="button" className="summary-row purchase-summary-closed" onClick={() => setIsSummaryOpen(true)}>
            <strong>Tổng mua hàng</strong>

            <strong className="summary-negative summary-highlight">{formatMoney(totalPurchase)}</strong>

            <ChevronDown size={20} strokeWidth={2} />
          </button>
        ) : (
          /* ====================================================
             SUMMARY OPEN
          ==================================================== */

          <div className="summary-grid purchase-summary-open">
            {purchaseSummary.length === 0 ? (
              <div className="purchase-summary-empty">Chưa có dữ liệu mua hàng</div>
            ) : (
              purchaseSummary.map((item) => (
                <div key={item.title} className="summary-row purchase-summary-item">
                  <strong>{item.title}</strong>

                  <strong className="summary-negative">{formatMoney(item.amount)}</strong>
                </div>
              ))
            )}

            <div className="summary-row summary-total purchase-summary-total">
              <strong>Tổng mua hàng</strong>

              <div className="purchase-summary-total-right">
                <strong className="summary-negative summary-highlight">{formatMoney(totalPurchase)}</strong>

                <button type="button" className="purchase-summary-toggle" onClick={() => setIsSummaryOpen(false)} aria-label="Thu gọn tổng mua hàng">
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

      <div className="list monthly-list-1 purchase-monthly-list">
        {groupedByMonth.length === 0 ? (
          <div className="empty">
            <Package size={32} />
            <span>Chưa có khoản mua hàng phù hợp</span>
          </div>
        ) : (
          groupedByMonth.map(([monthKey, monthPurchases]) => {
            const monthlyTotal = monthPurchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);

            return (
              <div className="monthly-list-month" key={monthKey}>
                {/* MONTH HEADER */}

                <div className="monthly-list-header">
                  <span className="monthly-list-title">{formatMonth(`${monthKey}-01`)}</span>

                  <strong className="monthly-list-total purchase-monthly-total">{formatMoney(monthlyTotal)}</strong>
                </div>

                {/* MONTH GROUP */}

                <div className="monthly-list-group">
                  {monthPurchases.map((purchase, index) => {
                    const isSwiping = swipeState.id === purchase.id;
                    const swipeX = isSwiping ? swipeState.x : 0;

                    return (
                      <div
                        key={purchase.id || `purchase-${monthKey}-${index}`}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          background: "#fff",
                        }}
                      >
                        {/* ==================================================
                            SWIPE DATE
                        ================================================== */}

                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 14px",
                            boxSizing: "border-box",
                            color: "#6b7280",
                            fontSize: "13px",
                            fontWeight: 600,
                            pointerEvents: "none",
                          }}
                        >
                          <span>{swipeX > 0 ? formatDate(purchase.created_at) : ""}</span>

                          <span>{swipeX < 0 ? formatDate(purchase.created_at) : ""}</span>
                        </div>

                        {/* ==================================================
                            ROW
                        ================================================== */}

                        <div
                          className={`monthly-list-row purchase-monthly-row${index < monthPurchases.length - 1 ? " monthly-list-row-border" : ""}`}
                          onPointerDown={(event) => handlePointerDown(event, purchase)}
                          onPointerMove={handlePointerMove}
                          onPointerUp={(event) => handlePointerUp(event, purchase)}
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
                          {/* NAME */}

                          <div className="monthly-list-source">
                            <Package size={20} strokeWidth={2} />

                            <strong>{purchase.title || ""}</strong>
                          </div>

                          {/* QUANTITY */}

                          <div className="monthly-list-date purchase-monthly-quantity">
                            {formatQuantity(purchase.quantity)} {purchase.unit || ""}
                          </div>

                          {/* AMOUNT */}

                          <div className="monthly-list-amount purchase-monthly-amount">{formatMoney(purchase.amount)}</div>
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
