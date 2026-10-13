import { installCanvasStub } from "./canvas-stub.js";
installCanvasStub();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import Renderer from "@react-three/test-renderer";
import CustomerApp, { CustomerPanel } from "../src/CustomerApp.jsx";
import { useStudio } from "../src/store/useStudio.js";
import { Kitchen } from "../src/three/kitchen.jsx";
import { ShowroomFurniture } from "../src/three/ShowroomFurniture.jsx";
import {
  SHOWROOM_ROOM,
  WALK_START,
  canStand,
  showroomObstacles,
  walkStep,
} from "../src/lib/navigation.js";

let count = 0;
function check(name, fn) {
  fn();
  count++;
  console.log(`  ✓ ${name}`);
}
const state = () => useStudio.getState();
const room = SHOWROOM_ROOM;
const obstacles = showroomObstacles(room, state().units);
check("نقطه شروع داخل اتاق و خارج مبلمان است", () =>
  assert(canStand(WALK_START[0], WALK_START[2], room, obstacles)),
);
check("داخل جزیره و کابینت نمی‌توان ایستاد", () => {
  assert(!canStand(0.35, 0.45, room, obstacles));
  assert(!canStand(0, -2.1, room, obstacles));
  assert(!canStand(-2.4, -0.65, room, obstacles));
});
check("دیوارها مسیر خروج را می‌بندند", () =>
  assert(!canStand(2.65, 2.3, room, obstacles)),
);
check("حرکت طولانی از جزیره عبور نمی‌کند", () => {
  const next = walkStep({ x: 0.35, z: -1.2 }, 0, 3, room, obstacles);
  assert(next.z < -0.6);
  assert(canStand(next.x, next.z, room, obstacles));
});
check("کنار جزیره می‌توان حرکت کرد", () => {
  const next = walkStep({ x: 1.85, z: 1.75 }, 0, -2.5, room, obstacles);
  assert(next.z < -0.7);
});
check("راهرو پشت جزیره قابل عبور است", () =>
  assert(canStand(0, -1.2, room, obstacles)),
);
check("قدم کوچک با برخورد، روی دیوار می‌لغزد", () => {
  const next = walkStep({ x: 2.4, z: 0 }, 1, 0.5, room, obstacles);
  assert(next.x <= 2.48);
  assert(next.z > 0.4);
});
check("صفحه معرفی و دکمه ورود رندر می‌شوند", () => {
  const html = renderToStaticMarkup(<CustomerApp />);
  assert(html.includes("ورود به آشپزخانه"));
  assert(html.includes("DECOTECK"));
  assert(html.includes("collection-grid"));
  assert(!html.includes('type="number"'));
  assert(!html.includes("افزودن یونیت"));
});
check("پنل مشتری ابزار اندازه و چیدمان ندارد", () => {
  const html = renderToStaticMarkup(<CustomerPanel onClose={() => {}} />);
  assert(html.includes("سبک درب"));
  for (const forbidden of [
    "ابعاد فضای شما",
    "عرض یونیت",
    "سانتی‌متر",
    "افزودن یونیت",
  ])
    assert(!html.includes(forbidden));
});

const renderer = await Renderer.create(
  <>
    <Kitchen />
    <ShowroomFurniture />
  </>,
);
const first = state().units[0];
const event = (delta = 0) => ({ delta, stopPropagation() {} });
await Renderer.act(async () => {
  await renderer.fireEvent(
    renderer.scene.findByProps({ name: `${first.id}:drawer-0:front:hit` }),
    "click",
    event(),
  );
});
check("کلیک کشوی اول فقط همان کشو را باز می‌کند", () => {
  assert.equal(state().units[0].parts["drawer-0"], true);
  assert(!state().units[0].parts["drawer-1"]);
  assert(!state().units[1].open);
});
await Renderer.act(async () => {
  await renderer.advanceFrames(90, 1 / 60);
});
check("کشو جلو می‌آید و در صفحه بسته گم نمی‌شود", () => {
  const drawer = renderer.scene.findByProps({
    name: `${first.id}:drawer-0`,
  }).instance;
  const neighbor = renderer.scene.findByProps({
    name: `${first.id}:drawer-1`,
  }).instance;
  assert(drawer.position.z > 0.64);
  assert(Math.abs(neighbor.position.z - 0.291) < 0.001);
});
await Renderer.act(async () => {
  await renderer.fireEvent(
    renderer.scene.findByProps({ name: `${first.id}:drawer-0:front:hit` }),
    "click",
    event(15),
  );
});
check("کشیدن تصویر کشو را تغییر نمی‌دهد", () =>
  assert.equal(state().units[0].parts["drawer-0"], true),
);
await Renderer.act(async () => {
  await renderer.fireEvent(
    renderer.scene.findByProps({ name: `${first.id}:wall:hit` }),
    "click",
    event(),
  );
});
check("درب دیواری مستقل از کشو باز می‌شود", () => {
  assert(state().units[0].parts.wall);
  assert(state().units[0].parts["drawer-0"]);
});
await Renderer.act(async () => {
  await renderer.fireEvent(
    renderer.scene.findByProps({ name: "island:drawer-0:front:hit" }),
    "click",
    event(),
  );
});
check("کشوی جزیره مستقل باز می‌شود", () => {
  assert(state().ui.fixtureParts["island-0"]);
  assert(!state().ui.fixtureParts["island-1"]);
});
check("بازشدن درب محدوده برخورد را گسترش می‌دهد", () => {
  const open = showroomObstacles(room, state().units);
  assert(open[0].z1 > obstacles[0].z1);
});
await Renderer.act(async () => {
  state().openAll(false);
  state().setUI({ fixtureParts: {} });
});
check("بستن درب‌ها همه بازشوهای مشتری را می‌بندد", () => {
  assert(
    state().units.every((u) => !u.open && Object.keys(u.parts).length === 0),
  );
  assert.equal(Object.keys(state().ui.fixtureParts).length, 0);
});
await Renderer.act(async () => {
  await renderer.advanceFrames(90, 1 / 60);
});
check("کشو به صفحه بسته صحیح برمی‌گردد", () =>
  assert(
    Math.abs(
      renderer.scene.findByProps({ name: `${first.id}:drawer-0` }).instance
        .position.z - 0.291,
    ) < 0.001,
  ),
);
check("تمام هندسه‌های جزیره و کابینت مختصات معتبر دارند", () => {
  renderer.scene.instance.traverse((o) => {
    const pos = o.geometry?.attributes?.position;
    if (pos) for (const value of pos.array) assert(Number.isFinite(value));
  });
});
await renderer.unmount();
console.log(`\n${count} بررسی تجربه مشتری موفق ✅`);
process.exit(0);
