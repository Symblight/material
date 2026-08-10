---
name: build_dist_naming_quirk
description: vite build (preserveModules) collides a component's CSS ?inline chunk with the component's own JS filename, producing a "2.js" file and sometimes dropping the plain-name .d.ts
type: project
---

When a component's CSS file shares a basename with its JS file (the normal case: `foo.js` imports
`./foo.css?inline`), `rollup-plugin-postcss-lit` emits the compiled CSS as its own chunk named
after the CSS file (`foo.js`), which collides with the real component chunk also wanting to be
named `foo.js`. Rollup resolves the collision by suffixing the real component code as `foo2.js`
(confirmed in `dist/button/` → `button.js` + `button2.js`, `dist/avatar/` → `avatar.js` +
`avatar2.js`, and now `dist/segmented-button/` → `segmented-button.js` + `segmented-button2.js`,
`segmented-button-group.js` + `segmented-button-group2.js`). This is expected, not a build error.

**A separate, inconsistent side effect:** `vite-plugin-dts` sometimes fails to emit the plain-name
`.d.ts` for the colliding file. `dist/button/` has no `button.d.ts` at all (only
`base-button.d.ts`) even though `package.json`'s `"./button"` export claims
`"types": "./dist/button/button.d.ts"` — a pre-existing gap unrelated to any change I made.
`dist/tabs/` by contrast does get `tab.d.ts` / `tabs.d.ts` cleanly. `md-segmented-button` landed in
the `button`-like bucket (no plain `.d.ts`); `md-segmented-button-group` landed in the `tabs`-like
bucket (got one). Root cause not fully diagnosed — likely ordering/hash-dependent in the dts
plugin's collision handling.

**Why:** Discovered while verifying `pnpm build` after scaffolding `md-segmented-button` /
`md-segmented-button-group` (2026-08-08) — build succeeded and all files registered correctly, but
`dist/segmented-button/segmented-button.d.ts` was unexpectedly absent while
`segmented-button-group.d.ts` was present.

**How to apply:** Don't treat a missing plain-name `.d.ts` for a component whose CSS shares its
basename as a regression caused by your change — check whether `md-button` (the most central,
definitely-working component) exhibits the same gap before investigating further. Only worry about
it if you're specifically adding a `package.json` subpath export (like `"./segmented-button"`) that
points at the missing file — verify the actual `dist/` output before wiring a new subpath export,
don't assume the naming from other subpath exports transfers cleanly.
