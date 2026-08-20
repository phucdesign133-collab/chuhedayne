import React, { useState, useEffect } from 'react';
import '../../css/Popup.css';

export default function DailyIncomeExpensePopup({ isOpen, onClose, currentDate, onSave, lastSavedData }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('income');

  const [incomeValues, setIncomeValues] = useState({
    '1. Chạy show': '',
    '2. Chạy taxi': '',
    '3. Việc ngoài': '',
    '4. Bonus taxi': '',
    '5. Streak': '',
    '6. Tips': '',
    'Ghi chú': ''
  });

  const [expenseValues, setExpenseValues] = useState({
    '1. Ăn uống': '',
    '2. Đậu sạc': '',
    '3. Đậu gửi': '',
    '4. Rửa': '',
    '5. Phát sinh': '',
    '6. Nhập hàng': '',
    'Ghi chú': ''
  });

  // Hàm tính toán biểu thức an toàn giữ nguyên vẹn từng đồng (không làm tròn mất số lẻ)
  const evaluateExpression = (inputStr) => {
    if (!inputStr) return '';
    const str = String(inputStr).trim();
    
    // Nếu chứa toán tử, tiến hành tính toán biểu thức
    if (/[+\-*/]/.test(str)) {
      if (/^[0-9+\-*/\.\s]+$/.test(str)) {
        try {
          // Chuẩn hóa dấu chấm phân cách hàng nghìn trước khi tính toán
          const sanitizedStr = str.replace(/\./g, '');
          // eslint-disable-next-line no-new-func
          const result = Function(`'use strict'; return (${sanitizedStr})`)();
          if (!isNaN(result) && isFinite(result)) {
            return result;
          }
        } catch (e) {
          return str;
        }
      }
    }
    
    // Nếu là số thuần túy, loại bỏ dấu chấm phân cách hàng nghìn để lấy đúng số thực tế
    const cleanNum = String(str).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanNum);
    return !isNaN(num) ? num : str;
  };

  // Hàm format tiền tệ có dấu chấm hàng nghìn cho từng đoạn trong biểu thức
  const formatCurrencyInput = (value) => {
    if (value === undefined || value === null || value === '') return '';
    const strVal = String(value);

    if (/[+\-*/]/.test(strVal)) {
      return strVal.replace(/([0-9.]+)/g, (match) => {
        const cleanNum = match.replace(/\./g, '');
        if (!isNaN(cleanNum) && cleanNum !== '') {
          return Number(cleanNum).toLocaleString('vi-VN');
        }
        return match;
      });
    }

    const numberString = strVal.replace(/\D/g, '');
    if (!numberString) return '';

    return Number(numberString).toLocaleString('vi-VN');
  };

  useEffect(() => {
    const isCurrentDateData = lastSavedData && lastSavedData.date === currentDate;

    const formatSavedObj = (obj) => {
      const formatted = {};
      if (obj) {
        Object.keys(obj).forEach(k => {
          if (k === '7. Ghi chú') return;
          if (k === 'Ghi chú') {
            formatted[k] = obj[k] || '';
          } else {
            // Khi load lại dữ liệu cũ trong ngày, nếu lưu số gốc thì format lại chuẩn hiển thị có dấu chấm
            formatted[k] = obj[k] !== '' && obj[k] !== undefined ? Number(obj[k]).toLocaleString('vi-VN') : '';
          }
        });
      }
      return formatted;
    };

    setIncomeValues({
      '1. Chạy show': '',
      '2. Chạy taxi': '',
      '3. Việc ngoài': '',
      '4. Bonus taxi': '',
      '5. Streak': '',
      '6. Tips': '',
      'Ghi chú': '',
      ...(isCurrentDateData && lastSavedData?.incomeDetails ? formatSavedObj(lastSavedData.incomeDetails) : {})
    });

    setExpenseValues({
      '1. Ăn uống': '',
      '2. Đậu sạc': '',
      '3. Đậu gửi': '',
      '4. Rửa': '',
      '5. Phát sinh': '',
      '6. Nhập hàng': '',
      'Ghi chú': '',
      ...(isCurrentDateData && lastSavedData?.expenseDetails ? formatSavedObj(lastSavedData.expenseDetails) : {})
    });
  }, [currentDate, lastSavedData]);

  const handleIncomeChange = (key, value) => {
    if (key === 'Ghi chú') {
      setIncomeValues(prev => ({ ...prev, [key]: value }));
      return;
    }
    const formatted = formatCurrencyInput(value);
    setIncomeValues(prev => ({ ...prev, [key]: formatted }));
  };

  const handleExpenseChange = (key, value) => {
    if (key === 'Ghi chú') {
      setExpenseValues(prev => ({ ...prev, [key]: value }));
      return;
    }
    const formatted = formatCurrencyInput(value);
    setExpenseValues(prev => ({ ...prev, [key]: formatted }));
  };

  const handleBlurField = (key, type) => {
    if (key === 'Ghi chú') return;
    const setter = type === 'income' ? setIncomeValues : setExpenseValues;
    const currentVal = type === 'income' ? incomeValues[key] : expenseValues[key];

    const evaluated = evaluateExpression(currentVal);
    const formatted = typeof evaluated === 'number' ? evaluated.toLocaleString('vi-VN') : evaluated;
    
    setter(prev => ({ ...prev, [key]: formatted }));
  };

  const handleFormSubmit = () => {
    const finalIncomeDetails = {};
    Object.keys(incomeValues).forEach(k => {
      if (k === 'Ghi chú') {
        finalIncomeDetails[k] = incomeValues[k];
      } else {
        const evaluated = evaluateExpression(incomeValues[k]);
        // Lưu thẳng giá trị số nguyên vẹn xuống, không bị cắt xén hay chia nhỏ
        finalIncomeDetails[k] = evaluated !== '' ? Number(evaluated) || 0 : '';
      }
    });

    const finalExpenseDetails = {};
    Object.keys(expenseValues).forEach(k => {
      if (k === 'Ghi chú') {
        finalExpenseDetails[k] = expenseValues[k];
      } else {
        const evaluated = evaluateExpression(expenseValues[k]);
        finalExpenseDetails[k] = evaluated !== '' ? Number(evaluated) || 0 : '';
      }
    });

    const totalIncome = Object.keys(finalIncomeDetails)
      .filter(k => k !== 'Ghi chú')
      .reduce((sum, k) => sum + (parseFloat(finalIncomeDetails[k]) || 0), 0);

    const totalExpense = Object.keys(finalExpenseDetails)
      .filter(k => k !== 'Ghi chú')
      .reduce((sum, k) => sum + (parseFloat(finalExpenseDetails[k]) || 0), 0);

    if (onSave) {
      onSave({
        date: currentDate,
        income: totalIncome,
        expense: totalExpense,
        incomeDetails: finalIncomeDetails,
        expenseDetails: finalExpenseDetails
      });
    }
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h3>Cập nhật tài chính ({currentDate})</h3>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>

        <div className="popup-tabs">
          <button 
            className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
            type="button"
          >
            Thu nhập
          </button>
          <button 
            className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => setActiveTab('expense')}
            type="button"
          >
            Chi phí
          </button>
        </div>

        <div className="popup-body">
          {activeTab === 'income' ? (
            <div className="form-section">
              {Object.keys(incomeValues).map((key) => {
                const isNote = key === 'Ghi chú';
                const oldVal = lastSavedData?.incomeDetails?.[key];
                const placeholderText = (oldVal !== undefined && oldVal !== '') ? (isNote ? oldVal : Number(oldVal).toLocaleString('vi-VN')) : (isNote ? "Nhập ghi chú..." : "0");

                return (
                  <div className="form-group" key={key}>
                    <label>{key}</label>
                    <input 
                      type="text" 
                      value={incomeValues[key]} 
                      placeholder={placeholderText}
                      onChange={(e) => handleIncomeChange(key, e.target.value)}
                      onBlur={() => handleBlurField(key, 'income')}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="form-section">
              {Object.keys(expenseValues).map((key) => {
                const isNote = key === 'Ghi chú';
                const oldVal = lastSavedData?.expenseDetails?.[key];
                const placeholderText = (oldVal !== undefined && oldVal !== '') ? (isNote ? oldVal : Number(oldVal).toLocaleString('vi-VN')) : (isNote ? "Nhập ghi chú..." : "0");

                return (
                  <div className="form-group" key={key}>
                    <label>{key}</label>
                    <input 
                      type="text" 
                      value={expenseValues[key]} 
                      placeholder={placeholderText}
                      onChange={(e) => handleExpenseChange(key, e.target.value)}
                      onBlur={() => handleBlurField(key, 'expense')}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button className="submit-update-btn" onClick={handleFormSubmit} type="button">
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}