import React, { useEffect, useState } from "react";

const createEmptyGift = () => ({
  text: "",
  gift_code: "",
  addNext: false,
});

const createEmptyForm = () => ({
  items: [createEmptyGift()],
  customer_name: "",
  phone: "",
  address: "",
});

export default function BillPopup({ onClose, onSave, initialData = null }) {
  const [items, setItems] = useState([createEmptyGift()]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // RESET / LOAD
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      const empty = createEmptyForm();

      setItems(empty.items);
      setCustomerName(empty.customer_name);
      setPhone(empty.phone);
      setAddress(empty.address);

      return;
    }

    const existingItems = Array.isArray(initialData.items) ? initialData.items : [];

    const mappedItems =
      existingItems.length > 0
        ? existingItems.map((item, index) => ({
            text: String(item?.text || item?.name || "").trim(),
            gift_code: String(item?.gift_code || "").trim(),
            addNext: index < existingItems.length - 1,
          }))
        : [createEmptyGift()];

    setItems(mappedItems);

    setCustomerName(String(initialData.customer_name || initialData.name || initialData.receiver_name || "").trim());

    setPhone(String(initialData.phone || "").trim());

    setAddress(String(initialData.address || "").trim());
  }, [initialData]);

  // ============================================================
  // ITEM
  // ============================================================

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const handleAddNextGift = (index, checked) => {
    setItems((current) => {
      const next = current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          addNext: checked,
        };
      });

      if (checked && index === current.length - 1) {
        next.push(createEmptyGift());
      }

      return next;
    });
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (typeof onSave !== "function") {
      alert("Không thể lưu bill.");
      return;
    }

    const validItems = items
      .map((item) => ({
        text: String(item.text || "").trim(),
        gift_code: String(item.gift_code || "").trim(),
      }))
      .filter((item) => item.text || item.gift_code);

    if (validItems.length === 0) {
      alert("Vui lòng nhập ít nhất một món quà.");
      return;
    }

    const formData = {
      id: initialData?.id || null,
      customer_name: customerName.trim(),
      phone: phone.replace(/\D/g, "").slice(0, 10),
      address: address.trim(),
      items: validItems,
    };

    setIsSaving(true);

    try {
      const result = await onSave(formData);

      if (!result || result.success !== true) {
        throw result?.error || new Error("Không thể lưu bill.");
      }

      onClose();
    } catch (error) {
      console.error("❌ BillPopup save error:", error);

      alert(`Không thể lưu bill:\n${error?.message || "Lỗi không xác định"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="popup-form">
      {/* ======================================================
          QUÀ
      ====================================================== */}

      <div className="popup-form">
        {items.map((item, index) => (
          <div key={`bill-gift-${index}`} className="popup-inline">
            <input
              className="popup-input"
              placeholder="Tên quà"
              value={item.text}
              onChange={(event) => updateItem(index, "text", event.target.value)}
              disabled={isSaving}
            />

            <input
              className="popup-input"
              placeholder="Mã quà"
              value={item.gift_code}
              onChange={(event) => updateItem(index, "gift_code", event.target.value)}
              disabled={isSaving}
            />

            <div className="popup-checkbox">
              <input
                type="checkbox"
                checked={Boolean(item.addNext)}
                onChange={(event) => handleAddNextGift(index, event.target.checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================
          KHÁCH
      ====================================================== */}

      <div className="popup-inline">
        <input
          className="popup-input"
          placeholder="Tên"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          disabled={isSaving}
        />

        <input
          className="popup-input"
          placeholder="SĐT"
          inputMode="numeric"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
          disabled={isSaving}
        />

        <input
          className="popup-input"
          placeholder="Địa chỉ"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="popup-footer">
        <button type="submit" className="popup-submit" disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu bill"}
        </button>
      </div>
    </form>
  );
}
