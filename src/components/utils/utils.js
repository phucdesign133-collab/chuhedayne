// ==========================================
// UTILS.JS - CÁC HÀM TIỆN ÍCH DÙNG CHUNG
// ==========================================

/**
 * Định dạng số tiền sang chuẩn tiền tệ (VNĐ)
 * Ví dụ: 1250000 -> "1.250.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

/**
 * Lấy ngày tháng hiện tại theo định dạng chuẩn YYYY-MM-DD
 */
export function getCurrentDateFormatted() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  // Trả về định dạng dd/mm/yyyy
  return `${day}/${month}/${year}`;
}

/**
 * Xử lý dynamicDate: Tạo danh sách các ngày trong tháng hiện tại hoặc tháng được chọn
 * Phục vụ cho việc hiển thị Grid theo ngày
 */
export const getDaysInCurrentMonth = (year, month) => {
  // Nếu không truyền vào thì lấy tháng/năm hiện tại của hệ thống
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== undefined ? month : now.getMonth();

  // Số ngày trong tháng (truyền day = 0 của tháng kế tiếp sẽ ra ngày cuối cùng của tháng hiện tại)
  const totalDays = new Date(targetYear, targetMonth + 1, 0).getDate();
  
  const daysList = [];
  for (let i = 1; i <= totalDays; i++) {
    const dayStr = String(i).padStart(2, '0');
    const monthStr = String(targetMonth + 1).padStart(2, '0');
    daysList.push({
      dateString: `${targetYear}-${monthStr}-${dayStr}`,
      dayNumber: i,
      display: `${dayStr}/${monthStr}`
    });
  }
  return daysList;
};

/**
 * Che giấu thông tin nhạy cảm (Masking cho Số điện thoại)
 * Ví dụ: "0912345678" -> "09******78"
 */
export const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 6) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const maskedMiddle = '*'.repeat(phone.length - 4);
  return `${start}${maskedMiddle}${end}`;
};

/**
 * Lưu dữ liệu vào localStorage an toàn
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi lưu LocalStorage:", error);
  }
};

/**
 * Đọc dữ liệu từ localStorage an toàn
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

/**
 * Xuất dữ liệu toàn bộ localStorage ra file JSON (Backup / Export Data)
 */
export const exportLocalStorageToJson = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = JSON.parse(localStorage.getItem(key));
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `backup_data_${getCurrentDateFormatted()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};