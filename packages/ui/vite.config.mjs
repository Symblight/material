import { defineConfig } from "vite";
import postcssLit from "rollup-plugin-postcss-lit";
import path from "node:path";
import { rimrafSync } from "rimraf";

rimrafSync(path.resolve(import.meta.dirname, "./dist"));

export default defineConfig({
  esbuild: {
    target: "esnext",
    minifyIdentifiers: false,
  },
  build: {
    lib: {
      name: "wc-material",
      entry: "components/index.ts",
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ["es", "umd"],
    },
    target: "esnext",
    rollupOptions: {
      external: ["@open-wc/testing"],
      preserveModules: true,
    },
  },
  plugins: [postcssLit()],
});
