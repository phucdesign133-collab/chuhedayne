// src/datas/spinResult.js

// ==========================================
// SINH SERIAL CHO MỖI LẦN TRÚNG
// ==========================================
// Mỗi lần gọi hàm này = một serial mới.
// Không dùng lại serial cũ.
// Không phụ thuộc vào bill.
// Không phụ thuộc vào database.

export function generateSpinCode(isPremiumMode = false) {
  const prefix = isPremiumMode ? "VIP" : "NORMAL";

  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ==========================================
// TẠO KẾT QUẢ CỦA MỘT LẦN QUAY
// ==========================================
// Trả về đúng phần thưởng + serial được sinh
// cho chính lần quay đó.

export function createSpinResult(selectedPrize, isPremiumMode = false) {
  if (!selectedPrize) {
    return {
      prize: null,
      code: "",
    };
  }

  const code = generateSpinCode(isPremiumMode);

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
// - giữ lại toàn bộ serial trong wonCodes
//
// Nếu chưa có:
// - tạo món mới
// - serial đầu tiên nằm trong wonCodes.
//
// Mỗi serial đại diện cho đúng một lần trúng.
// Tuyệt đối không ghi đè serial cũ.

export function addPendingGift(pendingGifts = [], spinResult) {
  if (!spinResult?.prize || !spinResult?.code) {
    return pendingGifts;
  }

  const selectedPrize = spinResult.prize;
  const code = spinResult.code;

  const existingIndex = pendingGifts.findIndex(
    (gift) => gift.id === selectedPrize.id
  );

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
      wonCodes: [
        ...(Array.isArray(gift.wonCodes) ? gift.wonCodes : []),
        code,
      ],
    };
  });
}

// ==========================================
// CHUẨN HÓA SERIAL
// ==========================================
// Dùng trước khi đưa dữ liệu vào bill.
// Đảm bảo:
// - luôn là array
// - bỏ giá trị rỗng
// - chuyển về string
// - không tự sinh thêm mã.
//
// Hàm này chỉ làm sạch dữ liệu đã có.

export function normalizeGiftCodes(gift) {
  if (!gift) {
    return [];
  }

  if (Array.isArray(gift.wonCodes)) {
    return gift.wonCodes
      .filter(Boolean)
      .map((code) => String(code));
  }

  // Tương thích với dữ liệu cũ nếu có.
  if (gift.code || gift.gift_code) {
    return [
      String(gift.code || gift.gift_code),
    ];
  }

  return [];
}

// ==========================================
// TẠO SNAPSHOT ITEM CHO BILLS
// ==========================================
// Đây là dữ liệu nghiệp vụ được chụp tại thời điểm
// khách thực sự tạo bill.
//
// Serial được lấy nguyên bản từ wonCodes.
// Không sinh lại code tại đây.
//
// quantity và số serial phải tương ứng với nhau
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
// Không tạo serial mới.
// Không thay đổi serial.
// Không lấy generatedCode của lượt quay cuối.

export function createBillItemsFromGifts(selectedGifts = []) {
  if (!Array.isArray(selectedGifts)) {
    return [];
  }

  return selectedGifts
    .map(createBillItemFromGift)
    .filter(Boolean);
}