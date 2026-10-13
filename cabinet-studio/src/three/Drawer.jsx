import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoorLeaf } from "./parts.jsx";

/** Complete drawer box; the closed face stays on the cabinet front plane. */
export function Drawer({
  w,
  h,
  y,
  z = 0.291,
  depth = 0.46,
  styleDef,
  hex,
  handleId,
  handleFinish,
  open,
  onClick,
  name,
}) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) {
      const target = z + (open ? 0.36 : 0);
      ref.current.position.z +=
        (target - ref.current.position.z) * (1 - Math.exp(-10 * dt));
    }
  });
  const boxH = Math.max(0.07, h - 0.05);
  return (
    <group ref={ref} name={name} position={[0, y, z]}>
      <DoorLeaf
        name={name ? `${name}:front` : undefined}
        w={w}
        h={h}
        styleDef={styleDef}
        hex={hex}
        handleId={handleId}
        handleFinish={handleFinish}
        handleY={0}
        onClick={onClick}
      />
      <group position={[0, -h / 2 + 0.022, -depth / 2 - 0.016]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w - 0.04, 0.012, depth]} />
          <meshStandardMaterial color="#d2c6b2" roughness={0.65} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * (w / 2 - 0.025), boxH / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.012, boxH, depth]} />
            <meshStandardMaterial
              color="#a9aaab"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        ))}
        <mesh position={[0, boxH / 2, -depth / 2]} castShadow>
          <boxGeometry args={[w - 0.04, boxH, 0.012]} />
          <meshStandardMaterial color="#d2c6b2" roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
}
