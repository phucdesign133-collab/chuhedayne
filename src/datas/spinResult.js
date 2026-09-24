// src/datas/spinResult.js
import { supabase } from "../components/utils/supabaseClient";

// ==========================================
// SINH GIFT CODE CHDN
// ==========================================
// Một loại code duy nhất cho tất cả vòng quay.
// Form: CHDN-x
// Số lượng chữ số được chọn ngẫu nhiên.
// Code phải chưa tồn tại trong gift_codes.

export async function generateSpinCode() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const length = Math.floor(Math.random() * 8) + 1;
    let number = "";

    for (let i = 0; i < length; i++) {
      number += Math.floor(Math.random() * 10);
    }

    const code = `CHDN-${number}`;

    const { data, error } = await supabase.from("gift_codes").select("id").eq("code", code).limit(1);

    if (error) {
      console.error("Lỗi kiểm tra Gift Code:", error);
      continue;
    }

    if (!data || data.length === 0) {
      return code;
    }
  }

  throw new Error("Không thể tạo Gift Code mới. Vui lòng thử lại.");
}

// ==========================================
// TẠO KẾT QUẢ CỦA MỘT LẦN QUAY
// ==========================================
// Trả về đúng phần thưởng + GiftCode được sinh.
// GiftCode đã được kiểm tra không trùng database.

export async function createSpinResult(selectedPrize) {
  if (!selectedPrize) {
    return {
      prize: null,
      code: "",
    };
  }

  const code = await generateSpinCode();

  return {
    prize: selectedPrize,
    code,
  };
}

// ==========================================
// THÊM MỘT LẦN TRÚNG VÀO GIỎ CHỜ ĐỔI
// ==========================================
// Nếu cùng một món đã có trong giỏ:
// - tăng wonQuantity
// - giữ lại toàn bộ GiftCode trong wonCodes
//
// Nếu chưa có:
// - tạo món mới
// - GiftCode đầu tiên nằm trong wonCodes.
//
// Mỗi GiftCode đại diện cho đúng một lần trúng.
// Tuyệt đối không ghi đè GiftCode cũ.

export function addPendingGift(pendingGifts = [], spinResult) {
  if (!spinResult?.prize || !spinResult?.code) {
    return pendingGifts;
  }

  const selectedPrize = spinResult.prize;
  const code = spinResult.code;

  const existingIndex = pendingGifts.findIndex((gift) => gift.id === selectedPrize.id);

  if (existingIndex === -1) {
    return [
      ...pendingGifts,
      {
        ...selectedPrize,
        wonQuantity: 1,
        wonCodes: [code],
      },
    ];
  }

  return pendingGifts.map((gift, giftIndex) => {
    if (giftIndex !== existingIndex) {
      return gift;
    }

    return {
      ...gift,
      wonQuantity: (Number(gift.wonQuantity) || 0) + 1,
      wonCodes: [...(Array.isArray(gift.wonCodes) ? gift.wonCodes : []), code],
    };
  });
}

// ==========================================
// CHUẨN HÓA GIFT CODE
// ==========================================
// Dùng trước khi đưa dữ liệu vào bill.
// Đảm bảo:
// - luôn là array
// - bỏ giá trị rỗng
// - chuyển về string
// - không tự sinh thêm mã.

export function normalizeGiftCodes(gift) {
  if (!gift) {
    return [];
  }

  if (Array.isArray(gift.wonCodes)) {
    return gift.wonCodes.filter(Boolean).map((code) => String(code));
  }

  // Tương thích với dữ liệu cũ nếu có.
  if (gift.code || gift.gift_code) {
    return [String(gift.code || gift.gift_code)];
  }

  return [];
}

// ==========================================
// TẠO SNAPSHOT ITEM CHO BILLS
// ==========================================
// Đây là dữ liệu nghiệp vụ được chụp tại thời điểm
// khách thực sự tạo bill.
//
// GiftCode được lấy nguyên bản từ wonCodes.
// Không sinh lại code tại đây.
//
// quantity và số GiftCode phải tương ứng với nhau
// khi dữ liệu hợp lệ.

export function createBillItemFromGift(gift) {
  if (!gift) {
    return null;
  }

  const codes = normalizeGiftCodes(gift);
  const quantity = Number(gift.wonQuantity) || 0;

  return {
    id: gift.id,
    text: gift.text,
    icon: gift.icon,
    codes,
    quantity,
    market_price: Number(gift.market_price) || 0,
  };
}

// ==========================================
// TẠO TOÀN BỘ SNAPSHOT ITEMS CHO BILL
// ==========================================
// Chỉ nhận những món khách đã chọn.
//
// Không tạo GiftCode mới.
// Không thay đổi GiftCode.
// Không lấy generatedCode của lượt quay cuối.

export function createBillItemsFromGifts(selectedGifts = []) {
  if (!Array.isArray(selectedGifts)) {
    return [];
  }

  return selectedGifts.map(createBillItemFromGift).filter(Boolean);
}
