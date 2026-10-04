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

  const totalDays = new Date(targetYear, targetMonth + 1, 0).getDate();

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
 * Chuẩn hóa ảnh trước khi upload.
 *
 * Chuẩn chung toàn hệ thống:
 * - Kích thước tối đa: 414px ở cạnh dài nhất.
 * - Không upscale ảnh nhỏ hơn 414px.
 * - Giữ nguyên tỷ lệ ảnh.
 * - Không crop.
 * - Chuyển sang WebP.
 * - Quality: 75.
 */
export const prepareImageForUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error("File ảnh không hợp lệ."));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("File tải lên không phải là ảnh."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const maxSize = 414;
        const longestSide = Math.max(image.width, image.height);
        const scale = Math.min(1, maxSize / longestSide);

        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Không thể xử lý ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("Không thể chuyển ảnh sang WebP."));
              return;
            }

            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;

            const webpFile = new File([blob], fileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          0.75,
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể đọc file ảnh."));
    };

    image.src = objectUrl;
  });
};

/**
 * Upload một file ảnh lên Supabase Storage.
 *
 * Flow chuẩn:
 *
 * File ảnh
 * ↓
 * prepareImageForUpload()
 * ↓
 * Resize tối đa 414px
 * ↓
 * WebP quality 75
 * ↓
 * Đổi tên file
 * ↓
 * Supabase Storage
 * ↓
 * Public URL
 *
 * Bucket:
 * events-images
 */
export const uploadImageToStorage = async (file, folder = "content") => {
  if (!(file instanceof File)) {
    throw new Error("File ảnh không hợp lệ.");
  }

  const preparedFile = await prepareImageForUpload(file);

  const filePath = `${folder}/${preparedFile.name}`;

  const { error: uploadError } = await supabase.storage.from("events-images").upload(filePath, preparedFile, {
    cacheControl: "3600",
    upsert: false,
    contentType: "image/webp",
  });

  if (uploadError) {
    console.error("❌ Upload image error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("events-images").getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Không lấy được URL ảnh từ Supabase Storage.");
  }

  return data.publicUrl;
};

/**
 * Upload nhiều ảnh lên Supabase Storage.
 *
 * Tất cả ảnh đều đi qua uploadImageToStorage(),
 * nên đều được chuẩn hóa thành WebP trước khi upload.
 *
 * Trả về:
 * [
 *   "https://...webp",
 *   "https://...webp",
 *   ...
 * ]
 */
export const uploadImagesToStorage = async (files = [], folder = "content") => {
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

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));

  const downloadAnchor = document.createElement("a");

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `backup_data_${getCurrentDateFormatted()}.json`);

  document.body.appendChild(downloadAnchor);

  downloadAnchor.click();
  downloadAnchor.remove();
};
