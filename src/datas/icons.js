// src/datas/icons.js
// Bộ sưu tập Emoji toàn cục và dữ liệu HubIcon cho Phúc Group V2

export const EMOJI_ICONS = {
  // 5 Tab chính ở Footer Admin
  home: "🏠",
  gallery: "🖼️",
  balloon: "🎈",
  spin: "🎡",
  tools: "🛠️",

  // Các icon dùng chung cho tính năng / trạng thái
  adminLock: "🔒",
  adminUnlock: "🔓",
  calculator: "🧮",
  upload: "📤",
  success: "✅",
  error: "❌",
  loading: "⏳",
  realtime: "⚡",
  settings: "⚙️",
  user: "👤",
  
  // Icon bổ sung cho các tab chuyên môn
  finance: "💰",
  goal: "🎯",
  social: "📱",
  supplies: "📦",
};

// Phần cụm component/tiện ích riêng trong tab Tools
export const toolsServices = [
  { id: 1, name: "Create Invoice", icon: "📄", bg: "#ede9fe" },
  { id: 2, name: "Pay Bills", icon: "📑", bg: "#fef3c7" },
  { id: 3, name: "Bank Transfer", icon: "🏛️", bg: "#fee2e2" },
  { id: 4, name: "Savings", icon: "⏰", bg: "#f3e8ff" },
  { id: 5, name: "Electricity", icon: "💡", bg: "#ffe4e6" },
  { id: 6, name: "Movie", icon: "🎬", bg: "#ede9fe" },
  { id: 7, name: "Add Money", icon: "💳", bg: "#dbeafe" },
  { id: 8, name: "Máy tính", icon: "🔗", bg: "#fef9c3" },
];

// Dữ liệu HubIcon cho 5 tab quản lý lớn ở Admin
// src/datas/icons.js
// HubIcon data cho các tab quản lý trong Admin

export const hubData = {
  content: {
    title: "Quản lý Nội dung",
    themeColor: "#5DADE2", // Tông màu nền sáng nhẹ riêng cho tab Nội dung
    sections: [
      {
        sectionName: "Sự kiện",
        items: [
          { id: "birthday", name: "Sinh nhật", icon: "🎂", path: "/admin/content/birthday" },
          { id: "wedding", name: "Cưới", icon: "💍", path: "/admin/content/wedding" },
          { id: "thoinoni", name: "Thôi nôi", icon: "👶", path: "/admin/content/thoinoni" },
          { id: "tuthien", name: "Từ thiện", icon: "🤝", path: "/admin/content/tuthien" },
          { id: "khaitruong", name: "Khai trương", icon: "🎊", path: "/admin/content/khaitruong" },
          { id: "trangtri", name: "Trang trí", icon: "🎈", path: "/admin/content/trangtri" },
          { id: "lehoi", name: "Lễ hội", icon: "🏮", path: "/admin/content/lehoi" },
          { id: "mungtho", name: "Mừng thọ", icon: "🧧", path: "/admin/content/mungtho" },
          { id: "yearendparty", name: "Year End Party", icon: "🥂", path: "/admin/content/yearendparty" },
          { id: "workshop", name: "Workshop", icon: "🎙️", path: "/admin/content/workshop" },
          { id: "brand", name: "Sự kiện Brand", icon: "🌟", path: "/admin/content/brand" },
          { id: "daythang", name: "Đầy tháng", icon: "🍼", path: "/admin/content/daythang" },
          { id: "khaigiang", name: "Khai giảng", icon: "📚", path: "/admin/content/khaigiang" },
          // ... các mục khác
        ]
      },
      {
        sectionName: "Thiết kế",
        items: [
          { id: "logo", name: "Logo", icon: "✏️", path: "/admin/content/logo" },
          { id: "sticker-label", name: "Sticker & Label", icon: "🏷️", path: "/admin/content/sticker-label" },
          { id: "signage", name: "Signage", icon: "🪧", path: "/admin/content/signage" },
          { id: "business-card", name: "Business Card", icon: "📇", path: "/admin/content/business-card" },
          { id: "web-app-ui", name: "Web/App UI", icon: "📱", path: "/admin/content/web-app-ui" },
          { id: "packaging", name: "Packaging", icon: "📦", path: "/admin/content/packaging" },
          { id: "voucher", name: "Voucher", icon: "🎫", path: "/admin/content/voucher" },
          { id: "posm-display", name: "POSM Display", icon: "🛍️", path: "/admin/content/posm-display" },
          { id: "uniform", name: "Uniform", icon: "👕", path: "/admin/content/uniform" },
          { id: "booths", name: "Booths", icon: "🏛️", path: "/admin/content/booths" },
          { id: "templates", name: "Templates", icon: "📋", path: "/admin/content/templates" },
        ]
      },
      {
        sectionName: "Mạng Xã Hội",
        items: [
          { id: "facebook", name: "Facebook", icon: "📘", path: "/admin/content/facebook" },
          { id: "tiktok", name: "TikTok", icon: "🎬", path: "/admin/content/tiktok" },
          { id: "youtube", name: "YouTube", icon: "▶️", path: "/admin/content/youtube" },
          { id: "instagram", name: "Instagram", icon: "📸", path: "/admin/content/instagram" },
        ]
      },
      {
        sectionName: "Bảng giá",
        items: [
          { id: "price-trang-tri", name: "Trang trí", icon: "✨", path: "/admin/content/price-trang-tri" },
          { id: "price-tiec", name: "Tiệc", icon: "🍽️", path: "/admin/content/price-tiec" },
        ]
      }
    ]
  },
  booking: {
    title: "Quản lý Booking",
    themeColor: "#f0f2f5",
    sections: [] // Tạm thời thu gọn chưa có dữ liệu
  },
  warehouse: {
    title: "Quản lý Kho",
    themeColor: "#f0f2f5",
    sections: [] // Tạm thời thu gọn chưa có dữ liệu
  },
  finance: {
    title: "Quản lý Tài chính",
    themeColor: "#f0f2f5",
    sections: [] // Tạm thời thu gọn chưa có dữ liệu
  },
  tools: {
    title: "Công cụ Hệ thống",
    themeColor: "#f0f2f5",
    sections: [
      {
        sectionName: "Tiện ích & Cài đặt",
        items: [
          { id: "logout", name: "Đăng xuất", icon: "🚪", path: "/logout" },
          { id: "settings", name: "Cài đặt chung", icon: "⚙️", path: "/admin/tools/settings" },
        ]
      }
    ]
  }
};
export default {
  EMOJI_ICONS,
  toolsServices,
  hubData,
};