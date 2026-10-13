import { AnimatePresence, motion } from "framer-motion";
import { useStudio } from "../store/useStudio.js";
import { Card, Slider, Swatches, Options, Toggle, Btn, IconBtn, Empty, fa } from "./widgets.jsx";
import * as I from "./icons.jsx";
import {
  DOOR_STYLES, DOOR_COLORS, BODY_COLORS, COUNTERTOPS, HANDLES, HANDLE_FINISHES,
  APPLIANCE_FINISHES, FLOORS, WALL_COLORS, LED_PRESETS, PRESETS, UNIT_TYPES, byId,
} from "../data/catalog.js";
import { C } from "../lib/layout.js";

const TABS = {
  kitchen: [
    { id: "style", name: "سبک و رنگ", icon: <I.IconPalette size={17} /> },
    { id: "surface", name: "صفحه و یراق", icon: <I.IconHandle size={17} /> },
    { id: "units", name: "چیدمان", icon: <I.IconLayers size={17} /> },
    { id: "light", name: "نورپردازی", icon: <I.IconLamp size={17} /> },
    { id: "room", name: "فضا", icon: <I.IconRoom size={17} /> },
  ],
  wardrobe: [
    { id: "wstyle", name: "سبک و رنگ", icon: <I.IconPalette size={17} /> },
    { id: "wsize", name: "ابعاد و داخل", icon: <I.IconLayers size={17} /> },
    { id: "light", name: "نورپردازی", icon: <I.IconLamp size={17} /> },
    { id: "room", name: "فضا", icon: <I.IconRoom size={17} /> },
  ],
};

