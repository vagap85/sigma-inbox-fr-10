import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'

/// <reference types="vitest" />

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx", "src/platform.d.ts"],
      exclude: [
        "src/app/App.tsx",
        "src/app/main.tsx",
        "src/mock/**",
        "src/scripts/**",
      ],
    }),
  ],
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: "@core/actions",
              replacement: fileURLToPath(
                new URL("./src/mock/actions.ts", import.meta.url),
              ),
            },
            {
              find: "@core/data",
              replacement: fileURLToPath(
                new URL("./src/mock/data.ts", import.meta.url),
              ),
            },
            {
              find: "@core/hive/react",
              replacement: fileURLToPath(
                new URL("./tests/mocks/core-hive-react.ts", import.meta.url),
              ),
            },
            {
              find: "@core/hive",
              replacement: fileURLToPath(
                new URL("./tests/mocks/core-hive.ts", import.meta.url),
              ),
            },
          ]
        : [],
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        public: fileURLToPath(new URL("./src/public.ts", import.meta.url)),
        "register-all": fileURLToPath(
          new URL("./src/register-all.ts", import.meta.url),
        ),
      },
      formats: ['es', 'cjs'],
      cssFileName: "style",
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rolldownOptions: {
      external: (id) =>
        ["react", "react-dom", "react/jsx-runtime"].includes(id) ||
        id.startsWith("@core/"),
    },
    sourcemap: true,
  },
  // Настройки Vitest
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    exclude: ['node_modules', 'dist'],
  },
}))