// src/components/Grid.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hubData } from "../datas/icons";
import { fetchPosts, addPost, updatePost, deletePost, uploadImageToSupabase } from "../datas/api";
import AddPopup from "./popup/AddPopup";
import Details from "./Detail";
import Calendar from "./Calendar";
import PrizeManager from "./PrizeManager"; // <-- Component chuyên biệt cho Kho quà
import { ArrowLeft, Plus, Calendar as CalendarIcon, MapPin, Folder, Edit3, Trash2 } from "lucide-react";
import "../css/Grid.css";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  // Lấy danh sách toàn bộ item từ hubData
  const allCategories = hubData.content.sections.flatMap((section) => section.items);
  const currentCategoryObj = allCategories.find((c) => c.id === categoryId) || allCategories[0] || {};
  const selectedCategory = categoryId || currentCategoryObj.id;
  const currentCategoryLabel = currentCategoryObj.name;
  const currentCode = currentCategoryObj.id ? currentCategoryObj.id.toUpperCase() : "";

  // =========================================================================
  // 💎 1. CHẶN ĐIỀU HƯỚNG SỚM CHO LỊCH TRÌNH (CALENDAR)
  // =========================================================================
  const isCalendarCategory = selectedCategory === "calendar" || currentCode.includes("CALENDAR");

  if (isCalendarCategory) {
    return (
      <div className="post-admin-container" style={{ padding: "20px" }}>
        <div className="admin-grid-top-bar" style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate(-1)} className="admin-grid-back-btn" title="Quay lại">
            <ArrowLeft size={20} />
          </button>
          <h2 className="admin-grid-heading" style={{ margin: 0 }}>
            Quản lý lịch trình
          </h2>
          <div></div>
        </div>
        <Calendar isAdmin={true} />
      </div>
    );
  }

  // =========================================================================
  // 💎 2. KIỂM TRA XEM CÓ PHẢI MỤC KHO QUÀ (PRIZES) KHÔNG
  // =========================================================================
  const isPrizeCategory =
    selectedCategory === "ton-kho" || currentCode.includes("TON-KHO") || currentCategoryObj.name?.toLowerCase().includes("tồn kho");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadPosts = async () => {
    if (isPrizeCategory) return; // Kho quà tự quản lý dữ liệu riêng bên trong PrizeManager
    try {
      setLoading(true);
      const data = await fetchPosts();
      const filtered = (data || []).filter((item) => {
        const itemCat = (item.category || "").trim().toLowerCase();
        const currentCat = (selectedCategory || "").trim().toLowerCase();
        if (itemCat === currentCat) return true;
        if (currentCode && item.description && item.description.includes(`Mã: ${currentCode}`)) return true;
        return false;
      });
      setPosts(filtered);
    } catch (error) {
      console.error("Lỗi tải dữ liệu bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [categoryId]);

  const filteredPosts = posts.filter((item) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (item.description || item.name || "").toLowerCase().includes(term);
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
      const uploadImagesList = async (imgList) => {
        let finalImages = [];
        for (const img of imgList) {
          if (img.file) {
            const url = await uploadImageToSupabase(img.file);
            if (url) finalImages.push(url);
          } else if (img.preview) {
            finalImages.push(img.preview);
          } else if (typeof img === "string") {
            finalImages.push(img);
          }
        }
        return finalImages;
      };

      if (editingItem) {
        const finalImages = await uploadImagesList(formData.images);
        const postData = {
          category: formData.category || selectedCategory,
          location: formData.location || "N/A",
          date: formData.date || null,
          images: finalImages,
          image_url: finalImages[0] || null,
          description: formData.title,
        };
        await updatePost(editingItem.id, postData);
      } else {
        if (formData.saveMode === "multi" && formData.images.length > 1) {
          for (const imgObj of formData.images) {
            const singleImgArr = await uploadImagesList([imgObj]);
            const postData = {
              category: formData.category || selectedCategory,
              location: formData.location || "N/A",
              date: formData.date || null,
              images: singleImgArr,
              image_url: singleImgArr[0] || null,
              description: formData.title,
            };
            await addPost(postData);
          }
        } else {
          const finalImages = await uploadImagesList(formData.images);
          const postData = {
            category: formData.category || selectedCategory,
            location: formData.location || "N/A",
            date: formData.date || null,
            images: finalImages,
            image_url: finalImages[0] || null,
            description: formData.title,
          };
          await addPost(postData);
        }
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
    <div className="post-admin-container" style={{ padding: "20px" }}>
      {/* ================= HEADER TOP ================= */}
      <div className="admin-grid-top-bar">
        <button onClick={() => navigate(-1)} className="admin-grid-back-btn" title="Quay lại">
          <ArrowLeft size={20} />
        </button>

        <h2 className="admin-grid-heading">
          Danh sách {currentCategoryLabel || "Sự kiện"} hiện có:
          <span> {isPrizeCategory ? "Kho quà" : `${posts.length} mục`}</span>
        </h2>

        {/* Nút thêm mới chỉ hiển thị hoặc kích hoạt popup phù hợp */}
        <button onClick={openAddModal} className="admin-grid-add-btn-main" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Plus size={18} /> Thêm mới
        </button>
      </div>
       {/* ================= SEARCHBAR ================= */}
      <div className="admin-grid-search-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm..."
          className="admin-search-input"
        />
      </div>
      {/* ================= KHO QUÀ ================= */}
      {isPrizeCategory ? (
        // Kho quà tự chủ động fetch và quản lý data từ bảng public.prizes riêng biệt
        <PrizeManager searchTerm={searchTerm} />
      ) : (
        // Các mục bài viết thông thường
        //================= LỊCH BOOKING & CÁC GRID BÀI VIẾT Ở ĐÂY =================
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
                  const displayTitle = post.description || post.name || "";

                  return (
                    <div key={post.id} className="admin-events-grid-card" onClick={() => navigate(`/admin/posts/${post.id}`)}>
                      <div className="admin-events-grid-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "8px" }}>
                          <h3 className="admin-events-grid-card-title" style={{ margin: 0 }}>
                            {displayTitle ? displayTitle.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase()) : ""}
                          </h3>
                          {formattedDate && (
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#64748b",
                                whiteSpace: "nowrap",
                                marginLeft: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <CalendarIcon size={15} /> {formattedDate}
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <div className="admin-events-grid-info-item" style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                            {post.location && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <MapPin size={15} /> {post.location}
                              </span>
                            )}
                          </div>
                          {imgCount > 0 && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#0284c7",
                                fontWeight: "500",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Folder size={15} /> {imgCount} ảnh
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
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Edit3 size={15} /> Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          className="admin-events-grid-icon-btn delete"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Trash2 size={15} /> Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Popup dùng chung cho danh mục thông thường */}
      <AddPopup isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveData} defaultCategory={selectedCategory} initialData={editingItem} />
    </div>
  );
}
