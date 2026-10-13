import * as THREE from "three";
import { useMemo, useState } from "react";
import { useStudio } from "../store/useStudio.js";
import { C, computeLayout, computeCounter, isTall, drawerHeights } from "../lib/layout.js";
import { buildCounterGeometry } from "../lib/counterGeometry.js";
import { byId, DOOR_STYLES, DOOR_COLORS, COUNTERTOPS, BODY_COLORS } from "../data/catalog.js";
import { stoneTexture, woodTexture, noiseTexture } from "../lib/textures.js";
import { Carcase, DoorLeaf, Shelf, LedStrip, SelectionFrame } from "./parts.jsx";
import { Drawer } from "./Drawer.jsx";
import { Sink, Hob, Oven, Hood, Fridge, Dishwasher } from "./appliances.jsx";

/* ---------------- ابزارها ---------------- */

/* ---------------- کشو ---------------- */

/* ---------------- یک یونیت ---------------- */

function Unit({ it, k, lighting, doorHex, bodyHex, styleDef, selected, onSelect, onPart }) {
  const w = it.width - 0.004;
  const d = C.depth;
  const tall = isTall(it);
  const bodyH = tall ? C.tallH - C.toe : C.bodyH;
  const cy = C.toe + bodyH / 2;
  const [hover, setHover] = useState(false);

  const part = (key) => it.parts?.[key] ?? it.open;
  const clickPart = (key) => (e) => {
    e.stopPropagation();
    if (e.delta > 5) return;
    onPart(key);
  };
  const doorProps = {
    styleDef,
    hex: doorHex,
    handleId: k.handle,
    handleFinish: k.handleFinish,
    z: d / 2 + 0.001,
  };

  // لت‌های یونیت ایستاده باید در ارتفاع درست قرار بگیرند
  const positionedLeaves = () => {
    if (it.type === "tall") {
      const split = 1.45;
      const botH = split - C.toe - 0.006;
      const topH = C.tallH - split - 0.006;
      return (
        <>
          <group position={[0, C.toe + botH / 2, 0]}>
            <DoorLeaf {...doorProps} w={w - 0.006} h={botH} hinge="right" open={part("tall-bottom")} onClick={clickPart("tall-bottom")} verticalHandle />
          </group>
          <group position={[0, split + topH / 2, 0]}>
            <DoorLeaf {...doorProps} w={w - 0.006} h={topH} hinge="right" open={part("tall-top")} onClick={clickPart("tall-top")} verticalHandle />
          </group>
        </>
      );
    }
    if (it.type === "tall-oven") {
      const topH = C.tallH - 1.24 - 0.006;
      return (
        <group position={[0, 1.24 + topH / 2, 0]}>
          <DoorLeaf {...doorProps} w={w - 0.006} h={topH} hinge="right" open={part("oven-top")} onClick={clickPart("oven-top")} verticalHandle />
        </group>
      );
    }
    if (it.type === "door" || it.type === "sink") {
      return (
        <group position={[0, cy, 0]}>
          {it.double ? (
            <>
              <group position={[-w / 4, 0, 0]}>
                <DoorLeaf {...doorProps} w={w / 2 - C.gap * 2} h={bodyH - 0.01} hinge="left" open={part("base-left")} onClick={clickPart("base-left")} />
              </group>
              <group position={[w / 4, 0, 0]}>
                <DoorLeaf {...doorProps} w={w / 2 - C.gap * 2} h={bodyH - 0.01} hinge="right" open={part("base-right")} onClick={clickPart("base-right")} />
              </group>
            </>
          ) : (
            <DoorLeaf {...doorProps} w={w - 0.006} h={bodyH - 0.01} hinge="right" open={part("base-right")} onClick={clickPart("base-right")} />
          )}
        </group>
      );
    }
    if (it.type === "door-drawer") {
      const dh = 0.2;
      return (
        <group position={[0, C.toe + (bodyH - dh - 0.012) / 2, 0]}>
          <DoorLeaf {...doorProps} w={w - 0.006} h={bodyH - dh - 0.012} hinge="right" open={part("base-right")} onClick={clickPart("base-right")} />
        </group>
      );
    }
    return null;
  };

  return (
    <group
      position={[it.cx, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        if (typeof document !== "undefined") document.body.style.cursor = "auto";
      }}
    >
      {it.type !== "fridge" && (
        <group position={[0, cy, 0]}>
          <Carcase w={w} h={bodyH} d={d} hex={bodyHex} top={!tall} bottom />
        </group>
      )}

      {/* داخل یونیت */}
      {it.type === "open" && (
        <>
          {Array.from({ length: Math.max(1, it.shelf || 2) }).map((_, i, a) => (
            <Shelf key={i} w={w} d={d} y={C.toe + ((i + 1) * bodyH) / (a.length + 1)} hex={bodyHex} />
          ))}
          {lighting.interior && lighting.led && (
            <LedStrip w={w - 0.06} color={lighting.ledColor} intensity={lighting.ledIntensity * 0.5} y={C.toe + bodyH - 0.04} z={-d / 2 + 0.1} />
          )}
        </>
      )}
      {(it.type === "door" || it.type === "door-drawer" || it.type === "tall") && it.interiorLed && lighting.led && lighting.interior && (
        <LedStrip w={w - 0.1} color={lighting.ledColor} intensity={lighting.ledIntensity * 0.35} y={C.toe + bodyH - 0.05} z={-d / 2 + 0.12} />
      )}
      {(it.type === "door" || it.type === "door-drawer") && it.shelf > 0 && (
        <Shelf w={w} d={d} y={C.toe + bodyH * 0.52} hex={bodyHex} />
      )}

      {/* Each front is independent, including the three drawers. */}
      {positionedLeaves()}
      {(it.type === "drawers" || it.type === "hob") && (() => {
        const heights = drawerHeights(it.type === "hob" ? 2 : Math.max(1, it.drawers || 3), C.bodyH);
        let top = C.toe + C.bodyH;
        return heights.map((h, i) => {
          const y = top - h / 2;
          top -= h;
          const key = `drawer-${i}`;
          return <Drawer key={key} name={`${it.id}:${key}`} w={w - 0.006} h={h - C.gap} y={y} styleDef={styleDef} hex={doorHex} handleId={k.handle} handleFinish={k.handleFinish} open={part(key)} onClick={clickPart(key)} />;
        });
      })()}
      {(it.type === "door-drawer" || it.type === "tall-oven") && <Drawer name={`${it.id}:drawer-0`} w={w - 0.006} h={it.type === "tall-oven" ? 0.47 : 0.196} y={it.type === "tall-oven" ? 0.34 : C.toe + C.bodyH - 0.1} styleDef={styleDef} hex={doorHex} handleId={k.handle} handleFinish={k.handleFinish} open={part("drawer-0")} onClick={clickPart("drawer-0")} />}

      {/* لوازم */}
      {it.type === "sink" && <Sink w={Math.min(w - 0.12, it.double ? 0.78 : 0.46)} double={it.double} finish={k.applianceFinish} />}
      {it.type === "hob" && <Hob w={Math.min(w - 0.1, 0.62)} finish={k.applianceFinish} flame={lighting.hobFlame} />}
      {it.type === "tall-oven" && <Oven w={w - 0.02} finish={k.applianceFinish} doorHex={doorHex} />}
      {it.type === "dishwasher" && <Dishwasher w={w - 0.02} finish={k.applianceFinish} doorHex={doorHex} />}
      {it.type === "fridge" && <Fridge w={w} finish={k.applianceFinish} doorHex={doorHex} handleFinish={k.handleFinish} />}

      {hover && (
        <SelectionFrame
          w={w + 0.01}
          h={(tall ? C.tallH : C.workH) + 0.01}
          d={d + 0.02}
          y={(tall ? C.tallH : C.workH) / 2}
        />
      )}
    </group>
  );
}

