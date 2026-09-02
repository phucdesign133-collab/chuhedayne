// ============================================================
// PHÚC PARTY — PRICE DATA
// ============================================================
// DATA GIÁ + COST + BUSINESS RULE
//
// LƯU Ý:
// - LIST PRICE = giá niêm yết hiện tại, CHƯA chạy CTKM chồng chéo.
// - COST = cost nội bộ, không phải giá bán.
// - Giá thử nghiệm / chưa chốt không đưa thành giá chính thức.
// - Asset recovery = giá tài sản / số lần hòa vốn.
// - Sau khi asset hoàn vốn → recovery/lần = 0.
// - 20% tái đầu tư được tính SAU khi xác định margin/profit.
// - Price Engine sẽ xử lý công thức ở file khác.
// ============================================================


// ============================================================
// 01. GLOBAL RULES
// ============================================================

export const PRICE_RULES = {
  // Tái đầu tư
  REINVESTMENT_RATE: 0.20,

  // Mục tiêu tham chiếu khi đánh giá thời gian Anh bỏ ra.
  // Đây KHÔNG phải công thức giá cứng.
  LABOR_VALUE_TARGET_PER_HOUR: 150000,

  // Taxi benchmark chỉ dùng tham khảo khi so sánh
  // tự làm / outsource.
  TAXI_BENCHMARK_PER_HOUR: 125000,

  // PR
  PR: {
    NORMAL_CASHBACK_RATE: 0.05,
    PARTNER_CASHBACK_RATE: 0.10,
  },

  // Khách quay lại
  RETURNING: {
    DEFAULT_STEP: 20000,
  },

  // Holiday
  HOLIDAY: {
    // Cost outsource có thể tăng khoảng 1.5 lần.
    // Đây là scenario, không phải mặc định.
    OUTSOURCE_COST_MULTIPLIER: 1.5,

    // Giá khách có thể tăng khoảng 1.2–1.3 lần.
    // Chưa khóa thành công thức.
    CUSTOMER_PRICE_MULTIPLIER_MIN: 1.2,
    CUSTOMER_PRICE_MULTIPLIER_MAX: 1.3,
  },

  // Asset
  ASSET: {
    RECOVERY_METHOD: "value_divided_by_break_even_usage",
  },

  // Transport
  TRANSPORT: {
    PROVIDER: "Lalamove",
    STATUS: "NOT_FIXED",
  },
};


// ============================================================
// 02. COMMON COST RULES
// ============================================================

export const COST_RULES = {
  BALLOON: {
    PACK_100_COST: 45000,
    TEN_INCH_COST: 680,
    LONG_BALLOON_COST: 450,
    FREESIZE_24_COST: 8000,
  },

  BACKDROP: {
    HIFLEX_2_DA_PER_M2: 50000,
    IRON_20X20_PER_6M: 80000,
  },

  LABOR: {
    SELF_PER_PERSON_PER_JOB: 400000,

    CHBB_SELF_PER_HOUR: 500000,
    CHBB_OUTSOURCE_PER_HOUR: 400000,

    MASCOT_OUTSOURCE_FULL_PACKAGE_PER_HOUR: 600000,
  },

  OTHER: {
    BACKDROP_RESERVE_MATERIAL_PER_SHOW: 50000,
    HASHTAG_OUTSOURCE_PER_ITEM: 40000,
    HASHTAG_SELF_ESTIMATE_PER_ITEM: 20000,

    GIFT_SAFE_COST_PER_CARD: 5000,
    GIFT_SHIPPING_PER_ADDRESS: 15000,
  },
};


// ============================================================
// 03. ASSET RULE
// ============================================================

export const ASSET_RULE = {
  /**
   * Asset recovery mỗi lần sử dụng.
   *
   * Ví dụ:
   * value = 2,000,000
   * breakEvenUsage = 10
   * => 200,000 / lần
   *
   * Khi usageCount >= breakEvenUsage
   * => recovery = 0
   */
  getRecoveryPerUse(value = 0, breakEvenUsage = 0, usageCount = 0) {
    const assetValue = Number(value) || 0;
    const breakEven = Number(breakEvenUsage) || 0;
    const usage = Number(usageCount) || 0;

    if (assetValue <= 0 || breakEven <= 0) {
      return 0;
    }

    if (usage >= breakEven) {
      return 0;
    }

    return assetValue / breakEven;
  },

  getRemainingUses(breakEvenUsage = 0, usageCount = 0) {
    return Math.max(
      (Number(breakEvenUsage) || 0) - (Number(usageCount) || 0),
      0
    );
  },
};


