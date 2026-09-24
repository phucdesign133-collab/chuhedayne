// src/components/popup/ListGiftPopup.jsx
import React, { useState } from "react";
import "../../css/ListGift.css";

export default function ListGiftPopup({ isOpen, onClose, basicPrizes, vipPrizes }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedGift, setSelectedGift] = useState(null);

  if (!isOpen) return null;

  const currentList = activeTab === "basic" ? basicPrizes || [] : vipPrizes || [];

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
            🎉 Vòng Quay Basic
          </button>
          <button onClick={() => setActiveTab("vip")} className={`lg-tab-btn ${activeTab === "vip" ? "lg-tab-vip-active" : "lg-tab-inactive"}`}>
            💎 Vòng Quay VIP
          </button>
        </div>

        <div className="lg-list-container">
          {currentList.map((item, index) => (
            <div key={index} className="lg-item-row" onClick={() => handleGiftClick(item)}>
              <div className="lg-item-left">
                <span className="lg-item-icon">{item.icon}</span>
                <span className="lg-item-text">{item.text}</span>
              </div>
              <span className="lg-item-badge">#0{index + 1}</span>
            </div>
          ))}
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
