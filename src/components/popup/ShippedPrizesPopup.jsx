import React, { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export default function ShippedPrizesPopup({
  onClose,
  onSave,
  initialData = null,
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState([]);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  useEffect(() => {
    if (!initialData) {
      setCustomerName("");
      setPhone("");
      setAddress("");
      setImages([]);
      setNote("");
      return;
    }

    setCustomerName(initialData.customer_name || "");
    setPhone(initialData.phone || "");
    setAddress(initialData.address || "");

    setImages(
      Array.isArray(initialData.images)
        ? initialData.images
        : []
    );

    setNote(initialData.note || "");
  }, [initialData]);

  // ============================================================
  // IMAGE
  // ============================================================

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    try {
      const newImages = [];

      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        newImages.push(dataUrl);
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("❌ Lỗi đọc ảnh:", error);
      alert("Không thể đọc hình ảnh.");
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!customerName.trim()) {
      alert("Vui lòng nhập tên khách hàng.");
      return;
    }

    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!address.trim()) {
      alert("Vui lòng nhập địa chỉ.");
      return;
    }

    try {
      setIsSaving(true);

      const formData = {
        id: initialData?.id || null,

        customer_name: customerName.trim(),

        phone: phone.replace(/\D/g, ""),

        address: address.trim(),

        images,

        note: note.trim(),
      };

      const result = await onSave(formData);

      if (!result?.success) {
        throw result?.error || new Error("Không thể lưu dữ liệu.");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi lưu quà đã gửi:",
        error
      );

      alert(
        error?.message ||
          "Không thể lưu thông tin quà đã gửi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // BODY
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="popup-form"
    >
      {/* TÊN KHÁCH HÀNG */}

      <div className="popup-row">
        <label className="popup-label">
          Tên khách hàng
        </label>

        <input
          className="popup-input"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* SỐ ĐIỆN THOẠI */}

      <div className="popup-row">
        <label className="popup-label">
          Số điện thoại
        </label>

        <input
          className="popup-input"
          inputMode="numeric"
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value.replace(/\D/g, "")
            )
          }
          disabled={isSaving}
        />
      </div>

      {/* ĐỊA CHỈ */}

      <div className="popup-row">
        <label className="popup-label">
          Địa chỉ
        </label>

        <textarea
          className="popup-input popup-textarea"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* HÌNH ẢNH ĐÓNG GÓI */}

      <div className="popup-row">
        <label className="popup-label">
          Ảnh đóng gói
        </label>

        <div>
          <label
            className="popup-image-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: isSaving
                ? "default"
                : "pointer",
            }}
          >
            <ImagePlus size={18} />
            Thêm ảnh

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageChange}
              disabled={isSaving}
            />
          </label>

          {images.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(90px, 1fr))",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                  }}
                >
                  <img
                    src={image}
                    alt={`Ảnh đóng gói ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      display: "block",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage(index)
                    }
                    disabled={isSaving}
                    aria-label="Xóa ảnh"
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "24px",
                      height: "24px",
                      padding: 0,
                      border: "none",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GHI CHÚ */}

      <div className="popup-row">
        <label className="popup-label">
          Ghi chú
        </label>

        <textarea
          className="popup-input popup-textarea"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          disabled={isSaving}
        />
      </div>

      {/* FOOTER */}

      <div className="popup-footer">
        <button
          type="submit"
          className="popup-submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Đang đẩy lên mây..."
            : "Lưu lại"}
        </button>
      </div>
    </form>
  );
}