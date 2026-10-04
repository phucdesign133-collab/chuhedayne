import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/Tab.css";

export default function ShippedPrizes({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [bills, setBills] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("first");
  const [loading, setLoading] = useState(false);
  const [swipeState, setSwipeState] = useState({ id: null, x: 0, startX: 0, startY: 0, dragging: false });

  const loadBills = async () => {
    setLoading(true);

    const [{ data: billData, error: billError }, { data: statusData, error: statusError }] = await Promise.all([
      supabase.from("bills").select("*").eq("bill_type", "gift-orders").order("created_at", { ascending: false }),
      supabase.from("shipped_prizes").select("id, gift_status"),
    ]);

    if (billError) {
      console.error("❌ Lỗi tải gift-orders:", billError);
      setLoading(false);
      return;
    }

    if (statusError) {
      console.error("❌ Lỗi tải trạng thái quà gửi:", statusError);
    }

    const statusMap = {};
    (statusData || []).forEach((item) => {
      statusMap[item.id] = item.gift_status || "pending";
    });

    setBills(billData || []);
    setStatuses(statusMap);
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

  const getBillStatus = (bill) => statuses[bill.id] || "pending";

  const filteredBills = useMemo(() => {
    if (!activeSearchTerm) return bills;

    return bills.filter((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];
      const giftText = items
        .map((item) => `${item?.text || ""} ${item?.quantity || ""}`)
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

    return filteredBills.filter((bill) => getBillStatus(bill) === statusMap[activeTab]);
  }, [filteredBills, activeTab, statuses]);

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

        const payload = {
          id: bill.id,
          customer_name: bill.customer_name || "",
          phone: bill.phone || "",
          address: bill.address || "",
          note: bill.note || "",
          date: bill.created_at ? new Date(bill.created_at).toISOString().slice(0, 10) : undefined,
          gift_status: nextStatus,
        };

        const { data, error } = await supabase.from("shipped_prizes").upsert(payload, { onConflict: "id" }).select("id, gift_status").single();

        if (!error && data) {
          setStatuses((prev) => ({
            ...prev,
            [bill.id]: data.gift_status,
          }));
        } else if (error) {
          console.error("❌ Lỗi cập nhật trạng thái quà gửi:", error);
          alert(`Không thể cập nhật trạng thái:\n${error?.message || "Lỗi không xác định"}`);
        }
      }
    }

    setSwipeState({ id: null, x: 0, startX: 0, startY: 0, dragging: false });
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
                }}
              >
                {activeTab === "first" ? (
                  <>
                    <div className="row">👤 {bill.customer_name || ""}</div>

                    {items.map((item, index) => {
                      const giftName = String(item?.text || "").trim();
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
                      const giftName = String(item?.text || "").trim();
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
                      const giftName = String(item?.text || "").trim();
                      const quantity = Number(item?.quantity);

                      if (!giftName) return null;

                      return (
                        <div className="row" key={`${bill.id}-item-${index}`}>
                          🎁 {giftName} <span>× {Number.isFinite(quantity) && quantity > 0 ? quantity : 1}</span>
                        </div>
                      );
                    })}

                    <div className="row">🚚 Ngày gửi: {formatDate(bill.created_at)}</div>
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
