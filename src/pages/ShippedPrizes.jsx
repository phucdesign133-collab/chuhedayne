import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/Tab.css";

export default function ShippedPrizes({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState("first");
  const [loading, setLoading] = useState(false);
  const [swipeState, setSwipeState] = useState({ id: null, x: 0, startX: 0, startY: 0, dragging: false });

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setBills(data || []);
      }

      setLoading(false);
    };

    fetchBills();
  }, [savedData]);

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredBills = useMemo(() => {
    if (!activeSearchTerm) return bills;

    return bills.filter((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];
      const itemText = items
        .map((item) => String(item?.text || item?.name || ""))
        .join(" ")
        .toLowerCase();

      return (
        String(bill.customer_name || "").toLowerCase().includes(activeSearchTerm) ||
        String(bill.phone || "").toLowerCase().includes(activeSearchTerm) ||
        String(bill.address || "").toLowerCase().includes(activeSearchTerm) ||
        String(bill.note || "").toLowerCase().includes(activeSearchTerm) ||
        itemText.includes(activeSearchTerm)
      );
    });
  }, [bills, activeSearchTerm]);

  const [tabBills, setTabBills] = useState({
    first: [],
    second: [],
    third: [],
  });

  useEffect(() => {
    setTabBills({
      first: filteredBills,
      second: [],
      third: [],
    });
  }, [filteredBills]);

  const visibleBills = tabBills[activeTab] || [];

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

  const getItemName = (item) => {
    return String(item?.text || item?.name || "").trim();
  };

  const getItemQuantity = (item) => {
    const quantity = Number(item?.quantity);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
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

  const handleTouchEnd = (id) => {
    if (swipeState.id !== id) return;

    const bill = visibleBills.find((item) => item.id === id);
    const shouldMove = Math.abs(swipeState.x) >= 80;

    if (bill && shouldMove) {
      const currentIndex = ["first", "second", "third"].indexOf(activeTab);
      const direction = swipeState.x < 0 ? 1 : -1;
      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 && nextIndex <= 2) {
        const nextTab = ["first", "second", "third"][nextIndex];

        setTabBills((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter((item) => item.id !== id),
          [nextTab]: [...prev[nextTab], bill],
        }));
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
                  background:"#fff",padding:'10px',border:'1px solid #333'
                }}
              >
                {activeTab === "first" ? (
                  <>
                    <div className="row">👤 {bill.customer_name || ""}</div>

                    {items.map((item, index) => {
                      const itemName = getItemName(item);
                      if (!itemName) return null;

                      return (
                        <div className="row" key={`${bill.id}-item-${index}`}>
                          🎁 {itemName} <span>× {getItemQuantity(item)}</span>
                        </div>
                      );
                    })}

                    <div className="row">📞 {bill.phone || ""}</div>
                    <div className="row">📍 {bill.address || ""}</div>

                    {bill.note && <div className="row">Note: {bill.note}</div>}
                  </>
                ) : activeTab === "second" ? (
                  <>
                    <div className="row">👤 {bill.customer_name || ""} · {bill.phone || ""}</div>
                    <div className="row">📍 {bill.address || ""}</div>
                    {bill.note && <div className="row">Note: {bill.note}</div>}
                  </>
                ) : (
                  <>
                    <div className="row">👤 {bill.customer_name || ""} · {bill.phone || ""}</div>
                    <div className="row">🚚 Ngày gửi: {formatDate(bill.shipped_at || bill.updated_at || bill.created_at)}</div>
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