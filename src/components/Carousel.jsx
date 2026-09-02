// src/components/Carousel.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./utils/supabaseClient";
import { hubData } from "../datas/icons";
import "../css/Carousel.css";

const MAX_ITEMS = 15;
const AUTO_PLAY_MS = 5000;
const SWIPE_THRESHOLD = 45;

export default function Carousel() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const autoPlayRef = useRef(null);

  // -------------------------------------------------------
  // CONTENT CATEGORY IDS
  // -------------------------------------------------------

  const contentCategoryIds = useMemo(() => {
    const sections = hubData?.content?.sections || [];

    return sections
      .flatMap((section) => section.items || [])
      .map((item) => item.id)
      .filter(
        (id) =>
          id &&
          id !== "price-decoration" &&
          id !== "price-party",
      );
  }, []);

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------

  const getImage = (item) => {
    if (!item) return "";

    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (firstImage?.preview) {
        return firstImage.preview;
      }

      if (firstImage?.url) {
        return firstImage.url;
      }

      if (firstImage?.src) {
        return firstImage.src;
      }
    }

    if (item.image_url) {
      return item.image_url;
    }

    if (item.image) {
      return item.image;
    }

    return "";
  };

  // -------------------------------------------------------
  // DATE
  // -------------------------------------------------------

  const getTimestamp = (item) => {
    if (!item) return 0;

    const value =
      item.created_at ||
      item.date ||
      null;

    if (!value) return 0;

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  // -------------------------------------------------------
  // NORMALIZE CONTENT
  // -------------------------------------------------------

  const normalizeContent = (item) => {
    return {
      id: item.id,
      type: "content",

      title:
        item.title ||
        item.description ||
        "Khoảnh khắc",

      location: item.location || "",

      image: getImage(item),

      date: item.date || "",
      created_at: item.created_at || "",

      link: item.id
        ? `/posts/${item.id}`
        : null,
    };
  };

  // -------------------------------------------------------
  // FETCH HOME FEED
  // -------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchHomeFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!contentCategoryIds.length) {
          if (isMounted) {
            setItems([]);
          }

          return;
        }

        const { data, error } = await supabase
          .from("services")
          .select(
            "id, title, description, location, date, created_at, images, image_url, image, category",
          )
          .in("category", contentCategoryIds);

        if (error) {
          throw error;
        }

        const contentItems = (data || [])
          .map(normalizeContent)
          .sort(
            (a, b) =>
              getTimestamp(b) -
              getTimestamp(a),
          )
          .slice(0, MAX_ITEMS);

        if (isMounted) {
          setItems(contentItems);
          setCurrent(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              "Không thể tải nội dung.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeFeed();

    return () => {
      isMounted = false;
    };
  }, [contentCategoryIds]);

  // -------------------------------------------------------
  // SAFE INDEX
  // -------------------------------------------------------

  const getIndex = (index) => {
    if (!items.length) return 0;

    return (
      ((index % items.length) +
        items.length) %
      items.length
    );
  };

  // -------------------------------------------------------
  // THREE VISIBLE ITEMS
  // -------------------------------------------------------

  const visibleItems = useMemo(() => {
    if (!items.length) {
      return {
        previous: null,
        current: null,
        next: null,
      };
    }

    return {
      previous: items[getIndex(current - 1)],
      current: items[getIndex(current)],
      next: items[getIndex(current + 1)],
    };
  }, [items, current]);

  // -------------------------------------------------------
  // MOVE
  // -------------------------------------------------------

  const moveNext = () => {
    if (!items.length) return;

    setCurrent((prev) =>
      getIndex(prev + 1),
    );
  };

  const movePrevious = () => {
    if (!items.length) return;

    setCurrent((prev) =>
      getIndex(prev - 1),
    );
  };

  const moveTo = (index) => {
    if (!items.length) return;

    setCurrent(getIndex(index));
  };

  // -------------------------------------------------------
  // AUTO PLAY
  // -------------------------------------------------------

  const startAutoPlay = () => {
    if (items.length <= 1) return;

    clearInterval(autoPlayRef.current);

    autoPlayRef.current = setInterval(() => {
      moveNext();
    }, AUTO_PLAY_MS);
  };

  useEffect(() => {
    startAutoPlay();

    return () => {
      clearInterval(autoPlayRef.current);
    };
  }, [items.length]);

  // -------------------------------------------------------
  // PAUSE / RESUME
  // -------------------------------------------------------

  const pauseAutoPlay = () => {
    clearInterval(autoPlayRef.current);
  };

  const resumeAutoPlay = () => {
    startAutoPlay();
  };

  // -------------------------------------------------------
  // NAVIGATION
  // -------------------------------------------------------

  const handleItemClick = (item) => {
    if (!item) return;

    if (item.link) {
      navigate(item.link);
    }
  };

  // -------------------------------------------------------
  // TOUCH / SWIPE
  // -------------------------------------------------------

  const handlePointerDown = (event) => {
    pauseAutoPlay();

    touchStartX.current = event.clientX;
    touchStartY.current = event.clientY;
    isDragging.current = true;
  };

  const handlePointerUp = (event) => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const startX = touchStartX.current;
    const startY = touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (
      startX === null ||
      startY === null
    ) {
      resumeAutoPlay();
      return;
    }

    const deltaX =
      event.clientX - startX;

    const deltaY =
      event.clientY - startY;

    const horizontalSwipe =
      Math.abs(deltaX) >
        SWIPE_THRESHOLD &&
      Math.abs(deltaX) >
        Math.abs(deltaY);

    if (horizontalSwipe) {
      if (deltaX < 0) {
        moveNext();
      } else {
        movePrevious();
      }
    }

    resumeAutoPlay();
  };

  const handlePointerCancel = () => {
    isDragging.current = false;

    touchStartX.current = null;
    touchStartY.current = null;

    resumeAutoPlay();
  };

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------

  if (loading) {
    return (
      <section className="carousel">
        <div className="carousel-loading">
          Đang tải...
        </div>
      </section>
    );
  }

  // -------------------------------------------------------
  // ERROR
  // -------------------------------------------------------

  if (error) {
    return (
      <section className="carousel">
        <div className="carousel-error">
          Không thể tải nội dung.
        </div>
      </section>
    );
  }

  // -------------------------------------------------------
  // EMPTY
  // -------------------------------------------------------

  if (!items.length) {
    return null;
  }

  // -------------------------------------------------------
  // CURRENT TEXT
  // -------------------------------------------------------

  const currentItem =
    visibleItems.current;

  const currentTitle =
    currentItem?.title || "";

  const currentLocation =
    currentItem?.location || "";

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <section className="carousel">
      <div
        className="carousel-stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={
          handlePointerCancel
        }
        onPointerLeave={(event) => {
          if (isDragging.current) {
            handlePointerUp(event);
          }
        }}
      >
        {/* -------------------------------------------------
            LEFT
        ------------------------------------------------- */}

        <button
          type="button"
          className="carousel-slot carousel-slot-side carousel-slot-left"
          onClick={() => {
            moveTo(
              getIndex(current - 1),
            );
          }}
          aria-label="Nội dung trước"
        >
          <div className="carousel-image">
            {visibleItems.previous?.image ? (
              <img
                src={
                  visibleItems.previous.image
                }
                alt={
                  visibleItems.previous.title ||
                  ""
                }
                draggable="false"
              />
            ) : (
              <div className="carousel-image-empty" />
            )}
          </div>
        </button>

        {/* -------------------------------------------------
            CURRENT
        ------------------------------------------------- */}

        <div className="carousel-center">
          <div className="carousel-highlight">
            {(currentTitle ||
              currentLocation) && (
              <div className="carousel-meta">
                {currentTitle && (
                  <h3 className="carousel-title">
                    {currentTitle}
                  </h3>
                )}

                {currentLocation && (
                  <p className="carousel-location">
                    {currentLocation}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              className="carousel-slot carousel-slot-main"
              onClick={() =>
                handleItemClick(
                  currentItem,
                )
              }
              aria-label={
                currentTitle ||
                "Xem nội dung"
              }
            >
              <div className="carousel-image">
                {currentItem?.image ? (
                  <img
                    src={currentItem.image}
                    alt={
                      currentTitle ||
                      ""
                    }
                    draggable="false"
                  />
                ) : (
                  <div className="carousel-image-empty" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------
            RIGHT
        ------------------------------------------------- */}

        <button
          type="button"
          className="carousel-slot carousel-slot-side carousel-slot-right"
          onClick={() => {
            moveTo(
              getIndex(current + 1),
            );
          }}
          aria-label="Nội dung tiếp theo"
        >
          <div className="carousel-image">
            {visibleItems.next?.image ? (
              <img
                src={visibleItems.next.image}
                alt={
                  visibleItems.next.title ||
                  ""
                }
                draggable="false"
              />
            ) : (
              <div className="carousel-image-empty" />
            )}
          </div>
        </button>
      </div>
    </section>
  );
}