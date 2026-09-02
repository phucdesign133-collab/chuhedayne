import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./utils/supabaseClient";
import { hubData } from "../datas/icons";
import "../css/Carousel.css";

const MAX_ITEMS = 15;
const AUTO_PLAY_MS = 5000;
const SWIPE_THRESHOLD = 45;

const slugify = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Carousel() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startX = useRef(null);
  const startY = useRef(null);
  const dragging = useRef(false);
  const autoPlay = useRef(null);

  const categoryIds = useMemo(() => {
    const sections = hubData?.content?.sections || [];

    return sections
      .flatMap((section) => section.items || [])
      .map((item) => item.id)
      .filter(
        (id) =>
          id &&
          id !== "price-decoration" &&
          id !== "price-party"
      );
  }, []);

  const getIndex = (index) =>
    items.length
      ? ((index % items.length) + items.length) % items.length
      : 0;

  const getImage = (item) =>
    Array.isArray(item?.images)
      ? item.images.find(
          (image) => typeof image === "string" && image
        ) || ""
      : "";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!categoryIds.length) {
          setItems([]);
          return;
        }

        const { data, error } = await supabase
          .from("services")
          .select(
            "id,title,location,date,created_at,images,category"
          )
          .in("category", categoryIds);

        if (error) throw error;

        const result = (data || [])
          .map((item) => ({
            id: item.id,
            title: item.title || "Khoảnh khắc",
            location: item.location || "",
            image: getImage(item),
            date: item.date || "",
            created_at: item.created_at || "",
            link: item.title
              ? `/posts/${slugify(item.title)}`
              : null,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at || b.date || 0) -
              new Date(a.created_at || a.date || 0)
          )
          .slice(0, MAX_ITEMS);

        if (mounted) {
          setItems(result);
          setCurrent(0);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Không thể tải nội dung.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [categoryIds]);

  const move = (step) => {
    if (items.length > 1) {
      setCurrent((prev) => getIndex(prev + step));
    }
  };

  const startAutoPlay = () => {
    clearInterval(autoPlay.current);

    if (items.length > 1) {
      autoPlay.current = setInterval(() => {
        move(1);
      }, AUTO_PLAY_MS);
    }
  };

  useEffect(() => {
    startAutoPlay();

    return () => {
      clearInterval(autoPlay.current);
    };
  }, [items.length]);

  const pause = () => {
    clearInterval(autoPlay.current);
  };

  const handleDown = (e) => {
    pause();

    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
  };

  const handleUp = (e) => {
    if (!dragging.current) return;

    dragging.current = false;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    startX.current = null;
    startY.current = null;

    if (
      Math.abs(dx) > SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      move(dx < 0 ? 1 : -1);
    }

    startAutoPlay();
  };

  const visible = items.length
    ? {
        previous: items[getIndex(current - 1)],
        current: items[getIndex(current)],
        next: items[getIndex(current + 1)],
      }
    : {};

  const openPost = () => {
    if (visible.current?.link) {
      navigate(visible.current.link);
    }
  };

  if (loading) {
    return (
      <section className="carousel">
        <div className="carousel-loading">
          Đang tải...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="carousel">
        <div className="carousel-error">
          Không thể tải nội dung.
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const renderImage = (item) =>
    item?.image ? (
      <img
        src={item.image}
        alt={item.title || ""}
        draggable="false"
      />
    ) : (
      <div className="carousel-image-empty" />
    );

  return (
    <section className="carousel">
      <div
        className="carousel-stage"
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={() => {
          dragging.current = false;
          startAutoPlay();
        }}
        onPointerLeave={(e) => {
          if (dragging.current) {
            handleUp(e);
          }
        }}
      >
        {/* LEFT */}
        <button
          type="button"
          className="carousel-slot carousel-slot-side carousel-slot-left"
          onClick={() => move(-1)}
          aria-label="Nội dung trước"
        >
          <div className="carousel-image">
            {renderImage(visible.previous)}
          </div>
        </button>

        {/* CENTER */}
        <div className="carousel-center">
          <div className="carousel-highlight">
            <button
              type="button"
              className="carousel-slot carousel-slot-main"
              onClick={openPost}
              aria-label={
                visible.current.title || "Xem nội dung"
              }
            >
              <div className="carousel-image">
                {renderImage(visible.current)}
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          className="carousel-slot carousel-slot-side carousel-slot-right"
          onClick={() => move(1)}
          aria-label="Nội dung tiếp theo"
        >
          <div className="carousel-image">
            {renderImage(visible.next)}
          </div>
        </button>
      </div>
    </section>
  );
}