import * as THREE from "three";

/**
 * بافت‌های رویه‌ای (procedural) — بدون هیچ فایل خارجی.
 * همه بافت‌ها با canvas ساخته و کش می‌شوند تا سربار GPU حافظه‌ای نداشته باشیم.
 */

const cache = new Map();
const memo = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
};

const mk = (size) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")];
};

const toTex = (canvas, { srgb = true, repeat = [1, 1] } = {}) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
};

const shade = (hex, amt) => {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amt)));
  return `#${c.getHexString()}`;
};

const rnd = (seed) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/* ---------------- چوب / پارکت ---------------- */
export function woodTexture(hex, kind = "plank", repeat = [3, 3]) {
  return memo(`wood-${hex}-${kind}-${repeat}`, () => {
    const S = 1024;
    const [c, g] = mk(S);
    const rand = rnd(hex.length * 7919 + hex.charCodeAt(1) * 131);
    g.fillStyle = hex;
    g.fillRect(0, 0, S, S);

    if (kind === "wood") {
      // رگه‌های چوب یکدست (برای بدنه/درب چوبی)
      for (let i = 0; i < 220; i++) {
        const y = rand() * S;
        g.strokeStyle = shade(hex, (rand() - 0.5) * 0.14);
        g.globalAlpha = 0.12 + rand() * 0.22;
        g.lineWidth = 0.6 + rand() * 2.6;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x * 0.008 + i) * 6 * rand());
        g.stroke();
      }
      g.globalAlpha = 1;
      return toTex(c, { repeat });
    }

    // پارکت: تخته‌های افقی با درز و گره
    const rows = 8;
    const rh = S / rows;
    for (let r = 0; r < rows; r++) {
      const y0 = r * rh;
      let x = -rand() * 300;
      while (x < S) {
        const len = 240 + rand() * 380;
        const base = shade(hex, (rand() - 0.5) * 0.13);
        g.fillStyle = base;
        g.fillRect(x, y0, len, rh);
        for (let i = 0; i < 26; i++) {
          const gy = y0 + rand() * rh;
          g.strokeStyle = shade(base, (rand() - 0.5) * 0.16);
          g.globalAlpha = 0.1 + rand() * 0.25;
          g.lineWidth = 0.5 + rand() * 1.8;
          g.beginPath();
          g.moveTo(x, gy);
          for (let px = x; px <= x + len; px += 26) g.lineTo(px, gy + Math.sin(px * 0.02 + i) * 2.4);
          g.stroke();
        }
        g.globalAlpha = 1;
        // درز طولی
        g.fillStyle = "rgba(0,0,0,0.28)";
        g.fillRect(x, y0 + rh - 2, len, 2);
        // درز عرضی
        g.fillRect(x + len - 2, y0, 2, rh);
        if (rand() > 0.86) {
          const kx = x + rand() * len;
          const ky = y0 + rand() * rh;
          const rad = 3 + rand() * 7;
          const grad = g.createRadialGradient(kx, ky, 0, kx, ky, rad);
          grad.addColorStop(0, "rgba(40,22,10,0.55)");
          grad.addColorStop(1, "rgba(40,22,10,0)");
          g.fillStyle = grad;
          g.beginPath();
          g.arc(kx, ky, rad, 0, Math.PI * 2);
          g.fill();
        }
        x += len;
      }
    }
    return toTex(c, { repeat });
  });
}

