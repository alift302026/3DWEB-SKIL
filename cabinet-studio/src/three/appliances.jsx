import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { byId, APPLIANCE_FINISHES, HANDLE_FINISHES } from "../data/catalog.js";
import { MetalMat } from "./parts.jsx";

const C = { workH: 0.9, depth: 0.58 };

function finishMat(finishId, fallbackHex, doorHex) {
  const f = byId(APPLIANCE_FINISHES, finishId);
  const hex = f.hex == null ? doorHex : f.hex;
  return { color: hex, metalness: f.metalness, roughness: f.roughness, envMapIntensity: 1.4 };
}

/* ---------------- سینک ---------------- */

export function Sink({ w = 0.72, double = true, finish = "steel", faucet = true }) {
  const d = 0.4;
  const depth = 0.19;
  const rimT = 0.018;
  const top = C.workH;
  const mat = finishMat(finish, "steel");
  const innerW = double ? (w - rimT * 2 - 0.02) / 2 : w - rimT * 2;
  const cells = double ? [-1, 1] : [0];

  return (
    <group>
      {/* لبه سینک */}
      <mesh position={[0, top + 0.002, 0]} receiveShadow>
        <boxGeometry args={[w, 0.004, d]} />
        <meshStandardMaterial {...mat} roughness={0.22} />
      </mesh>
      {cells.map((s) => {
        const cx = s * (double ? (innerW + 0.02) / 2 : 0);
        const bw = double ? innerW : w - rimT * 2;
        return (
          <group key={s} position={[cx, 0, 0]}>
            {[
              [bw, 0.008, 0, -(d / 2 - rimT - 0.004)],
              [bw, 0.008, 0, d / 2 - rimT - 0.004],
            ].map(([bw2, bd, x, z], i) => (
              <mesh key={`h${i}`} position={[x, top - depth / 2, z]}>
                <boxGeometry args={[bw2, depth, bd]} />
                <meshStandardMaterial {...mat} side={THREE.DoubleSide} />
              </mesh>
            ))}
            {[
              [0.008, -(bw / 2 - 0.004)],
              [0.008, bw / 2 - 0.004],
            ].map(([bd, x], i) => (
              <mesh key={`v${i}`} position={[x, top - depth / 2, 0]}>
                <boxGeometry args={[bd, depth, d - rimT * 2]} />
                <meshStandardMaterial {...mat} side={THREE.DoubleSide} />
              </mesh>
            ))}
            <mesh position={[0, top - depth, 0]} receiveShadow>
              <boxGeometry args={[bw, 0.008, d - rimT * 2]} />
              <meshStandardMaterial {...mat} />
            </mesh>
            {/* آبچکان کف */}
            <mesh position={[0, top - depth + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.035, 0.06, 24]} />
              <meshStandardMaterial {...mat} roughness={0.35} />
            </mesh>
            {/* سیفون */}
            <mesh position={[0, top - depth - 0.035, 0]}>
              <cylinderGeometry args={[0.028, 0.022, 0.05, 18]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      {double && (
        <mesh position={[0, top - depth / 2, 0]}>
          <boxGeometry args={[0.016, depth, d - rimT * 2]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      )}
      {faucet && <Faucet z={-d / 2 - 0.06} finish={finish} />}
    </group>
  );
}

export function Faucet({ z = -0.26, finish = "steel" }) {
  const f = byId(HANDLE_FINISHES, finish === "panel" ? "chrome" : finish);
  return (
    <group position={[0, C.workH, z]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.03, 0.04, 24]} />
        <MetalMat finish={finish === "panel" ? "chrome" : finish} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 20]} />
        <MetalMat finish={finish === "panel" ? "chrome" : finish} />
      </mesh>
      <mesh position={[0, 0.34, 0.075]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.075, 0.013, 12, 24, Math.PI]} />
        <MetalMat finish={finish === "panel" ? "chrome" : finish} />
      </mesh>
      <mesh position={[0, 0.305, 0.15]} castShadow>
        <cylinderGeometry args={[0.013, 0.011, 0.07, 18]} />
        <MetalMat finish={finish === "panel" ? "chrome" : finish} />
      </mesh>
      {/* اهرم */}
      <mesh position={[0.02, 0.2, -0.02]} rotation={[0.5, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.11, 12]} />
        <MetalMat finish={finish === "panel" ? "chrome" : finish} />
      </mesh>
    </group>
  );
}

/* ---------------- گاز رومیزی ---------------- */

export function Hob({ w = 0.62, finish = "black", flame = false, burners = 4 }) {
  const d = 0.46;
  const top = C.workH + 0.006;
  const mat = finishMat(finish, "black");
  const positions =
    burners === 5
      ? [
          [-w / 4, -d / 5],
          [w / 4, -d / 5],
          [-w / 4, d / 5],
          [w / 4, d / 5],
          [0, 0],
        ]
      : [
          [-w / 4, -d / 5],
          [w / 4, -d / 5],
          [-w / 4, d / 5],
          [w / 4, d / 5],
        ];

  return (
    <group>
      <RoundedBox args={[w, 0.01, d]} radius={0.004} smoothness={2} position={[0, top, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.6} />
      </RoundedBox>
      {positions.map(([x, z], i) => (
        <Burner key={i} x={x} z={z} y={top + 0.006} flame={flame && i < (burners === 5 ? 2 : 2)} size={i === 0 ? 1 : 0.8} />
      ))}
      {/* ولوم‌ها */}
      {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
        <mesh key={i} position={[x, top + 0.006, d / 2 - 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.008, 16]} />
          <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Burner({ x, z, y, flame, size = 1 }) {
  const flameRef = useRef();
  const glow = useMemo(() => new THREE.Color("#3aa0ff").multiplyScalar(4), []);
  useFrame((st) => {
    if (flameRef.current) {
      const t = st.clock.elapsedTime;
      flameRef.current.scale.setScalar(1 + Math.sin(t * 14 + x * 9) * 0.07);
      flameRef.current.rotation.y = t * 2;
    }
  });
  return (
    <group position={[x, y, z]} scale={size}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.052, 0.006, 8, 28]} />
        <meshStandardMaterial color="#33363b" metalness={0.9} roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]} position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[0.115, 0.006, 0.014]} />
          <meshStandardMaterial color="#2f3237" metalness={0.9} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 0.014, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.034, 0.014, 20]} />
        <meshStandardMaterial color="#40444a" metalness={0.95} roughness={0.3} />
      </mesh>
      {flame && (
        <group ref={flameRef} position={[0, 0.012, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.036, 0.009, 8, 24]} />
            <meshBasicMaterial color={glow} transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.036, 0.012, Math.sin(a) * 0.036]}>
                <coneGeometry args={[0.006, 0.026, 6]} />
                <meshBasicMaterial color={glow} transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            );
          })}
          <pointLight color="#5aa8ff" intensity={1.6} distance={0.6} decay={2} />
        </group>
      )}
    </group>
  );
}

