// Bộ sưu tập Icon toàn cục và dữ liệu HubIcon cho Phúc Group V2 (Đã fix các icon mạng xã hội)

import {
  Home,
  Image as ImageIcon,
  Disc,
  Compass,
  Wrench,
  Lock,
  Unlock,
  Calculator,
  Upload,
  Check,
  X,
  Loader,
  Zap,
  Settings as SettingsIcon,
  User,
  DollarSign,
  Target,
  Smartphone,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Clock,
  Lightbulb,
  Film,
  CreditCard,
  Link as LinkIcon,
  Cake,
  Heart,
  Baby,
  Handshake,
  PartyPopper,
  Sparkles,
  Flag,
  Award,
  GlassWater,
  Mic,
  Star,
  BookOpen,
  PenTool,
  Tag,
  Signpost,
  PackageOpen,
  Ticket,
  ShoppingBag,
  Shirt,
  Store,
  ClipboardList,
  Globe,
  Camera,
  Utensils,
  Calendar,
  UserCheck,
  Box,
  Puzzle,
  FolderArchive,
  BadgeCheck,
  Megaphone,
  LogOut,
  Video,
  Grid,
  PackageCheck,
} from "lucide-react";

// Các icon dạng component cho hệ thống
export const EMOJI_ICONS = {
  home: <Home size={25} />,
  gallery: <ImageIcon size={25} />,
  balloon: <Disc size={25} />,
  spin: <Compass size={25} />,
  tools: <Grid size={25} />,

  adminLock: <Lock size={25} />,
  adminUnlock: <Unlock size={25} />,
  calculator: <Calculator size={25} />,
  upload: <Upload size={25} />,
  success: <Check size={25} />,
  error: <X size={25} />,
  loading: <Loader size={25} />,
  realtime: <Zap size={25} />,
  settings: <SettingsIcon size={25} />,
  user: <User size={25} />,

  finance: <DollarSign size={25} />,
  goal: <Target size={25} />,
  social: <Smartphone size={25} />,
  supplies: <Package size={25} />,
};

// Phần cụm component/tiện ích riêng trong tab Tools . id8 là cánh cửa để đăng nhập admin
export const toolsServices = [
  // { id: 1, name: "Create Invoice", icon: <FileText size={22} />, bg: "#ede9fe" },
  // { id: 2, name: "Pay Bills", icon: <FileSpreadsheet size={22} />, bg: "#fef3c7" },
  // { id: 3, name: "Bank Transfer", icon: <Building2 size={22} />, bg: "#fee2e2" },
  // { id: 4, name: "Savings", icon: <Clock size={22} />, bg: "#f3e8ff" },
  // { id: 5, name: "Electricity", icon: <Lightbulb size={22} />, bg: "#ffe4e6" },
  // { id: 6, name: "Movie", icon: <Film size={22} />, bg: "#ede9fe" },
  // { id: 7, name: "Add Money", icon: <CreditCard size={22} />, bg: "#dbeafe" },
  { id: 8, name: "Máy tính", icon: <LinkIcon size={22} />, bg: "#fef9c3" },
];