/* ---------------- صفحه کابینت ---------------- */

function Countertop({ spans, holes, def, thickness }) {
  const geo = useMemo(() => buildCounterGeometry(spans, holes, thickness, C.depth), [spans, holes, thickness]);

  const map = useMemo(
    () =>
      def.kind === "wood"
        ? woodTexture(def.hex, "wood", [Math.max(1, spans.length), 1])
        : stoneTexture(def.hex, def.vein, def.kind === "solid" ? "solid" : def.id === "terrazzo" ? "terrazzo" : "marble", [Math.max(1, spans.length * 0.6), 0.6]),
    [def, spans.length],
  );
  const rough = useMemo(() => noiseTexture(11, [3, 1], 0.28), []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, C.workH - thickness + 0.004, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial
        map={map}
        roughnessMap={rough}
        roughness={def.roughness}
        metalness={def.kind === "wood" ? 0 : 0.05}
        clearcoat={def.kind === "wood" ? 0.2 : 0.45}
        clearcoatRoughness={0.18}
        envMapIntensity={1.15}
        color="#ffffff"
      />
    </mesh>
  );
}

/* ---------------- یونیت دیواری ---------------- */

function WallCabinet({ it, k, lighting, doorHex, bodyHex, styleDef, wallBottom, wallH, selected, onPart }) {
  const w = it.width - 0.004;
  const d = C.wallDepth;
  const z = -C.depth / 2 + d / 2;
  const cy = wallBottom + wallH / 2;

  if (it.meta.wall === "none") return null;

  if (it.meta.wall === "hood") {
    return (
      <group position={[it.cx, 0, 0]}>
        <Hood w={Math.min(w, 0.7)} finish={k.applianceFinish} light={lighting.led} ledColor={lighting.ledColor} />
      </group>
    );
  }

  if (it.meta.wall === "window") return null;

  const isOpen = it.parts?.wall ?? it.open;
  const click = (e) => { e.stopPropagation(); if (e.delta > 5) return; onPart("wall"); };

  return (
    <group position={[it.cx, 0, z]}>
      {it.meta.wall === "open" ? (
        <>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[(s * (w - 0.016)) / 2, cy, 0]} castShadow>
              <boxGeometry args={[0.016, wallH, d]} />
              <meshStandardMaterial color={bodyHex} roughness={0.6} />
            </mesh>
          ))}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, wallBottom + (i * wallH) / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, 0.018, d]} />
              <meshStandardMaterial color={bodyHex} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, cy, -d / 2 + 0.004]}>
            <boxGeometry args={[w, wallH, 0.006]} />
            <meshStandardMaterial color={bodyHex} roughness={0.7} />
          </mesh>
          {lighting.led && lighting.interior && (
            <LedStrip w={w - 0.1} color={lighting.ledColor} intensity={lighting.ledIntensity * 0.5} y={wallBottom + wallH - 0.03} z={-d / 2 + 0.08} />
          )}
        </>
      ) : (
        <>
          <group position={[0, cy, 0]}>
            <Carcase w={w} h={wallH} d={d} hex={bodyHex} />
          </group>
          {w >= 0.75 ? (
            <group position={[0, cy, d / 2 + 0.001]}>
              <DoorLeaf
                name={`${it.id}:wall`}
                w={w - 0.006}
                h={wallH - 0.008}
                styleDef={styleDef}
                hex={doorHex}
                handleId={k.handle}
                handleFinish={k.handleFinish}
                open={isOpen}
                liftUp
                handleY={-wallH / 2 + 0.1}
                onClick={click}
              />
            </group>
          ) : (
            <group position={[0, cy, d / 2 + 0.001]}>
              <DoorLeaf
                name={`${it.id}:wall`}
                w={w - 0.006}
                h={wallH - 0.008}
                styleDef={styleDef}
                hex={doorHex}
                handleId={k.handle}
                handleFinish={k.handleFinish}
                hinge="left"
                open={isOpen}
                handleY={-wallH / 2 + 0.1}
                onClick={click}
              />
            </group>
          )}
        </>
      )}
    </group>
  );
}

