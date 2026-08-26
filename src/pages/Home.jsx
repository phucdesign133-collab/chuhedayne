import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import '../css/Home.css';

export default function Home() {
  const navigate = useNavigate();
  // Dữ liệu có thể được nhận từ API hoặc props sau này
  const [posts] = useState([]);
  const [loading] = useState(false);

  return (
    <div className="home-page-container">
      <div className="home-header-section">
        <h1 className="home-title">Recents</h1>
        <p className="home-subtitle">*Guten Tag!* Những khoảnh khắc gần đây...</p>
      </div>

      <div className="home-carousel-wrapper">
        {loading ? (
          <div className="home-loading">Đang tải...</div>
        ) : (
          <Carousel items={posts} />
        )}
      </div>
    </div>
  );
}