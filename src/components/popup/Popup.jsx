import React from "react";

import PrizePopup from "./PrizePopup";
import CustomerPopup from "./CustomerPopup";
import BookingPopup from "./BookingPopup";
import ContentPopup from "./ContentPopup";
import IncomePopup from "./IncomePopup";
import PurchasePopup from "./PurchasePopup";
import ShippedPrizesPopup from "./ShippedPrizesPopup";
import WarehousePopup from "./WarehousePopup";
import PricePopup from "./PricePopup";

import "../../css/Popup.css";

export default function Popup({ isOpen, onClose, onSave, categoryId, initialData = null }) {
  if (!isOpen) return null;

  // ============================================================
  // TITLE
  // ============================================================

  const getPopupTitle = () => {
    const action = initialData ? "Cập nhật" : "Thêm mới";

    if (categoryId === "prizes") {
      return `${action} món quà`;
    }

    if (categoryId === "customer-info") {
      return `${action} khách hàng`;
    }

    if (categoryId === "calendar") {
      return `${action} Booking`;
    }

    if (categoryId === "income") {
      return `${action} khoản thu`;
    }

    if (categoryId === "purchase") {
      return `${action} khoản mua`;
    }

    if (categoryId === "shipped-prizes") {
      return `${action} quà đã gửi`;
    }

    if (["balloons", "zip-bags", "stamps", "costumes"].includes(categoryId)) {
      return `${action} vật tư`;
    }

    // ==========================================================
    // PRICE
    // ==========================================================

    if (categoryId === "price-decoration") {
      return `${action} giá trang trí`;
    }

    if (categoryId === "price-party") {
      return `${action} giá biểu diễn`;
    }

    return `${action} nội dung`;
  };

  // ============================================================
  // POPUP CONTENT
  // ============================================================

  const renderPopupContent = () => {
    if (categoryId === "prizes") {
      return <PrizePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    if (categoryId === "customer-info") {
      return <CustomerPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    if (categoryId === "calendar") {
      return <BookingPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    if (categoryId === "income") {
      return <IncomePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    if (categoryId === "purchase") {
      return <PurchasePopup initialData={initialData} onSave={onSave} onClose={onClose} />;
    }

    if (categoryId === "shipped-prizes") {
      return <ShippedPrizesPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    if (["balloons", "zip-bags", "stamps", "costumes"].includes(categoryId)) {
      return <WarehousePopup initialData={initialData} categoryId={categoryId} onSave={onSave} onClose={onClose} />;
    }

    // ==========================================================
    // PRICE
    // ==========================================================

    if (categoryId === "price-decoration" || categoryId === "price-party") {
      return <PricePopup onClose={onClose} onSave={onSave} initialData={initialData} categoryId={categoryId} />;
    }

    // ==========================================================
    // CONTENT
    // ==========================================================

    return <ContentPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="popup-container">
      <div className="popup-wrapper">
        <div className="popup-header">
          <h2 className="popup-title">{getPopupTitle()}</h2>

          <button type="button" className="popup-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="popup-body">{renderPopupContent()}</div>
      </div>
    </div>
  );
}
