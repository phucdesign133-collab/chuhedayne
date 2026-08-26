// src/components/HubIcon.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hubData } from '../datas/icons';
import '../css/HubIcon.css';

export default function HubIcon({ currentTab = 'content' }) {
  const navigate = useNavigate();
  const currentHub = hubData[currentTab] || hubData.content;

  // Hàm xử lý khi click vào từng item
 const handleItemClick = (item) => {
    if (item.id === 'logout') {
      // 1. Xóa tất cả các key liên quan đến quyền admin/token có thể app đang lưu
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      localStorage.clear(); // Nếu muốn xóa sạch sành sanh mọi thứ trong kho lưu trữ tạm

      // 2. Ép trình duyệt tải lại hoàn toàn từ đầu về trang chủ user
      window.location.href = "/"; 
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="hub-container" style={{ '--hub-bg': currentHub.themeColor }}>
      

      {/* Vòng lặp các cụm section */}
      {currentHub.sections && currentHub.sections.length > 0 ? (
        currentHub.sections.map((sec, secIndex) => (
          <div key={secIndex} className="hub-section">
            <h2 className="section-title">{sec.sectionName}</h2>
            
            {/* Lưới icon chuẩn 4 cột */}
            <div className="hub-grid-4cols">
              {sec.items.map((item) => (
                <div 
                  key={item.id} 
                  className="hub-icon-card"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="icon-wrapper">
                    <span className="icon-symbol">{item.icon}</span>
                  </div>
                  <span className="icon-name">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="hub-empty">
          <p>Tính năng này đang được cập nhật...</p>
        </div>
      )}
    </div>
  );
}