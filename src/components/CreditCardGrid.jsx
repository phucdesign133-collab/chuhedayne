import React from 'react';
import "../css/Grid.css";
import { getCurrentDateFormatted } from './utils/utils';
import { EditIcon, TrashIcon } from './Icons';

export default function CreditCardGrid({ selectedCard, rawData, onEdit, onDelete }) {
  const currentDate = getCurrentDateFormatted(); // Trả về định dạng dd/mm/yyyy
  
  const cardNames = {
    techcombank: 'Techcombank',
    vib: 'VIB',
    tpbank: 'TPBank',
    vpbank: 'VPBank',
    seasy: 'Seasy',
    slater: 'Slater'
  };

  // Hàm xử lý khi bấm nút Sửa
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(selectedCard, rawData);
    }
  };

  // Hàm xử lý khi bấm nút Xóa (có alert xác nhận)
  const handleDeleteClick = () => {
    const cardName = cardNames[selectedCard] || selectedCard;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa dữ liệu của thẻ ${cardName} không?`);
    if (confirmDelete && onDelete) {
      onDelete(selectedCard);
    }
  };

  if (!rawData) {
    return (
      <div className="grid-no-data" style={{ padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '12px', marginTop: '10px' }}>
        Chưa có dữ liệu cho thẻ {cardNames[selectedCard] || selectedCard}. Bấm "Cập nhật" để thêm mới.
      </div>
    );
  }

  return (
    <div className="grid-container">
      <div className="grid-card-box">
        <div className="grid-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="grid-date">{currentDate}</span>
          
          <div className="grid-actions" style={{ display: "flex", gap: "8px" }}>
            {/* Nút Sửa: Mở popup chỉnh sửa */}
            <button 
              type="button"
              onClick={handleEditClick} 
              title="Chỉnh sửa thông tin"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#3182ce", fontSize: "14px" }}
            >
              <EditIcon />
            </button>

            {/* Nút Xóa: Bật alert xác nhận */}
            <button 
              type="button"
              onClick={handleDeleteClick} 
              title="Xóa dữ liệu thẻ"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#e53e3e", fontSize: "14px" }}
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <div className="grid-content-list">
          <div className="info-row">
            <span className="info-label">Hạn mức thẻ:</span>
            <span className="info-value">{Number(rawData.limit || 0).toLocaleString('vi-VN')} đ</span>
          </div>

          <div className="info-row">
            <span className="info-label">Khả dụng thực tế:</span>
            <span className="info-value" style={{ color: "#38a169", fontWeight: "600" }}>
              {Number(rawData.available || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Dư nợ:</span>
            <span className="info-value" style={{ color: "#e53e3e", fontWeight: "600" }}>
              {Number(rawData.debt || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Sao kê tháng hiện tại:</span>
            <span className="info-value">{Number(rawData.statement || 0).toLocaleString('vi-VN')} đ</span>
          </div>

          <div className="info-row">
            <span className="info-label">Trạng thái sao kê:</span>
            <span className={`info-value ${rawData.statementStatus === "XONG" ? "text-green" : "text-red"}`}>
              {rawData.statementStatus || "Chưa xong"}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Phí đáo:</span>
            <span className="info-value">{Number(rawData.fee || 0).toLocaleString('vi-VN')} đ</span>
          </div>

          {rawData.statement > 0 && (
            <div className="info-row">
              <span className="info-label">Số ngày còn lại:</span>
              <span className="info-value text-orange">{rawData.daysLeft} ngày</span>
            </div>
          )}

          <div className="info-row">
            <span className="info-label">Số rút:</span>
            <span className="info-value" style={{ color: "#3182ce", fontWeight: "600" }}>
              {Number(rawData.withdrawal || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Phí rút:</span>
            <span className="info-value text-red">{Number(rawData.withdrawalFee || 0).toLocaleString('vi-VN')} đ</span>
          </div>

          {rawData.installment > 0 && (
            <div className="info-row">
              <span className="info-label">Trả góp:</span>
              <span className="info-value">{Number(rawData.installment).toLocaleString('vi-VN')} đ</span>
            </div>
          )}

          {rawData.note && (
            <div className="info-row note-row">
              <span className="info-label italic">Ghi chú:</span>
              <span className="info-value italic text-gray">{rawData.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}