// ============================================================
// 04. LINE BALLOON — ĐƠN
// ============================================================

export const LINE_BALLOON = {
  id: "line-balloon",
  category: "decoration",
  type: "self-made",

  listPrice: {
    regular: 300000,
    freesize: 300000,
    minimumMeters: 3,
  },

  materialCost: {
    regularCluster4PerMeter: 13600,
    regularCluster5PerMeter: 17000,

    freesizePerMeter: 101200,

    lineWithFlowerPerMeter: 17600,
  },

  structureCost: {
    woodenBasesPerJob: 40000,
    pipePer3M: 28000,
  },

  labor: {
    perPersonPerJob: 400000,

    rules: {
      shortLineMaxMeters: 4,
      shortLinePeople: 1,

      longLinePeople: 2,
      complexLinePeople: 2,
    },
  },

  returningCustomer: {
    regular: {
      step: 20000,
      floor: 200000,
    },

    freesize: {
      step: 20000,
      floor: 220000,
    },
  },

  promotion: {
    fivePlusOne: {
      buyMeters: 5,
      freeMeters: 1,
      enabled: true,
    },

    specialSixMeters: {
      price: 1400000,
      enabled: true,
      status: "SPECIAL_COMMERCIAL_PRICE",
    },
  },

  pr: {
    maxDiscountPerJob: 100000,
    cashbackRate: 0.05,
    blockedWithFivePlusOne: true,
  },
};


// ============================================================
// 05. CHẬU BÔNG
// ============================================================

export const FLOWER_POT = {
  id: "flower-pot",
  category: "decoration",
  type: "self-made",

  materialCostPerUnit: 13000,

  productivity: {
    potsPerHour: 8,
  },

  listPrice: {
    tiers: [
      { min: 1, max: 2, price: 100000 },
      { min: 3, max: 4, price: 95000 },
      { min: 5, max: 9, price: 90000 },
      { min: 10, max: Infinity, price: 85000 },
    ],

    normalFloor: 85000,
  },

  pr: {
    customerDiscountPerUnit: 10000,
    floor: 80000,
    normalCashbackRate: 0.05,
    partnerCashbackRate: 0.10,
  },
};


// ============================================================
// 06. LINE BÔNG
// ============================================================

export const FLOWER_LINE = {
  id: "flower-line",
  category: "decoration",
  type: "self-made",

  materialCostPerMeter: 50000,

  costBreakdown: {
    roundBalloonsPerMeter: 34000,
    longBalloons: 0,
    waterAndReinforcementPerMeter: 2000,
    flowersPerMeter: 13000,
  },

  productivity: {
    conservativeMetersPerHour: 2,
    normalMetersPerHour: 4,
  },

  listPrice: {
    start: 300000,
    step: 20000,
    floor: 200000,
  },

  pr: {
    customerDiscountPerMeter: 20000,
    floor: 200000,
    normalCashbackRate: 0.05,
    partnerCashbackRate: 0.10,
  },
};


// ============================================================
// 07. BACKDROP — COMMON
// ============================================================

export const BACKDROP_COMMON = {
  type: "backdrop",

  banner: {
    material: "Hiflex 2 da",
    backColor: "grey",
    costPerM2: 50000,
  },

  transport: {
    provider: "Lalamove",
    roundTrip: true,
    status: "NOT_FIXED",
  },

  light: {
    reusable: true,

    // Anh chưa nhớ giá / số lần hòa vốn.
    // Tạm thời recovery = 0.
    value: 0,
    breakEvenUsage: 0,
    usageCount: 0,

    recoveryPerUse: 0,

    status: "TEMPORARY_ZERO",
  },

  pricing: {
    profitMarginBuffer: true,
    reinvestmentRate: 0.20,
    finalFloorStatus: "NOT_LOCKED",
  },
};


// ============================================================
// 08. BACKDROP TRÒN Ø2.2M
// ============================================================

