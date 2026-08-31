import React, { useEffect, useState } from "react";
import { Pencil, Trash2, UsersRound } from "lucide-react";
import { supabase } from "../components/utils/supabaseClient";
import "../css/Manager.css";

export default function CustomerManager({ searchTerm = "", savedData = null, onCountChange, onEdit }) {
  const [customers, setCustomers] = useState([]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customer").select("*").order("created_at", { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error("❌ Lỗi tải khách hàng:", error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (!savedData) return;

    setCustomers((prev) => {
      if (!savedData.id) return [savedData, ...prev];

      const exists = prev.some((item) => item.id === savedData.id);

      return exists ? prev.map((item) => (item.id === savedData.id ? savedData : item)) : [savedData, ...prev];
    });
  }, [savedData]);

  const activeSearchTerm = searchTerm.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    if (!activeSearchTerm) return true;

    return (
      String(customer.customer_name || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(customer.phone || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(customer.event_name || "")
        .toLowerCase()
        .includes(activeSearchTerm) ||
      String(customer.referral_phone || "")
        .toLowerCase()
        .includes(activeSearchTerm)
    );
  });

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredCustomers.length);
    }
  }, [filteredCustomers.length, onCountChange]);

  const handleEdit = (customer) => {
    if (typeof onEdit === "function") {
      onEdit(customer);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Xóa khách hàng "${customer.customer_name}" khỏi danh sách?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("customer").delete().eq("id", customer.id);

      if (error) throw error;

      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
    } catch (error) {
      console.error("❌ Lỗi xóa khách hàng:", error);
      alert(`Không thể xóa khách hàng:\n${error?.message || "Lỗi không xác định"}`);
    }
  };

  const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

  const formatDate = (value) => {
    if (!value) return "";

    const digits = String(value).replace(/\D/g, "").slice(0, 8);

    if (digits.length !== 8) return value;

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  return (
    <div className="manager">
      <div className="list">
        {filteredCustomers.length === 0 ? (
          <div className="empty">
            <UsersRound size={32} />
            <span>Không có khách hàng phù hợp</span>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => (
            <div className="card" key={customer.id || `customer-${index}`}>
              <div className="info">
                <div className="row name">
                  {customer.customer_name || ""}
                  {customer.event_date && <span className="customer-birthday"> ({formatDate(customer.event_date)})</span>}
                </div>

                {customer.phone && (
                  <div className="row">
                    <span>Liên lạc: </span> {customer.phone}
                  </div>
                )}

                <div className="row">
                  <span>Bậc: </span>
                  <strong>
                    {customer.member_tier || "0"} {customer.member_percent ? `(${customer.member_percent}%)` : ""}
                  </strong>
                </div>

                {customer.referral_name || customer.referral_phone ? (
                  <div className="row">
                    <span>PR: </span>
                    {customer.referral_name || customer.referral_phone}
                  </div>
                ) : null}
              </div>

              <div className="card-footer">
                <button type="button" className="action-btn edit-btn" onClick={() => handleEdit(customer)}>
                  <Pencil size={16} />
                  Sửa
                </button>

                <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(customer)}>
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
