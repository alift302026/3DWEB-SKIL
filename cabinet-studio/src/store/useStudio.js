import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeUnit, uid } from "../lib/layout.js";
import { PRESETS, CAMERA_VIEWS, byId, DOOR_STYLES, UNIT_TYPES } from "../data/catalog.js";

const initialUnits = () => [
  makeUnit("drawers", 60),
  makeUnit("hob", 75),
  makeUnit("door", 60),
  makeUnit("sink", 90),
  makeUnit("door-drawer", 60),
  makeUnit("tall-oven", 60),
];

const snap = (s) => ({
  units: s.units.map((u) => ({ ...u })),
  kitchen: { ...s.kitchen },
  wardrobe: { ...s.wardrobe },
  lighting: { ...s.lighting },
  room: { ...s.room },
});

export const useStudio = create(
  persist(
    (set, get) => ({
      mode: "kitchen",
      room: {
        width: 4.6,
        depth: 3.8,
        height: 2.8,
        floor: "oak",
        wall: "linen",
        window: true,
        ceiling: true,
        backsplash: true,
        backsplashH: 0.55,
      },
      kitchen: {
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
      },
      units: initialUnits(),
      wardrobe: {
        width: 2.6,
        height: 2.45,
        depth: 0.62,
        doors: 3,
        sliding: true,
        doorStyle: "shaker",
        doorColor: "greige",
        bodyColor: "oak",
        shelves: 4,
        rails: 1,
        drawers: 2,
        mirror: true,
        interiorLight: true,
        handle: "bar",
        handleFinish: "gold",
      },
      lighting: {
        led: true,
        ledColor: "#ffca87",
        ledIntensity: 1.15,
        interior: true,
        night: false,
        sun: 1,
        hobFlame: false,
        underGlow: true,
      },
      ui: {
        selected: null,
        tab: "style",
        view: "overview",
        viewNonce: 0,
        autoRotate: false,
        showDims: false,
        planOpen: true,
        effects: true,
        customView: null,
        toasts: [],
        ready: false,
      },
      past: [],
      future: [],

      /* ---------- عمومی ---------- */
      setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
      setKitchen: (patch) => set((s) => ({ kitchen: { ...s.kitchen, ...patch } })),
      setWardrobe: (patch) => set((s) => ({ wardrobe: { ...s.wardrobe, ...patch } })),
      setLighting: (patch) => set((s) => ({ lighting: { ...s.lighting, ...patch } })),
      setUI: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),
      setMode: (mode) =>
        set((s) => ({ mode, ui: { ...s.ui, selected: null, viewNonce: s.ui.viewNonce + 1, view: mode === "wardrobe" ? "front" : "overview" } })),

      toast: (msg, kind = "ok") => {
        const id = uid("t");
        set((s) => ({ ui: { ...s.ui, toasts: [...s.ui.toasts, { id, msg, kind }] } }));
        setTimeout(() => {
          set((s) => ({ ui: { ...s.ui, toasts: s.ui.toasts.filter((t) => t.id !== id) } }));
        }, 2600);
      },

      /* ---------- تاریخچه ---------- */
      commit: () => set((s) => ({ past: [...s.past.slice(-25), snap(s)], future: [] })),
      undo: () => {
        const { past, future } = get();
        if (!past.length) return get().toast("چیزی برای بازگشت نیست", "warn");
        const prev = past[past.length - 1];
        set((s) => ({
          ...prev,
          past: past.slice(0, -1),
          future: [snap(s), ...future].slice(0, 25),
          ui: { ...s.ui, selected: null },
        }));
      },
      redo: () => {
        const { past, future } = get();
        if (!future.length) return;
        const next = future[0];
        set((s) => ({ ...next, past: [...s.past, snap(s)], future: future.slice(1) }));
      },

      /* ---------- یونیت‌ها ---------- */
      select: (id) => set((s) => ({ ui: { ...s.ui, selected: id } })),
      updateUnit: (id, patch) =>
        set((s) => ({ units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      setUnitWidth: (id, cmWidth) =>
        set((s) => ({
          units: s.units.map((u) => {
            if (u.id !== id) return u;
            const meta = byId(UNIT_TYPES, u.type);
            const w = Math.min(meta.maxW, Math.max(meta.minW, cmWidth)) / 100;
            return { ...u, width: w, double: w >= 0.8 && (u.type === "door" || u.type === "sink") };
          }),
        })),
      addUnit: (type, at) => {
        get().commit();
        const u = makeUnit(type);
        set((s) => {
          const units = [...s.units];
          const i = at == null ? units.length : Math.max(0, Math.min(units.length, at));
          units.splice(i, 0, u);
          return { units, ui: { ...s.ui, selected: u.id, tab: "units" } };
        });
      },
      changeUnitType: (id, type) => {
        get().commit();
        set((s) => ({
          units: s.units.map((u) => {
            if (u.id !== id) return u;
            const meta = byId(UNIT_TYPES, type);
            const w = Math.min(meta.maxW, Math.max(meta.minW, u.width * 100)) / 100;
            return {
              ...u,
              type,
              width: w,
              drawers: type === "drawers" ? 3 : type === "door-drawer" ? 1 : 0,
              double: w >= 0.8 && (type === "door" || type === "sink"),
              interiorLed: type === "open",
            };
          }),
        }));
      },
      removeUnit: (id) => {
        get().commit();
        set((s) => ({ units: s.units.filter((u) => u.id !== id), ui: { ...s.ui, selected: null } }));
      },
      duplicateUnit: (id) => {
        get().commit();
        set((s) => {
          const i = s.units.findIndex((u) => u.id === id);
          if (i < 0) return {};
          const copy = { ...s.units[i], id: uid(), open: false };
          const units = [...s.units];
          units.splice(i + 1, 0, copy);
          return { units, ui: { ...s.ui, selected: copy.id } };
        });
      },
      moveUnit: (id, dir) => {
        set((s) => {
          const i = s.units.findIndex((u) => u.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= s.units.length) return {};
          const units = [...s.units];
          [units[i], units[j]] = [units[j], units[i]];
          return { units };
        });
      },
      reorderUnits: (from, to) =>
        set((s) => {
          const units = [...s.units];
          const [u] = units.splice(from, 1);
          units.splice(to, 0, u);
          return { units };
        }),
      toggleOpen: (id) =>
        set((s) => ({ units: s.units.map((u) => (u.id === id ? { ...u, open: !u.open } : u)) })),
      openAll: (v) => set((s) => ({ units: s.units.map((u) => ({ ...u, open: v })) })),

      /* ---------- نماها و نماهای آماده ---------- */
      setView: (view) => set((s) => ({ ui: { ...s.ui, view, viewNonce: s.ui.viewNonce + 1 } })),
      flyTo: (pos, target) =>
        set((s) => ({ ui: { ...s.ui, view: "custom", viewNonce: s.ui.viewNonce + 1, customView: { pos, target } } })),
      applyPreset: (id) => {
        const p = byId(PRESETS, id);
        get().commit();
        set((s) => ({
          kitchen: { ...s.kitchen, doorStyle: p.doorStyle, doorColor: p.doorColor, bodyColor: p.bodyColor, counter: p.counter, handle: p.handle, handleFinish: p.handleFinish },
          room: { ...s.room, floor: p.floor, wall: p.wall },
          lighting: { ...s.lighting, ledColor: p.led },
        }));
        get().toast(`نمای «${p.name}» اعمال شد`);
      },
      applyStyleToWardrobe: () =>
        set((s) => ({
          wardrobe: {
            ...s.wardrobe,
            doorStyle: s.kitchen.doorStyle,
            doorColor: s.kitchen.doorColor,
            handle: s.kitchen.handle,
            handleFinish: s.kitchen.handleFinish,
          },
        })),
      randomize: () => {
        const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        get().applyPreset(p.id);
      },
      reset: () => {
        get().commit();
        set({
          units: initialUnits(),
          room: { width: 4.6, depth: 3.8, height: 2.8, floor: "oak", wall: "linen", window: true, ceiling: true, backsplash: true, backsplashH: 0.55 },
          kitchen: { doorStyle: "highgloss", doorColor: "pure-white", bodyColor: "white", counter: "calacatta", counterH: 4, handle: "none", handleFinish: "chrome", applianceFinish: "steel", wallCabinets: true, wallH: 72, wallGap: 55 },
          lighting: { led: true, ledColor: "#ffca87", ledIntensity: 1.15, interior: true, night: false, sun: 1, hobFlame: false, underGlow: true },
        });
        get().toast("طرح به حالت اولیه برگشت", "warn");
      },
    }),
    {
      name: "cabinet-studio-v1",
      version: 3,
      partialize: (s) => ({ room: s.room, kitchen: s.kitchen, units: s.units, wardrobe: s.wardrobe, lighting: s.lighting, mode: s.mode }),
      migrate: () => ({}),
      onRehydrateStorage: () => (state) => {
        if (state && !state.units?.length) state.units = initialUnits();
      },
    },
  ),
);

export const useView = () => {
  const { view, viewNonce, customView } = useStudio((s) => s.ui);
  const preset = CAMERA_VIEWS.find((v) => v.id === view) || CAMERA_VIEWS[0];
  return { ...(customView && view === "custom" ? customView : preset), nonce: viewNonce };
};

export const doorStyleOf = (id) => byId(DOOR_STYLES, id);
