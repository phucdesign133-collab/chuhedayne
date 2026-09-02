// src/data/priceFormula.js

import { PRICE_RULES, ASSET_RULE } from "./price";
import { PRICE_ITEM_MAP } from "./items";

/*
|--------------------------------------------------------------------------
| PRICE FORMULA — V1.0
|--------------------------------------------------------------------------
| Mục đích:
| - Công thức dùng chung cho hệ thống giá
| - Chưa phải bản chốt cuối
| - Ưu tiên chạy được trước, sau đó cân lại
|
| Luồng chính:
|
| COST
|   ↓
| BASE / LIST PRICE
|   ↓
| CUSTOMER TYPE
|   ↓
| LOYALTY
|   ↓
| VOUCHER
|   ↓
| PR
|   ↓
| FLOOR CHECK
|   ↓
| FINAL PRICE
|   ↓
| PROFIT
|   ↓
| REINVESTMENT
|
|--------------------------------------------------------------------------
*/


/* ==========================================================================
   1. BASIC HELPERS
   ========================================================================== */

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};


export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};


export const roundMoney = (value, step = 1000) => {
  const number = toNumber(value);

  if (!step) return number;

  return Math.round(number / step) * step;
};


export const ceilMoney = (value, step = 1000) => {
  const number = toNumber(value);

  if (!step) return number;

  return Math.ceil(number / step) * step;
};


/* ==========================================================================
   2. ASSET RECOVERY
   ========================================================================== */

/*
  Ví dụ:

  tài sản 2.000.000
  hòa vốn 10 lần

  → 200.000/lần

  Sau lần thứ 10:
  → 0

  Không tính hồi vốn lại nếu tài sản đã hòa vốn.
*/

export const calculateAssetRecovery = ({
  value = 0,
  breakEvenUsage = 0,
  usageCount = 0,
}) => {
  const assetValue = toNumber(value);
  const breakEven = toNumber(breakEvenUsage);
  const used = toNumber(usageCount);

  if (assetValue <= 0) return 0;
  if (breakEven <= 0) return 0;
  if (used >= breakEven) return 0;

  return assetValue / breakEven;
};


export const calculateRemainingUses = ({
  breakEvenUsage = 0,
  usageCount = 0,
}) => {
  const breakEven = toNumber(breakEvenUsage);
  const used = toNumber(usageCount);

  if (breakEven <= 0) return 0;

  return Math.max(breakEven - used, 0);
};


/* ==========================================================================
   3. REINVESTMENT
   ========================================================================== */

export const calculateProfit = ({
  revenue = 0,
  directCost = 0,
}) => {
  return toNumber(revenue) - toNumber(directCost);
};


export const calculateReinvestment = ({
  profit = 0,
  rate = PRICE_RULES?.reinvestment?.rate ?? 0.2,
}) => {
  const safeProfit = Math.max(toNumber(profit), 0);

  return safeProfit * toNumber(rate);
};


export const calculateRetainedProfit = ({
  profit = 0,
  reinvestment = 0,
}) => {
  return Math.max(
    toNumber(profit) - toNumber(reinvestment),
    0
  );
};


/* ==========================================================================
   4. LABOR
   ========================================================================== */

export const calculateLaborCost = ({
  people = 0,
  hours = 0,
  rate = PRICE_RULES?.labor?.targetPerHour ?? 150000,
}) => {
  return (
    toNumber(people) *
    toNumber(hours) *
    toNumber(rate)
  );
};


/* ==========================================================================
   5. LINE BALLOON
   ========================================================================== */

/*
  Line Balloon:

  regular:
  300K/m

  freesize:
  300K/m

  minimum:
  3m/job

  Công thức cost:
  material + structure + labor + asset recovery + transport
*/

export const calculateLineBalloonQuantity = ({
  meters = 0,
}) => {
  return Math.max(toNumber(meters), 0);
};


export const calculateLineBalloonListPrice = ({
  meters = 0,
  type = "regular",
}) => {
  const safeMeters = Math.max(toNumber(meters), 0);

  const pricePerMeter =
    type === "freesize"
      ? PRICE_RULES?.lineBalloon?.freesizePricePerMeter ?? 300000
      : PRICE_RULES?.lineBalloon?.pricePerMeter ?? 300000;

  const minimumMeters =
    PRICE_RULES?.lineBalloon?.minimumMeters ?? 3;

  const billableMeters = Math.max(
    safeMeters,
    minimumMeters
  );

  return billableMeters * pricePerMeter;
};


