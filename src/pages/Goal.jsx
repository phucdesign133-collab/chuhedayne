import React, { useState, useEffect } from "react";
import "../css/Tab.css";
import { supabase } from "../components/utils/supabaseClient";
import GoalShort from "../components/GoalShort";
import GoalLong from "../components/GoalLong";
import WeeklyGoalGrid from "../components/WeeklyGoalGrid";
import GoalPopup from "../components/popup/GoalPopup";
import WeeklyGoalPopup from "../components/popup/WeeklyGoalPopup";

const getCurrentDateFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function Goal({ selectedFilter, isPopupOpen, setIsPopupOpen }) {
  const [selectedDate] = useState(getCurrentDateFormatted());
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [goalData, setGoalData] = useState([]);

  // State riêng cho Kế hoạch tuần
  const [weeklyData, setWeeklyData] = useState([]);
  const [editingWeekly, setEditingWeekly] = useState(null);
  const [editingWeeklyIndex, setEditingWeeklyIndex] = useState(null);

  const fetchGoals = async () => {
    try {
      const { data: mainData, error: mainError } = await supabase.from('goal_tables').select('*').eq('id', 'goals_main').single();
      if (mainError && mainError.code !== 'PGRST116') throw mainError;
      if (mainData) setGoalData(mainData.content || []);

      const { data: weekData, error: weekError } = await supabase.from('goal_tables').select('*').eq('id', 'goals_weekly').single();
      if (weekError && weekError.code !== 'PGRST116') throw weekError;
      if (weekData) setWeeklyData(weekData.content || []);
    } catch (err) {
      console.error("Lỗi tải Goals:", err);
    }
  };

  const syncGoals = async (updatedList) => {
    try {
      await supabase.from('goal_tables').upsert({ id: 'goals_main', content: updatedList });
    } catch (err) {
      console.error("Lỗi đồng bộ Goals:", err);
    }
  };

  const syncWeeklyGoals = async (updatedList) => {
    try {
      const { error } = await supabase
        .from('goal_tables')
        .upsert({ id: 'goals_weekly', content: updatedList });

      if (error) {
        console.error("Lỗi chi tiết từ Supabase khi syncWeekly:", error);
        alert("Lỗi lưu dữ liệu: " + error.message);
      } else {
        console.log("Đã đồng bộ thành công lên Supabase!");
      }
    } catch (err) {
      console.error("Lỗi đồng bộ Weekly Goals:", err);
    }
  };

  useEffect(() => {
    fetchGoals();
    const handleRealtimeChange = () => fetchGoals();
    window.addEventListener('supabase-data-changed', handleRealtimeChange);
    return () => window.removeEventListener('supabase-data-changed', handleRealtimeChange);
  }, []);

  const handleSaveGoal = (newData) => {
    let updatedList = [];
    if (editingIndex !== null) {
      updatedList = [...goalData];
      updatedList[editingIndex] = newData;
    } else {
      updatedList = [newData, ...goalData];
    }
    setGoalData(updatedList);
    syncGoals(updatedList);

    setEditingGoal(null);
    setEditingIndex(null);
    setIsPopupOpen(false);
  };

  const handleSaveWeekly = (newItem) => {
    let updatedList = [];
    if (editingWeeklyIndex !== null) {
      updatedList = [...weeklyData];
      updatedList[editingWeeklyIndex] = newItem;
    } else {
      updatedList = [newItem, ...weeklyData];
    }
    setWeeklyData(updatedList);
    syncWeeklyGoals(updatedList);

    setEditingWeekly(null);
    setEditingWeeklyIndex(null);
    setIsPopupOpen(false);
  };

  const handleEditGoal = (item, index) => {
    setEditingGoal(item);
    setEditingIndex(index);
    setIsPopupOpen(true);
  };

  const handleEditWeekly = (item, index) => {
    setEditingWeekly(item);
    setEditingWeeklyIndex(index);
    setIsPopupOpen(true);
  };

  const handleDeleteGoal = (indexToDelete, listTypeData) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này không?")) {
      const itemToDelete = listTypeData[indexToDelete];
      const updatedList = goalData.filter((item) => item !== itemToDelete);
      setGoalData(updatedList);
      syncGoals(updatedList);
    }
  };

  // Hàm xử lý xóa Kế hoạch tuần (Hỗ trợ xóa theo ID hoặc Index để tránh lỗi)
  const handleDeleteWeekly = (idToDelete) => {
    const updatedList = weeklyData.filter((item, index) => {
      if (item.id) {
        return item.id !== idToDelete;
      }
      return index !== idToDelete; // Fallback xóa theo index nếu item không có id
    });
    setWeeklyData(updatedList);
    syncWeeklyGoals(updatedList);
  };

  const uniqueGoalData = goalData.filter((item, index, self) =>
    index === self.findIndex((t) => t.goalName === item.goalName && t.startDate === item.startDate)
  );

  const shortTermData = uniqueGoalData.filter((item) => item.totalDays <= 365);
  const longTermData = uniqueGoalData.filter((item) => item.totalDays > 365);

  return (
    <div className="finance-wrapper">
      {(selectedFilter === "muc-tieu-ngan-han" || !selectedFilter) && (
        <GoalShort 
          rawData={shortTermData} 
          onEdit={(item, idx) => {
            const originalIdx = goalData.findIndex(g => g.goalName === item.goalName && g.startDate === item.startDate);
            handleEditGoal(item, originalIdx !== -1 ? originalIdx : idx);
          }}
          onDelete={(idx) => handleDeleteGoal(idx, shortTermData)}
        />
      )}

      {selectedFilter === "muc-tieu-dai-han" && (
        <GoalLong 
          rawData={longTermData} 
          onEdit={(item, idx) => {
            const originalIdx = goalData.findIndex(g => g.goalName === item.goalName && g.startDate === item.startDate);
            handleEditGoal(item, originalIdx !== -1 ? originalIdx : idx);
          }}
          onDelete={(idx) => handleDeleteGoal(idx, longTermData)}
        />
      )}

      {selectedFilter === "ke-hoach-tuan" && (
        <WeeklyGoalGrid 
          rawData={weeklyData} 
          onEdit={(item, idx) => handleEditWeekly(item, idx)} 
          onDelete={handleDeleteWeekly}
        />
      )}

      {/* Popup Mục tiêu ngắn/dài hạn */}
      {selectedFilter !== "ke-hoach-tuan" && (
        <GoalPopup
          isOpen={isPopupOpen}
          onClose={() => {
            setEditingGoal(null);
            setEditingIndex(null);
            setIsPopupOpen(false);
          }}
          onSave={handleSaveGoal}
          currentDate={selectedDate}
          editingGoal={editingGoal}
        />
      )}

      {/* Popup Kế hoạch tuần */}
      {selectedFilter === "ke-hoach-tuan" && (
        <WeeklyGoalPopup
          isOpen={isPopupOpen}
          onClose={() => {
            setEditingWeekly(null);
            setEditingWeeklyIndex(null);
            setIsPopupOpen(false);
          }}
          itemData={editingWeekly}
          onSave={handleSaveWeekly}
        />
      )}
    </div>
  );
}