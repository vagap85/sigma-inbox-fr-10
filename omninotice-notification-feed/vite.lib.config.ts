import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        "register-all": "src/register-all.ts",
      },
      formats: ["es", "cjs"],
      cssFileName: "style",
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: (id) =>
        ["react", "react-dom", "react/jsx-runtime"].includes(id) ||
        id.startsWith("@core/"),
    },
  },
});