/**
 * کاتالوگ متریال‌ها، سبک‌ها، یراق‌آلات و لوازم — منبع حقیقت برای پنل و برآورد قیمت.
 * قیمت‌ها تقریبی و به تومان است (قابل بازنویسی از پنل مدیریت در نسخه بعدی).
 */

export const DOOR_STYLES = [
  {
    id: "mdf",
    name: "MDF مات",
    desc: "روکش ملامینه، سطح یکدست و بدون بازتاب",
    roughness: 0.62,
    clearcoat: 0,
    metalness: 0.0,
    frame: "none",
    price: 1,
    pricePerM: 16_500_000,
  },
  {
    id: "highgloss",
    name: "هایگلاس",
    desc: "برق آینه‌ای با لایه کلیرکت، بازتاب نور محیط",
    roughness: 0.09,
    clearcoat: 1,
    metalness: 0.05,
    frame: "none",
    price: 1.32,
    pricePerM: 22_000_000,
  },
  {
    id: "neoclassic",
    name: "نئوکلاسیک",
    desc: "قاب ابزارخورده با پنل فرورفته، حس کلاسیک مدرن",
    roughness: 0.34,
    clearcoat: 0.55,
    metalness: 0.0,
    frame: "classic",
    frameW: 0.075,
    price: 1.6,
    pricePerM: 28_500_000,
  },
  {
    id: "shaker",
    name: "شیکر / مدرن",
    desc: "قاب باریک و پنل تخت، محبوب‌ترین سبک امروز",
    roughness: 0.45,
    clearcoat: 0.25,
    metalness: 0.0,
    frame: "slim",
    frameW: 0.045,
    price: 1.4,
    pricePerM: 24_000_000,
  },
  {
    id: "membrane",
    name: "ممبران",
    desc: "روکش وکیوم با لبه‌های گرد و بدون درز",
    roughness: 0.28,
    clearcoat: 0.7,
    metalness: 0.0,
    frame: "round",
    frameW: 0.06,
    price: 1.45,
    pricePerM: 25_000_000,
  },
  {
    id: "glass",
    name: "شیشه‌ای",
    desc: "قاب آلومینیمی با شیشه شفاف برای ویترین",
    roughness: 0.3,
    clearcoat: 0.4,
    metalness: 0.1,
    frame: "glass",
    frameW: 0.035,
    price: 1.5,
    pricePerM: 26_000_000,
  },
];

export const DOOR_COLORS = [
  { id: "ivory", name: "سفید استخوانی", hex: "#efeae1" },
  { id: "pure-white", name: "سفید خالص", hex: "#f7f7f6" },
  { id: "cream", name: "کرم", hex: "#e4d6bd" },
  { id: "greige", name: "گریژ", hex: "#b9b0a4" },
  { id: "sage", name: "سبز سدری", hex: "#8c9c8b" },
  { id: "olive", name: "زیتونی", hex: "#6d7250" },
  { id: "navy", name: "سرمه‌ای", hex: "#273246" },
  { id: "petrol", name: "کله‌غازی", hex: "#1f4a4a" },
  { id: "terracotta", name: "آجری", hex: "#a4553c" },
  { id: "walnut", name: "گردویی", hex: "#6b4630" },
  { id: "oak", name: "بلوطی", hex: "#a97e4f" },
  { id: "ash", name: "طوسی روشن", hex: "#cfd2d4" },
  { id: "graphite", name: "گرافیتی", hex: "#4a4d52" },
  { id: "anthracite", name: "آنتراسیت", hex: "#2c2e33" },
  { id: "black", name: "مشکی", hex: "#15161a" },
  { id: "wine", name: "زرشکی", hex: "#63242f" },
];

export const BODY_COLORS = [
  { id: "white", name: "سفید", hex: "#f2f2f0" },
  { id: "grey", name: "طوسی", hex: "#b9bbbd" },
  { id: "oak", name: "بلوط", hex: "#b48a5c" },
  { id: "walnut", name: "گردو", hex: "#7a5236" },
  { id: "black", name: "مشکی", hex: "#22242a" },
];

export const COUNTERTOPS = [
  { id: "calacatta", name: "کوارتز کالاکاتا", hex: "#f2efe9", vein: "#b8b3aa", roughness: 0.16, kind: "marble", pricePerM: 21_000_000 },
  { id: "quartz-sand", name: "کوارتز شنی", hex: "#ddd4c4", vein: "#b3a690", roughness: 0.22, kind: "marble", pricePerM: 17_500_000 },
  { id: "nero", name: "گرانیت مشکی", hex: "#1c1d20", vein: "#3a3d42", roughness: 0.18, kind: "marble", pricePerM: 13_000_000 },
  { id: "emerald", name: "سبز زمردی", hex: "#1f4438", vein: "#4e7a68", roughness: 0.2, kind: "marble", pricePerM: 19_000_000 },
  { id: "concrete", name: "بتنی", hex: "#9a9a97", vein: "#82827f", roughness: 0.72, kind: "solid", pricePerM: 9_500_000 },
  { id: "oak", name: "چوب بلوط", hex: "#b58452", vein: "#8a6134", roughness: 0.55, kind: "wood", pricePerM: 11_000_000 },
  { id: "walnut", name: "چوب گردو", hex: "#6d4a30", vein: "#4e3320", roughness: 0.5, kind: "wood", pricePerM: 12_500_000 },
  { id: "terrazzo", name: "ترازو", hex: "#e6e2d9", vein: "#9fa79f", roughness: 0.3, kind: "marble", pricePerM: 14_000_000 },
];

