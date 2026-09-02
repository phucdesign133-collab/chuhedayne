import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function WarehouseManager({
  searchTerm = "",
  categoryId,
  savedData,
  onCountChange,
  onEdit,
  onDelete,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORMAT NGÀY
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const value = String(dateValue).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (value) => {
    const number = Number(value) || 0;

    return number.toLocaleString("vi-VN");
  };

  // ============================================================
  // LẤY ẢNH
  // ============================================================

  const getImages = (item) => {
    if (
      Array.isArray(item?.images) &&
      item.images.length > 0
    ) {
      return item.images.filter(Boolean);
    }

    return [];
  };

  // ============================================================
  // LOAD WAREHOUSE
  //
  // Chỉ lấy record thuộc category hiện tại.
  // ============================================================

  const fetchItems = async () => {
    if (!categoryId) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("warehouse_items")
        .select("*")
        .eq("category", categoryId)
        .order("date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setItems(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.error(
        "❌ Lỗi tải Warehouse:",
        error,
      );

      alert(
        `Không thể tải kho:\n${
          error?.message ||
          "Lỗi không xác định"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryId]);

  // ============================================================
  // ĐỒNG BỘ savedData
  // ============================================================

  useEffect(() => {
    if (
      !savedData ||
      typeof savedData !== "object"
    ) {
      return;
    }

    if (savedData.category !== categoryId) {
      return;
    }

    setItems((prev) => {
      const exists = prev.some(
        (item) => item.id === savedData.id,
      );

      if (exists) {
        return prev.map((item) =>
          item.id === savedData.id
            ? savedData
            : item,
        );
      }

      return [savedData, ...prev];
    });
  }, [savedData, categoryId]);

  // ============================================================
  // SEARCH
  // ============================================================

  const normalizedSearch = String(
    searchTerm || "",
  )
    .trim()
    .toLowerCase();

  const filteredItems = items.filter(
    (item) => {
      if (!normalizedSearch) {
        return true;
      }

      const title = String(
        item.title || "",
      ).toLowerCase();

      const unit = String(
        item.unit || "",
      ).toLowerCase();

      const source = String(
        item.source || "",
      ).toLowerCase();

      const note = String(
        item.note || "",
      ).toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        unit.includes(normalizedSearch) ||
        source.includes(normalizedSearch) ||
        note.includes(normalizedSearch)
      );
    },
  );

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (
      typeof onCountChange === "function"
    ) {
      onCountChange(
        filteredItems.length,
      );
    }
  }, [
    filteredItems.length,
    onCountChange,
  ]);

  // ============================================================
  // SỬA
  // ============================================================

  const handleEdit = (item) => {
    if (typeof onEdit === "function") {
      onEdit(item);
    }
  };

  // ============================================================
  // XÓA
  // ============================================================

  const handleDelete = async (item) => {
    if (!item?.id) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa "${
        item.title || "vật tư này"
      }" không?`,
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("warehouse_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      await fetchItems();

      if (
        typeof onDelete === "function"
      ) {
        onDelete(item);
      }
    } catch (error) {
      console.error(
        "❌ Lỗi xóa Warehouse:",
        error,
      );

      alert(
        `Không thể xóa vật tư:\n${
          error?.message ||
          "Lỗi không xác định"
        }`,
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      <div className="list">

        {loading ? (
          <div className="empty">
            <span>
              Đang tải kho...
            </span>
          </div>
        ) : filteredItems.length ===
          0 ? (
          <div className="empty">
            <ImageIcon size={32} />

            <span>
              Không có vật tư phù hợp
            </span>
          </div>
        ) : (
          filteredItems.map(
            (item, index) => {
              const images =
                getImages(item);

              const firstImage =
                images[0] || "";

              const quantity =
                Number(item.quantity) ||
                0;

              const unitPrice =
                Number(item.unit_price) ||
                0;

              const usageCount =
                Number(item.usage_count) ||
                0;

              const breakEvenUsage =
                Number(
                  item.break_even_usage,
                ) || 0;

              const costPerUse =
                usageCount > 0
                  ? Math.round(
                      unitPrice /
                        usageCount,
                    )
                  : unitPrice;

              const remainingBreakEven =
                Math.max(
                  breakEvenUsage -
                    usageCount,
                  0,
                );

              return (
                <div
                  className="card"
                  key={
                    item.id ||
                    `warehouse-${index}`
                  }
                >
                  <div className="card-main">

                    <div className="info">

                      {/* TÊN */}
                      <div className="row name">
                        {item.title ||
                          "Vật tư"}
                      </div>

                      {/* SỐ LƯỢNG */}
                      {item.quantity !==
                        null &&
                        item.quantity !==
                          undefined &&
                        item.quantity !==
                          "" && (
                          <div className="row">
                            <span>
                              Số lượng:{" "}
                            </span>

                            <strong>
                              {quantity.toLocaleString(
                                "vi-VN",
                              )}{" "}
                              {item.unit ||
                                ""}
                            </strong>
                          </div>
                        )}

                      {/* GIÁ NHẬP */}
                      {item.unit_price >
                        0 && (
                        <div className="row">
                          <span>
                            Giá nhập:{" "}
                          </span>

                          <strong>
                            {formatMoney(
                              unitPrice,
                            )}
                            đ
                          </strong>
                        </div>
                      )}

                      {/* NGUỒN */}
                      {item.source && (
                        <div className="row">
                          <span>
                            Nguồn:{" "}
                          </span>

                          <strong>
                            {item.source}
                          </strong>
                        </div>
                      )}

                      {/* SỐ LẦN SỬ DỤNG */}
                      {usageCount > 0 && (
                        <div className="row">
                          <span>
                            Đã sử dụng:{" "}
                          </span>

                          <strong>
                            {usageCount} lần{" "}
                            <span>
                              (~
                              {formatMoney(
                                costPerUse,
                              )}
                              đ/lần)
                            </span>
                          </strong>
                        </div>
                      )}

                      {/* TRƯỜNG HỢP CHƯA SỬ DỤNG */}
                      {usageCount === 0 &&
                        unitPrice > 0 &&
                        breakEvenUsage >
                          0 && (
                          <div className="row">
                            <span>
                              Đã sử dụng:{" "}
                            </span>

                            <strong>
                              0 lần (
                              {formatMoney(
                                unitPrice,
                              )}
                              đ/lần)
                            </strong>
                          </div>
                        )}

                      {/* HÒA VỐN */}
                      {breakEvenUsage >
                        0 && (
                        <div className="row">
                          <span>
                            Hòa vốn:{" "}
                          </span>

                          <strong>
                            còn{" "}
                            {
                              remainingBreakEven
                            }{" "}
                            lần
                          </strong>
                        </div>
                      )}

                      {/* NGÀY */}
                      {item.date && (
                        <div className="row">
                          <span>
                            Ngày nhập:{" "}
                          </span>

                          <strong>
                            {formatDate(
                              item.date,
                            )}
                          </strong>
                        </div>
                      )}

                      {/* GHI CHÚ */}
                      {item.note && (
                        <div className="row">
                          <span>
                            Ghi chú:{" "}
                          </span>

                          <strong>
                            {item.note}
                          </strong>
                        </div>
                      )}

                    </div>

                    {/* ẢNH */}

                    <div className="image-box">
                      {firstImage ? (
                        <>
                          <img
                            src={
                              firstImage
                            }
                            alt={
                              item.title ||
                              "Warehouse"
                            }
                            className="image"
                          />

                          {images.length >
                            0 && (
                            <span className="image-count">
                              1 /{" "}
                              {
                                images.length
                              }
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="image-empty">
                          <ImageIcon
                            size={28}
                          />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="card-footer">

                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() =>
                        handleEdit(
                          item,
                        )
                      }
                    >
                      <Pencil size={16} />
                      Sửa
                    </button>

                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() =>
                        handleDelete(
                          item,
                        )
                      }
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>

                  </div>
                </div>
              );
            },
          )
        )}

      </div>
    </div>
  );
}