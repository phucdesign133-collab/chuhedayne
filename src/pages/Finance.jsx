import React, { useState, useEffect } from "react";
import "../css/Tab.css";
import { supabase } from "../components/utils/supabaseClient";

// Components
import DailyIncomeExpenseGrid from "../components/DailyIncomeExpenseGrid";
import DailyIncomeExpensePopup from "../components/popup/DailyIncomeExpensePopup";
import CreditCardIconGrid from "../components/CreditCardIconGrid";
import CreditCardGrid from "../components/CreditCardGrid";
import CreditCardPopup from "../components/popup/CreditCardPopup";
import TotalBalanceGrid from "../components/TotalBalanceGrid";
import TotalBalancePopup from "../components/popup/TotalBalancePopup";
import DebtGrid from "../components/DebtGrid";
import DebtPopup from "../components/popup/DebtPopup";

const getCurrentDateFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getCurrentDayOfWeek = () => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return days[new Date().getDay()];
};

export default function Finance({ selectedFilter, isPopupOpen, setIsPopupOpen }) {
  const [activeCreditCard, setActiveCreditCard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateFormatted());

  // States lưu dữ liệu
  const [dailyData, setDailyData] = useState([]);
  const [creditCardData, setCreditCardData] = useState({});
  const [totalBalanceData, setTotalBalanceData] = useState([]);
  const [debtData, setDebtData] = useState([]);

  // Hàm fetch dữ liệu từ Supabase
  const fetchFinanceData = async () => {
    try {
      const { data, error } = await supabase.from('finance_tables').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const daily = data.find(item => item.id === 'daily_data')?.content || [{ dayOfWeek: getCurrentDayOfWeek(), date: getCurrentDateFormatted(), income: "0", expense: "0", totalBalance: "43.375.199" }];
        const cards = data.find(item => item.id === 'credit_card_data')?.content || {};
        const balances = data.find(item => item.id === 'total_balance_data')?.content || [{
          dayOfWeek: getCurrentDayOfWeek(),
          date: getCurrentDateFormatted(),
          summe: 43375199,
          bilanz: 0,
          details: { techKonto: 37225655, vibKonto: 150000, tpKonto: 479, vpKonto: 0, grabKonto: 330783, kassenfrisch: 3736000, dasBargeld: 1771000, eWallet: 124007 }
        }];
        const debts = data.find(item => item.id === 'debt_data')?.content || [];

        setDailyData(daily);
        setCreditCardData(cards);
        setTotalBalanceData(balances);
        setDebtData(debts);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Finance:", err);
    }
  };

  // Hàm lưu dữ liệu lên Supabase
  const syncToSupabase = async (id, content) => {
    try {
      await supabase.from('finance_tables').upsert({ id, content });
    } catch (err) {
      console.error("Lỗi đồng bộ Supabase:", err);
    }
  };

  useEffect(() => {
    fetchFinanceData();

    // 1. Lắng nghe sự kiện custom nội bộ trong app
    const handleRealtimeChange = () => fetchFinanceData();
    window.addEventListener('supabase-data-changed', handleRealtimeChange);

    // 2. Kích hoạt Supabase Realtime channel để tự động đồng bộ giữa thiết bị A và B ngay lập tức
    const channel = supabase
      .channel('public:finance_tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_tables' }, (payload) => {
        fetchFinanceData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('supabase-data-changed', handleRealtimeChange);
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Handlers xử lý dữ liệu ---
  const handleSaveCreditCard = (newData) => {
    if (!activeCreditCard) return;
    const updatedCards = { ...creditCardData, [activeCreditCard]: newData };
    setCreditCardData(updatedCards);
    syncToSupabase('credit_card_data', updatedCards);
  };

  const handleSaveTotalBalance = (newData) => {
    const newSumme = Object.keys(newData.details)
      .filter((key) => key !== "note")
      .reduce((sum, key) => sum + (Number(newData.details[key]) || 0), 0);

    const sortedList = [...totalBalanceData].sort((a, b) => {
      const [d1, m1, y1] = a.date.split("/").map(Number);
      const [d2, m2, y2] = b.date.split("/").map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

    const currentIndex = sortedList.findIndex((item) => item.date === newData.date);
    let previousSumme = newSumme;
    if (currentIndex > 0) {
      previousSumme = sortedList[currentIndex - 1].summe;
    } else if (sortedList.length > 0) {
      previousSumme = sortedList[sortedList.length - 1].summe;
    }

    const bilanz = newSumme - previousSumme;
    const updatedRecord = {
      dayOfWeek: getCurrentDayOfWeek(),
      date: newData.date,
      details: newData.details,
      summe: newSumme,
      bilanz: bilanz,
    };

    let updatedBalances = [];
    const existingIndex = totalBalanceData.findIndex((item) => item.date === newData.date);
    if (existingIndex >= 0) {
      updatedBalances = [...totalBalanceData];
      updatedBalances[existingIndex] = updatedRecord;
    } else {
      updatedBalances = [...totalBalanceData, updatedRecord];
    }

    setTotalBalanceData(updatedBalances);
    syncToSupabase('total_balance_data', updatedBalances);
  };

  const handleAddDebtData = (creditor, newItem) => {
    const itemToSave = { ...newItem, creditor: creditor };
    const updatedDebts = [itemToSave, ...(Array.isArray(debtData) ? debtData : [])];
    setDebtData(updatedDebts);
    syncToSupabase('debt_data', updatedDebts);
    setIsPopupOpen(false);
  };

  const latestRecord = totalBalanceData[totalBalanceData.length - 1];
  const lastSavedDetails = latestRecord ? latestRecord.details : null;

  return (
    <div className="finance-wrapper">
      {selectedFilter === "thu-chi-moi-ngay" && (
        <>
          <DailyIncomeExpenseGrid rawData={dailyData} onSelectDate={(date) => setSelectedDate(date)} />
          <DailyIncomeExpensePopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            onSave={(newData) => {
              const income = Number(newData.income || 0);
              const expense = Number(newData.expense || 0);
              const existingIndex = dailyData.findIndex((item) => item.date === newData.date);

              let previousBalance = 43375199;
              if (dailyData.length > 0) {
                const lastItem = dailyData[existingIndex > 0 ? existingIndex - 1 : dailyData.length - 1];
                if (lastItem && lastItem.totalBalance) {
                  previousBalance = Number(String(lastItem.totalBalance).replace(/\./g, "")) || 43375199;
                }
              }

              const newTotalBalance = previousBalance + income - expense;
              const updatedRecord = {
                dayOfWeek: getCurrentDayOfWeek(),
                date: newData.date,
                income: income.toLocaleString("vi-VN"),
                expense: expense.toLocaleString("vi-VN"),
                totalBalance: newTotalBalance.toLocaleString("vi-VN"),
                incomeDetails: newData.incomeDetails,
                expenseDetails: newData.expenseDetails,
              };

              let updatedDaily = [];
              if (existingIndex >= 0) {
                updatedDaily = [...dailyData];
                updatedDaily[existingIndex] = updatedRecord;
              } else {
                updatedDaily = [...dailyData, updatedRecord];
              }

              setDailyData(updatedDaily);
              syncToSupabase('daily_data', updatedDaily);
              setIsPopupOpen(false);
            }}
            currentDate={selectedDate}
            lastSavedData={dailyData[dailyData.length - 1] || null}
          />
        </>
      )}

      {selectedFilter === "tong-du-no" && (
        <>
          <DebtGrid rawData={debtData} />
          <DebtPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onAddDebt={handleAddDebtData} />
        </>
      )}

      {selectedFilter === "the-tin-dung" && (
        <>
          <CreditCardIconGrid selectedCard={activeCreditCard} onSelectCard={(cardId) => setActiveCreditCard(cardId)} allCardsData={creditCardData} />
          {activeCreditCard && (
            <CreditCardGrid 
              selectedCard={activeCreditCard} 
              rawData={creditCardData[activeCreditCard] || null} 
              onEdit={() => setIsPopupOpen(true)}
              onDelete={(cardId) => {
                const updatedCards = { ...creditCardData };
                delete updatedCards[cardId];
                setCreditCardData(updatedCards);
                syncToSupabase('credit_card_data', updatedCards);
              }}
            />
          )}
          <CreditCardPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            onSave={handleSaveCreditCard}
            currentDate={selectedDate}
            selectedCard={activeCreditCard}
            lastSavedData={activeCreditCard ? creditCardData[activeCreditCard] : null}
          />
        </>
      )}

      {selectedFilter === "tong-so-du" && (
        <>
          <TotalBalanceGrid rawData={totalBalanceData} />
          <TotalBalancePopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onSave={handleSaveTotalBalance} currentDate={selectedDate} lastSavedData={lastSavedDetails} />
        </>
      )}
    </div>
  );
}