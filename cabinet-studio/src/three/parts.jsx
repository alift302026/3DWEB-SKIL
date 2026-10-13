import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { byId, HANDLES, HANDLE_FINISHES } from "../data/catalog.js";

/** نرم‌کردن حرکت‌ها (بدون کتابخانه انیمیشن در صحنه) */
export const damp = THREE.MathUtils.damp;

/* ---------------- متریال‌ها ---------------- */

export function SurfaceMat({ hex, roughness = 0.5, metalness = 0, clearcoat = 0, ...rest }) {
  if (clearcoat > 0) {
    return (
      <meshPhysicalMaterial
        color={hex}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={0.06}
        envMapIntensity={1.15}
        {...rest}
      />
    );
  }
  return <meshStandardMaterial color={hex} roughness={roughness} metalness={metalness} envMapIntensity={0.9} {...rest} />;
}

export function MetalMat({ finish, hex }) {
  const f = byId(HANDLE_FINISHES, finish);
  return (
    <meshStandardMaterial
      color={hex || f.hex}
      metalness={f.metalness}
      roughness={f.roughness}
      envMapIntensity={1.5}
    />
  );
}

/* ---------------- دستگیره ---------------- */

export function Handle({ kind = "bar", finish = "chrome", length = 0.16, vertical = false, hex }) {
  const L = length;
  if (kind === "none") return null;

  if (kind === "edge") {
    // پروفیل J — دستگیره مخفی لبه‌ای
    return (
      <group position={[0, 0, 0.006]}>
        <mesh castShadow>
          <boxGeometry args={[L || 0.9, 0.012, 0.014]} />
          <MetalMat finish={finish} hex={hex} />
        </mesh>
        <mesh position={[0, -0.008, -0.004]}>
          <boxGeometry args={[L || 0.9, 0.006, 0.02]} />
          <meshStandardMaterial color="#2a2c30" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>
    );
  }

  if (kind === "knob") {
    return (
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, -0.012]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.026, 16]} />
          <MetalMat finish={finish} hex={hex} />
        </mesh>
        <mesh position={[0, 0, -0.028]} castShadow>
          <sphereGeometry args={[0.016, 24, 16]} />
          <MetalMat finish={finish} hex={hex} />
        </mesh>
      </group>
    );
  }

  if (kind === "strap") {
    return (
      <group>
        <mesh position={[0, 0, 0.008]} castShadow>
          <boxGeometry args={[0.026, L, 0.004]} />
          <meshStandardMaterial color="#4a3226" roughness={0.85} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, (s * L) / 2, 0.002]}>
            <cylinderGeometry args={[0.005, 0.005, 0.008, 12]} />
            <MetalMat finish={finish} hex={hex} />
          </mesh>
        ))}
      </group>
    );
  }

  // میله‌ای
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={vertical ? [0, (s * (L - 0.03)) / 2, -0.014] : [(s * (L - 0.03)) / 2, 0, -0.014]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0055, 0.0055, 0.028, 12]} />
          <MetalMat finish={finish} hex={hex} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.028]} rotation={vertical ? [0, 0, 0] : [0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.0065, 0.0065, L, 18]} />
        <MetalMat finish={finish} hex={hex} />
      </mesh>
    </group>
  );
}

/* ---------------- لت درب ---------------- */

/**
 * لت درب با سبک‌های مختلف: MDF تخت، هایگلاس، نئوکلاسیک/شیکر (قاب‌دار)، ممبران و شیشه‌ای.
 */
