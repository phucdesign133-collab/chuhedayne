import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Grid.css';

export default function AdminEventsGrid({ 
  isAdmin = true, 
  posts = [], 
  loading = false, 
  currentCategoryLabel = '', 
  currentCode = '', 
  onOpenAdd, 
  onEdit, 
  onDelete 
}) {
  const navigate = useNavigate();

  return (
    <div className="admin-events-grid-wrapper">
      <div className="admin-events-grid-container">
        <div className="admin-events-grid-header-row">
          <h6 className="admin-events-grid-title">Danh sách {currentCategoryLabel} hiện có:</h6>
          {isAdmin && (
            <button
              onClick={onOpenAdd}
              className="admin-events-grid-add-btn"
            >
              + Thêm mới
            </button>
          )}
        </div>

        {loading ? (
          <div className="admin-events-grid-loading">Đang tải danh sách...</div>
        ) : posts.length === 0 ? (
          <div className="admin-events-grid-empty">Chưa có dữ liệu cho mục này.</div>
        ) : (
          <div className="admin-events-grid-list">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="admin-events-grid-card" 
                onClick={() => navigate(`/admin/posts/${post.id}`)}
              >
               

                <div className="admin-events-grid-card-content">
                  {/* Sử dụng JS kết hợp CSS để ép viết hoa chữ cái đầu hoàn hảo */}
                  <h3 className="admin-events-grid-card-title">
                    {post.title ? post.title.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase()) : ''}
                  </h3>
                
                  <div className="admin-events-grid-info-list">
                    {post.description?.split('|').map(
                      (part, idx) =>
                        part.trim() && (
                          <div key={idx} className="admin-events-grid-info-item">
                            <span>{part.trim()}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="admin-events-grid-card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(post);
                      }}
                      className="admin-events-grid-icon-btn edit"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(post.id);
                      }}
                      className="admin-events-grid-icon-btn delete"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}