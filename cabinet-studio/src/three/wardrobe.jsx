import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useStudio } from "../store/useStudio.js";
import { byId, DOOR_STYLES, DOOR_COLORS, BODY_COLORS } from "../data/catalog.js";
import { DoorLeaf, LedStrip, SelectionFrame, damp } from "./parts.jsx";
import { woodTexture } from "../lib/textures.js";

function SlidingDoor({ w, h, x, z, styleDef, hex, handleId, handleFinish, open, dir, mirror, onClick }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.x = damp(ref.current.position.x, x + (open ? dir * w * 0.82 : 0), Math.min(1, dt * 8), 5);
  });
  return (
    <group ref={ref} position={[x, h / 2, z]}>
      <group onClick={(e) => { e.stopPropagation(); if (e.delta > 5) return; onClick(); }}>
        <DoorLeaf w={w} h={h} styleDef={styleDef} hex={hex} handleId={handleId} handleFinish={handleFinish} hinge={dir > 0 ? "right" : "left"} open={0} verticalHandle handleY={0} />
        {mirror && <MirrorPane w={w - 0.1} h={h - 0.14} />}
      </group>
    </group>
  );
}

function MirrorPane({ w, h }) {
  return (
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[w, h]} />
      <MeshReflectorMaterial
        resolution={256}
        blur={[260, 60]}
        mixBlur={0.7}
        mixStrength={6}
        mirror={0.85}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
        color="#dfe6ea"
        metalness={0.6}
        roughness={0.08}
      />
    </mesh>
  );
}

