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
| Progress (circular) | `@symblight/wc-material/progress-circular` | `<md-progress-circular>`                                                          | [README](./components/progress-circular/README.md) |
| Progress (linear)   | `@symblight/wc-material/progress-linear`   | `<md-progress-linear>`                                                            | [README](./components/progress-linear/README.md)   |
| Radio Button        | `@symblight/wc-material/radio-button`      | `<md-radio-button>`                                                               | [README](./components/radio-button/README.md)      |
| Select              | `@symblight/wc-material/select`            | `<md-select>`                                                                     | [README](./components/select/README.md)            |
| Switch              | `@symblight/wc-material/switch`            | `<md-switch>`                                                                     | [README](./components/switch/README.md)            |
| Text Field          | `@symblight/wc-material/text-field`        | `<md-text-field>`                                                                 | [README](./components/text-field/README.md)        |

### Theme

Apply the MD3 theme tokens in your app's entry CSS:

```css
@import "@symblight/wc-material/theme/theme.css";
```

Or in JavaScript:

```js
import "@symblight/wc-material/theme/theme.css";
```

## Example

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="node_modules/@symblight/wc-material/theme/theme.css"
    />
  </head>
  <body>
    <md-button variant="filled">Click me</md-button>
    <md-text-field label="Name"></md-text-field>
    <md-checkbox></md-checkbox>
  </body>
</html>
```

```js
import "@symblight/wc-material/button";
import "@symblight/wc-material/text-field";
import "@symblight/wc-material/checkbox";
```

## Roadmap

- [ ] List
- [ ] Carousel
- [ ] Tabs
- [ ] Menu
