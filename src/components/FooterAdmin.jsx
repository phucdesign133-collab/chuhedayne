// src/components/FooterAdmin.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EMOJI_ICONS, hubData } from '../datas/icons';
import '../css/Footer.css';

export default function FooterAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentActiveIndex = () => {
    const path = location.pathname;
    if (path.includes('/admin/content')) return 0;
    if (path.includes('/admin/booking')) return 1;
    if (path.includes('/admin/warehouse')) return 2;
    if (path.includes('/admin/finance')) return 3;
    if (path.includes('/admin/tools')) return 4;
    return 0;
  };

  const activeIndex = getCurrentActiveIndex();

  // Mảng đường dẫn tương ứng để lấy themeColor từ hubData của anh
  const tabKeys = ['content', 'booking', 'warehouse', 'finance', 'tools'];
  const currentKey = tabKeys[activeIndex] || 'content';
  const currentThemeColor = hubData[currentKey]?.themeColor || '#5DADE2';

  const getFollowLeft = () => {
    const positions = ['10%', '30%', '50%', '70%', '90%'];
    return positions[activeIndex] || '10%';
  };

  return (
    <div 
      className="mobile-bottom-nav"
      style={{ '--tab-glow-color': currentThemeColor }} // Truyền chuẩn themeColor vào đây!
    >
      <div className={`nav-item ${activeIndex === 0 ? 'active' : ''}`} onClick={() => navigate('/admin/content')}>
        <span className="nav-icon">{EMOJI_ICONS.content || EMOJI_ICONS.home}</span>
      </div>

      <div className={`nav-item ${activeIndex === 1 ? 'active' : ''}`} onClick={() => navigate('/admin/booking')}>
        <span className="nav-icon">{EMOJI_ICONS.booking || EMOJI_ICONS.goal}</span>
      </div>

      <div className={`nav-item ${activeIndex === 2 ? 'active' : ''}`} onClick={() => navigate('/admin/warehouse')}>
        <span className="nav-icon">{EMOJI_ICONS.supplies}</span>
      </div>

      <div className={`nav-item ${activeIndex === 3 ? 'active' : ''}`} onClick={() => navigate('/admin/finance')}>
        <span className="nav-icon">{EMOJI_ICONS.finance}</span>
      </div>

      <div className={`nav-item ${activeIndex === 4 ? 'active' : ''}`} onClick={() => navigate('/admin/tools')}>
        <span className="nav-icon">{EMOJI_ICONS.settings}</span>
      </div>

      {/* Cục tròn nổi di chuyển theo tab */}
      <div className="follow" style={{ left: `calc(${getFollowLeft()} - 35px)` }}></div>
    </div>
  );
}