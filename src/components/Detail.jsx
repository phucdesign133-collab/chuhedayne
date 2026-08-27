import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import { MessageCircle, Phone, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import '../css/Details.css';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchDetailAndRelated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchDetailAndRelated = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy chi tiết bài viết hiện tại
      const { data: currentItem, error: currentError } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;
      setItem(currentItem);
      
      if (currentItem.images && Array.isArray(currentItem.images) && currentItem.images.length > 0) {
        setActiveImage(currentItem.images[0]);
      } else {
        setActiveImage(currentItem.image_url || '');
      }

      // 2. Lấy danh sách bài viết liên quan CÙNG CATEGORY (lọc bỏ bài hiện tại)
      const { data: listData, error: listError } = await supabase
        .from('services')
        .select('*')
        .eq('category', currentItem.category) // Đúng chuyên mục mới cho lên
        .neq('id', id)                         // Trừ bài đang xem ra
        .order('created_at', { ascending: false })
        .limit(6);

      if (!listError) {
        setRelatedPosts(listData || []);
      }

    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    if (dateStr.includes('-') && dateStr.length >= 10) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return <div className="admin-detail-loading">Đang tải dữ liệu...</div>;
  }

  if (!item) {
    return <div className="admin-detail-notfound">Không tìm thấy nội dung bài viết.</div>;
  }

  const imageList = Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : (item.image_url ? [item.image_url] : []);

  const rawTitle = item.description || item.title || 'Chi tiết bài viết';
  const displayTitle = capitalizeFirstLetter(rawTitle);
  const categoryName = item.category ? capitalizeFirstLetter(item.category) : 'Bài viết';
  const rawDateValue = item.date || item.event_date;

  return (
    <div className="admin-detail-container" style={{ paddingBottom: '60px' }}>
      <div className="admin-breadcrumb">
        <span onClick={() => navigate(-1)} className="breadcrumb-link" style={{ cursor: 'pointer' }}>
          All {categoryName}
        </span> &gt; <span>{displayTitle}</span>
      </div>

      {/* Cụm Image phân tầng (Ảnh chính + Ảnh thu nhỏ cuộn ngang) */}
      <div className="admin-detail-image-section">
        <div className="admin-detail-image-box">
          <img 
            src={activeImage || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt="Detail Main" 
            className="admin-main-img"
          />
        </div>

        {imageList.length > 1 && (
          <div className="admin-thumbnail-list" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
            {imageList.map((img, index) => (
              <div 
                key={index} 
                className={`admin-thumbnail-item ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
                style={{ cursor: 'pointer', flexShrink: 0, width: '70px', height: '70px' }}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cụm text thông tin chính (Địa điểm & Ngày tổ chức) */}
      <div className="admin-detail-info-box-userstyle" >
        <div className="info-line">
          <strong>Địa điểm tổ chức:</strong> {item.location || 'Chưa cập nhật'}
        </div>
        <div className="info-line">
          <strong>Ngày tổ chức:</strong> {formatToDDMMYYYY(rawDateValue)}
        </div>
      </div>

      <div className="test-container" >
        {/* Khung liên hệ */}
        <div className="test-contact-card">
          <h3>Liên hệ với chúng tôi</h3>
          <p><strong>Đại diện Phúc Party:</strong> Dương Đỗ Hồng Phúc</p>
          <p><strong>Số điện thoại:</strong> 079.991.0603</p>
          <p><strong>Email:</strong> phucdesign133@gmail.com</p>

          <div className="test-contact-buttons">
            <a href="https://zalo.me/0799910603" target="_blank" rel="noopener noreferrer" className="test-btn zalo-btn">
              <MessageCircle size={18} /> Liên hệ Zalo
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="test-btn whatsapp-btn">
              <Phone size={18} /> Liên hệ WhatsApp
            </a>
          </div>
        </div>

        {/* Bài viết liên quan (Chỉ hiện khi có bài cùng category) */}
        {relatedPosts.length > 0 && (
          <div className="test-section">
            <h3 className="test-section-title">Bài viết liên quan</h3>
            
            <div className="test-slider-wrapper">
              <button className="test-slider-arrow left" onClick={() => scrollSlider("left")}>
                <ChevronLeft size={20} />
              </button>

              <div className="test-slider-container" ref={sliderRef}>
                {relatedPosts.map((post) => {
                  const postImage = (post.images && post.images.length > 0) ? post.images[0] : (post.image_url || 'https://via.placeholder.com/300x200');
                  const postTitle = post.description || post.title || 'Bài viết';
                  return (
                    <div 
                      key={post.id} 
                      className="test-slide-card"
                      onClick={() => navigate(`/detail/${post.id}`)}
                    >
                      <div className="test-slide-img-box">
                        <img src={postImage} alt={postTitle} />
                      </div>
                      <div className="test-slide-content">
                        <h4>{capitalizeFirstLetter(postTitle)}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="test-slider-arrow right" onClick={() => scrollSlider("right")}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
}