import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 8080 },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // src/server.ts wraps the SSR entry with our error page.
    tanstackStart({ server: { entry: "server" } }),
    // Builds a plain Node server into .output/ (run with `npm start`).
    nitro({ preset: "node-server" }),
    viteReact(),
  ],
});
