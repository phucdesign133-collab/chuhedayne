import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "./utils/supabaseClient";
import "../css/Calendar.css";

const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const DAY_NAMES = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const getDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getBookingDateString = (item) => String(item?.date || "").slice(0, 10);

const getVirtualBookingsForMonth = (date, realBookings = []) => {
  const bookings = [];
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = new Date(targetYear, targetMonth, day);
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) continue;

    const dateString = getDateString(currentDay);
    const hasRealBooking = realBookings.some((item) => getBookingDateString(item) === dateString);
    if (hasRealBooking) continue;

    bookings.push({
      id: `virtual-${dateString}`,
      date: dateString,
      time_slot: "1700-2030",
      staff_note: "Ít",
      isVirtual: true,
    });
  }

  return bookings;
};

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
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const fetchMonthBookings = useCallback(async () => {
    try {
      const visibleFirstDay = new Date(year, month, 1);
      const visibleLastDay = new Date(year, month + 1, 0);

      const now = new Date();
      const virtualFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const virtualLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const firstDay = getDateString(visibleFirstDay < virtualFirstDay ? visibleFirstDay : virtualFirstDay);

      const lastDay = getDateString(visibleLastDay > virtualLastDay ? visibleLastDay : virtualLastDay);

      const { data, error } = await supabase.from("bookings").select("*").gte("date", firstDay).lte("date", lastDay);

      if (error) throw error;

      const allBookings = data || [];

      const visibleBookings = allBookings.filter((item) => {
        const bookingDate = getBookingDateString(item);
        return bookingDate >= getDateString(visibleFirstDay) && bookingDate <= getDateString(visibleLastDay);
      });

      setMonthBookings(visibleBookings);

      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentVirtualBookings = getVirtualBookingsForMonth(currentMonth, allBookings);
      const previousVirtualBookings = getVirtualBookingsForMonth(previousMonth, allBookings);
      setVirtualBookings([...previousVirtualBookings, ...currentVirtualBookings]);
    } catch (err) {
      console.error("Lỗi tải lịch booking:", err.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchMonthBookings, 0);
    const interval = window.setInterval(fetchMonthBookings, 60000);

    return () => {
      window.clearTimeout(initialFetch);
      window.clearInterval(interval);
    };
  }, [fetchMonthBookings]);

  const handlePrevMonth = () => {
    const date = new Date(year, month - 1, 1);
    setLoading(true);
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleNextMonth = () => {
    const date = new Date(year, month + 1, 1);
    setLoading(true);
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleSelectDate = (date) => {
    const differentMonth = date.getMonth() !== month || date.getFullYear() !== year;

    if (differentMonth) {
      setLoading(true);
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    setSelectedDate(date);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCellCount = Math.ceil((firstDayIndex + new Date(year, month + 1, 0).getDate()) / 7) * 7;
  const calendarCells = Array.from({ length: calendarCellCount }, (_, index) => {
    const date = new Date(year, month, index - firstDayIndex + 1);
    const dateString = getDateString(date);

    const realDayBookings = monthBookings.filter((item) => getBookingDateString(item) === dateString);
    const virtualDayBookings = virtualBookings.filter((item) => item.date === dateString);

    const staffStatuses = ["Nhiều", "Ít", "Hết"].filter(
      (status) =>
        realDayBookings.some((item) => (item.staff_note || "").trim() === status) ||
        virtualDayBookings.some((item) => (item.staff_note || "").trim() === status),
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
    ...monthBookings.filter((item) => getBookingDateString(item) === selectedDateStr),
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
    <section className="calendar-module-container" aria-label="Lịch tập trung theo tháng">
      <div className="calendar-header-nav">
        <div>
          <p className="calendar-section-eyebrow">LỊCH THEO THÁNG</p>
          <h3 className="calendar-month-label">{MONTH_NAMES[month]} {year}</h3>
        </div>
        <div className="calendar-nav-buttons" aria-label="Chọn tháng">
          <button className="cal-nav-btn" type="button" onClick={handlePrevMonth} aria-label="Tháng trước">
            <ChevronLeft size={17} />
          </button>
          <button className="cal-nav-btn" type="button" onClick={handleNextMonth} aria-label="Tháng sau">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays-grid" aria-hidden="true">
        {DAY_NAMES.map((day) => <div key={day} className="cal-weekday-item">{day}</div>)}
      </div>

      <div className="calendar-days-grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
        {calendarCells.map((cell) => {
          const isSelected = selectedDate.toDateString() === cell.date.toDateString();
          const dateLabel = cell.date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const statusLabel = cell.staffStatuses.length ? `, ${cell.staffStatuses.join(", ")}` : "";

          return (
            <button
              key={cell.id}
              type="button"
              className={["cal-day-cell", !cell.isCurrentMonth && "other-month", isSelected && "selected"].filter(Boolean).join(" ")}
              onClick={() => handleSelectDate(cell.date)}
              aria-label={`${dateLabel}${statusLabel}`}
              aria-pressed={isSelected}
            >
              <span className="cal-day-num">{cell.dayNumber}</span>
              {cell.staffStatuses.length > 0 && (
                <span className="cal-event-dots" aria-hidden="true">
                  {cell.staffStatuses.map((status) => (
                    <span
                      key={status}
                      className={`cal-event-dot ${status === "Nhiều" ? "staff-many" : status === "Ít" ? "staff-few" : "staff-full"}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend" aria-label="Chú giải tình trạng nhân sự">
        <span><i className="legend-dot staff-many" /> Nhiều</span>
        <span><i className="legend-dot staff-few" /> Ít</span>
        <span><i className="legend-dot staff-full" /> Hết nhân sự</span>
      </div>

      <div className="calendar-tasks-section">
        <button
          className="calendar-tasks-header"
          type="button"
          onClick={() => setShowTasks((prev) => !prev)}
          aria-expanded={showTasks}
        >
          <span className="calendar-tasks-title-group">
            <span className="calendar-selected-day-label">NGÀY ĐÃ CHỌN</span>
            <span className="calendar-tasks-title">Khung giờ tập trung</span>
            <span className="calendar-selected-date">{formatDisplayDate(selectedDateStr)}</span>
          </span>
          <ChevronDown size={18} className={`calendar-collapse-icon ${showTasks ? "open" : ""}`} aria-hidden="true" />
        </button>

        {showTasks && (
          <div className="calendar-tasks-content" aria-live="polite">
            {loading ? (
              <div className="calendar-no-tasks">Đang cập nhật lịch tập trung...</div>
            ) : currentDayStatusGroups.length === 0 ? (
              <div className="calendar-no-tasks">Chưa có lịch tập trung trong ngày này.</div>
            ) : (
              <div className="calendar-staff-summary-list">
                {currentDayStatusGroups.map((group) => (
                  <div key={group.status} className="calendar-staff-summary">
                    <span className="calendar-staff-summary-row">
                      <i className={`calendar-summary-dot ${group.status === "Nhiều" ? "staff-many" : group.status === "Ít" ? "staff-few" : "staff-full"}`} aria-hidden="true" />
                      <span className="calendar-summary-label">{group.label}</span>
                      <span className="calendar-staff-summary-time">Tập trung {group.timeSlots.join(" | ")}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
