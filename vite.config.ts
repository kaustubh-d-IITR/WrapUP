import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// TanStack Start + Nitro Configuration for Vercel Deployment
// The nitro() plugin is REQUIRED for production deployment.
// Without it, only a raw dist/server/server.js is produced (Cloudflare-style fetch handler).
// With it, Nitro detects the VERCEL=1 env var on Vercel's build servers and
// automatically generates .vercel/output/ with serverless functions + routing config.

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    nitro({
      // On Vercel, Nitro auto-detects and uses the "vercel" preset.
      // Locally, this defaults to "node-server" which is fine for dev/preview.
    }),
    react()
  ],
  server: {
    port: 8080,
  }
});
