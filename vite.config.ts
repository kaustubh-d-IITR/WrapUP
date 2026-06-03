import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Standard Vite + TanStack Start Configuration
// We've removed @lovable.dev/vite-tanstack-config to prevent Nitro from 
// hardcoding the Cloudflare Workers preset, which was causing Vercel to return 404.
// By using the native tanstackStart plugin, Nitro will correctly auto-detect Vercel.

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react()
  ],
  server: {
    port: 8080,
  }
});
