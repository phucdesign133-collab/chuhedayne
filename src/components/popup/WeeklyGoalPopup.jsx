import React, { useState, useEffect } from 'react';
import '../../css/Popup.css';

const getCurrentWeekString = () => {
  const curr = new Date();
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(curr.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  return `Tuần ${formatDate(monday)} - ${formatDate(sunday)}`;
};

export default function WeeklyGoalPopup({ isOpen, onClose, itemData, onSave }) {
  const [formData, setFormData] = useState({
    'Ngày': '',
    'Công việc': '',
    'Giờ': '',
    'Đối tác': '',
    'Địa điểm': '',
    'Ghi chú': ''
  });

  const weekTitle = getCurrentWeekString();

  useEffect(() => {
    if (itemData && itemData.content) {
      setFormData({
        'Ngày': itemData.content['Ngày'] || '',
        'Công việc': itemData.content['Công việc'] || '',
        'Giờ': itemData.content['Giờ'] || '',
        'Đối tác': itemData.content['Đối tác'] || '',
        'Địa điểm': itemData.content['Địa điểm'] || '',
        'Ghi chú': itemData.content['Ghi chú'] || ''
      });
    } else {
      setFormData({
        'Ngày': '',
        'Công việc': '',
        'Giờ': '',
        'Đối tác': '',
        'Địa điểm': '',
        'Ghi chú': ''
      });
    }
  }, [itemData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    let processedValue = value;

    if (key === 'Ngày') {
      processedValue = value.replace(/\D/g, '').slice(0, 2);
    } else if (key === 'Giờ') {
      // Chỉ cho gõ số thuần túy tối đa 4 ký tự để không bị giựt
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (key === 'Địa điểm') {
      const trimmed = value.trimStart();
      const parts = trimmed.split(' ');
      const firstWord = parts[0].toLowerCase();
      const restOfText = parts.slice(1).join(' ');

      let prefix = parts[0];
      if (firstWord === 'l') {
        prefix = 'Lotteria';
      } else if (firstWord === 'k' || firstWord === 'kfc') {
        prefix = 'KFC';
      } else if (firstWord === 't' || firstWord === 'texas') {
        prefix = 'Texas Chicken';
      } else if (firstWord === 'domino') {
        prefix = 'Domino Pizza';
      } else if (firstWord === 'hut') {
        prefix = 'Pizza Hut';
      }

      const capitalizedRest = restOfText
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      processedValue = restOfText ? `${prefix} ${capitalizedRest}` : value;
    }

    setFormData(prev => ({ ...prev, [key]: processedValue }));
  };

  const handleSave = () => {
    let finalFormData = { ...formData };
    
    // Tự động chèn dấu : vào giờ khi lưu (VD: 0120 -> 01:20)
    let timeVal = finalFormData['Giờ'].replace(/\D/g, '');
    if (timeVal.length === 3) timeVal = '0' + timeVal;
    if (timeVal.length === 4) {
      finalFormData['Giờ'] = `${timeVal.slice(0, 2)}:${timeVal.slice(2)}`;
    }

    const payloadContent = {
      ...finalFormData,
      'Tuần': weekTitle
    };
    onSave({ id: itemData?.id || Date.now().toString(), content: payloadContent, weekName: weekTitle });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h3>{weekTitle}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="popup-body">
          {Object.keys(formData).filter(k => k !== 'Tuần').map(key => (
            <div className="form-group" key={key}>
              <label>{key}</label>
              <input 
                type="text"
                autoComplete="off"
                name={`field_${key}`}
                value={formData[key]} 
                onChange={(e) => handleChange(key, e.target.value)} 
                className="common-input"
                placeholder={
                  key === 'Ngày' ? 'Nhập ngày (VD: 15)' :
                  key === 'Giờ' ? 'Nhập giờ (VD: 0130)' :
                  key === 'Địa điểm' ? 'Quy ước: L, K, T, domino, hut...' :
                  `Nhập ${key.toLowerCase()}...`
                }
              />
            </div>
          ))}
        </div>

        <div className="popup-footer" style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
          >
            Đóng
          </button>
          <button 
            type="button" 
            className="popup-submit-btn" 
            onClick={handleSave}
            style={{ flex: 1, margin: 0 }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}