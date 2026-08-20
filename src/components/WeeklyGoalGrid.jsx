import React from 'react';
import "../css/Grid.css";

// Hàm tính toán ngày tháng đầy đủ từ số ngày người dùng nhập
const parseFullDateAndDay = (dayStr) => {
  if (!dayStr) return { dateObj: null, displayTitle: 'Chưa xác định ngày' };

  const dayNum = parseInt(dayStr, 10);
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0 - 11

  // Xử lý thông minh nếu đầu tháng/cuối tháng vắt qua lại
  const currentDay = now.getDate();
  if (currentDay > 25 && dayNum < 5) {
    month += 1; // Sang tháng sau
    if (month > 11) { month = 0; year += 1; }
  } else if (currentDay < 5 && dayNum > 25) {
    month -= 1; // Tháng trước
    if (month < 0) { month = 11; year -= 1; }
  }

  const dateObj = new Date(year, month, dayNum);
  if (isNaN(dateObj.getTime())) return { dateObj: null, displayTitle: `Ngày ${dayStr}` };

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[dateObj.getDay()];

  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();

  return {
    dateObj,
    displayTitle: `${dayName}, ${dd}/${mm}/${yyyy}`
  };
};

export default function WeeklyGoalGrid({ rawData = [], onEdit, onDelete }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Mốc 00:00 của ngày hiện tại

  // 1. Lọc bỏ các công việc đã qua ngày (hết ngày hôm đó, tính từ 00:00 hôm sau)
  const activeData = rawData.filter(item => {
    const dayVal = item.content?.['Ngày'];
    if (!dayVal) return true; // Nếu không có ngày thì vẫn giữ hiển thị
    const { dateObj } = parseFullDateAndDay(dayVal);
    if (!dateObj) return true;
    
    // Đặt thời gian so sánh là 00:00 ngày tiếp theo
    const expiryDate = new Date(dateObj);
    expiryDate.setDate(expiryDate.getDate() + 1);
    expiryDate.setHours(0, 0, 0, 0);

    return today < expiryDate; // Nếu hôm nay vẫn nhỏ hơn ngày sang hôm sau thì giữ lại
  });

  // 2. Sắp xếp theo thứ tự thời gian (Ngày tăng dần, cùng ngày thì Giờ sớm lên trước)
  const sortedData = [...activeData].sort((a, b) => {
    const dateA = parseFullDateAndDay(a.content?.['Ngày']).dateObj || new Date(0);
    const dateB = parseFullDateAndDay(b.content?.['Ngày']).dateObj || new Date(0);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }

    // Nếu cùng ngày, so sánh Giờ
    const timeA = a.content?.['Giờ'] || '00:00';
    const timeB = b.content?.['Giờ'] || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="common-grid-container">
      {sortedData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Chưa có kế hoạch tuần nào được thiết lập.
        </div>
      ) : (
        sortedData.map((item, index) => {
          const dayVal = item.content?.['Ngày'];
          const { displayTitle } = parseFullDateAndDay(dayVal);

          // Lọc bỏ trường 'Ngày', 'Tuần' ra khỏi body vì đã đưa lên header
          const filteredContent = Object.entries(item.content || {}).filter(
            ([key, val]) => key !== 'Ngày' && key !== 'Tuần' && val && val.toString().trim() !== ''
          );

          return (
            <div 
              key={`${item.id || 'item'}_${index}`} 
              className="grid-card" 
              onClick={() => onEdit(item, index)} 
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="grid-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingRight: '5px' 
              }}>
                <strong>{displayTitle}</strong>
                
                {/* Nút xóa nhanh trực tiếp trên card */}
                <button
                  type="button"
                  title="Xóa kế hoạch này"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn không cho bật popup chỉnh sửa khi bấm nút xóa
                    if (window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này không?')) {
                      if (onDelete) onDelete(item.id);
                    }
                  }}
                  style={{
                    background: '#fff',
                    border: '1px solid #ffccd5',
                    borderRadius: '6px',
                    color: '#e53e3e',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                  onMouseLeave={(e) => e.target.style.background = '#fff'}
                >
                  🗑️
                </button>
              </div>

              <div className="grid-body">
                {filteredContent.map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500', width: '100px' }}>• {key}:</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}