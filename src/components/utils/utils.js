// ==========================================
// UTILS.JS - CÁC HÀM TIỆN ÍCH DÙNG CHUNG
// ==========================================

import { supabase } from "./supabaseClient";

// ============================================================
// CURRENCY
// ============================================================

/**
 * Định dạng số tiền sang chuẩn tiền tệ (VNĐ)
 * Ví dụ: 1250000 -> "1.250.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// ============================================================
// DATE
// ============================================================

/**
 * Lấy ngày tháng hiện tại theo định dạng DD/MM/YYYY.
 *
 * NOTE:
 * - Tên function hiện tại là getCurrentDateFormatted.
 * - Comment cũ ghi YYYY-MM-DD nhưng function thực tế trả DD/MM/YYYY.
 * - Chưa đổi tên function để tránh ảnh hưởng code đang sử dụng.
 */
export function getCurrentDateFormatted() {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Xử lý dynamicDate:
 * Tạo danh sách các ngày trong tháng hiện tại hoặc tháng được chọn.
 *
 * Phục vụ cho việc hiển thị Grid theo ngày.
 */
export const getDaysInCurrentMonth = (year, month) => {
  const now = new Date();

  const targetYear = year || now.getFullYear();
  const targetMonth = month !== undefined ? month : now.getMonth();

  const totalDays = new Date(
    targetYear,
    targetMonth + 1,
    0
  ).getDate();

  const daysList = [];

  for (let i = 1; i <= totalDays; i++) {
    const dayStr = String(i).padStart(2, "0");
    const monthStr = String(targetMonth + 1).padStart(2, "0");

    daysList.push({
      dateString: `${targetYear}-${monthStr}-${dayStr}`,
      dayNumber: i,
      display: `${dayStr}/${monthStr}`,
    });
  }

  return daysList;
};

// ============================================================
// IMAGE
// ============================================================

/**
 * Upload một file ảnh lên Supabase Storage.
 *
 * Bucket:
 * events-images
 *
 * Kết quả trả về URL public thật của ảnh.
 *
 * QUAN TRỌNG:
 * Không sử dụng URL.createObjectURL() để lưu database.
 *
 * Flow chuẩn:
 *
 * File
 * ↓
 * Supabase Storage
 * ↓
 * Public URL
 * ↓
 * services.images
 * ↓
 * services.image_url = ảnh đầu tiên
 *
 * NOTE:
 * - Đây là phần chuẩn bị để loại bỏ hoàn toàn blob URL.
 * - ContentPopup sẽ được cập nhật ở bước tiếp theo để sử dụng
 *   hàm này.
 */
export const uploadImageToStorage = async (
  file,
  folder = "content"
) => {
  if (!(file instanceof File)) {
    throw new Error("File ảnh không hợp lệ.");
  }

  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${fileExtension}`;

  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("events-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("❌ Upload image error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("events-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Không lấy được URL ảnh từ Supabase Storage.");
  }

  return data.publicUrl;
};

/**
 * Upload nhiều ảnh lên Supabase Storage.
 *
 * Trả về:
 * [
 *   "https://...webp",
 *   "https://...webp",
 *   ...
 * ]
 *
 * NOTE:
 * - Chưa ép định dạng WebP tại đây.
 * - Nếu flow cũ có bước nén/chuyển ảnh sang WebP,
 *   sẽ xử lý riêng sau khi xác định lại flow cũ.
 */
export const uploadImagesToStorage = async (
  files = [],
  folder = "content"
) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploadedImages = [];

  for (const file of files) {
    const publicUrl = await uploadImageToStorage(file, folder);

    uploadedImages.push(publicUrl);
  }

  return uploadedImages;
};

/**
 * Kiểm tra một giá trị có phải blob URL hay không.
 *
 * Dùng để phát hiện dữ liệu ảnh tạm thời trước khi lưu database.
 */
export const isBlobUrl = (value) => {
  return typeof value === "string" && value.startsWith("blob:");
};

/**
 * NOTE - IMAGE FLOW CẦN XỬ LÝ TIẾP:
 *
 * Hiện tại ContentPopup đang:
 *
 * file
 * ↓
 * URL.createObjectURL(file)
 * ↓
 * blob:https://...
 * ↓
 * setImages()
 *
 * Đây là nguyên nhân gây lỗi.
 *
 * Flow mới cần là:
 *
 * file
 * ↓
 * uploadImagesToStorage()
 * ↓
 * https://...supabase.co/storage/...
 * ↓
 * setImages()
 * ↓
 * onSave()
 *
 * Tuyệt đối không lưu blob URL vào Supabase.
 */

// ============================================================
// PHONE
// ============================================================

/**
 * Che giấu thông tin nhạy cảm (Masking cho Số điện thoại)
 * Ví dụ: "0912345678" -> "09******78"
 */
export const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 6) return phone;

  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const maskedMiddle = "*".repeat(phone.length - 4);

  return `${start}${maskedMiddle}${end}`;
};

// ============================================================
// LOCAL STORAGE
// ============================================================

/**
 * Lưu dữ liệu vào localStorage an toàn.
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi lưu LocalStorage:", error);
  }
};

/**
 * Đọc dữ liệu từ localStorage an toàn.
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);

    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Lỗi khi đọc LocalStorage:", error);

    return defaultValue;
  }
};

// ============================================================
// BACKUP
// ============================================================

/**
 * Xuất dữ liệu toàn bộ localStorage ra file JSON.
 *
 * NOTE:
 * - Đang giữ nguyên.
 * - Sau này nếu không còn sử dụng sẽ rà lại toàn project
 *   trước khi xóa.
 */
export const exportLocalStorageToJson = () => {
  const data = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    data[key] = JSON.parse(localStorage.getItem(key));
  }

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2));

  const downloadAnchor = document.createElement("a");

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `backup_data_${getCurrentDateFormatted()}.json`
  );

  document.body.appendChild(downloadAnchor);

  downloadAnchor.click();
  downloadAnchor.remove();
};