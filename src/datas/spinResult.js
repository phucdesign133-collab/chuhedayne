// src/datas/spinResult.js
import { supabase } from "../components/utils/supabaseClient";

// ==========================================
// SINH GIFT CODE CHDN
// ==========================================
// Một loại code duy nhất cho tất cả vòng quay.
// Form: CHDN-x
// Số lượng chữ số được chọn ngẫu nhiên từ 1 đến 8.
//
// Code phải chưa tồn tại trong:
// 1. bills gift-orders: lịch sử đã phát hành
// 2. pendingGifts: code đã sinh trong phiên hiện tại nhưng chưa lưu bill
//
// Code được tạo một lần tại đây rồi giữ nguyên
// xuyên suốt flow vòng quay -> pending gift -> bill.

export async function generateSpinCode(pendingGifts = []) {
  const { data: bills, error } = await supabase.from("bills").select("items").eq("bill_type", "gift-orders");

  if (error) {
    console.error("Lỗi kiểm tra Gift Code trong bills:", error);
    throw new Error("Không thể kiểm tra Gift Code đã tồn tại. Vui lòng thử lại.");
  }

  const existingCodes = new Set();

  (bills || []).forEach((bill) => {
    if (!Array.isArray(bill.items)) {
      return;
    }

    bill.items.forEach((item) => {
      if (Array.isArray(item?.codes)) {
        item.codes.forEach((code) => {
          if (code) {
            existingCodes.add(String(code));
          }
        });
      }

      if (item?.gift_code) {
        existingCodes.add(String(item.gift_code));
      }
    });
  });

  (pendingGifts || []).forEach((gift) => {
    if (Array.isArray(gift?.wonCodes)) {
      gift.wonCodes.forEach((code) => {
        if (code) {
          existingCodes.add(String(code));
        }
      });
    }

    if (gift?.code) {
      existingCodes.add(String(gift.code));
    }

    if (gift?.gift_code) {
      existingCodes.add(String(gift.gift_code));
    }
  });

  for (let attempt = 0; attempt < 20; attempt++) {
    const length = Math.floor(Math.random() * 8) + 1;
    let number = "";

    for (let i = 0; i < length; i++) {
      number += Math.floor(Math.random() * 10);
    }

    const code = `CHDN-${number}`;

    if (!existingCodes.has(code)) {
      return code;
    }
  }

  throw new Error("Không thể tạo Gift Code mới. Vui lòng thử lại.");
}

export async function createSpinResult(selectedPrize, pendingGifts = []) {
  if (!selectedPrize) {
    return {
      prize: null,
      code: "",
    };
  }

  const code = await generateSpinCode(pendingGifts);

  return {
    prize: selectedPrize,
    code,
  };
}

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

export function normalizeGiftCodes(gift) {
  if (!gift) {
    return [];
  }

  if (Array.isArray(gift.wonCodes)) {
    return gift.wonCodes.filter(Boolean).map((code) => String(code));
  }

  if (gift.code || gift.gift_code) {
    return [String(gift.code || gift.gift_code)];
  }

  return [];
}

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

export function createBillItemsFromGifts(selectedGifts = []) {
  if (!Array.isArray(selectedGifts)) {
    return [];
  }

  return selectedGifts.map(createBillItemFromGift).filter(Boolean);
}
