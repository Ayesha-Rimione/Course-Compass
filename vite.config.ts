import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    nitro({
      preset: process.env.NITRO_PRESET || "vercel",
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ["**/*.csv", "**/*.xlsx", "**/*.db", "**/*.sqlite", "**/supabase/**"],
    },
  },
});
