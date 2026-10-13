import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "framer-motion";
import { useStudio } from "../store/useStudio.js";
import { estimate, toman } from "../lib/layout.js";
import { fa } from "./widgets.jsx";
import * as I from "./icons.jsx";

export function PriceCard() {
  const units = useStudio((s) => s.units);
  const kitchen = useStudio((s) => s.kitchen);
  const room = useStudio((s) => s.room);
  const wardrobe = useStudio((s) => s.wardrobe);
  const mode = useStudio((s) => s.mode);
  const toast = useStudio((s) => s.toast);
  const [open, setOpen] = useState(false);

  const est = useMemo(() => estimate({ units, kitchen, room, wardrobe, mode }), [units, kitchen, room, wardrobe, mode]);
  const [shown, setShown] = useState(est.total);

  useEffect(() => {
    const controls = animate(shown, est.total, {
      duration: 0.55,
      ease: [0.2, 0.8, 0.3, 1],
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [est.total]);

  const copy = async () => {
    const text = [
      `برآورد ${mode === "kitchen" ? "آشپزخانه" : "کمد دیواری"} — کابینه استودیو`,
      ...est.lines.map((l) => `${l.label}: ${toman(l.value)} تومان`),
      `جمع کل: ${toman(est.total)} تومان`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast("برآورد در کلیپ‌بورد کپی شد");
    } catch {
      toast("کپی ممکن نشد", "warn");
    }
  };

  const save = () => {
    const data = { mode, units, kitchen, room, wardrobe, estimate: est, savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cabinet-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("فایل طرح ذخیره شد");
  };

  return (
    <motion.div
      className={`price glass ${open ? "open" : ""}`}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "right" }}>
        <I.IconMoney size={16} />
        <span className="muted" style={{ fontSize: 11.5 }}>
          برآورد تقریبی
        </span>
        <span className="spacer" />
        <I.IconChevron size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: ".25s" }} />
      </button>
      <div className="val">{toman(shown)} تومان</div>
      <div className="lines scroll">
        {est.lines.map((l, i) => (
          <div className="line" key={i}>
            <span>{l.label}</span>
            <b>{fa(Math.round(l.value / 1000))} هـ.ت</b>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn sm" onClick={copy}>
            <I.IconCopy size={13} /> کپی
          </button>
          <button className="btn sm" onClick={save}>
            <I.IconDownload size={13} /> ذخیره طرح
          </button>
        </div>
      </div>
    </motion.div>
  );
}
