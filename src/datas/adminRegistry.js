// === IMPORT MANAGER ===
import PrizeManager from "../components/PrizeManager";

// === IMPORT POPUP ===
import PrizePopup from "../components/popup/PrizePopup";


// === MANAGER REGISTRY ===
// id trong hubData → Manager
export const managerRegistry = {
  // === CONTENT ===
  // birthday: EventManager,
  // wedding: EventManager,

  // === WAREHOUSE ===
  prizes: PrizeManager,

  // === THÊM CHỨC NĂNG MỚI ===
  // new-id: NewManager,
};


// === POPUP REGISTRY ===
// id trong hubData → Popup riêng
export const popupRegistry = {
  // === CONTENT ===
  // birthday: EventPopup,
  // wedding: EventPopup,

  // === WAREHOUSE ===
  prizes: PrizePopup,

  // === THÊM CHỨC NĂNG MỚI ===
  // new-id: NewPopup,
};


// === LẤY MANAGER ===
export const getManagerById = (id) => {
  return managerRegistry[id] || null;
};


// === LẤY POPUP ===
export const getPopupById = (id) => {
  return popupRegistry[id] || null;
};