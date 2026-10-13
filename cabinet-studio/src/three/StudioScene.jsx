import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, AdaptiveDpr, Preload, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import { useStudio } from "../store/useStudio.js";
import { CAMERA_VIEWS } from "../data/catalog.js";
import { computeLayout, C } from "../lib/layout.js";
import { Floor, Walls, SideWindow, SinkWindow, CeilingLights, CounterProps, WallArt } from "./room.jsx";
import { Kitchen, RunDimension } from "./kitchen.jsx";
import { Wardrobe } from "./wardrobe.jsx";

RectAreaLightUniformsLib.init();

const WARDROBE_VIEWS = {
  overview: { pos: [2.7, 1.95, 3.3], target: [0, 1.15, -1.1] },
  front: { pos: [0, 1.5, 3.1], target: [0, 1.2, -1.3] },
  corner: { pos: [-2.6, 1.9, 2.9], target: [0, 1.2, -1.2] },
  top: { pos: [0.01, 4.6, 0.8], target: [0, 0.6, -1.0] },
  eye: { pos: [0.9, 1.6, 1.5], target: [0, 1.3, -1.4] },
  detail: { pos: [-1.1, 1.4, 1.4], target: [0.2, 1.2, -1.2] },
};

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraRig({ controls }) {
  const { camera } = useThree();
  const mode = useStudio((s) => s.mode);
  const view = useStudio((s) => s.ui.view);
  const nonce = useStudio((s) => s.ui.viewNonce);
  const custom = useStudio((s) => s.ui.customView);
  const autoRotate = useStudio((s) => s.ui.autoRotate);

  const from = useRef({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const to = useRef({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const t = useRef(1);

  const dest = useMemo(() => {
    if (custom && view === "custom") return custom;
    const table = mode === "wardrobe" ? WARDROBE_VIEWS : Object.fromEntries(CAMERA_VIEWS.map((v) => [v.id, v]));
    return table[view] || table.overview;
  }, [view, mode, custom]);

  useEffect(() => {
    const c = controls.current;
    from.current.pos.copy(camera.position);
    from.current.tgt.copy(c ? c.target : new THREE.Vector3());
    to.current.pos.set(...dest.pos);
    to.current.tgt.set(...dest.target);
    t.current = 0;
    if (c) c.enabled = false;
  }, [nonce, dest, camera, controls]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    if (t.current < 1) {
      t.current = Math.min(1, t.current + dt / 1.35);
      const e = easeInOut(t.current);
      camera.position.lerpVectors(from.current.pos, to.current.pos, e);
      c.target.lerpVectors(from.current.tgt, to.current.tgt, e);
      c.update();
      if (t.current >= 1) c.enabled = true;
    }
    c.autoRotate = autoRotate && t.current >= 1;
    c.autoRotateSpeed = 0.55;
  });

  return null;
}

function Lights() {
  const lighting = useStudio((s) => s.lighting);
  const room = useStudio((s) => s.room);
  const dir = useRef();
  const night = lighting.night;
  const sun = (lighting.sun ?? 1) * (night ? 0.06 : 1);

  useEffect(() => {
    if (dir.current) {
      dir.current.target.position.set(0, 1, -0.4);
      dir.current.target.updateMatrixWorld();
    }
  }, []);

  return (
    <>
      <ambientLight intensity={night ? 0.08 : 0.28} color="#dfe8f5" />
      <hemisphereLight intensity={night ? 0.1 : 0.45} color="#e7f0ff" groundColor="#8d7b66" />
      <directionalLight
        ref={dir}
        position={[-3.6, 3.4, 1.6]}
        intensity={sun * 2.4}
        color="#fff2dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.022}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-(room.width / 2 + 1.2)}
        shadow-camera-right={room.width / 2 + 1.2}
        shadow-camera-top={room.height + 1.2}
        shadow-camera-bottom={-1.6}
      />
      <directionalLight position={[3.2, 2.4, 3.4]} intensity={night ? 0.15 : 0.5} color="#dce8ff" />
      <pointLight position={[0, room.height - 0.3, 0.6]} intensity={night ? 5 : 2} distance={7} decay={2} color="#ffe6c4" />
    </>
  );
}

function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <Lightformer form="rect" intensity={3} color="#fff4e6" scale={[9, 4, 1]} position={[0, 4, 5]} target={[0, 1, 0]} />
      <Lightformer form="rect" intensity={4} color="#e9f3ff" scale={[7, 4, 1]} position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} target={[0, 1, 0]} />
      <Lightformer form="rect" intensity={1.4} color="#ffffff" scale={[6, 3, 1]} position={[5, 2.5, -3]} rotation={[0, -Math.PI / 2, 0]} target={[0, 1, 0]} />
      <Lightformer form="circle" intensity={2.2} color="#fff0d8" scale={3} position={[2, 3.4, 2]} target={[0, 1, -0.5]} />
      <Lightformer form="rect" intensity={0.6} color="#3a4658" scale={[12, 8, 1]} position={[0, 2, -8]} target={[0, 1, 0]} />
    </Environment>
  );
}

function Effects() {
  const effects = useStudio((s) => s.ui.effects);
  const night = useStudio((s) => s.lighting.night);
  if (effects === false) return null;
  return (
    <EffectComposer disableNormalPass multisampling={4} frameBufferType={THREE.HalfFloatType}>
      <Bloom mipmapBlur intensity={night ? 0.9 : 0.5} luminanceThreshold={1.05} luminanceSmoothing={0.25} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.28} darkness={night ? 0.72 : 0.5} eskil={false} />
    </EffectComposer>
  );
}

/** برچسب اندازه روی یونیت انتخاب‌شده */
function SelectionTag() {
  const units = useStudio((s) => s.units);
  const selected = useStudio((s) => s.ui.selected);
  const room = useStudio((s) => s.room);
  const { items, width } = useMemo(() => computeLayout(units), [units]);
  const it = items.find((i) => i.id === selected);
  if (!it) return null;
  const tall = it.type === "tall" || it.type === "tall-oven" || it.type === "fridge";
  return (
    <Html
      position={[-width / 2 + it.cx, (tall ? C.tallH : C.workH) + 0.22, -room.depth / 2 + C.depth / 2]}
      center
      distanceFactor={4.2}
      style={{ pointerEvents: "none" }}
    >
      <div className="tag3d">
        {new Intl.NumberFormat("fa-IR").format(Math.round(it.width * 100))} ×{" "}
        {new Intl.NumberFormat("fa-IR").format(Math.round((tall ? C.tallH : C.workH) * 100))} سانتی‌متر
      </div>
    </Html>
  );
}

export function StudioScene() {
  const mode = useStudio((s) => s.mode);
  const showDims = useStudio((s) => s.ui.showDims);
  const controls = useRef();

  return (
    <>
      <color attach="background" args={["#0b0e12"]} />
      <CameraRig controls={controls} />
      <Lights />
      <StudioEnvironment />

      <group>
        <Floor />
        <Walls />
        <SideWindow />
        <SinkWindow />
        <CeilingLights />
        <WallArt />
        {mode === "kitchen" ? (
          <>
            <Kitchen />
            <CounterProps />
            {showDims && <RunDimension />}
            <SelectionTag />
          </>
        ) : (
          <Wardrobe />
        )}
      </group>

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={0.9}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2 - 0.03}
        target={[0, 1, -0.6]}
      />
      <Effects />
      <AdaptiveDpr pixelated={false} />
      <Preload all />
    </>
  );
}
