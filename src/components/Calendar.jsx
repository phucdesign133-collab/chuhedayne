import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon, Clock, Users, Plus, Edit2, Trash2, X, DollarSign } from "lucide-react";
import { supabase } from "./utils/supabaseClient";
import "../css/Calendar.css";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_FORM = {
  title: "",
  category: "",
  date: "",
  time_slot: "",
  staff_note: "Nhiều",
  amount: "",
};

export default function Calendar({ isAdmin = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthBookings, setMonthBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showTasks, setShowTasks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatTimeSlot = (value) => {
    if (!value) return "Cả ngày";

    const raw = String(value).replace(/\D/g, "");

    // 0800
    if (raw.length === 4) {
      return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
    }

    // 08001200
    if (raw.length === 8) {
      return `${raw.slice(0, 2)}:${raw.slice(2, 4)} - ${raw.slice(4, 6)}:${raw.slice(6, 8)}`;
    }

    // Đã có format đẹp
    if (String(value).includes(":")) {
      return value;
    }

    return value;
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "0 đ";
    return `${Number(value).toLocaleString("vi-VN")} đ`;
  };

  const getStaffBadgeStyle = (status) => {
    const value = (status || "").toLowerCase().trim();

    if (value.includes("ít") || value.includes("hết")) {
      return {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fca5a5",
      };
    }

    if (value.includes("nhiều")) {
      return {
        backgroundColor: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #86efac",
      };
    }

    return {
      backgroundColor: "#fef9c3",
      color: "#ca8a04",
      border: "1px solid #fde047",
    };
  };

  const fetchMonthBookings = async () => {
    try {
      setLoading(true);

      const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDayNumber = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDayNumber).padStart(2, "0")}`;

      const { data, error } = await supabase.from("bookings").select("*").gte("date", firstDay).lte("date", lastDay);

      if (error) throw error;

      setMonthBookings(data || []);
    } catch (err) {
      console.error("Lỗi tải lịch booking:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthBookings();
  }, [currentDate]);

  /* =========================
     MONTH NAVIGATION
  ========================= */

  const handlePrevMonth = () => {
    const date = new Date(year, month - 1, 1);
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleNextMonth = () => {
    const date = new Date(year, month + 1, 1);
    setCurrentDate(date);
    setSelectedDate(date);
  };

  /* =========================
     DATE SELECTION
  ========================= */

  const handleSelectDate = (date) => {
    const differentMonth = date.getMonth() !== month || date.getFullYear() !== year;

    if (differentMonth) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    setSelectedDate(date);

    // Không tự mở Schedule & Tasks.
    // Chỉ mũi tên mới điều khiển showTasks.
  };

  /* =========================
     ADMIN MODAL
  ========================= */

  const handleOpenAddModal = () => {
    setEditingBooking(null);
    setFormData({
      ...EMPTY_FORM,
      date: getDateString(selectedDate),
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (booking, e) => {
    e.stopPropagation();

    setEditingBooking(booking);

    setFormData({
      title: booking.title || "",
      category: booking.category || "",
      date: booking.date || "",
      time_slot: booking.time_slot || "",
      staff_note: booking.staff_note || "Nhiều",
      amount: booking.amount !== null && booking.amount !== undefined ? booking.amount : "",
    });

    setShowModal(true);
  };

  const handleTimeSlotChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);

    let value = raw;

    if (raw.length > 4) {
      value = `${raw.slice(0, 4)} - ${raw.slice(4, 8)}`;
    }

    if (raw.length >= 4 && raw.length <= 4) {
      value = raw;
    }

    setFormData((prev) => ({
      ...prev,
      time_slot: value,
    }));
  };

  const handleAmountChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      amount: e.target.value.replace(/\D/g, ""),
    }));
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time_slot: formData.time_slot,
        staff_note: formData.staff_note,
        amount: formData.amount !== "" ? Number(formData.amount) : 0,
      };

      if (editingBooking) {
        const { error } = await supabase.from("bookings").update(payload).eq("id", editingBooking.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("bookings").insert([payload]);

        if (error) throw error;
      }

      setShowModal(false);
      fetchMonthBookings();
    } catch (err) {
      alert("Lỗi lưu booking: " + err.message);
    }
  };

  const handleDeleteBooking = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch booking này không?")) {
      return;
    }

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;

      fetchMonthBookings();
    } catch (err) {
      alert("Lỗi xóa booking: " + err.message);
    }
  };

  /* =========================
     CALENDAR CELLS
  ========================= */

  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(year, month, index - firstDayIndex + 1);
    const dateString = getDateString(date);

    return {
      id: dateString,
      date,
      dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
      hasEvent: monthBookings.some((item) => item.date === dateString),
    };
  });

  const selectedDateStr = getDateString(selectedDate);

  const currentDayTasks = monthBookings.filter((item) => item.date === selectedDateStr);

  return (
    <div className="calendar-module-container">
      {/* HEADER */}
      <div className="calendar-header-nav">
        <div className="calendar-month-label">
          {MONTH_NAMES[month]} {year}
        </div>

        <div className="calendar-nav-actions">
          {isAdmin && (
            <button className="cal-add-btn" onClick={handleOpenAddModal}>
              <Plus size={16} />
              Thêm lịch
            </button>
          )}

          <div className="calendar-nav-buttons">
            <button className="cal-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={18} />
            </button>

            <button className="cal-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* WEEK DAYS */}
      <div className="calendar-weekdays-grid">
        {DAY_NAMES.map((day) => (
          <div key={day} className="cal-weekday-item">
            {day}
          </div>
        ))}
      </div>

      {/* DAYS */}
      <div className="calendar-days-grid">
        {calendarCells.map((cell) => {
          const isSelected = selectedDate.toDateString() === cell.date.toDateString();

          return (
            <div
              key={cell.id}
              className={["cal-day-cell", !cell.isCurrentMonth && "other-month", isSelected && "selected"].filter(Boolean).join(" ")}
              onClick={() => handleSelectDate(cell.date)}
            >
              <span className="cal-day-num">{cell.dayNumber}</span>

              {cell.hasEvent && <span className="cal-event-dot" />}
            </div>
          );
        })}
      </div>

      {/* SCHEDULE & TASKS */}
      <div className="calendar-tasks-section">
        <button className="calendar-tasks-header" onClick={() => setShowTasks((prev) => !prev)}>
          <div className="calendar-tasks-title-group">
            <h3>Schedule & Tasks ({formatDisplayDate(selectedDateStr)})</h3>

            <span className="task-count-badge">{currentDayTasks.length} shows</span>
          </div>

          <ChevronDown size={18} className={`calendar-collapse-icon ${showTasks ? "open" : ""}`} />
        </button>

        {showTasks && (
          <div className="calendar-tasks-content">
            {loading ? (
              <div className="calendar-loading-text">Đang tải lịch trình...</div>
            ) : currentDayTasks.length === 0 ? (
              <div className="calendar-no-tasks">Không có lịch show hoặc sự kiện nào trong ngày này.</div>
            ) : (
              <div className="calendar-tasks-list">
                {currentDayTasks.map((task, index) => {
                  const staffStatus = task.staff_note || "Nhiều";

                  return (
                    <div key={task.id || index} className="calendar-task-card">
                      <div className="cal-task-main-info">
                        <div className="cal-task-icon-box">
                          <CalendarIcon size={18} />
                        </div>

                        <div className="cal-task-detail">
                          <span className="cal-task-type">{task.category || "Event Show"}</span>

                          <h4 className="cal-task-title">{task.title || "Sự kiện"}</h4>

                          <div className="cal-task-meta-row">
                            <div className="cal-task-time">
                              <Clock size={14} />
                              <span>{formatTimeSlot(task.time_slot)}</span>
                            </div>

                            {isAdmin && (
                              <div className="cal-task-amount">
                                <DollarSign size={14} />
                                <span>{formatCurrency(task.amount)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="cal-admin-actions">
                            <button className="cal-action-btn edit" onClick={(e) => handleOpenEditModal(task, e)}>
                              <Edit2 size={14} />
                            </button>

                            <button className="cal-action-btn delete" onClick={(e) => handleDeleteBooking(task.id, e)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="cal-staff-availability-footer" style={getStaffBadgeStyle(staffStatus)}>
                        <Users size={14} />

                        <span>
                          Nhân sự còn lại: <strong>{staffStatus}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADMIN MODAL */}
      {isAdmin && showModal && (
        <div className="cal-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h3>{editingBooking ? "Chỉnh sửa lịch" : "Thêm lịch"}</h3>

              <button className="cal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="cal-form" onSubmit={handleSaveBooking}>
              <div className="cal-form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="cal-form-group">
                <label>Danh mục</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="cal-form-group">
                <label>Ngày</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="cal-form-group">
                <label>Khung giờ</label>
                <input type="text" placeholder="0800 hoặc 08001200" value={formData.time_slot} onChange={handleTimeSlotChange} />
              </div>

              <div className="cal-form-group">
                <label>Nhân sự</label>
                <input
                  type="text"
                  value={formData.staff_note}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      staff_note: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="cal-form-group">
                <label>Số tiền</label>
                <input type="text" inputMode="numeric" value={formData.amount} onChange={handleAmountChange} />
              </div>

              <div className="cal-modal-buttons">
                <button type="button" className="cal-btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>

                <button type="submit" className="cal-btn-save">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
