import React, { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import "../../css/Popup.css";
import { uploadImagesToStorage } from "../utils/utils";

export default function PrizePopup({ initialData = null, onSave, onClose }) {
  const [text, setText] = useState("");
  const [unit, setUnit] = useState("");
  const [packaging, setPackaging] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [cost, setCost] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const fileInputRef = useRef(null);

  // ============================================================
  // NẠP DỮ LIỆU
  // ============================================================

  useEffect(() => {
    if (initialData) {
      setText(initialData.text || "");
      setCost(initialData.cost ?? "");
      setUnit(initialData.unit || "");
      setPackaging(initialData.packaging ?? "");
      setQuantity(initialData.quantity ?? "");
      setNote(initialData.note || "");

      // Hỗ trợ cả:
      // - images: mảng URL
      // - image: URL cũ
      const loadedImages = Array.isArray(initialData.images) ? initialData.images : initialData.image ? [initialData.image] : [];

      setImages(loadedImages);
      setActiveImage(0);
    } else {
      setText("");
      setCost("");
      setUnit("");
      setPackaging("");
      setQuantity("");
      setNote("");
      setImages([]);
      setActiveImage(0);
    }
  }, [initialData]);

  // ============================================================
  // GIÁ NHẬP
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
  // IMAGE PREVIEW
  // ============================================================

  const getImagePreview = (image) => {
    if (typeof image === "string") {
      return image;
    }

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    return "";
  };

  // ============================================================
  // CHỌN ẢNH
  // ============================================================

  const handleAddImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setImages((prev) => {
      const next = [...prev, ...files];

      if (prev.length === 0) {
        setActiveImage(0);
      }

      return next;
    });

    event.target.value = "";
  };

  // ============================================================
  // XÓA ẢNH
  // ============================================================

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = prev.filter((_, imageIndex) => imageIndex !== index);

      if (next.length === 0) {
        setActiveImage(0);
      } else if (index < activeImage) {
        setActiveImage((current) => current - 1);
      } else if (index === activeImage && activeImage >= next.length) {
        setActiveImage(next.length - 1);
      }

      return next;
    });
  };

  // ============================================================
  // ĐIỀU HƯỚNG ẢNH
  // ============================================================

  const handlePreviousImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (!text.trim()) {
      alert("Vui lòng nhập tên món quà!");
      return;
    }

    const costValue = Number(cost) || 0;
    const packagingValue = Number(packaging) || 0;
    const quantityValue = Number(quantity) || 0;

    const unitCost = packagingValue > 0 ? costValue / packagingValue : costValue;

    // ==========================================================
    // ẢNH
    //
    // URL cũ:
    // giữ nguyên
    //
    // File mới:
    // upload lên Supabase Storage
    // ↓
    // nhận URL thật
    // ==========================================================

    const existingImages = images.filter((image) => typeof image === "string");

    const newImageFiles = images.filter((image) => image instanceof File);

    let uploadedImages = [];

    if (newImageFiles.length > 0) {
      uploadedImages = await uploadImagesToStorage(newImageFiles, "prize");
    }

    const finalImages = [...existingImages, ...uploadedImages];

    const formData = {
      id: initialData?.id || null,
      text: text.trim(),
      cost: costValue,
      unit: unit.trim(),
      packaging: packagingValue,
      quantity: quantityValue,
      unit_cost: unitCost,
      priority: unitCost < 5000,
      is_active: initialData?.is_active ?? true,
      note: note.trim(),
      images: finalImages,
    };

    if (typeof onSave !== "function") {
      console.error("❌ PrizePopup: onSave không tồn tại");

      alert("Không thể lưu món quà.");
      return;
    }

    setIsSaving(true);

    try {
      console.log("📤 PrizePopup gửi:", formData);

      const result = await onSave(formData);

      console.log("📥 PrizePopup nhận:", result);

      if (!result || result.success !== true) {
        const error = result?.error || new Error("Không thể lưu món quà.");

        throw error;
      }

      onClose();
    } catch (error) {
      console.error("❌ PrizePopup save error:", error);

      alert(`Không thể lưu món quà:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  // ============================================================

  const activeImageValue = images[activeImage];
  const activeImagePreview = getImagePreview(activeImageValue);

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      <div className="popup-row">
        <label className="popup-label">Tên món quà</label>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tên món quà..."
          className="popup-input"
          required
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Giá nhập</label>

        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(cost)}
          onChange={handleCostChange}
          placeholder="Nhập giá nhập..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Đơn vị</label>

        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="VD: cái, hộp, thẻ..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Đóng gói</label>

        <input
          type="number"
          min="0"
          step="1"
          value={packaging}
          onChange={(e) => setPackaging(e.target.value)}
          placeholder="Nhập số lượng đóng gói..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Số lượng trong kho</label>

        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Nhập số lượng..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Ghi chú</label>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: tăng 500đ / giảm 300đ..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          HÌNH ẢNH
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Hình ảnh</label>

        <div className="content-popup-image-box">
          {activeImagePreview ? (
            <img src={activeImagePreview} alt={`Ảnh ${activeImage + 1}`} className="content-popup-main-image" />
          ) : (
            <div className="content-popup-image-empty">Chưa có hình ảnh</div>
          )}

          {/* THANH ĐIỀU KHIỂN */}

          <div className="content-popup-image-controls">
            {/* TRÁI - THÊM ẢNH */}

            <button
              type="button"
              className="content-popup-image-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              aria-label="Thêm ảnh"
            >
              <Plus size={20} />
            </button>

            {/* GIỮA - ĐIỀU HƯỚNG + SỐ ẢNH */}

            <div className="content-popup-image-nav">
              {images.length > 1 && (
                <button type="button" className="content-popup-image-btn" onClick={handlePreviousImage} disabled={isSaving} aria-label="Ảnh trước">
                  ‹
                </button>
              )}

              <span className="content-popup-image-count">{images.length > 0 ? `${activeImage + 1} / ${images.length}` : "0 / 0"}</span>

              {images.length > 1 && (
                <button type="button" className="content-popup-image-btn" onClick={handleNextImage} disabled={isSaving} aria-label="Ảnh tiếp theo">
                  ›
                </button>
              )}
            </div>

            {/* PHẢI - XÓA ẢNH */}

            <button
              type="button"
              className="content-popup-image-btn"
              onClick={() => handleRemoveImage(activeImage)}
              disabled={isSaving || images.length === 0}
              aria-label="Xóa ảnh"
            >
              <X size={18} />
            </button>
          </div>

          {/* INPUT FILE ẨN */}

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="popup-file-input" onChange={handleAddImages} />
        </div>
      </div>

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
