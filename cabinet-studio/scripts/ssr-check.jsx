/**
 * رندر واقعی کامپوننت‌های UI روی سرور (بدون مرورگر) تا منطق پنل‌ها، استور و پلان اجرا شود.
 * نکته: در SSR، React همیشه «وضعیت اولیه» استور را می‌خواند؛ برای پوشش سناریوهای مختلف
 * (یونیت انتخاب‌شده، حالت کمد، پیام تست) همان وضعیت اولیه را تغییر می‌دهیم.
 *
 * ساخت: npx vite build --ssr scripts/ssr-check.jsx --outDir .ssr-check --logLevel error
 * اجرا: node .ssr-check/ssr-check.js
 */
import { renderToStaticMarkup } from "react-dom/server";
import { useStudio } from "../src/store/useStudio.js";
import {
  Sidebar, StyleTab, SurfaceTab, UnitsTab, LightTab, RoomTab, WardrobeStyleTab, WardrobeSizeTab,
} from "../src/ui/Sidebar.jsx";
import { PlanView } from "../src/ui/PlanView.jsx";
import { PriceCard } from "../src/ui/PriceCard.jsx";
import { TopBar, ViewsBar, Toaster } from "../src/ui/TopBar.jsx";

let n = 0;
const S = () => useStudio.getState();
const initial = useStudio.getInitialState();

/** سناریو: وضعیت اولیه‌ای که SSR می‌خواند */
const scenario = (patch) => {
  if (patch.ui) initial.ui = { ...initial.ui, ...patch.ui };
  if (patch.kitchen) initial.kitchen = { ...initial.kitchen, ...patch.kitchen };
  if (patch.wardrobe) initial.wardrobe = { ...initial.wardrobe, ...patch.wardrobe };
  if (patch.room) initial.room = { ...initial.room, ...patch.room };
  if (patch.lighting) initial.lighting = { ...initial.lighting, ...patch.lighting };
  if (patch.mode) initial.mode = patch.mode;
  if (patch.units) initial.units = patch.units;
};

const render = (name, el, must = []) => {
  const html = renderToStaticMarkup(el);
  for (const m of must) {
    if (!html.includes(m)) throw new Error(`${name}: رشته «${m}» در خروجی نیست`);
  }
  if (html.length < 120) throw new Error(`${name}: خروجی خیلی کوتاه است (${html.length})`);
  n++;
  console.log(`  ✓ ${name} — ${html.length.toLocaleString("en-US")} بایت HTML`);
};

const check = (name, fn) => {
  fn();
  n++;
  console.log(`  ✓ ${name}`);
};

console.log("\nرندر پنل‌ها (هر تب جداگانه)");
render("پوسته پنل", <Sidebar />, ["tabs", "سبک و رنگ", "چیدمان"]);
render("تب سبک و رنگ", <StyleTab />, ["نماهای آماده", "MDF", "هایگلاس", "نئوکلاسیک"]);
render("تب صفحه و یراق", <SurfaceTab />, ["صفحه کابینت", "دستگیره", "یراق‌آلات"]);
render("تب چیدمان", <UnitsTab />, ["افزودن یونیت", "ترتیب یونیت‌ها"]);
render("تب نورپردازی", <LightTab />, ["نور مخفی LED", "حالت شب"]);
render("تب فضا", <RoomTab />, ["ابعاد فضای شما", "کف و دیوار"]);
render("تب سبک کمد", <WardrobeStyleTab />, ["سبک درب کمد", "هم‌رنگ آشپزخانه"]);
render("تب ابعاد کمد", <WardrobeSizeTab />, ["ابعاد کمد", "چیدمان داخلی"]);

console.log("\nشاخه‌های شرطی");
scenario({ ui: { selected: initial.units[1].id, tab: "units" } });
render("ویرایشگر یونیت انتخاب‌شده", <UnitsTab />, ["ویرایش:", "عرض یونیت", "تکثیر"]);
scenario({ ui: { selected: null }, mode: "wardrobe" });
render("پلان کمد دیواری", <PlanView />, ["نمای کمد", "درب"]);
scenario({ ui: { toasts: [{ id: "t1", msg: "پیام آزمایشی", kind: "warn" }] } });
render("نمایش پیام (toast)", <Toaster />, ["پیام آزمایشی"]);
scenario({ mode: "kitchen", ui: { toasts: [] } });
render("پلان آشپزخانه", <PlanView />, ["پلان چیدمان", "سینک", "گاز"]);

