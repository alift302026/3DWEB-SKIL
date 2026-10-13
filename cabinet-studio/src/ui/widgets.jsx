import { motion } from "framer-motion";
import { faNum } from "../lib/layout.js";

export const fa = faNum;

export function Card({ title, hint, icon, children, className = "" }) {
  return (
    <motion.section
      className={`card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.3, 1] }}
    >
      {title && (
        <h4>
          {icon}
          {title}
          {hint && <span className="hint">{hint}</span>}
        </h4>
      )}
      {children}
    </motion.section>
  );
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange, digits = 0, commit }) {
  const p = ((value - min) / (max - min)) * 100;
  const shown = digits ? Number(value).toFixed(digits).replace(".", "/") : Math.round(value);
  return (
    <div className="slider">
      <div className="head">
        <span>{label}</span>
        <b>
          {fa(shown)} {unit}
        </b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--p": `${p}%` }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerDown={commit}
        onKeyDown={(e) => e.key === "ArrowLeft" || e.key === "ArrowRight" ? commit?.() : null}
      />
    </div>
  );
}

export function Swatches({ options, value, onChange, title }) {
  return (
    <div>
      {title && <div className="muted" style={{ marginBottom: 8 }}>{title}</div>}
      <div className="swatches">
        {options.map((o) => (
          <motion.button
            key={o.id}
            className={`swatch ${value === o.id ? "active" : ""}`}
            style={{ background: o.hex }}
            title={o.name}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(o.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function Options({ options, value, onChange, cols = 2, preview }) {
  return (
    <div className="opts" style={cols !== 2 ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}>
      {options.map((o) => (
        <motion.button
          key={o.id}
          className={`opt ${value === o.id ? "active" : ""}`}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(o.id)}
        >
          {o.tag && <span className="tag">{o.tag}</span>}
          {preview && <div className="preview" style={preview(o)} />}
          <b>{o.name}</b>
          {o.desc && <small>{o.desc}</small>}
        </motion.button>
      ))}
    </div>
  );
}

export function Toggle({ label, checked, onChange, icon }) {
  return (
    <button className={`switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        {label}
      </span>
      <span className="track">
        <span className="knob" />
      </span>
    </button>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.id} className={value === o.id ? "active" : ""} onClick={() => onChange(o.id)}>
          {o.icon}
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function Btn({ children, onClick, variant = "", disabled, className = "", title }) {
  return (
    <motion.button
      className={`btn ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

export function IconBtn({ children, onClick, disabled, title, active }) {
  return (
    <motion.button
      className={`icon-btn ${active ? "on" : ""}`}
      style={active ? { color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.92 }}
    >
      {children}
    </motion.button>
  );
}

export function Empty({ children }) {
  return (
    <div className="muted" style={{ textAlign: "center", padding: "14px 6px", fontSize: 12 }}>
      {children}
    </div>
  );
}
