// ============================================================
// PHÚC PARTY — PRICE ITEMS
// ============================================================
// DANH MỤC HẠNG MỤC + THUỘC TÍNH
//
// File này chỉ mô tả:
// - Hạng mục
// - Nhóm
// - Loại tính giá
// - Có cost / asset / option / PR / loyalty... hay không
//
// KHÔNG chứa công thức tính giá.
// KHÔNG xử lý CTKM.
// KHÔNG tính profit.
// ============================================================


// ============================================================
// 01. TRANG TRÍ — TỰ LÀM
// ============================================================

export const DECORATION_ITEMS = [

  {
    id: "line-balloon",
    name: "Line Balloon",
    category: "decoration",
    pricingEngine: "SELF",

    variants: [
      "regular",
      "freesize",
      "flower",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: true,
    },
  },


  {
    id: "flower-pot",
    name: "Chậu bông",
    category: "decoration",
    pricingEngine: "SELF",

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: true,
      promotion: false,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: false,
      warehouseTracking: true,
    },
  },


  {
    id: "flower-line",
    name: "Line bông",
    category: "decoration",
    pricingEngine: "SELF",

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: true,
      promotion: false,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: false,
      warehouseTracking: true,
    },
  },


  // ----------------------------------------------------------
  // BACKDROP
  // ----------------------------------------------------------

  {
    id: "backdrop-round",
    name: "Backdrop tròn Ø2.2m",
    category: "decoration",
    pricingEngine: "SELF",

    variants: [
      "only-banner",
      "full-balloon",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: [
        "warm-cafe-light",
      ],

      warehouseTracking: true,
    },
  },


  {
    id: "backdrop-u",
    name: "Backdrop U lớn",
    category: "decoration",
    pricingEngine: "SELF",

    variants: [
      "u-large",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: true,
    },
  },


  {
    id: "backdrop-2u",
    name: "Combo 2U",
    category: "decoration",
    pricingEngine: "SELF",

    variants: [
      "2u",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: true,
    },
  },


  {
    id: "backdrop-rectangle",
    name: "Backdrop chữ nhật",
    category: "decoration",
    pricingEngine: "SELF",

    variants: [
      "3x4",
      "4x5",
      "4x6",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: true,
    },
  },

];


// ============================================================
// 02. BIỂU DIỄN — TỰ LÀM / GÓI
// ============================================================

export const PERFORMANCE_ITEMS = [

  {
    id: "party-package",
    name: "Gói tiệc",
    category: "performance",
    pricingEngine: "PACKAGE",

    variants: [
      "basic",
      "premium",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      loyalty: true,
      voucher: true,

      card: true,
      gift: true,
      quota: true,

      options: true,
      warehouseTracking: true,
    },
  },


  {
    id: "mascot",
    name: "Mascot",
    category: "performance",
    pricingEngine: "NCC",

    variants: [
      "costume-only",
      "full-outsource",
    ],

    attributes: {
      listPrice: true,
      materialCost: false,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: false,
      warehouseTracking: false,
    },
  },


  // ----------------------------------------------------------
  // NCC — CHƯA ĐỦ COST
  // ----------------------------------------------------------

  {
    id: "lan",
    name: "Lân",
    category: "performance",
    pricingEngine: "NCC",

    attributes: {
      listPrice: false,
      supplierCost: true,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: false,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,

      status: "WAITING_SUPPLIER_PRICE",
    },
  },


  {
    id: "to-he",
    name: "Tò he",
    category: "performance",
    pricingEngine: "NCC",

    attributes: {
      listPrice: false,
      supplierCost: true,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: false,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,

      status: "WAITING_SUPPLIER_PRICE",
    },
  },


  {
    id: "bbxp",
    name: "BBXP",
    category: "performance",
    pricingEngine: "NCC",

    attributes: {
      listPrice: false,
      supplierCost: true,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: false,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,

      status: "WAITING_SUPPLIER_PRICE",
    },
  },


  {
    id: "that-la-dua",
    name: "Thắt lá dừa",
    category: "performance",
    pricingEngine: "NCC",

    attributes: {
      listPrice: false,
      supplierCost: true,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: false,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,

      status: "WAITING_SUPPLIER_PRICE",
    },
  },


  {
    id: "chu-cuoi-chi-hang",
    name: "Chú Cuội / Chị Hằng",
    category: "performance",
    pricingEngine: "NCC",

    attributes: {
      listPrice: false,
      supplierCost: true,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: false,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,

      status: "WAITING_SUPPLIER_PRICE",
    },
  },


  // ----------------------------------------------------------
  // DỊCH VỤ RIÊNG ĐÃ CÓ DATA
  // ----------------------------------------------------------

  {
    id: "clown",
    name: "Chú hề nặn bóng",
    category: "performance",
    pricingEngine: "SELF_OR_OUTSOURCE",

    variants: [
      "hourly",
    ],

    attributes: {
      listPrice: true,
      materialCost: true,
      laborCost: true,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: true,
    },
  },


  {
    id: "magic",
    name: "Ảo thuật gia",
    category: "performance",
    pricingEngine: "NCC",

    variants: [
      "30-minutes",
    ],

    attributes: {
      listPrice: true,
      materialCost: false,
      laborCost: false,
      assetRecovery: false,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      options: true,
      warehouseTracking: false,
    },
  },

];


// ============================================================
// 03. TRANG PHỤC / ASSET
// ============================================================

export const ASSET_ITEMS = [

  {
    id: "costume",
    name: "Trang phục",
    category: "asset",
    pricingEngine: "SELF",

    attributes: {
      listPrice: true,
      materialCost: false,
      laborCost: true,
      assetRecovery: true,
      outsourceCost: true,

      returningCustomer: true,
      promotion: true,
      pr: true,
      partnerPrice: true,
      holidayScenario: true,

      usageTracking: true,
      breakEvenUsage: true,

      warehouseTracking: true,
    },
  },

];


// ============================================================
// 04. TỔNG HỢP
// ============================================================

export const PRICE_ITEMS = [
  ...DECORATION_ITEMS,
  ...PERFORMANCE_ITEMS,
  ...ASSET_ITEMS,
];


// ============================================================
// 05. LOOKUP
// ============================================================

export const PRICE_ITEM_MAP = PRICE_ITEMS.reduce((map, item) => {
  map[item.id] = item;
  return map;
}, {});


// ============================================================
// 06. NHÓM HIỂN THỊ TRÊN GRID
// ============================================================

export const PRICE_GRID_GROUPS = {
  decoration: {
    id: "decoration",
    name: "TRANG TRÍ",
  },

  performance: {
    id: "performance",
    name: "BIỂU DIỄN",
  },
};


// ============================================================
// 07. STATUS
// ============================================================

export const PRICE_ITEM_STATUS = {
  READY: "READY",
  WAITING_SUPPLIER_PRICE: "WAITING_SUPPLIER_PRICE",
  PRICE_NOT_FINAL: "PRICE_NOT_FINAL",
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default PRICE_ITEMS;