/* ---------------- سنگ / کوارتز / بتن ---------------- */
export function stoneTexture(hex, vein = "#b8b3aa", kind = "marble", repeat = [1, 1]) {
  return memo(`stone-${hex}-${vein}-${kind}-${repeat}`, () => {
    const S = 1024;
    const [c, g] = mk(S);
    const rand = rnd(hex.length * 104729 + vein.charCodeAt(1));
    g.fillStyle = hex;
    g.fillRect(0, 0, S, S);

    if (kind === "solid") {
      for (let i = 0; i < 900; i++) {
        const x = rand() * S;
        const y = rand() * S;
        const r = 6 + rand() * 60;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        const d = (rand() - 0.5) * 0.12;
        grad.addColorStop(0, `rgba(${d > 0 ? 255 : 0},${d > 0 ? 255 : 0},${d > 0 ? 255 : 0},${Math.abs(d) * 2})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      return toTex(c, { repeat });
    }

    if (kind === "terrazzo") {
      const chips = ["#9fa79f", "#c7a58a", "#7f8a86", "#e8e4da", "#5d5f5c"];
      for (let i = 0; i < 900; i++) {
        g.fillStyle = chips[Math.floor(rand() * chips.length)];
        g.globalAlpha = 0.35 + rand() * 0.5;
        g.beginPath();
        const x = rand() * S;
        const y = rand() * S;
        const r = 3 + rand() * 12;
        g.ellipse(x, y, r, r * (0.5 + rand() * 0.7), rand() * 3, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      return toTex(c, { repeat });
    }

    // رگه‌های سنگ طبیعی
    const veins = kind === "wood" ? 60 : 16;
    for (let i = 0; i < veins; i++) {
      const y = rand() * S;
      g.strokeStyle = shade(vein, (rand() - 0.5) * 0.2);
      g.globalAlpha = 0.1 + rand() * 0.35;
      g.lineWidth = 1 + rand() * 9;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(-20, y);
      let cy = y;
      for (let x = 0; x <= S + 40; x += 40) {
        cy += (rand() - 0.5) * 60;
        g.lineTo(x, cy);
      }
      g.stroke();
      // هاله نرم اطراف رگه
      g.globalAlpha *= 0.35;
      g.lineWidth *= 3.2;
      g.stroke();
      g.lineWidth /= 3.2;
      g.globalAlpha /= 0.35;
    }
    g.globalAlpha = 1;
    // برفک ریز
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
      g.fillRect(rand() * S, rand() * S, 2, 2);
    }
    return toTex(c, { repeat });
  });
}

/* ---------------- سرامیک / کاشی ---------------- */
export function tileTexture(hex, repeat = [6, 3]) {
  return memo(`tile-${hex}-${repeat}`, () => {
    const S = 1024;
    const [c, g] = mk(S);
    const rand = rnd(4242);
    g.fillStyle = shade(hex, -0.18);
    g.fillRect(0, 0, S, S);
    const tw = 256;
    const th = 128;
    for (let r = 0; r < S / th; r++) {
      const off = r % 2 ? tw / 2 : 0;
      for (let x = -tw; x < S + tw; x += tw) {
        const px = x + off;
        const py = r * th;
        g.fillStyle = shade(hex, (rand() - 0.5) * 0.05);
        g.fillRect(px + 3, py + 3, tw - 6, th - 6);
        const grad = g.createLinearGradient(px, py, px + tw, py + th);
        grad.addColorStop(0, "rgba(255,255,255,0.10)");
        grad.addColorStop(0.6, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.07)");
        g.fillStyle = grad;
        g.fillRect(px + 3, py + 3, tw - 6, th - 6);
      }
    }
    return toTex(c, { repeat });
  });
}

/* ---------------- نویز برای زبری / برجستگی ---------------- */
export function noiseTexture(seed = 7, repeat = [4, 4], contrast = 0.5) {
  return memo(`noise-${seed}-${repeat}-${contrast}`, () => {
    const S = 512;
    const [c, g] = mk(S);
    const rand = rnd(seed * 7717);
    const img = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) {
      const v = 128 + (rand() - 0.5) * 255 * contrast;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // کمی نرمش
    g.globalAlpha = 0.5;
    g.filter = "blur(1.2px)";
    g.drawImage(c, 0, 0);
    g.filter = "none";
    g.globalAlpha = 1;
    return toTex(c, { srgb: false, repeat });
  });
}

/* ---------------- استیل خش‌دار ---------------- */
export function brushedRoughness(repeat = [2, 2]) {
  return memo(`brushed-${repeat}`, () => {
    const S = 512;
    const [c, g] = mk(S);
    const rand = rnd(99);
    g.fillStyle = "#7a7a7a";
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      const y = rand() * S;
      g.strokeStyle = rand() > 0.5 ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)";
      g.lineWidth = 0.6 + rand();
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(S, y + (rand() - 0.5) * 3);
      g.stroke();
    }
    return toTex(c, { srgb: false, repeat });
  });
}

/* ---------------- پارچه / قالین (برای گرم کردن فضا) ---------------- */
export function fabricTexture(hex, repeat = [2, 2]) {
  return memo(`fabric-${hex}-${repeat}`, () => {
    const S = 256;
    const [c, g] = mk(S);
    g.fillStyle = hex;
    g.fillRect(0, 0, S, S);
    const rand = rnd(31);
    for (let i = 0; i < S; i += 3) {
      g.fillStyle = "rgba(255,255,255,0.05)";
      g.fillRect(i, 0, 1, S);
      g.fillStyle = "rgba(0,0,0,0.05)";
      g.fillRect(0, i, S, 1);
    }
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
      g.fillRect(rand() * S, rand() * S, 2, 2);
    }
    return toTex(c, { repeat });
  });
}
