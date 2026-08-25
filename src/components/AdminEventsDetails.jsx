import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPosts } from '../datas/api';
import { eventsCategories } from '../datas/dropdown';
import '../css/Details.css';

export default function AdminEventsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPostDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts();
        const found = (data || []).find(item => String(item.id) === String(id));
        setPost(found || null);
      } catch (error) {
        console.error('Lỗi tải chi tiết bài đăng:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getPostDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="admin-details-loading">Đang tải chi tiết...</div>;
  }

  if (!post) {
    return (
      <div className="admin-details-not-found">
        <p>Không tìm thấy bài đăng hoặc nội dung đã bị xóa.</p>
        <button onClick={() => navigate(-1)} className="admin-details-back-btn">
          ← Quay lại
        </button>
      </div>
    );
  }

  // Tìm thông tin category/mã
  const categoryObj = eventsCategories.find(c => c.id === post.category || c.id === post.image_url) || eventsCategories[0];
  const currentCode = categoryObj.code;

  return (
    <div className="admin-details-wrapper">
      {/* Nút quay lại */}
      <div className="admin-details-header-nav">
        <button onClick={() => navigate(-1)} className="admin-details-back-btn">
          ← Quay lại danh sách
        </button>
      </div>

      <div className="admin-details-card">
        {/* Hình ảnh chính hoặc ảnh nền mặc định */}
        <div className="admin-details-img-container">
          {post.image_url && post.image_url.startsWith('http') ? (
            <img src={post.image_url} alt={post.title} className="admin-details-img" />
          ) : (
            <div className="admin-details-no-img">Mã: {currentCode}</div>
          )}
          <span className="admin-details-code-badge">{currentCode}</span>
        </div>

        {/* Nội dung chi tiết */}
        <div className="admin-details-content">
          <h1 className="admin-details-title" style={{ textTransform: 'capitalize' }}>
            {post.title}
          </h1>

          <div className="admin-details-meta-list">
            {post.description ? (
              post.description.split('|').map((part, idx) => {
                const cleanPart = part.trim();
                if (!cleanPart || cleanPart.startsWith('Mã:')) return null;
                return (
                  <div key={idx} className="admin-details-meta-item">
                    <span>{cleanPart}</span>
                  </div>
                );
              })
            ) : (
              <div className="admin-details-meta-item">Không có mô tả chi tiết</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}