import { Component, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { StudioScene } from "../three/StudioScene.jsx";
import { useStudio } from "../store/useStudio.js";

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="tour-loading">
        <h2>فضای سه‌بعدی روی این دستگاه اجرا نشد</h2>
        <p>
          شتاب‌دهی سخت‌افزاری مرورگر را فعال کنید یا مرورگر دیگری امتحان کنید.
        </p>
        <button className="gold-button" onClick={this.props.onExit}>
          بازگشت به صفحه اصلی
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function FrameSettings() {
  useFrame(({ gl }) => {
    gl.toneMapping =
      useStudio.getState().ui.effects === false
        ? THREE.ACESFilmicToneMapping
        : THREE.NoToneMapping;
  });
  return null;
}
export default function SceneView({ onShotReady, onExit }) {
  const glRef = useRef();
  useEffect(() => {
    onShotReady(() => {
      if (!glRef.current) throw new Error("Scene not ready");
      const a = document.createElement("a");
      a.href = glRef.current.domElement.toDataURL("image/png");
      a.download = `my-kitchen-${Date.now()}.png`;
      a.click();
    });
    return () => onShotReady(null);
  }, []);
  return (
    <SceneBoundary onExit={onExit}>
      <div className="customer-canvas">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{
            position: [1.85, 1.62, 1.75],
            fov: 62,
            near: 0.06,
            far: 60,
          }}
          gl={{
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
          onCreated={({ gl }) => {
            glRef.current = gl;
            gl.toneMapping = THREE.NoToneMapping;
          }}
          fallback={
            <div className="tour-loading">
              این مرورگر از WebGL پشتیبانی نمی‌کند.
              <button className="gold-button" onClick={onExit}>
                بازگشت
              </button>
            </div>
          }
        >
          <Suspense fallback={null}>
            <StudioScene />
            <FrameSettings />
          </Suspense>
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
