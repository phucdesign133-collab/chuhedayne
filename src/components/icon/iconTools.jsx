import React from "react";
import { toolsServices } from "../../datas/icons";
import "../../css/iconTab.css";

export default function IconTools({ onOpenCalculator }) {
  const handleItemClick = (item) => {
    // Nếu bấm vào icon thứ 8 (hoặc kiểm tra theo id/name "Máy tính")
    if (item.id === 8 || item.name === "Máy tính") {
      if (onOpenCalculator) onOpenCalculator();
    } else {
      alert(`Đã chọn dịch vụ: ${item.name}`);
    }
  };

  return (
    <div className="icontab-card-wrapper">
      <h3 className="icontab-title">Other Services</h3>
      <div className="icontab-grid">
        {toolsServices.map((item) => (
          <div 
            key={item.id} 
            className="icontab-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="icontab-icon-box" style={{ backgroundColor: item.bg }}>
              {item.icon}
            </div>
            <span className="icontab-label">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}