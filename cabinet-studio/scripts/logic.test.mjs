/**
 * تست منطق پارامتریک — مستقیم روی همان ماژول‌هایی که صحنه سه‌بعدی و پنل استفاده می‌کنند.
 * اجرا: node scripts/logic.test.mjs
 */
import assert from "node:assert/strict";
import { computeLayout, computeCounter, estimate, makeUnit, drawerHeights, C } from "../src/lib/layout.js";
import { buildCounterGeometry } from "../src/lib/counterGeometry.js";
import { DOOR_STYLES, COUNTERTOPS, UNIT_TYPES } from "../src/data/catalog.js";

let n = 0;
const test = (name, fn) => {
  fn();
  n++;
  console.log(`  ✓ ${name}`);
};

const baseUnits = [
  makeUnit("drawers", 60),
  makeUnit("hob", 75),
  makeUnit("door", 60),
  makeUnit("sink", 90),
  makeUnit("tall-oven", 60),
];

const kitchen = {
  doorStyle: "highgloss",
  doorColor: "pure-white",
  bodyColor: "white",
  counter: "calacatta",
  counterH: 4,
  handle: "none",
  handleFinish: "chrome",
  applianceFinish: "steel",
  wallCabinets: true,
  wallH: 72,
  wallGap: 55,
};
const room = { width: 4.6, depth: 3.8, height: 2.8, backsplashH: 0.55, backsplash: true, floor: "oak" };
const wardrobe = { width: 2.6, height: 2.45, depth: 0.62, doors: 3, shelves: 4, rails: 1, drawers: 2, mirror: true, interiorLight: true, doorStyle: "shaker" };

console.log("\nچیدمان خطی");

test("جمع عرض‌ها و بازه‌ها درست است", () => {
  const { items, width } = computeLayout(baseUnits);
  assert.equal(items.length, 5);
  assert.ok(Math.abs(width - (0.6 + 0.75 + 0.6 + 0.9 + 0.6)) < 1e-9);
  let x = 0;
  for (const it of items) {
    assert.ok(Math.abs(it.x0 - x) < 1e-9, `x0 of ${it.type}`);
    assert.ok(Math.abs(it.cx - (x + it.width / 2)) < 1e-9);
    x += it.width;
  }
  assert.ok(Math.abs(items.at(-1).x1 - width) < 1e-9);
});

test("یونیت ایستاده صفحه ندارد و یخچال شکاف ایجاد می‌کند", () => {
  const withFridge = [...baseUnits, makeUnit("fridge", 75)];
  const { items } = computeLayout(withFridge);
  const { spans } = computeCounter(items);
  assert.equal(spans.length, 1, "یونیت‌های پشت‌سرهم باید در یک قطعه ادغام شوند");
  // drawers .6 + hob .75 + door .6 + sink .9 = 2.85 و بعد از آن کمد ایستاده صفحه را قطع می‌کند
  assert.ok(Math.abs(spans[0].x1 - 2.85) < 1e-9, `پایان صفحه: ${spans[0].x1}`);

  const fridgeFirst = [makeUnit("fridge", 75), makeUnit("door", 60), makeUnit("door", 60)];
  const { spans: s2 } = computeCounter(computeLayout(fridgeFirst).items);
  assert.equal(s2.length, 1);
  assert.ok(Math.abs(s2[0].x0 - 0.75) < 1e-9, "صفحه باید بعد از یخچال شروع شود");
});

test("برش سینک و گاز داخل بازه درست قرار می‌گیرد", () => {
  const { items, width } = computeLayout(baseUnits);
  const { holes } = computeCounter(items);
  assert.equal(holes.length, 2);
  const hob = items.find((i) => i.type === "hob");
  const sink = items.find((i) => i.type === "sink");
  const hh = holes.find((h) => h.kind === "hob");
  const hs = holes.find((h) => h.kind === "sink");
  assert.ok(Math.abs(hh.cx - hob.cx) < 1e-9);
  assert.ok(Math.abs(hs.cx - sink.cx) < 1e-9);
  assert.ok(hh.w <= hob.width, "برش گاز از یونیت بزرگ‌تر نباشد");
  assert.ok(hs.d < C.depth, "عمق برش سینک کمتر از عمق کابینت");
  assert.ok(width > 3);
});

console.log("\nهندسه صفحه کابینت (three.js)");

