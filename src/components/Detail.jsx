import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Phone, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "./utils/supabaseClient";
import "../css/Details.css";

const AUTO_SLIDE_MS = 5000;

// ==============================
// SLUG
// ==============================

const slugify = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ==============================
// DETAIL
// ==============================

export default function Detail() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const sliderRef = useRef(null);

  const [item, setItem] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // ==============================
  // USER / ADMIN
  // ==============================

  const isAdminDetail = location.pathname.startsWith("/admin/posts/");

  const detailKey = isAdminDetail ? params.id : params.slug;

  // ==============================
  // LOAD DETAIL
  // ==============================

  useEffect(() => {
    let isMounted = true;

    const fetchDetailAndRelated = async () => {
      try {
        setLoading(true);
        setItem(null);
        setRelatedPosts([]);
        setActiveImage(0);

        if (!detailKey) {
          return;
        }

        let currentItem = null;

        // ========================================
        // ADMIN
        // /admin/posts/:id
        // ========================================

        if (isAdminDetail) {
          const { data, error } = await supabase.from("services").select("*").eq("id", detailKey).single();

          if (error) throw error;

          currentItem = data;
        }

        // ========================================
        // USER
        // /post/:slug
        // ========================================
        else {
          const { data, error } = await supabase.from("services").select("*");

          if (error) throw error;

          const posts = Array.isArray(data) ? data : [];

          currentItem = posts.find((post) => slugify(post.title) === detailKey) || null;

          if (!currentItem) {
            throw new Error("Không tìm thấy bài viết theo slug.");
          }
        }

        if (!isMounted) return;

        setItem(currentItem);
        setActiveImage(0);

        // ========================================
        // RELATED POSTS
        // ========================================

        if (currentItem?.category) {
          const { data: listData, error: listError } = await supabase
            .from("services")
            .select("*")
            .eq("category", currentItem.category)
            .neq("id", currentItem.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(6);

          if (!listError && isMounted) {
            setRelatedPosts(Array.isArray(listData) ? listData : []);
          }
        }
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu Detail:", error);

        if (isMounted) {
          setItem(null);
          setRelatedPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetailAndRelated();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return () => {
      isMounted = false;
    };
  }, [detailKey, isAdminDetail]);

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";

    const raw = String(dateStr);

    if (raw.includes("-") && raw.length >= 10) {
      const parts = raw.split("T")[0].split("-");

      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    return raw;
  };

  // ==============================
  // CAPITALIZE
  // ==============================

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";

    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  };

  // ==============================
  // IMAGE
  // ==============================

  const imageList = Array.isArray(item?.images) && item.images.length > 0 ? item.images.filter(Boolean) : item?.image_url ? [item.image_url] : [];

  const currentImage = imageList[activeImage] || "";

  

  // ==============================
  // AUTO SLIDE
  // ==============================

  useEffect(() => {
    if (imageList.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % imageList.length);
    }, AUTO_SLIDE_MS);

    return () => {
      clearInterval(timer);
    };
  }, [item?.id, imageList.length]);

  // ==============================
  // GALLERY CATEGORY
  // ==============================

  const openGalleryCategory = () => {
    if (!item?.category) {
      navigate("/gallery");
      return;
    }

    navigate(`/gallery?category=${encodeURIComponent(item.category)}`);
  };

  // ==============================
  // RELATED POST
  // ==============================

  const openRelatedPost = (post) => {
    if (!post?.title) return;

    navigate(`/post/${slugify(post.title)}`);
  };

  // ==============================
  // RELATED SLIDER
  // ==============================

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;

    const scrollAmount = 300;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ==============================
  // LIGHTBOX KEYBOARD
  // ==============================

  useEffect(() => {
    if (!zoomOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        previousImage();
        return;
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;
    };
  }, [zoomOpen, imageList.length]);

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return <div className="detail-loading">Đang tải dữ liệu...</div>;
  }

  // ==============================
  // NOT FOUND
  // ==============================

  if (!item) {
    return <div className="detail-notfound">Không tìm thấy nội dung bài viết.</div>;
  }

  // ==============================
  // DISPLAY DATA
  // ==============================

  const rawTitle = item.description || item.title || "Chi tiết bài viết";

  const displayTitle = capitalizeFirstLetter(rawTitle);

  const categoryName = item.category ? capitalizeFirstLetter(item.category) : "Bài viết";

  const rawDateValue = item.date || item.event_date;

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="detail-container">
      {/* ========================================
          BREADCRUMB
      ======================================== */}

      <div className="detail-breadcrumb">
        <span className="detail-breadcrumb-category" onClick={openGalleryCategory}>
          All {categoryName}
        </span>

        <span className="detail-breadcrumb-separator">&gt;</span>

        <span className="detail-breadcrumb-title">{displayTitle}</span>
      </div>

      {/* ========================================
          MAIN IMAGE
      ======================================== */}

      <div className="detail-image-section">
        <button
          type="button"
          className="detail-image-box"
          onClick={() => {
            if (currentImage) {
              setZoomOpen(true);
            }
          }}
          aria-label="Xem ảnh lớn"
        >
          {currentImage ? (
            <img src={currentImage} alt={displayTitle} className="detail-main-img" />
          ) : (
            <div className="detail-image-empty">Không có hình ảnh</div>
          )}

          {imageList.length > 0 && (
            <span className="detail-image-counter">
              {activeImage + 1} / {imageList.length}
            </span>
          )}
        </button>

       
      </div>

      {/* ========================================
          INFO
      ======================================== */}

      <div className="detail-info">
        <div className="detail-info-line">
          <strong>Địa điểm tổ chức:</strong> {item.location || "Chưa cập nhật"}
        </div>

        <div className="detail-info-line">
          <strong>Ngày tổ chức:</strong> {formatToDDMMYYYY(rawDateValue)}
        </div>
      </div>

      {/* ========================================
          CONTACT
      ======================================== */}

      <div className="detail-contact">
        <h3 className="detail-contact-title">Liên hệ với chúng tôi</h3>

        <p>
          <strong>Đại diện Phúc Party:</strong> Dương Đỗ Hồng Phúc
        </p>

        <p>
          <strong>Số điện thoại:</strong> 079.991.0603
        </p>

        <p>
          <strong>Email:</strong> phucdesign133@gmail.com
        </p>

        <div className="detail-contact-buttons">
          <a href="https://zalo.me/0799910603" target="_blank" rel="noopener noreferrer" className="detail-contact-btn detail-zalo-btn">
            <MessageCircle size={18} />
            Liên hệ Zalo
          </a>

          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="detail-contact-btn detail-whatsapp-btn">
            <Phone size={18} />
            Liên hệ WhatsApp
          </a>
        </div>
      </div>

      {/* ========================================
          RELATED POSTS
      ======================================== */}

      {relatedPosts.length > 0 && (
        <div className="detail-related">
          <h3 className="detail-related-title">Bài viết liên quan</h3>

          <div className="detail-related-wrapper">
            <button
              type="button"
              className="detail-related-arrow detail-related-arrow-left"
              onClick={() => scrollSlider("left")}
              aria-label="Bài viết trước"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="detail-related-slider" ref={sliderRef}>
              {relatedPosts.map((post) => {
                const postImage = Array.isArray(post.images) && post.images.length > 0 ? post.images.find(Boolean) : post.image_url || "";

                const postTitle = post.description || post.title || "Bài viết";

                return (
                  <article key={post.id} className="detail-related-card" onClick={() => openRelatedPost(post)}>
                    <div className="detail-related-image">
                      {postImage ? <img src={postImage} alt={postTitle} loading="lazy" /> : <div className="detail-related-image-empty" />}
                    </div>

                    <div className="detail-related-content">
                      <h4>{capitalizeFirstLetter(postTitle)}</h4>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className="detail-related-arrow detail-related-arrow-right"
              onClick={() => scrollSlider("right")}
              aria-label="Bài viết tiếp theo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          IMAGE LIGHTBOX
      ======================================== */}

      {zoomOpen && currentImage && (
        <div className="detail-lightbox" onClick={() => setZoomOpen(false)}>
          <button type="button" className="detail-lightbox-close" onClick={() => setZoomOpen(false)} aria-label="Đóng">
            <X size={24} />
          </button>

          {imageList.length > 1 && (
            <button
              type="button"
              className="detail-lightbox-arrow detail-lightbox-left"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          <img src={currentImage} alt={displayTitle} className="detail-lightbox-img" onClick={(event) => event.stopPropagation()} />

          {imageList.length > 1 && (
            <button
              type="button"
              className="detail-lightbox-arrow detail-lightbox-right"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight size={30} />
            </button>
          )}

          <span className="detail-lightbox-counter">
            {activeImage + 1} / {imageList.length}
          </span>
        </div>
      )}
    </div>
  );
}
