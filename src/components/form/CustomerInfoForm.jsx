// src/components/form/CustomerInfoForm.jsx
import React, { useEffect } from "react";
import "../../css/CustomerInfoForm.css";

export default function CustomerInfoForm({ formData, onChange, onValidityChange }) {
  const name = formData?.name?.trim() || "";
  const phone = formData?.phone?.trim() || "";
  const address = formData?.address?.trim() || "";

  const isValid = name.length > 0 && phone.length > 0 && address.length > 0;

  useEffect(() => {
    if (typeof onValidityChange === "function") {
      onValidityChange(isValid);
    }
  }, [isValid, onValidityChange]);

  return (
    <div className="customer-info-form">
      <div className="customer-info-field">
        <div className="customer-info-input-wrap">
          <input
            id="customer-name"
            className="customer-info-input"
            type="text"
            name="name"
            value={formData?.name || ""}
            onChange={onChange}
            placeholder=" "
            autoComplete="name"
          />

          <label htmlFor="customer-name" className="customer-info-label">
            Tên người nhận
          </label>
        </div>
      </div>

      <div className="customer-info-field">
        <div className="customer-info-input-wrap">
          <input
            id="customer-phone"
            className="customer-info-input"
            type="tel"
            name="phone"
            value={formData?.phone || ""}
            onChange={onChange}
            placeholder=" "
            autoComplete="tel"
          />

          <label htmlFor="customer-phone" className="customer-info-label">
            Số điện thoại người nhận
          </label>
        </div>
      </div>

      <div className="customer-info-field">
        <div className="customer-info-input-wrap">
          <input
            id="customer-address"
            className="customer-info-input"
            type="text"
            name="address"
            value={formData?.address || ""}
            onChange={onChange}
            placeholder=" "
            autoComplete="street-address"
          />

          <label htmlFor="customer-address" className="customer-info-label">
            Địa chỉ nhận quà
          </label>
        </div>
      </div>

      <div className="customer-info-field">
        <div className="customer-info-input-wrap">
          <textarea
            id="customer-note"
            className="customer-info-textarea"
            name="note"
            value={formData?.note || ""}
            onChange={onChange}
            placeholder=" "
            rows="3"
          />

          <label htmlFor="customer-note" className="customer-info-label">
            Ghi chú
          </label>
        </div>
      </div>

      <div className="customer-info-notice">🎁 Quà sẽ được nhận trong vòng 7 ngày kể từ khi đặt hàng thành công.</div>
    </div>
  );
}
