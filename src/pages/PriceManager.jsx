import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "../css/Manager.css";

export default function PriceManager({ categoryId, searchTerm, savedData, onCountChange, onEdit }) {
  const [items, setItems] = useState([]);

  // =========================================================
  // HELPERS
  // =========================================================

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const formatMoney = (value) => {
    const number = toNumber(value);

    if (!number) return "";

    return `${Math.round(number).toLocaleString("vi-VN")}đ`;
  };

  // =========================================================
  // LOAD SAVED DATA
  // =========================================================

  useEffect(() => {
    const saved = Array.isArray(savedData)
      ? savedData.filter((item) => {
          if (!item) return false;

          // Chỉ lấy đúng category hiện tại
          if (item.category && item.category !== categoryId) {
            return false;
          }

          return true;
        })
      : [];

    setItems(saved);

    if (onCountChange) {
      onCountChange(saved.length);
    }
  }, [categoryId, savedData, onCountChange]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredItems = useMemo(() => {
    const keyword = String(searchTerm || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      String(item.title || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, searchTerm]);

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (item) => {
    const confirmed = window.confirm(`Xóa "${item.title}" khỏi danh sách giá?`);

    if (!confirmed) return;

    setItems((prev) => {
      const next = prev.filter((current) => String(current.id) !== String(item.id));

      if (onCountChange) {
        onCountChange(next.length);
      }

      return next;
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="manager">
      <div className="list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">Chưa có hạng mục giá</div>
        ) : (
          filteredItems.map((item, index) => (
            <div className="card" key={item.id || `${item.title}-${index}`}>
              <div className="card-main">
                <div className="info">
                  {/* TITLE */}
                  {item.title && <div className="row name">{item.title}</div>}

                  {/* GIÁ NIÊM YẾT */}
                  {toNumber(item.list_price) > 0 && (
                    <div className="row">
                      <span>Giá niêm yết</span>

                      <strong>{formatMoney(item.list_price)}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button type="button" className="action-btn edit-btn" onClick={() => handleEdit(item)} aria-label="Sửa">
                  <Pencil size={18} />
                </button>

                <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(item)} aria-label="Xóa">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
