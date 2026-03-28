# material-ui

A Material Design 3 component library built with Lit web components.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`packages/ui`](./packages/ui) | `@symblight/wc-material` | Material Design 3 web components |
| [`packages/colors`](./packages/colors) | `@symblight/md-colors` | Color token palette generator |

---

### `packages/ui` — `@symblight/wc-material`

Lit-based Material Design 3 web components with the `md-*` custom element prefix.

**Install**

```bash
npm install @symblight/wc-material lit
```

**Usage**

```js
import "@symblight/wc-material";
import "@symblight/wc-material/theme/theme.css";
```

```html
<md-button variant="filled">Click me</md-button>
```

**Available components:** `md-button`, `md-text-field`, `md-checkbox`, `md-radio-button`, `md-switch`, `md-select`, `md-dialog`, `md-chips`, `md-fab`, `md-icon-button`, `md-avatar`, `md-badge`, `md-card`, `md-progress-circular`, `md-progress-linear`, `md-icon`

---

### `packages/colors` — `@symblight/md-colors`

Generates Material Design 3 color token palettes as CSS custom properties in oklch format.

Two builds ship in the package:

| Build | Path | Use case |
|---|---|---|
| Node / bundler | `dist/index.js` | Programmatic API, CSS file generation |
| Browser client | `dist/client.js` | Runtime `window.generateTheme` injection |

**Install**

```bash
npm install @symblight/md-colors
```

**Node — programmatic API**

```js
import { generateTokens } from "@symblight/md-colors";

const tokens = generateTokens({ sourceColor: "#6750A4", scheme: "dark" });
// { "--md-sys-color-primary": "oklch(…)", … }
```

**Browser — runtime theming**

```html
<script src="node_modules/@symblight/md-colors/dist/client.js"></script>
<script>
  window.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
</script>
```

See [`packages/colors/README.md`](./packages/colors/README.md) for full API docs.

---

## Development

This is a pnpm monorepo.

```bash
pnpm install          # Install all dependencies
```

**Colors package**

```bash
cd packages/colors
pnpm build            # Build dist/index.js and dist/client.js
pnpm generate-theme   # Write colors.css
pnpm test             # Run Jest tests
```

**UI package**

```bash
cd packages/ui
pnpm build            # Build component library
pnpm sb               # Start Storybook dev server
```