/* ---------------- هود ---------------- */

export function Hood({ w = 0.6, finish = "steel", light = false, ledColor = "#ffca87", upTo = 2.17 }) {
  const mat = finishMat(finish, "steel");
  const bottom = 1.5;
  const hoodTarget = useMemo(() => new THREE.Object3D(), []);
  return (
    <group>
      <mesh position={[0, bottom + 0.06, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.12, 0.46]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0, bottom + 0.12, -0.04]} castShadow>
        <boxGeometry args={[w * 0.62, 0.06, 0.34]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0, (bottom + 0.15 + upTo) / 2, -0.12]} castShadow>
        <boxGeometry args={[0.26, upTo - bottom - 0.15, 0.24]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* پنل شیشه‌ای زیر هود */}
      <mesh position={[0, bottom + 0.001, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.04, 0.4]} />
        <meshStandardMaterial color="#17181c" metalness={0.6} roughness={0.25} />
      </mesh>
      {light && (
        <>
          <mesh position={[0, bottom + 0.004, -0.04]}>
            <boxGeometry args={[w - 0.1, 0.004, 0.1]} />
            <meshBasicMaterial color={new THREE.Color(ledColor).multiplyScalar(2.4)} toneMapped={false} />
          </mesh>
          <spotLight position={[0, bottom - 0.02, -0.04]} angle={0.9} penumbra={0.8} intensity={4} distance={2.2} color={ledColor} decay={2}>
            <primitive object={hoodTarget} position={[0, -1, 0.02]} />
          </spotLight>
        </>
      )}
    </group>
  );
}

