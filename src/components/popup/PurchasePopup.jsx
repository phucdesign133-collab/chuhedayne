import React, { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import "../../css/Popup.css";
import { uploadImagesToStorage } from "../utils/utils";

export default function PurchasePopup({ initialData = null, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [packaging, setPackaging] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [note, setNote] = useState("");

  // ============================================================
  // IMAGE
  //
  // images:
  // - URL string = ảnh đã có trên Supabase
  // - File = ảnh mới vừa chọn, chưa upload
  //
  // KHÔNG lưu blob URL vào state dữ liệu.
  // ============================================================

  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoneyInput = (value) => {
    return String(value ?? "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getRawMoney = (value) => {
    return String(value ?? "").replace(/\D/g, "");
  };

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setTitle("");
      setQuantity("");
      setUnit("");
      setPackaging("");
      setUnitPrice("");
      setNote("");
      setImages([]);
      setActiveImage(0);
      return;
    }

    setTitle(initialData.title || "");

    setQuantity(initialData.quantity !== null && initialData.quantity !== undefined ? String(initialData.quantity) : "");

    setUnit(initialData.unit || "");

    setPackaging(initialData.packaging !== null && initialData.packaging !== undefined ? String(initialData.packaging) : "");

    // Purchase dùng amount làm số tiền trên bill.
    setUnitPrice(initialData.amount !== null && initialData.amount !== undefined ? String(initialData.amount) : "");

    setNote(initialData.note || "");

    const loadedImages = Array.isArray(initialData.images) ? initialData.images : initialData.image_url ? [initialData.image_url] : [];

    setImages(loadedImages);
    setActiveImage(0);
  }, [initialData]);

  // ============================================================
  // IMAGE PREVIEW
  // ============================================================

  /**
   * File mới cần một URL tạm để preview trên UI.
   *
   * QUAN TRỌNG:
   * URL này CHỈ dùng để hiển thị preview.
   * Nó KHÔNG được lưu vào Supabase.
   */
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
  // IMAGE
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

    // ----------------------------------------------------------
    // VẬT TƯ
    // ----------------------------------------------------------

    if (!title.trim()) {
      alert("Vui lòng nhập tên vật tư!");
      return;
    }

    // ----------------------------------------------------------
    // SỐ LƯỢNG
    // ----------------------------------------------------------

    const numericQuantity = Number(quantity) || 0;

    if (numericQuantity <= 0) {
      alert("Vui lòng nhập số lượng!");
      return;
    }

    // ----------------------------------------------------------
    // TỔNG TIỀN
    // ----------------------------------------------------------

    const rawAmount = getRawMoney(unitPrice);
    const numericAmount = Number(rawAmount) || 0;

    if (numericAmount <= 0) {
      alert("Vui lòng nhập đơn giá!");
      return;
    }

    // ----------------------------------------------------------
    // CHECK onSave
    // ----------------------------------------------------------

    if (typeof onSave !== "function") {
      alert("Không thể lưu mua hàng.");
      return;
    }

    setIsSaving(true);

    try {
      // ========================================================
      // UPLOAD ẢNH MỚI
      //
      // URL cũ:
      // giữ nguyên
      //
      // File mới:
      // upload lên Supabase Storage
      // ↓
      // nhận URL thật
      // ========================================================

      const existingImages = images.filter((image) => typeof image === "string");

      const newImageFiles = images.filter((image) => image instanceof File);

      let uploadedImages = [];

      if (newImageFiles.length > 0) {
        uploadedImages = await uploadImagesToStorage(newImageFiles, "purchase");
      }

      // ========================================================
      // GHÉP ẢNH
      // ========================================================

      const finalImages = [...existingImages, ...uploadedImages];

      // ========================================================
      // FORM DATA
      //
      // Purchase:
      // amount = đúng số tiền nhập trên bill.
      // Không tính quantity × unit_price.
      // ========================================================

      const formData = {
        id: initialData?.id || null,

        title: title.trim(),

        quantity: numericQuantity,

        unit: unit.trim(),

        packaging: Number(packaging) || 0,

        amount: numericAmount,

        note: note.trim(),

        images: finalImages,
      };

      console.log("📤 PurchasePopup gửi Grid:", formData);

      // ========================================================
      // SAVE
      // ========================================================

      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu mua hàng.");
      }

      onClose();
    } catch (error) {
      console.error("❌ PurchasePopup save error:", error);

      alert(`Không thể lưu mua hàng:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  const activeImageValue = images[activeImage];
  const activeImagePreview = getImagePreview(activeImageValue);

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      {/* ======================================================
          VẬT TƯ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Vật tư</label>

        <input className="popup-input" placeholder="Ví dụ: Bóng 260" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} />
      </div>

      {/* ======================================================
          SỐ LƯỢNG
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Số lượng</label>

        <div className="popup-inline">
          <input
            className="popup-input"
            inputMode="decimal"
            placeholder="Ví dụ: 2"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
            disabled={isSaving}
          />

          <input className="popup-input" placeholder="Đơn vị" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={isSaving} />
        </div>
      </div>

      {/* ======================================================
          QUY CÁCH
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Quy cách đóng gói</label>

        <input
          className="popup-input"
          inputMode="decimal"
          placeholder="Ví dụ: 100"
          value={packaging}
          onChange={(e) => setPackaging(e.target.value.replace(/[^\d.]/g, ""))}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          ĐƠN GIÁ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Giá nhập</label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Ví dụ: 45.000"
          value={formatMoneyInput(unitPrice)}
          onChange={(e) => setUnitPrice(getRawMoney(e.target.value))}
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

      {/* ======================================================
          GHI CHÚ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Ghi chú</label>

        <textarea className="popup-input popup-textarea" value={note} onChange={(e) => setNote(e.target.value)} disabled={isSaving} />
      </div>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
