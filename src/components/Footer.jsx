// src/components/Footer.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EMOJI_ICONS, hubData } from '../datas/icons';
import '../css/Footer.css';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentActiveIndex = () => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 0;
    if (path.includes('/gallery')) return 1;
    if (path.includes('/balloon')) return 2;
    if (path.includes('/spin')) return 3;
    if (path.includes('/tools')) return 4;
    return 0;
  };

  const activeIndex = getCurrentActiveIndex();

  // Mảng key tương ứng với 5 tab user để lấy màu từ hubData (nếu có)
  const tabKeys = ['content', 'gallery', 'balloon', 'spin', 'tools'];
  const currentKey = tabKeys[activeIndex] || 'content';
  const currentThemeColor = hubData[currentKey]?.themeColor || '#5DADE2';

  const getFollowLeft = () => {
    const positions = ['10%', '30%', '50%', '70%', '90%'];
    return positions[activeIndex] || '10%';
  };

  return (
    <div 
      className="mobile-bottom-nav"
      style={{ '--tab-glow-color': currentThemeColor }}
    >
      <div 
        className={`nav-item ${activeIndex === 0 ? 'active' : ''}`} 
        onClick={() => navigate('/home')}
      >
        <div className="nav-icon">{EMOJI_ICONS.home}</div>
      </div>

      <div 
        className={`nav-item ${activeIndex === 1 ? 'active' : ''}`} 
        onClick={() => navigate('/gallery')}
      >
        <div className="nav-icon">{EMOJI_ICONS.gallery}</div>
      </div>

      <div 
        className={`nav-item ${activeIndex === 2 ? 'active' : ''}`} 
        onClick={() => navigate('/balloon')}
      >
        <div className="nav-icon">{EMOJI_ICONS.balloon}</div>
      </div>

      <div 
        className={`nav-item ${activeIndex === 3 ? 'active' : ''}`} 
        onClick={() => navigate('/spin')}
      >
        <div className="nav-icon">{EMOJI_ICONS.spin}</div>
      </div>

      <div 
        className={`nav-item ${activeIndex === 4 ? 'active' : ''}`} 
        onClick={() => navigate('/tools')}
      >
        <div className="nav-icon">{EMOJI_ICONS.tools}</div>
      </div>

      {/* Cục tròn nổi di chuyển mượt mà theo tab đang chọn */}
      <div className="follow" style={{ left: `calc(${getFollowLeft()} - 35px)` }}></div>
    </div>
  );
}