// src/components/Grid.jsx

import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hubData } from "../datas/icons";
import { ArrowLeft, Plus } from "lucide-react";

import Popup from "./popup/Popup";
import PrizeManager from "./PrizeManager";
import { supabase } from "./utils/supabaseClient";

import "../css/Grid.css";

export default function Grid() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemCount, setItemCount] = useState(0);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [savedData, setSavedData] = useState(null);

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
    return allCategories.find(
      (item) => item.id === categoryId
    );
  }, [allCategories, categoryId]);

  const currentCategoryLabel =
    currentCategory?.name || "Quản lý";

  const handleAddNewClick = () => {
    setEditingData(null);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingData(null);
  };

  const handleEdit = (prize) => {
    setEditingData(prize);
    setIsPopupOpen(true);
  };

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const prepareImages = async (images = []) => {
    const result = [];

    for (const image of images) {
      if (typeof image === "string") {
        result.push(image);
        continue;
      }

      if (image?.file instanceof File) {
        const dataUrl = await fileToDataUrl(image.file);
        result.push(dataUrl);
        continue;
      }

      if (image?.url) {
        result.push(image.url);
      }
    }

    return result;
  };

  const handleSavePopup = async (formData) => {
    console.log(
      "📥 Grid nhận dữ liệu Popup:",
      formData
    );

    try {
      const images = await prepareImages(
        formData.images
      );

      const payload = {
        text: String(formData.text || "").trim(),
        cost: Number(formData.cost) || 0,
        unit: String(formData.unit || "").trim(),
        packaging: Number(formData.packaging) || 0,
        quantity: Number(formData.quantity) || 0,
        unit_cost: Number(formData.unit_cost) || 0,
        priority: Boolean(formData.priority),
        is_active:
          formData.is_active ?? true,
        note: String(formData.note || "").trim(),
        image: images,
      };

      let data;

      if (formData.id) {
        const { data: updatedData, error } =
          await supabase
            .from("prizes")
            .update(payload)
            .eq("id", formData.id)
            .select("*")
            .single();

        if (error) {
          throw error;
        }

        data = updatedData;
      } else {
        const { data: insertedData, error } =
          await supabase
            .from("prizes")
            .insert(payload)
            .select("*")
            .single();

        if (error) {
          throw error;
        }

        data = insertedData;
      }

      console.log(
        "☁️ Prize lưu thành công:",
        data
      );

      setSavedData(data);
      setIsPopupOpen(false);
      setEditingData(null);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(
        "❌ Lỗi lưu Prize:",
        error
      );

      return {
        success: false,
        error,
      };
    }
  };

  return (
    <div
      className="post-admin-container"
      style={{ padding: "20px" }}
    >
      <div className="admin-grid-top-bar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="admin-grid-back-btn"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        <h2 className="admin-grid-heading">
          Danh sách {currentCategoryLabel} hiện có:
          <span> {itemCount} mục</span>
        </h2>
      </div>

      <div className="admin-grid-toolbar">
        <div className="admin-grid-search-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Tìm kiếm..."
            className="admin-search-input"
          />
        </div>

        <button
          type="button"
          onClick={handleAddNewClick}
          className="admin-grid-add-btn-main"
        >
          <Plus size={18} />
          Thêm mới
        </button>
      </div>

      <div className="admin-grid-body">
        {categoryId === "prizes" && (
          <PrizeManager
            searchTerm={searchTerm}
            savedData={savedData}
            onCountChange={setItemCount}
            onEdit={handleEdit}
          />
        )}
      </div>

      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSave={handleSavePopup}
        categoryId={categoryId}
        initialData={editingData}
      />
    </div>
  );
}