/* ---------------- فر توکار ---------------- */

export function Oven({ w = 0.58, finish = "black", doorHex = "#fff" }) {
  const mat = finishMat(finish, "black");
  const h = 0.58;
  const y = 0.92;
  return (
    <group position={[0, y, C.depth / 2 - 0.02]}>
      <mesh position={[0, 0, -0.03]} castShadow>
        <boxGeometry args={[w, h, 0.5]} />
        <meshStandardMaterial color="#2b2d31" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* قاب */}
      <mesh position={[0, 0, 0.005]} castShadow>
        <boxGeometry args={[w, h, 0.012]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* شیشه درب */}
      <mesh position={[0, -0.04, 0.014]}>
        <planeGeometry args={[w - 0.07, h - 0.16]} />
        <meshPhysicalMaterial color="#0c0d10" metalness={0.5} roughness={0.08} clearcoat={1} envMapIntensity={1.8} />
      </mesh>
      {/* نمایشگر */}
      <mesh position={[0, h / 2 - 0.045, 0.014]}>
        <planeGeometry args={[0.12, 0.03]} />
        <meshBasicMaterial color={new THREE.Color("#46d6ff").multiplyScalar(2)} toneMapped={false} />
      </mesh>
      {[-0.16, 0.16].map((x, i) => (
        <mesh key={i} position={[x, h / 2 - 0.045, 0.018]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.01, 18]} />
          <meshStandardMaterial color="#c8ccd0" metalness={1} roughness={0.25} />
        </mesh>
      ))}
      {/* دستگیره */}
      <mesh position={[0, h / 2 - 0.11, 0.045]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, w - 0.08, 16]} />
        <meshStandardMaterial color="#c8ccd0" metalness={1} roughness={0.22} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (w - 0.1)) / 2, h / 2 - 0.11, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.03, 12]} />
          <meshStandardMaterial color="#c8ccd0" metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- یخچال ---------------- */

export function Fridge({ w = 0.75, finish = "steel", doorHex = "#e9e5de", handleFinish = "chrome" }) {
  const mat = finishMat(finish, "steel", doorHex);
  const h = 1.9;
  const d = 0.66;
  const dH = 0.62;
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, h / 2, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.01, h, d - 0.04]} />
        <meshStandardMaterial color="#3a3d42" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, h - dH / 2, d / 2 - 0.03]} castShadow>
        <boxGeometry args={[w - 0.02, dH - 0.01, 0.02]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0, (h - dH) / 2, d / 2 - 0.03]} castShadow>
        <boxGeometry args={[w - 0.02, h - dH - 0.02, 0.02]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {[h - dH + 0.16, h - dH - 0.24].map((y, i) => (
        <group key={i} position={[0, y, d / 2 - 0.02]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.06, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.03, 12]} />
              <MetalMat finish={handleFinish} />
            </mesh>
          ))}
          <mesh position={[0, 0, -0.032]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.14, 16]} />
            <MetalMat finish={handleFinish} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- ماشین ظرفشویی ---------------- */

export function Dishwasher({ w = 0.58, finish = "steel", doorHex = "#e9e5de" }) {
  const mat = finishMat(finish, "steel", doorHex);
  return (
    <group position={[0, 0.1 + 0.36, C.depth / 2 - 0.02]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, 0.7, 0.02]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0, 0.28, 0.022]} castShadow>
        <boxGeometry args={[w - 0.04, 0.02, 0.02]} />
        <meshStandardMaterial color="#c9ced3" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.22, 0.014]}>
        <planeGeometry args={[0.1, 0.02]} />
        <meshBasicMaterial color={new THREE.Color("#68e0a0").multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
    </group>
  );
}