export const BACKDROP_ROUND = {
  id: "backdrop-round-2-2",
  category: "decoration",
  type: "self-made",

  size: "2.2m",

  asset: {
    type: "reusable-frame",

    value: 2000000,

    // Anh nhập ước tính hòa vốn 10 lần.
    breakEvenUsage: 10,

    usageCount: 0,

    recoveryPerUse: 200000,

    pieces: 8,

    motorbikeCompatible: true,
    rackRequired: false,
  },

  banner: {
    width: 2.2,
    height: 2.2,
    area: 4.84,
    cost: 242000,
  },

  materialReserve: 50000,

  selfLabor: {
    hours: 2,
    minimumValuePerHour: 150000,
    temporaryLaborValue: 300000,
  },

  balloon: {
    freesizeClusterCost: 101200,

    largeLineClusters: 6,
    smallLineClusters: 2,

    totalClusters: 8,

    totalCost: 809600,
  },

  directCost: {
    banner: 242000,
    materials: 50000,
    selfLabor: 300000,

    baseBackdropCost: 592000,

    balloonSelfMaterial: 809600,

    fullBalloonSelfBackdropCost: 1401600,

    transport: null,
    light: 0,
  },

  outsource: {
    setupRemovePerPerson: 400000,

    finishCleanExtraPerPerson: 200000,

    cleaningDefault: false,

    balloonLaborPerTurn: 800000,
  },

  options: {
    warmCafeLight: {
      enabled: true,
      baseIncluded: false,
      status: "ADD_ON",
    },
  },

  price: {
    onlyBanner: {
      testedPrices: [790000, 890000, 990000],
      official: null,
    },

    fullBalloon: {
      testedPrices: [2800000, 3000000, 3300000, 3500000],
      official: null,
    },

    returningCustomer: null,
    floor: null,
  },
};


// ============================================================
// 09. BACKDROP U LỚN
// ============================================================

export const BACKDROP_U = {
  id: "backdrop-u-large",
  category: "decoration",
  type: "self-made",

  size: "2.3 x 2.5m",

  materialCost: {
    banner: 287500,
    balloon: 809600,
  },

  materialCostTotal: 1297000,

  price: {
    currentList: 2200000,
    returningCustomer: 2000000,
    floor: 1800000,
  },

  // Asset recovery / labor / transport chưa được khóa
  // trong plaintext giá nhanh này.
  additionalCost: {
    assetRecovery: null,
    labor: null,
    transport: null,
    screws: null,
  },
};


// ============================================================
// 10. COMBO 2U
// ============================================================

export const BACKDROP_2U = {
  id: "backdrop-2u",
  category: "decoration",
  type: "self-made",

  materialCost: {
    banner: 423500,
    balloon: 910800,
  },

  materialCostTotal: 1534300,

  price: {
    currentList: 2600000,
    returningCustomer: 2400000,
    floor: 2000000,
  },

  additionalCost: {
    assetRecovery: null,
    labor: null,
    transport: null,
    screws: null,
  },
};


// ============================================================
// 11. BACKDROP CHỮ NHẬT
// ============================================================

export const BACKDROP_RECTANGLE = {
  id: "backdrop-rectangle",
  category: "decoration",
  type: "self-made",

  common: {
    bannerCostPerM2: 50000,
    ironCostPer6M: 80000,
    balloonCostPerUnit: 680,

    lineRule: {
      longSides: 1,
      shortSides: 2,
      balloonsPerMeter: 20,
    },
  },

  sizes: {
    "3x4": {
      width: 3,
      height: 4,

      banner: 600000,
      iron: 320000,
      balloonLine: 136000,

      materialCost: 1056000,

      proposedPrice: 2000000,
      floor: null,
    },

    "4x5": {
      width: 4,
      height: 5,

      banner: 1000000,
      iron: 400000,
      balloonLine: 176800,

      materialCost: 1576800,

      proposedPrice: 2800000,
      floor: null,
    },

    "4x6": {
      width: 4,
      height: 6,

      banner: 1200000,
      iron: 400000,
      balloonLine: 190400,

      materialCost: 1790400,

      proposedPrice: 3300000,
      floor: null,
    },
  },

  additionalCost: {
    labor: null,
    transport: null,
    screws: null,
    assetRecovery: null,
  },

  notes: {
    leftoverBalloonsToWarehouse: true,
    proposedPriceNotFinal: true,
    finalFloorNotLocked: true,
  },
};


// ============================================================
// 12. GÓI TIỆC BASIC / PREMIUM
// ============================================================

