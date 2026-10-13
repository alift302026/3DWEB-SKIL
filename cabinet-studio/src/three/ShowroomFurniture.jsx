import { useMemo } from "react";
import { useStudio } from "../store/useStudio.js";
import {
  byId,
  DOOR_COLORS,
  DOOR_STYLES,
  BODY_COLORS,
  COUNTERTOPS,
} from "../data/catalog.js";
import { stoneTexture, woodTexture } from "../lib/textures.js";
import { Carcase, DoorLeaf, LedStrip, Shelf } from "./parts.jsx";
import { Drawer } from "./Drawer.jsx";
import { ISLAND, SIDE } from "../lib/navigation.js";

function Block({ size, position, color, map, roughness = 0.5, metalness = 0 }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color || "#ffffff"}
        map={map}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

export function ShowroomFurniture() {
  const k = useStudio((s) => s.kitchen);
  const lighting = useStudio((s) => s.lighting);
  const parts = useStudio((s) => s.ui.fixtureParts || {});
  const setUI = useStudio((s) => s.setUI);
  const styleDef = byId(DOOR_STYLES, k.doorStyle);
  const hex = byId(DOOR_COLORS, k.doorColor).hex;
  const body = byId(BODY_COLORS, k.bodyColor).hex;
  const counter = byId(COUNTERTOPS, k.counter);
  const map = useMemo(
    () =>
      counter.kind === "wood"
        ? woodTexture(counter.hex, "wood", [1.5, 1])
        : stoneTexture(
            counter.hex,
            counter.vein,
            counter.kind === "solid" ? "solid" : "marble",
            [1.5, 1],
          ),
    [counter],
  );
  const oak = useMemo(() => woodTexture("#a88459", "wood", [2, 1]), []);
  const toggle = (key) => (e) => {
    e.stopPropagation();
    if (e.delta > 5) return;
    const current = useStudio.getState().ui.fixtureParts || {};
    setUI({ fixtureParts: { ...current, [key]: !current[key] } });
  };
  const doorProps = {
    styleDef,
    hex,
    handleId: k.handle,
    handleFinish: k.handleFinish,
  };
  return (
    <group>
      <group position={[ISLAND.x, 0, ISLAND.z]} rotation={[0, Math.PI, 0]}>
        {[-0.525, 0.525].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <group position={[0, 0.48, 0]}>
              <Carcase w={1.04} h={0.76} d={ISLAND.depth} hex={body} />
            </group>
            {i === 0 ? (
              [0, 1, 2].map((n) => (
                <Drawer
                  key={n}
                  name={`island:drawer-${n}`}
                  {...doorProps}
                  w={1.032}
                  h={0.248}
                  y={0.86 - (n + 0.5) * 0.253}
                  z={0.502}
                  depth={0.7}
                  open={parts[`island-${n}`]}
                  onClick={toggle(`island-${n}`)}
                />
              ))
            ) : (
              <group position={[0, 0.48, 0]}>
                <Shelf w={1.04} d={0.9} y={0} hex={body} />
                {[-1, 1].map((side) => (
                  <group key={side} position={[side * 0.26, 0, 0]}>
                    <DoorLeaf
                      {...doorProps}
                      w={0.512}
                      h={0.748}
                      z={0.502}
                      hinge={side < 0 ? "left" : "right"}
                      open={parts[`island-door-${side}`]}
                      onClick={toggle(`island-door-${side}`)}
                    />
                  </group>
                ))}
              </group>
            )}
          </group>
        ))}
        <Block
          size={[2.16, 0.04, 1.08]}
          position={[0, 0.88, 0]}
          map={map}
          roughness={counter.roughness}
        />
        {[-1, 1].map((side) => (
          <Block
            key={side}
            size={[0.04, 0.88, 1.08]}
            position={[side * 1.06, 0.44, 0]}
            map={map}
            roughness={counter.roughness}
          />
        ))}
        <Block
          size={[2.04, 0.75, 0.02]}
          position={[0, 0.475, -0.51]}
          map={oak}
        />
        {Array.from({ length: 38 }, (_, i) => (
          <Block
            key={i}
            size={[0.018, 0.74, 0.02]}
            position={[-0.99 + i * 0.054, 0.48, -0.528]}
            color="#886a49"
          />
        ))}
        {lighting.led && (
          <LedStrip
            w={2.02}
            color={lighting.ledColor}
            intensity={lighting.ledIntensity * 0.5}
            y={0.85}
            z={-0.54}
          />
        )}
        <Block
          size={[1.6, 0.025, 0.05]}
          position={[0, 2.24, 0]}
          color="#a18a64"
          metalness={0.8}
          roughness={0.25}
        />
        {[-0.62, 0.62].map((x) => (
          <Block
            key={x}
            size={[0.008, 0.55, 0.008]}
            position={[x, 2.52, 0]}
            color="#2d2c28"
          />
        ))}
        {lighting.led && (
          <LedStrip
            w={1.55}
            color={lighting.ledColor}
            intensity={lighting.ledIntensity * 0.4}
            y={2.22}
            z={0}
          />
        )}
      </group>
      <group position={[SIDE.x, 0, SIDE.z]} rotation={[0, Math.PI / 2, 0]}>
        {[-0.45, 0.45].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <group position={[0, 0.48, 0]}>
              <Carcase w={0.89} h={0.76} d={0.58} hex={body} />
            </group>
            <Shelf w={0.89} d={0.54} y={0.47} hex={body} />
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.222, 0.48, 0]}>
                <DoorLeaf
                  {...doorProps}
                  w={0.438}
                  h={0.75}
                  z={0.291}
                  hinge={side < 0 ? "left" : "right"}
                  open={parts[`side-${i}-${side}`]}
                  onClick={toggle(`side-${i}-${side}`)}
                />
              </group>
            ))}
          </group>
        ))}
        <Block
          size={[1.84, 0.04, 0.62]}
          position={[0, 0.88, 0.015]}
          map={map}
          roughness={counter.roughness}
        />
        <Block
          size={[1.8, 0.08, 0.04]}
          position={[0, 0.04, 0.23]}
          color="#2b2a27"
        />
      </group>
      {[-0.18, 0.75].map((x) => (
        <group key={x} position={[x, 0, 1.4]}>
          <Block
            size={[0.44, 0.09, 0.4]}
            position={[0, 0.68, 0]}
            color="#383833"
          />
          <Block
            size={[0.44, 0.35, 0.06]}
            position={[0, 0.87, 0.18]}
            color="#383833"
          />
          {[-1, 1].flatMap((a) =>
            [-1, 1].map((b) => (
              <Block
                key={`${a}${b}`}
                size={[0.024, 0.64, 0.024]}
                position={[a * 0.16, 0.32, b * 0.15]}
                color="#252522"
                metalness={0.7}
              />
            )),
          )}
          <Block
            size={[0.34, 0.018, 0.018]}
            position={[0, 0.23, -0.15]}
            color="#252522"
            metalness={0.7}
          />
        </group>
      ))}
    </group>
  );
}
