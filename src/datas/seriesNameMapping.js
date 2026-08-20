// Bản đồ quy ước tên viết tắt sang tên đầy đủ của Series
export const seriesNameMapping = {
  tmqb: "Từ một quả Bóng",
  ccb: "Chuyện của Bóng",
  // Bạn có thể bổ sung thêm các series khác tùy ý ở đây
  
};

// Hàm hỗ trợ lấy tên hiển thị (nếu chưa có trong từ điển thì tự động viết hoa mã viết tắt)
export const getSeriesDisplayName = (seriesKey) => {
  if (!seriesKey) return "";
  const key = seriesKey.trim().toLowerCase();
  return seriesNameMapping[key] || seriesKey.toUpperCase();
};