import React, { useEffect, useState } from "react";

import { supabase } from "../utils/supabaseClient";

export default function CustomerPopup({ initialData = null, onSave, onClose }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [events, setEvents] = useState([
    {
      eventName: "",
      eventDate: "",
      orderValue: "",
      repeat: false,
    },
  ]);

  const [orderValue, setOrderValue] = useState("");

  const [cashbackPhone, setCashbackPhone] = useState("");
  const [cashback, setCashback] = useState(0);

  const [memberTier, setMemberTier] = useState("");
  const [memberPercent, setMemberPercent] = useState("");

  const [referralPhone, setReferralPhone] = useState("");
  const [referralName, setReferralName] = useState("");

  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // FORMAT TÊN
  // ============================================================

  const formatName = (value) => {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/(^|\s)(\p{L})/gu, (_, space, char) => space + char.toLocaleUpperCase("vi-VN"));
  };

  // ============================================================
  // FORMAT SĐT
  // 0799910603 → 079.991.0603
  // ============================================================

  const formatPhone = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  };

  const getRawPhone = (value) => {
    return String(value ?? "").replace(/\D/g, "");
  };

  // ============================================================
  // FORMAT TIỀN
  // ============================================================

  const formatMoneyInput = (value) => {
    return String(value ?? "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getRawMoney = (value) => {
    return String(value ?? "").replace(/\D/g, "");
  };

  // ============================================================
  // FORMAT NGÀY
  // ============================================================

  const formatDateInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  // ============================================================
  // CHUYỂN DD/MM/YYYY → DATE
  // ============================================================

  const parseDate = (value) => {
    const match = String(value ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    date.setHours(0, 0, 0, 0);

    return date;
  };

  // ============================================================
  // KIỂM TRA BOOKING ĐÃ QUA NGÀY HAY CHƯA
  //
  // Hôm nay / tương lai → giữ lại ở Sự kiện
  // Quá khứ → chuyển History
  // ============================================================

  const isPastEvent = (eventDate) => {
    const eventDateObject = parseDate(eventDate);

    if (!eventDateObject) {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return eventDateObject < today;
  };

  // ============================================================
  // SORT HISTORY
  // Cũ nhất → mới nhất
  // ============================================================

  const sortHistory = (items) => {
    return [...items].sort((a, b) => {
      const dateA = parseDate(a.event_date);
      const dateB = parseDate(b.event_date);

      if (!dateA && !dateB) {
        return 0;
      }

      if (!dateA) {
        return 1;
      }

      if (!dateB) {
        return -1;
      }

      return dateA - dateB;
    });
  };

  // ============================================================
  // TÍNH TỔNG GIÁ TRỊ BOOKING HIỆN TẠI
  // ============================================================

  const calculateTotalOrderValue = (eventList) => {
    return eventList.reduce((total, item) => {
      return total + (Number(getRawMoney(item.orderValue)) || 0);
    }, 0);
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setCustomerName("");
      setPhone("");

      setEvents([
        {
          eventName: "",
          eventDate: "",
          orderValue: "",
          repeat: false,
        },
      ]);

      setOrderValue("");

      setCashbackPhone("");
      setCashback(0);

      setMemberTier("");
      setMemberPercent("");

      setReferralPhone("");
      setReferralName("");

      setNote("");
      setHistory([]);

      return;
    }

    setCustomerName(formatName(initialData.customer_name || ""));

    setPhone(getRawPhone(initialData.phone || ""));

    // ----------------------------------------------------------
    // HISTORY CŨ
    // ----------------------------------------------------------

    const existingHistory = Array.isArray(initialData.history) ? initialData.history : [];

    // ----------------------------------------------------------
    // LẤY EVENTS
    // ----------------------------------------------------------

    let sourceEvents = [];

    if (Array.isArray(initialData.events) && initialData.events.length > 0) {
      sourceEvents = initialData.events.map((item) => ({
        eventName: item.eventName || "",
        eventDate: item.eventDate || "",
        orderValue: item.orderValue ?? "",
        repeat: Boolean(item.repeat),
      }));
    } else {
      sourceEvents = [
        {
          eventName: initialData.event_name || "",
          eventDate: initialData.event_date || "",
          orderValue: initialData.order_value ?? "",
          repeat: false,
        },
      ];
    }

    // ----------------------------------------------------------
    // TÁCH:
    // QUÁ KHỨ → HISTORY
    // HÔM NAY / TƯƠNG LAI → EVENTS
    // ----------------------------------------------------------

    const pastEvents = [];
    const futureEvents = [];

    sourceEvents.forEach((item, index) => {
      const normalizedItem = {
        eventName: String(item.eventName ?? "").trim(),

        eventDate: String(item.eventDate ?? ""),

        orderValue: Number(getRawMoney(item.orderValue)) || 0,

        repeat: Boolean(item.repeat),
      };

      if (normalizedItem.eventDate && isPastEvent(normalizedItem.eventDate)) {
        pastEvents.push({
          id: item.id || `event-history-${Date.now()}-${index}`,

          event_name: normalizedItem.eventName,

          event_date: normalizedItem.eventDate,

          order_value: normalizedItem.orderValue,
        });
      } else {
        futureEvents.push(normalizedItem);
      }
    });

    // ----------------------------------------------------------
    // HISTORY = HISTORY CŨ + EVENT QUÁ KHỨ
    // ----------------------------------------------------------

    const mergedHistory = [...existingHistory, ...pastEvents];

    // Tránh duplicate nếu dữ liệu đã tồn tại
    const uniqueHistory = [];

    mergedHistory.forEach((item) => {
      const duplicate = uniqueHistory.some(
        (existing) =>
          existing.event_name === item.event_name &&
          existing.event_date === item.event_date &&
          Number(existing.order_value) === Number(item.order_value),
      );

      if (!duplicate) {
        uniqueHistory.push(item);
      }
    });

    setHistory(sortHistory(uniqueHistory));

    // ----------------------------------------------------------
    // NẾU KHÔNG CÒN BOOKING TƯƠNG LAI
    // → LUÔN HIỆN 1 HÀNG TRỐNG
    // ----------------------------------------------------------

    if (futureEvents.length === 0) {
      setEvents([
        {
          eventName: "",
          eventDate: "",
          orderValue: "",
          repeat: false,
        },
      ]);

      setOrderValue("");
    } else {
      setEvents(futureEvents);

      setOrderValue(String(calculateTotalOrderValue(futureEvents)));
    }

    // ----------------------------------------------------------
    // CASHBACK
    // ----------------------------------------------------------

    setCashbackPhone(getRawPhone(initialData.cashback_phone || ""));

    setCashback(initialData.cashback ?? 0);

    // ----------------------------------------------------------
    // MEMBER
    // ----------------------------------------------------------

    const loadedTier = initialData.member_tier ?? "";

    setMemberTier(loadedTier ? String(loadedTier) : "");

    setMemberPercent(getMemberPercent(loadedTier) ? String(getMemberPercent(loadedTier)) : "");

    // ----------------------------------------------------------
    // REFERRAL
    // ----------------------------------------------------------

    setReferralPhone(getRawPhone(initialData.referral_phone || ""));

    setReferralName(initialData.referral_name || "");

    // ----------------------------------------------------------
    // NOTE
    // ----------------------------------------------------------

    setNote(initialData.note || "");
  }, [initialData]);

  // ============================================================
  // EVENT CHANGE
  // ============================================================

  const handleEventChange = (index, field, value) => {
    setEvents((prev) => {
      const updated = prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      );

      // --------------------------------------------------------
      // TỰ TÍNH TỔNG GIÁ TRỊ BOOKING
      // --------------------------------------------------------

      setOrderValue(String(calculateTotalOrderValue(updated)));

      return updated;
    });
  };

  // ============================================================
  // CHECKBOX EVENT
  //
  // TÍCH → mở dòng mới
  // BỎ TÍCH → xóa dòng kế tiếp
  // ============================================================

  const handleEventRepeat = (index, checked) => {
    setEvents((prev) => {
      const updated = [...prev];

      if (checked) {
        updated[index] = {
          ...updated[index],
          repeat: true,
        };

        if (index === updated.length - 1) {
          updated.push({
            eventName: "",
            eventDate: "",
            orderValue: "",
            repeat: false,
          });
        }

        return updated;
      }

      updated[index] = {
        ...updated[index],
        repeat: false,
      };

      if (index + 1 < updated.length) {
        updated.splice(index + 1, 1);
      }

      setOrderValue(String(calculateTotalOrderValue(updated)));

      return updated;
    });
  };

  // ============================================================
  // TÌM NGƯỜI PR
  // ============================================================

  const findReferral = async (value) => {
    const input = String(value ?? "").trim();

    if (!input) {
      setReferralName("");
      return;
    }

    const phoneNumber = getRawPhone(input);

    try {
      let query = supabase.from("customer").select("customer_name, phone");

      if (phoneNumber.length === 10) {
        query = query.eq("phone", phoneNumber);
      } else {
        query = query.ilike("customer_name", `%${input}%`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        throw error;
      }

      if (data?.customer_name) {
        setReferralName(formatName(data.customer_name));
      } else {
        setReferralName("");
      }
    } catch (error) {
      console.error("❌ Lỗi tìm người PR:", error);

      setReferralName("");
    }
  };

  // ============================================================
  // NHẬP NGƯỜI PR
  // ============================================================

  const handleReferralChange = (e) => {
    const value = e.target.value;

    setReferralName("");

    const digits = getRawPhone(value);

    if (digits.length > 0 && /^[\d.\s]+$/.test(value)) {
      const phoneNumber = digits.slice(0, 10);

      setReferralPhone(phoneNumber);

      if (phoneNumber.length === 10) {
        findReferral(phoneNumber);
      }

      return;
    }

    setReferralPhone(value);

    if (value.trim()) {
      findReferral(value);
    }
  };

  // ============================================================
  // TÍNH % THEO BẬC
  //
  // 1 → 3%
  // 2 → 6%
  // 3 → 9%
  // 4 → 12%
  // 5 → 15%
  // ============================================================

  const getMemberPercent = (tier) => {
    const tierNumber = Number(String(tier ?? "").replace(/\D/g, ""));

    const percentMap = {
      1: 3,
      2: 6,
      3: 9,
      4: 12,
      5: 15,
    };

    return percentMap[tierNumber] || 0;
  };

  const handleMemberTierChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);

    const percent = getMemberPercent(value);

    setMemberTier(value);

    setMemberPercent(percent ? String(percent) : "");
  };

  // ============================================================
  // TÍNH CASHBACK
  //
  // Tổng giá trị booking × % của SĐT Cashback
  // ============================================================

  const calculateCashback = async (phoneNumber, currentOrderValue) => {
    const rawPhone = getRawPhone(phoneNumber);

    if (rawPhone.length !== 10) {
      setCashback(0);
      return;
    }

    try {
      const { data, error } = await supabase.from("customer").select("member_percent, member_tier").eq("phone", rawPhone).limit(1).maybeSingle();

      if (error) {
        throw error;
      }

      let percent = Number(data?.member_percent) || 0;

      if (!percent && data?.member_tier) {
        percent = getMemberPercent(data.member_tier);
      }

      const order = Number(getRawMoney(currentOrderValue)) || 0;

      setCashback((order * percent) / 100);
    } catch (error) {
      console.error("❌ Lỗi tra hạng Cashback:", error);

      setCashback(0);
    }
  };

  // ============================================================
  // NHẬP SĐT CASHBACK
  // ============================================================

  const handleCashbackPhoneChange = (e) => {
    const value = getRawPhone(e.target.value);

    setCashbackPhone(value);

    calculateCashback(value, orderValue);
  };

  // ============================================================
  // GIÁ TRỊ ĐƠN THAY ĐỔI
  // ============================================================

  useEffect(() => {
    if (getRawPhone(cashbackPhone).length !== 10) {
      setCashback(0);
      return;
    }

    calculateCashback(cashbackPhone, orderValue);
  }, [orderValue, cashbackPhone]);

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    if (!customerName.trim()) {
      alert("Vui lòng nhập tên khách hàng!");
      return;
    }

    // ----------------------------------------------------------
    // TÁCH EVENT QUÁ KHỨ / HIỆN TẠI / TƯƠNG LAI
    // ----------------------------------------------------------

    const currentEvents = [];
    const newHistory = [];

    events.forEach((item, index) => {
      const eventName = String(item.eventName ?? "").trim();

      const eventDate = String(item.eventDate ?? "");

      const rawValue = getRawMoney(item.orderValue);

      const eventValue = Number(rawValue) || 0;

      // ------------------------------------------------------
      // HÀNG HOÀN TOÀN TRỐNG
      // ------------------------------------------------------

      if (!eventName && !eventDate && !eventValue) {
        return;
      }

      // ------------------------------------------------------
      // ĐÃ QUA NGÀY → HISTORY
      // ------------------------------------------------------

      if (eventDate && isPastEvent(eventDate)) {
        newHistory.push({
          id: `event-${Date.now()}-${index}`,

          event_name: eventName,

          event_date: eventDate,

          order_value: eventValue,
        });

        return;
      }

      // ------------------------------------------------------
      // HÔM NAY / TƯƠNG LAI
      // ------------------------------------------------------

      currentEvents.push({
        eventName,
        eventDate,
        orderValue: eventValue,
        repeat: Boolean(item.repeat),
      });
    });

    // ----------------------------------------------------------
    // HISTORY
    // ----------------------------------------------------------

    const mergedHistory = [...history, ...newHistory];

    const uniqueHistory = [];

    mergedHistory.forEach((item) => {
      const duplicate = uniqueHistory.some(
        (existing) =>
          existing.event_name === item.event_name &&
          existing.event_date === item.event_date &&
          Number(existing.order_value) === Number(item.order_value),
      );

      if (!duplicate) {
        uniqueHistory.push(item);
      }
    });

    const finalHistory = sortHistory(uniqueHistory);

    // ----------------------------------------------------------
    // NẾU KHÔNG CÒN EVENT HIỆN TẠI
    // → GIỮ 1 EVENT TRỐNG
    // ----------------------------------------------------------

    const finalEvents =
      currentEvents.length > 0
        ? currentEvents
        : [
            {
              eventName: "",
              eventDate: "",
              orderValue: "",
              repeat: false,
            },
          ];

    // ----------------------------------------------------------
    // TỔNG BOOKING HIỆN TẠI
    // ----------------------------------------------------------

    const finalOrderValue = calculateTotalOrderValue(currentEvents);

    // ----------------------------------------------------------
    // EVENT CHÍNH
    //
    // Nếu không có booking hiện tại:
    // gửi "" thay vì null để không vi phạm NOT NULL.
    // ----------------------------------------------------------

    const firstEvent = currentEvents[0] || {
      eventName: "",
      eventDate: "",
      orderValue: 0,
      repeat: false,
    };

    // ----------------------------------------------------------
    // FORM DATA
    // ----------------------------------------------------------

    const formData = {
      id: initialData?.id || null,

      customer_name: formatName(customerName),

      phone: getRawPhone(phone),

      event_name: firstEvent.eventName,

      event_date: firstEvent.eventDate || "",

      repeat_event: currentEvents.length > 1,

      events: finalEvents,

      order_value: finalOrderValue,

      cashback_phone: getRawPhone(cashbackPhone),

      cashback: Number(cashback) || 0,

      member_tier: Number(memberTier) || 0,

      member_percent: getMemberPercent(memberTier),

      referral_phone: getRawPhone(referralPhone),

      referral_name: referralName || "",

      note: note.trim(),

      history: finalHistory,

      is_active: initialData?.is_active ?? true,
    };

    // ----------------------------------------------------------
    // CHECK ONSAVE
    // ----------------------------------------------------------

    if (typeof onSave !== "function") {
      alert("Không thể lưu khách hàng.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu khách hàng.");
      }

      onClose();
    } catch (error) {
      console.error("❌ CustomerPopup save error:", error);

      alert(`Không thể lưu khách hàng:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      {/* TÊN KHÁCH HÀNG */}

      <div className="popup-row">
        <label className="popup-label">Tên khách hàng</label>

        <input className="popup-input" value={customerName} onChange={(e) => setCustomerName(formatName(e.target.value))} disabled={isSaving} />
      </div>

      {/* SỐ ĐIỆN THOẠI */}

      <div className="popup-row">
        <label className="popup-label">Số điện thoại</label>

        <input
          className="popup-input"
          inputMode="numeric"
          value={formatPhone(phone)}
          onChange={(e) => setPhone(getRawPhone(e.target.value))}
          disabled={isSaving}
        />
      </div>

      {/* SỰ KIỆN */}

      {events.map((event, index) => (
        <div className="popup-row" key={index}>
          <label className="popup-label">Sự kiện</label>

          <div className="popup-inline">
            <input
              className="popup-input"
              placeholder="Sự kiện"
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

            <input
              className="popup-input"
              inputMode="numeric"
              placeholder="Giá trị đơn"
              value={formatMoneyInput(event.orderValue)}
              onChange={(e) => handleEventChange(index, "orderValue", getRawMoney(e.target.value))}
              disabled={isSaving}
            />

            <label className="popup-checkbox">
              <input type="checkbox" checked={event.repeat} onChange={(e) => handleEventRepeat(index, e.target.checked)} disabled={isSaving} />
            </label>
          </div>
        </div>
      ))}

      {/* GIÁ TRỊ ĐƠN / CASHBACK */}

      <div className="popup-row">
        <label className="popup-label">Giá trị đơn / Cashback</label>

        <div className="popup-inline">
          <input className="popup-input" inputMode="numeric" placeholder="Giá trị đơn" value={formatMoneyInput(orderValue)} readOnly />

          <input className="popup-input" value={`${formatMoneyInput(cashback)}đ`} readOnly />
        </div>
      </div>

      {/* HẠNG THÀNH VIÊN / NGƯỜI PR */}

      <div className="popup-row">
        <label className="popup-label">Hạng thành viên / Người PR</label>

        <div className="popup-inline">
          <input
            className="popup-input"
            inputMode="numeric"
            placeholder="Bậc"
            value={memberTier}
            onChange={handleMemberTierChange}
            disabled={isSaving}
          />

          <input
            className="popup-input"
            placeholder="Tên hoặc SĐT người PR"
            inputMode="text"
            value={referralName || (referralPhone ? formatPhone(referralPhone) : "")}
            onChange={handleReferralChange}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* GHI CHÚ */}

      <div className="popup-row">
        <label className="popup-label">Ghi chú</label>

        <textarea className="popup-input popup-textarea" value={note} onChange={(e) => setNote(e.target.value)} disabled={isSaving} />
      </div>

      {/* LỊCH SỬ BOOKING */}

      {history.length > 0 && (
        <div className="popup-row">
          <label className="popup-label">Lịch sử Booking</label>

          <div className="popup-history">
            <ol>
              {history.map((item, index) => (
                <li key={item.id || index}>
                  {item.event_name || ""}
                  {" - "}
                  {item.event_date || ""}
                  {" - "}
                  {formatMoneyInput(item.order_value)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* FOOTER */}

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
