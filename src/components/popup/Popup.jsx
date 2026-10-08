// src/components/popup/Popup.jsx
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
import BillPopup from "./BillPopup";
import GiftCodePopup from "./GiftCodePopup";
import "../../css/Popup.css";

export default function Popup({ isOpen, onClose, onSave, categoryId, initialData = null, mode = "customer", eventIndex = null, onEditEvent }) {
  if (!isOpen) return null;

  const getPopupTitle = () => {
    const action = initialData && mode !== "event" ? "Cập nhật" : "Thêm mới";
    if (mode === "event") return eventIndex !== null ? "Cập nhật sự kiện" : "Thêm mới sự kiện";
    if (categoryId === "prizes") return `${action} món quà`;
    if (categoryId === "customer-info") return `${action} khách hàng`;
    if (categoryId === "calendar") return `${action} Booking`;
    if (categoryId === "income") return `${action} khoản thu`;
    if (categoryId === "purchase") return `${action} khoản mua`;
    if (categoryId === "shipped-prizes") return `${action} quà đã gửi`;
    if (["costumes", "electronic-equipment", "manual-equipment", "metal-frames", "balloons", "zip-bags", "stamps", "cake-set"].includes(categoryId))
      return `${action} vật tư`;
    if (categoryId === "price-decoration") return `${action} giá trang trí`;
    if (categoryId === "price-party") return `${action} giá biểu diễn`;
    if (categoryId === "bills/gift-orders") return `${action} bill đổi quà`;
    if (categoryId === "gift-codes") return `${action} Gift Code`;
    return `${action} nội dung`;
  };

  const renderPopupContent = () => {
    if (categoryId === "prizes") return <PrizePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    if (categoryId === "customer-info")
      return (
        <CustomerPopup onClose={onClose} onSave={onSave} initialData={initialData} mode={mode} eventIndex={eventIndex} onEditEvent={onEditEvent} />
      );
    if (categoryId === "calendar") return <BookingPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    if (categoryId === "income") return <IncomePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    if (categoryId === "purchase") return <PurchasePopup initialData={initialData} onSave={onSave} onClose={onClose} />;
    if (categoryId === "shipped-prizes") return <ShippedPrizesPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    if (["costumes", "electronic-equipment", "manual-equipment", "metal-frames", "balloons", "zip-bags", "stamps", "cake-set"].includes(categoryId))
      return <WarehousePopup initialData={initialData} categoryId={categoryId} onSave={onSave} onClose={onClose} />;
    if (categoryId === "price-decoration" || categoryId === "price-party")
      return <PricePopup onClose={onClose} onSave={onSave} initialData={initialData} categoryId={categoryId} />;
    if (categoryId === "bills/gift-orders") return <BillPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    if (categoryId === "gift-codes") return <GiftCodePopup onClose={onClose} onSave={onSave} initialData={initialData} />;
    return <ContentPopup onClose={onClose} onSave={onSave} initialData={initialData} />;
  };

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
