// src/pages/GiftCodeManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";
import "../css/GiftCode.css";

export default function GiftCodeManager({ searchTerm = "", savedData, onCountChange, onEdit }) {
  const [activeTab, setActiveTab] = useState("normal");
  const [voucherTab, setVoucherTab] = useState("active");
  const [bills, setBills] = useState([]);
  const [shippedPrizes, setShippedPrizes] = useState([]);

  const loadData = async () => {
    const [{ data: billData, error: billError }, { data: shippedData, error: shippedError }] = await Promise.all([
      supabase.from("bills").select("*").eq("bill_type", "gift-orders").order("created_at", { ascending: false }),
      supabase.from("shipped_prizes").select("*").order("created_at", { ascending: false }),
    ]);

    if (billError) {
      console.error("Lỗi tải Gift Code từ bills:", billError);
    }

    if (shippedError) {
      console.error("Lỗi tải Gift Code từ shipped_prizes:", shippedError);
    }

    setBills(billData || []);
    setShippedPrizes(shippedData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!savedData) return;
    loadData();
  }, [savedData]);

  const activeSearchTerm = String(searchTerm || "")
    .trim()
    .toLowerCase();

  const normalGroups = useMemo(() => {
    const groupMap = new Map();

    bills.forEach((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];

      items.forEach((item) => {
        const giftName = String(item?.text || "").trim();

        if (!giftName || /voucher/i.test(giftName)) return;

        const codes =
          Array.isArray(item?.codes) && item.codes.length > 0
            ? item.codes
                .filter(Boolean)
                .map((code) => String(code).trim())
                .filter(Boolean)
            : item?.gift_code
              ? [String(item.gift_code).trim()]
              : [];

        if (!codes.length) return;

        const searchable = `${giftName} ${codes.join(" ")} ${bill.customer_name || ""} ${bill.phone || ""}`.toLowerCase();

        if (activeSearchTerm && !searchable.includes(activeSearchTerm)) return;

        if (!groupMap.has(giftName)) {
          groupMap.set(giftName, {
            giftName,
            codes: [],
            unitCostTotal: 0,
            hasUnitCost: false,
          });
        }

        const group = groupMap.get(giftName);

        group.codes.push(...codes);

        const unitCost = Number(item?.unit_cost);

        if (Number.isFinite(unitCost) && unitCost > 0) {
          group.unitCostTotal += unitCost * codes.length;
          group.hasUnitCost = true;
        }
      });
    });

    shippedPrizes.forEach((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];

      items.forEach((item) => {
        const giftName = String(item?.name || item?.gift_name || item?.title || "").trim();
        const code = String(item?.code || "").trim();

        if (!giftName || /voucher/i.test(giftName) || !code) return;

        const searchable = `${giftName} ${code} ${bill.customer_name || ""} ${bill.phone || ""}`.toLowerCase();

        if (activeSearchTerm && !searchable.includes(activeSearchTerm)) return;

        if (!groupMap.has(giftName)) {
          groupMap.set(giftName, {
            giftName,
            codes: [],
            unitCostTotal: 0,
            hasUnitCost: false,
          });
        }

        const group = groupMap.get(giftName);

        group.codes.push(code);

        const unitCost = Number(item?.unit_cost);

        if (Number.isFinite(unitCost) && unitCost > 0) {
          group.unitCostTotal += unitCost;
          group.hasUnitCost = true;
        }
      });
    });

    return [...groupMap.values()]
      .map((group) => ({
        ...group,
        codes: [...new Set(group.codes)],
      }))
      .sort(
        (a, b) =>
          b.codes.length - a.codes.length ||
          a.giftName.localeCompare(b.giftName, "vi", {
            sensitivity: "base",
          }),
      );
  }, [bills, shippedPrizes, activeSearchTerm]);

  const vouchers = useMemo(() => {
    const result = [];

    bills.forEach((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];

      items.forEach((item, itemIndex) => {
        const giftName = String(item?.text || "").trim();

        if (!giftName || !/voucher/i.test(giftName)) return;

        const codes =
          Array.isArray(item?.codes) && item.codes.length > 0
            ? item.codes
                .filter(Boolean)
                .map((code) => String(code).trim())
                .filter(Boolean)
            : item?.gift_code
              ? [String(item.gift_code).trim()]
              : [];

        codes.forEach((code, codeIndex) => {
          if (!code) return;

          const searchable = `${code} ${giftName} ${bill.customer_name || ""} ${bill.phone || ""}`.toLowerCase();

          if (activeSearchTerm && !searchable.includes(activeSearchTerm)) return;

          const voucherData = item?.vouchers?.find?.((voucher) => String(voucher?.code || "").trim() === code) || {};

          result.push({
            source: "bill",
            billId: bill.id,
            itemIndex,
            codeIndex,
            code,
            giftName,
            customerName: String(bill.customer_name || "").trim(),
            phone: String(bill.phone || "").trim(),
            status: voucherData.status || item?.voucher_status || "active",
            activatedAt: voucherData.activated_at || item?.voucher_activated_at || bill.created_at,
            expiryAt: voucherData.expiry_at || item?.voucher_expiry_at || null,
            usedAt: voucherData.used_at || item?.voucher_used_at || null,
          });
        });
      });
    });

    shippedPrizes.forEach((bill) => {
      const items = Array.isArray(bill.items) ? bill.items : [];

      items.forEach((item, itemIndex) => {
        const giftName = String(item?.name || item?.gift_name || item?.title || "").trim();
        const code = String(item?.code || "").trim();

        if (!giftName || !/voucher/i.test(giftName) || !code) return;

        const searchable = `${code} ${giftName} ${bill.customer_name || ""} ${bill.phone || ""}`.toLowerCase();

        if (activeSearchTerm && !searchable.includes(activeSearchTerm)) return;

        const voucherData = item?.vouchers?.find?.((voucher) => String(voucher?.code || "").trim() === code) || {};

        result.push({
          source: "shipped",
          billId: bill.id,
          itemIndex,
          code,
          giftName,
          customerName: String(bill.customer_name || "").trim(),
          phone: String(bill.phone || "").trim(),
          status: voucherData.status || item?.voucher_status || "active",
          activatedAt: voucherData.activated_at || item?.voucher_activated_at || bill.created_at,
          expiryAt: voucherData.expiry_at || item?.voucher_expiry_at || null,
          usedAt: voucherData.used_at || item?.voucher_used_at || null,
        });
      });
    });

    return result;
  }, [bills, shippedPrizes, activeSearchTerm]);

  const totalNormalCodes = useMemo(() => normalGroups.reduce((total, group) => total + group.codes.length, 0), [normalGroups]);

  const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  const getVietnamDate = () => {
    const now = new Date();

    return new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    );
  };

  const formatDate = (date) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "";

    return `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
  };

  const getDateOnly = (date) => {
    const value = new Date(date);

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  };

  const addDays = (date, days) => {
    const value = getDateOnly(date);

    value.setDate(value.getDate() + days);

    return value;
  };

  const getRemainingDays = (voucher) => {
    const today = getVietnamDate();

    const expiry =
      voucher.status === "used"
        ? addDays(voucher.usedAt || today, 30)
        : voucher.expiryAt
          ? getDateOnly(voucher.expiryAt)
          : addDays(voucher.activatedAt || today, 180);

    return Math.max(0, Math.ceil((expiry.getTime() - getDateOnly(today).getTime()) / 86400000));
  };

  const getExpiryDate = (voucher) => {
    if (voucher.status === "used") {
      return addDays(voucher.usedAt || getVietnamDate(), 30);
    }

    if (voucher.expiryAt) {
      return getDateOnly(voucher.expiryAt);
    }

    return addDays(voucher.activatedAt || getVietnamDate(), 180);
  };

  const getVoucherState = (voucher) => {
    const remaining = getRemainingDays(voucher);

    if (voucher.status === "used") {
      return {
        remaining,
        expired: true,
      };
    }

    const initialExpiry = voucher.expiryAt ? getDateOnly(voucher.expiryAt) : addDays(voucher.activatedAt || getVietnamDate(), 180);

    const today = getDateOnly(getVietnamDate());

    return {
      remaining,
      expired: today.getTime() >= initialExpiry.getTime(),
    };
  };

  const activeVouchers = useMemo(
    () => [...vouchers].filter((voucher) => voucher.status !== "used").sort((a, b) => getRemainingDays(a) - getRemainingDays(b)),
    [vouchers],
  );

  const usedVouchers = useMemo(
    () => [...vouchers].filter((voucher) => voucher.status === "used").sort((a, b) => getRemainingDays(a) - getRemainingDays(b)),
    [vouchers],
  );

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(activeTab === "normal" ? totalNormalCodes : voucherTab === "active" ? activeVouchers.length : usedVouchers.length);
    }
  }, [activeTab, voucherTab, totalNormalCodes, activeVouchers.length, usedVouchers.length, onCountChange]);

  const updateVoucher = async (voucher, action) => {
    console.log("CLICK VOUCHER:", voucher, action);

    const sourceList = voucher.source === "shipped" ? shippedPrizes : bills;
    const bill = sourceList.find((item) => item.id === voucher.billId);

    if (!bill) {
      console.log("KHÔNG TÌM THẤY ĐƠN:", {
        billId: voucher.billId,
        source: voucher.source,
      });
      return;
    }

    const items = Array.isArray(bill.items) ? bill.items.map((item) => ({ ...item })) : [];

    const item = items[voucher.itemIndex];

    if (!item) {
      console.log("KHÔNG TÌM THẤY ITEM:", {
        itemIndex: voucher.itemIndex,
        items,
      });
      return;
    }

    const voucherList = Array.isArray(item.vouchers) ? [...item.vouchers] : [];

    const existingIndex = voucherList.findIndex((entry) => String(entry?.code || "").trim() === voucher.code);

    const now = getVietnamDate();

    let nextVoucher;

    if (action === "use") {
      nextVoucher = {
        code: voucher.code,
        status: "used",
        activated_at: voucher.activatedAt,
        expiry_at: null,
        used_at: now.toISOString(),
      };
    } else if (action === "renew") {
      const currentExpiry = voucher.expiryAt ? getDateOnly(voucher.expiryAt) : addDays(voucher.activatedAt || now, 180);

      nextVoucher = {
        code: voucher.code,
        status: "active",
        activated_at: voucher.activatedAt || now.toISOString(),
        expiry_at: addDays(currentExpiry, 30).toISOString(),
        used_at: null,
      };
    } else {
      return;
    }

    if (existingIndex >= 0) {
      voucherList[existingIndex] = nextVoucher;
    } else {
      voucherList.push(nextVoucher);
    }

    item.vouchers = voucherList;
    items[voucher.itemIndex] = item;

    const tableName = voucher.source === "shipped" ? "shipped_prizes" : "bills";

    const { error } = await supabase
      .from(tableName)
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bill.id);

    if (error) {
      console.error("LỖI UPDATE VOUCHER:", error);
      console.error("LỖI UPDATE VOUCHER JSON:", JSON.stringify(error, null, 2));
      return;
    }

    if (voucher.source === "shipped") {
      setShippedPrizes((prev) =>
        prev.map((currentBill) =>
          currentBill.id === bill.id
            ? {
                ...currentBill,
                items,
              }
            : currentBill,
        ),
      );
    } else {
      setBills((prev) =>
        prev.map((currentBill) =>
          currentBill.id === bill.id
            ? {
                ...currentBill,
                items,
              }
            : currentBill,
        ),
      );
    }

    if (action === "use") {
      setVoucherTab("used");
    }
  };

  const renderNormalCodes = () => {
    if (normalGroups.length === 0) {
      return <div className="empty">Chưa có mã.</div>;
    }

    const totalCost = normalGroups.reduce((total, group) => total + group.unitCostTotal, 0);

    const hasCost = normalGroups.some((group) => group.hasUnitCost);

    return (
      <div className="list">
        <div className="card basic-gift">
          <div className="info">
            <div className="row">{hasCost && <strong>{formatMoney(totalCost)}</strong>}</div>

            {normalGroups.map((group) => (
              <div key={group.giftName} className="gift-code-group">
                <div className="row">
                  <strong style={{ color: "#c0392b" }}>
                    🎁 {group.giftName} ({group.codes.length})
                  </strong>
                </div>

                <div className="gift-code-code-list">{group.codes.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVoucherCard = (voucher) => {
    const state = getVoucherState(voucher);
    const expiryDate = getExpiryDate(voucher);
    const isRed = state.expired || voucher.status === "used";

    return (
      <div key={`${voucher.source}-${voucher.billId}-${voucher.itemIndex}-${voucher.code}`} className="card gift-code-card">
        <button type="button" className="gift-code-action gift-code-renew" onClick={() => updateVoucher(voucher, "renew")}>
          +
        </button>

        <div className="info">
          <div className="row">
            <strong>{voucher.code}</strong>
            <strong>{voucher.giftName}</strong>
          </div>

          <div className="row">
            <span>{voucher.customerName}</span>
            <span>{voucher.phone}</span>
          </div>

          <div className="row">
            <span>{formatDate(expiryDate)}</span>
            <strong style={{ color: isRed ? "red" : "inherit" }}>Còn {state.remaining} ngày</strong>
          </div>
        </div>

        <button type="button" className="gift-code-action gift-code-use" onClick={() => updateVoucher(voucher, "use")}>
          ×
        </button>
      </div>
    );
  };

  const renderVouchers = () => {
    const list = voucherTab === "active" ? activeVouchers : usedVouchers;

    if (list.length === 0) {
      return <div className="empty">{voucherTab === "active" ? "Chưa có voucher đang kích hoạt." : "Chưa có voucher đã dùng."}</div>;
    }

    return <div className="list">{list.map(renderVoucherCard)}</div>;
  };

  return (
    <div className={`manager gift-code-manager ${activeTab === "voucher" ? "has-sub-tabs" : ""}`}>
      <div className="tabs">
        <button type="button" className={`tab ${activeTab === "normal" ? "active" : ""}`} onClick={() => setActiveTab("normal")}>
          QUÀ THƯỜNG
        </button>

        <button type="button" className={`tab ${activeTab === "voucher" ? "active" : ""}`} onClick={() => setActiveTab("voucher")}>
          VOUCHER
        </button>
      </div>

      {activeTab === "normal" && renderNormalCodes()}

      {activeTab === "voucher" && (
        <>
          <div className="sub-tabs">
            <button type="button" className={`sub-tab ${voucherTab === "active" ? "active" : ""}`} onClick={() => setVoucherTab("active")}>
              ĐÃ KÍCH HOẠT
            </button>

            <button type="button" className={`sub-tab ${voucherTab === "used" ? "active" : ""}`} onClick={() => setVoucherTab("used")}>
              ĐÃ DÙNG
            </button>
          </div>

          {renderVouchers()}
        </>
      )}
    </div>
  );
}
