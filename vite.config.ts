/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/** Local stand-in for the Cloudflare Pages Function at functions/api/tutor.ts
 *  so `npm run dev` can talk to Claude. Reads ANTHROPIC_API_KEY from .env.local
 *  or the shell; the key never reaches the browser bundle. */
function tutorDevApi(apiKey: string | undefined): Plugin {
  return {
    name: "tomo-tutor-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/tutor", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const { handleTutor, TutorHandlerError } = await import("./server/tutor-handler");
        res.setHeader("content-type", "application/json");
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
          res.end(JSON.stringify(await handleTutor(body, apiKey)));
        } catch (err) {
          res.statusCode = err instanceof TutorHandlerError ? err.status : 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tutorDevApi(env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    test: {
      environment: "node",
      include: ["tests/**/*.test.ts"],
    },
  };
});
