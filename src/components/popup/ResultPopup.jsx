// src/components/popup/ResultPopup.jsx
import React, { useState } from "react";
import "../../css/ResultPopup.css";
import "../../css/Popup.css";
import StepLayout from "../StepLayout";
import CustomerInfoForm from "../form/CustomerInfoForm";
import GiftOrderBill from "../bills/GiftOrderBill";
import { supabase } from "../utils/supabaseClient";
import { createBillItemsFromGifts } from "../../datas/spinResult";

export default function ResultPopup({ isOpen, onClose, result, code, onSpinAgain, onOpenGuide, pendingGifts = [] }) {
  const [showStepLayout, setShowStepLayout] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showBill, setShowBill] = useState(false);

  const [selectedGifts, setSelectedGifts] = useState({});

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [isCustomerInfoValid, setIsCustomerInfoValid] = useState(false);

  const [submittedAt, setSubmittedAt] = useState(null);

  if (!isOpen) return null;

  const toggleGift = (giftId) => {
    setSelectedGifts((current) => ({
      ...current,
      [giftId]: !current[giftId],
    }));
  };

  const selectedGiftList = pendingGifts.filter((gift) => selectedGifts[gift.id]);

  const hasSelectedGift = selectedGiftList.length > 0;

  const handleCustomerInfoChange = (event) => {
    const { name, value } = event.target;

    setCustomerInfo((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleNextFromGiftList = () => {
    if (!hasSelectedGift) return;

    setShowCustomerInfo(true);
  };

  const handleBackFromCustomerInfo = () => {
    setShowCustomerInfo(false);
  };

  const handleSubmitRequest = async () => {
    if (!isCustomerInfoValid || !hasSelectedGift) return;

    const submitTime = new Date();

    // ==========================================
    // SNAPSHOT QUÀ + SERIAL ĐỂ LƯU VÀO BILL
    // ==========================================
    const items = createBillItemsFromGifts(selectedGiftList);

    const totalQuantity = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

    const subtotal = items.reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.market_price) || 0), 0);

    const discount = subtotal;
    const totalAmount = 0;

    try {
      const { data: latestBill, error: latestBillError } = await supabase
        .from("bills")
        .select("bill_number")
        .eq("bill_type", "gift-orders")
        .order("bill_number", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (latestBillError) {
        console.error("Lỗi lấy số bill đổi quà:", latestBillError);
        return;
      }

      const billNumber = (latestBill?.bill_number || 0) + 1;

      const { data, error } = await supabase
        .from("bills")
        .insert([
          {
            bill_type: "gift-orders",
            bill_number: billNumber,
            customer_name: customerInfo.name.trim(),
            phone: customerInfo.phone.trim(),
            address: customerInfo.address.trim(),
            note: customerInfo.note.trim(),
            items,
            total_quantity: totalQuantity,
            subtotal,
            discount,
            total_amount: totalAmount,
            source: "system",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Lỗi lưu bill đổi quà:", error);
        return;
      }

      console.log("Đã lưu bill đổi quà:", data);

      setSubmittedAt(submitTime);
      setShowBill(true);
    } catch (error) {
      console.error("Lỗi gửi yêu cầu đổi quà:", error);
    }
  };

  const handleCloseBill = () => {
    setShowBill(false);
    setShowCustomerInfo(false);
    setShowStepLayout(false);
    setSelectedGifts({});
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      note: "",
    });
    setIsCustomerInfoValid(false);
    setSubmittedAt(null);

    onClose();
  };

  if (showStepLayout && showCustomerInfo) {
    return (
      <>
        <StepLayout
          title="Thông Tin Nhận Quà"
          onBack={handleBackFromCustomerInfo}
          footerLabel="GỬI YÊU CẦU"
          footerDisabled={!isCustomerInfoValid}
          onFooterClick={handleSubmitRequest}
        >
          <CustomerInfoForm formData={customerInfo} onChange={handleCustomerInfoChange} onValidityChange={setIsCustomerInfoValid} />
        </StepLayout>

        {showBill && (
          <GiftOrderBill isOpen={showBill} gifts={selectedGiftList} customerInfo={customerInfo} submittedAt={submittedAt} onClose={handleCloseBill} />
        )}
      </>
    );
  }

  if (showStepLayout) {
    return (
      <StepLayout
        title="Đặt Hàng Đổi Quà"
        onBack={() => setShowStepLayout(false)}
        footerLabel="TIẾP THEO"
        footerDisabled={!hasSelectedGift}
        onFooterClick={handleNextFromGiftList}
      >
        <div className="result-popup-order">
          <div className="result-popup-order-head">
            <div>Món</div>
            <div>SL</div>
            <div>Đơn giá</div>
          </div>

          <div className="result-popup-order-list">
            {pendingGifts.map((gift) => {
              const isChecked = !!selectedGifts[gift.id];

              const quantity = gift.wonQuantity || 0;

              return (
                <div key={gift.id} className={`result-popup-gift-row ${isChecked ? "result-popup-gift-row-selected" : ""}`}>
                  <div className="result-popup-gift-main">
                    <input type="checkbox" checked={isChecked} onChange={() => toggleGift(gift.id)} />

                    <button type="button" className="result-popup-gift-info" onClick={() => toggleGift(gift.id)}>
                      <div className="result-popup-gift-name">
                        {gift.icon} {gift.text}
                      </div>

                      <div className="result-popup-gift-code">
                        {Array.isArray(gift.wonCodes) ? gift.wonCodes.join(", ") : gift.code || gift.gift_code || ""}
                      </div>
                    </button>
                  </div>

                  <div className="result-popup-gift-quantity">{quantity}</div>

                  <div className="result-popup-gift-price">
                    {Number.isFinite(Number(gift.market_price)) ? `${Number(gift.market_price).toLocaleString("vi-VN")}đ` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </StepLayout>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-wrapper result-popup-wrapper">
        <div className="popup-header">
          <h3 className="popup-title result-popup-title">🎁 Chúc mừng bé đã trúng:</h3>

          <button type="button" className="popup-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="popup-body result-popup-body">
          <div className="result-popup-name">
            {result?.icon} {result?.text}
          </div>

          <div className="result-popup-code">
            <strong>Mã: {code}</strong>
          </div>

          <div className="popup-footer result-popup-footer">
            <div className="popup-inline result-popup-actions">
              <button type="button" className="popup-submit result-popup-action-btn result-popup-primary" onClick={() => setShowStepLayout(true)}>
                Đổi Quà Ngay
              </button>

              <button type="button" className="popup-submit result-popup-action-btn result-popup-secondary" onClick={onSpinAgain}>
                Quay tiếp
              </button>
            </div>

            {/* <div className="result-popup-guide">
              <div className="popup-label result-popup-guide-text">Bạn chưa biết cách đổi quà?</div>

              <button type="button" className="result-popup-guide-btn" onClick={onOpenGuide}>
                Xem hướng dẫn
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