export const PARTY_PACKAGE = {
  id: "party-package",
  category: "party",
  type: "package",

  basic: {
    listPrice: 1500000,

    clown: true,
    maxHours: 2.5,

    giftExchange: true,
    giftRule: "one_gift_per_zalo",

    hashtag: false,
    balloonPillar: false,

    magic: false,
  },

  premium: {
    listPrice: 1800000,

    clown: true,
    duration: "whole_party",

    giftExchange: true,
    giftRule: "according_to_cards",

    hashtag: {
      min: 2,
      max: 3,

      costPerItem: 40000,
      selfEstimatedCostPerItem: 20000,

      retailValue: null,
    },

    balloonPillar: {
      quantity: 2,

      costPerPillar: 24320,
      totalCost: 48640,

      retailValuePerPillar: null,
      retailValueTotal: 600000,
    },

    magic: false,
  },

  clown: {
    includedInPackage: true,

    // Không cộng 500K/h CHNB riêng vào cost package.
    separateProductPricePerHour: 500000,
    separateOutsourcePerHour: 400000,
  },

  magic: {
    separateProductPrice: 1500000,
    durationMinutes: 30,
    outsourceCost: 800000,
  },

  gift: {
    safeCostPerCard: 5000,
    shippingPerAddress: 15000,

    // Chưa phải cost cố định của một khách.
    // Dùng để stress-test quota.
    scenarios: {
      tenCards: {
        cards: 10,
        giftCost: 50000,
        shipping: 15000,
        total: 65000,
      },

      twentyCards: {
        cards: 20,
        giftCost: 100000,
        shipping: 15000,
        total: 115000,
      },
    },

    inPartyBudget: {
      estimated: 150000,
      estimatedItems: 50,
      estimatedCards: 50,
    },
  },

  card: {
    basic: {
      exchangeRule: "one_gift_per_zalo",
      outsourceQuota: 10,
    },

    premium: {
      exchangeRule: "according_to_cards",
      outsourceQuota: 20,
    },
  },

  returningCustomer: {
    booking1: {
      package: "basic",
      price: 1500000,
    },

    booking2: {
      package: "basic",
      price: 1500000,
    },

    booking3: {
      package: "premium",
      chargedAs: "basic",
      price: 1500000,
    },
  },

  loyalty: {
    tier5: {
      package: "premium",
      priceBase: "basic",

      // Cho phép áp dụng CTKM khách đang có.
      stackExistingPromotions: true,
    },
  },

  pr: {
    normalCashbackRate: 0.05,
    partnerCashbackRate: 0.10,

    calculatedOn: "actual_collected_after_discount",

    multipleCodes: false,
  },

  selfMadeScenarios: {
    basic: {
      revenue: 1500000,
      profitBeforeReinvestment: 970000,
      reinvestment: 194000,
      retainedProfit: 776000,
    },

    premium: {
      revenue: 1800000,
      profitBeforeReinvestment: 1086000,
      reinvestment: 217000,
      retainedProfit: 869000,
    },

    tier2: {
      revenue: 1500000,
      profitBeforeReinvestment: 801000,
      reinvestment: 160000,
      retainedProfit: 641000,
    },
  },

  outsource: {
    clownCostPerParty: 800000,

    scenarios: {
      basic10Cards: {
        revenue: 1500000,
        clown: 800000,
        cashback: 75000,
        gifts: 50000,
        shipping: 15000,

        totalCost: 940000,
        profitBeforeReinvestment: 560000,
        reinvestment: 112000,
        retainedProfit: 448000,
      },

      premium10Cards: {
        revenue: 1800000,
        clown: 800000,
        cashback: 90000,
        gifts: 50000,
        shipping: 15000,

        totalCost: 955000,
        profitBeforeReinvestment: 845000,
        reinvestment: 169000,
        retainedProfit: 676000,
      },

      premium20Cards: {
        revenue: 1800000,
        clown: 800000,
        cashback: 90000,
        gifts: 100000,
        shipping: 15000,

        totalCost: 1005000,
        profitBeforeReinvestment: 795000,
        reinvestment: 159000,
        retainedProfit: 636000,
      },
    },
  },
};


// ============================================================
// 13. MASCOT
// ============================================================

export const MASCOT = {
  id: "mascot",
  category: "performance",
  type: "outsource",

  // Phương án an toàn để tính cost:
  // thuê trọn gói cả người + trang phục.
  cost: {
    outsourcePerHour: 600000,
  },

  rentalOnly: {
    costumePerDayMin: 300000,
    costumePerDayMax: 400000,

    transportRoundTrip: true,

    // Nếu Anh tự mặc:
    performerCost: 0,
  },

  rentalPlusPerson: {
    costumePerDayMin: 300000,
    costumePerDayMax: 400000,

    performerPerHourMin: 300000,
    performerPerHourMax: 400000,

    transportRoundTrip: true,
  },

  pricing: {
    proposedMin: 800000,
    proposedMax: 1000000,

    officialListPrice: null,
    floor: null,
  },

  notes: {
    preferredCostScenario: "full_outsource",
    preferredCostPerHour: 600000,

    // Chưa khóa 800K hay 1M.
    status: "PRICE_NOT_FINAL",
  },
};


