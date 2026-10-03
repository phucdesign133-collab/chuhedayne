import React, { useEffect, useState } from "react";

export default function BookingPopup({ onClose, onSave, initialData = null }) {
  const [program, setProgram] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [amount, setAmount] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [runner, setRunner] = useState("");
  const [outSPrice, setOutSPrice] = useState("");
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerZalo, setCustomerZalo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const formatDateInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const dateToDisplay = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (raw.includes("/")) return formatDateInput(raw);
    const parts = raw.slice(0, 10).split("-");
    if (parts.length !== 3) return raw;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    if (!initialData) {
      setProgram("");
      setTitle("");
      setCategory("");
      setDate("");
      setTimeSlot("");
      setAmount("");
      setStaffNote("");
      setRunner("");
      setOutSPrice("");
      setNote("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerZalo("");
      return;
    }
    setProgram(initialData.program || "");
    setTitle(initialData.title || "");
    setCategory(initialData.category || "");
    setDate(dateToDisplay(initialData.date));
    setTimeSlot(
      String(initialData.time_slot || "")
        .replace(/\D/g, "")
        .slice(0, 8),
    );
    setAmount(initialData.amount !== null && initialData.amount !== undefined ? String(initialData.amount) : "");
    setStaffNote(initialData.staff_note || "");
    setRunner(initialData.runner || "");
    setOutSPrice(initialData.outs_price !== null && initialData.outs_price !== undefined ? String(initialData.outs_price) : "");
    setNote(initialData.note || "");
    setCustomerName(initialData.customer_name || "");
    setCustomerPhone(initialData.customer_phone || "");
    setCustomerZalo(initialData.customer_zalo || "");
  }, [initialData]);
  const dateToDatabase = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (digits.length !== 8) return "";
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    return `${year}-${month}-${day}`;
  };
  const formatTimeInput = (value) => {
    const digits = String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)} - ${digits.slice(4, 6)}:${digits.slice(6, 8)}`;
  };
  const formatMoneyInput = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const getRawMoney = (value) => String(value ?? "").replace(/\D/g, "");
  const getRawPhone = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);
  const formatPhone = (value) => {
    const digits = getRawPhone(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };
  const isPhuc = runner.trim().toLowerCase() === "phúc";
  const showOutS = runner.trim() !== "" && !isPhuc;
  const billValue = Number(getRawMoney(amount)) || 0;
  const outSValue = Number(getRawMoney(outSPrice)) || 0;
  const receivedValue = isPhuc || !runner.trim() ? billValue : billValue - outSValue;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const databaseDate = dateToDatabase(date);
    if (!databaseDate) {
      alert("Vui lòng nhập ngày theo dạng DD/MM/YYYY.");
      return;
    }
    if (typeof onSave !== "function") {
      alert("Không thể lưu Booking.");
      return;
    }
    const normalizedCustomerName = customerName.trim();
    const normalizedCustomerPhone = getRawPhone(customerPhone);
    const normalizedCustomerZalo = customerZalo.trim();
    if (
      (normalizedCustomerName || normalizedCustomerPhone || normalizedCustomerZalo) &&
      (!normalizedCustomerName || (!normalizedCustomerPhone && !normalizedCustomerZalo))
    ) {
      alert("Khách hàng cần có tên và ít nhất SĐT hoặc Zalo.");
      return;
    }
    const formData = {
      id: initialData?.id || null,
      program: String(program ?? "").trim(),
      title: title.trim(),
      category: category.trim(),
      date: databaseDate,
      time_slot: timeSlot.trim(),
      amount: amount !== "" ? Number(getRawMoney(amount)) || 0 : 0,
      staff_note: staffNote.trim() || null,
      runner: runner.trim() || null,
      outs_price: showOutS ? Number(getRawMoney(outSPrice)) || 0 : 0,
      note: note.trim() || null,
      customer_name: normalizedCustomerName || null,
      customer_phone: normalizedCustomerPhone || null,
      customer_zalo: normalizedCustomerZalo || null,
    };
    setIsSaving(true);
    try {
      const result = await onSave(formData);
      if (!result || result.success !== true) throw result?.error || new Error("Không thể lưu Booking.");
      onClose();
    } catch (error) {
      console.error("❌ BookingPopup save error:", error);
      alert(`Không thể lưu Booking:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="popup-form">
      <div className="popup-row">
        <label className="popup-label">Chương trình</label>
        <input
          className="popup-input"
          name="program"
          placeholder="Chương trình"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="popup-row">
        <label className="popup-label">Địa điểm</label>
        <input className="popup-input" placeholder="Địa điểm" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} />
      </div>
      <div className="popup-row">
        <label className="popup-label">Công việc</label>
        <input className="popup-input" placeholder="Công việc" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSaving} />
      </div>
      <div className="popup-row">
        <label className="popup-label">Ngày</label>
        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={formatDateInput(date)}
          onChange={(e) => setDate(formatDateInput(e.target.value))}
          disabled={isSaving}
        />
      </div>
      <div className="popup-row">
        <label className="popup-label">Khung giờ</label>
        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="1800 hoặc 13001500"
          value={formatTimeInput(timeSlot)}
          onChange={(e) => setTimeSlot(e.target.value.replace(/\D/g, "").slice(0, 8))}
          disabled={isSaving}
        />
      </div>
      <div className="popup-row">
        <label className="popup-label">Bill</label>
        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Bill"
          value={formatMoneyInput(amount)}
          onChange={(e) => setAmount(getRawMoney(e.target.value))}
          disabled={isSaving}
        />
      </div>
      <div className="popup-row">
        <label className="popup-label">Người chạy / OutS</label>
        <div className="popup-inline">
          <input
            className="popup-input"
            placeholder="Người chạy"
            value={runner}
            onChange={(e) => setRunner(e.target.value)}
            disabled={isSaving}
            style={showOutS ? { flex: "1 1 0", minWidth: 0 } : { width: "100%" }}
          />
          {showOutS && (
            <input
              className="popup-input"
              inputMode="numeric"
              placeholder="OutS"
              value={formatMoneyInput(outSPrice)}
              onChange={(e) => setOutSPrice(getRawMoney(e.target.value))}
              disabled={isSaving}
              style={{ flex: "1 1 0", minWidth: 0 }}
            />
          )}
        </div>
      </div>
      <div className="popup-row">
        <label className="popup-label">Thực nhận</label>
        <input className="popup-input" value={formatMoneyInput(receivedValue)} readOnly disabled={isSaving} />
      </div>
      <div className="popup-row">
        <label className="popup-label">Note</label>
        <textarea className="popup-input" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} disabled={isSaving} />
      </div>
      <div className="popup-row">
        <label className="popup-label">Khách / Liên hệ</label>
        <div className="popup-inline">
          <input
            className="popup-input"
            placeholder="Tên khách"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isSaving}
          />
          <input
            className="popup-input"
            inputMode="numeric"
            placeholder="SĐT khách"
            value={formatPhone(customerPhone)}
            onChange={(e) => setCustomerPhone(getRawPhone(e.target.value))}
            disabled={isSaving}
          />
          <input
            className="popup-input"
            placeholder="Zalo khách"
            value={customerZalo}
            onChange={(e) => setCustomerZalo(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="popup-row">
        <label className="popup-label">Nhân sự còn lại</label>
        <div className="popup-inline">
          {["Hết", "Ít", "Nhiều"].map((option) => (
            <label className="popup-checkbox" key={option}>
              <input
                type="radio"
                name="booking-staff-note"
                value={option}
                checked={staffNote === option}
                onChange={(e) => setStaffNote(e.target.value)}
                disabled={isSaving}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