test("اکسترود صفحه تولید می‌شود و NaN ندارد", () => {
  const { items, width } = computeLayout(baseUnits);
  const { spans, holes } = computeCounter(items);
  const geo = buildCounterGeometry(spans, holes, 0.04, C.depth);
  assert.ok(geo, "geometry null");
  const pos = geo.attributes.position;
  assert.ok(pos.count > 500, `تعداد رأس کم است: ${pos.count}`);
  for (let i = 0; i < pos.count; i++) {
    assert.ok(Number.isFinite(pos.getX(i)) && Number.isFinite(pos.getY(i)) && Number.isFinite(pos.getZ(i)), "NaN در رأس‌ها");
  }
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  // صفحه از اولین تا آخرین قطعه (بدون یونیت‌های ایستاده) + لبه بیرونی ۲ میلی‌متر + پخ ۵ میلی‌متر
  const endX = spans.at(-1).x1 + 0.002 + 0.005;
  assert.ok(Math.abs(bb.min.x - 0) < 0.01, `min.x=${bb.min.x}`);
  assert.ok(Math.abs(bb.max.x - endX) < 0.004, `max.x=${bb.max.x} باید ≈${endX} باشد`);
  assert.ok(bb.max.x < width, "صفحه نباید از طول ردیف بزرگ‌تر باشد");
  assert.ok(bb.max.y - bb.min.y < 0.65, `عمق صفحه: ${bb.max.y - bb.min.y}`);
  assert.ok(geo.attributes.normal && geo.attributes.uv, "normal/uv موجود نیست");
  geo.dispose();
});

test("برش‌ها واقعاً سوراخ ایجاد می‌کنند", () => {
  const spans = [{ x0: 0, x1: 2 }];
  const plain = buildCounterGeometry(spans, [], 0.04, C.depth);
  const cut = buildCounterGeometry(spans, [{ cx: 1, cz: 0, w: 0.7, d: 0.4, r: 0.03, kind: "sink", double: true }], 0.04, C.depth);
  assert.ok(cut.attributes.position.count > plain.attributes.position.count, "سوراخ باید رأس اضافه کند");
  plain.dispose();
  cut.dispose();
});

test("کشوها تمام ارتفاع بدنه را پر می‌کنند", () => {
  for (const n of [1, 2, 3, 4]) {
    const hs = drawerHeights(n, C.bodyH);
    const sum = hs.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - C.bodyH) < 1e-9, `جمع ارتفاع کشوها برای ${n}`);
    assert.equal(hs.length, n);
  }
});

console.log("\nبرآورد قیمت");

test("برآورد آشپزخانه عدد معقول می‌دهد", () => {
  const est = estimate({ units: baseUnits, kitchen, room, wardrobe, mode: "kitchen" });
  assert.ok(est.lines.length >= 5, `تعداد ردیف: ${est.lines.length}`);
  assert.ok(est.total > 30_000_000 && est.total < 900_000_000, `جمع: ${est.total}`);
  assert.equal(est.total, est.lines.reduce((s, l) => s + l.value, 0));
});

test("سبک گران‌تر قیمت را بالا می‌برد", () => {
  const cheap = estimate({ units: baseUnits, kitchen: { ...kitchen, doorStyle: "mdf" }, room, wardrobe, mode: "kitchen" });
  const pricey = estimate({ units: baseUnits, kitchen: { ...kitchen, doorStyle: "neoclassic" }, room, wardrobe, mode: "kitchen" });
  assert.ok(pricey.total > cheap.total, "نئوکلاسیک باید گران‌تر از MDF باشد");
});

test("برآورد کمد دیواری مستقل کار می‌کند", () => {
  const est = estimate({ units: baseUnits, kitchen, room, wardrobe, mode: "wardrobe" });
  assert.ok(est.total > 10_000_000);
  assert.ok(est.lines.some((l) => l.label.includes("بدنه کمد")));
});

console.log("\nکاتالوگ");

test("همه شناسه‌های پیش‌فرض در کاتالوگ وجود دارند", () => {
  assert.ok(DOOR_STYLES.find((d) => d.id === kitchen.doorStyle));
  assert.ok(COUNTERTOPS.find((d) => d.id === kitchen.counter));
  for (const t of ["door", "drawers", "door-drawer", "sink", "hob", "open", "tall", "tall-oven", "dishwasher", "fridge"]) {
    assert.ok(UNIT_TYPES.find((u) => u.id === t), `نوع یونیت ${t} تعریف نشده`);
  }
});

test("makeUnit عرض را محدود به بازه مجاز می‌کند", () => {
  const u = makeUnit("tall-oven", 200);
  assert.equal(u.width, 0.6, "فر توکار فقط ۶۰ سانت");
});

console.log(`\n${n} تست موفق ✅\n`);
