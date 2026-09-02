import React from "react";
import PrizePopup from "./PrizePopup";
import CustomerPopup from "./CustomerPopup";
import BookingPopup from "./BookingPopup";
import ContentPopup from "./ContentPopup";
import IncomePopup from "./IncomePopup";
import PurchasePopup from "./PurchasePopup";
import "../../css/Popup.css";

// RENDER POPUP CÁC CHỨC NĂNG
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
    return `${action} nội dung`;
  };

  // ============================================================
  // RENDER BODY THEO CATEGORY
  // ============================================================

  const renderPopupContent = () => {
    // ----------------------------------------------------------
    // PRIZES
    // ----------------------------------------------------------

    if (categoryId === "prizes") {
      return <PrizePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    // ----------------------------------------------------------
    // CUSTOMER
    // ----------------------------------------------------------

    if (categoryId === "customer-info") {
      return <CustomerPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    // ----------------------------------------------------------
    // CALENDAR / BOOKING
    // ----------------------------------------------------------

    if (categoryId === "calendar") {
      return <BookingPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }

    // ----------------------------------------------------------
    // INCOME
    //
    if (categoryId === "income") {
      return <IncomePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    }
    // ============================================================
    // PURCHASE
    // ============================================================

    if (categoryId === "purchase") {
      return <PurchasePopup initialData={initialData} onSave={onSave} onClose={onClose} />;
    }
    // ----------------------------------------------------------
    // CONTENT
    //
    // categoryId lúc này có thể là:
    // birthday
    // wedding
    // thoinoi
    // logo
    // facebook
    // tiktok
    // ...
    //
    // Không dùng categoryId === "content"
    // vì route thực tế là:
    // /admin/content/:categoryId
    // ----------------------------------------------------------

    return <ContentPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
  };

  // ============================================================
  // UI KHUNG POPUP DÙNG CHUNG
  // ============================================================

  return (
    <div className="popup-container">
      <div className="popup-wrapper">
        {/* HEADER */}
        <div className="popup-header">
          <h2 className="popup-title">{getPopupTitle()}</h2>

          <button type="button" className="popup-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="popup-body">{renderPopupContent()}</div>
      </div>
    </div>
  );
}
