// src/components/Grid.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { hubData } from "../datas/icons";
import { supabase } from "./utils/supabaseClient";
import Popup from "./popup/Popup";
import BillPopup from "./popup/BillPopup";
import BillGrid from "../pages/BillGrid";
import PrizeManager from "../pages/PrizeManager";
import CustomerManager from "../pages/CustomerManager";
import BookingManager from "../pages/BookingManager";
import ContentManager from "../pages/ContentManager";
import IncomeManager from "../pages/IncomeManager";
import FundManager from "../pages/FundManager";
import PurchaseManager from "../pages/PurchaseManager";
import ShippedPrizes from "../pages/ShippedPrizes";
import WarehouseManager from "../pages/WarehouseManager";
import PriceManager from "../pages/PriceManager";
import GiftCodeManager from "../pages/GiftCodeManager";
import "../css/Grid.css";

export default function Grid({ categoryIdOverride = null }) {
  const navigate = useNavigate();
  const { categoryId: routeCategoryId } = useParams();
  const categoryId = categoryIdOverride || routeCategoryId;
  const [searchTerm, setSearchTerm] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [popupMode, setPopupMode] = useState("customer");
  const [eventIndex, setEventIndex] = useState(null);
  const [returnToCustomerPopup, setReturnToCustomerPopup] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [billRefreshKey, setBillRefreshKey] = useState(0);
  const giftCodeSavingRef = useRef(false);
  const allCategories = useMemo(
    () => Object.values(hubData || {}).flatMap((hub) => (hub?.sections || []).flatMap((section) => section.items || [])),
    [],
  );
  const contentCategories = useMemo(() => (hubData?.content?.sections || []).flatMap((section) => section.items || []), []);
  const currentCategory = useMemo(() => {
    if (categoryId === "bills/gift-orders") return { id: "bills/gift-orders", name: "Đổi quà" };
    return allCategories.find((item) => item.id === categoryId);
  }, [allCategories, categoryId]);
  const currentCategoryLabel = currentCategory?.name || currentCategory?.title || "";
  const isPriceCategory = categoryId === "price-decoration" || categoryId === "price-party";
  const isWarehouseCategory = ["balloons", "zip-bags", "stamps", "costumes"].includes(categoryId);
  const isContentCategory = contentCategories.some((item) => item.id === categoryId);
  const isWarehouseGiftOrders = categoryId === "gift-orders";
  const isFinanceGiftOrders = categoryId === "bills/gift-orders";
  const isBillCategory = isWarehouseGiftOrders || isFinanceGiftOrders;
  const handleAddNewClick = () => {
    setEditingData(null);
    setPopupMode(categoryId === "customer-info" ? "customer" : "customer");
    setEventIndex(null);
    setReturnToCustomerPopup(false);
    setIsPopupOpen(true);
  };
  const handleAddEvent = (customer) => {
    setEditingData(customer);
    setPopupMode("event");
    setEventIndex(null);
    setReturnToCustomerPopup(false);
    setIsPopupOpen(true);
  };
  const handleEditEvent = (customer, historyId) => {
    setEditingData(customer);
    setPopupMode("event");
    setEventIndex(historyId);
    setReturnToCustomerPopup(true);
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    if (popupMode === "event" && returnToCustomerPopup) {
      setPopupMode("customer");
      setEventIndex(null);
      setReturnToCustomerPopup(false);
      return;
    }
    setIsPopupOpen(false);
    setEditingData(null);
    setPopupMode("customer");
    setEventIndex(null);
    setReturnToCustomerPopup(false);
  };
  const handleEdit = (item) => {
    setEditingData(item);
    setPopupMode("customer");
    setEventIndex(null);
    setReturnToCustomerPopup(false);
    setIsPopupOpen(true);
  };
  const prepareImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const normalizeCustomerName = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("vi-VN");
  const normalizeCustomerPhone = (value) => String(value || "").replace(/\D/g, "");
  const normalizeCustomerZalo = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase("vi-VN");
  const getBookingHistoryItem = (booking) => {
    const bill = Number(booking?.amount || 0);
    const runner = String(booking?.runner || "").trim();
    const outS = Number(booking?.outs_price || 0);
    const received = !runner || runner.toLowerCase() === "phúc" ? bill : bill - outS;
    const rawDate = String(booking?.date || "").slice(0, 10);
    const parts = rawDate.split("-");
    const eventDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : rawDate;
    return {
      id: String(booking.id),
      booking_id: booking.id,
      event_name: String(booking.program || booking.category || booking.title || "").trim(),
      event_date: eventDate,
      order_value: bill,
      cashback: 0,
      remaining: received,
      tips: 0,
    };
  };
  const syncCustomerFromBooking = async (booking) => {
    const customerName = String(booking?.customer_name || "")
      .replace(/\s+/g, " ")
      .trim();
    const customerPhone = normalizeCustomerPhone(booking?.customer_phone || "");
    const customerZalo = String(booking?.customer_zalo || "").trim();
    if (!customerName || (!customerPhone && !customerZalo)) return null;
    const { data: customers, error: customerSelectError } = await supabase
      .from("customer")
      .select("id, customer_name, phone, zalo, contact_type, contact_value, history");
    if (customerSelectError) throw customerSelectError;
    const normalizedName = normalizeCustomerName(customerName);
    const normalizedZalo = normalizeCustomerZalo(customerZalo);
    const existingCustomer = (Array.isArray(customers) ? customers : []).find((customer) => {
      if (normalizeCustomerName(customer.customer_name) !== normalizedName) return false;
      const existingPhone = normalizeCustomerPhone(customer.phone);
      const existingZalo = normalizeCustomerZalo(customer.zalo);
      const legacyContact = normalizeCustomerZalo(customer.contact_value);
      const phoneMatch =
        customerPhone &&
        (existingPhone === customerPhone || (customer.contact_type === "phone" && normalizeCustomerPhone(legacyContact) === customerPhone));
      const zaloMatch = normalizedZalo && (existingZalo === normalizedZalo || (customer.contact_type === "zalo" && legacyContact === normalizedZalo));
      return Boolean(phoneMatch || zaloMatch);
    });
    const historyItem = getBookingHistoryItem(booking);
    if (existingCustomer) {
      const currentHistory = Array.isArray(existingCustomer.history) ? [...existingCustomer.history] : [];
      const historyIndex = currentHistory.findIndex((item) => String(item?.booking_id || item?.id || "") === String(booking.id));
      if (historyIndex >= 0) currentHistory[historyIndex] = { ...currentHistory[historyIndex], ...historyItem };
      else currentHistory.push(historyItem);
      const { data, error } = await supabase.from("customer").update({ history: currentHistory }).eq("id", existingCustomer.id).select("*").single();
      if (error) throw error;
      return data;
    }
    const payload = {
      customer_name: customerName,
      phone: customerPhone,
      zalo: customerZalo,
      contact_type: customerPhone ? "phone" : "zalo",
      contact_value: customerPhone || customerZalo,
      is_active: true,
      history: [historyItem],
    };
    const { data, error } = await supabase.from("customer").insert(payload).select("*").single();
    if (error) throw error;
    return data;
  };
  const handleSavePopup = async (formData) => {
    try {
      if (isBillCategory) {
        const source = isFinanceGiftOrders ? "finance" : "warehouse";
        const rawItems = Array.isArray(formData.items) ? formData.items : [];
        const items = rawItems
          .map((item, index) => ({
            id: item.id || `manual-gift-${Date.now()}-${index}`,
            text: String(item.text || "").trim(),
            icon: item.icon || "",
            codes: Array.isArray(item.codes) ? item.codes.filter(Boolean) : [],
            quantity: 1,
            market_price:
              item.market_price !== undefined && item.market_price !== null && item.market_price !== "" ? Number(item.market_price) || 0 : null,
            gift_code: String(item.gift_code || "").trim(),
          }))
          .filter((item) => item.text || item.gift_code);
        if (!items.length) throw new Error("Bill chưa có món quà.");
        const totalQuantity = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        const payload = {
          bill_type: "gift-orders",
          customer_name: String(formData.customer_name || "").trim(),
          phone: String(formData.phone || "")
            .replace(/\D/g, "")
            .slice(0, 10),
          address: String(formData.address || "").trim(),
          items,
          total_quantity: totalQuantity,
          subtotal: 0,
          discount: 0,
          total_amount: 0,
          source,
        };
        let result;
        if (formData.id) result = await supabase.from("bills").update(payload).eq("id", formData.id).eq("bill_type", "gift-orders").select().single();
        else result = await supabase.from("bills").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        setBillRefreshKey((current) => current + 1);
        return { success: true, data: result.data };
      }
      if (isPriceCategory) {
        const data = { ...formData, category: categoryId, id: formData.id || `price-${Date.now()}` };
        setSavedData((prev) => {
          const current = Array.isArray(prev) ? prev : [];
          const sameCategory = current.filter((item) => item.category === categoryId);
          const otherCategory = current.filter((item) => item.category !== categoryId);
          const existingIndex = sameCategory.findIndex(
            (item) =>
              item.id === data.id ||
              String(item.title || "")
                .trim()
                .toLowerCase() ===
                String(data.title || "")
                  .trim()
                  .toLowerCase(),
          );
          if (existingIndex >= 0) sameCategory[existingIndex] = data;
          else sameCategory.push(data);
          return [...otherCategory, ...sameCategory];
        });
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data };
      }
      if (categoryId === "gift-codes") {
        if (giftCodeSavingRef.current) return { success: false };
        giftCodeSavingRef.current = true;
        try {
          const rawDate = String(formData.date || "").trim();
          let databaseDate = null;
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
            const [day, month, year] = rawDate.split("/");
            databaseDate = `${year}-${month}-${day}`;
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            databaseDate = rawDate;
          }
          const payload = {
            type: formData.type || "normal",
            code: String(formData.code || "").trim(),
            gift_name: String(formData.giftName || "").trim(),
            date: databaseDate,
            customer_name: String(formData.customerName || "").trim(),
            customer_phone: String(formData.customerPhone || "").trim(),
            remaining_days:
              formData.remainingDays !== undefined && formData.remainingDays !== null && formData.remainingDays !== ""
                ? Number(formData.remainingDays)
                : formData.type === "voucher"
                  ? 180
                  : null,
            status: formData.status || "active",
          };
          if (!payload.code) throw new Error("Vui lòng nhập mã code.");
          if (!payload.gift_name) throw new Error("Vui lòng nhập tên món.");
          let result;
          if (formData.id) result = await supabase.from("gift_codes").update(payload).eq("id", formData.id).select().single();
          else result = await supabase.from("gift_codes").insert(payload).select().single();
          if (result.error) throw result.error;
          setSavedData(result.data);
          setIsPopupOpen(false);
          setEditingData(null);
          return { success: true, data: result.data };
        } finally {
          giftCodeSavingRef.current = false;
        }
      }
      if (categoryId === "prizes") {
        const payload = {
          text: String(formData.text || "").trim(),
          icon: formData.icon || "🎁",
          quantity: Number(formData.quantity) || 0,
          cost: Number(formData.cost) || 0,
          unit: String(formData.unit || "").trim(),
          packaging: Number(formData.packaging) || 0,
          unit_cost: Number(formData.unit_cost) || 0,
          priority: Boolean(formData.priority),
          is_active: formData.is_active ?? true,
          note: String(formData.note || "").trim(),
          images: prepareImages(formData.images),
        };
        let result;
        if (formData.id) result = await supabase.from("prizes").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("prizes").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (categoryId === "customer-info") {
        if (popupMode === "event") {
          if (!formData.id) throw new Error("Không xác định được khách hàng.");
          const { data: currentCustomer, error: currentCustomerError } = await supabase.from("customer").select("*").eq("id", formData.id).single();
          if (currentCustomerError) throw currentCustomerError;
          const currentEvents = Array.isArray(currentCustomer.events) ? [...currentCustomer.events] : [];
          const currentHistory = Array.isArray(currentCustomer.history) ? [...currentCustomer.history] : [];
          const event = formData.event;
          if (!event) throw new Error("Không có dữ liệu sự kiện.");
          if (eventIndex === null || eventIndex === undefined) {
            currentEvents.push(event);
            const currentTier = Number(currentCustomer.member_tier) || 0;
            const newTier = Math.min(currentTier + 1, 5);
            const newPercent = [0, 3, 6, 9, 12, 15][Math.min(newTier, 5)] || 0;
            currentHistory.push({
              id: `event-${Date.now()}-${currentHistory.length}`,
              event_name: String(event.eventName || "").trim(),
              event_date: String(event.eventDate || "").trim(),
              order_value: Number(event.orderValue) || 0,
              cashback: Number(event.cashback) || 0,
              remaining: Number(event.remaining) || 0,
              tips: Number(event.tips) || 0,
            });
            const firstEvent = currentEvents[0] || {
              eventName: "",
              eventDate: "",
              orderValue: 0,
              cashback: 0,
              remaining: 0,
              tips: 0,
              repeat: false,
            };
            const totalOrderValue = currentEvents.reduce((total, item) => total + (Number(item.orderValue) || 0), 0);
            const payload = {
              events: currentEvents,
              history: currentHistory,
              member_tier: newTier,
              member_percent: newPercent,
              event_name: firstEvent.eventName || "",
              event_date: firstEvent.eventDate || "",
              repeat_event: currentEvents.length > 1,
              order_value: totalOrderValue,
              cashback: Number(firstEvent.cashback) || 0,
            };
            const result = await supabase.from("customer").update(payload).eq("id", formData.id).select().single();
            if (result.error) throw result.error;
            setSavedData(result.data);
            setEditingData(result.data);
            if (returnToCustomerPopup) {
              setPopupMode("customer");
              setEventIndex(null);
              setReturnToCustomerPopup(false);
              setIsPopupOpen(true);
            } else {
              setIsPopupOpen(false);
              setEditingData(null);
              setPopupMode("customer");
              setEventIndex(null);
            }
            return { success: true, data: result.data };
          }
          const historyIndex = currentHistory.findIndex((item, index) => String(item.id || `history-${index}`) === String(eventIndex));
          if (historyIndex < 0) throw new Error("Không tìm thấy booking cần sửa.");
          currentHistory[historyIndex] = {
            ...currentHistory[historyIndex],
            event_name: String(event.eventName || "").trim(),
            event_date: String(event.eventDate || "").trim(),
            order_value: Number(event.orderValue) || 0,
            cashback: Number(event.cashback) || 0,
            remaining: Number(event.remaining) || 0,
            tips: Number(event.tips) || 0,
          };
          const payload = { history: currentHistory };
          const result = await supabase.from("customer").update(payload).eq("id", formData.id).select().single();
          if (result.error) throw result.error;
          setSavedData(result.data);
          setEditingData(result.data);
          if (returnToCustomerPopup) {
            setPopupMode("customer");
            setEventIndex(null);
            setReturnToCustomerPopup(false);
            setIsPopupOpen(true);
          } else {
            setIsPopupOpen(false);
            setEditingData(null);
            setPopupMode("customer");
            setEventIndex(null);
          }
          return { success: true, data: result.data };
        }
        const payload = {
          customer_name: String(formData.customer_name || "").trim(),
          contact_type: String(formData.contact_type || "").trim(),
          contact_value: String(formData.contact_value || "").trim(),
          phone: String(formData.phone || "")
            .replace(/\D/g, "")
            .slice(0, 10),
            address: String(formData.address || "").trim(),
          event_name: String(formData.event_name || "").trim(),
          event_date: String(formData.event_date || "").trim(),
          repeat_event: Boolean(formData.repeat_event),
          events: Array.isArray(formData.events) ? formData.events : [],
          order_value:
            formData.order_value !== "" && formData.order_value !== null && formData.order_value !== undefined
              ? Number(formData.order_value) || 0
              : 0,
          cashback: formData.cashback !== "" && formData.cashback !== null && formData.cashback !== undefined ? Number(formData.cashback) || 0 : 0,
          member_tier:
            formData.member_tier !== "" && formData.member_tier !== null && formData.member_tier !== undefined
              ? Number(formData.member_tier) || 0
              : 0,
          member_percent:
            formData.member_percent !== "" && formData.member_percent !== null && formData.member_percent !== undefined
              ? Number(formData.member_percent) || 0
              : 0,
          referral_phone: String(formData.referral_phone || "")
            .replace(/\D/g, "")
            .slice(0, 10),
          referral_name: String(formData.referral_name || "").trim(),
          note: String(formData.note || "").trim(),
          history: Array.isArray(formData.history) ? formData.history : [],
          is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : true,
        };
        let result;
        if (formData.id) result = await supabase.from("customer").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("customer").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (categoryId === "calendar") {
        const payload = {
          program: String(formData.program || "").trim(),
          title: String(formData.title || "").trim(),
          category: String(formData.category || "").trim(),
          date: formData.date || null,
          time_slot: String(formData.time_slot || "").trim(),
          staff_note: formData.staff_note || null,
          amount: formData.amount !== "" && formData.amount !== null && formData.amount !== undefined ? Number(formData.amount) || 0 : 0,
          runner: String(formData.runner || "").trim() || null,
          note: String(formData.note || "").trim() || null,
          outs_price:
            formData.outs_price !== "" && formData.outs_price !== null && formData.outs_price !== undefined ? Number(formData.outs_price) || 0 : 0,
          customer_name: String(formData.customer_name || "").trim() || null,
          customer_phone:
            String(formData.customer_phone || "")
              .replace(/\D/g, "")
              .slice(0, 10) || null,
          customer_zalo: String(formData.customer_zalo || "").trim() || null,
        };
        if (!payload.runner || payload.runner.toLowerCase() === "phúc") payload.outs_price = 0;
        let result;
        if (formData.id) result = await supabase.from("bookings").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("bookings").insert(payload).select().single();
        if (result.error) throw result.error;
        await syncCustomerFromBooking(result.data);
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (categoryId === "income") {
        const payload = {
          source: formData.source,
          title: formData.title,
          date: formData.date,
          received: formData.received,
          note: formData.note,
        };
        let result;
        if (formData.id) result = await supabase.from("incomes").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("incomes").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (categoryId === "purchase") {
        const payload = {
          title: String(formData.title || "").trim(),
          quantity: Number(formData.quantity) || 0,
          unit: String(formData.unit || "").trim(),
          packaging: Number(formData.packaging) || 0,
          amount: Number(formData.amount) || 0,
          note: String(formData.note || "").trim(),
          images: prepareImages(formData.images),
        };
        let result;
        if (formData.id) result = await supabase.from("purchases").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("purchases").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (isWarehouseCategory) {
        const payload = { ...formData, category: categoryId, images: prepareImages(formData.images) };
        let result;
        if (formData.id) result = await supabase.from("warehouse_items").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("warehouse_items").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      if (isContentCategory) {
        const payload = {
          title: String(formData.title || "").trim(),
          category: categoryId,
          location: String(formData.location || "").trim(),
          date: formData.date || null,
          images: prepareImages(formData.images),
        };
        let result;
        if (formData.id) result = await supabase.from("services").update(payload).eq("id", formData.id).select().single();
        else result = await supabase.from("services").insert(payload).select().single();
        if (result.error) throw result.error;
        setSavedData(result.data);
        setIsPopupOpen(false);
        setEditingData(null);
        return { success: true, data: result.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      alert(error?.message || "Không thể lưu dữ liệu.");
      return { success: false, error };
    }
  };
  const renderManager = () => {
    if (isBillCategory)
      return (
        <BillGrid
          key={billRefreshKey}
          billType="gift-orders"
          source={isFinanceGiftOrders ? "finance" : "warehouse"}
          searchTerm={searchTerm}
          onCountChange={setItemCount}
          onEdit={handleEdit}
        />
      );
    if (isPriceCategory) {
      const categorySavedData = Array.isArray(savedData) ? savedData.filter((item) => item.category === categoryId) : [];
      return (
        <PriceManager
          categoryId={categoryId}
          searchTerm={searchTerm}
          savedData={categorySavedData}
          onCountChange={setItemCount}
          onEdit={handleEdit}
        />
      );
    }
    if (categoryId === "prizes")
      return <PrizeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (categoryId === "customer-info")
      return (
        <CustomerManager
          searchTerm={searchTerm}
          savedData={savedData}
          onCountChange={setItemCount}
          onEdit={handleEdit}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
        />
      );
    if (categoryId === "calendar")
      return <BookingManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (categoryId === "income")
      return <IncomeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (categoryId === "marketing-fund")
      return <FundManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (categoryId === "purchase")
      return <PurchaseManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (categoryId === "shipped-prizes") return <ShippedPrizes searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} />;
    if (categoryId === "gift-codes")
      return <GiftCodeManager searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />;
    if (isWarehouseCategory)
      return (
        <WarehouseManager categoryId={categoryId} searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
      );
    if (isContentCategory)
      return (
        <ContentManager categoryId={categoryId} searchTerm={searchTerm} savedData={savedData} onCountChange={setItemCount} onEdit={handleEdit} />
      );
    return null;
  };
  return (
    <div className="post-admin-container">
      <div className="admin-grid-fixed-header">
        <div className="admin-grid-top-bar">
          <button type="button" className="admin-grid-back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={20} />
          </button>
          <h2 className="admin-grid-heading">
            <span>{currentCategoryLabel}</span>
            <small>: {itemCount} mục</small>
          </h2>
        </div>
        <div className="admin-grid-toolbar">
          <div className="admin-grid-search-wrapper">
            <input
              type="text"
              className="admin-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm..."
            />
          </div>
          <button type="button" className="admin-grid-add-btn-main" onClick={handleAddNewClick} aria-label="Thêm mới">
            <Plus size={20} />
            Thêm mới
          </button>
        </div>
      </div>
      <div className="admin-grid-body">
        <div className="admin-grid-outlet-wrapper">{renderManager()}</div>
      </div>
      {isPopupOpen && isBillCategory && (
        <BillPopup isOpen={isPopupOpen} onClose={handleClosePopup} onSave={handleSavePopup} initialData={editingData} />
      )}
      {isPopupOpen && !isBillCategory && (
        <Popup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          onSave={handleSavePopup}
          categoryId={categoryId}
          initialData={editingData}
          mode={popupMode}
          eventIndex={eventIndex}
          onEditEvent={handleEditEvent}
        />
      )}
    </div>
  );
}
