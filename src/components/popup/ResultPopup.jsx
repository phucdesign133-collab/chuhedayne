import React from "react";
import "../../css/ResultPopup.css"; // Có css rời

export default function ResultPopup({ isOpen, onClose, result, babyName, code, onSendZalo, onSendWhatsapp, onSpinAgain, onOpenImage }) {
  if (!isOpen) return null;
// Hàm này giúp viết hoa chữ cái đầu tiên
const capitalizeName = (name) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};
  return (
    <div className="popup-backdrop">
      <div className="popup-container">
        <button className="close-icon" onClick={onClose}>&times;</button>

        <h3 className="popup-title">Chúc Mừng {capitalizeName(babyName)} Quay Trúng</h3>
        <div className="prize-display">{result?.icon} {result?.text}</div>
        <div className="code-badge">Mã: {code}</div>
        
        {/* Nút xem hình ảnh quà full chiều ngang */}
        <button className="view-img-btn" onClick={() => onOpenImage(result.image)}>
          Xem hình ảnh quà
        </button>

        <div className="instructions">
          <p><strong>Điều kiện sử dụng:</strong></p>
          <p>- Đối với Voucher: chỉ có hiệu lực khi được xác minh và đặt bởi Zalo chính chủ của Phụ huynh vào buổi tiệc tiếp theo.</p>
          <p>- Đối với các quà khác: có thể đổi ngay qua tin nhắn theo hướng dẫn bên dưới:</p>
        </div>
        <div className="instructions">
          <p><strong>Hướng dẫn đổi quà:</strong></p>
          <p>- Chụp màn hình hiện tại và gửi tin nhắn Zalo/WhatsApp để đổi quà.</p>
          <p>*Lưu ý: mỗi tài khoản chỉ đổi được một phần quà duy nhất, áp dụng cho đến khi Bạn sử dụng dịch vụ lần tiếp theo.</p>
          <p>- Bạn cũng có thể quay thêm lần nữa để có cơ hội nhận quà giá trị hơn.</p>
        </div>

        <div className="button-group">
          <div className="contact-row">
            <button className="zalo-btn" onClick={onSendZalo}>Gửi Zalo</button>
            <button className="wa-btn" onClick={onSendWhatsapp}>Gửi WhatsApp</button>
          </div>
          <button className="retry-btn" onClick={onSpinAgain}>Quay thêm lần nữa</button>
        </div>
      </div>
    </div>
  );
}