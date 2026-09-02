import React, { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export default function WarehousePopup({
  initialData = null,
  categoryId,
  onSave,
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [source, setSource] = useState("");
  const [breakEvenUsage, setBreakEvenUsage] = useState("");
  const [usageCount, setUsageCount] = useState("");
  const [images, setImages] = useState([]);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
  // FORMAT NUMBER
  // ============================================================

  const getRawNumber = (value) => {
    return String(value ?? "").replace(/[^\d]/g, "");
  };

  // ============================================================
  // LOAD INITIAL DATA
  //
  // THÊM MỚI:
  // → Hòa vốn
  // → usageCount = 0
  //
  // SỬA:
  // → Số lần sử dụng
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setTitle("");
      setQuantity("");
      setUnit("");
      setUnitPrice("");
      setSource("");
      setBreakEvenUsage("");
      setUsageCount("");
      setImages([]);
      setNote("");
      return;
    }

    setTitle(initialData.title || "");

    setQuantity(
      initialData.quantity !== null &&
        initialData.quantity !== undefined
        ? String(initialData.quantity)
        : "",
    );

    setUnit(initialData.unit || "");

    setUnitPrice(
      initialData.unit_price !== null &&
        initialData.unit_price !== undefined
        ? String(initialData.unit_price)
        : "",
    );

    setSource(initialData.source || "");

    setBreakEvenUsage(
      initialData.break_even_usage !== null &&
        initialData.break_even_usage !== undefined
        ? String(initialData.break_even_usage)
        : "",
    );

    setUsageCount(
      initialData.usage_count !== null &&
        initialData.usage_count !== undefined
        ? String(initialData.usage_count)
        : "0",
    );

    setImages(
      Array.isArray(initialData.images)
        ? initialData.images.filter(Boolean)
        : [],
    );

    setNote(initialData.note || "");
  }, [initialData]);

  // ============================================================
  // IMAGE → DATA URL
  // ============================================================

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  // ============================================================
  // ADD IMAGES
  // ============================================================

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      const newImages = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const dataUrl = await fileToDataUrl(file);

        newImages.push(dataUrl);
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("❌ Lỗi đọc ảnh:", error);
      alert("Không thể tải ảnh.");
    } finally {
      e.target.value = "";
    }
  };

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = (index) => {
    setImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    // ----------------------------------------------------------
    // TÊN
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
    // ĐƠN GIÁ
    // ----------------------------------------------------------

    const rawUnitPrice = getRawMoney(unitPrice);
    const numericUnitPrice = Number(rawUnitPrice) || 0;

    if (numericUnitPrice <= 0) {
      alert("Vui lòng nhập giá nhập!");
      return;
    }

    // ----------------------------------------------------------
    // HÒA VỐN / SỐ LẦN SỬ DỤNG
    // ----------------------------------------------------------

    let numericBreakEvenUsage = 0;
    let numericUsageCount = 0;

    if (initialData) {
      numericBreakEvenUsage =
        Number(initialData.break_even_usage) || 0;

      numericUsageCount =
        Number(getRawNumber(usageCount)) || 0;
    } else {
      numericBreakEvenUsage =
        Number(getRawNumber(breakEvenUsage)) || 0;

      numericUsageCount = 0;
    }

    // ----------------------------------------------------------
    // CHECK onSave
    // ----------------------------------------------------------

    if (typeof onSave !== "function") {
      alert("Không thể lưu kho.");
      return;
    }

    // ----------------------------------------------------------
    // FORM DATA
    //
    // categoryId do Grid quyết định.
    // date không gửi.
    // DB tự lấy current_date.
    // ----------------------------------------------------------

    const formData = {
      id: initialData?.id || null,

      category: categoryId,

      title: title.trim(),

      quantity: numericQuantity,

      unit: unit.trim(),

      unit_price: numericUnitPrice,

      source: source.trim(),

      break_even_usage: numericBreakEvenUsage,

      usage_count: numericUsageCount,

      images,

      note: note.trim(),
    };

    console.log("📤 WarehousePopup gửi Grid:", formData);

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw (
          result?.error ||
          new Error("Không thể lưu kho.")
        );
      }

      onClose();
    } catch (error) {
      console.error(
        "❌ WarehousePopup save error:",
        error,
      );

      alert(
        `Không thể lưu kho:\n${
          error?.message || "Lỗi không xác định"
        }`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form">

      {/* ======================================================
          TÊN
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Vật tư
        </label>

        <input
          className="popup-input"
          placeholder="Ví dụ: Trang phục MC"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          SỐ LƯỢNG
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Số lượng
        </label>

        <div className="popup-inline">

          <input
            className="popup-input"
            inputMode="decimal"
            placeholder="Ví dụ: 1"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value.replace(
                  /[^\d.]/g,
                  "",
                ),
              )
            }
            disabled={isSaving}
          />

          <input
            className="popup-input"
            placeholder="Đơn vị"
            value={unit}
            onChange={(e) =>
              setUnit(e.target.value)
            }
            disabled={isSaving}
          />

        </div>
      </div>

      {/* ======================================================
          GIÁ NHẬP
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Giá nhập
        </label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Ví dụ: 2.500.000"
          value={formatMoneyInput(unitPrice)}
          onChange={(e) =>
            setUnitPrice(
              getRawMoney(e.target.value),
            )
          }
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          NGUỒN
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Nguồn
        </label>

        <input
          className="popup-input"
          placeholder="Ví dụ: Shopee / Nhà cung cấp ABC"
          value={source}
          onChange={(e) =>
            setSource(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          HÒA VỐN — THÊM MỚI
          ====================================================== */}

      {!initialData && (
        <div className="popup-row">
          <label className="popup-label">
            Hòa vốn
          </label>

          <input
            className="popup-input"
            inputMode="numeric"
            placeholder="Ví dụ: 10 lần"
            value={breakEvenUsage}
            onChange={(e) =>
              setBreakEvenUsage(
                getRawNumber(e.target.value),
              )
            }
            disabled={isSaving}
          />
        </div>
      )}

      {/* ======================================================
          SỐ LẦN SỬ DỤNG — SỬA
          ====================================================== */}

      {initialData && (
        <div className="popup-row">
          <label className="popup-label">
            Số lần sử dụng
          </label>

          <input
            className="popup-input"
            inputMode="numeric"
            placeholder="Ví dụ: 3"
            value={usageCount}
            onChange={(e) =>
              setUsageCount(
                getRawNumber(e.target.value),
              )
            }
            disabled={isSaving}
          />
        </div>
      )}

      {/* ======================================================
          HÌNH ẢNH
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Hình ảnh
        </label>

        <label
          className="popup-input"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: isSaving
              ? "not-allowed"
              : "pointer",
          }}
        >
          <ImagePlus size={18} />
          Thêm ảnh

          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageChange}
            disabled={isSaving}
          />
        </label>

        {images.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  borderRadius: "10px",
                }}
              >
                <img
                  src={image}
                  alt={`Ảnh ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveImage(index)
                  }
                  disabled={isSaving}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    width: "26px",
                    height: "26px",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          GHI CHÚ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Ghi chú
        </label>

        <textarea
          className="popup-input popup-textarea"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          FOOTER
          ====================================================== */}

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