export function Wardrobe() {
  const w = useStudio((s) => s.wardrobe);
  const lighting = useStudio((s) => s.lighting);
  const room = useStudio((s) => s.room);
  const [openSet, setOpenSet] = useState(() => new Set());
  const closeNonce = useStudio((s) => s.ui.closeNonce);
  useEffect(() => { setOpenSet(new Set()); }, [closeNonce]);

  const styleDef = byId(DOOR_STYLES, w.doorStyle);
  const doorHex = byId(DOOR_COLORS, w.doorColor).hex;
  const bodyHex = byId(BODY_COLORS, w.bodyColor).hex;
  const bodyMap = useMemo(() => woodTexture(bodyHex, "wood", [1, 1]), [bodyHex]);

  const { width, height, depth, doors } = w;
  const doorW = width / doors;
  const toggle = (i) =>
    setOpenSet((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const shelfZoneW = width * 0.46;
  const hangZoneX = -width / 2 + shelfZoneW;

  return (
    <group position={[0, 0, -room.depth / 2 + depth / 2 + 0.01]}>
      {/* بدنه */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (width - 0.018)) / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.018, height, depth]} />
          <meshStandardMaterial map={bodyMap} roughness={0.6} color="#ffffff" />
        </mesh>
      ))}
      {[0.018, height - 0.018].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.018, depth]} />
          <meshStandardMaterial map={bodyMap} roughness={0.6} color="#ffffff" />
        </mesh>
      ))}
      <mesh position={[0, height / 2, -depth / 2 + 0.004]}>
        <boxGeometry args={[width - 0.036, height - 0.036, 0.006]} />
        <meshStandardMaterial map={bodyMap} roughness={0.75} color="#ffffff" />
      </mesh>
      {/* دیواره میانی */}
      <mesh position={[hangZoneX, height / 2, 0]} castShadow>
        <boxGeometry args={[0.018, height - 0.036, depth - 0.02]} />
        <meshStandardMaterial map={bodyMap} roughness={0.6} color="#ffffff" />
      </mesh>

      {/* قفسه‌ها */}
      {Array.from({ length: Math.max(1, w.shelves) }).map((_, i, a) => {
        const y = 1.05 + ((i + 1) * (height - 1.25)) / (a.length + 1);
        return (
          <mesh key={i} position={[-width / 2 + shelfZoneW / 2, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[shelfZoneW - 0.04, 0.018, depth - 0.03]} />
            <meshStandardMaterial map={bodyMap} roughness={0.6} color="#ffffff" />
          </mesh>
        );
      })}

      {/* کشوها */}
      {Array.from({ length: Math.max(0, w.drawers) }).map((_, i, a) => {
        const dh = 0.24;
        const y = 0.06 + dh / 2 + i * (dh + 0.006);
        return (
          <group key={i} position={[-width / 2 + shelfZoneW / 2, y, depth / 2 - 0.01]}>
            <mesh castShadow>
              <boxGeometry args={[shelfZoneW - 0.05, dh, 0.018]} />
              <meshStandardMaterial map={woodTexture(doorHex, "wood", [1, 1])} roughness={0.5} color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.007, 0.007, Math.min(0.24, shelfZoneW * 0.4), 14]} />
              <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* ریل لباس */}
      {Array.from({ length: Math.max(0, w.rails) }).map((_, i) => (
        <group key={i}>
          <mesh position={[hangZoneX + (width / 2 - hangZoneX) / 2, height - 0.22 - i * 0.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, width / 2 - hangZoneX - 0.06, 16]} />
            <meshStandardMaterial color="#b8bcc0" metalness={1} roughness={0.3} />
          </mesh>
          {Array.from({ length: 6 }).map((_, j) => (
            <Hanger key={j} x={hangZoneX + 0.16 + j * 0.21} y={height - 0.24 - i * 0.55} />
          ))}
        </group>
      ))}

      {/* نور داخلی */}
      {lighting.led && w.interiorLight && (
        <>
          <LedStrip w={width - 0.2} color={lighting.ledColor} intensity={lighting.ledIntensity * 0.8} y={height - 0.06} z={depth / 2 - 0.14} />
          <pointLight position={[0, height * 0.6, 0.05]} intensity={lighting.ledIntensity * 1.6} distance={2.2} decay={2} color={lighting.ledColor} />
        </>
      )}

      {/* درب‌ها */}
      {Array.from({ length: doors }).map((_, i) => {
        const x = -width / 2 + doorW * (i + 0.5);
        const front = i % 2 === 0;
        const z = depth / 2 + (front ? 0.014 : -0.008);
        const isOpen = openSet.has(i);
        if (w.sliding) {
          return (
            <SlidingDoor
              key={i}
              w={doorW - 0.006}
              h={height - 0.03}
              x={x}
              z={z}
              styleDef={styleDef}
              hex={doorHex}
              handleId={w.handle}
              handleFinish={w.handleFinish}
              open={isOpen}
              dir={i % 2 === 0 ? 1 : -1}
              mirror={w.mirror && i === doors - 1}
              onClick={() => toggle(i)}
            />
          );
        }
        return (
          <group key={i} position={[x, (height - 0.03) / 2, z]} onClick={(e) => { e.stopPropagation(); if (e.delta > 5) return; toggle(i); }}>
            <DoorLeaf
              w={doorW - 0.006}
              h={height - 0.03}
              styleDef={styleDef}
              hex={doorHex}
              handleId={w.handle}
              handleFinish={w.handleFinish}
              hinge={i % 2 === 0 ? "left" : "right"}
              open={isOpen ? 1 : 0}
              verticalHandle
              handleY={0}
            />
            {w.mirror && i === doors - 1 && <MirrorPane w={doorW - 0.14} h={height - 0.3} />}
          </group>
        );
      })}

      {/* پاخور */}
      <mesh position={[0, 0.03, depth / 2 - 0.06]}>
        <boxGeometry args={[width, 0.06, 0.016]} />
        <meshStandardMaterial color="#2a2b2e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Hanger({ x, y }) {
  return (
    <group position={[x, y, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.014, 0.003, 6, 16, Math.PI * 1.5]} />
        <meshStandardMaterial color="#9aa0a6" metalness={1} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.28, 0]} castShadow>
        <boxGeometry args={[0.34, 0.54, 0.03]} />
        <meshStandardMaterial color={["#3f5a72", "#7b5a45", "#4a5a4c", "#6b5470"][Math.floor(Math.abs(x * 7)) % 4]} roughness={0.9} />
      </mesh>
    </group>
  );
}
