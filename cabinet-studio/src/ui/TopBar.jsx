import { motion } from "framer-motion";
import { useStudio } from "../store/useStudio.js";
import { Btn } from "./widgets.jsx";
import * as I from "./icons.jsx";

export function TopBar({ onShot }) {
  const mode = useStudio((s) => s.mode);
  const setMode = useStudio((s) => s.setMode);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const past = useStudio((s) => s.past.length);
  const future = useStudio((s) => s.future.length);
  const lighting = useStudio((s) => s.lighting);
  const setLighting = useStudio((s) => s.setLighting);
  const ui = useStudio((s) => s.ui);
  const setUI = useStudio((s) => s.setUI);
  const reset = useStudio((s) => s.reset);

  return (
    <div className="topbar">
      <div className="brand">
        <span className="logo">
          <I.IconCube size={18} />
        </span>
        <div>
          <b>کابینه استودیو</b>
          <span>طراحی زنده سه‌بعدی آشپزخانه و کمد</span>
        </div>
      </div>

      <div className="seg">
        {[
          { id: "kitchen", name: "آشپزخانه", icon: <I.IconCube size={15} /> },
          { id: "wardrobe", name: "کمد دیواری", icon: <I.IconWardrobe size={15} /> },
        ].map((o) => (
          <button key={o.id} className={mode === o.id ? "active" : ""} onClick={() => setMode(o.id)}>
            {o.icon}
            {o.name}
          </button>
        ))}
      </div>

      <div className="toolbar glass">
        <button className="tbtn" data-tip="بازگشت (Ctrl+Z)" onClick={undo} disabled={!past}>
          <I.IconUndo size={18} />
        </button>
        <button className="tbtn" data-tip="جلو (Ctrl+Y)" onClick={redo} disabled={!future}>
          <I.IconRedo size={18} />
        </button>
        <span style={{ width: 1, height: 20, background: "var(--stroke)", margin: "0 4px" }} />
        <button
          className={`tbtn ${lighting.night ? "on" : ""}`}
          data-tip="حالت شب"
          onClick={() => setLighting({ night: !lighting.night })}
        >
          {lighting.night ? <I.IconMoon size={18} /> : <I.IconSun size={18} />}
        </button>
        <button className={`tbtn ${ui.showDims ? "on" : ""}`} data-tip="نمایش اندازه‌ها" onClick={() => setUI({ showDims: !ui.showDims })}>
          <I.IconRuler size={18} />
        </button>
        <button className={`tbtn ${ui.autoRotate ? "on" : ""}`} data-tip="چرخش خودکار" onClick={() => setUI({ autoRotate: !ui.autoRotate })}>
          <I.IconRotate size={18} />
        </button>
        <button className={`tbtn ${ui.effects !== false ? "on" : ""}`} data-tip="جلوه‌های تصویری" onClick={() => setUI({ effects: ui.effects === false })}>
          <I.IconSparkle size={18} />
        </button>
        <span style={{ width: 1, height: 20, background: "var(--stroke)", margin: "0 4px" }} />
        <button className="tbtn" data-tip="عکس از صحنه" onClick={onShot}>
          <I.IconCamera size={18} />
        </button>
        <button className="tbtn" data-tip="بازنشانی طرح" onClick={reset}>
          <I.IconReset size={18} />
        </button>
      </div>
    </div>
  );
}

export function ViewsBar() {
  const view = useStudio((s) => s.ui.view);
  const setView = useStudio((s) => s.setView);
  const mode = useStudio((s) => s.mode);
  const views = [
    { id: "overview", name: "کلی" },
    { id: "front", name: "روبرو" },
    { id: "corner", name: "زاویه" },
    { id: "eye", name: "دید انسانی" },
    { id: "detail", name: "جزئیات" },
    { id: "top", name: "پلان" },
  ];
  return (
    <div className="views glass">
      {views.map((v) => (
        <button key={v.id} className={view === v.id ? "active" : ""} onClick={() => setView(v.id)}>
          {v.name}
        </button>
      ))}
    </div>
  );
}

export function Toaster() {
  const toasts = useStudio((s) => s.ui.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          className={`toast ${t.kind}`}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          {t.msg}
        </motion.div>
      ))}
    </div>
  );
}
