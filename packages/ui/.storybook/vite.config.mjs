import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import litcss from "rollup-plugin-postcss-lit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const colorsRoot = path.resolve(__dirname, "../../colors");

export default defineConfig({
  assetsInclude: ["/sb-preview/runtime.js"],
  resolve: {
    alias: {
      // Resolve from source during Storybook dev — no rebuild of md-colors needed
      "@symblight/md-colors/client": path.join(colorsRoot, "client.mjs"),
      "@symblight/md-colors": path.join(colorsRoot, "tokens.mjs"),
    },
  },
  esbuild: {
    target: "esnext",
    supported: {
      decorators: false,
    },
  },
  plugins: [
    litcss({
      include: [path.join(__dirname, "../components/**/*.css?*")],
    }),
  ],
});
