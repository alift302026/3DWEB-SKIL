/**
 * رندر هدلس صحنه سه‌بعدی با ReactThreeTestRenderer — همه هندسه‌ها و متریال‌ها واقعاً
 * ساخته می‌شوند (بدون WebGL واقعی). خطای prop نامعتبر، هندسه NaN یا import اشتباه اینجا لو می‌رود.
 *
 * ساخت: npx vite build --ssr scripts/scene.test.jsx --outDir .ssr-check --logLevel error
 * اجرا: node .ssr-check/scene.test.js
 */
import { installCanvasStub } from "./canvas-stub.js";
installCanvasStub();

import * as THREE from "three";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { useStudio } from "../src/store/useStudio.js";
import { Kitchen } from "../src/three/kitchen.jsx";
import { Wardrobe } from "../src/three/wardrobe.jsx";
import { Floor, Walls, SideWindow, SinkWindow, CeilingLights, CounterProps, WallArt } from "../src/three/room.jsx";
import { UNIT_TYPES, DOOR_STYLES, COUNTERTOPS } from "../src/data/catalog.js";

let n = 0;
const check = (name, fn) => {
  fn();
  n++;
  console.log(`  ✓ ${name}`);
};
const S = () => useStudio.getState();

function Scene() {
  return (
    <>
      <Floor />
      <Walls />
      <SideWindow />
      <SinkWindow />
      <CeilingLights />
      <WallArt />
      <CounterProps />
      <Kitchen />
    </>
  );
}

const countByType = (obj) => {
  const map = {};
  obj.traverse((o) => {
    const t = o.type || "unknown";
    map[t] = (map[t] || 0) + 1;
  });
  return map;
};

const assertFiniteGeometry = (root, label) => {
  let meshes = 0;
  root.traverse((o) => {
    if (!o.isMesh && !o.isLineSegments) return;
    meshes++;
    const pos = o.geometry?.attributes?.position;
    if (!pos) throw new Error(`${label}: مش بدون هندسه (${o.type})`);
    for (let i = 0; i < pos.count; i++) {
      if (!Number.isFinite(pos.getX(i)) || !Number.isFinite(pos.getY(i)) || !Number.isFinite(pos.getZ(i))) {
        throw new Error(`${label}: مختصات NaN در ${o.type}`);
      }
    }
    if (o.scale.x === 0 || o.scale.y === 0 || o.scale.z === 0) {
      throw new Error(`${label}: مقیاس صفر در ${o.type}`);
    }
  });
  return meshes;
};

console.log("\nساخت صحنه پایه");

const renderer = await ReactThreeTestRenderer.create(<Scene />, { width: 800, height: 600 });
const scene = renderer.scene.instance;

let meshCount = 0;
check("صحنه آبجکت‌های سه‌بعدی دارد", () => {
  const counts = countByType(scene);
  if (!counts.Mesh || counts.Mesh < 120) throw new Error(`تعداد مش کم است: ${JSON.stringify(counts)}`);
  meshCount = counts.Mesh;
  console.log(`    ${meshCount} مش · ${counts.DirectionalLight || 0} نور جهت‌دار · ${counts.SpotLight || 0} اسپات · ${counts.PointLight || 0} نقطه‌ای · ${counts.Group || 0} گروه`);
});

check("هیچ هندسه‌ای NaN یا مقیاس صفر ندارد", () => {
  assertFiniteGeometry(scene, "صحنه پایه");
});

check("صفحه کابینت با برش سینک و گاز ساخته شده", () => {
  // نکته: RoundedBox در drei هم از ExtrudeGeometry می‌آید؛ صفحه بزرگ‌ترین اکستروژن در راستای X است.
  let found = null;
  let best = 0;
  scene.traverse((o) => {
    if (!(o.isMesh && o.geometry?.type === "ExtrudeGeometry")) return;
    o.geometry.computeBoundingBox();
    const dx = o.geometry.boundingBox.max.x - o.geometry.boundingBox.min.x;
    if (dx > best) {
      best = dx;
      found = o;
    }
  });
  if (!found) throw new Error("هندسه صفحه پیدا نشد");
  const bb = found.geometry.boundingBox;
  if (bb.max.x - bb.min.x < 2) throw new Error(`طول صفحه نامعقول: ${bb.max.x - bb.min.x}`);
  // عمق صفحه در راستای y هندسه (پیش از چرخش) باید ≈ عمق کابینت + پیشانی باشد
  const dy = bb.max.y - bb.min.y;
  if (dy < 0.55 || dy > 0.7) throw new Error(`عمق صفحه نامعقول: ${dy}`);
  const dz = bb.max.z - bb.min.z;
  if (dz < 0.03 || dz > 0.05) throw new Error(`ضخامت صفحه نامعقول: ${dz}`);
  console.log(`    طول ${((bb.max.x - bb.min.x) * 100).toFixed(0)} سانت · عمق ${(dy * 100).toFixed(0)} سانت · ضخامت ${(dz * 100).toFixed(1)} سانت`);
});

