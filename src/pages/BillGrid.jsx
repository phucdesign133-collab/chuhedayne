// src/pages/BillGrid.jsx
import React, { useEffect, useState } from "react";
import { FileText, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/BillGrid.css";

export default function BillGrid({ billType = "gift-orders", source = "warehouse", searchTerm = "", onCountChange, onEdit }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipeState, setSwipeState] = useState({});
  const [expandedBills, setExpandedBills] = useState({});

  const isFinance = source === "finance";

  // =========================================================
  // LOAD
  // =========================================================

  const loadBills = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.from("bills").select("*").eq("bill_type", billType).order("created_at", {
        ascending: isFinance,
      });

      if (error) {
        throw error;
      }

      setBills(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải bill:", error);

      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [billType, source]);

  // =========================================================
  // SEARCH
  // =========================================================

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredBills = bills.filter((bill) => {
    if (!activeSearchTerm) {
      return true;
    }

    return (
      String(bill.bill_number || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(bill.customer_name || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(bill.phone || "")
        .toLowerCase()
        .includes(activeSearchTerm)
    );
  });

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredBills.length);
    }
  }, [filteredBills.length, onCountChange]);

  // =========================================================
  // FORMAT
  // =========================================================

  const formatBillNumber = (bill) => {
    const number = bill.bill_number;

    if (number === null || number === undefined || number === "") {
      return "---";
    }

    return String(number).padStart(3, "0");
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getCustomerName = (bill) => {
    return bill.customer_name || bill.name || bill.receiver_name || "Chưa có tên";
  };

  const getItemCount = (bill) => {
    if (bill.total_quantity !== null && bill.total_quantity !== undefined) {
      return Number(bill.total_quantity) || 0;
    }

    if (bill.item_count !== null && bill.item_count !== undefined) {
      return Number(bill.item_count) || 0;
    }

    if (Array.isArray(bill.items)) {
      return bill.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
      }, 0);
    }

    return 0;
  };

  // =========================================================
  // GIFT ITEMS
  // =========================================================

  const getGroupedItems = (bill) => {
    if (!Array.isArray(bill.items)) {
      return [];
    }

    const grouped = {};

    bill.items.forEach((item) => {
      const name = item.text || item.name || "Quà không tên";

      const key = name.trim().toLowerCase();

      if (!grouped[key]) {
        grouped[key] = {
          name,
          giftCode: item.gift_code || "",
          quantity: 0,
          codes: [],
        };
      }

      grouped[key].quantity += Number(item.quantity) || 0;

      if (item.gift_code && !grouped[key].giftCode) {
        grouped[key].giftCode = String(item.gift_code);
      }

      if (item.code) {
        grouped[key].codes.push(String(item.code));
      }

      if (Array.isArray(item.codes)) {
        item.codes.forEach((code) => {
          if (code) {
            grouped[key].codes.push(String(code));
          }
        });
      }
    });

    return Object.values(grouped);
  };

  // =========================================================
  // CUSTOMER
  // =========================================================

  const getCustomerInfo = (bill) => {
    const name = getCustomerName(bill);

    const phone = bill.phone || "Chưa có SĐT";

    const address = bill.address || "Chưa có địa chỉ";

    return {
      name,
      phone,
      address,
    };
  };

  // =========================================================
  // COLLAPSE
  // =========================================================

  const toggleBill = (billId) => {
    setExpandedBills((current) => ({
      ...current,
      [billId]: !current[billId],
    }));
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (bill) => {
    if (typeof onEdit === "function") {
      onEdit(bill);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (bill) => {
    const billNumber = formatBillNumber(bill);

    const confirmed = window.confirm(`Xóa bill #${billNumber} khỏi danh sách?`);

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase.from("bills").delete().eq("id", bill.id).eq("bill_type", billType);

      if (error) {
        throw error;
      }

      setBills((prev) => prev.filter((item) => item.id !== bill.id));

      setExpandedBills((current) => {
        const next = {
          ...current,
        };

        delete next[bill.id];

        return next;
      });
    } catch (error) {
      console.error("❌ Lỗi xóa bill:", error);

      alert(`Không thể xóa bill:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExportBill = (bill) => {
    // Tạm giữ dữ liệu bill hiện tại.
    // Phần render bill chuẩn sẽ nối vào đây.
    console.log("🧾 Xuất bill:", bill);
  };

  // =========================================================
  // SWIPE
  // =========================================================

  const handleTouchStart = (event, billId) => {
    const card = event.currentTarget;

    const width = card.getBoundingClientRect().width;

    const touch = event.touches[0];

    setSwipeState((current) => ({
      ...current,
      [billId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        dragging: true,
        cardWidth: width,
      },
    }));
  };

  const handleTouchMove = (event, billId) => {
    const current = swipeState[billId];

    if (!current?.dragging) {
      return;
    }

    const touch = event.touches[0];

    setSwipeState((state) => ({
      ...state,
      [billId]: {
        ...state[billId],
        currentX: touch.clientX,
      },
    }));
  };

  const handleTouchEnd = (bill) => {
    const state = swipeState[bill.id];

    if (!state?.dragging) {
      return;
    }

    const cardWidth = state.cardWidth || 0;

    const distance = state.currentX - state.startX;

    const threshold = cardWidth > 0 ? cardWidth * 0.85 : window.innerWidth * 0.85;

    if (Math.abs(distance) >= threshold) {
      if (distance > 0) {
        handleEdit(bill);
      } else {
        handleDelete(bill);
      }
    }

    setSwipeState((current) => ({
      ...current,
      [bill.id]: {
        startX: 0,
        currentX: 0,
        dragging: false,
        cardWidth: 0,
      },
    }));
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bill-grid">
      <div className="bill-grid-list">
        {loading ? (
          <div className="bill-grid-empty">
            <FileText size={32} />
            <span>Đang tải bill...</span>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="bill-grid-empty">
            <FileText size={32} />
            <span>Không có bill</span>
          </div>
        ) : (
          filteredBills.map((bill, index) => {
            const billId = bill.id || `${source}-bill-${index}`;

            const state = swipeState[billId];

            const isExpanded = !!expandedBills[billId];

            const translateX = state?.dragging && state.currentX ? state.currentX - state.startX : 0;

            const groupedItems = getGroupedItems(bill);

            const customer = getCustomerInfo(bill);

            return (
              <div
                key={billId}
                className={`bill-grid-swipe ${isExpanded ? "bill-grid-swipe-expanded" : ""}`}
                onTouchStart={(event) => handleTouchStart(event, billId)}
                onTouchMove={(event) => handleTouchMove(event, billId)}
                onTouchEnd={() =>
                  handleTouchEnd({
                    ...bill,
                    id: billId,
                  })
                }
              >
                <div className="bill-grid-action bill-grid-action-edit">
                  <Pencil size={20} />
                  <span>Sửa</span>
                </div>

                <div className="bill-grid-action bill-grid-action-delete">
                  <Trash2 size={20} />
                  <span>Xóa</span>
                </div>

                <div
                  className="bill-grid-card"
                  style={{
                    transform: `translateX(${translateX}px)`,
                    transition: state?.dragging ? "none" : "transform 0.2s ease",
                  }}
                >
                  {/* =================================================
                        ROW 1
                    ================================================= */}

                  <button
                    type="button"
                    className="bill-grid-header"
                    onClick={() => {
                      if (!state?.dragging || Math.abs((state.currentX || 0) - (state.startX || 0)) < 10) {
                        toggleBill(billId);
                      }
                    }}
                  >
                    <span className="bill-grid-number">#{formatBillNumber(bill)}</span>

                    <span className="bill-grid-date">{formatDate(bill.created_at)}</span>

                    <span className="bill-grid-toggle">{isExpanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</span>
                  </button>

                  {/* =================================================
                        ROW 2
                    ================================================= */}

                  {isExpanded && (
                    <div className="bill-grid-details">
                      <div className="bill-grid-gifts">
                        {groupedItems.length === 0 ? (
                          <div className="bill-grid-gift-empty">Chưa có thông tin quà</div>
                        ) : (
                          groupedItems.map((item, itemIndex) => (
                            <div key={`${billId}-gift-${itemIndex}`} className="bill-grid-gift-row">
                              <div className="bill-grid-gift-info">
                                <span className="bill-grid-gift-name">
                                  {item.name}
                                  {" - "}
                                </span>

                                {item.codes.length > 0 && <span className="bill-grid-gift-codes">{item.codes.join(", ")}</span>}
                              </div>

                              <span className="bill-grid-gift-quantity">×{item.quantity}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* =================================================
                            ROW 3
                        ================================================= */}

                      <div className="bill-grid-customer">
                        <span className="bill-grid-customer-name">
                          {customer.name}
                          {" - "}
                        </span>

                        <span className="bill-grid-customer-phone">
                          {customer.phone}
                          {" - "}
                        </span>

                        <span className="bill-grid-customer-address">{customer.address}</span>

                        <button type="button" className="bill-grid-export-btn" onClick={() => handleExportBill(bill)}>
                          Xuất bill
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