export const calculateLineBalloonCost = ({
  meters = 0,
  materialCostPerMeter = 0,
  structureCost = 0,
  laborCost = 0,
  assetRecovery = 0,
  transportCost = 0,
}) => {
  return (
    toNumber(meters) * toNumber(materialCostPerMeter) +
    toNumber(structureCost) +
    toNumber(laborCost) +
    toNumber(assetRecovery) +
    toNumber(transportCost)
  );
};


/* ==========================================================================
   6. FLOWER POT
   ========================================================================== */

export const getFlowerPotListPricePerUnit = ({
  quantity = 1,
}) => {
  const qty = Math.max(toNumber(quantity), 1);

  if (qty >= 10) return 85000;
  if (qty >= 5) return 90000;
  if (qty >= 3) return 95000;

  return 100000;
};


export const calculateFlowerPotListPrice = ({
  quantity = 1,
}) => {
  const qty = Math.max(toNumber(quantity), 1);

  return qty * getFlowerPotListPricePerUnit({
    quantity: qty,
  });
};


export const calculateFlowerPotCost = ({
  quantity = 0,
  materialCostPerUnit = 13000,
  laborCost = 0,
  transportCost = 0,
}) => {
  return (
    toNumber(quantity) * toNumber(materialCostPerUnit) +
    toNumber(laborCost) +
    toNumber(transportCost)
  );
};


/* ==========================================================================
   7. FLOWER LINE
   ========================================================================== */

export const getFlowerLineListPricePerMeter = ({
  meters = 0,
}) => {
  const length = Math.max(toNumber(meters), 0);

  if (length >= 1) {
    return 300000;
  }

  return 300000;
};


export const calculateFlowerLineListPrice = ({
  meters = 0,
}) => {
  const length = Math.max(toNumber(meters), 0);

  return length * getFlowerLineListPricePerMeter({
    meters: length,
  });
};


export const calculateFlowerLineCost = ({
  meters = 0,
  materialCostPerMeter = 50000,
  laborCost = 0,
  transportCost = 0,
}) => {
  return (
    toNumber(meters) * toNumber(materialCostPerMeter) +
    toNumber(laborCost) +
    toNumber(transportCost)
  );
};


/* ==========================================================================
   8. BACKDROP
   ========================================================================== */

/*
  Backdrop dùng chung một engine.

  Mỗi loại chỉ khác:
  - banner
  - balloon
  - frame
  - asset recovery
  - labor
  - transport
*/

export const calculateBackdropCost = ({
  bannerCost = 0,
  balloonCost = 0,
  frameCost = 0,
  materialCost = 0,
  laborCost = 0,
  assetRecovery = 0,
  transportCost = 0,
}) => {
  return (
    toNumber(bannerCost) +
    toNumber(balloonCost) +
    toNumber(frameCost) +
    toNumber(materialCost) +
    toNumber(laborCost) +
    toNumber(assetRecovery) +
    toNumber(transportCost)
  );
};


export const calculateBackdropProfit = ({
  listPrice = 0,
  directCost = 0,
}) => {
  return calculateProfit({
    revenue: listPrice,
    directCost,
  });
};


/* ==========================================================================
   9. BACKDROP ROUND
   ========================================================================== */

export const calculateRoundBackdropAssetRecovery = ({
  usageCount = 0,
}) => {
  const asset = PRICE_RULES?.backdrop?.round?.asset;

  if (!asset) return 0;

  return calculateAssetRecovery({
    value: asset.value,
    breakEvenUsage: asset.breakEvenUsage,
    usageCount,
  });
};


export const calculateRoundBackdropCost = ({
  balloonCost = 0,
  bannerCost = 242000,
  materialCost = 50000,
  laborCost = 300000,
  usageCount = 0,
  transportCost = 0,
}) => {
  const assetRecovery =
    calculateRoundBackdropAssetRecovery({
      usageCount,
    });

  return calculateBackdropCost({
    bannerCost,
    balloonCost,
    materialCost,
    laborCost,
    assetRecovery,
    transportCost,
  });
};


/* ==========================================================================
   10. BACKDROP U / 2U / RECTANGLE
   ========================================================================== */

export const calculateBackdropPackageCost = ({
  bannerCost = 0,
  balloonCost = 0,
  materialCost = 0,
  laborCost = 0,
  assetRecovery = 0,
  transportCost = 0,
}) => {
  return calculateBackdropCost({
    bannerCost,
    balloonCost,
    materialCost,
    laborCost,
    assetRecovery,
    transportCost,
  });
};


