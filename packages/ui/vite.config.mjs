import { defineConfig } from "vite";
import postcssLit from "rollup-plugin-postcss-lit";
import path from "node:path";
import { rimrafSync } from "rimraf";
import dts from "vite-plugin-dts";

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
      formats: ["es"],
    },
    target: "esnext",
    rollupOptions: {
      external: [
        "lit",
        /^lit\/.*/,
        /^@lit\/.*/,
        /^@lit-labs\/.*/,
        "@open-wc/testing",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "components",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    postcssLit(),
    dts({
      entryRoot: "components",
      outDir: "dist",
      exclude: ["**/*.stories.ts", "**/__tests__/**"],
    }),
  ],
});
