import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { hubData } from "../datas/icons";
import { supabase } from "./utils/supabaseClient";

import Popup from "./popup/Popup";

import PrizeManager from "../pages/PrizeManager";
import CustomerManager from "../pages/CustomerManager";
import BookingManager from "../pages/BookingManager";
import ContentManager from "../pages/ContentManager";
import IncomeManager from "../pages/IncomeManager";
import FundManager from "../pages/FundManager";
import PurchaseManager from "../pages/PurchaseManager";
import ShippedPrizesManager from "../pages/ShippedPrizesManager";
import WarehouseManager from "../pages/WarehouseManager";
import PriceManager from "../pages/PriceManager";

import "../css/Grid.css";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [itemCount, setItemCount] = useState(0);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [editingData, setEditingData] = useState(null);

  const [savedData, setSavedData] = useState([]);

  // =========================================================
  // CATEGORY
  // =========================================================

  // Tất cả category của toàn bộ Hub
  const allCategories = useMemo(() => {
    return Object.values(hubData || {}).flatMap((hub) => {
      const sections = hub?.sections || [];

      return sections.flatMap((section) => section.items || []);
    });
  }, []);

  // Riêng category thuộc Hub Content
  const contentCategories = useMemo(() => {
    const sections = hubData?.content?.sections || [];

    return sections.flatMap((section) => section.items || []);
  }, []);

  const currentCategory = useMemo(() => {
    return allCategories.find((item) => item.id === categoryId);
  }, [allCategories, categoryId]);

  const currentCategoryLabel = currentCategory?.name || currentCategory?.title || "";

  // =========================================================
  // SPECIAL CATEGORIES
  // =========================================================

  const isPriceCategory = categoryId === "price-decoration" || categoryId === "price-party";

  const isWarehouseCategory = ["balloons", "zip-bags", "stamps", "costumes"].includes(categoryId);

  const isContentCategory = contentCategories.some((item) => item.id === categoryId);

  // =========================================================
  // ADD
  // =========================================================

  const handleAddNewClick = () => {
    setEditingData(null);
    setIsPopupOpen(true);
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingData(null);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    setEditingData(item);
    setIsPopupOpen(true);
  };

  // =========================================================
  // IMAGE PREPARE
  // =========================================================

  const prepareImages = (images) => {
    if (!images) {
      return [];
    }

    if (Array.isArray(images)) {
      return images;
    }

    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  // =========================================================
  // SAVE POPUP
  // =========================================================

  const handleSavePopup = async (formData) => {
    try {
      // =====================================================
      // PRICE
      //
      // Tạm thời KHÔNG ghi DB.
      // Chỉ lưu local vào Grid để test UI/formula.
      // Sau khi chốt schema giá -> chuyển sang Supabase.
      // =====================================================

      if (isPriceCategory) {
        const data = {
          ...formData,

          category: categoryId,

          // đảm bảo ID cho item mới
          id: formData.id || `price-${Date.now()}`,
        };

        setSavedData((prev) => {
          const current = Array.isArray(prev) ? prev : [];

          const sameCategory = current.filter((item) => item.category === categoryId);

          const otherCategory = current.filter((item) => item.category !== categoryId);

          const existingIndex = sameCategory.findIndex((item) => {
            if (data.id && item.id === data.id) {
              return true;
            }

            return (
              String(item.title || "")
                .trim()
                .toLowerCase() ===
              String(data.title || "")
                .trim()
                .toLowerCase()
            );
          });

          if (existingIndex >= 0) {
            sameCategory[existingIndex] = data;
          } else {
            sameCategory.push(data);
          }

          return [...otherCategory, ...sameCategory];
        });

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data,
        };
      }

      // =====================================================
      // PRIZES
      // =====================================================

      if (categoryId === "prizes") {
        const payload = {
          ...formData,
          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("prizes").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("prizes").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // CUSTOMER
      // =====================================================

      if (categoryId === "customer-info") {
        const payload = {
          ...formData,
          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("customer").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("customer").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // BOOKING
      // =====================================================

      if (categoryId === "calendar") {
        const payload = {
          ...formData,
          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("bookings").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("bookings").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // INCOME
      // =====================================================

      if (categoryId === "income") {
        const payload = {
          ...formData,
        };

        let result;

        if (formData.id) {
          result = await supabase.from("incomes").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("incomes").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // PURCHASE
      // =====================================================

      if (categoryId === "purchase") {
        const payload = {
          ...formData,
        };

        let result;

        if (formData.id) {
          result = await supabase.from("purchases").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("purchases").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // SHIPPED PRIZES
      // =====================================================

      if (categoryId === "shipped-prizes") {
        const payload = {
          ...formData,
          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("shipped_prizes").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("shipped_prizes").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // WAREHOUSE
      // =====================================================

      if (isWarehouseCategory) {
        const payload = {
          ...formData,

          category: categoryId,

          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("warehouse_items").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("warehouse_items").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      // =====================================================
      // CONTENT / SERVICES
      // =====================================================

      if (isContentCategory) {
        const payload = {
          title: String(formData.title || "").trim(),
          category: categoryId,
          location: String(formData.location || "").trim(),
          date: formData.date || null,
          images: prepareImages(formData.images),
        };

        let result;

        if (formData.id) {
          result = await supabase.from("services").update(payload).eq("id", formData.id).select().single();
        } else {
          result = await supabase.from("services").insert(payload).select().single();
        }

        if (result.error) {
          throw result.error;
        }

        setSavedData(result.data);

        setIsPopupOpen(false);
        setEditingData(null);

        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
      };
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);

      alert(error?.message || "Không thể lưu dữ liệu.");

      return {
        success: false,
        error,
      };
    }
  };

  // =========================================================
  // RENDER MANAGER
  // =========================================================

  const renderManager = () => {
    // -------------------------------------------------------
    // PRICE
    // -------------------------------------------------------

    if (isPriceCategory) {
      const categorySavedData = Array.isArray(savedData) ? savedData.filter((item) => item.category === categoryId) : [];

      return (
        <PriceManager
          categoryId={categoryId}
          searchTerm={searchTerm}
          savedData={categorySavedData}
          onCountChange={setItemCount}
          onEdit={handleEdit}
        />
      );
    }

    // -------------------------------------------------------
    // PRIZES
    // -------------------------------------------------------

    if (categoryId === "prizes") {
      return <PrizeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // CUSTOMER
    // -------------------------------------------------------

    if (categoryId === "customer-info") {
      return <CustomerManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // BOOKING
    // -------------------------------------------------------

    if (categoryId === "calendar") {
      return <BookingManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // INCOME
    // -------------------------------------------------------

    if (categoryId === "income") {
      return <IncomeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // FUND
    // -------------------------------------------------------

    if (categoryId === "marketing-fund") {
      return <FundManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // PURCHASE
    // -------------------------------------------------------

    if (categoryId === "purchase") {
      return <PurchaseManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // SHIPPED PRIZES
    // -------------------------------------------------------

    if (categoryId === "shipped-prizes") {
      return <ShippedPrizesManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    }

    // -------------------------------------------------------
    // WAREHOUSE
    // -------------------------------------------------------

    if (isWarehouseCategory) {
      return (
        <WarehouseManager categoryId={categoryId} searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
      );
    }

    // -------------------------------------------------------
    // CONTENT
    // -------------------------------------------------------

    if (isContentCategory) {
      return (
        <ContentManager categoryId={categoryId} searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
      );
    }

    // -------------------------------------------------------
    // NO MANAGER
    // -------------------------------------------------------

    return null;
  };

  // =========================================================
  // POPUP TITLE
  // =========================================================

  const getPopupTitle = () => {
    const action = editingData ? "Cập nhật" : "Thêm mới";

    if (categoryId === "prizes") {
      return `${action} món quà`;
    }

    if (categoryId === "customer-info") {
      return `${action} khách hàng`;
    }

    if (categoryId === "calendar") {
      return `${action} Booking`;
    }

    if (categoryId === "income") {
      return `${action} khoản thu`;
    }

    if (categoryId === "purchase") {
      return `${action} khoản mua`;
    }

    if (categoryId === "shipped-prizes") {
      return `${action} quà đã gửi`;
    }

    if (isWarehouseCategory) {
      return `${action} vật tư`;
    }

    // =======================================================
    // PRICE
    // =======================================================

    if (categoryId === "price-decoration") {
      return `${action} giá trang trí`;
    }

    if (categoryId === "price-party") {
      return `${action} giá biểu diễn`;
    }

    return `${action} nội dung`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="post-admin-container">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="admin-grid-fixed-header">
        <div className="admin-grid-top-bar">
          <button type="button" className="admin-grid-back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={20} />
          </button>

          <h2 className="admin-grid-heading">
            <span>{currentCategoryLabel}</span>

            <small>: {itemCount} mục</small>
          </h2>
        </div>

        {/* ===================================================
            TOOLBAR
        ==================================================== */}

        <div className="admin-grid-toolbar">
          <div className="admin-grid-search-wrapper">
            <input
              type="text"
              className="admin-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm..."
            />
          </div>

          <button type="button" className="admin-grid-add-btn-main" onClick={handleAddNewClick} aria-label="Thêm mới">
            <Plus size={20} />
            Thêm mới
          </button>
        </div>
      </div>

      {/* =====================================================
          BODY
      ====================================================== */}

      <div className="admin-grid-body">
        <div className="admin-grid-outlet-wrapper">{renderManager()}</div>
      </div>

      {/* =====================================================
          POPUP
      ====================================================== */}

      {isPopupOpen && (
        <Popup isOpen={isPopupOpen} onClose={handleClosePopup} onSave={handleSavePopup} categoryId={categoryId} initialData={editingData} />
      )}
    </div>
  );
}