/* ==========================================================================
   11. PARTY PACKAGE
   ========================================================================== */

/*
  Party package thực chất là:

  1 SERVICE
  + packageLevel

  BASIC
  PREMIUM

  Đặc biệt:

  Tier 5:
  PREMIUM benefits
  nhưng charge BASIC price
  + stack existing promotions
*/

export const getPartyPackageBasePrice = ({
  packageLevel = "basic",
}) => {
  const packageData = PRICE_RULES?.partyPackage;

  if (!packageData) return 0;

  if (packageLevel === "premium") {
    return toNumber(packageData.premiumPrice);
  }

  return toNumber(packageData.basicPrice);
};


export const getPartyPackageBasicPrice = () => {
  return toNumber(
    PRICE_RULES?.partyPackage?.basicPrice ?? 1500000
  );
};


export const getPartyPackagePremiumPrice = () => {
  return toNumber(
    PRICE_RULES?.partyPackage?.premiumPrice ?? 1800000
  );
};


export const applyPartyLoyaltyRule = ({
  packageLevel = "basic",
  loyaltyTier = 0,
}) => {
  const tier = toNumber(loyaltyTier);

  if (
    tier >= 5 &&
    packageLevel === "premium"
  ) {
    return {
      packageLevel,
      chargedAs: "basic",
      price: getPartyPackageBasicPrice(),
      premiumBenefits: true,
      stackExistingPromotions: true,
    };
  }

  return {
    packageLevel,
    chargedAs: packageLevel,
    price: getPartyPackageBasePrice({
      packageLevel,
    }),
    premiumBenefits: packageLevel === "premium",
    stackExistingPromotions: false,
  };
};


/* ==========================================================================
   12. LOYALTY
   ========================================================================== */

export const applyLoyaltyDiscount = ({
  price = 0,
  tier = 0,
}) => {
  const safePrice = toNumber(price);
  const safeTier = clamp(toNumber(tier), 0, 5);

  /*
    Tạm thời dùng mức:

    T1 = 3%
    T2 = 6%
    T3 = 9%
    T4 = 12%
    T5 = 15%

    Sau này chỉ cần chỉnh PRICE_RULES.
  */

  const rates = {
    0: 0,
    1: 0.03,
    2: 0.06,
    3: 0.09,
    4: 0.12,
    5: 0.15,
  };

  const rate = rates[safeTier] ?? 0;

  const discount = safePrice * rate;

  return {
    originalPrice: safePrice,
    discount,
    rate,
    priceAfter: safePrice - discount,
  };
};


/* ==========================================================================
   13. RETURNING CUSTOMER
   ========================================================================== */

export const applyReturningPrice = ({
  price = 0,
  returningStep = 0,
  minimumPrice = 0,
  discountStep =
    PRICE_RULES?.returningCustomer?.step ?? 20000,
}) => {
  const safePrice = toNumber(price);
  const step = Math.max(toNumber(returningStep), 0);
  const floor = toNumber(minimumPrice);
  const discount = step * toNumber(discountStep);

  return Math.max(
    safePrice - discount,
    floor
  );
};


/* ==========================================================================
   14. VOUCHER
   ========================================================================== */

export const applyVoucher = ({
  price = 0,
  voucherValue = 0,
  minimumPrice = 0,
}) => {
  const safePrice = toNumber(price);
  const voucher = Math.max(toNumber(voucherValue), 0);
  const floor = toNumber(minimumPrice);

  return {
    originalPrice: safePrice,
    discount: Math.min(voucher, safePrice),
    priceAfter: Math.max(
      safePrice - voucher,
      floor
    ),
  };
};


/* ==========================================================================
   15. PR DISCOUNT
   ========================================================================== */

export const calculatePRDiscount = ({
  quantity = 1,
  discountPerUnit = 0,
  maximumDiscount = Infinity,
}) => {
  const discount = Math.max(
    toNumber(quantity) *
      toNumber(discountPerUnit),
    0
  );

  return Math.min(
    discount,
    toNumber(maximumDiscount, Infinity)
  );
};


export const applyPRDiscount = ({
  price = 0,
  discount = 0,
  minimumPrice = 0,
}) => {
  const safePrice = toNumber(price);
  const safeDiscount = Math.max(toNumber(discount), 0);
  const floor = toNumber(minimumPrice);

  return Math.max(
    safePrice - safeDiscount,
    floor
  );
};


