import { supabase } from "../components/utils/supabaseClient";

// Lấy các món quà đang được phép xuất hiện trên vòng quay
// Chỉ lấy món đang active và còn hàng.
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
// Không lọc is_active / quantity vì Admin cần nhìn thấy cả hàng hết kho.
export async function fetchAllPrizesFromCloud() {
  try {
    const { data, error } = await supabase
      .from("prizes")
      .select("*");

    if (error) {
      console.error("LỖI FETCH ALL PRIZES:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("LỖI KẾT NỐI PRIZES:", err);
    return [];
  }
}

// Hàm chọn ngẫu nhiên có trọng số (Weighted Random) cho BASIC mode
// Ưu tiên cost thấp, quantity, priority nhưng vẫn đảm bảo tính random
// và soft cap trùng lặp (tối đa 4 lần / 8 slot).
function selectBasicWeighted(items, count = 8) {
  const result = [];
  const countsMap = {};

  // Pool hợp lệ cố định để fallback luôn chỉ lấy món còn hàng.
  const validPool = items.filter(
    (i) => i.is_active && i.quantity > 0
  );

  if (validPool.length === 0) {
    return [];
  }

  // Pool runtime có thể bị thu hẹp khi một món đạt soft cap.
  let pool = [...validPool];

  while (result.length < count && pool.length > 0) {
    // Tính runtime weight cho từng item
    const weightedPool = pool.map((item) => {
      let baseWeight = item.quantity;

      // Cost thấp được tăng trọng số để ưu tiên tối ưu chi phí.
      if (item.priority || item.unit_cost < 5000) {
        baseWeight *= 3.5;
      } else {
        // Cost cao giảm trọng số một cách kiểm soát.
        baseWeight = Math.max(
          1,
          baseWeight / (Math.log10(item.unit_cost + 1) || 1)
        );
      }

      return {
        item,
        weight: Math.max(0.1, baseWeight),
      };
    });

    const totalWeight = weightedPool.reduce(
      (sum, wp) => sum + wp.weight,
      0
    );

    let randomVal = Math.random() * totalWeight;
    let selected = weightedPool[0].item;

    for (const wp of weightedPool) {
      if (randomVal < wp.weight) {
        selected = wp.item;
        break;
      }

      randomVal -= wp.weight;
    }

    // Kiểm tra soft cap: tối đa 4 lần trong 8 slot.
    const currentCount = countsMap[selected.id] || 0;

    if (currentCount < 4) {
      result.push(selected);
      countsMap[selected.id] = currentCount + 1;
    } else {
      // Đã đạt soft cap thì loại tạm khỏi pool của lượt chọn hiện tại.
      pool = pool.filter((i) => i.id !== selected.id);
    }
  }

  // Fallback nếu pool runtime hết trước khi đủ 8 slot.
  // Chỉ lấy từ validPool để tuyệt đối không đưa món hết kho
  // hoặc inactive quay trở lại vòng quay.
  while (result.length < count && validPool.length > 0) {
    const randomItem =
      validPool[Math.floor(Math.random() * validPool.length)];

    result.push(randomItem);
  }

  return result;
}

// Hàm chọn ngẫu nhiên cân bằng (Equal-ish Weight) cho PREMIUM mode
function selectPremiumEqual(items, count = 8) {
  const pool = items.filter(
    (i) => i.is_active && i.quantity > 0
  );

  if (pool.length === 0) {
    return [];
  }

  const result = [];

  // Gần equal-weight:
  // mỗi item có trọng số gần như tương đương,
  // chỉ nhân nhẹ với quantity sẵn có.
  while (result.length < count) {
    const weightedPool = pool.map((item) => ({
      item,
      weight: 1 + Math.min(item.quantity, 10) * 0.1,
    }));

    const totalWeight = weightedPool.reduce(
      (sum, wp) => sum + wp.weight,
      0
    );

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
  }

  return selectPremiumEqual(allPrizes, 8);
}