console.log("\nحالت‌های مختلف متریال");
for (const doorStyle of ["mdf", "highgloss", "neoclassic", "shaker", "membrane", "glass"]) {
  scenario({ kitchen: { doorStyle } });
  render(`پنل با سبک ${doorStyle}`, <StyleTab />, ["سبک درب"]);
}
scenario({ kitchen: { doorStyle: "highgloss" }, room: { window: false, ceiling: false } });
render("پنل بدون پنجره/سقف", <RoomTab />, ["پنجره و نور طبیعی"]);

console.log("\nسایر اجزای رابط");
render("کارت قیمت", <PriceCard />, ["برآورد تقریبی", "تومان"]);
render("نوار بالا", <TopBar onShot={() => {}} />, ["کابینه استودیو", "آشپزخانه", "کمد دیواری"]);
render("نوار دوربین", <ViewsBar />, ["روبرو", "پلان", "دید انسانی"]);

console.log("\nمنطق استور (وضعیت زنده)");

check("افزودن و حذف یونیت", () => {
  const before = S().units.length;
  S().addUnit("drawers", 0);
  if (S().units.length !== before + 1) throw new Error("یونیت اضافه نشد");
  if (S().units[0].type !== "drawers") throw new Error("یونیت در جای درست درج نشد");
  const id = S().units[0].id;
  S().removeUnit(id);
  if (S().units.length !== before) throw new Error("یونیت حذف نشد");
});

check("جابه‌جایی یونیت با کلید و reorder", () => {
  const first = S().units[0].id;
  const second = S().units[1].id;
  S().moveUnit(first, 1);
  if (S().units[0].id !== second || S().units[1].id !== first) throw new Error("جابه‌جایی انجام نشد");
  S().moveUnit(first, -1);
  if (S().units[0].id !== first) throw new Error("بازگشت جابه‌جایی ناموفق");
  S().reorderUnits(0, 3);
  if (S().units[3].id !== first) throw new Error("reorder کار نکرد");
  S().reorderUnits(3, 0);
});

check("تغییر نوع و عرض یونیت با محدودسازی", () => {
  const id = S().units[0].id;
  S().changeUnitType(id, "tall-oven");
  let u = S().units.find((x) => x.id === id);
  if (u.type !== "tall-oven" || u.width !== 0.6) throw new Error(`نوع/عرض نادرست: ${u.type} ${u.width}`);
  S().setUnitWidth(id, 999);
  u = S().units.find((x) => x.id === id);
  if (u.width * 100 > 60) throw new Error(`عرض از حد مجاز گذشت: ${u.width}`);
  S().changeUnitType(id, "drawers");
  S().setUnitWidth(id, 60);
});

check("اعمال نمای آماده، undo و redo", () => {
  S().applyPreset("neo-cream");
  if (S().kitchen.doorStyle !== "neoclassic") throw new Error("نمای آماده اعمال نشد");
  if (S().kitchen.handleFinish !== "gold") throw new Error("رنگ یراق عوض نشد");
  S().undo();
  if (S().kitchen.doorStyle === "neoclassic") throw new Error("undo کار نکرد");
  S().redo();
  if (S().kitchen.doorStyle !== "neoclassic") throw new Error("redo کار نکرد");
  S().applyPreset("minimal-white");
});

check("باز و بسته کردن درب‌ها", () => {
  const id = S().units[0].id;
  S().toggleOpen(id);
  if (!S().units.find((u) => u.id === id).open) throw new Error("درب باز نشد");
  S().openAll(false);
  if (S().units.some((u) => u.open)) throw new Error("بستن همه ناموفق");
});

check("تغییر حالت آشپزخانه/کمد", () => {
  S().setMode("wardrobe");
  if (S().mode !== "wardrobe") throw new Error("حالت عوض نشد");
  S().setMode("kitchen");
  if (S().mode !== "kitchen") throw new Error("بازگشت حالت ناموفق");
});

console.log(`\n${n} بررسی موفق ✅\n`);
