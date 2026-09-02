import React, { useEffect, useState } from "react";

export default function PurchasePopup({
  initialData = null,
  onSave,
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [packaging, setPackaging] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
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

    setPackaging(
      initialData.packaging !== null &&
        initialData.packaging !== undefined
        ? String(initialData.packaging)
        : "",
    );

    setUnitPrice(
      initialData.unit_price !== null &&
        initialData.unit_price !== undefined
        ? String(initialData.unit_price)
        : "",
    );

    setNote(initialData.note || "");
  }, [initialData]);

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
    // ĐƠN GIÁ
    // ----------------------------------------------------------

    const rawUnitPrice = getRawMoney(unitPrice);
    const numericUnitPrice = Number(rawUnitPrice) || 0;

    if (numericUnitPrice <= 0) {
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

    // ----------------------------------------------------------
    // FORM DATA
    //
    // amount sẽ được Grid tính:
    // quantity × unit_price
    //
    // date không gửi.
    // Supabase tự động lấy current_date.
    // ----------------------------------------------------------

    const formData = {
      id: initialData?.id || null,

      title: title.trim(),

      quantity: numericQuantity,

      unit: unit.trim(),

      packaging: Number(packaging) || 0,

      unit_price: numericUnitPrice,

      note: note.trim(),
    };

    console.log("📤 PurchasePopup gửi Grid:", formData);

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw (
          result?.error ||
          new Error("Không thể lưu mua hàng.")
        );
      }

      onClose();
    } catch (error) {
      console.error("❌ PurchasePopup save error:", error);

      alert(
        `Không thể lưu mua hàng:\n${
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
          VẬT TƯ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Vật tư
        </label>

        <input
          className="popup-input"
          placeholder="Ví dụ: Bóng 260"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            placeholder="Ví dụ: 2"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value.replace(/[^\d.]/g, ""),
              )
            }
            disabled={isSaving}
          />

          <input
            className="popup-input"
            placeholder="Đơn vị"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={isSaving}
          />

        </div>
      </div>

      {/* ======================================================
          QUY CÁCH
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Quy cách
        </label>

        <input
          className="popup-input"
          inputMode="decimal"
          placeholder="Ví dụ: 100"
          value={packaging}
          onChange={(e) =>
            setPackaging(
              e.target.value.replace(/[^\d.]/g, ""),
            )
          }
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          ĐƠN GIÁ
          ====================================================== */}

      <div className="popup-row">
        <label className="popup-label">
          Đơn giá
        </label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Ví dụ: 45.000"
          value={formatMoneyInput(unitPrice)}
          onChange={(e) =>
            setUnitPrice(getRawMoney(e.target.value))
          }
          disabled={isSaving}
        />
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
          onChange={(e) => setNote(e.target.value)}
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