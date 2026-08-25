// src/components/Grid.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hubData } from "../datas/icons";
import { fetchPosts, addPost, updatePost, deletePost, uploadImageToSupabase } from "../datas/api";
import AddPopup from "./popup/AddPopup";
import "../css/Grid.css";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  // Lấy toàn bộ danh sách item từ tất cả các sections của content trong hubData của icons.js
  const allCategories = hubData.content.sections.flatMap((section) => section.items);

  // Tìm kiếm danh mục hiện tại khớp với URL, nếu không thấy mặc định lấy phần tử đầu tiên
  const currentCategoryObj = allCategories.find((c) => c.id === categoryId) || allCategories[0] || {};
  const selectedCategory = categoryId || currentCategoryObj.id;
  const currentCategoryLabel = currentCategoryObj.name;
  
  // Tạo mã code ngầm dựa trên id nếu cần tra cứu
  const currentCode = currentCategoryObj.id ? currentCategoryObj.id.toUpperCase() : "";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();

      const filtered = (data || []).filter((item) => {
        if (item.category === selectedCategory) return true;
        if (currentCode && item.description && item.description.includes(`Mã: ${currentCode}`)) return true;
        return false;
      });

      setPosts(filtered);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [categoryId]);

  const filteredPosts = posts.filter((item) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = item.description && item.description.toLowerCase().includes(term);
    const dateMatch = item.date && item.date.toLowerCase().includes(term);
    const locationMatch = item.location && item.location.toLowerCase().includes(term);
    return titleMatch || dateMatch || locationMatch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveData = async (formData) => {
    try {
      setLoading(true);
      let finalImages = [];
      if (formData.images?.length > 0) {
        for (const img of formData.images) {
          if (img.file) {
            const url = await uploadImageToSupabase(img.file);
            finalImages.push(url);
          } else if (img.preview) {
            finalImages.push(img.preview);
          } else if (typeof img === 'string') {
            finalImages.push(img);
          }
        }
      }

      const postData = {
        category: selectedCategory,
        location: formData.location || "N/A",
        date: formData.date || null,
        images: finalImages,
        image_url: finalImages[0] || null,
        description: formData.title,
      };

      if (editingItem) {
        await updatePost(editingItem.id, postData);
      } else {
        await addPost(postData);
      }

      closeModal();
      loadPosts();
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingItem(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
      try {
        await deletePost(id);
        loadPosts();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.length >= 10) {
      const parts = dateStr.split("T")[0].split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  return (
    <div className="post-admin-container">
      <div className="admin-grid-top-bar">
        <button onClick={() => navigate(-1)} className="admin-grid-back-btn" title="Quay lại">
          ←
        </button>

        <h2 className="admin-grid-heading">
          Danh sách {currentCategoryLabel || "Sự kiện"} hiện có: <span>{posts.length} mục</span>
        </h2>

        <button onClick={openAddModal} className="admin-grid-add-btn-main">
          + Thêm mới
        </button>
      </div>

      <div className="admin-grid-search-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm..."
          className="admin-search-input"
        />
      </div>

      <div className="admin-events-grid-wrapper">
        <div className="admin-events-grid-container">
          {loading ? (
            <div className="admin-events-grid-loading">Đang tải danh sách...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-events-grid-empty">Chưa có dữ liệu cho mục này.</div>
          ) : (
            <div className="admin-events-grid-list">
              {filteredPosts.map((post) => {
                let imgCount = 0;
                if (Array.isArray(post.images)) {
                  imgCount = post.images.length;
                } else if (post.image_url) {
                  imgCount = 1;
                }

                const formattedDate = formatDateDisplay(post.date);

                return (
                  <div key={post.id} className="admin-events-grid-card" onClick={() => navigate(`/admin/posts/${post.id}`)}>
                    <div className="admin-events-grid-card-content">
                      
                      {/* Hàng 1: Tiêu đề và Ngày tháng */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "8px" }}>
                        <h3 className="admin-events-grid-card-title" style={{ margin: 0}}>
                          {post.description ? post.description.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase()) : ""}
                        </h3>
                        {formattedDate && (
                          <div style={{ fontSize: "14px", color: "#64748b", whiteSpace: "nowrap", marginLeft: "10px" }}>
                            📅 {formattedDate}
                          </div>
                        )}
                      </div>

                      {/* Hàng 2: Địa điểm và Số lượng ảnh */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <div className="admin-events-grid-info-item" style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                          {post.location && <span>📍 {post.location}</span>}
                        </div>
                        {imgCount > 0 && (
                          <div style={{ fontSize: "13px", color: "#0284c7", fontWeight: "500", whiteSpace: "nowrap" }}>
                            📁 {imgCount} ảnh
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="admin-events-grid-card-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        className="admin-events-grid-icon-btn edit"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                        className="admin-events-grid-icon-btn delete"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddPopup isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveData} defaultCategory={selectedCategory} initialData={editingItem} />
    </div>
  );
}