export function Sidebar() {
  const mode = useStudio((s) => s.mode);
  const tab = useStudio((s) => s.ui.tab);
  const setUI = useStudio((s) => s.setUI);
  const tabs = TABS[mode] || TABS.kitchen;
  const active = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  return (
    <div className="sidebar glass">
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={active === t.id ? "active" : ""} onClick={() => setUI({ tab: t.id })}>
            {t.icon}
            {t.name}
          </button>
        ))}
      </div>
      <div className="panel-body scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {active === "style" && <StyleTab />}
            {active === "surface" && <SurfaceTab />}
            {active === "units" && <UnitsTab />}
            {active === "light" && <LightTab />}
            {active === "room" && <RoomTab />}
            {active === "wstyle" && <WardrobeStyleTab />}
            {active === "wsize" && <WardrobeSizeTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================= سبک و رنگ آشپزخانه ================= */

export function StyleTab() {
  const k = useStudio((s) => s.kitchen);
  const setKitchen = useStudio((s) => s.setKitchen);
  const applyPreset = useStudio((s) => s.applyPreset);
  const randomize = useStudio((s) => s.randomize);
  const commit = useStudio((s) => s.commit);
  const doorHex = byId(DOOR_COLORS, k.doorColor).hex;

  return (
    <>
      <Card title="نماهای آماده" hint="یک کلیک، کل فضا" icon={<I.IconSparkle size={15} />}>
        <Options
          options={PRESETS}
          value={k.preset}
          onChange={applyPreset}
          preview={(o) => {
            const c = byId(DOOR_COLORS, o.doorColor).hex;
            const ct = byId(COUNTERTOPS, o.counter).hex;
            return { background: `linear-gradient(135deg, ${c} 0 55%, ${ct} 55% 100%)` };
          }}
        />
        <Btn className="wide" style={{ marginTop: 10 }} onClick={randomize} variant="ghost">
          <I.IconRotate size={15} /> پیشنهاد تصادفی
        </Btn>
      </Card>

      <Card title="سبک درب" hint={byId(DOOR_STYLES, k.doorStyle).name} icon={<I.IconDoor size={15} />}>
        <Options
          options={DOOR_STYLES}
          value={k.doorStyle}
          onChange={(id) => { commit(); setKitchen({ doorStyle: id }); }}
          preview={(o) => ({
            background: doorHex,
            boxShadow: o.clearcoat > 0.5 ? "inset 0 -12px 22px rgba(255,255,255,.45)" : "inset 0 -8px 16px rgba(0,0,0,.15)",
            border: o.frame && o.frame !== "none" ? `5px solid ${doorHex}` : "1px solid rgba(255,255,255,.14)",
            outline: o.frame && o.frame !== "none" ? `1px solid rgba(0,0,0,.25)` : "none",
            backgroundClip: "padding-box",
          })}
        />
      </Card>

      <Card title="رنگ درب" hint={byId(DOOR_COLORS, k.doorColor).name} icon={<I.IconPalette size={15} />}>
        <Swatches options={DOOR_COLORS} value={k.doorColor} onChange={(id) => setKitchen({ doorColor: id })} />
      </Card>

      <Card title="رنگ بدنه (داخل کابینت)" icon={<I.IconLayers size={15} />}>
        <Swatches options={BODY_COLORS} value={k.bodyColor} onChange={(id) => setKitchen({ bodyColor: id })} />
      </Card>
    </>
  );
}

/* ================= صفحه، یراق، لوازم ================= */

export function SurfaceTab() {
  const k = useStudio((s) => s.kitchen);
  const setKitchen = useStudio((s) => s.setKitchen);
  const room = useStudio((s) => s.room);
  const setRoom = useStudio((s) => s.setRoom);
  const commit = useStudio((s) => s.commit);

  return (
    <>
      <Card title="صفحه کابینت" hint={byId(COUNTERTOPS, k.counter).name} icon={<I.IconLayers size={15} />}>
        <Options
          options={COUNTERTOPS}
          value={k.counter}
          onChange={(id) => { commit(); setKitchen({ counter: id }); }}
          preview={(o) => ({ background: `linear-gradient(135deg, ${o.hex}, ${o.vein} 70%, ${o.hex})` })}
        />
        <Slider label="ضخامت صفحه" value={k.counterH} min={2} max={8} unit="سانتی‌متر" onChange={(v) => setKitchen({ counterH: v })} commit={commit} />
        <Toggle label="بک‌اسپلش هم‌رنگ صفحه" checked={room.backsplash} onChange={(v) => setRoom({ backsplash: v })} />
        {room.backsplash && (
          <Slider label="ارتفاع بک‌اسپلش" value={room.backsplashH} min={0.2} max={1.45} step={0.05} digits={2} unit="متر" onChange={(v) => setRoom({ backsplashH: v })} commit={commit} />
        )}
      </Card>

      <Card title="دستگیره" hint={byId(HANDLES, k.handle).name} icon={<I.IconHandle size={15} />}>
        <Options options={HANDLES} value={k.handle} onChange={(id) => setKitchen({ handle: id })} />
        <div style={{ height: 10 }} />
        <Swatches
          title="رنگ یراق‌آلات"
          options={HANDLE_FINISHES}
          value={k.handleFinish}
          onChange={(id) => setKitchen({ handleFinish: id })}
        />
      </Card>

      <Card title="رنگ لوازم خانگی" hint="سینک، گاز، هود، یخچال" icon={<I.IconSink size={15} />}>
        <Options
          options={APPLIANCE_FINISHES}
          value={k.applianceFinish}
          onChange={(id) => setKitchen({ applianceFinish: id })}
          preview={(o) => ({ background: o.hex || byId(DOOR_COLORS, k.doorColor).hex, boxShadow: "inset 0 -8px 18px rgba(255,255,255,.28)" })}
        />
      </Card>
    </>
  );
}

/* ================= چیدمان یونیت‌ها ================= */

export function UnitsTab() {
  const units = useStudio((s) => s.units);
  const selected = useStudio((s) => s.ui.selected);
  const st = useStudio();
  const sel = units.find((u) => u.id === selected);
  const meta = sel ? byId(UNIT_TYPES, sel.type) : null;
  const total = units.reduce((s, u) => s + u.width, 0);

  return (
    <>
      <Card title="افزودن یونیت" hint={`${fa(units.length)} یونیت · ${fa(Math.round(total * 100))} سانتی‌متر`} icon={<I.IconPlus size={15} />}>
        <div className="opts" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {UNIT_TYPES.map((t) => (
            <motion.button key={t.id} className="opt" whileTap={{ scale: 0.95 }} onClick={() => st.addUnit(t.id)}>
              <b style={{ fontSize: 11 }}>{t.name}</b>
              <small>{fa(t.defW)} سانت</small>
            </motion.button>
          ))}
        </div>
      </Card>

      <Card title="ترتیب یونیت‌ها" hint="بکشید و جابه‌جا کنید" icon={<I.IconGrip size={15} />}>
        <div className="unit-list">
          {units.map((u, i) => {
            const m = byId(UNIT_TYPES, u.type);
            return (
              <div
                key={u.id}
                className={`unit-row ${selected === u.id ? "sel" : ""}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                  if (!Number.isNaN(from) && from !== i) st.reorderUnits(from, i);
                }}
                onClick={() => st.select(u.id)}
              >
                <span className="grip">
                  <I.IconGrip size={15} />
                </span>
                <span>{m.name}</span>
                <span className="w">{fa(Math.round(u.width * 100))} سانت</span>
                <IconBtn title="انتقال به راست" onClick={() => st.moveUnit(u.id, 1)} disabled={i === units.length - 1}>
                  <I.IconArrowLeft size={14} />
                </IconBtn>
                <IconBtn title="انتقال به چپ" onClick={() => st.moveUnit(u.id, -1)} disabled={i === 0}>
                  <I.IconArrowRight size={14} />
                </IconBtn>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <Btn className="sm" onClick={() => st.openAll(true)}>
            <I.IconEye size={14} /> باز کردن همه
          </Btn>
          <Btn className="sm" onClick={() => st.openAll(false)}>
            <I.IconX size={14} /> بستن همه
          </Btn>
        </div>
      </Card>

      {sel ? (
        <Card title={`ویرایش: ${meta.name}`} icon={<I.IconRuler size={15} />}>
          <div className="muted" style={{ marginBottom: 8 }}>
            برای انتخاب، روی یونیت در صحنه سه‌بعدی هم می‌توانید کلیک کنید.
          </div>
          <label className="muted">نوع یونیت</label>
          <select
            value={sel.type}
            onChange={(e) => st.changeUnitType(sel.id, e.target.value)}
            style={{
              width: "100%", margin: "6px 0 10px", padding: "9px 10px", borderRadius: 11,
              background: "rgba(255,255,255,.06)", border: "1px solid var(--stroke)", fontSize: 12.5,
            }}
          >
            {UNIT_TYPES.map((t) => (
              <option key={t.id} value={t.id} style={{ background: "#12161c" }}>
                {t.name}
              </option>
            ))}
          </select>
          <Slider
            label="عرض یونیت"
            value={Math.round(sel.width * 100)}
            min={meta.minW}
            max={meta.maxW}
            unit="سانتی‌متر"
            onChange={(v) => st.setUnitWidth(sel.id, v)}
            commit={st.commit}
          />
          {(sel.type === "drawers" || sel.type === "door-drawer") && (
            <Slider
              label="تعداد کشو"
              value={sel.drawers || 1}
              min={1}
              max={4}
              onChange={(v) => st.updateUnit(sel.id, { drawers: Math.round(v) })}
              commit={st.commit}
            />
          )}
          {(sel.type === "door" || sel.type === "sink") && (
            <Toggle label="دو لت (درب دوقلو)" checked={!!sel.double} onChange={(v) => st.updateUnit(sel.id, { double: v })} />
          )}
          <Toggle label="نور داخلی این یونیت" checked={!!sel.interiorLed} onChange={(v) => st.updateUnit(sel.id, { interiorLed: v })} />
          <Toggle label="باز بودن درب‌ها" checked={!!sel.open} onChange={() => st.toggleOpen(sel.id)} />
          <div className="row" style={{ marginTop: 10 }}>
            <Btn className="sm" onClick={() => st.duplicateUnit(sel.id)}>
              <I.IconCopy size={14} /> تکثیر
            </Btn>
            <Btn className="sm danger" onClick={() => st.removeUnit(sel.id)}>
              <I.IconTrash size={14} /> حذف
            </Btn>
          </div>
        </Card>
      ) : (
        <Card title="یونیتی انتخاب نشده" icon={<I.IconInfo size={15} />}>
          <Empty>روی یکی از یونیت‌ها در صحنه کلیک کنید یا دابل‌کلیک کنید تا درب‌هایش باز شود.</Empty>
        </Card>
      )}
    </>
  );
}

/* ================= نورپردازی ================= */

export function LightTab() {
  const l = useStudio((s) => s.lighting);
  const set = useStudio((s) => s.setLighting);
  const commit = useStudio((s) => s.commit);
  return (
    <>
      <Card title="نور مخفی LED" hint={l.led ? "روشن" : "خاموش"} icon={<I.IconLamp size={15} />}>
        <Toggle label="نورپردازی LED" checked={l.led} onChange={(v) => set({ led: v })} />
        <AnimatePresence>
          {l.led && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Swatches title="دمای نور" options={LED_PRESETS} value={LED_PRESETS.find((p) => p.hex === l.ledColor)?.id} onChange={(id) => set({ ledColor: byId(LED_PRESETS, id).hex })} />
              <div className="row" style={{ margin: "10px 0" }}>
                <span className="muted">رنگ دلخواه</span>
                <input
                  type="color"
                  value={l.ledColor}
                  onChange={(e) => set({ ledColor: e.target.value })}
                  style={{ width: 42, height: 28, border: "none", background: "none", cursor: "pointer" }}
                />
              </div>
              <Slider label="شدت نور" value={l.ledIntensity} min={0} max={3} step={0.05} digits={2} onChange={(v) => set({ ledIntensity: v })} commit={commit} />
              <Toggle label="نور داخل یونیت‌ها" checked={l.interior} onChange={(v) => set({ interior: v })} />
              <Toggle label="نور مخفی زیر کابینت" checked={l.underGlow} onChange={(v) => set({ underGlow: v })} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card title="نور محیط" icon={<I.IconSun size={15} />}>
        <Toggle label="حالت شب (نمایش بهتر LED)" checked={l.night} onChange={(v) => set({ night: v })} icon={<I.IconMoon size={15} />} />
        <Slider label="نور طبیعی پنجره" value={l.sun} min={0} max={2} step={0.05} digits={2} onChange={(v) => set({ sun: v })} commit={commit} />
        <Toggle label="شعله گاز روشن" checked={l.hobFlame} onChange={(v) => set({ hobFlame: v })} icon={<I.IconFlame size={15} />} />
      </Card>
    </>
  );
}

/* ================= فضا / اتاق ================= */

export function RoomTab() {
  const room = useStudio((s) => s.room);
  const setRoom = useStudio((s) => s.setRoom);
  const k = useStudio((s) => s.kitchen);
  const setKitchen = useStudio((s) => s.setKitchen);
  const commit = useStudio((s) => s.commit);
  return (
    <>
      <Card title="ابعاد فضای شما" hint="بر حسب سانتی‌متر" icon={<I.IconRuler size={15} />}>
        <Slider label="عرض اتاق" value={room.width * 100} min={260} max={700} step={5} unit="سانتی‌متر" onChange={(v) => setRoom({ width: v / 100 })} commit={commit} />
        <Slider label="عمق اتاق" value={room.depth * 100} min={240} max={600} step={5} unit="سانتی‌متر" onChange={(v) => setRoom({ depth: v / 100 })} commit={commit} />
        <Slider label="ارتفاع سقف" value={room.height * 100} min={240} max={360} step={5} unit="سانتی‌متر" onChange={(v) => setRoom({ height: v / 100 })} commit={commit} />
      </Card>

      <Card title="یونیت‌های دیواری" icon={<I.IconLayers size={15} />}>
        <Toggle label="نمایش یونیت دیواری" checked={k.wallCabinets} onChange={(v) => setKitchen({ wallCabinets: v })} />
        <Slider label="ارتفاع یونیت دیواری" value={k.wallH} min={40} max={100} unit="سانتی‌متر" onChange={(v) => setKitchen({ wallH: v })} commit={commit} />
        <Slider label="فاصله تا صفحه" value={k.wallGap} min={45} max={75} unit="سانتی‌متر" onChange={(v) => setKitchen({ wallGap: v })} commit={commit} />
      </Card>

      <Card title="کف و دیوار" icon={<I.IconPalette size={15} />}>
        <Options
          options={FLOORS}
          value={room.floor}
          onChange={(id) => setRoom({ floor: id })}
          preview={(o) => ({ background: o.hex })}
        />
        <div style={{ height: 12 }} />
        <Swatches title="رنگ دیوار" options={WALL_COLORS} value={room.wall} onChange={(id) => setRoom({ wall: id })} />
      </Card>

      <Card title="جزئیات فضا" icon={<I.IconRoom size={15} />}>
        <Toggle label="پنجره و نور طبیعی" checked={room.window} onChange={(v) => setRoom({ window: v })} />
        <Toggle label="سقف و هالوژن" checked={room.ceiling} onChange={(v) => setRoom({ ceiling: v })} />
      </Card>
    </>
  );
}

/* ================= کمد دیواری ================= */

export function WardrobeStyleTab() {
  const w = useStudio((s) => s.wardrobe);
  const set = useStudio((s) => s.setWardrobe);
  const commit = useStudio((s) => s.commit);
  const syncFromKitchen = useStudio((s) => s.applyStyleToWardrobe);
  const doorHex = byId(DOOR_COLORS, w.doorColor).hex;
  return (
    <>
      <Card title="سبک درب کمد" hint={byId(DOOR_STYLES, w.doorStyle).name} icon={<I.IconWardrobe size={15} />}>
        <Options
          options={DOOR_STYLES.filter((s) => s.id !== "glass")}
          value={w.doorStyle}
          onChange={(id) => { commit(); set({ doorStyle: id }); }}
          preview={(o) => ({
            background: doorHex,
            border: o.frame && o.frame !== "none" ? `5px solid ${doorHex}` : "1px solid rgba(255,255,255,.14)",
            boxShadow: o.clearcoat > 0.5 ? "inset 0 -12px 22px rgba(255,255,255,.45)" : "inset 0 -8px 16px rgba(0,0,0,.15)",
          })}
        />
        <Btn className="wide" style={{ marginTop: 10 }} onClick={syncFromKitchen} variant="ghost">
          <I.IconSparkle size={15} /> هم‌رنگ آشپزخانه کن
        </Btn>
      </Card>
      <Card title="رنگ درب" icon={<I.IconPalette size={15} />}>
        <Swatches options={DOOR_COLORS} value={w.doorColor} onChange={(id) => set({ doorColor: id })} />
      </Card>
      <Card title="رنگ بدنه داخلی" icon={<I.IconLayers size={15} />}>
        <Swatches options={BODY_COLORS} value={w.bodyColor} onChange={(id) => set({ bodyColor: id })} />
      </Card>
      <Card title="دستگیره" icon={<I.IconHandle size={15} />}>
        <Options options={HANDLES} value={w.handle} onChange={(id) => set({ handle: id })} />
        <div style={{ height: 10 }} />
        <Swatches options={HANDLE_FINISHES} value={w.handleFinish} onChange={(id) => set({ handleFinish: id })} />
      </Card>
    </>
  );
}

export function WardrobeSizeTab() {
  const w = useStudio((s) => s.wardrobe);
  const set = useStudio((s) => s.setWardrobe);
  const commit = useStudio((s) => s.commit);
  return (
    <>
      <Card title="ابعاد کمد" icon={<I.IconRuler size={15} />}>
        <Slider label="عرض" value={w.width * 100} min={120} max={420} step={5} unit="سانتی‌متر" onChange={(v) => set({ width: v / 100 })} commit={commit} />
        <Slider label="ارتفاع" value={w.height * 100} min={200} max={300} step={5} unit="سانتی‌متر" onChange={(v) => set({ height: v / 100 })} commit={commit} />
        <Slider label="عمق" value={w.depth * 100} min={45} max={80} unit="سانتی‌متر" onChange={(v) => set({ depth: v / 100 })} commit={commit} />
      </Card>
      <Card title="درب‌ها" icon={<I.IconDoor size={15} />}>
        <Slider label="تعداد لت" value={w.doors} min={2} max={5} onChange={(v) => set({ doors: Math.round(v) })} commit={commit} />
        <Toggle label="درب ریلی (اسلایدینگ)" checked={w.sliding} onChange={(v) => set({ sliding: v })} />
        <Toggle label="آینه تمام‌قد روی لت آخر" checked={w.mirror} onChange={(v) => set({ mirror: v })} />
      </Card>
      <Card title="چیدمان داخلی" icon={<I.IconLayers size={15} />}>
        <Slider label="تعداد طبقه" value={w.shelves} min={0} max={7} onChange={(v) => set({ shelves: Math.round(v) })} commit={commit} />
        <Slider label="تعداد ریل لباس" value={w.rails} min={0} max={2} onChange={(v) => set({ rails: Math.round(v) })} commit={commit} />
        <Slider label="تعداد کشو" value={w.drawers} min={0} max={4} onChange={(v) => set({ drawers: Math.round(v) })} commit={commit} />
        <Toggle label="نور داخلی کمد" checked={w.interiorLight} onChange={(v) => set({ interiorLight: v })} />
        <div className="muted" style={{ marginTop: 8 }}>روی درب‌ها کلیک کنید تا باز و بسته شوند.</div>
      </Card>
    </>
  );
}