export function DoorSlab({ w, h, styleDef, hex, d = 0.018, radius = 0.0025, glass = false }) {
  const mat = {
    hex,
    roughness: styleDef.roughness,
    metalness: styleDef.metalness,
    clearcoat: styleDef.clearcoat,
  };
  const frame = styleDef.frame;

  if (!frame || frame === "none") {
    return (
      <RoundedBox args={[w, h, d]} radius={Math.min(radius, d / 2 - 0.0005)} smoothness={2} creaseAngle={0.6} castShadow receiveShadow>
        <SurfaceMat {...mat} />
      </RoundedBox>
    );
  }

  if (frame === "glass") {
    const fw = styleDef.frameW;
    return (
      <group>
        {[
          [w, fw, 0, h / 2 - fw / 2],
          [w, fw, 0, -h / 2 + fw / 2],
          [fw, h - fw * 2, -w / 2 + fw / 2, 0],
          [fw, h - fw * 2, w / 2 - fw / 2, 0],
        ].map(([bw, bh, x, y], i) => (
          <mesh key={i} position={[x, y, 0]} castShadow>
            <boxGeometry args={[bw, bh, 0.022]} />
            <meshStandardMaterial color="#8d949a" metalness={0.9} roughness={0.3} envMapIntensity={1.4} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[w - fw * 2, h - fw * 2]} />
          <meshPhysicalMaterial
            color="#d8e6ea"
            transparent
            opacity={0.2}
            roughness={0.04}
            metalness={0}
            clearcoat={1}
            side={THREE.DoubleSide}
            envMapIntensity={2}
          />
        </mesh>
      </group>
    );
  }

  const fw = styleDef.frameW;
  const ft = frame === "slim" ? 0.02 : 0.024;
  const panelD = frame === "round" ? 0.016 : 0.012;
  const bead = frame === "classic" ? 0.014 : 0;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={frame === "round" ? 0.006 : 0.0015} smoothness={2} creaseAngle={0.5} castShadow receiveShadow>
        <SurfaceMat {...mat} />
      </RoundedBox>
      {/* پنل فرورفته */}
      <mesh position={[0, 0, d / 2 - 0.004]}>
        <boxGeometry args={[w - fw * 2, h - fw * 2, panelD]} />
        <SurfaceMat {...mat} roughness={Math.min(0.9, styleDef.roughness + 0.05)} />
      </mesh>
      {/* ابزار قاب */}
      {bead > 0 &&
        [
          [w - fw * 2 + bead, bead, 0, (h - fw * 2) / 2 + bead / 2],
          [w - fw * 2 + bead, bead, 0, -(h - fw * 2) / 2 - bead / 2],
          [bead, h - fw * 2 - bead * 2, -(w - fw * 2) / 2 - bead / 2, 0],
          [bead, h - fw * 2 - bead * 2, (w - fw * 2) / 2 + bead / 2, 0],
        ].map(([bw, bh, x, y], i) => (
          <mesh key={i} position={[x, y, d / 2 - 0.006]} castShadow>
            <boxGeometry args={[bw, bh, ft]} />
            <SurfaceMat {...mat} />
          </mesh>
        ))}
    </group>
  );
}

/**
 * لت کامل: لولا + انیمیشن بازشو + دستگیره.
 * hinge: 'left' | 'right' — angle: رادیان بازشو
 */
export function DoorLeaf({
  w,
  h,
  styleDef,
  hex,
  handleId = "none",
  handleFinish = "chrome",
  hinge = "right",
  open = 0,
  maxAngle = 1.75,
  liftUp = false,
  handleY = null,
  verticalHandle = false,
  z = 0,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const handle = byId(HANDLES, handleId);
  const pivot = useRef();
  const amount = (typeof open === "number" ? open : open ? 1 : 0) * maxAngle;
  const sign = hinge === "left" ? -1 : 1;
  const px = hinge === "left" ? -w / 2 : w / 2;
  const cx = hinge === "left" ? w / 2 : -w / 2;
  const hx = hinge === "left" ? w / 2 - 0.05 : -w / 2 + 0.05;
  const hy = handleY != null ? handleY : h / 2 - 0.09;
  const isEdge = handle.kind === "edge";

  useFrame((_, dt) => {
    const g = pivot.current;
    if (!g) return;
    const d = Math.min(1, dt * 8);
    if (liftUp) {
      g.rotation.x = damp(g.rotation.x, -amount * 0.62, d, 6);
    } else {
      g.rotation.y = damp(g.rotation.y, sign * amount, d, 6);
    }
  });

  return (
    <group ref={pivot} position={[liftUp ? 0 : px, liftUp ? h / 2 : 0, z]}>
      <group position={[liftUp ? 0 : cx, liftUp ? -h / 2 : 0, 0]}>
        <group onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
          <DoorSlab w={w} h={h} styleDef={styleDef} hex={hex} />
          <group position={[isEdge ? 0 : hx, isEdge ? h / 2 - 0.008 : hy, 0.009]}>
            <Handle kind={handle.kind} finish={handleFinish} length={isEdge ? w * 0.86 : handle.length} vertical={verticalHandle} />
          </group>
        </group>
      </group>
    </group>
  );
}

/* ---------------- بدنه (کارکاس) ---------------- */

export function Carcase({ w, h, d, hex = "#f2f2f0", sides = true, back = true, top = true, bottom = true, t = 0.016 }) {
  return (
    <group>
      {sides &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[(s * (w - t)) / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[t, h, d]} />
            <meshStandardMaterial color={hex} roughness={0.62} metalness={0} />
          </mesh>
        ))}
      {top && (
        <mesh position={[0, (h - t) / 2, 0]} receiveShadow>
          <boxGeometry args={[w, t, d]} />
          <meshStandardMaterial color={hex} roughness={0.62} />
        </mesh>
      )}
      {bottom && (
        <mesh position={[0, (-h + t) / 2, 0]} receiveShadow>
          <boxGeometry args={[w, t, d]} />
          <meshStandardMaterial color={hex} roughness={0.62} />
        </mesh>
      )}
      {back && (
        <mesh position={[0, 0, -d / 2 + 0.004]} receiveShadow>
          <boxGeometry args={[w - t * 2, h - t * 2, 0.006]} />
          <meshStandardMaterial color={hex} roughness={0.75} />
        </mesh>
      )}
    </group>
  );
}

export function Shelf({ w, d, y, hex = "#efeeeb" }) {
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <boxGeometry args={[w - 0.034, 0.016, d - 0.03]} />
      <meshStandardMaterial color={hex} roughness={0.6} />
    </mesh>
  );
}

/* ---------------- نور LED ---------------- */

export function LedStrip({ w, color = "#ffca87", intensity = 1, d = 0.012, y = 0, z = 0, glow = 2.4 }) {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(glow), [color, glow]);
  return (
    <group position={[0, y, z]}>
      <mesh>
        <boxGeometry args={[w, 0.006, d]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={intensity * 0.5} distance={1.1} decay={2} position={[0, -0.03, 0.05]} />
    </group>
  );
}

/* ---------------- قاب انتخاب ---------------- */

export function SelectionFrame({ w, h, d, y = 0 }) {
  const ref = useRef();
  useFrame((st) => {
    if (ref.current) {
      const p = 0.6 + Math.sin(st.clock.elapsedTime * 3.4) * 0.25;
      ref.current.material.opacity = p;
    }
  });
  const edges = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  return (
    <group position={[0, y, 0]}>
      <lineSegments geometry={edges} renderOrder={10}>
        <meshBasicMaterial ref={ref} color="#5ad1ff" transparent opacity={0.7} toneMapped={false} depthTest={false} />
      </lineSegments>
    </group>
  );
}
