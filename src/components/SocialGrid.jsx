import React from 'react';
import "../css/Grid.css";
import { getSeriesDisplayName } from '../datas/seriesNameMapping'; 
import { EditIcon, TrashIcon } from './Icons';

export default function SocialGrid({ rawData, onSelectSeries, onEditSeries, onDeleteSeries }) {
  // Lấy danh sách các key và sắp xếp giảm dần theo thời gian updatedAt
  const seriesKeys = rawData ? Object.keys(rawData).sort((a, b) => {
    const listA = rawData[a] || [];
    const listB = rawData[b] || [];
    
    const timeA = listA.updatedAt || 0;
    const timeB = listB.updatedAt || 0;
    
    return timeB - timeA;
  }) : [];

  if (seriesKeys.length === 0) {
    return (
      <div className="grid-no-data" style={{ padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '12px', marginTop: '15px', color: '#666' }}>
        Chưa có Series nào được tạo. Bấm nút <strong>"Cập nhật"</strong> ở phía trên để khởi tạo Series mới!
      </div>
    );
  }

  return (
    <div className="grid-container">
      <h3 style={{ marginBottom: '12px', fontSize: '15px', color: '#2d3748' }}>Danh sách các Series hiện có:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {seriesKeys.map((seriesKey, idx) => {
          const rawSeriesList = rawData[seriesKey] || [];
          
          // Lọc chính xác các mục có keyWord hợp lệ (đồng bộ hoàn toàn với danh sách bên trong)
          const validItemsList = Array.isArray(rawSeriesList) 
            ? rawSeriesList.filter(item => item && item.keyWord && item.keyWord.trim() !== '')
            : [];

          const latestItem = validItemsList[validItemsList.length - 1] || {};
          
          const purposeText = rawSeriesList.purpose || latestItem.purpose || "Chưa có mục đích cho series này.";
          const displayName = rawSeriesList.seriesName || getSeriesDisplayName(seriesKey);

          return (
            <div 
              key={idx} 
              className="grid-card-box" 
              style={{ borderLeft: '4px solid var(--primary-dark-red, #c92a2a)', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <div 
                className="grid-header" 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div 
                  onClick={() => onSelectSeries && onSelectSeries(seriesKey)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', flex: 1 }}
                >
                  <span className="grid-date" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-dark-red, #c92a2a)' }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase' }}>
                    Mã: {seriesKey}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Hiển thị số lượng mục chuẩn xác dựa trên danh sách đã lọc */}
                  <span style={{ fontSize: '12px', background: '#f1f3f5', padding: '2px 8px', borderRadius: '10px', color: '#495057' }}>
                    {validItemsList.length} mục
                  </span>

                  {/* Nút sửa/xóa Series */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSeries && onEditSeries(seriesKey);
                      }} 
                      title="Chỉnh sửa Series"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#3182ce", fontSize: "14px" }}
                    >
                      <EditIcon />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSeries && onDeleteSeries(seriesKey);
                      }} 
                      title="Xóa Series"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#e53e3e", fontSize: "14px" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div 
                className="grid-content-list" 
                onClick={() => onSelectSeries && onSelectSeries(seriesKey)}
                style={{ marginTop: '8px', cursor: 'pointer' }}
              >
                <div className="info-row">
                  <span className="info-label italic" style={{ color: '#4a5568' }}>Mục đích: </span>
                  <span className="info-value italic text-gray" style={{ fontSize: '13px' }}>{purposeText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}