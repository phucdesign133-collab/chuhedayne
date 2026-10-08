// src/components/popup/ListGiftPopup.jsx
import React, { useState } from "react";
import "../../css/ListGift.css";

export default function ListGiftPopup({ isOpen, onClose, initialTab = "basic", basicPrizes, pendingGifts = [] }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGift, setSelectedGift] = useState(null);

  if (!isOpen) return null;

  const currentList = activeTab === "basic" ? (basicPrizes || []).slice(0, 8) : pendingGifts || [];

  const handleGiftClick = (item) => {
    setSelectedGift(item);
  };

  const handleImageClose = () => {
    setSelectedGift(null);
  };

  return (
    <div className="lg-backdrop" onClick={onClose}>
      <div className="lg-container" onClick={(e) => e.stopPropagation()}>
        <button className="lg-close-btn" onClick={onClose}>
          &times;
        </button>

        <h3 className="lg-title">🎁 Danh Sách Quà Tặng</h3>
        <p className="lg-subtitle">Vòng quay sẽ được làm mới sau mỗi 15 giây</p>

        <div className="lg-tab-container">
          <button onClick={() => setActiveTab("basic")} className={`lg-tab-btn ${activeTab === "basic" ? "lg-tab-basic-active" : "lg-tab-inactive"}`}>
            Danh sách quà tặng
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`lg-tab-btn ${activeTab === "pending" ? "lg-tab-vip-active" : "lg-tab-inactive"}`}
          >
            Quà Đã Quay Trúng
          </button>
        </div>

        <div className="lg-list-container">
          {currentList.length === 0 ? (
            <div className="lg-empty">Chưa có quà nào.</div>
          ) : (
            currentList.map((item, index) => (
              <div
                key={activeTab === "basic" ? `basic-${index}-${item.id || item.text}` : `pending-${item.id || item.text}`}
                className="lg-item-row"
                onClick={() => handleGiftClick(item)}
              >
                <div className="lg-item-left">
                  <span className="lg-item-icon">{item.icon}</span>
                  <span className="lg-item-text">{item.text}</span>
                </div>

                {activeTab === "basic" ? (
                  <span className="lg-item-badge">#{String(index + 1).padStart(2, "0")}</span>
                ) : (
                  <span className="lg-item-badge">x{item.wonQuantity || 0}</span>
                )}
              </div>
            ))
          )}
        </div>

        {selectedGift && (
          <div className="lg-image-overlay" onClick={handleImageClose}>
            <div className="lg-image-preview" onClick={(e) => e.stopPropagation()}>
              {Array.isArray(selectedGift.images) && selectedGift.images[0] ? (
                <img src={selectedGift.images[0]} alt={selectedGift.text || "Quà tặng"} />
              ) : (
                <div className="lg-image-empty">{selectedGift.icon}</div>
              )}

              <div className="lg-image-close-text">Chạm bất kỳ vị trí nào để đóng</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
