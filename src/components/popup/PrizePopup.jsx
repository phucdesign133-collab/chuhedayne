import React, { useEffect, useState } from "react";

export default function PrizePopup({
  initialData = null,
  onSave,
  onClose,
}) {
  const [text, setText] = useState("");
  const [unit, setUnit] = useState("");
  const [packaging, setPackaging] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [cost, setCost] = useState("");

  const [isSaving, setIsSaving] = useState(false);

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

      if (initialData.image) {
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
  // GIÁ NHẬP
  // ============================================================

  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setCost(rawValue);
  };

  const formatNumber = (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return Number(value).toLocaleString("vi-VN");
  };

  // ============================================================
  // CHỌN ẢNH
  // ============================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [
      ...prev,
      ...previews,
    ]);

    e.target.value = "";
  };

  // ============================================================
  // XÓA ẢNH
  // ============================================================

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];

      if (
        removed &&
        typeof removed !== "string" &&
        removed.preview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
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

    const unitCost =
      packagingValue > 0
        ? costValue / packagingValue
        : costValue;

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
      images,
    };

    if (typeof onSave !== "function") {
      console.error(
        "❌ PrizePopup: onSave không tồn tại"
      );
      alert("Không thể lưu món quà.");
      return;
    }

    setIsSaving(true);

    try {
      console.log(
        "📤 PrizePopup gửi:",
        formData
      );

      const result = await onSave(formData);

      console.log(
        "📥 PrizePopup nhận:",
        result
      );

      if (!result || result.success !== true) {
        const error =
          result?.error ||
          new Error(
            "Không thể lưu món quà."
          );

        throw error;
      }

      onClose();
    } catch (error) {
      console.error(
        "❌ PrizePopup save error:",
        error
      );

      alert(
        `Không thể lưu món quà:\n${
          error?.message ||
          "Lỗi không xác định"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="popup-form"
    >

      <div className="popup-row">
        <label className="popup-label">
          Tên món quà
        </label>

        <input
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Nhập tên món quà..."
          className="popup-input"
          required
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">
          Giá nhập
        </label>

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
        <label className="popup-label">
          Đơn vị
        </label>

        <input
          type="text"
          value={unit}
          onChange={(e) =>
            setUnit(e.target.value)
          }
          placeholder="VD: cái, hộp, thẻ..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">
          Đóng gói
        </label>

        <input
          type="number"
          min="0"
          step="1"
          value={packaging}
          onChange={(e) =>
            setPackaging(e.target.value)
          }
          placeholder="Nhập số lượng đóng gói..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">
          Số lượng trong kho
        </label>

        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="Nhập số lượng..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">
          Ghi chú
        </label>

        <input
          type="text"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          placeholder="VD: tăng 500đ / giảm 300đ..."
          className="popup-input"
          disabled={isSaving}
        />
      </div>

      {/* HÌNH ẢNH — NẰM TRONG BODY POPUP CHUNG */}

      <div className="popup-row">
        <label className="popup-label">
          Hình ảnh
        </label>

        <div className="popup-upload">
          <label className="popup-upload-btn">
            Chọn ảnh

            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
              className="popup-file-input"
              disabled={isSaving}
            />
          </label>

          <span className="popup-image-count">
            {images.length} ảnh đã chọn
          </span>
        </div>

        {images.length > 0 && (
          <div className="popup-preview">
            {images.map((img, index) => {
              const preview =
                typeof img === "string"
                  ? img
                  : img.preview || img.url;

              return (
                <div
                  key={index}
                  className="popup-preview-item"
                >
                  <img
                    src={preview}
                    alt="preview"
                    className="popup-preview-img"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage(index)
                    }
                    className="popup-remove-img"
                    disabled={isSaving}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="popup-footer">
        <button
          type="submit"
          className="popup-submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Đang đẩy lên mây..."
            : "Lưu lại"}
        </button>
      </div>

    </form>
  );
}