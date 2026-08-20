// src/constants/icons.js
// Bộ sưu tập Emoji toàn cục cho Phúc Group V2

export const EMOJI_ICONS = {
  // 5 Tab chính ở Footer
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
//Phần này là của cụm component trong tab Tools
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

export default {
  toolsServices,
};