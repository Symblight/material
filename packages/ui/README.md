# @symblight/wc-material

Material Design 3 web components built with [Lit](https://lit.dev/).

> **Work in progress** — this package is not production ready and is actively being developed. APIs may change without notice.

## Installation

```bash
npm install @symblight/wc-material lit
# or
pnpm add @symblight/wc-material lit
```

> `lit` is a peer dependency and must be installed alongside this package.

## Usage

### Import all components

```js
import "@symblight/wc-material";
import "@symblight/wc-material/theme/theme.css";
```

### Import individual components (recommended)

Only load what you need — each component is a separate entry point:

```js
import "@symblight/wc-material/button";
import "@symblight/wc-material/checkbox";
import "@symblight/wc-material/text-field";
```

### Available imports

| Name                | Import path                                | Components                                                                        | Docs                                               |
| ------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| Avatar              | `@symblight/wc-material/avatar`            | `<md-avatar>`                                                                     | [README](./components/avatar/README.md)            |
| Badge               | `@symblight/wc-material/badge`             | `<md-badge>`                                                                      | [README](./components/badge/README.md)             |
| Button              | `@symblight/wc-material/button`            | `<md-button>`                                                                     | [README](./components/button/README.md)            |
| Card                | `@symblight/wc-material/card`              | `<md-card>`                                                                       | [README](./components/card/README.md)              |
| Checkbox            | `@symblight/wc-material/checkbox`          | `<md-checkbox>`                                                                   | [README](./components/checkbox/README.md)          |
| Chips               | `@symblight/wc-material/chips`             | `<md-assist-chip>`, `<md-filter-chip>`, `<md-input-chip>`, `<md-suggestion-chip>` | [README](./components/chips/README.md)             |
| Dialog              | `@symblight/wc-material/dialog`            | `<md-dialog>`                                                                     | [README](./components/dialog/README.md)            |
| FAB                 | `@symblight/wc-material/fab`               | `<md-fab>`                                                                        | [README](./components/fab/README.md)               |
| Icon                | `@symblight/wc-material/icon`              | `<md-icon>`                                                                       | [README](./components/icon/README.md)              |
| Icon Button         | `@symblight/wc-material/icon-button`       | `<md-icon-button>`                                                                | [README](./components/icon-button/README.md)       |
| List                | `@symblight/wc-material/list`              | `<md-list>`, `<md-list-item>`                                                     | [README](./components/list/README.md)              |
| Menu                | `@symblight/wc-material/menu`              | `<md-menu>`, `<md-menu-item>`, `<md-menu-group>`, `<md-item-group>`               | [README](./components/menu/README.md)              |
| Progress (circular) | `@symblight/wc-material/progress-circular` | `<md-progress-circular>`                                                          | [README](./components/progress-circular/README.md) |
| Progress (linear)   | `@symblight/wc-material/progress-linear`   | `<md-progress-linear>`                                                            | [README](./components/progress-linear/README.md)   |
| Radio Button        | `@symblight/wc-material/radio-button`      | `<md-radio>`                                                                      | [README](./components/radio-button/README.md)      |
| Ripple              | `@symblight/wc-material/ripple`            | `<md-ripple>`                                                                     | [Primitives](#primitives)                          |
| Segmented Button    | `@symblight/wc-material/segmented-button`  | `<md-segmented-button-group>`, `<md-segmented-button>`                            | [README](./components/segmented-button/README.md)  |
| Select              | `@symblight/wc-material/select`            | `<md-select>`                                                                     | [README](./components/select/README.md)            |
| Shadow              | `@symblight/wc-material/shadow`            | `<md-shadow>`                                                                     | [Primitives](#primitives)                          |
| Skeleton            | `@symblight/wc-material/skeleton`          | `<md-skeleton>`                                                                   | [README](./components/skeleton/README.md)          |
| Snackbar            | `@symblight/wc-material/snackbar`          | `<md-snackbar>`                                                                   | [README](./components/snackbar/README.md)          |
| Switch              | `@symblight/wc-material/switch`            | `<md-switch>`                                                                     | [README](./components/switch/README.md)            |
| Tabs                | `@symblight/wc-material/tabs`              | `<md-tabs>`, `<md-tab>`, `<md-tab-panel>`                                         | —                                                  |
| Text Field          | `@symblight/wc-material/text-field`        | `<md-text-field>`                                                                 | [README](./components/text-field/README.md)        |
| Tooltip             | `@symblight/wc-material/tooltip`           | `<md-tooltip>`, `<md-rich-tooltip>`                                               | [README](./components/tooltip/README.md)           |

`@symblight/wc-material/tab` and `@symblight/wc-material/tab-panel` load a single tab element on its own.

### Primitives

`md-ripple` and `md-shadow` are the building blocks the components above use internally. They are exported for building your own interactive surfaces.

```html
<div class="my-surface" style="position: relative; border-radius: 12px">
  <md-shadow level="2"></md-shadow>
  <md-ripple></md-ripple>
  Content
</div>
```

- **`md-ripple`** fills its positioned container and shows MD3 hover and press state layers. It attaches to the element named by `for` (an id in the same root), or to its parent element when `for` is omitted (the shadow host when it sits directly in a shadow root). It ignores events while the control is `disabled`. Colors and opacities: `--md-ripple-hover-color`, `--md-ripple-pressed-color`, `--md-ripple-hover-opacity`, `--md-ripple-pressed-opacity`.
- **`md-shadow`** paints the MD3 elevation shadow for its positioned container and never intercepts pointer input. Set the elevation with `level="0"`–`"5"`, or let it inherit `--md-elevation-level`; `level` wins when both are present. Color: `--md-shadow-color`, falling back to `--md-sys-color-shadow`.

### Theme

Apply the base MD3 theme stylesheet in your app's entry CSS:

```css
@import "@symblight/wc-material/theme/theme.css";
```

#### Dynamic color theming

To generate and apply a custom color palette at runtime, use [`@symblight/md-colors`](https://www.npmjs.com/package/@symblight/md-colors):

```bash
npm install @symblight/md-colors
```

```js
import { generateTheme } from "@symblight/md-colors/client";

generateTheme({ sourceColor: "#6750A4", scheme: "dark" });
```

This injects `--md-sys-color-*` tokens directly onto `:root`, which the component styles pick up automatically.

```js
import "@symblight/wc-material/button";
import "@symblight/wc-material/text-field";
import "@symblight/wc-material/checkbox";
```
