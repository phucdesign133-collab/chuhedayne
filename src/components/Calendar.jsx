import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "./utils/supabaseClient";
import "../css/Calendar.css";

const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const DAY_NAMES = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const STAFF_STATUS_CONFIG = {
  Nhiều: {
    label: "Nhiều nhân sự",
    dot: "🟢",
  },
  Ít: {
    label: "Ít nhân sự",
    dot: "🟡",
  },
  Hết: {
    label: "Hết nhân sự",
    dot: "🔴",
  },
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthBookings, setMonthBookings] = useState([]);
  const [virtualBookings, setVirtualBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

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
    if (raw.length === 4) return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
    if (raw.length === 8) return `${raw.slice(0, 2)}:${raw.slice(2, 4)} - ${raw.slice(4, 6)}:${raw.slice(6, 8)}`;
    if (String(value).includes(":")) return value;
    return value;
  };

  const getVirtualBookingsForMonth = (date, realBookings = []) => {
    const bookings = [];
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(targetYear, targetMonth, day);
      const dayOfWeek = currentDay.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        continue;
      }

      const dateString = getDateString(currentDay);

      const hasRealBooking = realBookings.some((item) => item.date === dateString);

      if (hasRealBooking) {
        continue;
      }

      bookings.push({
        id: `virtual-${dateString}`,
        date: dateString,
        time_slot: "1800-2030",
        staff_note: "Ít",
        isVirtual: true,
      });
    }

    return bookings;
  };

  const generateVirtualBookings = (realBookings = monthBookings) => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentVirtualBookings = getVirtualBookingsForMonth(currentMonth, realBookings);
    const previousVirtualBookings = getVirtualBookingsForMonth(previousMonth, realBookings);

    setVirtualBookings([...previousVirtualBookings, ...currentVirtualBookings]);
  };

  const fetchMonthBookings = async () => {
    try {
      setLoading(true);

      const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDayNumber = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDayNumber).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .gte("date", firstDay)
        .lte("date", lastDay);

      if (error) throw error;

      const bookings = data || [];
      setMonthBookings(bookings);
      generateVirtualBookings(bookings);
    } catch (err) {
      console.error("Lỗi tải lịch booking:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateVirtualBookings();

    const interval = setInterval(() => {
      generateVirtualBookings();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMonthBookings();
  }, [currentDate]);

  useEffect(() => {
    generateVirtualBookings(monthBookings);
  }, [monthBookings]);

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

  const handleSelectDate = (date) => {
    const differentMonth = date.getMonth() !== month || date.getFullYear() !== year;

    if (differentMonth) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    setSelectedDate(date);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(year, month, index - firstDayIndex + 1);
    const dateString = getDateString(date);

    const realDayBookings = monthBookings.filter((item) => item.date === dateString);
    const virtualDayBookings = virtualBookings.filter((item) => item.date === dateString);

    const staffStatuses = ["Nhiều", "Ít", "Hết"].filter(
      (status) =>
        realDayBookings.some((item) => (item.staff_note || "").trim() === status) ||
        virtualDayBookings.some((item) => (item.staff_note || "").trim() === status)
    );

    return {
      id: dateString,
      date,
      dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
      staffStatuses,
    };
  });

  const selectedDateStr = getDateString(selectedDate);

  const currentDayBookings = [
    ...monthBookings.filter((item) => item.date === selectedDateStr),
    ...virtualBookings.filter((item) => item.date === selectedDateStr),
  ];

  const currentDayStatusGroups = ["Nhiều", "Ít", "Hết"]
    .map((status) => {
      const bookings = currentDayBookings.filter((item) => (item.staff_note || "").trim() === status);

      if (bookings.length === 0) return null;

      const timeSlots = bookings.map((item) => formatTimeSlot(item.time_slot));

      return {
        status,
        label: STAFF_STATUS_CONFIG[status].label,
        dot: STAFF_STATUS_CONFIG[status].dot,
        timeSlots,
        sortTime: bookings.reduce((earliest, item) => {
          const raw = String(item.time_slot || "").replace(/\D/g, "");
          const startTime = raw.length >= 4 ? Number(raw.slice(0, 4)) : 9999;
          return Math.min(earliest, startTime);
        }, 9999),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortTime - b.sortTime);

  return (
    <div className="calendar-module-container">
      <div className="calendar-header-nav">
        <div className="calendar-month-label">
          {MONTH_NAMES[month]}/{year}
        </div>

        <div className="calendar-nav-buttons">
          <button className="cal-nav-btn" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>

          <button className="cal-nav-btn" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays-grid">
        {DAY_NAMES.map((day) => (
          <div key={day} className="cal-weekday-item">
            {day}
          </div>
        ))}
      </div>

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

              {cell.staffStatuses.length > 0 && (
                <span className="cal-event-dots">
                  {cell.staffStatuses.map((status) => (
                    <span
                      key={status}
                      className={`cal-event-dot ${status === "Nhiều" ? "staff-many" : status === "Ít" ? "staff-few" : "staff-full"}`}
                    />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-tasks-section">
        <button className="calendar-tasks-header" onClick={() => setShowTasks((prev) => !prev)}>
          <div className="calendar-tasks-title-group">
            <h3>Khung giờ tập trung ({formatDisplayDate(selectedDateStr)})</h3>
          </div>

          <ChevronDown size={18} className={`calendar-collapse-icon ${showTasks ? "open" : ""}`} />
        </button>

        {showTasks && (
          <div className="calendar-tasks-content">
            {loading ? (
              <div className="calendar-loading-text">Đang tải lịch trình...</div>
            ) : currentDayStatusGroups.length === 0 ? (
              <div className="calendar-no-tasks">Ngày này chưa có lịch ghi nhận.</div>
            ) : (
              <div className="calendar-staff-summary-list">
                {currentDayStatusGroups.map((group) => (
                  <div key={group.status} className="calendar-staff-summary">
                    <span className="calendar-staff-summary-row">
                      <span className="calendar-summary-dot">{group.dot}</span>
                      <span>{group.label}</span>
                      <span className="calendar-staff-summary-time">(chỉ tập trung {group.timeSlots.join(" | ")})</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}