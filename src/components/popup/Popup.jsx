// src/components/popup/Popup.jsx

import React from "react";

import PrizePopup from "./PrizePopup";

import "../../css/Popup.css";

export default function Popup({
  isOpen,
  onClose,
  onSave,
  categoryId,
  initialData = null,
}) {
  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER FORM THEO CATEGORY
  // ============================================================

  const renderPopupContent = () => {
    if (categoryId === "prizes") {
      return (
        <PrizePopup
          onClose={onClose}
          onSave={onSave}
          initialData={initialData}
        />
      );
    }

    return (
      <div>
        Chưa có nội dung Popup cho chức năng:{" "}
        {categoryId}
      </div>
    );
  };

  // ============================================================
  // UI KHUNG POPUP DÙNG CHUNG
  // ============================================================

  return (
    <div className="events-modal-overlay">

      <div className="events-modal-content">

        {renderPopupContent()}

      </div>

    </div>
  );
}