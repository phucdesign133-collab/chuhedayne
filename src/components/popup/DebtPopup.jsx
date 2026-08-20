import React, { useState, useEffect } from 'react';
import '../../css/Popup.css';
import { supabase } from '../utils/supabaseClient'; // Kết nối Supabase cốt lõi

export default function DebtPopup({ isOpen, onClose, onAddDebt }) {
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [datum, setDatum] = useState(''); 
  const [dueDate, setDueDate] = useState(''); 
  const [note, setNote] = useState('');

  const [calculatedMonths, setCalculatedMonths] = useState(1);
  const [calculatedInterest, setCalculatedInterest] = useState(0);
  const [loading, setLoading] = useState(false);

  // Xử lý nhập số tiền tự động thêm dấu chấm phân cách hàng nghìn
  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // Chỉ giữ lại số
    if (!rawVal) {
      setAmount('');
      return;
    }
    const formatted = Number(rawVal).toLocaleString('vi-VN');
    setAmount(formatted);
  };

  // Hàm tự động thêm dấu / cho ngày tháng (DD/MM/YYYY)
  const handleDateChange = (value, setter) => {
    let cleaned = value.replace(/\D/g, '').slice(0, 8); // Chỉ lấy tối đa 8 số
    let formatted = cleaned;

    if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }

    setter(formatted);
  };
 
  useEffect(() => {
    if (!datum) {
      setCalculatedMonths(1);
      setCalculatedInterest(0);
      return;
    }

    const parts = datum.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const nhậnDate = new Date(year, month, day);
      const now = new Date();

      if (!isNaN(nhậnDate.getTime())) {
        const diffYears = now.getFullYear() - nhậnDate.getFullYear();
        const diffMonths = now.getMonth() - nhậnDate.getMonth();
        let totalMonths = diffYears * 12 + diffMonths + 1;
        if (totalMonths < 1) totalMonths = 1;

        setCalculatedMonths(totalMonths);

        const rawAmt = parseFloat(amount.replace(/\./g, '')) || 0;
        const interestVal = rawAmt * 0.02 * totalMonths;
        setCalculatedInterest(Math.round(interestVal));
      }
    }
  }, [datum, amount]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !datum || loading) return;

    setLoading(true);
    const rawAmt = parseFloat(amount.replace(/\./g, '')) || 0;
    const finalCreditor = creditor || 'Dad';

    const newDebtItem = {
      id: Date.now(),
      creditor: finalCreditor,
      datum: datum,
      rawAmount: rawAmt,
      amount: rawAmt.toLocaleString('vi-VN'),
      months: `${calculatedMonths} tháng`,
      rawInterest: calculatedInterest,
      interest: calculatedInterest.toLocaleString('vi-VN'),
      dueDate: dueDate,
      note: note
    };

    try {
      // 1. Tải dữ liệu hiện tại từ bảng 'debts' trên Supabase (hoặc bảng chung của app)
      const { data: remoteRows, error: fetchError } = await supabase
        .from('app_data') // Hoặc tên bảng tùy theo cấu hình chuẩn của anh
        .select('*')
        .eq('key', 'total_debts')
        .single();

      let currentList = [];
      if (remoteRows && remoteRows.value) {
        currentList = Array.isArray(remoteRows.value) ? remoteRows.value : [];
      }

      // Thêm khoản nợ mới lên đầu danh sách
      const updatedList = [newDebtItem, ...currentList];

      // 2. Đẩy ngược lại lên Supabase
      const { error: upsertError } = await supabase
        .from('app_data')
        .upsert({ key: 'total_debts', value: updatedList });

      if (upsertError) {
        console.error("Lỗi đồng bộ Supabase:", upsertError.message);
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
    } finally {
      setLoading(false);
    }

    // 3. Gọi callback cập nhật state giao diện cha
    onAddDebt(finalCreditor, newDebtItem);

    // Reset form
    setCreditor('');
    setAmount('');
    setDatum('');
    setDueDate('');
    setNote('');
    onClose();
  };

  return (
    <div className="debt-popup-overlay">
      <div className="debt-popup-container">
        <div className="debt-popup-header">
          <h3 className="debt-popup-title">Cập nhật khoản vay</h3>
          <button type="button" className="debt-popup-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="debt-popup-form">
          <div className="debt-popup-field">
            <label>1. Chủ nợ</label>
            <input 
              type="text" 
              autoComplete="off"
              name="creditor_input"
              placeholder="Nhập tên chủ nợ" 
              value={creditor} 
              onChange={(e) => setCreditor(e.target.value)} 
              required 
            />
          </div>

          <div className="debt-popup-field">
            <label>2. Số tiền gốc</label>
            <input 
              type="text" 
              autoComplete="off"
              name="amount_input"
              placeholder="Nhập số tiền..." 
              value={amount} 
              onChange={handleAmountChange} 
              required 
            />
          </div>

          <div className="debt-popup-field">
            <label>3. Ngày nhận</label>
            <input 
              type="text" 
              autoComplete="off"
              name="datum_input"
              placeholder="VD: 08/05/2026" 
              value={datum} 
              onChange={(e) => handleDateChange(e.target.value, setDatum)} 
              required 
            />
          </div>

          <div className="debt-popup-field">
            <label>4. Đến hạn</label>
            <input 
              type="text" 
              autoComplete="off"
              name="duedate_input"
              placeholder="VD: 08/11/2026" 
              value={dueDate} 
              onChange={(e) => handleDateChange(e.target.value, setDueDate)} 
            />
          </div>

          <div className="debt-popup-field">
            <label>5. Lãi : <span className="highlight-val">{calculatedInterest.toLocaleString('vi-VN')} đ</span></label>
          </div>

          <div className="debt-popup-field">
            <label>6. Số tháng tính lãi: <span className="highlight-val">{calculatedMonths} tháng</span></label>
          </div>

          <div className="debt-popup-field">
            <label>7. Ghi chú</label>
            <input  
              type="text" 
              autoComplete="off"
              name="note_input"
              placeholder="Nhập ghi chú (nếu có)..." 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
            />
          </div>

          <button type="submit" className="debt-popup-submit-btn" disabled={loading}>
            {loading ? 'Đang đồng bộ...' : 'Cập nhật'}
          </button>
        </form>
      </div>
    </div>
  );
}