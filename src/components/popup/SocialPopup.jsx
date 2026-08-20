import React, { useState, useEffect } from "react";
import "../../css/Popup.css";

export default function SocialPopup({ isOpen, onClose, onSave, isEditing, lastSavedData, initialTab = "series" }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState(''); 
  const [purpose, setPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState(''); 
  const [scope, setScope] = useState('Cá nhân'); 
  const [budget, setBudget] = useState(''); 
  const [startDate, setStartDate] = useState(''); 
  const [timeSlot, setTimeSlot] = useState(''); 
  const [notes, setNotes] = useState(''); 

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setTitle(lastSavedData?.title || '');
      setCode(lastSavedData?.code || '');
      setPurpose(lastSavedData?.purpose || '');
      setTargetAudience(lastSavedData?.targetAudience || '');
      setScope(lastSavedData?.scope || 'Cá nhân');
      setBudget(lastSavedData?.budget || '');
      setStartDate(lastSavedData?.startDate || '');
      setTimeSlot(lastSavedData?.timeSlot || '');
      setNotes(lastSavedData?.notes || '');
    }
  }, [isOpen, lastSavedData, initialTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      activeTab,
      title,
      code: activeTab === 'series' ? code : (title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')),
      purpose,
      targetAudience,
      scope,
      budget,
      startDate,
      timeSlot,
      notes,
      updatedAt: new Date().toISOString()
    };
    onSave(dataToSave);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ maxWidth: '550px', width: '100%' }}>
        <div className="popup-header">
          <h3>{isEditing ? `Chỉnh Sửa ${activeTab === 'series' ? 'Series' : 'Idea'}` : "Tạo Mới"}</h3>
          <button type="button" className="popup-close-btn" onClick={onClose}>&times;</button>
        </div>

        {!isEditing && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f3f5', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('series')}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                background: activeTab === 'series' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'series' ? '600' : '400', cursor: 'pointer',
                boxShadow: activeTab === 'series' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: activeTab === 'series' ? 'var(--primary-dark-red, #c92a2a)' : '#666'
              }}
            >
              Series
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('idea')}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                background: activeTab === 'idea' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'idea' ? '600' : '400', cursor: 'pointer',
                boxShadow: activeTab === 'idea' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: activeTab === 'idea' ? 'var(--primary-dark-red, #c92a2a)' : '#666'
              }}
            >
              Ideas
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label>Tên {activeTab === 'series' ? 'Series' : 'Ý tưởng'} (Title):</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={activeTab === 'series' ? "VD: Từ một quả Bóng..." : "VD: Xây dựng kênh podcast ngắn..."} 
              required
            />
          </div>

          {activeTab === 'series' && (
            <div className="form-group">
              <label>Mã (VD: TMQB):</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())} 
                placeholder="Nhập mã viết tắt..." 
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Mục đích:</label>
            <textarea 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              placeholder="Mục đích / Slogan cốt lõi..." 
              rows="2"
            />
          </div>

          {activeTab === 'idea' && (
            <>
              <div className="form-group">
                <label>Phục vụ / Mục đích chi tiết (Phục vụ cho việc gì, ai):</label>
                <input 
                  type="text" 
                  value={targetAudience} 
                  onChange={(e) => setTargetAudience(e.target.value)} 
                  placeholder="VD: Cải thiện kỹ năng nói, phục vụ khách hàng..." 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Phạm vi:</label>
                  <select 
                    value={scope} 
                    onChange={(e) => setScope(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ced4da' }}
                  >
                    <option value="Cá nhân">Cá nhân</option>
                    <option value="Gia đình">Gia đình</option>
                    <option value="Tập thể / Cộng đồng">Tập thể / Cộng đồng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dự trù chi phí (Ngân sách):</label>
                  <input 
                    type="text" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                    placeholder="VD: 500k hoặc 0đ" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Ngày bắt đầu dự kiến:</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Khung giờ thực hiện:</label>
                  <input 
                    type="text" 
                    value={timeSlot} 
                    onChange={(e) => setTimeSlot(e.target.value)} 
                    placeholder="VD: 20h - 21h tối" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Kế hoạch cơ bản / Ghi chú:</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Các bước triển khai sơ khai..." 
                  rows="2"
                />
              </div>
            </>
          )}

          <div className="popup-footer" style={{ padding: 0, background: 'transparent', border: 'none', marginTop: '16px' }}>
            <button type="submit" className="popup-submit-btn">Lưu Lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}