/**
 * حداقل تقلید از canvas تا بافت‌های رویه‌ای (procedural) در Node ساخته شوند.
 */
const gradient = () => ({ addColorStop() {} });

const ctxStub = () => {
  const noop = () => {};
  return new Proxy(
    {
      canvas: null,
      createLinearGradient: gradient,
      createRadialGradient: gradient,
      createPattern: () => null,
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
      getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
      measureText: () => ({ width: 10 }),
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return noop;
      },
      set() {
        return true;
      },
    },
  );
};

export function installCanvasStub() {
  if (globalThis.document) return;
  globalThis.document = {
    createElement(tag) {
      if (String(tag).toLowerCase() !== "canvas") return { style: {}, appendChild() {} };
      const ctx = ctxStub();
      const canvas = {
        width: 0,
        height: 0,
        style: {},
        nodeName: "CANVAS",
        getContext: () => ctx,
        addEventListener() {},
        removeEventListener() {},
        toDataURL: () => "data:,",
      };
      ctx.canvas = canvas;
      return canvas;
    },
    createElementNS(ns, tag) {
      return this.createElement(tag);
    },
    addEventListener() {},
    removeEventListener() {},
    body: { appendChild() {}, removeChild() {}, style: {} },
    documentElement: { style: {} },
  };
  globalThis.window = globalThis.window || {
    addEventListener() {},
    removeEventListener() {},
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 800,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  };
  globalThis.HTMLCanvasElement = class {};
  globalThis.self = globalThis;
}
