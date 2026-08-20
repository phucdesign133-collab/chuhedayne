import React from 'react';
import '../css/Grid.css';

export default function DebtGrid({ rawData = [], onDelete }) {
  const safeData = Array.isArray(rawData) ? rawData : [];

  // Sắp xếp theo ngày nhận mới nhất lên đầu
  const sortedData = [...safeData].sort((a, b) => {
    const dateA = a?.datum || a?.ngayNhan;
    const dateB = b?.datum || b?.ngayNhan;
    if (!dateA || !dateB) return 0;
    const [d1, m1, y1] = dateA.split('/').map(Number);
    const [d2, m2, y2] = dateB.split('/').map(Number);
    return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
  });

  // Tính tổng số tiền gốc và tổng tiền lãi hiện tại
  const totalPrincipal = sortedData.reduce((sum, item) => {
    const amt = item.rawAmount !== undefined ? item.rawAmount : (Number(String(item.amount || item.principal || '0').replace(/\./g, '')) || 0);
    return sum + amt;
  }, 0);

  const totalInterest = sortedData.reduce((sum, item) => {
    const intr = item.rawInterest !== undefined ? item.rawInterest : (Number(String(item.interest || '0').replace(/\./g, '')) || 0);
    return sum + intr;
  }, 0);

  const totalDebtAmount = totalPrincipal + totalInterest;

  // Hàm viết hoa chữ cái đầu (ví dụ: dad -> Dad)
  const capitalizeFirstLetter = (str) => {
    if (!str) return 'Chủ nợ';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn đã trả xong khoản nợ này và muốn xóa nó?")) {
      if (onDelete) onDelete(id);
    }
  };

  return (
    <div className="common-grid-container">
      {/* Thẻ tổng kết thông tin */}
      <div className="grid-card total-debt-card" style={{ background: '#fcfcfc' }}>
        <div className="grid-body" style={{ padding: '4px 0' }}>
          <div className="grid-row" style={{ marginBottom: '6px' }}>
            <span className="label" style={{ fontWeight: 'bold', color: '#333' }}>Tổng khoản vay:</span>
            <span className="value" style={{ fontWeight: 'bold', color: '#333' }}>{sortedData.length}</span>
          </div>
          <div className="grid-row">
            <span className="label" style={{ fontWeight: 'bold', color: '#333' }}>Tổng tiền nợ (Gốc + Lãi):</span>
            <span className="value" style={{ fontWeight: 'bold', color: '#d9534f', fontSize: '16px' }}>
              {totalDebtAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Chưa có khoản vay nào.</div>
      ) : (
        sortedData.map((item, index) => {
          const amountVal = item.rawAmount !== undefined ? item.rawAmount : (Number(String(item.amount || item.principal || '0').replace(/\./g, '')) || 0);
          const interestVal = item.rawInterest !== undefined ? item.rawInterest : (Number(String(item.interest || '0').replace(/\./g, '')) || 0);
          
          const ngayNhanVal = item.datum || item.ngayNhan || '---';
          const dueDateVal = item.dueDate || item.ngayTra || '---';
          const monthsVal = item.months || `${item.soThang || 1} tháng`;
          const creditorName = capitalizeFirstLetter(item.creditor);

          return (
            <div key={item.id || index} className="grid-card">
              <div className="grid-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, paddingBottom: '8px' }}>
                <span className="grid-date" style={{ fontWeight: 'bold', color: '#333' }}>
                  {creditorName}
                </span>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '2px 6px' }}
                  title="Xóa khoản nợ này"
                >
                  🗑️
                </button>
              </div>
              
              <div className="grid-body">
                <div className="grid-row">
                  <span className="label">Số tiền gốc:</span>
                  <span className="value amount">{amountVal.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="grid-row">
                  <span className="label">Ngày nhận:</span>
                  <span className="value">{ngayNhanVal}</span>
                </div>

                <div className="grid-row">
                  <span className="label">Ngày trả (Đến hạn):</span>
                  <span className="value due-date">{dueDateVal}</span>
                </div>

                <div className="grid-row">
                  <span className="label">Lãi ({monthsVal}):</span>
                  <span className="value interest">{interestVal.toLocaleString('vi-VN')} đ</span>
                </div>

                {item.note && (
                  <div className="grid-row note-row" style={{ marginTop: '6px' }}>
                    <span className="label">Ghi chú:</span>
                    <span className="value note-text">{item.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}