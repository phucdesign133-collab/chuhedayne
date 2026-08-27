// src/datas/data.js
export const dataLuckySpinParty = {
  partyInfo: {
    title: "Lucky Spin Party",
    description: "Chào mừng bạn đến với sự kiện quay số may mắn!",
  },
  stages: [
    { id: 1, name: "Stage Performance One", date: "OCT 16, 2025" },
    { id: 2, name: "Stage Performance Two", date: "NOV 12, 2025" },
  ],
};

// Đây là nơi chứa logic cuộn trang duy nhất
export const scrollToTopSmooth = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// Danh sách quà tặng Basic cho vòng quay thường
export const BASIC_PRIZES = [
  { text: "Bút Chì Màu May Mắn", image: "gift-chinho.webp" },
  { text: "Túi Mù Mini Trend", image: "gift-tuimu.webp" },
  { text: "Bút Sáp Màu", image: "gift-sapmau.webp" },
  { text: "Móc Khóa Nhỏ", image: "gift-mockhoa.webp" },
  { text: "Thun Cột Tóc Đáng Yêu", image: "gift-thuncottoc.webp" },
  { text: "Bộ Thẻ Bài Ma Thuật", image: "gift-thebai.webp" },
  { text: "Hình Dán Sticker", image: "gift-sticker.webp" },
  { text: "Vòng Đeo Tay Candy", image: "gift-vongtay.webp" },
];

// Danh sách quà tặng Premium cho vòng quay VIP (khi nhập tên và ngày sinh bé)
export const PREMIUM_PRIZES = [
  { text: "VOUCHER 50k", image: "gift-50.webp" },
  { text: "VOUCHER 100k", image: "gift-100.webp" },
  { text: "VOUCHER 200k", image: "gift-200.webp" },
  { text: "VOUCHER 300k", image: "gift-300.webp" },
  { text: "VOUCHER 50k", image: "gift-50.webp" },
  { text: "VOUCHER 100k", image: "gift-100.webp" },
  { text: "VOUCHER 200k", image: "gift-200.webp" },
  { text: "SIÊU VOUCHER 500K", image: "gift-500.webp" },
];