// src/components/bills/GiftOrderBill.jsx
import React, { forwardRef } from "react";
import "../../css/GiftOrderBill.css";

const GiftOrderBill = forwardRef(function GiftOrderBill(
  { isOpen, gifts = [], customerInfo = {}, discountPercent = 100, submittedAt = null, onSave, onClose },
  ref,
) {
  if (!isOpen) return null;

  const formatPrice = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0đ";
    }

    return `${number.toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("vi-VN");
  };

  const getExpectedDate = () => {
    const baseDate = submittedAt ? new Date(submittedAt) : new Date();

    if (Number.isNaN(baseDate.getTime())) {
      return "";
    }

    baseDate.setDate(baseDate.getDate() + 7);

    return formatDate(baseDate);
  };

  const totalQuantity = gifts.reduce((total, gift) => total + Number(gift.wonQuantity || 0), 0);

  const totalPrice = gifts.reduce((total, gift) => {
    const quantity = Number(gift.wonQuantity || 0);
    const unitPrice = Number(gift.market_price);

    if (!Number.isFinite(unitPrice)) {
      return total;
    }

    return total + unitPrice * quantity;
  }, 0);

  const safeDiscountPercent = Math.min(100, Math.max(0, Number(discountPercent) || 0));

  const discountAmount = totalPrice * (safeDiscountPercent / 100);

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  return (
    <div className="gift-order-bill-overlay">
      <div ref={ref} className="gift-order-bill" role="dialog" aria-modal="true" aria-label="Đơn hàng đổi quà">
        <div className="gift-order-bill-header">
          <h2 className="gift-order-bill-title">ĐƠN HÀNG ĐỔI QUÀ</h2>
        </div>

        <div className="gift-order-bill-content">
          <div className="gift-order-bill-table">
            <div className="gift-order-bill-table-head">
              <div className="gift-order-bill-col-item">Món</div>

              <div className="gift-order-bill-col-quantity">SL</div>

              <div className="gift-order-bill-col-price">Đơn giá</div>
            </div>

            <div className="gift-order-bill-divider" />

            <div className="gift-order-bill-items">
              {gifts.map((gift) => {
                const quantity = Number(gift.wonQuantity || 0);
                const price = Number(gift.market_price);
                const giftCode = gift.code || gift.gift_code || "";

                return (
                  <div key={gift.id} className="gift-order-bill-item">
                    <div className="gift-order-bill-item-info">
                      <div className="gift-order-bill-item-name">
                        {gift.icon} {gift.text}
                      </div>

                      {giftCode && <div className="gift-order-bill-item-code">(Code: {giftCode})</div>}
                    </div>

                    <div className="gift-order-bill-item-quantity">{quantity}</div>

                    <div className="gift-order-bill-item-price">{formatPrice(price)}</div>
                  </div>
                );
              })}
            </div>

            <div className="gift-order-bill-divider" />
          </div>

          <div className="gift-order-bill-summary">
            <div className="gift-order-bill-summary-row">
              <span>Tổng số lượng:</span>
              <strong>{totalQuantity} món</strong>
            </div>

            <div className="gift-order-bill-summary-row">
              <span>Tổng tiền:</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>
          </div>

          <div className="gift-order-bill-promotion">
            <div className="gift-order-bill-summary-row">
              <span>Ưu đãi:</span>
              <strong>Đổi quà Lucky Spin</strong>
            </div>

            <div className="gift-order-bill-summary-row">
              <span>Giảm:</span>
              <strong>{safeDiscountPercent}%</strong>
            </div>
          </div>

          <div className="gift-order-bill-payment">
            <span>TỔNG THANH TOÁN:</span>
            <strong>{formatPrice(finalTotal)}</strong>
          </div>

          <div className="gift-order-bill-customer">
            <div className="gift-order-bill-section-title">THÔNG TIN NHẬN QUÀ</div>

            <div className="gift-order-bill-customer-row">
              <span>Tên người nhận:</span>
              <strong>{customerInfo.name}</strong>
            </div>

            <div className="gift-order-bill-customer-row">
              <span>Số điện thoại:</span>
              <strong>{customerInfo.phone}</strong>
            </div>

            <div className="gift-order-bill-customer-row">
              <span>Địa chỉ:</span>
              <strong>{customerInfo.address}</strong>
            </div>

            {customerInfo.note?.trim() && (
              <div className="gift-order-bill-customer-row">
                <span>Ghi chú:</span>
                <strong>{customerInfo.note}</strong>
              </div>
            )}
          </div>

          <div className="gift-order-bill-delivery">
            <span>Dự kiến nhận quà:</span>
            <strong>Trước ngày {getExpectedDate()}</strong>
          </div>
        </div>

        <div className="gift-order-bill-footer">
          <button type="button" className="gift-order-bill-btn gift-order-bill-close" onClick={onClose}>
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
});

export default GiftOrderBill;
