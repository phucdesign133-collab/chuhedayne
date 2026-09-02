import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hubData } from "../datas/icons";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "./utils/supabaseClient";
import Popup from "./popup/Popup";
import "../css/Grid.css";

// CÁC JSX COMPONENT CON
import PrizeManager from "../pages/PrizeManager";
import CustomerManager from "../pages/CustomerManager";
import BookingManager from "../pages/BookingManager";
import ContentManager from "../pages/ContentManager";
import IncomeManager from "../pages/IncomeManager";
import FundManager from "../pages/FundManager";
import PurchaseManager from "../pages/PurchaseManager";
import ShippedPrizesManager from "../pages/ShippedPrizesManager";
import WarehouseManager from "../pages/WarehouseManager";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [savedData, setSavedData] = useState(null);

  // ============================================================
  // TÌM CATEGORY HIỆN TẠI
  // ============================================================

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

  const currentCategory = useMemo(() => allCategories.find((item) => item.id === categoryId), [allCategories, categoryId]);

  const currentCategoryLabel = currentCategory?.name || "Quản lý";

  // ============================================================
  // POPUP
  // ============================================================

  const handleAddNewClick = () => {
    setEditingData(null);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingData(null);
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setIsPopupOpen(true);
  };

  // ============================================================
  // ẢNH
  // ============================================================

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const prepareImages = async (images = []) => {
    const result = [];

    for (const image of images) {
      // URL ảnh đã tồn tại
      if (typeof image === "string") {
        result.push(image);
        continue;
      }

      // Trường hợp dữ liệu cũ có dạng { file }
      if (image?.file instanceof File) {
        result.push(await fileToDataUrl(image.file));
        continue;
      }

      // Trường hợp dữ liệu có dạng { url }
      if (image?.url) {
        result.push(image.url);
      }
    }

    return result;
  };

  // ============================================================
  // SAVE POPUP
  // Mỗi category có payload + table riêng
  // ============================================================

  const handleSavePopup = async (formData) => {
    console.log("📥 Grid nhận dữ liệu Popup:", formData);

    try {
      let payload;
      let table;

      // ========================================================
      // PRIZES
      // ========================================================
      if (categoryId === "prizes") {
        const images = await prepareImages(formData.images);

        table = "prizes";

        payload = {
          text: String(formData.text || "").trim(),

          cost: Number(formData.cost) || 0,

          unit: String(formData.unit || "").trim(),

          packaging: Number(formData.packaging) || 0,

          quantity: Number(formData.quantity) || 0,

          unit_cost: Number(formData.unit_cost) || 0,

          priority: Boolean(formData.priority),

          is_active: formData.is_active ?? true,

          note: String(formData.note || "").trim(),

          image: images,
        };
      }

      // ========================================================
      // CUSTOMER
      // ========================================================
      if (categoryId === "customer-info") {
        table = "customer";

        const events = Array.isArray(formData.events)
          ? formData.events.filter(
              (item) => String(item?.eventName || "").trim() || String(item?.eventDate || "").trim() || Number(item?.orderValue) > 0,
            )
          : [];

        const firstEvent = events[0] || null;

        // ------------------------------------------------------
        // event_date là NOT NULL trong Supabase.
        // ------------------------------------------------------

        let eventName = String(firstEvent?.eventName || "").trim();

        let eventDate = String(firstEvent?.eventDate || "").trim();

        let orderValue = Number(firstEvent?.orderValue) || 0;

        // ------------------------------------------------------
        // FALLBACK HISTORY
        // ------------------------------------------------------

        if (!eventDate) {
          const validHistory = Array.isArray(formData.history) ? formData.history.filter((item) => String(item?.event_date || "").trim()) : [];

          const latestHistory = validHistory.length > 0 ? validHistory[validHistory.length - 1] : null;

          if (latestHistory) {
            eventName = String(latestHistory.event_name || "").trim();

            eventDate = String(latestHistory.event_date || "").trim();

            orderValue = Number(latestHistory.order_value) || 0;
          }
        }

        // ------------------------------------------------------
        // Không cho gửi null xuống DB.
        // ------------------------------------------------------

        if (!eventDate) {
          throw new Error("Khách hàng chưa có ngày sự kiện. Vui lòng nhập ngày sự kiện.");
        }

        payload = {
          customer_name: String(formData.customer_name || "").trim(),

          phone: String(formData.phone || "").replace(/\D/g, ""),

          event_name: eventName,

          event_date: eventDate,

          order_value: Number(formData.order_value) || orderValue,

          referral_phone: String(formData.referral_phone || "").replace(/\D/g, ""),

          cashback: Number(formData.cashback) || 0,

          member_tier: Number(formData.member_tier) || 0,

          member_percent: Number(formData.member_percent) || 0,

          note: String(formData.note || "").trim(),

          history: Array.isArray(formData.history) ? formData.history : [],

          repeat_event: Boolean(formData.repeat_event),

          is_active: formData.is_active ?? true,
        };
      }
      // ========================================================
      // CALENDAR / BOOKING
      // ========================================================
      if (categoryId === "calendar") {
        table = "bookings";

        payload = {
          title: String(formData.title || "").trim(),

          category: String(formData.category || "").trim(),

          date: formData.date || null,

          time_slot: String(formData.time_slot || "").trim(),

          staff_note: formData.staff_note || null,

          amount: formData.amount !== "" && formData.amount !== null && formData.amount !== undefined ? Number(formData.amount) || 0 : 0,
        };
      }

      // ========================================================
      // INCOME
      // ========================================================
      if (categoryId === "income") {
        table = "incomes";

        payload = {
          source: String(formData.source || "other").trim(),

          title: String(formData.title || "").trim(),

          date: formData.date || null,

          received: formData.received !== "" && formData.received !== null && formData.received !== undefined ? Number(formData.received) || 0 : 0,

          note: String(formData.note || "").trim(),
        };
      }
      // ========================================================
      // PURCHASE
      // ========================================================
      if (categoryId === "purchase") {
        table = "purchases";

        const quantity = Number(formData.quantity) || 0;
        const unitPrice = Number(formData.unit_price) || 0;

        const amount = quantity * unitPrice;

        payload = {
          title: String(formData.title || "").trim(),

          quantity,

          unit: String(formData.unit || "").trim(),

          packaging: Number(formData.packaging) || 0,

          unit_price: unitPrice,

          amount,

          note: String(formData.note || "").trim(),
        };
      }
      // ========================================================
      // SHIPPED PRIZES
      // ========================================================

      if (categoryId === "shipped-prizes") {
        table = "shipped_prizes";

        const images = await prepareImages(formData.images);

        payload = {
          customer_name: String(formData.customer_name || "").trim(),

          phone: String(formData.phone || "").replace(/\D/g, ""),

          address: String(formData.address || "").trim(),

          images,

          note: String(formData.note || "").trim(),
        };
      }
      // ========================================================
      // WAREHOUSE
      // balloons / zip-bags / stamps / costumes
      // ========================================================

      const warehouseCategories = ["balloons", "zip-bags", "stamps", "costumes"];

      if (warehouseCategories.includes(categoryId)) {
        table = "warehouse_items";

        const images = await prepareImages(formData.images);

        payload = {
          category: categoryId,

          title: String(formData.title || "").trim(),

          quantity: Number(formData.quantity) || 0,

          unit: String(formData.unit || "").trim(),

          unit_price: Number(formData.unit_price) || 0,

          source: String(formData.source || "").trim(),

          break_even_usage: Number(formData.break_even_usage) || 0,

          usage_count: Number(formData.usage_count) || 0,

          images,

          note: String(formData.note || "").trim(),
        };
      }
      // ========================================================
      // CONTENT / SOCIAL / PRICE
      //
      // Dùng chung cho TẤT CẢ category trong hubData.content
      // ========================================================

      const contentItems = hubData.content.sections.flatMap((section) => section.items);

      const isContentCategory = contentItems.some((item) => item.id === categoryId);

      if (isContentCategory) {
        table = "services";

        const images = await prepareImages(formData.images);

        payload = {
          category: categoryId,

          location: String(formData.location || "").trim(),

          date: formData.date || null,

          // ContentPopup đang gửi title
          // nên fallback sang title.
          description: String(formData.description || formData.title || "").trim(),

          // Ảnh đầu tiên đồng bộ sang image_url
          image_url: images[0] || "",

          // Toàn bộ ảnh
          images,
        };
      }

      // ========================================================
      // CATEGORY CHƯA CÓ LOGIC SAVE
      // ========================================================

      if (!table || !payload) {
        throw new Error(`Chưa có logic lưu cho: ${categoryId}`);
      }

      let data;

      // ========================================================
      // UPDATE
      // ========================================================

      if (formData.id) {
        const { data: updatedData, error } = await supabase.from(table).update(payload).eq("id", formData.id).select("*").single();

        if (error) throw error;

        data = updatedData;
      }

      // ========================================================
      // INSERT
      // ========================================================
      else {
        const { data: insertedData, error } = await supabase.from(table).insert(payload).select("*").single();

        if (error) throw error;

        data = insertedData;
      }

      console.log(`☁️ ${table} lưu thành công:`, data);

      // Record vừa INSERT/UPDATE
      // được truyền trực tiếp xuống Manager.
      setSavedData(data);

      setIsPopupOpen(false);
      setEditingData(null);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`❌ Lỗi lưu ${categoryId}:`, error);

      return {
        success: false,
        error,
      };
    }
  };

  // ============================================================
  // CHECK CONTENT CATEGORY
  // ============================================================

  const isContentCategory = useMemo(() => {
    if (!hubData?.content?.sections) {
      return false;
    }

    return hubData.content.sections.some((section) => section?.items?.some((item) => item.id === categoryId));
  }, [categoryId]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="post-admin-container" style={{ padding: "20px" }}>
      <div className="admin-grid-fixed-header">
        <div className="admin-grid-top-bar">
          <button type="button" onClick={() => navigate(-1)} className="admin-grid-back-btn" title="Quay lại">
            <ArrowLeft size={20} />
          </button>

          <h2 className="admin-grid-heading">
            {currentCategoryLabel}:<span> {itemCount} mục</span>
          </h2>
        </div>

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

          <button type="button" onClick={handleAddNewClick} className="admin-grid-add-btn-main">
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
      </div>

      <div className="admin-grid-body">
        {categoryId === "prizes" && <PrizeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />}

        {categoryId === "customer-info" && (
          <CustomerManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}

        {categoryId === "calendar" && (
          <BookingManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}

        {categoryId === "income" && <IncomeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />}

        {categoryId === "marketing-fund" && <FundManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} />}

        {categoryId === "purchase" && (
          <PurchaseManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}
        {categoryId === "shipped-prizes" && (
          <ShippedPrizesManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}
        {["balloons", "zip-bags", "stamps", "costumes"].includes(categoryId) && (
          <WarehouseManager searchTerm={searchTerm} categoryId={categoryId} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}
        {/* ======================================================
            CONTENT
            Dùng chung cho mọi category thuộc hubData.content
            ====================================================== */}

        {isContentCategory && (
          <ContentManager searchTerm={searchTerm} categoryId={categoryId} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
        )}
      </div>

      <Popup isOpen={isPopupOpen} onClose={handleClosePopup} onSave={handleSavePopup} categoryId={categoryId} initialData={editingData} />
    </div>
  );
}