/* ==========================================================================
   16. PR CASHBACK
   ========================================================================== */

export const calculatePRCashback = ({
  actualPaid = 0,
  partner = false,
}) => {
  const rate = partner
    ? PRICE_RULES?.pr?.partnerCashback ?? 0.10
    : PRICE_RULES?.pr?.cashback ?? 0.05;

  return toNumber(actualPaid) * rate;
};


/* ==========================================================================
   17. FLOOR CHECK
   ========================================================================== */

export const checkPriceFloor = ({
  price = 0,
  floor = 0,
}) => {
  const safePrice = toNumber(price);
  const safeFloor = toNumber(floor);

  return {
    price: safePrice,
    floor: safeFloor,
    isBelowFloor: safePrice < safeFloor,
    difference: safePrice - safeFloor,
  };
};


/* ==========================================================================
   18. FINAL PRICE
   ========================================================================== */

/*
  Đây là hàm quan trọng nhất.

  Nó chưa tự quyết định tất cả business rules.
  Nó nhận các kết quả đã tính rồi ráp lại.

  Như vậy sau này:
  - Voucher đổi
  - PR đổi
  - Loyalty đổi
  - Floor đổi

  → không phải viết lại toàn bộ engine.
*/

export const calculateFinalPrice = ({
  listPrice = 0,

  returningDiscount = 0,
  loyaltyDiscount = 0,
  voucherDiscount = 0,
  prDiscount = 0,

  floor = 0,
}) => {
  const original = toNumber(listPrice);

  const totalDiscount =
    toNumber(returningDiscount) +
    toNumber(loyaltyDiscount) +
    toNumber(voucherDiscount) +
    toNumber(prDiscount);

  const beforeFloor =
    original - totalDiscount;

  const finalPrice = Math.max(
    beforeFloor,
    toNumber(floor)
  );

  return {
    listPrice: original,
    totalDiscount,
    beforeFloor,
    floor: toNumber(floor),
    finalPrice,
    floorProtected: finalPrice > beforeFloor,
  };
};


/* ==========================================================================
   19. COMPLETE PRICE CALCULATION
   ========================================================================== */

export const calculatePrice = ({
  listPrice = 0,
  directCost = 0,

  returningDiscount = 0,
  loyaltyDiscount = 0,
  voucherDiscount = 0,
  prDiscount = 0,

  floor = 0,
}) => {
  const priceResult = calculateFinalPrice({
    listPrice,
    returningDiscount,
    loyaltyDiscount,
    voucherDiscount,
    prDiscount,
    floor,
  });

  const profit = calculateProfit({
    revenue: priceResult.finalPrice,
    directCost,
  });

  const reinvestment = calculateReinvestment({
    profit,
  });

  const retainedProfit = calculateRetainedProfit({
    profit,
    reinvestment,
  });

  return {
    ...priceResult,

    directCost: toNumber(directCost),

    profit,
    reinvestment,
    retainedProfit,

    marginRate:
      priceResult.finalPrice > 0
        ? profit / priceResult.finalPrice
        : 0,
  };
};


/* ==========================================================================
   20. PARTNER PRICE
   ========================================================================== */

export const calculatePartnerPrice = ({
  directCost = 0,
  minimumPrice = 0,
  markup =
    PRICE_RULES?.partner?.defaultMarkup ?? 100000,
}) => {
  const cost = toNumber(directCost);

  return Math.max(
    cost + toNumber(markup),
    toNumber(minimumPrice)
  );
};


export const calculatePartnerPriceByRule = ({
  directCost = 0,
  type = "normal",
}) => {
  const cost = toNumber(directCost);

  if (type === "chbb") {
    return Math.max(
      cost + 100000,
      500000
    );
  }

  if (cost < 900000) {
    return Math.max(
      cost + 100000,
      1000000
    );
  }

  return cost + 100000;
};


/* ==========================================================================
   21. HOLIDAY
   ========================================================================== */

/*
  Holiday không phải promotion.

  Nó là một COST SCENARIO khác.

  Tạm thời:

  outsource cost × 1.5

  customer price có thể × 1.2–1.3

  Chưa ép vào final price.
*/

