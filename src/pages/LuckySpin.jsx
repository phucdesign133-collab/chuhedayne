// src/components/LuckySpinParty.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPrizesFromCloud, generateCurrentRound } from "../datas/spinEngine";
import ResultPopup from "../components/popup/ResultPopup";
import ListGiftPopup from "../components/popup/ListGiftPopup";
import "../css/LuckySpin.css";

const ZALO_PHONE_ADMIN = "0799910603";

export default function LuckySpinParty() {
  const navigate = useNavigate();
  const [showListPopup, setShowListPopup] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [babyBirthday, setBabyBirthday] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPopup, setShowPopup] = useState(false);
  const [isGiftImageOpen, setIsGiftImageOpen] = useState(false);
  const [currentGiftImage, setCurrentGiftImage] = useState(null);

  const canvasRef = useRef(null);
  const angleRef = useRef(0);

// ==========================================
// QUẢN LÝ KHO QUÀ, ROUND & 60S AUTO-RESET
// ==========================================
  const [allPrizes, setAllPrizes] = useState([]);
  const [basicRound, setBasicRound] = useState([]);
  const [vipRound, setVipRound] = useState([]);
  const [lastRoundTime, setLastRoundTime] = useState(Date.now());

  useEffect(() => {
    async function initData() {
      const prizes = await fetchPrizesFromCloud();
      setAllPrizes(prizes);
      setBasicRound(generateCurrentRound(prizes, "basic"));
      setVipRound(generateCurrentRound(prizes, "vip"));
    }
    initData();
  }, []);

  const refreshRounds = useCallback((prizesData) => {
    const dataToUse = prizesData.length > 0 ? prizesData : allPrizes;
    if (dataToUse.length > 0) {
      setBasicRound(generateCurrentRound(dataToUse, "basic"));
      setVipRound(generateCurrentRound(dataToUse, "vip"));
      setLastRoundTime(Date.now());
    }
  }, [allPrizes]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRoundTime >= 15000) {
        refreshRounds(allPrizes);
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastRoundTime >= 15000) {
          refreshRounds(allPrizes);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lastRoundTime, allPrizes, refreshRounds]);