// Dữ liệu HubIcon cho 5 tab quản lý lớn ở Admin
export const hubData = {
  content: {
    title: "Quản lý Nội dung",
    themeColor: "#5DADE2",
    sections: [
      {
        sectionName: "Sự kiện",
        items: [
          { id: "birthday", name: "Sinh nhật", icon: <Cake size={22} />, path: "/admin/content/birthday" },
          { id: "wedding", name: "Cưới", icon: <Heart size={22} />, path: "/admin/content/wedding" },
          { id: "first-birthday", name: "Thôi nôi", icon: <Baby size={22} />, path: "/admin/content/first-birthday" },
          { id: "charity", name: "Từ thiện", icon: <Handshake size={22} />, path: "/admin/content/charity" },
          { id: "grand-opening", name: "Khai trương", icon: <PartyPopper size={22} />, path: "/admin/content/grand-opening" },
          { id: "decoration", name: "Trang trí", icon: <Sparkles size={22} />, path: "/admin/content/decoration" },
          { id: "festival", name: "Lễ hội", icon: <Flag size={22} />, path: "/admin/content/festival" },
          { id: "longevity-celebration", name: "Mừng thọ", icon: <Award size={22} />, path: "/admin/content/longevity-celebration" },
          { id: "yearend-party", name: "Year End Party", icon: <GlassWater size={22} />, path: "/admin/content/yearend-party" },
          { id: "workshop", name: "Workshop", icon: <Mic size={22} />, path: "/admin/content/workshop" },
          { id: "brand-event", name: "Sự kiện Brand", icon: <Star size={22} />, path: "/admin/content/brand-event" },
          { id: "full-month", name: "Đầy tháng", icon: <Baby size={22} />, path: "/admin/content/full-month" },
          { id: "school-opening", name: "Khai giảng", icon: <BookOpen size={22} />, path: "/admin/content/school-opening" },
        ],
      },
      {
        sectionName: "Thiết kế",
        items: [
          { id: "logo", name: "Logo", icon: <PenTool size={22} />, path: "/admin/content/logo" },
          { id: "sticker-label", name: "Sticker & Label", icon: <Tag size={22} />, path: "/admin/content/sticker-label" },
          { id: "signage", name: "Signage", icon: <Signpost size={22} />, path: "/admin/content/signage" },
          { id: "business-card", name: "Business Card", icon: <CreditCard size={22} />, path: "/admin/content/business-card" },
          { id: "web-app-ui", name: "Web/App UI", icon: <Smartphone size={22} />, path: "/admin/content/web-app-ui" },
          { id: "packaging", name: "Packaging", icon: <PackageOpen size={22} />, path: "/admin/content/packaging" },
          { id: "voucher", name: "Voucher", icon: <Ticket size={22} />, path: "/admin/content/voucher" },
          { id: "posm-display", name: "POSM Display", icon: <ShoppingBag size={22} />, path: "/admin/content/posm-display" },
          { id: "uniform", name: "Uniform", icon: <Shirt size={22} />, path: "/admin/content/uniform" },
          { id: "booths", name: "Booths", icon: <Store size={22} />, path: "/admin/content/booths" },
          { id: "templates", name: "Templates", icon: <ClipboardList size={22} />, path: "/admin/content/templates" },
        ],
      },
      {
        sectionName: "Mạng Xã Hội",
        items: [
          { id: "facebook", name: "Facebook", icon: <Globe size={22} />, path: "/admin/content/facebook" },
          { id: "tiktok", name: "TikTok", icon: <Video size={22} />, path: "/admin/content/tiktok" },
          { id: "youtube", name: "YouTube", icon: <Film size={22} />, path: "/admin/content/youtube" },
          { id: "instagram", name: "Instagram", icon: <Camera size={22} />, path: "/admin/content/instagram" },
        ],
      },
      {
        sectionName: "Bảng giá",
        items: [
          { id: "price-decoration", name: "Trang trí", icon: <Sparkles size={22} />, path: "/admin/content/price-decoration" },
          { id: "price-party", name: "Tiệc", icon: <Utensils size={22} />, path: "/admin/content/price-party" },
        ],
      },
    ],
  },
  booking: {
    title: "Quản lý Booking",
    themeColor: "#F4D03F",
    sections: [
      {
        sectionName: "Danh mục Booking",
        items: [
          { id: "calendar", name: "Lịch", icon: <Calendar size={22} />, path: "/admin/booking/calendar" },
          { id: "customer-info", name: "Thông tin khách", icon: <UserCheck size={22} />, path: "/admin/booking/customer-info" },
        ],
      },
    ],
  },
  warehouse: {
    title: "Quản lý Kho",
    themeColor: "#C0392B",
    sections: [
      {
        sectionName: "Kho",
        items: [
          { id: "balloons", name: "Bong bóng", icon: <Box size={22} />, path: "/admin/warehouse/balloons" },
          { id: "zip-bags", name: "Túi zip", icon: <FolderArchive size={22} />, path: "/admin/warehouse/zip-bags" },
          { id: "stamps", name: "Tem", icon: <BadgeCheck size={22} />, path: "/admin/warehouse/stamps" },
          { id: "costumes", name: "Trang phục", icon: <Shirt size={22} />, path: "/admin/warehouse/costumes" },
        ],
      },
      {
        sectionName: "Quản lý quà",
        items: [
          { id: "prizes", name: "Kho quà", icon: <Puzzle size={22} />, path: "/admin/warehouse/prizes" },
          { id: "shipped-prizes", name: "Quà đã gửi", icon: <PackageCheck size={22} />, path: "/admin/warehouse/shipped-prizes" },
        ],
      },
    ],
  },
  finance: {
    title: "Quản lý Tài chính",
    themeColor: "#58D68D",
    sections: [
      {
        sectionName: "Danh mục Tài chính",
        items: [
          { id: "marketing-fund", name: "Quỹ marketing", icon: <Megaphone size={22} />, path: "/admin/finance/marketing-fund" },
          { id: "income", name: "Thu nhập", icon: <DollarSign size={22} />, path: "/admin/finance/income" },
          { id: "purchase", name: "Mua hàng", icon: <DollarSign size={22} />, path: "/admin/finance/purchase" },
        ],
      },
    ],
  },
  tools: {
    title: "Công cụ Hệ thống",
    themeColor: "#4f4f4f",
    sections: [
      {
        sectionName: "Tiện ích & Cài đặt",
        items: [
          { id: "logout", name: "Đăng xuất", icon: <LogOut size={22} />, path: "/logout" },
          { id: "settings", name: "Cài đặt chung", icon: <SettingsIcon size={22} />, path: "/admin/tools/settings" },
        ],
      },
    ],
  },
};

export default {
  EMOJI_ICONS,
  toolsServices,
  hubData,
};
