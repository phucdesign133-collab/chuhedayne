import React, { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/CustomerManager.css";
export default function CustomerManager({ searchTerm = "", savedData = null, onCountChange, onEdit, onAddEvent, onEditEvent }) {
  const [customers, setCustomers] = useState([]);
  const [openHistory, setOpenHistory] = useState({});
  const [openNote, setOpenNote] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);
  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customer").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải khách hàng:", error);
      setCustomers([]);
    }
  };
  useEffect(() => {
    loadCustomers();
  }, []);
  useEffect(() => {
    if (!savedData) return;
    setCustomers((prev) => {
      if (!savedData.id) return [savedData, ...prev];
      const exists = prev.some((item) => item.id === savedData.id);
      return exists ? prev.map((item) => (item.id === savedData.id ? savedData : item)) : [savedData, ...prev];
    });
  }, [savedData]);
  const activeSearchTerm = searchTerm.trim().toLowerCase();
  const filteredCustomers = customers
    .filter((customer) => {
      if (!activeSearchTerm) return true;
      return (
        String(customer.customer_name || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(customer.contact_value || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(customer.event_name || "")
          .toLowerCase()
          .includes(activeSearchTerm) ||
        String(customer.referral_phone || "")
          .toLowerCase()
          .includes(activeSearchTerm)
      );
    })
    .sort((a, b) => {
      const getLatestDate = (customer) => {
        const history = Array.isArray(customer.history) ? customer.history : [];
        return history.reduce((latest, item) => {
          const match = String(item.event_date || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (!match) return latest;
          const [, day, month, year] = match;
          const time = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
          return time > latest ? time : latest;
        }, 0);
      };
      return getLatestDate(b) - getLatestDate(a);
    });
  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredCustomers.length);
    }
  }, [filteredCustomers.length, onCountChange]);
  const handleEdit = (customer) => {
    if (typeof onEdit === "function") {
      onEdit(customer);
    }
  };
  const handleAddEvent = (customer) => {
    if (typeof onAddEvent === "function") {
      onAddEvent(customer);
    }
  };
  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Xóa khách hàng "${customer.customer_name || ""}" khỏi danh sách?`);
    if (!confirmed) return;
    try {
      const { error } = await supabase.from("customer").delete().eq("id", customer.id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
    } catch (error) {
      console.error("❌ Lỗi xóa khách hàng:", error);
      alert(`Không thể xóa khách hàng:\n${error?.message || "Lỗi không xác định"}`);
    }
  };
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e, customer) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX;
    const cardWidth = e.currentTarget.offsetWidth;
    const swipeDistance = cardWidth * 0.85;
    if (Math.abs(deltaX) >= swipeDistance) {
      if (deltaX > 0) {
        handleEdit(customer);
      } else {
        handleDelete(customer);
      }
    }
    setTouchStartX(null);
  };
  const getContactValue = (customer) => {
    if (customer.contact_value !== undefined && customer.contact_value !== null) {
      return customer.contact_value;
    }
    return customer.phone || "";
  };
  const formatPhone = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };
  const formatDate = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "").slice(0, 8);
    if (digits.length !== 8) return value;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };
  const getHistory = (customer) => {
    return Array.isArray(customer.history) ? customer.history : [];
  };
  const getSortedHistory = (customer) => {
    return [...getHistory(customer)].sort((a, b) => {
      const parseDate = (value) => {
        const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!match) return 0;
        const [, day, month, year] = match;
        return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
      };
      return parseDate(b.event_date) - parseDate(a.event_date);
    });
  };
  const getLatestBooking = (customer) => {
    const history = getSortedHistory(customer);
    return history.length > 0 ? history[0] : null;
  };
  const getHistoryLine = (item) => {
    const date = formatDate(item.event_date);
    const eventName = item.event_name || "";
    const remaining = formatMoney(item.remaining);
    const tips = Number(item.tips || 0);
    return `${date} · ${eventName} · ${remaining}${tips > 0 ? ` · Tips ${formatMoney(tips)}` : ""}`;
  };
  const getNoteItems = (note) => {
    return String(note || "")
      .split(/\s*-x\s*/i)
      .map((item) => item.trim())
      .filter(Boolean);
  };
  return (
    <div className="customer-manager">
      <div className="customer-list">
        {filteredCustomers.length === 0 ? (
          <div className="customer-empty">
            <UsersRound size={32} />
            <span>Không có khách hàng phù hợp</span>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => {
            const sortedHistory = getSortedHistory(customer);
            const latestBooking = getLatestBooking(customer);
            const noteItems = getNoteItems(customer.note);
            const historyOpen = Boolean(openHistory[customer.id]);
            const noteOpen = Boolean(openNote[customer.id]);
            const contactValue = getContactValue(customer);
            const isPhone = customer.contact_type !== "zalo";
            return (
              <div
                className="customer-card"
                key={customer.id || `customer-${index}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, customer)}
              >
                <div className="customer-info">
                  <div className="customer-grid-row">
                    <div className="customer-grid-item customer-name">
                      <strong>{customer.customer_name || ""}</strong>
                    </div>
                    <div className="customer-grid-item customer-contact">
                      <span>
                        {isPhone ? "Số điện thoại: " : "Zalo: "}
                        <strong>{isPhone ? formatPhone(contactValue) : String(contactValue || "")}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="customer-grid-row">
                    <div className="customer-grid-item customer-tier">
                      <span>Bậc: </span>
                      <strong>{customer.member_tier || "0"}</strong>
                    </div>
                    <div className="customer-grid-item customer-latest">
                      Gần nhất: <strong>{latestBooking ? formatDate(latestBooking.event_date) : ""}</strong>
                    </div>
                  </div>
                  <div className="customer-collapse-section">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <button
                        type="button"
                        className="customer-collapse-btn"
                        onClick={() =>
                          setOpenHistory((prev) => ({
                            ...prev,
                            [customer.id]: !historyOpen,
                          }))
                        }
                      >
                        <span>{historyOpen ? "▼" : "▶"}</span>
                        Lịch sử booking
                      </button>
                      <button
                        type="button"
                        className="customer-collapse-btn"
                        style={{ color: "var(--primary-red, #c0392b)" }}
                        onClick={() => handleAddEvent(customer)}
                        aria-label="Thêm sự kiện"
                        title="Thêm sự kiện"
                      >
                        + Thêm sự kiện
                      </button>
                    </div>
                    {historyOpen && (
                      <div className="customer-history">
                        {sortedHistory.length > 0 ? (
                          sortedHistory.map((item, historyIndex) => (
                            <div className="customer-history-row" key={item.id || historyIndex}>
                              <span>{getHistoryLine(item)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="customer-history-row">Chưa có lịch sử booking</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="customer-collapse-section">
                    <button
                      type="button"
                      className="customer-collapse-btn"
                      onClick={() =>
                        setOpenNote((prev) => ({
                          ...prev,
                          [customer.id]: !noteOpen,
                        }))
                      }
                    >
                      <span>{noteOpen ? "▼" : "▶"}</span>
                      Ghi chú
                    </button>
                    {noteOpen && (
                      <div className="customer-note-content">
                        {noteItems.length > 1 ? (
                          <ul>
                            {noteItems.map((item, noteIndex) => (
                              <li key={noteIndex}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <div>{noteItems[0] || ""}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
