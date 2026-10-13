import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// پیکربندی ساخت برای تست‌های SSR/هدلس (top-level await مجاز است)
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext", outDir: ".ssr-check", ssr: true },
  ssr: { noExternal: true },
});
