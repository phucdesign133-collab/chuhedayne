import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function ContentManager({
  searchTerm = "",
  categoryId,
  savedData,
  onCountChange,
  onEdit,
  onView,
  onDelete,
}) {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORMAT NGÀY
  //
  // DB:
  // YYYY-MM-DD
  //
  // UI:
  // DD/MM/YYYY
  //
  // Không dùng new Date() để tránh lỗi đảo ngày / timezone.
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
  //
  // Ưu tiên images.
  // Nếu không có → fallback image_url.
  // ============================================================

  const getImages = (content) => {
    if (
      Array.isArray(content?.images) &&
      content.images.length > 0
    ) {
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
  // Chỉ lấy Content thuộc category hiện tại trên URL.
  //
  // Ví dụ:
  // /admin/content/decoration
  // → category = "decoration"
  //
  // /admin/content/birthday
  // → category = "birthday"
  // ============================================================

  const fetchContents = async () => {
    if (!categoryId) {
      setContents([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("category", categoryId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải Content:", error);

      alert(
        `Không thể tải nội dung:\n${
          error?.message || "Lỗi không xác định"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [categoryId]);

  // ============================================================
  // ĐỒNG BỘ DỮ LIỆU NẾU GRID CÓ savedData
  //
  // Chỉ nhận record thuộc category hiện tại.
  // ============================================================

  useEffect(() => {
    if (!savedData || typeof savedData !== "object") {
      return;
    }

    if (savedData.category !== categoryId) {
      return;
    }

    setContents((prev) => {
      const exists = prev.some(
        (item) => item.id === savedData.id
      );

      if (exists) {
        return prev.map((item) =>
          item.id === savedData.id
            ? savedData
            : item
        );
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

  const filteredContents = contents.filter((content) => {
    if (!normalizedSearch) return true;

    const location = String(
      content.location || ""
    ).toLowerCase();

    const category = String(
      content.category || ""
    ).toLowerCase();

    const description = String(
      content.description || ""
    ).toLowerCase();

    return (
      location.includes(normalizedSearch) ||
      category.includes(normalizedSearch) ||
      description.includes(normalizedSearch)
    );
  });

  // ============================================================
  // COUNT
  // ============================================================

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredContents.length);
    }
  }, [filteredContents.length, onCountChange]);

  // ============================================================
  // XEM DETAIL
  // ============================================================

  const handleView = (content) => {
    if (typeof onView === "function") {
      onView(content);
      return;
    }

    console.warn(
      "⚠️ ContentManager: chưa có onView.",
      content
    );
  };

  // ============================================================
  // SỬA
  // ============================================================

  const handleEdit = (content) => {
    if (typeof onEdit === "function") {
      onEdit(content);
    }
  };

  // ============================================================
  // XÓA
  // ============================================================

  const handleDelete = async (content) => {
    if (!content?.id) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nội dung "${
        content.description ||
        content.location ||
        "bài viết này"
      }" không?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", content.id);

      if (error) throw error;

      await fetchContents();

      if (typeof onDelete === "function") {
        onDelete(content);
      }
    } catch (error) {
      console.error("❌ Lỗi xóa Content:", error);

      alert(
        `Không thể xóa nội dung:\n${
          error?.message || "Lỗi không xác định"
        }`
      );
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
            <span>
              Không có nội dung phù hợp
            </span>
          </div>
        ) : (
          filteredContents.map((content, index) => {
            const images = getImages(content);
            const firstImage = images[0] || "";

            return (
              <div
                className="card"
                key={content.id || `content-${index}`}
              >
                <div className="card-main">
                  <div className="info">
                    <div className="row name">
                      {content.category || "Bài viết"}
                    </div>

                    <div className="row">
                      <span>Địa điểm: </span>
                      <strong>
                        {content.location ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    <div className="row">
                      <span>Ngày tổ chức: </span>
                      <strong>
                        {formatDate(content.date) ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    <div className="row">
                      <span>Khách hàng: </span>
                      <strong>
                        {content.customer_name ||
                          content.customer ||
                          "Chưa liên kết"}
                      </strong>
                    </div>
                  </div>

                  <div className="image-box">
                    {firstImage ? (
                      <>
                        <img
                          src={firstImage}
                          alt={
                            content.description ||
                            content.location ||
                            "Content"
                          }
                          className="image"
                        />

                        {images.length > 0 && (
                          <span className="image-count">
                            1 / {images.length}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="image-empty">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() =>
                      handleEdit(content)
                    }
                  >
                    <Pencil size={16} />
                    Sửa
                  </button>

                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={() =>
                      handleDelete(content)
                    }
                  >
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