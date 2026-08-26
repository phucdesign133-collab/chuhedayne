// src/components/Carousel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import '../css/Carousel.css';

export default function Carousel() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % items.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  // Bấm vào card sẽ dẫn thẳng tới trang Detail của bài viết đó
  const handleCardClick = () => {
    const currentItem = items[current];
    if (currentItem && currentItem.id) {
      navigate(`/posts/${currentItem.id}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="carousel-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="carousel-error">Lỗi tải dữ liệu: {error}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="carousel-empty">Không có dữ liệu hiển thị</div>;
  }

  const currentItem = items[current] || {};
  
  let displayImage = 'https://via.placeholder.com/600x600?text=No+Image';
  if (Array.isArray(currentItem.images) && currentItem.images.length > 0) {
    displayImage = currentItem.images[0]?.preview || currentItem.images[0] || displayImage;
  } else if (currentItem.image_url) {
    displayImage = currentItem.image_url;
  }

  const displayTitle = currentItem.title || currentItem.description || 'Khoảnh khắc';
  const displayLocation = currentItem.location || '';
  const displayDate = formatDate(currentItem.date);

  return (
    <div className="custom-carousel-container">
      <div 
        className="carousel-card-wrapper" 
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div 
          className="carousel-card-active"
          style={{
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <div className="carousel-image-box">
            <img src={displayImage} alt={displayTitle} />
          </div>
          <div className="carousel-text-box">
            <h3 className="carousel-title">{displayTitle}</h3>
            {displayLocation && <p className="carousel-location">📍 {displayLocation}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}