import React, { useEffect, useState } from "react";

export default function IncomePopup({ initialData = null, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("event");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
  // DDMMYYYY → DD/MM/YYYY
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
  // DATE
  // DD/MM/YYYY → YYYY-MM-DD
  // ============================================================

  const parseDateToISO = (value) => {
    const match = String(value || "").match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

    if (!match) return null;

    const [, day, month, year] = match;

    const dateObject = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    if (
      dateObject.getFullYear() !== Number(year) ||
      dateObject.getMonth() !== Number(month) - 1 ||
      dateObject.getDate() !== Number(day)
    ) {
      return null;
    }

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // DATE
  // YYYY-MM-DD → DD/MM/YYYY
  // ============================================================

  const formatDateFromISO = (value) => {
    const match = String(value || "").match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

    if (!match) return "";

    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
  };

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setTitle("");
      setCategory("event");
      setDate("");
      setAmount("");
      setStaffNote("");
      return;
    }

    setTitle(initialData.title || "");

    setCategory(initialData.source || "event");

    setDate(formatDateFromISO(initialData.date));

    setAmount(
      initialData.received !== null &&
        initialData.received !== undefined
        ? String(initialData.received)
        : "",
    );

    setStaffNote(initialData.note || "");
  }, [initialData]);

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    // ----------------------------------------------------------
    // NỘI DUNG
    // ----------------------------------------------------------

    if (!title.trim()) {
      alert("Vui lòng nhập nội dung khoản thu!");
      return;
    }

    // ----------------------------------------------------------
    // SỐ TIỀN
    // ----------------------------------------------------------

    const rawAmount = getRawMoney(amount);

    if (!rawAmount || Number(rawAmount) <= 0) {
      alert("Vui lòng nhập số tiền thực nhận!");
      return;
    }

    // ----------------------------------------------------------
    // NGÀY
    // ----------------------------------------------------------

    const parsedDate = parseDateToISO(date);

    if (!parsedDate) {
      alert("Ngày không hợp lệ. Vui lòng nhập dạng DD/MM/YYYY.");
      return;
    }

    // ----------------------------------------------------------
    // ON SAVE
    // ----------------------------------------------------------

    if (typeof onSave !== "function") {
      alert("Không thể lưu khoản thu nhập.");
      return;
    }

    // ==========================================================
    // PAYLOAD CHUẨN CHO public.incomes
    // ==========================================================

    const formData = {
      id: initialData?.id || null,

      source: category,

      title: title.trim(),

      date: parsedDate,

      received: Number(rawAmount),

      note: staffNote.trim(),
    };

    console.log("📤 IncomePopup gửi Grid:", formData);

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu khoản thu nhập.");
      }

      onClose();
    } catch (error) {
      console.error("❌ IncomePopup save error:", error);

      alert(
        `Không thể lưu thu nhập:\n${
          error?.message || "Lỗi không xác định"
        }`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form">

      {/* NỘI DUNG */}
      <div className="popup-row">
        <label className="popup-label">
          Nội dung
        </label>

        <input
          className="popup-input"
          placeholder="Ví dụ: Show chị A"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* NGUỒN THU */}
      <div className="popup-row">
        <label className="popup-label">
          Nguồn thu
        </label>

        <select
          className="popup-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSaving}
        >
          <option value="event">
            Sự kiện
          </option>

          <option value="design">
            Thiết kế
          </option>

          <option value="taxi">
            Taxi
          </option>

          <option value="other">
            Khác
          </option>
        </select>
      </div>

      {/* NGÀY */}
      <div className="popup-row">
        <label className="popup-label">
          Ngày
        </label>

        <div className="popup-inline">
          <input
            className="popup-input"
            inputMode="numeric"
            placeholder="DD/MM/YYYY"
            value={date}
            onChange={(e) =>
              setDate(formatDateInput(e.target.value))
            }
            disabled={isSaving}
          />
        </div>
      </div>

      {/* THỰC NHẬN */}
      <div className="popup-row">
        <label className="popup-label">
          Thực nhận
        </label>

        <input
          className="popup-input"
          inputMode="numeric"
          placeholder="Số tiền thực nhận"
          value={formatMoneyInput(amount)}
          onChange={(e) =>
            setAmount(getRawMoney(e.target.value))
          }
          disabled={isSaving}
        />
      </div>

      {/* GHI CHÚ */}
      <div className="popup-row">
        <label className="popup-label">
          Ghi chú
        </label>

        <textarea
          className="popup-input popup-textarea"
          value={staffNote}
          onChange={(e) =>
            setStaffNote(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* FOOTER */}
      <div className="popup-footer">
        <button
          type="submit"
          className="popup-submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Đang đẩy lên mây..."
            : "Lưu lại"}
        </button>
      </div>

    </form>
  );
}