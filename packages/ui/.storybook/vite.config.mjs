import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import litcss from "rollup-plugin-postcss-lit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  assetsInclude: ["/sb-preview/runtime.js"],
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
