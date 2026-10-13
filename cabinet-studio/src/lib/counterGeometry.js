import * as THREE from "three";

/**
 * هندسه صفحه کابینت: یک Shape برای هر قطعه صفحه + سوراخ‌های سینک و گاز.
 * خالص و قابل تست (بدون نیاز به WebGL).
 */

export function roundedRect(shape, x0, y0, x1, y1, r) {
  const rr = Math.max(0.001, Math.min(r, (x1 - x0) / 2 - 0.001, (y1 - y0) / 2 - 0.001));
  shape.moveTo(x0 + rr, y0);
  shape.lineTo(x1 - rr, y0);
  shape.quadraticCurveTo(x1, y0, x1, y0 + rr);
  shape.lineTo(x1, y1 - rr);
  shape.quadraticCurveTo(x1, y1, x1 - rr, y1);
  shape.lineTo(x0 + rr, y1);
  shape.quadraticCurveTo(x0, y1, x0, y1 - rr);
  shape.lineTo(x0, y0 + rr);
  shape.quadraticCurveTo(x0, y0, x0 + rr, y0);
  return shape;
}

/**
 * @param spans قطعات صفحه [{x0,x1}]
 * @param holes برش‌ها [{cx, cz, w, d, r}]
 * @param thickness ضخامت صفحه (متر)
 * @param depth عمق کابینت (متر)
 */
export function buildCounterGeometry(spans, holes, thickness, depth) {
  const parts = spans.map((s) => {
    const shape = new THREE.Shape();
    // شکل در صفحه XY ساخته می‌شود؛ بعداً با چرخش -۹۰ درجه حول X،
    // محور Y شکل به z− جهان نگاشت می‌شود و عمق اکسترود به y+ جهان.
    roundedRect(shape, s.x0 - 0.002, -(depth / 2 + 0.02), s.x1 + 0.002, depth / 2 - 0.01, 0.006);
    return { shape, x0: s.x0 - 0.002, x1: s.x1 + 0.002 };
  });

  for (const h of holes) {
    const target = parts.find((p) => h.cx >= p.x0 - 0.01 && h.cx <= p.x1 + 0.01);
    if (!target) continue;
    const hole = new THREE.Path();
    roundedRect(hole, h.cx - h.w / 2, -h.cz - h.d / 2, h.cx + h.w / 2, -h.cz + h.d / 2, h.r);
    target.shape.holes.push(hole);
  }

  if (!parts.length) return null;

  return new THREE.ExtrudeGeometry(
    parts.map((p) => p.shape),
    {
      depth: Math.max(0.008, thickness - 0.008),
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.005,
      bevelSegments: 2,
      curveSegments: 8,
    },
  );
}
