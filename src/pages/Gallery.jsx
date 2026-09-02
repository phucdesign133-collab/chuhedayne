// src/pages/Gallery.jsx

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../components/utils/supabaseClient";
import { hubData } from "../datas/icons";
import "../css/Gallery.css";

const MAIN_TABS = [
  { id: "events", label: "EVENTS", sectionName: "Sự kiện" },
  { id: "design", label: "DESIGN", sectionName: "Thiết kế" },
  { id: "pricing", label: "PRICING", sectionName: "Bảng giá" },
];

const getSections = () => hubData?.content?.sections || [];

const getSectionItems = (sectionName) => {
  const section = getSections().find((item) => item.sectionName === sectionName);

  return Array.isArray(section?.items) ? section.items : [];
};

const getImage = (content) => {
  if (!Array.isArray(content?.images)) return "";

  return content.images.find(Boolean) || "";
};

// ==============================
// SLUG
// ==============================

const slugify = (text) => {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function Gallery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeMainTab, setActiveMainTab] = useState("events");
  const [activeSubTab, setActiveSubTab] = useState("all");

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isSticky, setIsSticky] = useState(false);

  const sections = useMemo(() => getSections(), []);

  const activeMain = useMemo(() => MAIN_TABS.find((tab) => tab.id === activeMainTab), [activeMainTab]);

  const subItems = useMemo(() => {
    if (!activeMain) return [];

    return getSectionItems(activeMain.sectionName);
  }, [activeMain]);

  const categoryIds = useMemo(() => subItems.map((item) => item.id).filter(Boolean), [subItems]);

  // ==============================
  // CATEGORY TỪ DETAIL
  //
  // /gallery?category=xxx
  //
  // Tự mở đúng MAIN TAB + SUB TAB
  // ==============================

  useEffect(() => {
    const category = searchParams.get("category");

    if (!category) return;

    const targetMainTab = MAIN_TABS.find((tab) => {
      const items = getSectionItems(tab.sectionName);

      return items.some((item) => item.id === category);
    });

    if (!targetMainTab) return;

    setActiveMainTab(targetMainTab.id);
    setActiveSubTab(category);
  }, [searchParams]);

  // ==============================
  // RESET SUB TAB
  // KHI ĐỔI MAIN TAB
  // ==============================

  useEffect(() => {
    const category = searchParams.get("category");

    // Nếu category trên URL thuộc MAIN TAB hiện tại
    // thì giữ nguyên category đó
    if (category) {
      const belongsToCurrentMain = subItems.some((item) => item.id === category);

      if (belongsToCurrentMain) return;
    }

    setActiveSubTab("all");
  }, [activeMainTab, subItems, searchParams]);

  // ==============================
  // LOAD CONTENTS
  // ==============================

  useEffect(() => {
    const fetchContents = async () => {
      if (!categoryIds.length) {
        setContents([]);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("services")
          .select("id,title,location,date,created_at,images,category")
          .in("category", categoryIds)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setContents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Lỗi tải Gallery:", error);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [categoryIds]);

  // ==============================
  // STICKY NAVIGATION
  // ==============================

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ==============================
  // FILTER
  // ==============================

  const filteredContents = useMemo(() => {
    if (activeSubTab === "all") {
      return contents;
    }

    return contents.filter((content) => content.category === activeSubTab);
  }, [contents, activeSubTab]);

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (value) => {
    if (!value) return "";

    const raw = String(value).slice(0, 10);
    const parts = raw.split("-");

    if (parts.length !== 3) return raw;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // ==============================
  // OPEN DETAIL
  // ==============================

  const handleOpenDetail = (content) => {
    if (!content?.title) return;

    navigate(`/post/${slugify(content.title)}`);
  };

  // ==============================
  // MAIN TAB PREVIOUS
  // ==============================

  const handlePreviousMainTab = () => {
    const currentIndex = MAIN_TABS.findIndex((tab) => tab.id === activeMainTab);

    const nextIndex = currentIndex <= 0 ? MAIN_TABS.length - 1 : currentIndex - 1;

    setActiveMainTab(MAIN_TABS[nextIndex].id);
  };

  // ==============================
  // MAIN TAB NEXT
  // ==============================

  const handleNextMainTab = () => {
    const currentIndex = MAIN_TABS.findIndex((tab) => tab.id === activeMainTab);

    const nextIndex = currentIndex >= MAIN_TABS.length - 1 ? 0 : currentIndex + 1;

    setActiveMainTab(MAIN_TABS[nextIndex].id);
  };

  return (
    <div className="gallery-page">
      {/* ========================================
          HERO
      ======================================== */}

      <section className="gallery-hero">
        <div key={activeMainTab} className="gallery-background-word" aria-hidden="true">
          {activeMain?.label}
        </div>

        <div className="gallery-hero-title">GALLERY</div>
      </section>

      {/* ========================================
          NAVIGATION
      ======================================== */}

      <div className={["gallery-navigation", isSticky && "gallery-navigation-sticky"].filter(Boolean).join(" ")}>
        {/* ========================================
            MAIN TABS
        ======================================== */}

        <div className="gallery-main-tabs">
          <button type="button" className="gallery-main-arrow" onClick={handlePreviousMainTab} aria-label="Tab trước">
            <ChevronLeft size={18} />
          </button>

          <div className="gallery-main-tab-list">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={["gallery-main-tab", activeMainTab === tab.id && "active"].filter(Boolean).join(" ")}
                onClick={() => setActiveMainTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button type="button" className="gallery-main-arrow" onClick={handleNextMainTab} aria-label="Tab tiếp theo">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ========================================
            SUB TABS
        ======================================== */}

        <div className="gallery-sub-tabs">
          <div className="gallery-sub-tab-list">
            <button
              type="button"
              className={["gallery-sub-tab", activeSubTab === "all" && "active"].filter(Boolean).join(" ")}
              onClick={() => setActiveSubTab("all")}
            >
              <span className="gallery-sub-icon">✦</span>

              <span className="gallery-sub-label">All</span>
            </button>

            {subItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={["gallery-sub-tab", activeSubTab === item.id && "active"].filter(Boolean).join(" ")}
                onClick={() => setActiveSubTab(item.id)}
              >
                <span className="gallery-sub-icon">{item.icon}</span>

                <span className="gallery-sub-label">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================
          CONTENT
      ======================================== */}

      <main className="gallery-content">
        {loading ? (
          <div className="gallery-state">Đang tải nội dung...</div>
        ) : filteredContents.length === 0 ? (
          <div className="gallery-state">Chưa có nội dung.</div>
        ) : (
          <div className="gallery-grid">
            {filteredContents.map((content) => {
              const image = getImage(content);

              return (
                <article key={content.id} className="gallery-item" onClick={() => handleOpenDetail(content)}>
                  {image ? (
                    <img src={image} alt={content.title || "Gallery"} className="gallery-image" loading="lazy" />
                  ) : (
                    <div className="gallery-image-empty">
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
