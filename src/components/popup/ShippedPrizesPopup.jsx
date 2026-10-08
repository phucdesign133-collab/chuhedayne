import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export default function ShippedPrizesPopup({ onClose, onSave, initialData = null }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([
    {
      code: "",
      name: "",
    },
  ]);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setCustomerName("");
      setPhone("");
      setAddress("");
      setItems([
        {
          code: "",
          name: "",
        },
      ]);
      setNote("");
      return;
    }

    setCustomerName(initialData.customer_name || "");
    setPhone(initialData.phone || "");
    setAddress(initialData.address || "");
    setNote(initialData.note || "");

    let loadedItems = [];

    if (Array.isArray(initialData.items)) {
      loadedItems = initialData.items.map((item) => ({
        code: item?.code || "",
        name: item?.name || item?.gift_name || item?.title || "",
      }));
    }

    if (loadedItems.length === 0) {
      loadedItems = [
        {
          code: "",
          name: "",
        },
      ];
    }

    setItems(loadedItems);
  }, [initialData]);

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        code: "",
        name: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return [
          {
            code: "",
            name: "",
          },
        ];
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    try {
      setIsSaving(true);

      const cleanedItems = items
        .map((item) => ({
          code: (item.code || "").trim(),
          name: (item.name || "").trim(),
        }))
        .filter((item) => item.code || item.name);

      const formData = {
        id: initialData?.id || null,

        customer_name: customerName.trim(),

        phone: phone.replace(/\D/g, ""),

        address: address.trim(),

        items: cleanedItems,

        note: note.trim(),
      };

      const result = await onSave(formData);

      if (!result?.success) {
        throw result?.error || new Error("Không thể lưu dữ liệu.");
      }
    } catch (error) {
      console.error("❌ Lỗi lưu quà đã soạn:", error);

      alert(error?.message || "Không thể lưu thông tin quà đã soạn.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      <div className="popup-row">
        <label className="popup-label">Tên khách hàng</label>

        <input className="popup-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={isSaving} />
      </div>

      <div className="popup-row">
        <label className="popup-label">Số điện thoại</label>

        <input
          className="popup-input"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          disabled={isSaving}
        />
      </div>

      <div className="popup-row">
        <label className="popup-label">Quà đã đổi</label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(130px, 1fr) minmax(180px, 2fr) 34px 34px",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <input
                className="popup-input"
                placeholder="Mã code"
                value={item.code}
                onChange={(e) => updateItem(index, "code", e.target.value)}
                disabled={isSaving}
              />

              <input
                className="popup-input"
                placeholder="Tên quà"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                disabled={isSaving}
              />

              <button
                type="button"
                onClick={addItemRow}
                disabled={isSaving}
                aria-label="Thêm quà"
                style={{
                  width: "34px",
                  height: "34px",
                  padding: 0,
                  border: "none",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isSaving ? "default" : "pointer",
                }}
              >
                <Plus size={17} />
              </button>

              <button
                type="button"
                onClick={() => removeItemRow(index)}
                disabled={isSaving || items.length === 1}
                aria-label="Xóa quà"
                style={{
                  width: "34px",
                  height: "34px",
                  padding: 0,
                  border: "none",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isSaving || items.length === 1 ? "default" : "pointer",
                  opacity: items.length === 1 ? 0.35 : 1,
                }}
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="popup-row">
        <label className="popup-label">Địa chỉ</label>

        <textarea className="popup-input popup-textarea" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSaving} />
      </div>

      <div className="popup-row">
        <label className="popup-label">Ghi chú</label>

        <textarea className="popup-input popup-textarea" value={note} onChange={(e) => setNote(e.target.value)} disabled={isSaving} />
      </div>

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang đẩy lên mây..." : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}