check("فریم‌های انیمیشن (بازشو درب‌ها و شعله) بدون خطا اجرا می‌شوند", async () => {
  S().openAll(true);
  S().setLighting({ hobFlame: true });
  await renderer.update(<Scene />);
});

await ReactThreeTestRenderer.act(async () => {
  await renderer.advanceFrames(12, 1 / 60);
});
check("۱۲ فریم با درب‌های باز رندر شد", () => assertFiniteGeometry(scene, "فریم‌های انیمیشن") > 0);

console.log("\nپوشش همه انواع یونیت");

for (const t of UNIT_TYPES) {
  S().reset();
  S().setUI({ selected: null });
  // دو نمونه از هر نوع یونیت تا هندسه تکی و دوتایی پوشش داده شود
  while (S().units.length) S().removeUnit(S().units[0].id);
  S().addUnit(t.id);
  S().addUnit(t.id);
  const before = S().units.length;
  await renderer.update(<Scene />);
  check(`یونیت «${t.name}» (${t.id})`, () => {
    if (S().units.length !== before) throw new Error("تعداد یونیت‌ها درست نیست");
    const m = assertFiniteGeometry(scene, `یونیت ${t.id}`);
    if (m < 50) throw new Error(`مش‌های صحنه با ${t.id} خیلی کم است: ${m}`);
  });
  await ReactThreeTestRenderer.act(async () => {
    await renderer.advanceFrames(3, 1 / 60);
  });
}

console.log("\nپوشش همه سبک‌های درب و صفحه‌ها");

for (const ds of DOOR_STYLES) {
  S().setKitchen({ doorStyle: ds.id });
  await renderer.update(<Scene />);
  check(`سبک درب ${ds.name}`, () => assertFiniteGeometry(scene, `doorStyle ${ds.id}`) > 0);
}

for (const c of COUNTERTOPS) {
  S().setKitchen({ counter: c.id });
  await renderer.update(<Scene />);
  check(`صفحه ${c.name}`, () => assertFiniteGeometry(scene, `counter ${c.id}`) > 0);
}

console.log("\nحالت کمد دیواری");

await renderer.update(<Wardrobe />);
check("کمد با تنظیمات پیش‌فرض", () => assertFiniteGeometry(renderer.scene.instance, "wardrobe") > 20);

for (const [label, patch] of [
  ["۵ لت لولایی + آینه", { doors: 5, sliding: false, mirror: true }],
  ["۲ لت ریلی بدون آینه", { doors: 2, sliding: true, mirror: false }],
  ["بدون طبقه و کشو", { shelves: 0, drawers: 0, rails: 0 }],
  ["حداکثر چیدمان", { shelves: 7, drawers: 4, rails: 2 }],
  ["بزرگ‌ترین ابعاد", { width: 4.2, height: 3.0, depth: 0.8 }],
]) {
  S().setWardrobe(patch);
  await renderer.update(<Wardrobe />);
  check(`کمد: ${label}`, () => assertFiniteGeometry(renderer.scene.instance, `wardrobe ${label}`) > 20);
}

console.log("\nحالت‌های نور و اتاق");

for (const patch of [
  { night: true, led: true, ledIntensity: 3, interior: true, underGlow: true },
  { led: false, night: false },
  { led: true, interior: false, underGlow: false, sun: 0 },
]) {
  S().setLighting(patch);
  await renderer.update(<Scene />);
  check(`نور ${JSON.stringify(patch).slice(0, 46)}`, () => assertFiniteGeometry(renderer.scene.instance, "lighting") > 0);
}

S().reset();
for (const patch of [
  { width: 7, depth: 6, height: 3.6, window: true, ceiling: true },
  { width: 2.6, depth: 2.4, height: 2.4, window: false, ceiling: false },
]) {
  S().setRoom(patch);
  await renderer.update(<Scene />);
  check(`اتاق ${patch.width}×${patch.depth}×${patch.height}`, () => assertFiniteGeometry(renderer.scene.instance, "room") > 0);
}

console.log("\nآزادسازی حافظه");
await renderer.unmount();
check("unmount بدون خطا", () => {
  if (renderer.scene === undefined) throw new Error("scene باید بعد از unmount هم در دسترس باشد");
});

console.log(`\n${n} بررسی سه‌بعدی موفق ✅\n`);
process.exit(0);
