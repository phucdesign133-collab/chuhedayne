import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import '../css/Details.css';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data);
      
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        setActiveImage(data.images[0]);
      } else {
        setActiveImage(data.image_url || '');
      }
    } catch (error) {
      console.error('Lỗi lấy chi tiết:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển đổi ngày sang định dạng dd/mm/yyyy, cấm tuyệt đối render ISO
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

  // Hàm viết hoa chữ cái đầu
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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

  // Lấy tên danh mục từ item (ví dụ: 'birthday' hoặc 'sinh nhật') và viết hoa chữ cái đầu
  const categoryName = item.category ? capitalizeFirstLetter(item.category) : 'Bài viết';

  return (
    <div className="admin-detail-container">
      <div className="admin-breadcrumb">
        <span onClick={() => navigate(-1)} className="breadcrumb-link">All {categoryName}</span> &gt;{' '}
        <span>{displayTitle}</span>
      </div>


      {/* Cụm Image phân tầng (Khung tỷ lệ 1:1, cuộn dọc) */}
      <div className="admin-detail-image-section">
        <div className="admin-detail-image-box">
          <img 
            src={activeImage || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt="Detail Main" 
            className="admin-main-img"
          />
        </div>

        {imageList.length > 1 && (
          <div className="admin-thumbnail-list">
            {imageList.map((img, index) => (
              <div 
                key={index} 
                className={`admin-thumbnail-item ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cụm text thông tin */}
      <div className="admin-detail-info-box-userstyle">
        <div className="info-line">
          <strong>Địa điểm tổ chức:</strong> {item.location || 'Chưa cập nhật'}
        </div>
        <div className="info-line">
          <strong>Ngày tổ chức:</strong> {formatToDDMMYYYY(item.date)}
        </div>
      </div>
    </div>
  );
}