// ============================================================
// 14. NCC SERVICES — BỘ CÔNG THỨC RIÊNG
// ============================================================

export const NCC_SERVICES = {
  lan: {
    id: "lan",
    category: "performance",
    pricingEngine: "NCC",
    supplierCost: null,
    marginRule: "SEPARATE",
    status: "WAITING_SUPPLIER_PRICE",
  },

  toHe: {
    id: "to-he",
    category: "performance",
    pricingEngine: "NCC",
    supplierCost: null,
    marginRule: "SEPARATE",
    status: "WAITING_SUPPLIER_PRICE",
  },

  balloonExplosion: {
    id: "bbxp",
    category: "performance",
    pricingEngine: "NCC",
    supplierCost: null,
    marginRule: "SEPARATE",
    status: "WAITING_SUPPLIER_PRICE",
  },

  coconutLeafArt: {
    id: "that-la-dua",
    category: "performance",
    pricingEngine: "NCC",
    supplierCost: null,
    marginRule: "SEPARATE",
    status: "WAITING_SUPPLIER_PRICE",
  },

  chuCuoiChiHang: {
    id: "chu-cuoi-chi-hang",
    category: "performance",
    pricingEngine: "NCC",
    supplierCost: null,
    marginRule: "SEPARATE",
    status: "WAITING_SUPPLIER_PRICE",
  },
};


// ============================================================
// 15. PARTNER PRICE RULE
// ============================================================

export const PARTNER_PRICE_RULE = {
  // General:
  // cost + 100K
  defaultMargin: 100000,

  minimums: {
    chbbPerHour: 500000,

    lowCostItems: {
      costBelow: 900000,
      minimumPartnerPrice: 1000000,
    },
  },

  higherCostItems: {
    formula: "cost_plus_100k",
  },
};


// ============================================================
// 16. PRICE ENGINE FLOW
// ============================================================

export const PRICE_ENGINE_FLOW = [
  "SELECT_SERVICE",
  "SELECT_CONFIGURATION",
  "GET_LIST_PRICE",
  "GET_DIRECT_COST",
  "GET_ASSET_RECOVERY",
  "GET_LABOR",
  "GET_OUTSOURCE_COST",
  "CALCULATE_BASE_MARGIN",
  "REINVESTMENT_20_PERCENT",
  "APPLY_RETURNING_CUSTOMER_RULE",
  "APPLY_LOYALTY_RULE",
  "APPLY_VOUCHER_RULE",
  "APPLY_PR_RULE",
  "CHECK_PRICE_FLOOR",
  "CALCULATE_FINAL_PRICE",
  "CALCULATE_FINAL_PROFIT",
];


// ============================================================
// 17. PRICING PRINCIPLES
// ============================================================

export const PRICING_PRINCIPLES = {
  listPriceIsNotCost: true,
  costIsNotRetailValue: true,
  retailValueIsNotCost: true,

  customerPriceMustHaveNegotiationRoom: true,

  promotionsCanStack: true,

  promotionMustNotDestroyMargin: true,

  reinvestmentIs20PercentOfProfit: true,

  assetRecoveryIsTemporary: true,

  recoveredAssetCanIncreaseFutureMargin: true,

  increasedMarginCanBeUsedForFuturePromotions: true,

  holidayIsCostScenarioNotPromotion: true,

  selfVsOutsourceIsDecisionSupportOnly: true,

  engineDoesNotAutomaticallyChooseSelfOrOutsource: true,
};


// ============================================================
// 18. EXPORT ALL PRICE DATA
// ============================================================

export const PRICE_DATA = {
  rules: PRICE_RULES,
  costRules: COST_RULES,
  assetRule: ASSET_RULE,

  lineBalloon: LINE_BALLOON,
  flowerPot: FLOWER_POT,
  flowerLine: FLOWER_LINE,

  backdropCommon: BACKDROP_COMMON,
  backdropRound: BACKDROP_ROUND,
  backdropU: BACKDROP_U,
  backdrop2U: BACKDROP_2U,
  backdropRectangle: BACKDROP_RECTANGLE,

  partyPackage: PARTY_PACKAGE,

  mascot: MASCOT,

  nccServices: NCC_SERVICES,

  partnerPriceRule: PARTNER_PRICE_RULE,

  engineFlow: PRICE_ENGINE_FLOW,
  principles: PRICING_PRINCIPLES,
};

export default PRICE_DATA;