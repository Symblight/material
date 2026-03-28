# material-ui

A Material Design 3 component library built with Lit web components.

## Packages

| Package | Description |
|---------|-------------|
| [`packages/ui`](./packages/ui) | Material Design 3 web components (`@symblight/wc-material`) |
| [`packages/colors`](./packages/colors) | Color token palette generator (`@symblight/md-colors`) |

---

### `packages/ui` — `@symblight/wc-material`

Lit-based Material Design 3 web components with the `md-*` custom element prefix.

**Install**

```bash
npm install @symblight/wc-material lit
```

**Usage**

```js
import '@symblight/wc-material';
import '@symblight/wc-material/theme/theme.css';
```

```html
<md-button variant="filled">Click me</md-button>
```

**Available components:** `md-button`, `md-text-field`, `md-checkbox`, `md-radio-button`, `md-switch`, `md-select`, `md-dialog`, `md-chips`, `md-fab`, `md-icon-button`, `md-avatar`, `md-badge`, `md-card`, `md-progress-circular`, `md-progress-linear`, `md-icon`

---

### `packages/colors` — `@symblight/md-colors`

Generates Material Design 3 color token palettes as CSS custom properties.

Takes a source color and uses `@material/material-color-utilities` to derive a full MD3 tonal palette, then outputs `--md-sys-color-*` tokens in oklch format.

**Install**

```bash
npm install @symblight/md-colors
```

**Generate a CSS file**

Run the following to write a `colors.css` file to the package directory:

```bash
pnpm generate-theme
```

This generates `colors.css` with `:root` scoped CSS custom properties:

```css
:root {
  --md-sys-color-primary: oklch(...);
  --md-sys-color-on-primary: oklch(...);
  --md-sys-color-primary-container: oklch(...);
  /* ...all MD3 system color tokens */
}
```

The source color and scheme (`light` / `dark`) are configured directly in `create-theme-file.mjs`. The generated `colors.css` is consumed by the `ui` package theme.

**Programmatic API**

```js
import { generateTokens } from "@symblight/md-colors";

const tokens = generateTokens({ sourceColor: "#6750A4", scheme: "dark" });
// { "--md-sys-color-primary": "oklch(…)", … }
```

**Browser (runtime theming)**

The `client.mjs` entry exposes `window.generateTheme`, which applies tokens directly to `:root` at runtime:

```html
<script type="module" src="node_modules/@symblight/md-colors/client.mjs"></script>
<script>
  window.generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
</script>
```

## Development

This is a pnpm monorepo.

```bash
pnpm install        # Install all dependencies
```

See each package's `README.md` for package-specific commands.
