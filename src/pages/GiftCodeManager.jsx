// src/pages/GiftCodeManager.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/GiftCode.css";

export default function GiftCodeManager({ searchTerm = "", savedData, onCountChange, onEdit }) {
  const [activeTab, setActiveTab] = useState("normal");
  const [voucherTab, setVoucherTab] = useState("active");
  const [normalCodes, setNormalCodes] = useState([]);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [usedVouchers, setUsedVouchers] = useState([]);

  const formatDateForUI = (value) => {
    if (!value) return "—";

    const valueString = String(value);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valueString)) {
      return valueString;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
      const [year, month, day] = valueString.split("-");
      return `${day}/${month}/${year}`;
    }

    return valueString;
  };

  const mapItem = (item) => ({
    ...item,
    giftName: item.gift_name ?? item.giftName ?? "",
    customerName: item.customer_name ?? item.customerName ?? "",
    customerPhone: item.customer_phone ?? item.customerPhone ?? "",
    remainingDays: item.remaining_days ?? item.remainingDays ?? null,
  });

  const loadGiftCodes = async () => {
    const { data, error } = await supabase.from("gift_codes").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải Gift Code:", error);
      return;
    }

    const mappedData = (data || []).map(mapItem);

    const normal = mappedData.filter((item) => item.type === "normal");
    const active = mappedData.filter((item) => item.type === "voucher" && item.status === "active");
    const used = mappedData.filter((item) => item.type === "voucher" && item.status === "used");

    setNormalCodes(normal);
    setActiveVouchers(active);
    setUsedVouchers(used);

    if (onCountChange) {
      onCountChange(mappedData.length);
    }
  };

  useEffect(() => {
    loadGiftCodes();
  }, []);

  useEffect(() => {
    if (!savedData) return;
    loadGiftCodes();
  }, [savedData]);

  const filterItems = (items) => {
    const keyword = String(searchTerm || "")
      .trim()
      .toLowerCase();

    if (!keyword) return items;

    return items.filter((item) =>
      [item.code, item.giftName, item.date, item.customerName, item.customerPhone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  };

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleRenew = async (item) => {
    const nextRemainingDays = Number(item.remainingDays ?? 180) + 30;

    const { error } = await supabase
      .from("gift_codes")
      .update({
        remaining_days: nextRemainingDays,
      })
      .eq("id", item.id);

    if (error) {
      console.error("Lỗi gia hạn voucher:", error);
      return;
    }

    setActiveVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === item.id
          ? {
              ...voucher,
              remainingDays: nextRemainingDays,
            }
          : voucher,
      ),
    );
  };

  const handleUseVoucher = async (item) => {
    const { error } = await supabase
      .from("gift_codes")
      .update({
        status: "used",
      })
      .eq("id", item.id);

    if (error) {
      console.error("Lỗi chuyển voucher sang đã dùng:", error);
      return;
    }

    setActiveVouchers((prev) => prev.filter((voucher) => voucher.id !== item.id));

    setUsedVouchers((prev) => [
      {
        ...item,
        status: "used",
        usedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const renderNormalCodes = () => {
    const data = filterItems(normalCodes);

    if (data.length === 0) {
      return <div className="empty">Chưa có mã.</div>;
    }

    return (
      <div className="list">
        {data.map((item) => (
          <div key={item.id} className="card gift-code-card" onClick={() => handleEdit(item)}>
            <div className="info">
              <div className="row">
                <span>Mã code</span>
                <strong>{item.code}</strong>
              </div>

              <div className="row">
                <span>Tên món</span>
                <strong>{item.giftName || "—"}</strong>
              </div>

              <div className="row">
                <span>Ngày</span>
                <strong>{formatDateForUI(item.date)}</strong>
              </div>

              <div className="row">
                <span>Khách hàng</span>
                <strong>{item.customerName || "—"}</strong>
              </div>

              <div className="row">
                <span>SĐT khách hàng</span>
                <strong>{item.customerPhone || "—"}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVoucherCard = (item, isUsed = false) => {
    return (
      <div
        key={item.id}
        className="card gift-code-card voucher-card"
        onClick={() => (isUsed ? null : handleEdit(item))}
        onTouchStart={(e) => {
          if (isUsed) return;
          e.currentTarget.dataset.startX = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (isUsed) return;

          const startX = Number(e.currentTarget.dataset.startX || 0);
          const endX = e.changedTouches[0].clientX;
          const distance = endX - startX;

          if (distance > 85) {
            handleRenew(item);
          }

          if (distance < -85) {
            handleUseVoucher(item);
          }
        }}
      >
        <div className="info">
          <div className="row">
            <span>Mã code</span>
            <strong>{item.code}</strong>
          </div>

          <div className="row">
            <span>Tên món</span>
            <strong>{item.giftName || "—"}</strong>
          </div>

          <div className="row">
            <span>Ngày</span>
            <strong>{formatDateForUI(item.date)}</strong>
          </div>

          <div className="row">
            <span>Khách hàng</span>
            <strong>{item.customerName || "—"}</strong>
          </div>

          <div className="row">
            <span>SĐT khách hàng</span>
            <strong>{item.customerPhone || "—"}</strong>
          </div>

          {!isUsed && <div className="gift-code-remaining">Còn: {item.remainingDays ?? 180} ngày</div>}
        </div>
      </div>
    );
  };

  const renderVouchers = () => {
    const sourceData = voucherTab === "active" ? activeVouchers : usedVouchers;

    const data = filterItems(sourceData);

    if (data.length === 0) {
      return <div className="empty">{voucherTab === "active" ? "Chưa có voucher đang kích hoạt." : "Chưa có voucher đã dùng."}</div>;
    }

    return <div className="list">{data.map((item) => renderVoucherCard(item, voucherTab === "used"))}</div>;
  };

  return (
    <div className="manager gift-code-manager">
      <div className="gift-code-tabs">
        <button type="button" className={activeTab === "normal" ? "active" : ""} onClick={() => setActiveTab("normal")}>
          QUÀ THƯỜNG
        </button>

        <button type="button" className={activeTab === "voucher" ? "active" : ""} onClick={() => setActiveTab("voucher")}>
          VOUCHER
        </button>
      </div>

      {activeTab === "normal" && renderNormalCodes()}

      {activeTab === "voucher" && (
        <>
          <div className="gift-code-subtabs">
            <button type="button" className={voucherTab === "active" ? "active" : ""} onClick={() => setVoucherTab("active")}>
              ĐÃ KÍCH HOẠT
            </button>

            <button type="button" className={voucherTab === "used" ? "active" : ""} onClick={() => setVoucherTab("used")}>
              ĐÃ DÙNG
            </button>
          </div>

          {renderVouchers()}
        </>
      )}
    </div>
  );
}