export const calculateHolidayCost = ({
  normalCost = 0,
  outsource = false,
}) => {
  const cost = toNumber(normalCost);

  if (!outsource) return cost;

  const multiplier =
    PRICE_RULES?.holiday?.outsourceCostMultiplier ?? 1.5;

  return cost * multiplier;
};


export const calculateHolidayPrice = ({
  normalPrice = 0,
  multiplier = null,
}) => {
  const price = toNumber(normalPrice);

  const safeMultiplier =
    multiplier ??
    PRICE_RULES?.holiday?.customerPriceMultiplier ??
    1.2;

  return price * safeMultiplier;
};


/* ==========================================================================
   22. SELF VS OUTSOURCE
   ========================================================================== */

export const calculateSelfProfit = ({
  revenue = 0,
  selfCost = 0,
}) => {
  return calculateProfit({
    revenue,
    directCost: selfCost,
  });
};


export const calculateOutsourceProfit = ({
  revenue = 0,
  outsourceCost = 0,
}) => {
  return calculateProfit({
    revenue,
    directCost: outsourceCost,
  });
};


export const compareSelfOutsource = ({
  revenue = 0,
  selfCost = 0,
  outsourceCost = 0,
}) => {
  const selfProfit = calculateSelfProfit({
    revenue,
    selfCost,
  });

  const outsourceProfit = calculateOutsourceProfit({
    revenue,
    outsourceCost,
  });

  return {
    revenue: toNumber(revenue),

    self: {
      cost: toNumber(selfCost),
      profit: selfProfit,
    },

    outsource: {
      cost: toNumber(outsourceCost),
      profit: outsourceProfit,
    },

    recommended:
      selfProfit >= outsourceProfit
        ? "self"
        : "outsource",
  };
};


/* ==========================================================================
   23. GENERIC ITEM LOOKUP
   ========================================================================== */

export const getPriceItem = (itemId) => {
  return PRICE_ITEM_MAP?.[itemId] ?? null;
};


/* ==========================================================================
   24. GENERIC SERVICE RESULT
   ========================================================================== */

export const buildPriceResult = ({
  itemId,
  listPrice = 0,
  directCost = 0,
  floor = 0,
  options = {},
}) => {
  const item = getPriceItem(itemId);

  const result = calculatePrice({
    listPrice,
    directCost,
    floor,
    ...options,
  });

  return {
    itemId,
    item,
    ...result,
  };
};


/* ==========================================================================
   25. DEBUG / TEST
   ========================================================================== */

export const testPriceFormula = () => {
  const line = calculatePrice({
    listPrice: 1500000,
    directCost: 500000,
    floor: 1000000,
  });

  const flowerPot = calculatePrice({
    listPrice: 900000,
    directCost: 130000,
    floor: 800000,
  });

  const party = calculatePrice({
    listPrice: 1500000,
    directCost: 530000,
    floor: 0,
  });

  return {
    line,
    flowerPot,
    party,
  };
};


/* ==========================================================================
   26. DEFAULT EXPORT
   ========================================================================== */

export default {
  toNumber,
  clamp,
  roundMoney,
  ceilMoney,

  calculateAssetRecovery,
  calculateRemainingUses,

  calculateProfit,
  calculateReinvestment,
  calculateRetainedProfit,

  calculateLaborCost,

  calculateLineBalloonQuantity,
  calculateLineBalloonListPrice,
  calculateLineBalloonCost,

  getFlowerPotListPricePerUnit,
  calculateFlowerPotListPrice,
  calculateFlowerPotCost,

  getFlowerLineListPricePerMeter,
  calculateFlowerLineListPrice,
  calculateFlowerLineCost,

  calculateBackdropCost,
  calculateBackdropProfit,

  calculateRoundBackdropAssetRecovery,
  calculateRoundBackdropCost,

  calculateBackdropPackageCost,

  getPartyPackageBasePrice,
  getPartyPackageBasicPrice,
  getPartyPackagePremiumPrice,
  applyPartyLoyaltyRule,

  applyLoyaltyDiscount,
  applyReturningPrice,

  applyVoucher,

  calculatePRDiscount,
  applyPRDiscount,
  calculatePRCashback,

  checkPriceFloor,

  calculateFinalPrice,
  calculatePrice,

  calculatePartnerPrice,
  calculatePartnerPriceByRule,

  calculateHolidayCost,
  calculateHolidayPrice,

  calculateSelfProfit,
  calculateOutsourceProfit,
  compareSelfOutsource,

  getPriceItem,
  buildPriceResult,

  testPriceFormula,
};