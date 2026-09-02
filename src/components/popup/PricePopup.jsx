import React, { useEffect, useState } from "react";

export default function PricePopup({ onClose, onSave, initialData = null, categoryId }) {
  const [title, setTitle] = useState("");
  const [listPrice, setListPrice] = useState("");

  // =========================================================
  // INIT
  // =========================================================

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");

      setListPrice(initialData.list_price ?? initialData.listPrice ?? initialData.price ?? "");
    } else {
      setTitle("");
      setListPrice("");
    }
  }, [initialData]);

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("Anh chưa nhập tên hạng mục.");
      return;
    }

    const price = Number(listPrice);

    const formData = {
      id: initialData?.id || null,

      category: categoryId || "",

      title: cleanTitle,

      list_price: Number.isFinite(price) && price > 0 ? price : null,
    };

    if (onSave) {
      await onSave(formData);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <form className="popup-form" onSubmit={handleSubmit}>
      {/* =====================================================
          TITLE
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Tên hạng mục</label>

        <input
          type="text"
          className="popup-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nhập tên hạng mục..."
        />
      </div>

      {/* =====================================================
          LIST PRICE
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Giá niêm yết</label>

        <input
          type="number"
          className="popup-input"
          value={listPrice}
          onChange={(event) => setListPrice(event.target.value)}
          placeholder="Nhập giá niêm yết..."
          min="0"
        />
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="popup-footer">
        <button type="button" className="popup-submit" onClick={onClose}>
          Hủy
        </button>

        <button type="submit" className="popup-submit">
          {initialData ? "Cập nhật" : "Lưu"}
        </button>
      </div>
    </form>
  );
}
