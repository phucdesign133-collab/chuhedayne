import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function ContentManager({ searchTerm = "", categoryId, savedData, onCountChange, onEdit, onView, onDelete }) {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORMAT NGÀY
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const value = String(dateValue).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // LẤY ẢNH
  // ============================================================

  const getImages = (content) => {
    if (Array.isArray(content?.images) && content.images.length > 0) {
      return content.images.filter(Boolean);
    }

    if (content?.image_url) {
      return [content.image_url];
    }

    return [];
  };

  // ============================================================
  // LOAD CONTENT
  //
  // CHỈ lấy dữ liệu thuộc category hiện tại.
  // Không có categoryId → không lấy gì.
  // ============================================================

  const fetchContents = async () => {
    if (!categoryId) {
      setContents([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.from("services").select("*").eq("category", categoryId).order("created_at", {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      setContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải Content:", error);

      setContents([]);

      alert(`Không thể tải nội dung:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [categoryId]);

  // ============================================================
  // ĐỒNG BỘ SAVED DATA
  //
  // Chỉ nhận record:
  // 1. Có category
  // 2. category === categoryId
  //
  // Không có category → BỎ QUA.
  // ============================================================

  useEffect(() => {
    if (!savedData || typeof savedData !== "object") {
      return;
    }

    if (!savedData.category) {
      return;
    }

    if (savedData.category !== categoryId) {
      return;
    }

    setContents((prev) => {
      const exists = prev.some((item) => String(item.id) === String(savedData.id));

      if (exists) {
        return prev.map((item) => (String(item.id) === String(savedData.id) ? savedData : item));
      }

      return [savedData, ...prev];
    });
  }, [savedData, categoryId]);

  // ============================================================
  // SEARCH
  // ============================================================

  const normalizedSearch = String(searchTerm || "")
    .trim()
    .toLowerCase();

  const filteredContents = useMemo(() => {
    if (!normalizedSearch) {
      return contents;
    }

    return contents.filter((content) => {
      const title = String(content.title || "").toLowerCase();

      const location = String(content.location || "").toLowerCase();

      const customer = String(content.customer || content.customer_name || "").toLowerCase();

      return title.includes(normalizedSearch) || location.includes(normalizedSearch) || customer.includes(normalizedSearch);
    });
  }, [contents, normalizedSearch]);

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredContents.length);
    }
  }, [filteredContents.length, onCountChange]);

  // ============================================================
  // SỬA
  // ============================================================

  const handleEdit = (content) => {
    if (typeof onEdit === "function") {
      onEdit(content);
    }
  };

  // ============================================================
  // XEM DETAIL
  // ============================================================

  const handleView = (content) => {
    if (typeof onView === "function") {
      onView(content);
    }
  };

  // ============================================================
  // XÓA
  // ============================================================

  const handleDelete = async (content) => {
    if (!content?.id) {
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa nội dung "${content.title || "nội dung này"}" không?`);

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase.from("services").delete().eq("id", content.id).eq("category", categoryId);

      if (error) {
        throw error;
      }

      setContents((prev) => prev.filter((item) => String(item.id) !== String(content.id)));

      if (typeof onDelete === "function") {
        onDelete(content);
      }
    } catch (error) {
      console.error("❌ Lỗi xóa Content:", error);

      alert(`Không thể xóa nội dung:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="manager">
      <div className="list">
        {loading ? (
          <div className="empty">
            <span>Đang tải nội dung...</span>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="empty">
            <ImageIcon size={32} />

            <span>Chưa có nội dung</span>
          </div>
        ) : (
          filteredContents.map((content, index) => {
            const images = getImages(content);

            const firstImage = images[0] || "";

            return (
              <div className="card" key={content.id || `content-${index}`}>
                <div className="card-main">
                  <div className="info">
                    {/* TITLE */}
                    <div className="row name">{content.title || "Chưa có tiêu đề"}</div>

                    {/* LOCATION */}
                    <div className="row">
                      <span>Địa điểm: </span>

                      <strong>{content.location || "Chưa cập nhật"}</strong>
                    </div>

                    {/* DATE */}
                    <div className="row">
                      <span>Ngày tổ chức: </span>

                      <strong>{formatDate(content.date) || "Chưa cập nhật"}</strong>
                    </div>

                    {/* CUSTOMER */}
                    <div className="row">
                      <span>Khách hàng: </span>

                      <strong>{content.customer_name || content.customer || "Chưa liên kết"}</strong>
                    </div>
                  </div>

                  {/* IMAGE */}
                  <div className="image-box">
                    {firstImage ? (
                      <>
                        <img src={firstImage} alt={content.title || "Content"} className="image" onClick={() => handleView(content)} />

                        {images.length > 0 && <span className="image-count">1 / {images.length}</span>}
                      </>
                    ) : (
                      <div className="image-empty" onClick={() => handleView(content)}>
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="card-footer">
                  <button type="button" className="action-btn edit-btn" onClick={() => handleEdit(content)}>
                    <Pencil size={16} />
                    Sửa
                  </button>

                  <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(content)}>
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
