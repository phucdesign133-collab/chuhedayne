import React, { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import "../../css/Popup.css";

export default function ContentPopup({ onClose, onSave, initialData = null }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [customer, setCustomer] = useState("");

  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setTitle("");
      setLocation("");
      setDate("");
      setCustomer("");
      setImages([]);
      setActiveImage(0);
      return;
    }

    setTitle(initialData.title || "");
    setLocation(initialData.location || "");
    setDate(initialData.date || "");
    setCustomer(initialData.customer || "");

    const loadedImages = Array.isArray(initialData.images) ? initialData.images : initialData.image_url ? [initialData.image_url] : [];

    setImages(loadedImages);
    setActiveImage(0);
  }, [initialData]);

  // ============================================================
  // DATE
  //
  // UI: DD/MM/YYYY
  // DB: YYYY-MM-DD
  // ============================================================

  const formatDateInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const dateToDatabase = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (digits.length !== 8) {
      return "";
    }

    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    return `${year}-${month}-${day}`;
  };

  const dateToDisplay = (value) => {
    if (!value) return "";

    const raw = String(value);

    if (raw.includes("/")) {
      return formatDateInput(raw);
    }

    const parts = raw.slice(0, 10).split("-");

    if (parts.length !== 3) {
      return raw;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // ============================================================
  // IMAGE
  // ============================================================
  const handleAddImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const newImages = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => {
      const next = [...prev, ...newImages];

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const databaseDate = dateToDatabase(date);

    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề.");
      return;
    }

    if (!databaseDate) {
      alert("Vui lòng nhập ngày theo dạng DD/MM/YYYY.");
      return;
    }

    if (typeof onSave !== "function") {
      alert("Không thể lưu nội dung.");
      return;
    }

    const formData = {
      id: initialData?.id || null,

      title: title.trim(),

      location: location.trim(),

      date: databaseDate,

      customer: customer.trim(),

      images,
    };

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu nội dung.");
      }

      onClose();
    } catch (error) {
      console.error("❌ ContentPopup save error:", error);

      alert(`Không thể lưu nội dung:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form content-popup-form">
      {/* ======================================================
          TIÊU ĐỀ
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Tiêu đề</label>

        <input
          className="popup-input"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          ĐỊA ĐIỂM
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Địa điểm tổ chức</label>

        <input
          className="popup-input"
          placeholder="Địa điểm tổ chức"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          NGÀY
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Ngày tổ chức</label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={initialData && String(date).includes("-") ? dateToDisplay(date) : formatDateInput(date)}
          onChange={(event) => setDate(formatDateInput(event.target.value))}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          KHÁCH HÀNG
      ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Khách hàng</label>

        <input
          className="popup-input"
          placeholder="Nhập tên khách hàng"
          value={customer}
          onChange={(event) => setCustomer(event.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
    HÌNH ẢNH
====================================================== */}

      <div className="popup-row">
        <label className="popup-label">Hình ảnh</label>

        <div className="content-popup-image-box">
          {images.length > 0 ? (
            <img src={images[activeImage]} alt={`Ảnh ${activeImage + 1}`} className="content-popup-main-image" />
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
          FOOTER
      ====================================================== */}

      <div className="popup-footer">
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleAddImages} />

        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
