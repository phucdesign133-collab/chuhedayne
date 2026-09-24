// src/components/popup/GiftCodePopup.jsx
import React, { useState } from "react";

export default function GiftCodePopup({ onClose, onSave, initialData = null }) {
  const formatDateForUI = (value) => {
    if (!value) {
      const now = new Date();

      return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    }

    const valueString = String(value);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valueString)) {
      return valueString;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
      const [year, month, day] = valueString.split("-");

      return `${day}/${month}/${year}`;
    }

    return valueString;
  };

  const [type, setType] = useState(initialData?.type || "normal");

  const [code, setCode] = useState(initialData?.code || "");

  const [giftName, setGiftName] = useState(initialData?.giftName || "");

  const [date, setDate] = useState(formatDateForUI(initialData?.date));

  const [customerName, setCustomerName] = useState(initialData?.customerName || "");

  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave({
      ...initialData,
      type,
      code: code.trim(),
      giftName: giftName.trim(),
      date,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      remainingDays: initialData?.remainingDays ?? (type === "voucher" ? 180 : null),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      <div className="popup-form-group">
        <label>Loại</label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            border: "none",
            fontWeight: "700",
            color: "var(--primary-red)",
          }}
        >
          <option value="normal">QUÀ THƯỜNG</option>
          <option value="voucher">VOUCHER</option>
        </select>
      </div>

      <div className="popup-form-group">
        <label>Mã code</label>

        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã code" required />
      </div>

      <div className="popup-form-group">
        <label>Tên món</label>

        <input type="text" value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Nhập tên món" required />
      </div>

      <div className="popup-form-group">
        <label>Ngày</label>

        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="DD/MM/YYYY"
          inputMode="numeric"
          maxLength={10}
          required
        />
      </div>

      <div className="popup-form-group">
        <label>Tên khách hàng</label>

        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nhập tên khách hàng" />
      </div>

      <div className="popup-form-group">
        <label>SĐT khách hàng</label>

        <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Nhập số điện thoại" />
      </div>

      <div className="popup-footer">
        <button type="submit" className="popup-submit">
          Lưu lại
        </button>
      </div>
    </form>
  );
}