// ==========================================

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showPopup ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPopup]);

  const isMobile = windowWidth < 850;
  const canvasSize = windowWidth < 500 ? 300 : 440;

  const isPremiumMode =
    babyName.trim().length > 0 && babyBirthday.trim().length > 0;

  // Sử dụng dữ liệu vòng quay động tương ứng
  const currentPrizes = isPremiumMode 
    ? (vipRound.length > 0 ? vipRound : []) 
    : (basicRound.length > 0 ? basicRound : []);

  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;

    if (!canvas || currentPrizes.length === 0) return;

    const ctx = canvas.getContext("2d");
    const size = canvasSize;
    const center = size / 2;
    const radius = center - 8;
    const arc = (Math.PI * 2) / currentPrizes.length;

    ctx.clearRect(0, 0, size, size);

    currentPrizes.forEach((prize, index) => {
      const angle = currentAngle + index * arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();

      ctx.fillStyle = index % 2 === 0 ? "#f21d1d" : "#292828";
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();

      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);

      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = 'bold 12px "Quicksand", sans-serif';

      ctx.fillText(prize.text, radius - 20, 0);

      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, Math.PI * 2);

    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("🎁", center, center + 2);
  };

  useEffect(() => {
    if (currentPrizes.length > 0) {
      drawWheel(angleRef.current);
    }
  }, [canvasSize, isPremiumMode, currentPrizes]);

  const calculateFinalPrize = () => {
    if (currentPrizes.length === 0) return;
    const degrees = angleRef.current * (180 / Math.PI) + 90;
    const arc = 360 / currentPrizes.length;

    const index =
      Math.floor((360 - (degrees % 360)) / arc) % currentPrizes.length;

    setPrizeResult(currentPrizes[index]);

    const code = `${
      isPremiumMode ? "VIP" : "NORMAL"
    }-${Math.floor(1000 + Math.random() * 9000)}`;

    setGeneratedCode(code);
  };

  const spinTheWheel = () => {
    if (isSpinning || currentPrizes.length === 0) return;

    setIsSpinning(true);
    setPrizeResult(null);
    setGeneratedCode("");

    const spinAngleStart = Math.random() * 15 + 20;
    const spinTimeTotal = 7000;

    let spinTime = 0;

    const easeOut = (t, b, c, d) =>
      c * ((t = t / d - 1) * t * t + 1) + b;

    const animate = () => {
      spinTime += 20;

      if (spinTime >= spinTimeTotal) {
        setIsSpinning(false);
        calculateFinalPrize();
        setShowPopup(true);
        return;
      }

      const delta =
        spinAngleStart -
        easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);

      angleRef.current += (delta * Math.PI) / 180;

      drawWheel(angleRef.current);

      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleOpenGiftImage = (imageName) => {
    setCurrentGiftImage(imageName);
    setIsGiftImageOpen(true);
  };

// ==========================================
// PHẦN TRƯỚC RETURN: TRUYỀN DỮ LIỆU ĐỒNG BỘ VÀO POPUP DANH SÁCH
// ==========================================

  return (
    <div
      className={`party-container ${
        isPremiumMode ? "party-container-premium" : ""
      }`}
      style={{
        padding: isMobile ? "30px" : "30px",
      }}
    >
      <div className="header-area">
        <h1
          className={`party-title ${
            isPremiumMode ? "party-title-premium" : ""
          } ${isMobile ? "party-title-mobile" : ""}`}
        >
          {isPremiumMode
            ? "💎 VÒNG QUAY VIP 💎"
            : "🎉 VÒNG QUAY MAY MẮN 🎉"}
        </h1>

        <p className="party-subtitle">
          {isPremiumMode
            ? "Chào mừng bạn đến với Vòng quay VIP của Phúc"
            : "Chào mừng bạn đến với Vòng quay Basic của Phúc."}
        </p>
      </div>

      <div
        className={`main-layout ${
          isMobile ? "main-layout-mobile" : "main-layout-desktop"
        }`}
      >
        <div
          className={`wheel-wrapper ${
            isPremiumMode ? "wheel-wrapper-premium" : ""
          }`}
          onClick={() => setShowListPopup(true)}
          title="Nhấp để xem danh sách quà"
        >
          <div
            className={`pointer ${
              isPremiumMode ? "pointer-premium" : ""
            } ${isMobile ? "pointer-mobile" : "pointer-desktop"}`}
          ></div>

          <div className="wheel-container">
            <div
              className={`wheel-lights-container ${
                isSpinning ? "spinning" : ""
              }`}
            >
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="light-dot"
                  style={{
                    transform: `rotate(${i * 18}deg) translateY(-${
                      canvasSize / 2
                    }px)`,
                  }}
                ></div>
              ))}
            </div>

            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="canvas-style"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              spinTheWheel();
            }}
            disabled={isSpinning}
            className={`spin-button ${
              isSpinning ? "spin-button-disabled" : ""
            } ${isMobile ? "spin-button-mobile" : "spin-button-desktop"}`}
          >
            {isSpinning
              ? "🌟 ĐANG XOAY..."
              : isPremiumMode
              ? "🔥 QUAY VÒNG VIP 🔥"
              : "QUAY THỬ QUÀ NHỎ"}
          </button>
        </div>

        <div
          className={`form-wrapper ${
            isMobile ? "form-wrapper-mobile" : ""
          }`}
        >
          <h3
            className={`form-title ${
              isPremiumMode ? "form-title-premium" : ""
            }`}
          >
            {isPremiumMode
              ? "✨ Vòng Quay VIP Sẵn Sàng ✨"
              : "🔒 Nhập Thông Tin Để Mở Vòng Quay VIP"}
          </h3>

        <div className="input-group">
          <input
            type="text"
            placeholder="Nhập tên bé..."
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <input
            type="date"
            value={babyBirthday}
            onChange={(e) => setBabyBirthday(e.target.value)}
            required
            className="input-field input-date"
          />
        </div>
      </div>
    </div>

      <ListGiftPopup
        isOpen={showListPopup}
        onClose={() => setShowListPopup(false)}
        basicPrizes={basicRound}
        vipPrizes={vipRound}
      />

      <ResultPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        result={prizeResult}
        babyName={babyName}
        code={generatedCode}
        onSendZalo={() =>
          window.open(
            `https://zalo.me/${ZALO_PHONE_ADMIN}?text=Mã:${generatedCode}`
          )
        }
        onSendWhatsapp={() =>
          window.open(
            `https://wa.me/${ZALO_PHONE_ADMIN}?text=Mã:${generatedCode}`
          )
        }
        onSpinAgain={() => {
          setShowPopup(false);
          spinTheWheel();
        }}
        onOpenImage={handleOpenGiftImage}
      />

      {isGiftImageOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsGiftImageOpen(false)}
        >
          <div className="lightbox-content">
            <img
              src={`${import.meta.env.BASE_URL}img/${currentGiftImage}`}
              alt="Gift Preview"
            />

            <p className="lightbox-text">
              Chạm bất kỳ vị trí nào để đóng...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}