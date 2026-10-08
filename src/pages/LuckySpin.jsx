// src/components/LuckySpinParty.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../components/utils/supabaseClient";
import { fetchPrizesFromCloud, generateCurrentRound } from "../datas/spinEngine";
import { createSpinResult, addPendingGift, consumeVipSlot } from "../datas/spinResult";
import ResultPopup from "../components/popup/ResultPopup";
import ListGiftPopup from "../components/popup/ListGiftPopup";
import VipAccessPanel from "../components/VipAccessPanel";
import "../css/LuckySpin.css";

const ZALO_PHONE_ADMIN = "0799910603";
const VIP_EVENT_DURATION = 8000;

function VipRealtimeNotification({ campaignCode, onVipLocked }) {
  const [activeNotification, setActiveNotification] = useState(null);
  const [notificationPreview, setNotificationPreview] = useState([]);

  const queueRef = useRef([]);
  const seenEventIdsRef = useRef(new Set());
  const isProcessingQueueRef = useRef(false);
  const notificationTimerRef = useRef(null);
  const onVipLockedRef = useRef(onVipLocked);
  const processQueueRef = useRef(null);

  useEffect(() => {
    onVipLockedRef.current = onVipLocked;
  }, [onVipLocked]);

  const updatePreview = useCallback(() => {
    setNotificationPreview(queueRef.current.slice(0, 2));
  }, []);

  const processQueue = () => {
    if (isProcessingQueueRef.current) {
      return;
    }

    const nextEvent = queueRef.current.shift();

    if (!nextEvent) {
      updatePreview();
      return;
    }

    updatePreview();

    isProcessingQueueRef.current = true;
    setActiveNotification(nextEvent);

    notificationTimerRef.current = setTimeout(() => {
      setActiveNotification(null);
      isProcessingQueueRef.current = false;
      notificationTimerRef.current = null;

      if (nextEvent.event_type === "remaining" && Number(nextEvent.remaining_slots) === 0) {
        if (onVipLockedRef.current) {
          onVipLockedRef.current();
        }

        queueRef.current = [];
        updatePreview();
        return;
      }

      processQueueRef.current?.();
    }, VIP_EVENT_DURATION);
  };

  processQueueRef.current = processQueue;

  useEffect(() => {
    if (!campaignCode) {
      return undefined;
    }

    const currentCampaignCode = campaignCode;

    const enqueueEvent = (event) => {
      if (!event?.id) {
        return;
      }

      if (event.campaign_code !== currentCampaignCode) {
        return;
      }

      if (seenEventIdsRef.current.has(event.id)) {
        return;
      }

      seenEventIdsRef.current.add(event.id);

      queueRef.current = [...queueRef.current, event].sort((a, b) => Number(a.id) - Number(b.id));

      updatePreview();
      processQueueRef.current?.();
    };

    const channel = supabase
      .channel(`vip-events:${currentCampaignCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vip_events",
          filter: `campaign_code=eq.${currentCampaignCode}`,
        },
        (payload) => {
          enqueueEvent(payload?.new);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Không thể kết nối VIP Realtime.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignCode, updatePreview]);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }

      queueRef.current = [];
      seenEventIdsRef.current = new Set();
      isProcessingQueueRef.current = false;
    };
  }, []);

  const renderNotificationText = (notification) => {
    if (!notification) {
      return "";
    }

    if (notification.event_type === "gift") {
      return `🎉 Có người vừa trúng ${notification.prize_text || "một phần quà"}!`;
    }

    if (notification.event_type === "remaining") {
      const remaining = Number(notification.remaining_slots) || 0;

      if (remaining === 0) {
        return "🔔 Vòng Quay VIP đã hết lượt hôm nay.";
      }

      return `💎 Vòng Quay VIP còn ${remaining} lượt.`;
    }

    return "";
  };

  if (!activeNotification) {
    return null;
  }

  const stackedNotifications = [activeNotification, ...notificationPreview].slice(0, 3);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "24px",
        transform: "translateX(-50%)",
        zIndex: 10000,
        width: "min(420px, calc(100vw - 32px))",
        height: `${stackedNotifications.length * 52}px`,
        pointerEvents: "none",
      }}
    >
      {stackedNotifications.map((notification, index) => {
        const isActive = index === 0;

        return (
          <div
            key={`${notification.id}-${index}`}
            style={{
              position: "absolute",
              left: "0",
              top: `${index * 16}px`,
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 18px",
              borderRadius: "14px",
              background: "#fff",
              color: "#333",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: "700",
              boxShadow: isActive ? "0 12px 40px rgba(0,0,0,0.28)" : "0 8px 24px rgba(0,0,0,0.16)",
              transform: `scale(${isActive ? 1 : index === 1 ? 0.95 : 0.9})`,
              transformOrigin: "top center",
              opacity: isActive ? 1 : index === 1 ? 0.55 : 0.3,
              zIndex: 10 - index,
              transition: "top 500ms ease, transform 500ms ease, opacity 500ms ease, box-shadow 500ms ease",
            }}
          >
            {renderNotificationText(notification)}
          </div>
        );
      })}
    </div>
  );
}

export default function LuckySpinParty() {
  const navigate = useNavigate();
  const [showListPopup, setShowListPopup] = useState(false);
  const [listPopupTab, setListPopupTab] = useState("basic");
  const [isVipUnlocked, setIsVipUnlocked] = useState(false);
  const [activeVipCampaign, setActiveVipCampaign] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPopup, setShowPopup] = useState(false);
  const [isGiftImageOpen, setIsGiftImageOpen] = useState(false);
  const [currentGiftImage, setCurrentGiftImage] = useState(null);

  const [pendingGifts, setPendingGifts] = useState([]);

  const canvasRef = useRef(null);
  const angleRef = useRef(0);

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

  const refreshRounds = useCallback(
    (prizesData) => {
      const dataToUse = prizesData.length > 0 ? prizesData : allPrizes;

      if (dataToUse.length > 0) {
        setBasicRound(generateCurrentRound(dataToUse, "basic"));
        setVipRound(generateCurrentRound(dataToUse, "vip"));
        setLastRoundTime(Date.now());
      }
    },
    [allPrizes],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (now - lastRoundTime >= 20000) {
        refreshRounds(allPrizes);
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();

        if (now - lastRoundTime >= 20000) {
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

  const isPremiumMode = isVipUnlocked;

  const currentPrizes = isPremiumMode ? (vipRound.length > 0 ? vipRound : []) : basicRound.length > 0 ? basicRound : [];

  const handleOpenGiftList = () => {
    setListPopupTab("basic");
    setShowListPopup(true);
  };

  const handleOpenPendingGifts = () => {
    setListPopupTab("pending");
    setShowListPopup(true);
  };

  const handleVipUnlocked = (campaign) => {
    setActiveVipCampaign(campaign);
    setIsVipUnlocked(true);
  };

  const handleVipLocked = useCallback(() => {
    setIsVipUnlocked(false);
    setActiveVipCampaign(null);
  }, []);

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

  const calculateFinalPrize = async () => {
    if (currentPrizes.length === 0) return null;

    const degrees = angleRef.current * (180 / Math.PI) + 90;
    const arc = 360 / currentPrizes.length;

    const index = Math.floor((360 - (degrees % 360)) / arc) % currentPrizes.length;

    const selectedPrize = currentPrizes[index];

    if (isPremiumMode) {
      if (!activeVipCampaign) {
        throw new Error("Không tìm thấy campaign VIP đang hoạt động.");
      }

      const slotResult = await consumeVipSlot(activeVipCampaign.code, activeVipCampaign.dailySlots, selectedPrize?.text || "");

      if (!slotResult.success) {
        handleVipLocked();
        setPrizeResult(null);
        setGeneratedCode("");
        return null;
      }
    }

    const spinResult = await createSpinResult(selectedPrize, pendingGifts);

    setPrizeResult(spinResult.prize);
    setGeneratedCode(spinResult.code);

    setPendingGifts((currentGifts) => addPendingGift(currentGifts, spinResult));

    return spinResult;
  };

  const spinTheWheel = () => {
    if (isSpinning || currentPrizes.length === 0) return;

    if (isPremiumMode && !activeVipCampaign) {
      handleVipLocked();
      return;
    }

    setIsSpinning(true);
    setPrizeResult(null);
    setGeneratedCode("");

    const spinAngleStart = Math.random() * 15 + 20;
    const spinTimeTotal = 7000;

    let spinTime = 0;

    const easeOut = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b;

    const animate = () => {
      spinTime += 20;

      if (spinTime >= spinTimeTotal) {
        setIsSpinning(false);

        calculateFinalPrize()
          .then((spinResult) => {
            if (spinResult?.prize && spinResult?.code) {
              setShowPopup(true);
            }
          })
          .catch((error) => {
            console.error("Lỗi tạo kết quả vòng quay:", error);
          });

        return;
      }

      const delta = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);

      angleRef.current += (delta * Math.PI) / 180;

      drawWheel(angleRef.current);

      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleOpenGiftImage = (imageSource, fallbackIcon) => {
    setCurrentGiftImage({
      source: imageSource,
      fallback: fallbackIcon,
    });
    setIsGiftImageOpen(true);
  };

  return (
    <div
      className={`party-container ${isPremiumMode ? "party-container-premium" : ""}`}
      style={{
        padding: isMobile ? "30px" : "30px",
      }}
    >
      <div className="header-area">
        <h1 className={`party-title ${isPremiumMode ? "party-title-premium" : ""} ${isMobile ? "party-title-mobile" : ""}`}>
          {isPremiumMode ? "💎 VÒNG QUAY VIP 💎" : "🎉 VÒNG QUAY MAY MẮN 🎉"}
        </h1>

        <p className="party-subtitle">
          {isPremiumMode ? "Chào mừng bạn đến với Vòng quay VIP của Phúc" : "Chào mừng bạn đến với Vòng quay của Phúc."}
        </p>
      </div>

      <div className={`main-layout ${isMobile ? "main-layout-mobile" : "main-layout-desktop"}`}>
        <div className={`wheel-wrapper ${isPremiumMode ? "wheel-wrapper-premium" : ""}`}>
          <div className={`pointer ${isPremiumMode ? "pointer-premium" : ""} ${isMobile ? "pointer-mobile" : "pointer-desktop"}`}></div>

          <div className="wheel-container">
            <div className={`wheel-lights-container ${isSpinning ? "spinning" : ""}`}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="light-dot"
                  style={{
                    transform: `rotate(${i * 18}deg) translateY(-${canvasSize / 2}px)`,
                  }}
                ></div>
              ))}
            </div>

            <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="canvas-style" />
          </div>

          <button
            onClick={spinTheWheel}
            disabled={isSpinning}
            className={`spin-button ${isSpinning ? "spin-button-disabled" : ""} ${isMobile ? "spin-button-mobile" : "spin-button-desktop"}`}
          >
            {isSpinning ? "🌟 ĐANG XOAY..." : isPremiumMode ? "QUAY NGAY " : "QUAY LUÔN"}
          </button>
        </div>

        <div className={`form-wrapper ${isMobile ? "form-wrapper-mobile" : ""}`}>
          <VipAccessPanel
            isVipUnlocked={isVipUnlocked}
            onVipUnlocked={handleVipUnlocked}
            onVipLocked={handleVipLocked}
            onOpenGiftList={handleOpenGiftList}
            onOpenPendingGifts={handleOpenPendingGifts}
          />
        </div>
      </div>

      <ListGiftPopup
        isOpen={showListPopup}
        onClose={() => setShowListPopup(false)}
        initialTab={listPopupTab}
        basicPrizes={basicRound}
        pendingGifts={pendingGifts}
      />

      <ResultPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        result={prizeResult}
        babyName=""
        code={generatedCode}
        pendingGifts={pendingGifts}
        onSendZalo={() => window.open(`https://zalo.me/${ZALO_PHONE_ADMIN}?text=Mã:${generatedCode}`)}
        onSendWhatsapp={() => window.open(`https://wa.me/${ZALO_PHONE_ADMIN}?text=Mã:${generatedCode}`)}
        onSpinAgain={() => {
          setShowPopup(false);
          spinTheWheel();
        }}
        onOpenImage={handleOpenGiftImage}
      />

      {isGiftImageOpen && (
        <div className="lightbox-overlay" onClick={() => setIsGiftImageOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {currentGiftImage?.source ? (
              <img src={currentGiftImage.source} alt="Gift Preview" />
            ) : (
              <div className="lightbox-fallback-icon">{currentGiftImage?.fallback || "🎁"}</div>
            )}

            <p className="lightbox-text">Chạm bất kỳ vị trí nào để đóng...</p>
          </div>
        </div>
      )}

      <VipRealtimeNotification campaignCode={activeVipCampaign?.code || null} onVipLocked={handleVipLocked} />
    </div>
  );
}
