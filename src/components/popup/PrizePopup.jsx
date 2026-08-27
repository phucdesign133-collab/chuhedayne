// src/components/popup/PrizePopup.jsx

import React, { useEffect, useState } from "react";

export default function PrizePopup({ initialData = null, onSave, onClose }) {
  const [text, setText] = useState("");
  const [unit, setUnit] = useState("");
  const [packaging, setPackaging] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [cost, setCost] = useState("");

  // ============================================================
  // 1. NẠP DỮ LIỆU
  // ============================================================

  useEffect(() => {
    if (initialData) {
      setText(initialData.text || "");
      setCost(initialData.cost ?? "");
      setUnit(initialData.unit || "");
      setPackaging(initialData.packaging ?? "");
      setQuantity(initialData.quantity ?? "");
      setNote(initialData.note || "");

      if (Array.isArray(initialData.images)) {
        setImages(initialData.images);
      } else if (initialData.image) {
        setImages([initialData.image]);
      } else {
        setImages([]);
      }
    } else {
      setText("");
      setCost("");
      setUnit("");
      setPackaging("");
      setQuantity("");
      setNote("");
      setImages([]);
    }
  }, [initialData]);

  // ============================================================
  // 2. NHẬP GIÁ NHẬP
  // ============================================================

  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setCost(rawValue);
  };

  const formatNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  // ============================================================
  // 3. CHỌN ẢNH
  // ============================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  // ============================================================
  // 4. XÓA ẢNH
  // ============================================================

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];

      if (removed && typeof removed !== "string" && removed.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // ============================================================
  // 5. LƯU FORM
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Vui lòng nhập tên món quà!");
      return;
    }

    const costValue = Number(cost) || 0;
    const packagingValue = Number(packaging) || 0;
    const quantityValue = Number(quantity) || 0;

    // Giá vốn / 1 đơn vị
    const unitCost = packagingValue > 0 ? costValue / packagingValue : costValue;

    const formData = {
      id: initialData?.id || null,

      text: text.trim(),

      // Giá nhập thực tế
      cost: unitCost,

      unit: unit.trim(),

      // Số lượng đóng gói
      packaging: packagingValue,

      // Tồn kho
      quantity: quantityValue,

      // Giá vốn / đơn vị
      unit_cost: unitCost,

      // Ưu tiên tự động
      priority: unitCost < 5000,

      // Trạng thái
      is_active: initialData?.is_active ?? true,

      note: note.trim(),

      // Ảnh tạm thời
      images,
    };

    if (typeof onSave !== "function") {
      console.error("PrizePopup: chưa nhận được onSave");
      return;
    }

    onSave(formData);
  };

  // ============================================================
  // 6. UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="events-popup-form">
      {/* TÊN */}

      <div className="events-form-group">
        <label className="events-label">Tên món quà</label>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tên món quà..."
          className="events-input"
          required
        />
      </div>

      {/* GIÁ NHẬP */}

      <div className="events-form-group">
        <label className="events-label">Giá nhập</label>

        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(cost)}
          onChange={handleCostChange}
          placeholder="Nhập giá nhập..."
          className="events-input"
        />
      </div>

      {/* ĐƠN VỊ */}

      <div className="events-form-group">
        <label className="events-label">Đơn vị</label>

        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="VD: cái, hộp, thẻ..." className="events-input" />
      </div>

      {/* ĐÓNG GÓI */}

      <div className="events-form-group">
        <label className="events-label">Đóng gói</label>

        <input
          type="number"
          min="0"
          step="1"
          value={packaging}
          onChange={(e) => setPackaging(e.target.value)}
          placeholder="Nhập số lượng đóng gói..."
          className="events-input"
        />
      </div>

      {/* SỐ LƯỢNG */}

      <div className="events-form-group">
        <label className="events-label">Số lượng trong kho</label>

        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Nhập số lượng..."
          className="events-input"
        />
      </div>

      {/* GHI CHÚ */}

      <div className="events-form-group">
        <label className="events-label">Ghi chú</label>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: tăng 500đ / giảm 300đ..."
          className="events-input"
        />
      </div>

      {/* HÌNH ẢNH */}

      <div className="events-form-group">
        <label className="events-label">Hình ảnh</label>

        <div className="events-upload-row">
          <label className="events-upload-btn">
            Chọn ảnh
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
              className="events-file-input"
            />
          </label>

          <span className="events-image-count">{images.length} ảnh đã chọn</span>
        </div>

        {images.length > 0 && (
          <div className="events-preview-container">
            {images.map((img, index) => {
              const preview = typeof img === "string" ? img : img.preview || img.url;

              return (
                <div key={index} className="events-preview-item">
                  <img src={preview} alt="preview" className="events-preview-img" />

                  <button type="button" onClick={() => handleRemoveImage(index)} className="events-remove-img-btn">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SAVE */}

      <button type="submit" className="events-submit-btn">
        Lưu lại
      </button>
    </form>
  );
}
