import React from 'react';
import "../css/Grid.css";
import { EditIcon, TrashIcon } from './Icons';

export default function SocialIdeaGrid({ rawData, onSelectSeries, onEditSeries, onDeleteSeries }) {
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
        Chưa có Idea nào được tạo. Bấm nút <strong>"Cập nhật"</strong> ở phía trên để khởi tạo Idea mới!
      </div>
    );
  }

  return (
    <div className="grid-container">
      <h3 style={{ marginBottom: '12px', fontSize: '15px', color: '#2d3748' }}>Danh sách các Ideas hiện có:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {seriesKeys.map((seriesKey, idx) => {
          const seriesDataList = rawData[seriesKey] || [];
          const displayName = seriesDataList.seriesName || seriesKey;
          const purposeText = seriesDataList.purpose || "Chưa có định hướng / slogan.";
          const targetAudience = seriesDataList.targetAudience;
          const scope = seriesDataList.scope;
          const budget = seriesDataList.budget;
          const startDate = seriesDataList.startDate;
          const timeSlot = seriesDataList.timeSlot;
          const notes = seriesDataList.notes;

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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', background: '#f1f3f5', padding: '2px 8px', borderRadius: '10px', color: '#495057' }}>
                    {seriesDataList.length} mục
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSeries && onEditSeries(seriesKey);
                      }} 
                      title="Chỉnh sửa Idea"
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
                      title="Xóa Idea"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#e53e3e", fontSize: "14px" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết mở rộng của Idea */}
              <div 
                className="grid-content-list" 
                onClick={() => onSelectSeries && onSelectSeries(seriesKey)}
                style={{ marginTop: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5568' }}
              >
                <div><strong>Mục đích:</strong> <span className="italic">{purposeText}</span></div>
                {targetAudience && <div><strong>Phục vụ:</strong> {targetAudience}</div>}
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                  {scope && <span>🌐 Phạm vi: <strong>{scope}</strong></span>}
                  {budget && <span>💰 Ngân sách: <strong>{budget}</strong></span>}
                  {startDate && <span>📅 Bắt đầu: <strong>{startDate}</strong></span>}
                  {timeSlot && <span>⏰ Khung giờ: <strong>{timeSlot}</strong></span>}
                </div>

                {notes && <div style={{ background: '#f8f9fa', padding: '8px', borderRadius: '6px', marginTop: '6px', fontSize: '12px' }}><strong>Ghi chú:</strong> {notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}