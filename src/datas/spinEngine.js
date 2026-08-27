import { supabase } from "../components/utils/supabaseClient"; // Giả định file khởi tạo supabase client của anh ở đây

// Fallback 16 món hiện tại (gồm 8 basic và 8 premium cũ) theo spec mục 20
export const FALLBACK_PRIZES = [
  // Nhóm chi phí thấp / cơ bản (unit_cost giả định < 5k để priority = true)
  { id: "fb-1", text: "Bút Chì Màu May Mắn", icon: "✏️", image: "gift-chinho.webp", quantity: 100, unit_cost: 2000, priority: true, is_active: true, note: "fallback" },
  { id: "fb-2", text: "Túi Mù Mini Trend", icon: "🎒", image: "gift-tuimu.webp", quantity: 50, unit_cost: 4000, priority: true, is_active: true, note: "fallback" },
  { id: "fb-3", text: "Bút Sáp Màu", icon: "🖍️", image: "gift-sapmau.webp", quantity: 80, unit_cost: 3000, priority: true, is_active: true, note: "fallback" },
  { id: "fb-4", text: "Móc Khóa Nhỏ", icon: "🔑", image: "gift-mockhoa.webp", quantity: 120, unit_cost: 1500, priority: true, is_active: true, note: "fallback" },
  { id: "fb-5", text: "Thun Cột Tóc Đáng Yêu", icon: "🎀", image: "gift-thuncottoc.webp", quantity: 200, unit_cost: 1000, priority: true, is_active: true, note: "fallback" },
  { id: "fb-6", text: "Bộ Thẻ Bài Ma Thuật", icon: "🃏", image: "gift-thebai.webp", quantity: 60, unit_cost: 4500, priority: true, is_active: true, note: "fallback" },
  { id: "fb-7", text: "Hình Dán Sticker", icon: "🏷️", image: "gift-sticker.webp", quantity: 150, unit_cost: 1200, priority: true, is_active: true, note: "fallback" },
  { id: "fb-8", text: "Vòng Đeo Tay Candy", icon: "🍬", image: "gift-vongtay.webp", quantity: 90, unit_cost: 2500, priority: true, is_active: true, note: "fallback" },

  // Nhóm giá trị cao hơn / premium (unit_cost >= 5k, priority = false)
  { id: "fb-9", text: "VOUCHER 50k", icon: "🎟️", image: "gift-50.webp", quantity: 20, unit_cost: 50000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-10", text: "VOUCHER 100k", icon: "🎟️", image: "gift-100.webp", quantity: 15, unit_cost: 100000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-11", text: "VOUCHER 200k", icon: "🎟️", image: "gift-200.webp", quantity: 10, unit_cost: 200000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-12", text: "VOUCHER 300k", icon: "🎟️", image: "gift-300.webp", quantity: 5, unit_cost: 300000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-13", text: "VOUCHER 50k", icon: "🎟️", image: "gift-50.webp", quantity: 20, unit_cost: 50000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-14", text: "VOUCHER 100k", icon: "🎟️", image: "gift-100.webp", quantity: 15, unit_cost: 100000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-15", text: "VOUCHER 200k", icon: "🎟️", image: "gift-200.webp", quantity: 10, unit_cost: 200000, priority: false, is_active: true, note: "fallback" },
  { id: "fb-16", text: "SIÊU VOUCHER 500K", icon: "👑", image: "gift-500.webp", quantity: 2, unit_cost: 500000, priority: false, is_active: true, note: "fallback" },
];

export async function fetchPrizesFromCloud() {
  try {
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .eq("is_active", true)
      .gt("quantity", 0);

    if (error) {
      console.error("Lỗi tải prizes từ Supabase:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Lỗi kết nối prizes:", err);
    return [];
  }
}
// Lấy TOÀN BỘ kho quà cho Admin
// Không lọc is_active / quantity vì Admin cần nhìn thấy cả hàng hết kho
export async function fetchAllPrizesFromCloud() {
  try {
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Lỗi tải toàn bộ prizes từ Supabase:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Lỗi kết nối toàn bộ prizes:", err);
    return [];
  }
}
// Hàm chọn ngẫu nhiên có trọng số (Weighted Random) cho BASIC mode
// Ưu tiên cost thấp, quantity, priority nhưng vẫn đảm bảo tính random và soft cap trùng lặp (tối đa 4 lần/8 slot)
function selectBasicWeighted(items, count = 8) {
  const result = [];
  const countsMap = {}; // Theo dõi số lần xuất hiện để áp dụng soft cap

  // Lọc các item hợp lệ
  let pool = items.filter(i => i.is_active && i.quantity > 0);
  if (pool.length === 0) return items.slice(0, count);

  while (result.length < count && pool.length > 0) {
    // Tính runtime weight cho từng item
    const weightedPool = pool.map(item => {
      let baseWeight = item.quantity;
      // Cost thấp được tăng trọng số để ưu tiên tối ưu chi phí (theo spec)
      if (item.priority || item.unit_cost < 5000) {
        baseWeight *= 3.5; 
      } else {
        // Cost cao giảm trọng số một cách kiểm soát (không tuyến tính tuyệt đối)
        baseWeight = Math.max(1, baseWeight / (Math.log10(item.unit_cost + 1) || 1));
      }
      return { item, weight: Math.max(0.1, baseWeight) };
    });

    const totalWeight = weightedPool.reduce((sum, wp) => sum + wp.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selected = weightedPool[0].item;

    for (const wp of weightedPool) {
      if (randomVal < wp.weight) {
        selected = wp.item;
        break;
      }
      randomVal -= wp.weight;
    }

    // Kiểm tra soft cap (tối đa 4 lần trong 8 slot)
    const currentCount = countsMap[selected.id] || 0;
    if (currentCount < 4) {
      result.push(selected);
      countsMap[selected.id] = currentCount + 1;
    } else {
      // Nếu đã đạt soft cap, tạm loại bỏ item này khỏi pool của lượt chọn hiện tại để tránh lặp quá nhiều
      pool = pool.filter(i => i.id !== selected.id);
    }
  }

  // Fallback nếu thiếu slot
  while (result.length < count && items.length > 0) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    result.push(randomItem);
  }

  return result;
}

// Hàm chọn ngẫu nhiên cân bằng (Equal-ish Weight) cho PREMIUM mode
function selectPremiumEqual(items, count = 8) {
  const pool = items.filter(i => i.is_active && i.quantity > 0);
  if (pool.length === 0) return items.slice(0, count);

  const result = [];
  // Gần equal-weight: mỗi item có trọng số gần như tương đương, chỉ nhân nhẹ với quantity sẵn có
  while (result.length < count) {
    const weightedPool = pool.map(item => ({
      item,
      weight: 1 + Math.min(item.quantity, 10) * 0.1 // Trọng số chênh lệch rất ít
    }));

    const totalWeight = weightedPool.reduce((sum, wp) => sum + wp.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selected = weightedPool[0].item;

    for (const wp of weightedPool) {
      if (randomVal < wp.weight) {
        selected = wp.item;
        break;
      }
      randomVal -= wp.weight;
    }
    result.push(selected);
  }

  return result;
}

// Hàm tạo currentRound tổng hợp gồm 8 item cho từng mode
export function generateCurrentRound(allPrizes, mode = "basic") {
  if (mode === "basic") {
    return selectBasicWeighted(allPrizes, 8);
  } else {
    return selectPremiumEqual(allPrizes, 8);
  }
}