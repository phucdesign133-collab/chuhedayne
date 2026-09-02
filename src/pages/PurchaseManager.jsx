import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Package } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function PurchaseManager({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [purchases, setPurchases] = useState([]);

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
  // GROUP BY DATE
  // ============================================================

  const purchaseGroups = useMemo(() => {
    const groups = new Map();

    filteredPurchases.forEach((purchase) => {
      const date = purchase.date || "unknown";

      if (!groups.has(date)) {
        groups.set(date, []);
      }

      groups.get(date).push(purchase);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  }, [filteredPurchases]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      {/* ======================================================
          PURCHASE SUMMARY
      ====================================================== */}

      <div
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
                  {formatQuantity(item.quantity)} {item.unit}
                  {item.packaging > 0 && ` · ${formatQuantity(item.packaging)}`}
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
          paddingTop: purchaseSummary.length > 0 ? `${Math.min(60 + purchaseSummary.length * 28, 350)}px` : "145px",
        }}
      >
        {filteredPurchases.length === 0 ? (
          <div className="empty">
            <Package size={32} />
            <span>Chưa có khoản mua hàng phù hợp</span>
          </div>
        ) : (
          purchaseGroups.map((group) => (
            <div
              key={group.date}
              style={{
                marginBottom: "18px",
              }}
            >
              {/* ==================================================
                  DATE
              ================================================== */}

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: "7px",
                  padding: "0 4px",
                }}
              >
                {formatDate(group.date)}
              </div>

              {/* ==================================================
                  GROUP
              ================================================== */}

              <div className="card">
                <div
                  className="card-main"
                  style={{
                    padding: 0,
                  }}
                >
                  <ul
                    className="info"
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      background: "#fff",
                      width: "100%",
                    }}
                  >
                    {group.items.map((purchase, index) => (
                      <li
                        className="row"
                        key={purchase.id || `purchase-${group.date}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto auto 10%",
                          gap: "10px",
                          alignItems: "center",
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "11px 8px",
                          borderBottom: index < group.items.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}
                      >
                        {/* ==============================
                              NAME
                          ============================== */}

                        <span
                          className="name"
                          style={{
                            minWidth: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {purchase.title || ""}
                        </span>

                        {/* ==============================
                              QUANTITY
                          ============================== */}

                        <span
                          style={{
                            whiteSpace: "nowrap",
                            textAlign: "right",
                            color: "#4b5563",
                          }}
                        >
                          {formatQuantity(purchase.quantity)} {purchase.unit || ""}
                        </span>

                        {/* ==============================
                              AMOUNT
                          ============================== */}

                        <strong
                          style={{
                            whiteSpace: "nowrap",
                            textAlign: "right",
                            color: "#b91c1c",
                          }}
                        >
                          {formatMoney(purchase.amount)}
                        </strong>

                        {/* ==============================
                              DELETE
                          ============================== */}

                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(purchase)}
                          title="Xóa"
                          aria-label={`Xóa ${purchase.title || "vật tư"}`}
                          style={{
                            justifySelf: "end",
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
