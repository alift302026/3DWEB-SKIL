import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useStudio } from "../store/useStudio.js";
import { computeLayout, C } from "../lib/layout.js";
import { byId, FLOORS, WALL_COLORS } from "../data/catalog.js";
import { woodTexture, tileTexture, stoneTexture, fabricTexture, noiseTexture } from "../lib/textures.js";

function useFloorMaterial(floorId, w, d) {
  const def = byId(FLOORS, floorId);
  return useMemo(() => {
    const rep = [Math.max(1, w / 2.2), Math.max(1, d / 2.2)];
    let map;
    if (def.kind === "tile") map = tileTexture(def.hex, [rep[0] * 2, rep[1] * 2]);
    else if (def.kind === "stone") map = stoneTexture(def.hex, "#8f8b84", "marble", [rep[0] * 0.6, rep[1] * 0.6]);
    else map = woodTexture(def.hex, "plank", [rep[0], rep[1]]);
    return { map, def };
  }, [def, w, d]);
}

/* ---------------- کف ---------------- */

export function Floor() {
  const room = useStudio((s) => s.room);
  const { map, def } = useFloorMaterial(room.floor, room.width, room.depth);
  const rough = useMemo(() => noiseTexture(3, [8, 8], 0.35), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[room.width, room.depth]} />
      <meshStandardMaterial
        map={map}
        roughnessMap={rough}
        roughness={def.kind === "tile" ? 0.28 : 0.55}
        metalness={0.02}
        envMapIntensity={0.8}
        color="#ffffff"
      />
    </mesh>
  );
}

/* ---------------- دیوارها (هوشمند: دیوار جلوی دوربین پنهان می‌شود) ---------------- */

function Wall({ size, position, rotation, hex, roughness = 0.92, id, camRef }) {
  const ref = useRef();
  useFrame(({ camera }) => {
    const m = ref.current;
    if (!m) return;
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
    const toCam = camera.position.clone().sub(m.position);
    m.visible = toCam.dot(n) > 0.15;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={hex} roughness={roughness} metalness={0} envMapIntensity={0.6} />
    </mesh>
  );
}

export function Walls() {
  const room = useStudio((s) => s.room);
  const hex = byId(WALL_COLORS, room.wall).hex;
  const { width, depth, height } = room;
  return (
    <group>
      <Wall size={[width, height]} position={[0, height / 2, -depth / 2]} rotation={[0, 0, 0]} hex={hex} />
      <Wall size={[depth, height]} position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} hex={hex} />
      <Wall size={[depth, height]} position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} hex={hex} />
      <Wall size={[width, depth]} position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} hex={shade(hex, -0.04)} />
      {/* قرنیز */}
      <mesh position={[0, 0.05, -depth / 2 + 0.008]}>
        <boxGeometry args={[width, 0.1, 0.016]} />
        <meshStandardMaterial color="#f2f1ee" roughness={0.6} />
      </mesh>
    </group>
  );
}

const shade = (hex, amt) => {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return `#${c.getHexString()}`;
};

/* ---------------- پنجره‌ها ---------------- */

