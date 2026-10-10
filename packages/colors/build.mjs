import * as esbuild from "esbuild";

// Node / bundler — generateTokens, setSchemeProperties, generateCSSFile
await esbuild.build({
  entryPoints: ["index.mjs"],
  bundle: true,
  format: "esm",
  platform: "node",
  external: ["@material/material-color-utilities", "culori"],
  outfile: "dist/index.js",
  sourcemap: true,
});

// Browser client — IIFE for plain <script> tags (self-contained, minified),
// exposed as `window.MdColors`
await esbuild.build({
  entryPoints: ["client.mjs"],
  bundle: true,
  format: "iife",
  globalName: "MdColors",
  platform: "browser",
  outfile: "dist/client.js",
  minify: true,
  sourcemap: true,
});

// Browser client — ESM for Vite / bundlers (e.g. Storybook)
await esbuild.build({
  entryPoints: ["client.mjs"],
  bundle: true,
  format: "esm",
  platform: "browser",
  outfile: "dist/client.esm.js",
  sourcemap: true,
});

// Browser client — CJS for require() (self-contained)
await esbuild.build({
  entryPoints: ["client.mjs"],
  bundle: true,
  format: "cjs",
  platform: "browser",
  outfile: "dist/client.cjs",
  sourcemap: true,
});

// CLI — Node ESM bundle; esbuild keeps the shebang from cli.mjs
await esbuild.build({
  entryPoints: ["cli.mjs"],
  bundle: true,
  format: "esm",
  platform: "node",
  external: ["@material/material-color-utilities", "culori"],
  outfile: "dist/cli.js",
});

console.log("Build complete → dist/index.js, dist/client.js, dist/client.esm.js, dist/client.cjs, dist/cli.js");
