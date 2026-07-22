/** Build config for the shareable Math Lab-only bundle. See scripts/bundle-mathlab.mjs. */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    outDir: "dist-mathlab",
    sourcemap: false,
    rollupOptions: {
      input: fileURLToPath(new URL("./mathlab.html", import.meta.url)),
    },
  },
});
