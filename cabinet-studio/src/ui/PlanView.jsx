import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudio } from "../store/useStudio.js";
import { computeLayout, C } from "../lib/layout.js";
import { byId, UNIT_TYPES, DOOR_COLORS } from "../data/catalog.js";
import { fa } from "./widgets.jsx";
import * as I from "./icons.jsx";

const SHORT = {
  door: "درب",
  drawers: "کشو",
  "door-drawer": "درب+کشو",
  sink: "سینک",
  hob: "گاز",
  open: "قفسه",
  tall: "ایستاده",
  "tall-oven": "فر",
  dishwasher: "ظرفشویی",
  fridge: "یخچال",
};

export function PlanView() {
  const mode = useStudio((s) => s.mode);
  return mode === "kitchen" ? <KitchenPlan /> : <WardrobePlan />;
}

function KitchenPlan() {
  const units = useStudio((s) => s.units);
  const room = useStudio((s) => s.room);
  const selected = useStudio((s) => s.ui.selected);
  const select = useStudio((s) => s.select);
  const reorder = useStudio((s) => s.reorderUnits);
  const [dragId, setDragId] = useState(null);
  const rowRef = useRef(null);

  const { items, width } = useMemo(() => computeLayout(units), [units]);
  const total = width;
  const runPct = Math.min(100, (total / room.width) * 100);

  const onMove = (e) => {
    if (!dragId || !rowRef.current) return;
    const r = rowRef.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    let acc = 0;
    let target = units.length - 1;
    for (let i = 0; i < units.length; i++) {
      const frac = units[i].width / total;
      if (fx < acc + frac / 2) {
        target = i;
        break;
      }
      acc += frac;
    }
    const cur = units.findIndex((u) => u.id === dragId);
    if (cur >= 0 && target !== cur) reorder(cur, target);
  };

  return (
    <div className="plan glass">
      <header>
        <I.IconGrid size={15} />
        پلان چیدمان
        <span className="spacer" />
        <span className="muted" style={{ fontWeight: 500 }}>
          اتاق {fa(Math.round(room.width * 100))}×{fa(Math.round(room.depth * 100))} سانت
        </span>
      </header>

      <div style={{ padding: 12 }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: `${room.width} / ${Math.max(1.6, room.depth * 0.62)}`,
            borderRadius: 12,
            border: "1px solid var(--stroke)",
            background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.015))",
            overflow: "hidden",
          }}
        >
          {/* دیوار پشت */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,.14)" }} />

          {/* ردیف یونیت‌ها */}
          <div
            ref={rowRef}
            onPointerMove={onMove}
            onPointerUp={() => setDragId(null)}
            onPointerLeave={() => setDragId(null)}
            style={{
              position: "absolute",
              top: 8,
              left: `${(100 - runPct) / 2}%`,
              width: `${runPct}%`,
              height: "58%",
              display: "flex",
              gap: 2,
              touchAction: "none",
            }}
          >
            {units.map((u) => {
              const isSel = selected === u.id;
              const tall = ["tall", "tall-oven", "fridge"].includes(u.type);
              return (
                <motion.div
                  key={u.id}
                  layout
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  onPointerDown={() => {
                    setDragId(u.id);
                    select(u.id);
                  }}
                  style={{
                    flexGrow: u.width,
                    flexBasis: 0,
                    minWidth: 0,
                    height: tall ? "100%" : "62%",
                    alignSelf: "flex-end",
                    borderRadius: 6,
                    cursor: "grab",
                    background: isSel
                      ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 55%, transparent), color-mix(in srgb, var(--accent) 25%, transparent))"
                      : tall
                        ? "linear-gradient(180deg, rgba(255,180,90,.42), rgba(255,180,90,.16))"
                        : "linear-gradient(180deg, rgba(255,255,255,.24), rgba(255,255,255,.08))",
                    border: `1px solid ${isSel ? "var(--accent)" : "rgba(255,255,255,.18)"}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    lineHeight: 1.35,
                    color: isSel ? "#eaf7ff" : "rgba(255,255,255,.75)",
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{SHORT[u.type]}</span>
                  <span style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{fa(Math.round(u.width * 100))}</span>
                </motion.div>
              );
            })}
          </div>

          {/* خط صفحه کابینت */}
          <div
            style={{
              position: "absolute",
              top: "calc(8px + 58%)",
              left: `${(100 - runPct) / 2}%`,
              width: `${runPct}%`,
              height: 4,
              borderRadius: 3,
              background: "linear-gradient(90deg, #d9d2c6, #f3efe7)",
              opacity: 0.85,
            }}
          />

          {/* برچسب ابعاد */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: `${(100 - runPct) / 2}%`,
              width: `${runPct}%`,
              textAlign: "center",
              fontSize: 10,
              color: "var(--muted)",
              borderTop: "1px dashed rgba(255,255,255,.2)",
              paddingTop: 3,
            }}
          >
            طول ردیف: <b style={{ color: "var(--text)" }}>{fa(Math.round(total * 100))}</b> سانتی‌متر
          </div>
        </div>
      </div>

      <div className="foot">
        <I.IconGrip size={14} />
        برای جابه‌جایی، بلوک‌ها را بکشید — یا از پنل «چیدمان» استفاده کنید.
      </div>
    </div>
  );
}

function WardrobePlan() {
  const w = useStudio((s) => s.wardrobe);
  const doorHex = byId(DOOR_COLORS, w.doorColor).hex;
  const doorW = 100 / w.doors;
  return (
    <div className="plan glass">
      <header>
        <I.IconWardrobe size={15} />
        نمای کمد
        <span className="spacer" />
        <span className="muted" style={{ fontWeight: 500 }}>
          {fa(Math.round(w.width * 100))}×{fa(Math.round(w.height * 100))} سانت
        </span>
      </header>
      <div style={{ padding: 12 }}>
        <div
          style={{
            width: "100%",
            aspectRatio: `${w.width} / ${w.height}`,
            maxHeight: 200,
            margin: "0 auto",
            borderRadius: 10,
            border: "1px solid var(--stroke)",
            display: "flex",
            gap: 2,
            padding: 4,
            background: "rgba(255,255,255,.04)",
          }}
        >
          {Array.from({ length: w.doors }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 6,
                background: `linear-gradient(160deg, ${doorHex}, rgba(0,0,0,.25))`,
                border: "1px solid rgba(255,255,255,.2)",
                position: "relative",
                opacity: w.mirror && i === w.doors - 1 ? 0.75 : 1,
                backgroundImage:
                  w.mirror && i === w.doors - 1
                    ? "linear-gradient(160deg, #cfd8dd, #8fa0a8 60%, #e6eef1)"
                    : `linear-gradient(160deg, ${doorHex}, rgba(0,0,0,.28))`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "46%",
                  [i % 2 === 0 ? "right" : "left"]: 6,
                  width: 3,
                  height: "18%",
                  borderRadius: 3,
                  background: "rgba(255,255,255,.75)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="foot">
        <I.IconInfo size={14} />
        {w.sliding ? "درب ریلی" : "درب لولایی"} · {fa(w.shelves)} طبقه · {fa(w.rails)} ریل · {fa(w.drawers)} کشو
      </div>
    </div>
  );
}
