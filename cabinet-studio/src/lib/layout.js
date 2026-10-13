import { UNIT_TYPES, DOOR_STYLES, COUNTERTOPS, HANDLES, HANDLE_FINISHES, APPLIANCE_PRICES, byId } from "../data/catalog.js";

/** ابعاد استاندارد (متر) */
export const C = {
  toe: 0.1, // پاخور
  bodyH: 0.76, // بدنه یونیت زمینی
  counterH: 0.04, // ضخامت صفحه
  workH: 0.9, // ارتفاع تمام‌شده صفحه
  depth: 0.58, // عمق یونیت زمینی
  wallDepth: 0.33, // عمق یونیت دیواری
  wallBottom: 1.45,
  wallH: 0.72,
  tallH: 2.17,
  panel: 0.018, // ضخامت درب
  gap: 0.004, // درز بین درب‌ها
};

/** تقسیم ارتفاع بدنه بین کشوها (از بالا به پایین) */
export const drawerHeights = (n, total) => {
  if (n <= 1) return [total];
  if (n === 2) return [total * 0.44, total * 0.56];
  if (n === 3) return [total * 0.25, total * 0.33, total * 0.42];
  return Array(n).fill(total / n);
};

export const isTall = (u) => u.type === "tall" || u.type === "tall-oven" || u.type === "fridge";
export const hasCounter = (u) => !isTall(u);
export const unitMeta = (u) => byId(UNIT_TYPES, u.type);

let seq = 1;
export const uid = (p = "u") => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export function makeUnit(type, widthCm) {
  const meta = byId(UNIT_TYPES, type);
  const clamped = Math.min(meta.maxW, Math.max(meta.minW, widthCm ?? meta.defW));
  const w = clamped / 100;
  return {
    id: uid(),
    type,
    width: w,
    drawers: type === "drawers" ? 3 : type === "door-drawer" ? 1 : 0,
    double: w >= 0.8 && (type === "door" || type === "sink"),
    open: false,
    shelf: type === "open" ? 2 : 1,
    interiorLed: type === "open" || type === "glass",
  };
}

/** چیدمان خطی: هر یونیت یک بازه روی محور X می‌گیرد (از صفر تا عرض کل) */
export function computeLayout(units) {
  let x = 0;
  const items = units.map((u) => {
    const it = { ...u, x0: x, x1: x + u.width, cx: x + u.width / 2, meta: unitMeta(u) };
    x += u.width;
    return it;
  });
  return { items, width: x };
}

/** قطعات صفحه کابینت + برش‌های سینک و گاز */
export function computeCounter(items) {
  const spans = [];
  const holes = [];
  for (const it of items) {
    if (!hasCounter(it)) continue; // یونیت ایستاده صفحه را قطع می‌کند
    const last = spans[spans.length - 1];
    // یونیت‌های پشت‌سرهم در یک قطعه پیوسته ادغام می‌شوند (بدون درز روی صفحه)
    if (last && Math.abs(last.x1 - it.x0) < 1e-6) last.x1 = it.x1;
    else spans.push({ x0: it.x0, x1: it.x1 });
    if (it.type === "sink") {
      const w = Math.min(it.width - 0.16, it.double ? 0.72 : 0.46);
      holes.push({ cx: it.cx, cz: 0, w, d: 0.36, r: 0.035, kind: "sink", double: it.double });
    }
    if (it.type === "hob") {
      const w = Math.min(it.width - 0.12, 0.62);
      holes.push({ cx: it.cx, cz: 0.01, w, d: 0.42, r: 0.02, kind: "hob" });
    }
  }
  return { spans, holes };
}

const m2 = (w, h) => w * h;

/** برآورد قیمت — خروجی به تومان */
export function estimate({ units, kitchen, room, wardrobe, mode }) {
  const style = byId(DOOR_STYLES, kitchen.doorStyle);
  const counter = byId(COUNTERTOPS, kitchen.counter);
  const handle = byId(HANDLES, kitchen.handle);
  const lines = [];

  if (mode === "kitchen") {
    const { items, width } = computeLayout(units);
    let baseM = 0;
    let wallM = 0;
    let handleCount = 0;
    let appliance = 0;

    for (const it of items) {
      if (isTall(it)) {
        baseM += m2(it.width, C.tallH - C.toe);
        handleCount += it.type === "fridge" ? 2 : 2;
      } else {
        baseM += m2(it.width, C.bodyH);
        wallM += m2(it.width, C.wallH);
        handleCount += it.drawers ? it.drawers : it.width >= 0.8 ? 2 : 1;
      }
      if (it.type === "sink") appliance += (it.double ? APPLIANCE_PRICES.sinkDouble : APPLIANCE_PRICES.sinkSingle) + APPLIANCE_PRICES.faucet;
      if (it.type === "hob") appliance += APPLIANCE_PRICES.hob + APPLIANCE_PRICES.hood;
      if (it.type === "tall-oven") appliance += APPLIANCE_PRICES.oven;
      if (it.type === "fridge") appliance += APPLIANCE_PRICES.fridge;
      if (it.type === "dishwasher") appliance += APPLIANCE_PRICES.dishwasher;
    }

    lines.push({ label: `یونیت زمینی — ${style.name}`, value: Math.round(baseM * style.pricePerM) });
    lines.push({ label: `یونیت دیواری — ${style.name}`, value: Math.round(wallM * style.pricePerM * 0.82) });
    lines.push({ label: `صفحه ${counter.name} (${width.toFixed(2)} متر)`, value: Math.round(width * counter.pricePerM) });
    lines.push({ label: `${handleCount} عدد دستگیره ${handle.name}`, value: handleCount * handle.price });
    if (appliance) lines.push({ label: "لوازم خانگی", value: appliance });
    lines.push({ label: "نصب، یراق و حمل", value: Math.round((baseM + wallM) * 1_100_000) });
  } else {
    const { width, height, depth } = wardrobe;
    const doorStyle = byId(DOOR_STYLES, wardrobe.doorStyle);
    const area = m2(width, height);
    lines.push({ label: `بدنه کمد (${depth * 100 | 0} سانت)`, value: Math.round(area * 9_500_000) });
    lines.push({ label: `درب ${doorStyle.name} — ${wardrobe.doors} لت`, value: Math.round(area * doorStyle.pricePerM * 0.9) });
    lines.push({ label: "ریل، لولا و یراق", value: Math.round(width * 2_400_000) });
    if (wardrobe.mirror) lines.push({ label: "آینه تمام‌قد", value: 3_800_000 });
    if (wardrobe.interiorLight) lines.push({ label: "نورپردازی داخلی", value: 2_200_000 });
    lines.push({ label: "نصب و تنظیم", value: Math.round(area * 700_000) });
  }

  const total = lines.reduce((s, l) => s + l.value, 0);
  return { lines, total };
}

export const toman = (n) => new Intl.NumberFormat("fa-IR").format(Math.round(n));
export const cm = (m) => Math.round(m * 100);
export const faNum = (n) => new Intl.NumberFormat("fa-IR").format(n);
