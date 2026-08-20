import React, { useState } from 'react';
import '../css/Grid.css';
import DailyIncomeExpensePopup from './popup/DailyIncomeExpensePopup';

export default function DailyIncomeExpenseGrid({ rawData = [], onUpdateData }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedItemData, setSelectedItemData] = useState(null);

  const handleOpenPopup = (item) => {
    setSelectedDate(item.date);
    setSelectedItemData(item);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSaveData = (updatedItem) => {
    if (onUpdateData) {
      onUpdateData(updatedItem);
    }
  };

  // Bộ lọc linh hoạt: Hỗ trợ cả định dạng '14/08/2026' lẫn '14/8/2026'
  const filteredData = rawData.filter(item => {
    if (!item.date) return false;
    const d = item.date.trim();
    return (d.includes('/08/2026') || d.includes('/8/2026')) && d.includes('2026');
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/').map(Number);
    const [d2, m2, y2] = b.date.split('/').map(Number);
    return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
  });

  const gridData = sortedData.map((item) => {
    const incomeDetails = item.incomeDetails || {};
    const incomeVal = Object.keys(incomeDetails)
      .filter(k => k !== 'Ghi chú')
      .reduce((sum, k) => sum + (parseFloat(String(incomeDetails[k]).replace(/\./g, '')) || 0), 0);

    const expenseDetails = item.expenseDetails || {};
    const expenseVal = Object.keys(expenseDetails)
      .filter(k => k !== 'Ghi chú')
      .reduce((sum, k) => sum + (parseFloat(String(expenseDetails[k]).replace(/\./g, '')) || 0), 0);

    const dailyNet = incomeVal - expenseVal;

    return {
      originalItem: item,
      dayOfWeek: item.dayOfWeek || 'Thứ Hai',
      date: item.date,
      income: incomeVal.toLocaleString('vi-VN'),
      expense: expenseVal === 0 ? '0' : expenseVal.toLocaleString('vi-VN'),
      dailyNet: dailyNet,
      incomeDetails,
      expenseDetails
    };
  });

  // CẤU HÌNH CỐ ĐỊNH ĐỘ RỘNG CỘT VÀ CĂN TRÁI
  const LABEL_WIDTH = '110px';
  const NOTE_COLUMN_STYLE = {
    display: 'flex',
    justifyContent: 'flex-start',
    color: '#555',
    alignItems: 'flex-start',
    margin: '3px 0',
    width: '100%'
  };
  const LIST_ITEMS_CONTAINER_STYLE = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'left',
    paddingLeft: '5px',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap'
  };

  const renderNoteContent = (val, colorClass) => {
    if (!val) return null;
    // Bắt đúng quy ước -x hoặc -X để tự động ngắt dòng
    const lines = String(val).split(/-x/i).map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) return null;

    return (
      <div style={{ ...NOTE_COLUMN_STYLE, color: colorClass }}>
        <span style={{ flex: `0 0 ${LABEL_WIDTH}`, fontWeight: '500', textAlign: 'left' }}>• Ghi chú:</span>
        <div style={LIST_ITEMS_CONTAINER_STYLE}>
          {lines.map((line, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
              <span style={{ marginRight: '4px', flexShrink: 0 }}>-</span>
              <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNormalDetail = (key, val, colorClass) => {
    const num = parseFloat(String(val).replace(/\./g, '')) || 0;
    if (num === 0) return null;
    
    const formattedVal = colorClass === 'text-danger' ? `-${num.toLocaleString('vi-VN')}` : num.toLocaleString('vi-VN');
    
    return (
      <div key={key} style={{ ...NOTE_COLUMN_STYLE, color: colorClass || '#555' }}>
        <span style={{ flex: `0 0 ${LABEL_WIDTH}`, textAlign: 'left' }}>• {key}:</span>
        <span style={{ flex: 1, textAlign: 'right', fontWeight: '500' }}>{formattedVal} đ</span>
      </div>
    );
  };

  return (
    <div className="common-grid-container">
      {gridData.length === 0 ? (
        <div className="no-data-notice" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Chưa có dữ liệu cập nhật trong tháng 8.
        </div>
      ) : (
        gridData.map((item, index) => (
          <div 
            key={index} 
            className="grid-card"
            onClick={() => handleOpenPopup(item.originalItem)}
            style={{ cursor: 'pointer' }}
          >
            <div className="grid-header">
              <span className="grid-date">{item.dayOfWeek}, {item.date}</span>
            </div>
            
            <div className="grid-body">
              <div className="grid-row-inline">
                <div className="inline-group">
                  <span className="label">Thu vào:</span>
                  <span className="value text-success">+{item.income} đ</span>
                </div>
                <div className="inline-group">
                  <span className="label">Chi ra:</span>
                  <span className="value text-danger">-{item.expense} đ</span>
                </div>
              </div>

              <div className="grid-sub-details" style={{ fontSize: '13px', margin: '8px 0', borderTop: '1px dashed #eee', paddingTop: '6px' }}>
                {Object.entries(item.incomeDetails || {}).map(([key, val]) => {
                  if (key === 'Ghi chú') return <React.Fragment key={key}>{renderNoteContent(val, '#28a745')}</React.Fragment>;
                  return renderNormalDetail(key, val, '#28a745');
                })}

                {Object.entries(item.expenseDetails || {}).map(([key, val]) => {
                  if (key === 'Ghi chú') return <React.Fragment key={key}>{renderNoteContent(val, '#d9534f')}</React.Fragment>;
                  return renderNormalDetail(key, val, 'text-danger');
                })}
              </div>

              <div className="grid-row total-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '6px' }}>
                <span className="label">Thu nhập trong ngày:</span>
                <span className={`value total ${item.dailyNet < 0 ? 'text-danger' : 'text-success'}`} style={{ color: item.dailyNet < 0 ? '#d9534f' : '#28a745' }}>
                  <b>{item.dailyNet >= 0 ? `+${item.dailyNet.toLocaleString('vi-VN')}` : item.dailyNet.toLocaleString('vi-VN')} đ</b>
                </span>
              </div>
            </div>
          </div>
        ))
      )}

      <DailyIncomeExpensePopup 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup} 
        currentDate={selectedDate} 
        lastSavedData={selectedItemData}
        onSave={handleSaveData}
      />
    </div>
  );
}