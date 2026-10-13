import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { StudioScene } from "./three/StudioScene.jsx";
import { TopBar, ViewsBar, Toaster } from "./ui/TopBar.jsx";
import { Sidebar } from "./ui/Sidebar.jsx";
import { PlanView } from "./ui/PlanView.jsx";
import { PriceCard } from "./ui/PriceCard.jsx";
import { useStudio } from "./store/useStudio.js";

function Ready() {
  const setUI = useStudio((s) => s.setUI);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    setTimeout(() => setUI({ ready: true }), 620);
  });
  return null;
}

function ToneGuard() {
  const effects = useStudio((s) => s.ui.effects);
  return (
    <ToneSetter effects={effects} />
  );
}

function ToneSetter({ effects }) {
  useFrame(({ gl }) => {
    const want = effects === false ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    if (gl.toneMapping !== want) gl.toneMapping = want;
  });
  return null;
}

function Loader() {
  const ready = useStudio((s) => s.ui.ready);
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
          <div className="inner">
            <motion.div
              className="cube"
              animate={{ rotate: 360, borderRadius: ["14px", "26px", "14px"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <h2>کابینه استودیو</h2>
            <p>در حال ساخت صحنه سه‌بعدی و بافت‌ها…</p>
            <div className="bar">
              <motion.i initial={{ width: "8%" }} animate={{ width: "92%" }} transition={{ duration: 1.6, ease: "easeOut" }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const glRef = useRef(null);
  const toast = useStudio((s) => s.toast);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const select = useStudio((s) => s.select);

  const shot = () => {
    const gl = glRef.current;
    if (!gl) return;
    try {
      const url = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `cabinet-studio-${Date.now()}.png`;
      a.click();
      toast("عکس صحنه ذخیره شد");
    } catch {
      toast("ذخیره عکس ممکن نشد", "warn");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      const s = useStudio.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Escape") select(null);
      if (e.key === "Delete" && s.ui.selected) s.removeUnit(s.ui.selected);
      if (s.ui.selected && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const dir = e.key === "ArrowLeft" ? 1 : -1;
        s.moveUnit(s.ui.selected, dir);
      }
      if (e.key.toLowerCase() === "o" && s.ui.selected) s.toggleOpen(s.ui.selected);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, select]);

  return (
    <>
      <div className="stage">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance", alpha: false }}
          camera={{ position: [4.6, 3.2, 5.8], fov: 42, near: 0.1, far: 80 }}
          onCreated={({ gl }) => {
            glRef.current = gl;
            gl.toneMapping = THREE.NoToneMapping;
          }}
          onPointerMissed={() => select(null)}
        >
          <Suspense fallback={null}>
            <StudioScene />
            <ToneGuard />
            <Ready />
          </Suspense>
        </Canvas>
        <div className="vignette" />
      </div>

      <TopBar onShot={shot} />
      <Sidebar />
      <PlanView />
      <PriceCard />
      <ViewsBar />
      <div className="hint-pill glass">
        درگ: چرخش نما · اسکرول: زوم · کلیک: انتخاب یونیت · دابل‌کلیک: باز و بسته کردن درب
      </div>
      <Toaster />
      <Loader />
    </>
  );
}
