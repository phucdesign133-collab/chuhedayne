// src/components/Popup.jsx

import React from "react";
import { getPopupById } from "../../datas/adminRegistry";
import "../../css/Popup.css";

export default function Popup({
  isOpen,
  onClose,
  onSave,
  categoryId,
  initialData = null,
}) {
  // === 1. CHƯA MỞ → KHÔNG RENDER ===

  if (!isOpen) return null;

  // === 2. TÌM RUỘT POPUP THEO ID ===

  const PopupComponent = getPopupById(categoryId);

  // === 3. RENDER KHUNG + RUỘT ===

  return (
    <div className="events-modal-overlay">
      <div className="events-modal-content">

        {PopupComponent ? (
          <PopupComponent
            onClose={onClose}
            onSave={onSave}
            initialData={initialData}
            categoryId={categoryId}
          />
        ) : (
          <div>
            Chưa có Popup cho chức năng: {categoryId}
          </div>
        )}

      </div>
    </div>
  );
}