// src/components/Grid.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { hubData } from "../datas/icons";
import { fetchPosts } from "../datas/api";
import { ArrowLeft, Plus } from "lucide-react";
import Popup from "./popup/Popup";
import "../css/Grid.css";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemCount, setItemCount] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // === 1. TÌM MODULE HIỆN TẠI TRONG hubData ===

  const allCategories = useMemo(() => {
    if (!hubData) return [];

    const items = [];

    Object.values(hubData).forEach((tab) => {
      if (!tab?.sections) return;

      tab.sections.forEach((section) => {
        if (section?.items) {
          items.push(...section.items);
        }
      });
    });

    return items;
  }, []);

  const currentCategory = useMemo(() => {
    return allCategories.find((item) => item.id === categoryId);
  }, [allCategories, categoryId]);

  const currentCategoryLabel = currentCategory?.name || "Quản lý";

  // === 2. ĐẾM SỐ LƯỢNG DỮ LIỆU CHO HEADER ===

  useEffect(() => {
    async function loadItemCount() {
      if (!categoryId) {
        setItemCount(null);
        return;
      }

      try {
        const data = await fetchPosts();

        const currentId = categoryId.trim().toLowerCase();
        const currentCode = categoryId.toUpperCase();

        const filtered = (data || []).filter((item) => {
          const itemCategory = (item.category || "")
            .trim()
            .toLowerCase();

          if (itemCategory === currentId) {
            return true;
          }

          if (
            item.description &&
            item.description.includes(`Mã: ${currentCode}`)
          ) {
            return true;
          }

          return false;
        });

        setItemCount(filtered.length);
      } catch (error) {
        console.error("Lỗi đếm dữ liệu Grid:", error);
        setItemCount(null);
      }
    }

    loadItemCount();
  }, [categoryId]);

  // === 3. MỞ POPUP ===

  const handleAddNewClick = () => {
    setIsPopupOpen(true);
  };

  // === 4. ĐÓNG POPUP ===

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // === 5. NHẬN DỮ LIỆU TỪ POPUP ===

  const handleSavePopup = async (data) => {
    console.log("Grid nhận dữ liệu Popup:", data);

    // TODO:
    // Sau này xử lý lưu Supabase tại đây

    setIsPopupOpen(false);
  };

  return (
    <div className="post-admin-container" style={{ padding: "20px" }}>

      {/* === HEADER === */}

      <div className="admin-grid-top-bar">

        <button
          onClick={() => navigate(-1)}
          className="admin-grid-back-btn"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        <h2 className="admin-grid-heading">
          Danh sách {currentCategoryLabel} hiện có:

          {itemCount !== null && (
            <span> {itemCount} mục</span>
          )}
        </h2>

      </div>


      {/* === TOOLBAR === */}

      <div className="admin-grid-toolbar">

        <div className="admin-grid-search-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm..."
            className="admin-search-input"
          />
        </div>

        <button
          onClick={handleAddNewClick}
          className="admin-grid-add-btn-main"
        >
          <Plus size={18} />
          Thêm mới
        </button>

      </div>


      {/* === OUTLET === */}

      <div className="admin-grid-outlet-wrapper">
        <Outlet context={{ searchTerm }} />
      </div>


      {/* === POPUP CHUNG === */}

      <Popup
        isOpen={isPopupOpen}
        onSave={handleSavePopup}
        onClose={handleClosePopup}
        categoryId={categoryId}
      />

    </div>
  );
}