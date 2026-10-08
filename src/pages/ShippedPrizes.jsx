import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function ShippedPrizes({ searchTerm = "", savedData = null, onCountChange }) {
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState("first");
  const [loading, setLoading] = useState(false);
  const [swipeState, setSwipeState] = useState({
    id: null,
    x: 0,
    startX: 0,
    startY: 0,
    dragging: false,
  });

  const suppressClickRef = useRef(false);

  const loadBills = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("shipped_prizes").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Lỗi tải quà đã gửi:", error);
      setLoading(false);
      return;
    }

    setBills(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    if (!savedData) return;
    loadBills();
  }, [savedData]);

  const activeSearchTerm = String(searchTerm || "")
    .trim()
    .toLowerCase();

  const filteredBills = useMemo(() => {
    if (!activeSearchTerm) return bills;

    return bills.filter((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];

      const giftText = items
        .map((item) => `${item?.name || item?.text || ""} ${item?.quantity || ""} ${item?.code || ""}`)
        .join(" ")
        .toLowerCase();

      return (
        String(bill.customer_name || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(bill.phone || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(bill.address || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(bill.note || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        giftText.includes(activeSearchTerm)
      );
    });
  }, [bills, activeSearchTerm]);

  const visibleBills = useMemo(() => {
    const statusMap = {
      first: "pending",
      second: "prepared",
      third: "shipped",
    };

    return filteredBills.filter((bill) => (bill.gift_status || "pending") === statusMap[activeTab]);
  }, [filteredBills, activeTab]);

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(visibleBills.length);
    }
  }, [visibleBills.length, onCountChange]);

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("vi-VN");
  };

  const handleTouchStart = (event, id) => {
    const touch = event.touches[0];

    suppressClickRef.current = false;

    setSwipeState({
      id,
      x: 0,
      startX: touch.clientX,
      startY: touch.clientY,
      dragging: true,
    });
  };

  const handleTouchMove = (event, id) => {
    if (!swipeState.dragging || swipeState.id !== id) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (Math.abs(deltaX) >= 10) {
      suppressClickRef.current = true;
    }

    setSwipeState((prev) => ({
      ...prev,
      x: Math.max(-140, Math.min(140, deltaX)),
    }));
  };

  const handleTouchEnd = async (id) => {
    if (swipeState.id !== id) return;

    const bill = visibleBills.find((item) => item.id === id);

    const shouldMove = Math.abs(swipeState.x) >= 80;

    if (bill && shouldMove) {
      const tabs = ["first", "second", "third"];

      const statusMap = {
        first: "pending",
        second: "prepared",
        third: "shipped",
      };

      const currentIndex = tabs.indexOf(activeTab);
      const direction = swipeState.x < 0 ? 1 : -1;
      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 && nextIndex <= 2) {
        const nextTab = tabs[nextIndex];
        const nextStatus = statusMap[nextTab];

        const { data, error } = await supabase
          .from("shipped_prizes")
          .update({
            gift_status: nextStatus,
          })
          .eq("id", bill.id)
          .select()
          .maybeSingle();

        if (!error && data) {
          setBills((prev) =>
            prev.map((item) =>
              item.id === bill.id
                ? {
                    ...item,
                    ...data,
                  }
                : item,
            ),
          );
        } else if (error) {
          console.error("❌ Lỗi cập nhật trạng thái quà gửi:", error);

          alert(`Không thể cập nhật trạng thái:\n${error?.message || "Lỗi không xác định"}`);
        }
      }
    }

    setSwipeState({
      id: null,
      x: 0,
      startX: 0,
      startY: 0,
      dragging: false,
    });
  };

  return (
    <div className="manager">
      <div className="tabs">
        <button type="button" className={`tab ${activeTab === "first" ? "active" : ""}`} onClick={() => setActiveTab("first")}>
          CHỜ SOẠN
        </button>

        <button type="button" className={`tab ${activeTab === "second" ? "active" : ""}`} onClick={() => setActiveTab("second")}>
          ĐÃ SOẠN
        </button>

        <button type="button" className={`tab ${activeTab === "third" ? "active" : ""}`} onClick={() => setActiveTab("third")}>
          ĐÃ GỬI
        </button>
      </div>

      <div className="list">
        {loading ? (
          <div className="row">Đang tải...</div>
        ) : visibleBills.length === 0 ? (
          <div className="row">Chưa có đơn.</div>
        ) : (
          visibleBills.map((bill) => {
            const x = swipeState.id === bill.id ? swipeState.x : 0;
            const items = Array.isArray(bill.items) ? bill.items : [];

            return (
              <div
                key={bill.id}
                className="grid"
                onTouchStart={(event) => handleTouchStart(event, bill.id)}
                onTouchMove={(event) => handleTouchMove(event, bill.id)}
                onTouchEnd={() => handleTouchEnd(bill.id)}
                style={{
                  background: "#fff",
                  padding: "10px",
                  border: "1px solid #333",
                  transform: `translateX(${x}px)`,
                  margin: "10px auto",
                }}
              >
                {activeTab === "first" ? (
                  <>
                    <div className="row">👤 {bill.customer_name || ""}</div>

                    {items.map((item, index) => {
                      const giftName = String(item?.name || item?.text || "").trim();
                      const quantity = Number(item?.quantity);

                      if (!giftName) return null;

                      return (
                        <div className="row" key={`${bill.id}-item-${index}`}>
                          🎁 {giftName} <span>× {Number.isFinite(quantity) && quantity > 0 ? quantity : 1}</span>
                        </div>
                      );
                    })}

                    <div className="row">📞 {bill.phone || ""}</div>

                    <div className="row">📍 {bill.address || ""}</div>

                    {bill.note && <div className="row">Note: {bill.note}</div>}
                  </>
                ) : activeTab === "second" ? (
                  <>
                    <div className="row">
                      👤 {bill.customer_name || ""} · {bill.phone || ""}
                    </div>

                    {items.map((item, index) => {
                      const giftName = String(item?.name || item?.text || "").trim();
                      const quantity = Number(item?.quantity);

                      if (!giftName) return null;

                      return (
                        <div className="row" key={`${bill.id}-item-${index}`}>
                          🎁 {giftName} <span>× {Number.isFinite(quantity) && quantity > 0 ? quantity : 1}</span>
                        </div>
                      );
                    })}

                    <div className="row">📍 {bill.address || ""}</div>

                    {bill.note && <div className="row">Note: {bill.note}</div>}
                  </>
                ) : (
                  <>
                    <div className="row">
                      👤 {bill.customer_name || ""} · {bill.phone || ""}
                    </div>

                    {items.map((item, index) => {
                      const giftName = String(item?.name || item?.text || "").trim();
                      const quantity = Number(item?.quantity);

                      if (!giftName) return null;

                      return (
                        <div className="row" key={`${bill.id}-item-${index}`}>
                          🎁 {giftName} <span>× {Number.isFinite(quantity) && quantity > 0 ? quantity : 1}</span>
                        </div>
                      );
                    })}

                    <div className="row">🚚 Ngày gửi: {formatDate(bill.created_at || bill.date)}</div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
