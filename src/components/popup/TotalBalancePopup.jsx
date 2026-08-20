import React, { useState, useEffect } from 'react';
import '../../css/Popup.css';

export default function TotalBalancePopup({ isOpen, onClose, onSave, currentDate, lastSavedData }) {
  const [balanceData, setBalanceData] = useState({
    techKonto: '',
    vibKonto: '',
    tpKonto: '',
    vpKonto: '',
    grabKonto: '',
    kassenfrisch: '',
    dasBargeld: '',
    eWallet: '',
    note: ''
  });

  const formatCurrencyInput = (value) => {
    if (!value) return '';
    const numberString = String(value).replace(/\D/g, '');
    if (!numberString) return '';
    return Number(numberString).toLocaleString('vi-VN');
  };

  useEffect(() => {
    setBalanceData({
      techKonto: '',
      vibKonto: '',
      tpKonto: '',
      vpKonto: '',
      grabKonto: '',
      kassenfrisch: '',
      dasBargeld: '',
      eWallet: '',
      note: ''
    });
  }, [currentDate, lastSavedData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'note' ? value : formatCurrencyInput(value);
    setBalanceData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const previousValues = lastSavedData || {
      techKonto: 37225655,
      vibKonto: 150000, 
      tpKonto: 479,
      vpKonto: 0,
      grabKonto: 330783,
      kassenfrisch: 3736000,
      dasBargeld: 1771000,
      eWallet: 124007
    };

    const formattedData = {};
    Object.keys(balanceData).forEach(key => {
      if (key === 'note') {
        formattedData[key] = balanceData[key];
      } else {
        const val = balanceData[key];
        if (val === '' || val === null || val === undefined) {
          formattedData[key] = Number(previousValues[key]) || 0;
        } else {
          try {
            const sanitizedExpr = String(val).replace(/\./g, '').replace(/[^0-9+\-*/.]/g, '');
            // eslint-disable-next-line no-eval
            const calculatedResult = eval(sanitizedExpr);
            formattedData[key] = isNaN(calculatedResult) ? 0 : calculatedResult;
          } catch (error) {
            formattedData[key] = 0;
          }
        }
      }
    });

    onSave({
      date: currentDate,
      details: formattedData
    });

    setBalanceData({
      techKonto: '',
      vibKonto: '',
      tpKonto: '',
      vpKonto: '',
      grabKonto: '',
      kassenfrisch: '',
      dasBargeld: '',
      eWallet: '',
      note: ''
    });

    onClose();
  };

  const placeholders = lastSavedData ? {
    techKonto: Number(lastSavedData.techKonto || 0).toLocaleString('vi-VN'),
    vibKonto: Number(lastSavedData.vibKonto || 0).toLocaleString('vi-VN'),
    tpKonto: Number(lastSavedData.tpKonto || 0).toLocaleString('vi-VN'),
    vpKonto: Number(lastSavedData.vpKonto || 0).toLocaleString('vi-VN'),
    grabKonto: Number(lastSavedData.grabKonto || 0).toLocaleString('vi-VN'),
    kassenfrisch: Number(lastSavedData.kassenfrisch || 0).toLocaleString('vi-VN'),
    dasBargeld: Number(lastSavedData.dasBargeld || 0).toLocaleString('vi-VN'),
    eWallet: Number(lastSavedData.eWallet || 0).toLocaleString('vi-VN'),
  } : {
    techKonto: '37.225.655',
    vibKonto: '150.000',
    tpKonto: '479',
    vpKonto: '0',
    grabKonto: '330.783',
    kassenfrisch: '3.736.000',
    dasBargeld: '1.771.000',
    eWallet: '124.007'
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      {/* Thêm style display flex cho container để chia bố cục Header - Body - Footer cố định */}
      <div className="popup-container" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
        <div className="popup-header" style={{ flexShrink: 0 }}>
          <h3>Cập nhật tổng tài sản ({currentDate})</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Body có scroll riêng */}
          <div className="popup-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <div className="form-group">
              <label>1. Tài khoản Techcombank</label>
              <input type="text" name="techKonto" value={balanceData.techKonto} onChange={handleChange} placeholder={placeholders.techKonto} />
            </div>
            <div className="form-group">
              <label>2. Tài khoản VIB</label>
              <input type="text" name="vibKonto" value={balanceData.vibKonto} onChange={handleChange} placeholder={placeholders.vibKonto} />
            </div>
            <div className="form-group">
              <label>3. Tài khoản TPBank</label>
              <input type="text" name="tpKonto" value={balanceData.tpKonto} onChange={handleChange} placeholder={placeholders.tpKonto} />
            </div>
            <div className="form-group">
              <label>4. Tài khoản VPBank</label>
              <input type="text" name="vpKonto" value={balanceData.vpKonto} onChange={handleChange} placeholder={placeholders.vpKonto} />
            </div>
            <div className="form-group">
              <label>5. Ví Grab</label>
              <input type="text" name="grabKonto" value={balanceData.grabKonto} onChange={handleChange} placeholder={placeholders.grabKonto} />
            </div>
            <div className="form-group">
              <label>6. Tiền đẹp (mới tinh vừa in ra)</label>
              <input type="text" name="kassenfrisch" value={balanceData.kassenfrisch} onChange={handleChange} placeholder={placeholders.kassenfrisch} />
            </div>
            <div className="form-group">
              <label>7. Tiền mặt</label>
              <input type="text" name="dasBargeld" value={balanceData.dasBargeld} onChange={handleChange} placeholder={placeholders.dasBargeld} />
            </div>
            <div className="form-group">
              <label>8. Ví ETC</label>
              <input type="text" name="eWallet" value={balanceData.eWallet} onChange={handleChange} placeholder={placeholders.eWallet} />
            </div>
            <div className="form-group">
              <label>9. Ghi chú</label>
              <textarea name="note" value={balanceData.note} onChange={handleChange} placeholder="Nhập ghi chú (nếu có)..." rows="2" />
            </div>
          </div>

          {/* Footer chứa nút cập nhật luôn bám đáy */}
          <div className="popup-footer" style={{ flexShrink: 0 }}>
            <button type="submit" className="submit-update-btn">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  );
}