/** اسپات‌نور رو به پایین — هدف به‌عنوان فرزند نور اضافه می‌شود تا matrixWorld به‌روز بماند */
export function DownSpot({ position, intensity = 3, color = "#ffca87", distance = 2.6, angle = 0.85 }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <spotLight position={position} intensity={intensity} color={color} distance={distance} angle={angle} penumbra={0.9} decay={2}>
      <primitive object={target} position={[0, -1, 0.22]} />
    </spotLight>
  );
}

/* ---------------- آشپزخانه ---------------- */

export function Kitchen() {
  const units = useStudio((s) => s.units);
  const k = useStudio((s) => s.kitchen);
  const room = useStudio((s) => s.room);
  const lighting = useStudio((s) => s.lighting);
  const selected = useStudio((s) => s.ui.selected);
  const select = useStudio((s) => s.select);
  const togglePart = useStudio((s) => s.togglePart);

  const { items, width } = useMemo(() => computeLayout(units), [units]);
  const { spans, holes } = useMemo(() => computeCounter(items), [items]);

  const styleDef = byId(DOOR_STYLES, k.doorStyle);
  const doorHex = byId(DOOR_COLORS, k.doorColor).hex;
  const bodyHex = byId(BODY_COLORS, k.bodyColor).hex;
  const counterDef = byId(COUNTERTOPS, k.counter);
  const counterH = (k.counterH || 4) / 100;
  const wallBottom = C.workH + (k.wallGap || 55) / 100;
  const wallH = (k.wallH || 72) / 100;

  const runZ = -room.depth / 2 + C.depth / 2;
  const underLedSpans = useMemo(
    () => items.filter((i) => i.meta.wall === "door" || i.meta.wall === "open"),
    [items],
  );

  return (
    <group position={[-width / 2, 0, runZ]}>
      {/* پاخور */}
      <mesh position={[width / 2, C.toe / 2, C.depth / 2 - 0.07]} receiveShadow>
        <boxGeometry args={[width, C.toe, 0.016]} />
        <meshStandardMaterial color="#2a2b2e" roughness={0.8} />
      </mesh>

      {items.map((it) => (
        <Unit
          key={it.id}
          it={it}
          k={k}
          lighting={lighting}
          doorHex={doorHex}
          bodyHex={bodyHex}
          styleDef={styleDef}
          selected={selected === it.id}
          onSelect={() => select(it.id)}
          onPart={(key) => togglePart(it.id, key)}
        />
      ))}

      {/* صفحه کابینت */}
      {spans.length > 0 && <Countertop spans={spans} holes={holes} def={counterDef} thickness={counterH} />}

      {/* قرنیز پشت (بک‌اسپلش) */}
      {room.backsplash && spans.length > 0 && (
        <mesh position={[width / 2, C.workH + room.backsplashH / 2, -C.depth / 2 - 0.006]} receiveShadow>
          <boxGeometry args={[width + 0.01, room.backsplashH, 0.012]} />
          <meshPhysicalMaterial
            map={stoneTexture(counterDef.hex, counterDef.vein, counterDef.id === "terrazzo" ? "terrazzo" : "marble", [width * 0.5, 0.5])}
            roughness={Math.max(0.08, counterDef.roughness - 0.05)}
            clearcoat={0.6}
            clearcoatRoughness={0.12}
            envMapIntensity={1.2}
          />
        </mesh>
      )}

      {/* یونیت‌های دیواری */}
      {k.wallCabinets &&
        items.map((it) => (
          <WallCabinet
            key={`w-${it.id}`}
            it={it}
            k={k}
            lighting={lighting}
            doorHex={doorHex}
            bodyHex={bodyHex}
            styleDef={styleDef}
            wallBottom={wallBottom}
            wallH={wallH}
            selected={selected === it.id}
            onSelect={() => select(it.id)}
            onPart={(key) => togglePart(it.id, key)}
          />
        ))}

      {/* نور زیر یونیت دیواری */}
      {lighting.led &&
        underLedSpans.map((it) => (
          <group key={`led-${it.id}`} position={[it.cx, wallBottom + 0.012, -C.depth / 2 + C.wallDepth - 0.09]}>
            <LedStrip w={it.width - 0.08} color={lighting.ledColor} intensity={lighting.ledIntensity} />
          </group>
        ))}

      {/* نور مخفی زیر کابینت زمینی */}
      {lighting.led && lighting.underGlow && (
        <group position={[width / 2, 0.035, C.depth / 2 - 0.05]}>
          <LedStrip w={width - 0.1} color={lighting.ledColor} intensity={lighting.ledIntensity * 0.55} glow={1.8} />
        </group>
      )}

      {/* نور محیطی روی صفحه */}
      {lighting.led && (
        <>
          <DownSpot position={[width * 0.25, wallBottom - 0.05, -C.depth / 2 + 0.25]} intensity={lighting.ledIntensity * 5} color={lighting.ledColor} />
          <DownSpot position={[width * 0.75, wallBottom - 0.05, -C.depth / 2 + 0.25]} intensity={lighting.ledIntensity * 5} color={lighting.ledColor} />
        </>
      )}
    </group>
  );
}

export function RunDimension() {
  const units = useStudio((s) => s.units);
  const room = useStudio((s) => s.room);
  const { width } = useMemo(() => computeLayout(units), [units]);
  const y = C.workH + 0.35;
  const z = -room.depth / 2 + C.depth / 2;
  const c = useMemo(() => new THREE.Color("#5ad1ff"), []);
  return (
    <group position={[0, y, z]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, 0.002, 0.002]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * width) / 2, 0, 0]}>
          <boxGeometry args={[0.002, 0.08, 0.002]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
