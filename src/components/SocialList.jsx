import React, { useState } from "react";
import "../css/Grid.css";
import SearchBar from "./searchBar";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";

export default function SocialList({ activeSeries, seriesItems, onBack, onOpenAddPopup, onEditItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!activeSeries) return null;

  const sortedItems = seriesItems
    ? [...seriesItems]
        .map((item, originalIndex) => ({ ...item, originalIndex }))
        .sort((a, b) => {
          const epA = Number(a.episode) || 0;
          const epB = Number(b.episode) || 0;
          return epB - epA;
        })
    : [];

  // Hàm viết hoa chữ cái đầu của tên mẫu/clip
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Hàm chuẩn hóa đường dẫn để tránh lỗi mở nhầm localhost
  const formatUrl = (url) => {
    if (!url || url.trim() === "") return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <div className="grid-container">
      <div className="sticky-header-container">
        <div className="social-header-top-row">
          <button type="button" onClick={onBack} title="Quay lại danh sách Series" className="social-back-btn">
            ←
          </button>
          <h3 className="social-title-heading">{activeSeries.toUpperCase()}</h3>
          <button type="button" onClick={onOpenAddPopup} title="Thêm mục mới cho series" className="social-add-btn">
            +
          </button>
        </div>
        <div className="social-search-bar-wrapper">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Tìm kiếm theo tiêu đề..." />
        </div>
      </div>

      {!sortedItems || sortedItems.length === 0 ? (
        <div className="grid-no-data social-no-data">Chưa có mục nào trong series này.</div>
      ) : (
        <div className="phuc-social-grid">
          {sortedItems.map((item) => {
            const rawKey = item.clipName || item.keyWord;
            if (!rawKey || rawKey.trim() === "") return null;

            const formattedKey = capitalizeWords(rawKey);
            const actualIndex = item.originalIndex;
            const seriesNameUpper = (item.seriesName || activeSeries).toUpperCase();
            const paddedEpisode = item.episode ? String(item.episode).padStart(3, "0") : "000";
            const titleDisplay = `${seriesNameUpper}#${paddedEpisode} - ${formattedKey}`;
            
            const matchesSearch = titleDisplay.toLowerCase().includes(searchTerm.toLowerCase());
            if (searchTerm.trim() !== "" && !matchesSearch) return null;

            const platforms = [
              { active: item.postedMeta, link: item.metaLink, icon: <FaFacebook />, name: "Meta" },
              { active: item.postedYouTube, link: item.youtubeLink, icon: <FaYoutube />, name: "YouTube" },
              { active: item.postedTikTok, link: item.tiktokLink, icon: <FaTiktok />, name: "TikTok" }
            ];
 
            return (
              <div
                key={actualIndex}
                className="phuc-social-card"
              >
                <div className="phuc-social-img-box" onClick={() => onEditItem && onEditItem(item, actualIndex)}>
                  {item.imagePreview ? (
                    <img src={item.imagePreview} alt="Preview" />
                  ) : (
                    <div className="phuc-social-no-img">Chưa có ảnh</div>
                  )}
                  <div className="phuc-social-overlay" />
                </div>

                <div 
                  className="phuc-social-text-top" 
                  onClick={() => onEditItem && onEditItem(item, actualIndex)}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                >
                  <div className="phuc-social-title-text" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    {titleDisplay}
                  </div>
                  {item.chapter && <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>({item.chapter})</div>}
                </div>

                {/* Phần icon mạng xã hội phía dưới */}
                <div className="phuc-social-icons-bottom">
                  {platforms.map((p, i) => {
                    const hasLink = p.link && p.link.trim() !== "";
                    const finalLink = formatUrl(p.link);

                    return (
                      <div
                        key={i}
                        className={`phuc-social-platform-item ${p.active ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.active) {
                            if (hasLink) {
                              window.open(finalLink, "_blank", "noopener,noreferrer");
                            } else {
                              alert(`Chưa có link cho nền tảng ${p.name}!`);
                            }
                          } else {
                            onEditItem && onEditItem(item, actualIndex);
                          }
                        }}
                        title={p.active ? (hasLink ? `Mở link ${p.name}` : `Chưa có link ${p.name}`) : `Chưa bật ${p.name}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          background: p.active ? '#58D68D' : 'rgba(0, 0, 0, 0.6)',
                          color: p.active ? '#111' : '#cbd5e0', 
                          fontWeight: p.active ? '600' : 'normal',
                          padding: '5px 8px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        {p.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}