export const HANDLES = [
  { id: "bar", name: "میله‌ای", kind: "bar", length: 0.16, price: 480_000 },
  { id: "bar-long", name: "میله‌ای بلند", kind: "bar", length: 0.32, price: 720_000 },
  { id: "knob", name: "دکمه‌ای", kind: "knob", length: 0.035, price: 320_000 },
  { id: "edge", name: "لبه‌ای (J-pull)", kind: "edge", length: 0, price: 900_000 },
  { id: "strap", name: "چرمی", kind: "strap", length: 0.12, price: 380_000 },
  { id: "none", name: "بدون دستگیره (مگنتی)", kind: "none", length: 0, price: 1_250_000 },
];

export const HANDLE_FINISHES = [
  { id: "chrome", name: "کروم", hex: "#d9dde1", metalness: 1, roughness: 0.14 },
  { id: "steel", name: "استیل خش‌دار", hex: "#b6bcc2", metalness: 1, roughness: 0.34 },
  { id: "gold", name: "طلایی", hex: "#c9a227", metalness: 1, roughness: 0.22 },
  { id: "bronze", name: "برنز", hex: "#8a5a34", metalness: 1, roughness: 0.38 },
  { id: "black", name: "مشکی مات", hex: "#1d1e22", metalness: 0.6, roughness: 0.55 },
  { id: "white", name: "سفید", hex: "#f0f0ee", metalness: 0.1, roughness: 0.4 },
];

export const APPLIANCE_FINISHES = [
  { id: "steel", name: "استیل", hex: "#b9bec4", metalness: 1, roughness: 0.26 },
  { id: "black", name: "شیشه مشکی", hex: "#111216", metalness: 0.35, roughness: 0.12 },
  { id: "white", name: "سفید", hex: "#eeeceb", metalness: 0.1, roughness: 0.3 },
  { id: "gold", name: "شامپاینی", hex: "#cbb287", metalness: 1, roughness: 0.24 },
  { id: "panel", name: "هم‌رنگ کابینت", hex: null, metalness: 0, roughness: 0.4 },
];

export const FLOORS = [
  { id: "oak", name: "پارکت بلوط", hex: "#b08558", kind: "wood", pricePerM: 1_400_000 },
  { id: "walnut", name: "پارکت گردو", hex: "#7d5738", kind: "wood", pricePerM: 1_600_000 },
  { id: "greywood", name: "پارکت طوسی", hex: "#9d938a", kind: "wood", pricePerM: 1_500_000 },
  { id: "tile", name: "سرامیک روشن", hex: "#e3e0da", kind: "tile", pricePerM: 900_000 },
  { id: "tile-dark", name: "سرامیک دودی", hex: "#5c5f63", kind: "tile", pricePerM: 1_050_000 },
  { id: "stone", name: "سنگ اسلب", hex: "#cfcac2", kind: "stone", pricePerM: 2_200_000 },
];

export const WALL_COLORS = [
  { id: "linen", name: "کتان", hex: "#e9e3d9" },
  { id: "white", name: "سفید", hex: "#f4f3f1" },
  { id: "sand", name: "شنی", hex: "#ddd2c0" },
  { id: "sage", name: "سبز ملایم", hex: "#c3cdc0" },
  { id: "grey", name: "طوسی", hex: "#c9c9c7" },
  { id: "ink", name: "زغالی", hex: "#3b3d42" },
];

