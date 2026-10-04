import React, { useEffect, useMemo, useState } from "react";
import "../css/Manager.css";
import "../css/PricePopup.css";

export default function PriceManager({ categoryId, searchTerm, savedData, onCountChange, onEdit }) {
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [swipe, setSwipe] = useState({ id: null, x: 0, startX: 0, startY: 0, dragging: false });

  // =========================================================
  // HELPERS
  // =========================================================

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const formatMoney = (value) => {
    const number = toNumber(value);

    if (!number) return "0đ";

    return `${Math.round(number).toLocaleString("vi-VN")}đ`;
  };

  const formatDescription = (description) => {
    if (!description) return [];

    return String(description)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        const parts = line.split("-x");

        return parts.map((part) => part.trim()).filter(Boolean);
      });
  };

  // =========================================================
  // LOAD SAVED DATA
  // =========================================================

  useEffect(() => {
    const saved = Array.isArray(savedData)
      ? savedData.filter((item) => {
          if (!item) return false;

          if (item.category && item.category !== categoryId) {
            return false;
          }

          return true;
        })
      : [];

    setItems(saved);

    if (onCountChange) {
      onCountChange(saved.length);
    }
  }, [categoryId, savedData, onCountChange]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredItems = useMemo(() => {
    const keyword = String(searchTerm || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      String(item.title || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, searchTerm]);

  // =========================================================
  // COLLAPSE
  // =========================================================

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (item) => {
    const confirmed = window.confirm(`Xóa "${item.title}" khỏi danh sách giá?`);

    if (!confirmed) return;

    setItems((prev) => {
      const next = prev.filter((current) => String(current.id) !== String(item.id));

      if (onCountChange) {
        onCountChange(next.length);
      }

      return next;
    });

    setExpandedItems((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  // =========================================================
  // SWIPE
  // =========================================================

  const handlePointerDown = (event, item) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    setSwipe({
      id: item.id,
      x: 0,
      startX: event.clientX,
      startY: event.clientY,
      dragging: true,
    });

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event, item) => {
    if (!swipe.dragging || String(swipe.id) !== String(item.id)) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      return;
    }

    const cardWidth = event.currentTarget.offsetWidth || 1;
    const maxSwipe = cardWidth * 0.95;
    const nextX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));

    setSwipe((prev) => ({
      ...prev,
      x: nextX,
    }));
  };

  const handlePointerUp = (event, item) => {
    if (!swipe.dragging || String(swipe.id) !== String(item.id)) return;

    const cardWidth = event.currentTarget.offsetWidth || 1;
    const threshold = cardWidth * 0.85;
    const currentX = swipe.x;

    if (currentX >= threshold) {
      setSwipe({ id: null, x: 0, startX: 0, startY: 0, dragging: false });
      handleEdit(item);
      return;
    }

    if (currentX <= -threshold) {
      setSwipe({ id: null, x: 0, startX: 0, startY: 0, dragging: false });
      handleDelete(item);
      return;
    }

    setSwipe({ id: null, x: 0, startX: 0, startY: 0, dragging: false });
  };

  const handlePointerCancel = () => {
    setSwipe({ id: null, x: 0, startX: 0, startY: 0, dragging: false });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="manager">
      <div className="list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">Chưa có hạng mục giá</div>
        ) : (
          filteredItems.map((item, index) => {
            const itemId = item.id || `${item.title}-${index}`;
            const isExpanded = !!expandedItems[itemId];
            const isDescriptionExpanded = !!expandedItems[`description-${itemId}`];
            const images = Array.isArray(item.images) ? item.images : [];
            const image = images[0] || "";

            const materials = Array.isArray(item.materials) ? item.materials : [];
            const descriptionItems = formatDescription(item.description);
            const x = String(swipe.id) === String(item.id) ? swipe.x : 0;

            return (
              <div
                className="card price-card"
                key={itemId}
                onPointerDown={(event) => handlePointerDown(event, item)}
                onPointerMove={(event) => handlePointerMove(event, item)}
                onPointerUp={(event) => handlePointerUp(event, item)}
                onPointerCancel={handlePointerCancel}
                style={{
                  transform: `translateX(${x}px)`,
                  transition: swipe.dragging && String(swipe.id) === String(item.id) ? "none" : "transform 0.2s ease",
                  touchAction: "pan-y",
                }}
              >
                <div className="card-main price-card-main">
                  <div className="info price-card-info">
                    {item.title && <div className="row name">{item.title}</div>}

                    <div className="row">
                      <span>Giá niêm yết: </span>
                      <strong>{formatMoney(item.list_price)}</strong>
                    </div>

                    <div className="row">
                      <span>Giá vốn: </span>
                      <strong>{formatMoney(item.cost_price)}</strong>
                    </div>

                    <div className="row">
                      <span>Giá outS: </span>
                      <strong>{formatMoney(item.outs_price)}</strong>
                    </div>
                  </div>

                  {image ? (
                    <img src={image} alt={item.title || "Price"} className="price-card-image" />
                  ) : (
                    <div className="price-card-image price-card-image-empty">Chưa có ảnh</div>
                  )}
                </div>

                <div className="price-card-toggle-row">
                  <button
                    type="button"
                    className="price-card-note-toggle"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedItems((prev) => ({
                        ...prev,
                        [`description-${itemId}`]: !prev[`description-${itemId}`],
                      }));
                    }}
                  >
                    <span>{isDescriptionExpanded ? "▼" : "▶"} Mô tả</span>
                  </button>
                </div>

                {isDescriptionExpanded && (
                  <div className="price-card-description">
                    {descriptionItems.map((descriptionItem, descriptionIndex) => (
                      <div className="price-card-description-row" key={descriptionIndex}>
                        - {descriptionItem}
                      </div>
                    ))}
                  </div>
                )}

                <div className="price-card-toggle-row">
                  <button
                    type="button"
                    className="price-card-note-toggle"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpanded(itemId);
                    }}
                  >
                    <span>{isExpanded ? "▼" : "▶"} Note</span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="price-card-materials">
                    {materials.length === 0 ? (
                      <div className="price-card-material-empty">Chưa có vật tư</div>
                    ) : (
                      materials.map((material, materialIndex) => {
                        const quantity = toNumber(material?.quantity);
                        const unitPrice = toNumber(material?.unit_price);
                        const total = quantity * unitPrice;

                        return (
                          <div className="price-card-material-row" key={materialIndex}>
                            <span>{material?.name || "Vật tư"}</span> |<span> SL: {quantity}</span> |<span> ĐG: {formatMoney(unitPrice)}</span> |
                            <span> TT: {formatMoney(total)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
