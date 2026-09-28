import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
export default function CustomerPopup({ initialData = null, onSave, onClose, mode = "customer", eventIndex = null, onEditEvent }) {
  const isEventMode = mode === "event";
  const isAddingEvent = isEventMode && (eventIndex === null || eventIndex === undefined);
  const [customerName, setCustomerName] = useState("");
  const [contactType, setContactType] = useState("phone");
  const [referralContactType, setReferralContactType] = useState("phone");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [referralPhone, setReferralPhone] = useState("");
  const [referralName, setReferralName] = useState("");
  const [referralTier, setReferralTier] = useState(0);
  const [referralBank, setReferralBank] = useState("");
  const [referralAccount, setReferralAccount] = useState("");
  const [events, setEvents] = useState([{ eventName: "", eventDate: "", orderValue: "", cashback: 0, remaining: 0, tips: "", repeat: false }]);
  const [memberTier, setMemberTier] = useState("");
  const [memberPercent, setMemberPercent] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formatName = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/(^|\s)(\p{L})/gu, (_, space, char) => space + char.toLocaleUpperCase("vi-VN"));
  const getRawPhone = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);
  const formatPhone = (value) => {
    const digits = getRawPhone(value);
    if (digits.length <= 3) return digits;
    if (digits.startsWith("09")) {
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };
  const formatMoneyInput = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const getRawMoney = (value) => String(value ?? "").replace(/\D/g, "");
  const formatDateInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const parseDate = (value) => {
    const match = String(value ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const sortHistory = (items) =>
    [...items].sort((a, b) => {
      const dateA = parseDate(a.event_date);
      const dateB = parseDate(b.event_date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  const getMemberPercent = (tier) => {
    const tierNumber = Number(String(tier ?? "").replace(/\D/g, ""));
    return { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15 }[tierNumber] || 0;
  };
  const getEventCalculationTier = () => {
    if (!isAddingEvent) return Number(memberTier) || 0;
    return history.length === 0 ? Number(referralTier) || 0 : Number(memberTier) || 0;
  };
  const calculateEventValues = (event, tier = memberTier) => {
    const order = Number(getRawMoney(event.orderValue)) || 0;
    const percent = getMemberPercent(tier);
    const cashback = Math.round((order * percent) / 100);
    return { ...event, cashback, remaining: Math.max(order - cashback, 0) };
  };
  const handleEventChange = (index, field, value) => {
    setEvents((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        return field === "orderValue" ? calculateEventValues(updated, getEventCalculationTier()) : updated;
      }),
    );
  };
  const findReferral = async (value, contactTypeValue = referralContactType) => {
    const input = String(value ?? "").trim();
    if (!input) {
      setReferralName("");
      setReferralTier(0);
      return;
    }
    try {
      let query = supabase.from("customer").select("customer_name, phone, contact_type, contact_value, member_tier");
      if (contactTypeValue === "phone") {
        const phoneNumber = getRawPhone(input);
        if (phoneNumber.length !== 10) {
          setReferralName("");
          setReferralTier(0);
          return;
        }
        query = query.eq("phone", phoneNumber);
      } else {
        query = query.eq("contact_value", input);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      if (data?.customer_name) setReferralName(formatName(data.customer_name));
      setReferralTier(Number(data?.member_tier) || 0);
    } catch (error) {
      console.error("❌ Lỗi tìm người PR:", error);
      // setReferralName("");
      setReferralTier(0);
    }
  };
  const handleReferralChange = (e) => {
    const value = e.target.value;
    setReferralName("");
    setReferralTier(0);
    if (referralContactType === "zalo") {
      setReferralPhone(value);
      if (value.trim()) findReferral(value);
      return;
    }
    const digits = getRawPhone(value);
    if (digits.length > 0 && /^[\d.\s]+$/.test(value)) {
      const phoneNumber = digits.slice(0, 10);
      setReferralPhone(phoneNumber);
      if (phoneNumber.length === 10) findReferral(phoneNumber);
      return;
    }
    setReferralPhone(value);
    if (value.trim()) findReferral(value);
  };
  useEffect(() => {
    if (!initialData) {
      setCustomerName("");
      setContactType("phone");
      setReferralContactType("phone");
      setPhone("");
      setAddress("");
      setReferralPhone("");
      setReferralName("");
      setReferralTier(0);
      setReferralBank("");
      setReferralAccount("");
      setEvents([{ eventName: "", eventDate: "", orderValue: "", cashback: 0, remaining: 0, tips: "", repeat: false }]);
      setMemberTier("");
      setMemberPercent("");
      setNote("");
      setHistory([]);
      setHistoryOpen(false);
      return;
    }
    setCustomerName(formatName(initialData.customer_name || ""));
    const loadedContactType = initialData.contact_type === "zalo" ? "zalo" : "phone";
    const loadedReferralContactType = initialData.referral_contact_type === "zalo" ? "zalo" : "phone";
    const loadedReferralPhone =
      loadedReferralContactType === "zalo" ? initialData.referral_phone || "" : getRawPhone(initialData.referral_phone || "");
    setContactType(loadedContactType);
    setReferralContactType(loadedReferralContactType);
    setPhone(
      loadedContactType === "zalo"
        ? initialData.contact_value || initialData.phone || ""
        : getRawPhone(initialData.phone || initialData.contact_value || ""),
    );
    setAddress(initialData.address || "");
    setReferralPhone(loadedReferralPhone);
    setReferralName(initialData.referral_name || "");
    setReferralTier(0);
    setReferralBank(initialData.referral_bank || "");
    setReferralAccount(initialData.referral_account || "");
    setNote(initialData.note || "");
    const existingHistory = Array.isArray(initialData.history) ? initialData.history : [];
    setHistory(sortHistory(existingHistory));
    setHistoryOpen(false);
    const loadedTier = initialData.member_tier ?? "";
    setMemberTier(loadedTier ? String(loadedTier) : "");
    setMemberPercent(getMemberPercent(loadedTier) ? String(getMemberPercent(loadedTier)) : "");
    if (isEventMode) {
      const selectedHistory =
        eventIndex !== null && eventIndex !== undefined
          ? existingHistory.find((item, index) => String(item.id || `history-${index}`) === String(eventIndex))
          : null;
      if (selectedHistory) {
        setEvents([
          {
            eventName: selectedHistory.event_name || "",
            eventDate: selectedHistory.event_date || "",
            orderValue: Number(selectedHistory.order_value) || 0,
            cashback: Number(selectedHistory.cashback) || 0,
            remaining: Number(selectedHistory.remaining) || 0,
            tips: Number(selectedHistory.tips) || 0,
            repeat: false,
          },
        ]);
      } else {
        setEvents([{ eventName: "", eventDate: "", orderValue: "", cashback: 0, remaining: 0, tips: "", repeat: false }]);
        if (isAddingEvent && existingHistory.length === 0 && loadedReferralPhone) findReferral(loadedReferralPhone, loadedReferralContactType);
      }
      return;
    }
    setEvents([{ eventName: "", eventDate: "", orderValue: "", cashback: 0, remaining: 0, tips: "", repeat: false }]);
  }, [initialData, isEventMode, eventIndex]);
  useEffect(() => {
    if (!isEventMode || !isAddingEvent || history.length !== 0 || !referralPhone) {
      if (!isEventMode || !isAddingEvent || history.length !== 0) setReferralTier(0);
      return;
    }
    findReferral(referralPhone);
  }, [isEventMode, isAddingEvent, history.length, referralPhone, referralContactType]);
  useEffect(() => {
    if (!isAddingEvent || history.length !== 0) return;
    setEvents((prev) => prev.map((item) => calculateEventValues(item, Number(referralTier) || 0)));
  }, [referralTier]);
  const handleEventRepeat = (index, checked) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], repeat: checked };
      if (checked && index === updated.length - 1)
        updated.push({ eventName: "", eventDate: "", orderValue: "", cashback: 0, remaining: 0, tips: "", repeat: false });
      if (!checked && index + 1 < updated.length) updated.splice(index + 1, 1);
      return updated;
    });
  };
  const handleMemberTierChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const percent = getMemberPercent(value);
    setMemberTier(value);
    setMemberPercent(percent ? String(percent) : "");
    setEvents((prev) => prev.map((item) => calculateEventValues(item, value)));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (isEventMode) {
      const calculationTier = getEventCalculationTier();
      const event = calculateEventValues(events[0] || {}, calculationTier);
      const eventName = String(event.eventName ?? "").trim();
      const eventDate = String(event.eventDate ?? "");
      const eventValue = Number(getRawMoney(event.orderValue)) || 0;
      const cashbackValue = Number(event.cashback) || 0;
      const remainingValue = Math.max(eventValue - cashbackValue, 0);
      const tipsValue = Number(getRawMoney(event.tips)) || 0;
      if (!eventName && !eventDate && !eventValue && !tipsValue) {
        alert("Vui lòng nhập thông tin sự kiện.");
        return;
      }
      const formData = {
        id: initialData?.id || null,
        eventIndex,
        event: { eventName, eventDate, orderValue: eventValue, cashback: cashbackValue, remaining: remainingValue, tips: tipsValue, repeat: false },
      };
      if (typeof onSave !== "function") {
        alert("Không thể lưu sự kiện.");
        return;
      }
      setIsSaving(true);
      try {
        const result = await onSave(formData);
        if (!result || result.success !== true) throw result?.error || new Error("Không thể lưu sự kiện.");
        onClose();
      } catch (error) {
        console.error("❌ CustomerPopup event save error:", error);
        alert(`Không thể lưu sự kiện:\n${error?.message || "Lỗi không xác định"}`);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const formData = {
      id: initialData?.id || null,
      customer_name: formatName(customerName),
      phone: contactType === "phone" ? getRawPhone(phone) : String(phone ?? "").trim(),
      contact_type: contactType,
      contact_value: contactType === "phone" ? getRawPhone(phone) : String(phone ?? "").trim(),
      address: address.trim(),
      referral_phone: referralContactType === "phone" ? getRawPhone(referralPhone) : String(referralPhone ?? "").trim(),
      referral_contact_type: referralContactType,
      referral_name: referralName || "",
      referral_bank: referralBank.trim(),
      referral_account: referralAccount.trim(),
      member_tier: Number(memberTier) || 0,
      member_percent: getMemberPercent(memberTier),
      note: note.trim(),
      history,
      is_active: initialData?.is_active ?? true,
    };
    if (typeof onSave !== "function") {
      alert("Không thể lưu khách hàng.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await onSave(formData);
      if (!result || result.success !== true) throw result?.error || new Error("Không thể lưu khách hàng.");
      onClose();
    } catch (error) {
      console.error("❌ CustomerPopup save error:", error);
      alert(`Không thể lưu khách hàng:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };
  const formatDate = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "").slice(0, 8);
    if (digits.length !== 8) return value;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  const getHistoryLine = (item) => {
    const tips = Number(item.tips || 0);
    return `${formatDate(item.event_date)} · ${item.event_name || ""} · ${formatMoney(item.remaining)}${tips > 0 ? ` · Tips ${formatMoney(tips)}` : ""}`;
  };
  return (
    <form onSubmit={handleSubmit} className={`popup-form ${isEventMode ? "customer-event-popup" : ""}`}>
      {!isEventMode && (
        <>
          <div className="popup-row">
            <div className="popup-inline">
              <label className="popup-label" style={{ width: "200px" }}>
                Tên khách hàng
              </label>
              <label className="popup-checkbox">
                <input
                  type="checkbox"
                  checked={contactType === "phone"}
                  onChange={() => {
                    setContactType("phone");
                    setPhone(getRawPhone(phone));
                  }}
                  disabled={isSaving}
                />{" "}
                Điện thoại
              </label>
              <label className="popup-checkbox">
                <input type="checkbox" checked={contactType === "zalo"} onChange={() => setContactType("zalo")} disabled={isSaving} /> Zalo
              </label>
            </div>
            <div className="popup-inline">
              <input
                className="popup-input"
                value={customerName}
                onChange={(e) => setCustomerName(formatName(e.target.value))}
                disabled={isSaving}
                placeholder="Tên khách hàng"
              />
              <input
                className="popup-input"
                inputMode={contactType === "phone" ? "numeric" : "text"}
                value={contactType === "phone" ? formatPhone(phone) : phone}
                onChange={(e) => setPhone(contactType === "phone" ? getRawPhone(e.target.value) : e.target.value)}
                disabled={isSaving}
                placeholder={contactType === "phone" ? "0901 234 567" : "Tên Zalo hoặc số Zalo"}
              />
            </div>
          </div>
          <div className="popup-row">
            <label className="popup-label">Địa chỉ</label>
            <input className="popup-input" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSaving} placeholder="Địa chỉ" />
          </div>
          <div className="popup-row">
            <div className="popup-inline">
              <label className="popup-label" style={{ width: "200px" }}>
                Tên người PR
              </label>
              <label className="popup-checkbox">
                <input
                  type="checkbox"
                  checked={referralContactType === "phone"}
                  onChange={() => {
                    setReferralContactType("phone");
                    setReferralPhone(getRawPhone(referralPhone));
                  }}
                  disabled={isSaving}
                />{" "}
                Điện thoại
              </label>
              <label className="popup-checkbox">
                <input type="checkbox" checked={referralContactType === "zalo"} onChange={() => setReferralContactType("zalo")} disabled={isSaving} />{" "}
                Zalo
              </label>
            </div>
            <div className="popup-inline">
              <input
                className="popup-input"
                value={referralName}
                onChange={(e) => setReferralName(formatName(e.target.value))}
                disabled={isSaving}
                placeholder="Tên người PR"
              />
              <input
                className="popup-input"
                inputMode={referralContactType === "phone" ? "numeric" : "text"}
                value={referralContactType === "phone" ? formatPhone(referralPhone) : referralPhone}
                onChange={handleReferralChange}
                disabled={isSaving}
                placeholder={referralContactType === "phone" ? "SĐT PR" : "Tên Zalo hoặc số Zalo"}
              />
            </div>
          </div>
          <div className="popup-row">
            <label className="popup-label">Cashback</label>
            <div className="popup-inline">
              <input
                className="popup-input"
                value={referralBank}
                onChange={(e) => setReferralBank(e.target.value)}
                disabled={isSaving}
                placeholder="Ngân hàng"
              />
              <input
                className="popup-input"
                inputMode="numeric"
                value={referralAccount}
                onChange={(e) => setReferralAccount(e.target.value.replace(/\D/g, ""))}
                disabled={isSaving}
                placeholder="STK"
              />
            </div>
          </div>
          {initialData && !isEventMode && (
            <div className="popup-row">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <button type="button" className="customer-collapse-btn" onClick={() => setHistoryOpen((prev) => !prev)}>
                  <span>{historyOpen ? "▼" : "▶"}</span> LỊCH SỬ BOOKING
                </button>
              </div>
              {historyOpen && (
                <div className="customer-history">
                  {sortHistory(history).map((item, historyIndex) => {
                    const historyId = item.id || `history-${historyIndex}`;
                    return (
                      <div className="customer-history-row" key={historyId}>
                        <span>{getHistoryLine(item)}</span>
                        <button
                          type="button"
                          className="customer-history-edit-btn"
                          onClick={() => onEditEvent?.(initialData, historyId)}
                          aria-label="Sửa booking"
                          title="Sửa booking"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="popup-row">
            <label className="popup-label">Ghi chú</label>
            <textarea
              className="popup-input popup-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSaving}
              placeholder="Ghi chú khách hàng"
            />
          </div>
        </>
      )}
      {isEventMode && (
        <>
          {isAddingEvent && history.length === 0 && (
            <div className="popup-row">
              <input
                className="popup-input"
                value={
                  referralName || referralPhone
                    ? `${referralName || ""}${referralName && referralPhone ? " - " : ""}${referralContactType === "phone" ? formatPhone(referralPhone) : referralPhone}`
                    : ""
                }
                onCopy={(e) => {
                  e.preventDefault();
                  e.clipboardData.setData("text/plain", referralPhone || "");
                }}
                readOnly
              />
            </div>
          )}
          <div className="popup-row">
            {events.map((event, index) => {
              const calculated = calculateEventValues(event, getEventCalculationTier());
              return (
                <div className="customer-event-block" key={index}>
                  <div className="popup-inline">
                    <input
                      className="popup-input"
                      placeholder="công việc"
                      value={event.eventName}
                      onChange={(e) => handleEventChange(index, "eventName", e.target.value)}
                      disabled={isSaving}
                    />
                    <input
                      className="popup-input"
                      inputMode="numeric"
                      placeholder="Ngày"
                      value={event.eventDate}
                      onChange={(e) => handleEventChange(index, "eventDate", formatDateInput(e.target.value))}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="popup-inline">
                    <input
                      className="popup-input"
                      inputMode="numeric"
                      placeholder="Giá trị đơn"
                      value={formatMoneyInput(event.orderValue)}
                      onChange={(e) => handleEventChange(index, "orderValue", getRawMoney(e.target.value))}
                      disabled={isSaving}
                    />
                    <input
                      className="popup-input"
                      value={calculated.cashback ? `${formatMoneyInput(calculated.cashback)}đ` : ""}
                      placeholder="Cashback"
                      readOnly
                    />
                  </div>
                  <div className="popup-inline">
                    <input
                      className="popup-input"
                      value={calculated.remaining ? `${formatMoneyInput(calculated.remaining)}đ` : ""}
                      placeholder="Còn lại"
                      readOnly
                    />
                    <input
                      className="popup-input"
                      inputMode="numeric"
                      placeholder="Tips"
                      value={formatMoneyInput(event.tips)}
                      onChange={(e) => handleEventChange(index, "tips", getRawMoney(e.target.value))}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : isEventMode ? "Lưu" : "CẬP NHẬT"}
        </button>
      </div>
    </form>
  );
}
