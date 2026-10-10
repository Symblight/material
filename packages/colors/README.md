# @symblight/md-colors

Material Design 3 color token generator. Takes a source color and derives a full MD3 tonal palette, outputting `--md-sys-color-*` tokens in oklch format.

Built on [`@material/material-color-utilities`](https://github.com/material-foundation/material-color-utilities).

## Install

```bash
npm install @symblight/md-colors
```

## Builds

| Build | Entry | Format | Use case |
|---|---|---|---|
| Node / bundler | `dist/index.js` | ESM | `generateTokens`, `generateCSSFile` |
| Browser (bundler) | `dist/client.esm.js` | ESM | Vite, Storybook — named import |
| Browser (CJS) | `dist/client.cjs` | CJS | `require("@symblight/md-colors/client")` |
| Browser (script) | `dist/client.js` | IIFE | Plain `<script>` tag — `window.MdColors` |
| CLI | `dist/cli.js` | ESM | Terminal usage via `md-colors` |

---

## Node — programmatic API

```js
import { generateTokens, generateCSSFile } from "@symblight/md-colors";
```

### `generateTokens(config)`

Returns a token map — use it to apply tokens however you like. All 49 MD3
color roles are resolved from one tonal-spot scheme (the M3 default), including
`surface-container`, `surface-tint` and the `*-fixed` / `*-fixed-dim` /
`on-*-fixed` / `on-*-fixed-variant` roles. Missing config fields fall back to
their defaults; an invalid `sourceColor` or `scheme` throws a `TypeError`.

```js
const tokens = generateTokens({ sourceColor: "#6750A4", scheme: "dark" });
// { "--md-sys-color-primary": "oklch(…)", … }
```

| Param | Type | Default | Description |
|---|---|---|---|
| `config.sourceColor` | `string` | `"#1D5D78"` | Seed color as a hex string |
| `config.scheme` | `"light" \| "dark"` | `"light"` | Color scheme variant |

### `generateCSSFile(config)`

Writes a `colors.css` file with `:root`-scoped tokens. Returns a promise that
resolves with the absolute output path and rejects if the write fails.

```js
await generateCSSFile({
  sourceColor: "#6750A4",
  scheme: "dark",
  output: "./theme/colors.css",
});
```

| Param | Type | Default | Description |
|---|---|---|---|
| `config.sourceColor` | `string` | `"#1D5D78"` | Seed color as a hex string |
| `config.scheme` | `"light" \| "dark"` | `"light"` | Color scheme variant |
| `config.output` | `string` | `./colors.css` (next to module) | Output file path |

Output:

```css
:root {
  --md-sys-color-primary: oklch(...);
  --md-sys-color-on-primary: oklch(...);
  --md-sys-color-surface-container-highest: oklch(...);
  /* …all MD3 system color tokens */
}
```

---

## Browser client — runtime theming

Import `generateTheme` and call it directly — no globals, no window assignment.

### Named import (Vite, Storybook, bundler)

```js
import { generateTheme } from "@symblight/md-colors/client";

generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
```

### Via `<script>` tag (no bundler)

```html
<script type="module">
  import { generateTheme } from "./node_modules/@symblight/md-colors/dist/client.esm.js";
  generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
</script>
```

Or with the self-contained IIFE build:

```html
<script src="node_modules/@symblight/md-colors/dist/client.js"></script>
<script>
  MdColors.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
</script>
```

### `generateTheme(options)`

| Param | Type | Default | Description |
|---|---|---|---|
| `options.sourceColor` | `string` | `"#1D5D78"` | Seed color as a hex string |
| `options.scheme` | `"light" \| "dark"` | `"light"` | Color scheme variant |

Sets every `--md-sys-color-*` variable on `document.documentElement` via `style.setProperty`.

---

## CLI

```bash
# npx (no install)
npx md-colors --sourceColor="#6750A4" --scheme=dark --output=./theme/colors.css

# global install
npm install -g @symblight/md-colors
md-colors --sourceColor="#6750A4" --scheme=light --output=./colors.css
```

### Options

| Flag | Short | Default | Description |
|---|---|---|---|
| `--sourceColor` | `-c` | `#1D5D78` | Seed color as a hex string |
| `--scheme` | `-s` | `light` | `light` or `dark` |
| `--output` | `-o` | `./colors.css` | Output file path |

Exits with code 1 on an invalid color, invalid scheme or failed write.

---

## Development

```bash
pnpm build            # Build all dist outputs
pnpm generate-theme   # Write colors.css via CLI (uses defaults)
pnpm test             # Run Jest tests
```

## License

[MIT](./LICENSE) © Aleksei Tkachenko
