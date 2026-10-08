// src/components/VipAccessPanel.jsx
import React, { useState } from "react";

const VIP_CAMPAIGNS = [
  // ==========================================================
  // VIP CAMPAIGNS
  // CẬP NHẬT TẠI ĐÂY KHI TẠO / TẮT / HẾT HẠN CAMPAIGN
  //
  // - code: mã khách nhập để mở Vòng Quay VIP
  // - startDate: ngày bắt đầu campaign
  // - endDate: ngày kết thúc campaign
  // - dailySlots: số lượt quay VIP mỗi ngày
  // - enabled: bật / tắt campaign
  //
  // 🔴 HẾT CAMPAIGN: đổi enabled thành false hoặc comment block.
  // 🟢 CAMPAIGN MỚI: clone block, đổi code + ngày + số lượt.
  // ⚠️ CODE VIP KHÔNG dùng CHDN- vì CHDN- là mã quà.
  //
  // dailySlots ở đây chỉ là cấu hình campaign.
  // Slot thật nằm trên DB/server.
  // ==========================================================
  {
    code: "SUMMER-1q2w3e",
    startDate: "2026-10-01",
    endDate: "2026-10-29",
    dailySlots: 100,
    enabled: true,
  },
];

export default function VipAccessPanel({ isVipUnlocked = false, onVipUnlocked, onVipLocked, onOpenGiftList, onOpenPendingGifts }) {
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [vipCode, setVipCode] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  const handleOpenCodePopup = () => {
    setVipCode("");
    setCodeMessage("");
    setShowCodePopup(true);
  };

  const handleCloseCodePopup = () => {
    setShowCodePopup(false);
    setVipCode("");
    setCodeMessage("");
  };

  const handleSubmitCode = () => {
    const enteredCode = vipCode.trim();

    if (!enteredCode) {
      setCodeMessage("Vui lòng nhập mã code.");
      return;
    }

    const campaign = VIP_CAMPAIGNS.find((item) => item.code.toLowerCase() === enteredCode.toLowerCase());

    if (!campaign) {
      setCodeMessage("Mã VIP không hợp lệ.");
      return;
    }

    if (!campaign.enabled) {
      setCodeMessage("Mã VIP hiện không khả dụng.");
      return;
    }

    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(`${campaign.startDate}T00:00:00`);
    const endDate = new Date(`${campaign.endDate}T23:59:59`);

    if (currentDate < startDate) {
      setCodeMessage("Mã VIP chưa được kích hoạt.");
      return;
    }

    if (currentDate > endDate) {
      setCodeMessage("Mã VIP đã hết hạn.");
      return;
    }

    setCodeMessage("Đã mở Vòng Quay VIP.");

    if (onVipUnlocked) {
      onVipUnlocked(campaign);
    }

    setTimeout(() => {
      setShowCodePopup(false);
      setVipCode("");
      setCodeMessage("");
    }, 700);
  };

  const handleVipToggle = () => {
    if (isVipUnlocked) {
      if (onVipLocked) {
        onVipLocked();
      }
      return;
    }

    handleOpenCodePopup();
  };

  return (
    <>
      <div
        style={{
          width: "90%",
          maxWidth: "440px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={onOpenGiftList}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#fff",
            color: "#292828",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🎁 Xem danh sách quà
        </button>

        <button
          type="button"
          onClick={onOpenPendingGifts}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#fff",
            color: "#292828",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🎟️ Xem quà quay trúng
        </button>

        <button
          type="button"
          onClick={handleVipToggle}
          style={{
            width: "100%",
            padding: "13px 16px",
            border: "none",
            borderRadius: "12px",
            background: isVipUnlocked ? "#f0b400" : "#292828",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {isVipUnlocked ? "💎 Trở lại vòng thường" : "💎 Bật Vòng Quay VIP"}
        </button>
      </div>

      {showCodePopup && (
        <div
          onClick={handleCloseCodePopup}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxSizing: "border-box",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#292828",
                }}
              >
                💎 Mở Vòng Quay VIP
              </h3>

              <button
                type="button"
                onClick={handleCloseCodePopup}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "26px",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#777",
                }}
              >
                ×
              </button>
            </div>

            <input
              type="text"
              value={vipCode}
              onChange={(e) => {
                setVipCode(e.target.value);
                setCodeMessage("");
              }}
              placeholder="Nhập mã code để mở"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                outline: "none",
                fontSize: "15px",
              }}
            />

            {codeMessage && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: codeMessage === "Đã mở Vòng Quay VIP." ? "#198754" : "#d63031",
                }}
              >
                {codeMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitCode}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "13px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#292828",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              MỞ VÒNG VIP
            </button>
          </div>
        </div>
      )}
    </>
  );
}
