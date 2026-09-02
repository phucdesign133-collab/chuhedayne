import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Package } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function PurchaseManager({
  searchTerm = "",
  savedData = null,
  onCountChange,
  onEdit,
}) {
  const [purchases, setPurchases] = useState([]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
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
  // EDIT
  // ============================================================

  const handleEdit = (purchase) => {
    if (typeof onEdit === "function") {
      onEdit(purchase);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(
      `Xóa "${purchase.title || "vật tư"}" khỏi danh sách mua hàng?`,
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", purchase.id);

      if (error) throw error;

      setPurchases((prev) =>
        prev.filter((item) => item.id !== purchase.id),
      );
    } catch (error) {
      console.error("❌ Lỗi xóa mua hàng:", error);

      alert(
        `Không thể xóa mua hàng:\n${
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

  const formatQuantity = (value) => {
    const number = Number(value || 0);

    if (Number.isInteger(number)) {
      return number.toLocaleString("vi-VN");
    }

    return number.toLocaleString("vi-VN", {
      maximumFractionDigits: 3,
    });
  };

  const formatPackaging = (value) => {
    if (!value || Number(value) <= 0) return "";

    return formatQuantity(value);
  };

  // ============================================================
  // TOTAL PURCHASE
  // ============================================================

  const totalPurchase = useMemo(() => {
    return filteredPurchases.reduce(
      (total, purchase) =>
        total + Number(purchase.amount || 0),
      0,
    );
  }, [filteredPurchases]);

  // ============================================================
  // SUMMARY
  // GOM THEO TITLE
  // ============================================================

  const purchaseSummary = useMemo(() => {
    const map = new Map();

    filteredPurchases.forEach((purchase) => {
      const title =
        String(purchase.title || "Không tên").trim();

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

      if (
        Number(purchase.packaging || 0) > 0
      ) {
        item.packaging +=
          Number(purchase.quantity || 0) *
          Number(purchase.packaging || 0);
      }
    });

    return Array.from(map.values());
  }, [filteredPurchases]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager purchase-manager">

      {/* ======================================================
          PURCHASE SUMMARY
      ====================================================== */}

      <div
        className="purchase-summary"
        style={{
          position: "fixed",
          top: 90,
          left: 0,
          right: 0,
          zIndex: 20,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "6px",
          }}
        >
          {purchaseSummary.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Chưa có dữ liệu mua hàng
            </div>
          ) : (
            purchaseSummary.map((item) => (
              <div
                key={item.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: "14px",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                <strong>{item.title}</strong>

                <span
                  style={{
                    whiteSpace: "nowrap",
                    color: "#4b5563",
                  }}
                >
                  {formatQuantity(item.quantity)}{" "}
                  {item.unit}
                  {item.packaging > 0 &&
                    ` · ${formatPackaging(item.packaging)}`}
                </span>

                <strong
                  style={{
                    whiteSpace: "nowrap",
                    color: "#b91c1c",
                  }}
                >
                  {formatMoney(item.amount)}
                </strong>
              </div>
            ))
          )}

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              marginTop: "6px",
              paddingTop: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
            }}
          >
            <strong>Tổng mua hàng</strong>

            <strong
              style={{
                color: "#b91c1c",
                fontSize: "15px",
              }}
            >
              {formatMoney(totalPurchase)}
            </strong>
          </div>
        </div>
      </div>

      {/* ======================================================
          LIST
      ====================================================== */}

      <div
        className="list"
        style={{
          paddingTop:
            purchaseSummary.length > 0
              ? `${Math.min(
                  60 + purchaseSummary.length * 28,
                  350,
                )}px`
              : "145px",
        }}
      >
        {filteredPurchases.length === 0 ? (
          <div className="empty">
            <Package size={32} />
            <span>
              Chưa có khoản mua hàng phù hợp
            </span>
          </div>
        ) : (
          filteredPurchases.map((purchase, index) => (
            <div
              className="card"
              key={
                purchase.id ||
                `purchase-${index}`
              }
            >
              <div className="info">

                {/* ==================================================
                    TITLE
                ================================================== */}

                <div className="row name">
                  {purchase.title || ""}
                </div>

                {/* ==================================================
                    QUANTITY
                ================================================== */}

                <div className="row">
                  <span>Số lượng: </span>

                  <strong>
                    {formatQuantity(
                      purchase.quantity,
                    )}{" "}
                    {purchase.unit || ""}
                  </strong>
                </div>

                {/* ==================================================
                    PACKAGING
                ================================================== */}

                {Number(purchase.packaging || 0) > 0 && (
                  <div className="row">
                    <span>Quy cách: </span>

                    {formatPackaging(
                      purchase.packaging,
                    )}
                  </div>
                )}

                {/* ==================================================
                    AMOUNT
                ================================================== */}

                <div className="row">
                  <span>Số tiền: </span>

                  <strong
                    style={{
                      color: "#b91c1c",
                    }}
                  >
                    {formatMoney(
                      purchase.amount,
                    )}
                  </strong>
                </div>

                {/* ==================================================
                    NOTE
                ================================================== */}

                {purchase.note && (
                  <div className="row">
                    <span>Ghi chú: </span>
                    {purchase.note}
                  </div>
                )}

              </div>

              {/* ====================================================
                  FOOTER
              ==================================================== */}

              <div className="card-footer">

                <button
                  type="button"
                  className="action-btn edit-btn"
                  onClick={() =>
                    handleEdit(purchase)
                  }
                >
                  <Pencil size={16} />
                  Sửa
                </button>

                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={() =>
                    handleDelete(purchase)
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