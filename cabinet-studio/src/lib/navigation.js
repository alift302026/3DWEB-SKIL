export const SHOWROOM_ROOM = { width: 5.4, depth: 4.8, height: 2.8 };
export const ISLAND = { x: 0.35, z: 0.45, width: 2.1, depth: 1.0 };
export const SIDE = { x: -2.4, z: -0.65, width: 1.8, depth: 0.58 };
export const WALK_START = [1.85, 1.62, 1.75];
export const BODY_RADIUS = 0.22;

export function showroomObstacles(room, units, mode = "kitchen") {
  if (mode === "wardrobe")
    return [
      { x0: -1.35, x1: 1.35, z0: -room.depth / 2, z1: -room.depth / 2 + 1.25 },
    ];
  const width = units.reduce((n, u) => n + u.width, 0);
  // Conservative allowance for open hinged doors and extended drawers.
  const open = units.some(
    (u) => u.open || Object.values(u.parts || {}).some(Boolean),
  );
  return [
    {
      x0: -width / 2,
      x1: width / 2,
      z0: -room.depth / 2,
      z1: -room.depth / 2 + 0.58 + (open ? 0.5 : 0),
    },
    {
      x0: ISLAND.x - ISLAND.width / 2,
      x1: ISLAND.x + ISLAND.width / 2,
      z0: ISLAND.z - ISLAND.depth / 2 - 0.42,
      z1: ISLAND.z + ISLAND.depth / 2,
    },
    {
      x0: -room.width / 2,
      x1: -room.width / 2 + SIDE.depth + 0.4,
      z0: SIDE.z - SIDE.width / 2,
      z1: SIDE.z + SIDE.width / 2,
    },
    // Stools along the island's visitor side.
    { x0: -0.55, x1: 1.25, z0: 1.12, z1: 1.7 },
  ];
}

export function canStand(x, z, room, obstacles, radius = BODY_RADIUS) {
  if (
    Math.abs(x) > room.width / 2 - radius ||
    Math.abs(z) > room.depth / 2 - radius
  )
    return false;
  return !obstacles.some(
    (b) =>
      x > b.x0 - radius &&
      x < b.x1 + radius &&
      z > b.z0 - radius &&
      z < b.z1 + radius,
  );
}

/** Substeps avoid tunnelling; separate axes let the visitor slide along cabinets. */
export function walkStep(position, dx, dz, room, obstacles) {
  let { x, z } = position;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.06));
  for (let i = 0; i < steps; i++) {
    if (canStand(x + dx / steps, z, room, obstacles)) x += dx / steps;
    if (canStand(x, z + dz / steps, room, obstacles)) z += dz / steps;
  }
  return { x, z };
}
