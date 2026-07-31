import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import litcss from "rollup-plugin-postcss-lit";
import babel from "vite-plugin-babel";

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
    babel({
      filter: /\.js$/,
      babelConfig: {
        babelrc: false,
        configFile: path.resolve(__dirname, "../babel.config.json"),
      },
    }),
  ],
});
