// src/components/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Plus, Edit2, Trash2, X, DollarSign } from 'lucide-react';
import '../css/Calendar.css';

export default function Calendar({ isAdmin = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthBookings, setMonthBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time_slot: '',
    staff_note: 'Nhiều',
    amount: ''
  });

  useEffect(() => {
    fetchMonthBookings();
  }, [currentDate]);

  const fetchMonthBookings = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', firstDayStr)
        .lte('date', lastDayStr);

      if (error) throw error;
      setMonthBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải lịch booking:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenAddModal = () => {
    const defaultDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setEditingBooking(null);
    setFormData({
      title: '',
      category: '',
      date: defaultDateStr,
      time_slot: '',
      staff_note: 'Nhiều',
      amount: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (booking, e) => {
    e.stopPropagation();
    setEditingBooking(booking);
    setFormData({
      title: booking.title || '',
      category: booking.category || '',
      date: booking.date || '',
      time_slot: booking.time_slot || '',
      staff_note: booking.staff_note || 'Nhiều',
      amount: booking.amount !== null && booking.amount !== undefined ? booking.amount : ''
    });
    setShowModal(true);
  };

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const handleTimeSlotChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (val.length > 0) {
      formatted += val.substring(0, 2);
    }
    if (val.length >= 3) {
      formatted += ':' + val.substring(2, 4);
    }
    if (val.length >= 5) {
      formatted += ' - ' + val.substring(4, 6);
    }
    if (val.length >= 7) {
      formatted += ':' + val.substring(6, 8);
    }
    setFormData({ ...formData, time_slot: formatted });
  };

  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, amount: rawVal });
  };

  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
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
        amount: formData.amount !== '' ? Number(formData.amount) : 0
      };

      if (editingBooking) {
        const { error } = await supabase
          .from('bookings')
          .update(payload)
          .eq('id', editingBooking.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchMonthBookings();
    } catch (err) {
      alert('Lỗi lưu booking: ' + err.message);
    }
  };

  const handleDeleteBooking = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch booking này không?')) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchMonthBookings();
      } catch (err) {
        alert('Lỗi xóa booking: ' + err.message);
      }
    }
  };

  const getStaffBadgeStyle = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('ít') || s.includes('hết')) {
      return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' };
    } else if (s.includes('nhiều')) {
      return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' };
    } else {
      return { backgroundColor: '#fef9c3', color: '#ca8a04', border: '1px solid #fde047' };
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ empty: true, id: `empty-${i}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = monthBookings.some(item => item.date === dateString);

    calendarCells.push({
      empty: false,
      dayNumber: d,
      dateString: dateString,
      dateObj: dateObj,
      hasEvent: hasEvent,
      id: dateString
    });
  }

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const currentDayTasks = monthBookings.filter(item => item.date === selectedDateStr);

  return (
    <div className="calendar-module-container">
      <div className="calendar-header-nav">
        <div className="calendar-month-label" style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {monthNames[month]} {year}
        </div>
        <div className="calendar-nav-actions">
          {isAdmin && (
            <button className="cal-add-btn" onClick={handleOpenAddModal}>
              <Plus size={16} /> Thêm lịch
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

      <div className="calendar-weekdays-grid">
        {dayNames.map((d, index) => (
          <div key={index} className="cal-weekday-item">{d}</div>
        ))}
      </div>

      <div className="calendar-days-grid">
        {calendarCells.map((cell) => {
          if (cell.empty) {
            return <div key={cell.id} className="cal-day-cell empty"></div>;
          }
          const isSelected = selectedDate.toDateString() === cell.dateObj.toDateString();
          return (
            <div 
              key={cell.id} 
              className={`cal-day-cell ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(cell.dateObj)}
            >
              <span className="cal-day-num">{cell.dayNumber}</span>
              {cell.hasEvent && <span className="cal-event-dot"></span>}
            </div>
          );
        })}
      </div>

      <div className="calendar-tasks-section">
        <div className="calendar-tasks-header">
          <h3>Schedule & Tasks ({formatDateToDisplay(selectedDateStr)})</h3>
          <span className="task-count-badge">{currentDayTasks.length} shows</span>
        </div>

        {loading ? (
          <div className="calendar-loading-text">Đang tải lịch trình...</div>
        ) : currentDayTasks.length === 0 ? (
          <div className="calendar-no-tasks">Không có lịch show hoặc sự kiện nào trong ngày này. Trống lịch toàn bộ.</div>
        ) : (
          <div className="calendar-tasks-list">
            {currentDayTasks.map((task, index) => {
              const staffStatus = task.staff_note || "Nhiều";
              const badgeStyle = getStaffBadgeStyle(staffStatus);

              return (
                <div key={task.id || index} className="calendar-task-card">
                  <div className="cal-task-main-info">
                    <div className="cal-task-icon-box">
                      <CalendarIcon size={18} />
                    </div>
                    <div className="cal-task-detail">
                      <span className="cal-task-type">{task.category || 'Event Show'}</span>
                      <h4 className="cal-task-title">{task.title || 'Sự kiện'}</h4>
                      
                      <div className="cal-task-meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '4px' }}>
                        <div className="cal-task-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> <span>{task.time_slot || 'Cả ngày'}</span>
                        </div>
                        {isAdmin && (
                          <div className="cal-task-amount" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#10b981' }}>
                            <DollarSign size={14} /> <span>{formatCurrency(task.amount)}</span>
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

                  <div className="cal-staff-availability-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '6px 10px', borderRadius: '6px', ...badgeStyle }}>
                    <Users size={14} />
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>Nhân sự còn lại: <strong>{staffStatus}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

     
    </div>
  );
}