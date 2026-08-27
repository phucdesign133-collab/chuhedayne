// src/components/popup/ListGiftPopup.jsx
import React, { useState } from "react";
import "../../css/ListGift.css";

export default function ListGiftPopup({ isOpen, onClose, basicPrizes, vipPrizes }) {
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' hoặc 'vip'

  if (!isOpen) return null;

  // Lấy danh sách động được truyền từ component cha (đồng bộ với vòng quay)
  const currentList = activeTab === "basic" ? (basicPrizes || []) : (vipPrizes || []);

  return (
    <div className="lg-backdrop" onClick={onClose}>
      <div className="lg-container" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng */}
        <button className="lg-close-btn" onClick={onClose}>&times;</button>

        <h3 className="lg-title">🎁 Danh Sách Quà Tặng</h3>
        <p className="lg-subtitle">Vòng quay sẽ được làm mới sau mỗi 60 giây</p>

        {/* 2 Tab ngang */}
        <div className="lg-tab-container">
          <button
            onClick={() => setActiveTab("basic")}
            className={`lg-tab-btn ${activeTab === "basic" ? "lg-tab-basic-active" : "lg-tab-inactive"}`}
          >
            🎉 Vòng Quay Basic
          </button>
          <button
            onClick={() => setActiveTab("vip")}
            className={`lg-tab-btn ${activeTab === "vip" ? "lg-tab-vip-active" : "lg-tab-inactive"}`}
          >
            💎 Vòng Quay VIP
          </button>
        </div>

        {/* Danh sách 8 món quà */}
        <div className="lg-list-container">
          {currentList.map((item, index) => (
            <div key={index} className="lg-item-row">
              <div className="lg-item-left">
                <span className="lg-item-icon">{item.icon}</span>
                <span className="lg-item-text">{item.text}</span>
              </div>
              <span className="lg-item-badge">#0{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}