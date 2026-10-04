import React, { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import "../../css/Popup.css";
import "../../css/PricePopup.css";
import { uploadImagesToStorage } from "../utils/utils";

const createCode = (value) => {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return normalized || `PRICE_${Date.now()}`;
};

const createEmptyMaterial = () => ({
  name: "",
  quantity: "",
  unit_price: "",
  add_next: false,
});

const calculateCost = (materials) => {
  return materials.reduce((total, material) => {
    const quantity = Number(material.quantity) || 0;
    const unitPrice = Number(material.unit_price) || 0;

    return total + quantity * unitPrice;
  }, 0);
};

export default function PricePopup({ initialData = null, onSave, onClose, categoryId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [materials, setMaterials] = useState([createEmptyMaterial()]);
  const [outsPrice, setOutsPrice] = useState("");
  const [images, setImages] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const fileInputRef = useRef(null);

  // ============================================================
  // NẠP DỮ LIỆU
  // ============================================================

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCode(initialData.code || createCode(initialData.title || ""));
      setListPrice(initialData.list_price ?? initialData.listPrice ?? initialData.price ?? "");
      setOutsPrice(initialData.outs_price ?? initialData.outsPrice ?? "");

      const loadedMaterials =
        Array.isArray(initialData.materials) && initialData.materials.length > 0
          ? initialData.materials.map((material, index, array) => ({
              name: material?.name || "",
              quantity: material?.quantity ?? "",
              unit_price: material?.unit_price ?? "",
              add_next: index < array.length - 1,
            }))
          : [createEmptyMaterial()];

      setMaterials(loadedMaterials);

      const loadedImages = Array.isArray(initialData.images) ? initialData.images : initialData.image ? [initialData.image] : [];

      setImages(loadedImages);
      setActiveImage(0);
    } else {
      setTitle("");
      setDescription("");
      setCode("");
      setListPrice("");
      setMaterials([createEmptyMaterial()]);
      setOutsPrice("");
      setImages([]);
      setActiveImage(0);
    }
  }, [initialData]);

  // ============================================================
  // FORMAT GIÁ
  // ============================================================

  const handlePriceChange = (setter) => (event) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    setter(rawValue);
  };

  const formatNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  // ============================================================
  // VẬT TƯ
  // ============================================================

  const handleMaterialChange = (index, field, value) => {
    setMaterials((prev) => prev.map((material, materialIndex) => (materialIndex === index ? { ...material, [field]: value } : material)));
  };

  const handleMaterialToggle = (index) => {
    setMaterials((prev) => {
      const next = [...prev];
      const checked = !next[index].add_next;

      next[index] = { ...next[index], add_next: checked };

      if (checked && index === next.length - 1) {
        next.push(createEmptyMaterial());
      }

      if (!checked && index < next.length - 1) {
        next.splice(index + 1);
      }

      return next;
    });
  };

  const costPrice = calculateCost(materials);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      alert("Anh chưa nhập tên hạng mục.");
      return;
    }

    const priceValue = Number(listPrice) || 0;
    const outsPriceValue = Number(outsPrice) || 0;

    const cleanMaterials = materials
      .map((material) => ({
        name: String(material.name || "").trim(),
        quantity: Number(material.quantity) || 0,
        unit_price: Number(material.unit_price) || 0,
      }))
      .filter((material) => material.name || material.quantity > 0 || material.unit_price > 0);

    const finalCode = initialData?.code || code || createCode(cleanTitle);

    // ==========================================================
    // ẢNH
    // ==========================================================

    const existingImages = images.filter((image) => typeof image === "string");
    const newImageFiles = images.filter((image) => image instanceof File);

    let uploadedImages = [];

    if (newImageFiles.length > 0) {
      uploadedImages = await uploadImagesToStorage(newImageFiles, "price");
    }

    const finalImages = [...existingImages, ...uploadedImages];

    const formData = {
      id: initialData?.id || null,
      code: finalCode,
      category: categoryId || initialData?.category || "",
      title: cleanTitle,
      description: cleanDescription,
      list_price: priceValue,
      materials: cleanMaterials,
      cost_price: calculateCost(cleanMaterials),
      outs_price: outsPriceValue,
      images: finalImages,
    };

    if (typeof onSave !== "function") {
      console.error("❌ PricePopup: onSave không tồn tại");
      alert("Không thể lưu hạng mục.");
      return;
    }

    setIsSaving(true);

    try {
      console.log("📤 PricePopup gửi:", formData);

      const result = await onSave(formData);

      console.log("📥 PricePopup nhận:", result);

      if (!result || result.success !== true) {
        const error = result?.error || new Error("Không thể lưu hạng mục.");
        throw error;
      }

      onClose();
    } catch (error) {
      console.error("❌ PricePopup save error:", error);
      alert(`Không thể lưu hạng mục:\n${error?.message || "Lỗi không xác định"}`);
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
        <label className="popup-label">Tên hạng mục</label>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nhập tên hạng mục..."
          className="popup-input"
          required
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Mô tả</label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Nhập mô tả hạng mục..."
          className="popup-input"
          rows="4"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Giá niêm yết</label>

        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(listPrice)}
          onChange={handlePriceChange(setListPrice)}
          placeholder="Nhập giá niêm yết..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Vật tư</label>

        <div className="price-popup-materials">
          {materials.map((material, index) => (
            <div className="price-popup-material-row" key={index}>
              <input
                type="text"
                value={material.name}
                onChange={(event) => handleMaterialChange(index, "name", event.target.value)}
                placeholder="Tên vật tư"
                className="popup-input price-popup-material-name"
                disabled={isSaving}
              />

              <input
                type="number"
                min="0"
                step="1"
                value={material.quantity}
                onChange={(event) => handleMaterialChange(index, "quantity", event.target.value)}
                placeholder="SL"
                className="popup-input price-popup-material-quantity"
                disabled={isSaving}
              />

              <input
                type="text"
                inputMode="numeric"
                value={formatNumber(material.unit_price)}
                onChange={(event) => handleMaterialChange(index, "unit_price", event.target.value.replace(/\D/g, ""))}
                placeholder="Đơn giá"
                className="popup-input price-popup-material-price"
                disabled={isSaving}
              />

              <label className="price-popup-material-check">
                <input type="checkbox" checked={material.add_next} onChange={() => handleMaterialToggle(index)} disabled={isSaving} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="popup-row">
        <label className="popup-label">Giá out-srouce</label>

        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(outsPrice)}
          onChange={handlePriceChange(setOutsPrice)}
          placeholder="Nhập giá out-srouce..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Hình ảnh</label>

        <div className="content-popup-image-box">
          {activeImagePreview ? (
            <img src={activeImagePreview} alt={`Ảnh ${activeImage + 1}`} className="content-popup-main-image" />
          ) : (
            <div className="content-popup-image-empty">Chưa có hình ảnh</div>
          )}

          <div className="content-popup-image-controls">
            <button
              type="button"
              className="content-popup-image-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              aria-label="Thêm ảnh"
            >
              <Plus size={20} />
            </button>

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

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="popup-file-input" onChange={handleAddImages} />
        </div>
      </div>

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : initialData ? "Cập nhật" : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