export const UNIT_TYPES = [
  { id: "door", name: "یونیت درب‌دار", icon: "door", minW: 30, maxW: 90, defW: 60, pricePerM: 15_000_000, wall: "door" },
  { id: "drawers", name: "کشو", icon: "drawer", minW: 40, maxW: 90, defW: 60, pricePerM: 17_500_000, wall: "door" },
  { id: "door-drawer", name: "درب + کشو", icon: "mix", minW: 40, maxW: 90, defW: 60, pricePerM: 16_500_000, wall: "door" },
  { id: "sink", name: "سینک", icon: "sink", minW: 60, maxW: 100, defW: 90, pricePerM: 16_000_000, wall: "window" },
  { id: "hob", name: "گاز رومیزی", icon: "hob", minW: 60, maxW: 90, defW: 75, pricePerM: 16_000_000, wall: "hood" },
  { id: "open", name: "قفسه باز", icon: "open", minW: 30, maxW: 80, defW: 45, pricePerM: 12_000_000, wall: "open" },
  { id: "tall", name: "کمد ایستاده", icon: "tall", minW: 45, maxW: 90, defW: 60, pricePerM: 19_000_000, wall: "none" },
  { id: "tall-oven", name: "فر توکار", icon: "oven", minW: 60, maxW: 60, defW: 60, pricePerM: 20_000_000, wall: "none" },
  { id: "dishwasher", name: "ماشین ظرفشویی", icon: "dw", minW: 60, maxW: 60, defW: 60, pricePerM: 15_000_000, wall: "door" },
  { id: "fridge", name: "یخچال", icon: "fridge", minW: 70, maxW: 90, defW: 75, pricePerM: 0, wall: "none" },
];

export const APPLIANCE_PRICES = {
  sinkSingle: 4_800_000,
  sinkDouble: 7_200_000,
  faucet: 3_400_000,
  hob: 12_500_000,
  oven: 18_900_000,
  hood: 9_600_000,
  fridge: 46_000_000,
  dishwasher: 27_500_000,
};

export const LED_PRESETS = [
  { id: "warm", name: "آفتابی", hex: "#ffca87" },
  { id: "neutral", name: "طبیعی", hex: "#fff2e0" },
  { id: "cool", name: "مهتابی", hex: "#eaf2ff" },
  { id: "amber", name: "کهربایی", hex: "#ff9d3c" },
  { id: "ice", name: "یخی", hex: "#8fd8ff" },
  { id: "rose", name: "صورتی", hex: "#ff8fb1" },
];

/** نماهای آماده — یک کلیک، کل فضا عوض می‌شود */
export const PRESETS = [
  {
    id: "minimal-white",
    name: "سفید مینیمال",
    tag: "پرفروش",
    doorStyle: "highgloss",
    doorColor: "pure-white",
    bodyColor: "white",
    counter: "calacatta",
    handle: "none",
    handleFinish: "chrome",
    floor: "oak",
    wall: "linen",
    led: "warm",
  },
  {
    id: "neo-cream",
    name: "نئوکلاسیک کرم",
    tag: "لاکچری",
    doorStyle: "neoclassic",
    doorColor: "cream",
    bodyColor: "white",
    counter: "quartz-sand",
    handle: "bar-long",
    handleFinish: "gold",
    floor: "stone",
    wall: "linen",
    led: "warm",
  },
  {
    id: "dark-modern",
    name: "مدرن تیره",
    tag: "خاص",
    doorStyle: "shaker",
    doorColor: "anthracite",
    bodyColor: "black",
    counter: "nero",
    handle: "bar",
    handleFinish: "black",
    floor: "tile-dark",
    wall: "grey",
    led: "cool",
  },
  {
    id: "green-sage",
    name: "سبز سدری",
    tag: "ترند ۱۴۰۴",
    doorStyle: "mdf",
    doorColor: "sage",
    bodyColor: "oak",
    counter: "calacatta",
    handle: "bar",
    handleFinish: "bronze",
    floor: "greywood",
    wall: "linen",
    led: "neutral",
  },
  {
    id: "warm-wood",
    name: "چوب گرم",
    tag: "گرم و صمیمی",
    doorStyle: "membrane",
    doorColor: "oak",
    bodyColor: "oak",
    counter: "concrete",
    handle: "strap",
    handleFinish: "black",
    floor: "walnut",
    wall: "sand",
    led: "amber",
  },
  {
    id: "navy-gold",
    name: "سرمه‌ای طلایی",
    tag: "دراماتیک",
    doorStyle: "shaker",
    doorColor: "navy",
    bodyColor: "white",
    counter: "calacatta",
    handle: "knob",
    handleFinish: "gold",
    floor: "stone",
    wall: "white",
    led: "warm",
  },
];

export const CAMERA_VIEWS = [
  { id: "overview", name: "نمای کلی", pos: [3.1, 2.35, 4.0], target: [0, 1.0, -0.6] },
  { id: "front", name: "روبرو", pos: [0.1, 1.55, 3.45], target: [0, 1.15, -0.8] },
  { id: "corner", name: "زاویه", pos: [-2.9, 1.9, 3.1], target: [-0.2, 1.0, -0.7] },
  { id: "top", name: "پلان", pos: [0.01, 5.4, 0.9], target: [0, 0.4, -0.5] },
  { id: "eye", name: "دید انسانی", pos: [1.15, 1.62, 1.55], target: [-0.4, 1.05, -0.9] },
  { id: "detail", name: "جزئیات", pos: [-1.5, 1.35, 1.5], target: [-0.6, 0.95, -0.7] },
];

export const byId = (arr, id) => arr.find((x) => x.id === id) || arr[0];