/** پنجره بزرگ دیوار کنار — منبع اصلی نور طبیعی */
export function SideWindow() {
  const room = useStudio((s) => s.room);
  const glow = useMemo(() => new THREE.Color("#e4f0ff").multiplyScalar(2.8), []);
  if (!room.window) return null;
  const ww = 1.5;
  const wh = 1.4;
  const wb = 0.95;
  return (
    <group position={[-room.width / 2 + 0.02, 0, room.depth * 0.1]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, wb + wh / 2, 0]}>
        <planeGeometry args={[ww, wh]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      {[
        [ww + 0.1, 0.06, 0, wb + wh + 0.03],
        [ww + 0.1, 0.06, 0, wb - 0.03],
        [0.06, wh + 0.12, -ww / 2 - 0.03, wb + wh / 2],
        [0.06, wh + 0.12, ww / 2 + 0.03, wb + wh / 2],
        [0.035, wh, 0, wb + wh / 2],
        [ww, 0.035, 0, wb + wh / 2],
      ].map(([bw, bh, x, y], i) => (
        <mesh key={i} position={[x, y, 0.014]} castShadow>
          <boxGeometry args={[bw, bh, 0.06]} />
          <meshStandardMaterial color="#f4f3f0" roughness={0.4} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, wb - 0.07, 0.07]} castShadow receiveShadow>
        <boxGeometry args={[ww + 0.22, 0.035, 0.18]} />
        <meshStandardMaterial color="#f4f3f0" roughness={0.4} />
      </mesh>
      <rectAreaLight position={[0, wb + wh / 2, 0.08]} width={ww} height={wh} intensity={9} color="#e9f3ff" />
    </group>
  );
}

/** پنجره بالای سینک روی دیوار پشت */
export function SinkWindow() {
  const room = useStudio((s) => s.room);
  const units = useStudio((s) => s.units);
  const { items, width } = useMemo(() => computeLayout(units), [units]);
  const glow = useMemo(() => new THREE.Color("#e2eeff").multiplyScalar(2.2), []);
  const sink = items.find((i) => i.meta.wall === "window");
  if (!room.window || !sink) return null;
  const wx = -width / 2 + sink.cx;
  const ww = Math.min(sink.width - 0.08, 1.2);
  const wh = 1.15;
  const wb = 1.02;
  return (
    <group position={[wx, 0, -room.depth / 2 + 0.012]}>
      <mesh position={[0, wb + wh / 2, 0]}>
        <planeGeometry args={[ww, wh]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      {[
        [ww + 0.09, 0.05, 0, wb + wh + 0.025],
        [ww + 0.09, 0.05, 0, wb - 0.025],
        [0.05, wh + 0.1, -ww / 2 - 0.025, wb + wh / 2],
        [0.05, wh + 0.1, ww / 2 + 0.025, wb + wh / 2],
      ].map(([bw, bh, x, y], i) => (
        <mesh key={i} position={[x, y, 0.014]} castShadow>
          <boxGeometry args={[bw, bh, 0.05]} />
          <meshStandardMaterial color="#f4f3f0" roughness={0.45} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, wb - 0.055, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[ww + 0.16, 0.03, 0.15]} />
        <meshStandardMaterial color="#f4f3f0" roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ---------------- سقف و هالوژن ---------------- */

export function CeilingLights() {
  const room = useStudio((s) => s.room);
  const lighting = useStudio((s) => s.lighting);
  if (!room.ceiling) return null;
  const spots = [
    [-room.width / 4, -room.depth / 4],
    [room.width / 4, -room.depth / 4],
    [0, room.depth / 5],
  ];
  return (
    <group>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, room.height - 0.02, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.055, 24]} />
            <meshBasicMaterial color={new THREE.Color("#fff3e0").multiplyScalar(2.2)} toneMapped={false} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
            <meshStandardMaterial color="#e8e8e6" roughness={0.5} />
          </mesh>
          <pointLight intensity={lighting.night ? 6 : 3} distance={4.5} decay={2} color="#ffe9cc" position={[0, -0.15, 0]} />
        </group>
      ))}
    </group>
  );
}

/* ---------------- لوازم صحنه (props) ---------------- */

export function CounterProps() {
  const units = useStudio((s) => s.units);
  const { items, width } = useMemo(() => computeLayout(units), [units]);
  const spots = useMemo(() => {
    const holes = items.filter((i) => i.type === "sink" || i.type === "hob");
    const free = items.filter((i) => !isAppliance(i.type) && i.meta.wall !== "none");
    const out = [];
    if (free.length) out.push({ x: -width / 2 + free[0].cx + free[0].width * 0.18, kind: "board" });
    if (free.length > 1) out.push({ x: -width / 2 + free[free.length - 1].cx, kind: "plant" });
    else if (free.length) out.push({ x: -width / 2 + free[0].cx - free[0].width * 0.25, kind: "bowl" });
    return out.filter((s) => !holes.some((h) => Math.abs(-width / 2 + h.cx - s.x) < 0.3));
  }, [items, width]);

  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, C.workH, -0.02]}>
          {s.kind === "board" && <CuttingBoard />}
          {s.kind === "plant" && <Plant />}
          {s.kind === "bowl" && <Bowl />}
        </group>
      ))}
    </group>
  );
}

const isAppliance = (t) => t === "sink" || t === "hob" || t === "tall-oven" || t === "fridge" || t === "dishwasher";

function CuttingBoard() {
  return (
    <group position={[0, 0.012, 0.06]}>
      <RoundedBox args={[0.34, 0.022, 0.24]} radius={0.01} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial map={woodTexture("#a9784a", "wood", [1, 1])} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0.1, 0.02, -0.02]} rotation={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.045, 18, 14]} />
        <meshStandardMaterial color="#c0392b" roughness={0.35} />
      </mesh>
      <mesh position={[-0.06, 0.018, 0.03]} rotation={[Math.PI / 2, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.012, 0.09, 4, 10]} />
        <meshStandardMaterial color="#6aa84f" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Bowl() {
  return (
    <group position={[0, 0.005, 0.08]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#e8e6e1" roughness={0.18} clearcoat={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.098, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.012, 20]} />
        <meshPhysicalMaterial color="#e8e6e1" roughness={0.2} clearcoat={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.03, -0.03 + i * 0.01, Math.sin(i * 2.1) * 0.03]} castShadow>
          <sphereGeometry args={[0.032, 14, 10]} />
          <meshStandardMaterial color={["#d9a441", "#c0392b", "#7d9c3f"][i]} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Plant() {
  return (
    <group position={[0, 0, 0.04]}>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.065, 0.18, 24]} />
        <meshStandardMaterial color="#c9bda9" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.185, 0]}>
        <cylinderGeometry args={[0.078, 0.078, 0.012, 24]} />
        <meshStandardMaterial color="#3d2f22" roughness={0.95} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const r = 0.06 + (i % 3) * 0.035;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.3 + (i % 4) * 0.055, Math.sin(a) * r]} rotation={[Math.sin(a) * 0.5, a, Math.cos(a) * 0.5]} castShadow>
            <coneGeometry args={[0.035, 0.22, 5]} />
            <meshStandardMaterial color={i % 2 ? "#4f7a3a" : "#5f8f45"} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------------- تابلو دیواری ---------------- */

export function WallArt() {
  const room = useStudio((s) => s.room);
  const map = useMemo(() => fabricTexture("#8c9c8b", [1, 1]), []);
  return (
    <group position={[-room.width / 2 + 0.03, 1.75, room.depth / 6]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.82, 0.03]} />
        <meshStandardMaterial color="#2f2b26" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.54, 0.74]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
    </group>
  );
}
