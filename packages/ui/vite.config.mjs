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
    minifySyntax: true,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: "components/index.ts",
      external: [
        "lit",
        /^lit\/.*/,
        /^@lit\/.*/,
        /^@lit-labs\/.*/,
        /^@open-wc\/.*/,
      ],
      output: {
        format: "es",
        preserveModules: true,
        preserveModulesRoot: "components",
        entryFileNames: "[name].js",
        dir: "dist",
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
