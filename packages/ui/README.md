# @symblight/wc-material

Material Design 3 web components built with [Lit](https://lit.dev/).

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
import '@symblight/wc-material';
import '@symblight/wc-material/theme/theme.css';
```

### Import individual components (recommended)

Only load what you need — each component is a separate entry point:

```js
import '@symblight/wc-material/button';
import '@symblight/wc-material/checkbox';
import '@symblight/wc-material/text-field';
```

### Available imports

| Import path | Components |
|---|---|
| `@symblight/wc-material/avatar` | `<md-avatar>` |
| `@symblight/wc-material/button` | `<md-button>` |
| `@symblight/wc-material/checkbox` | `<md-checkbox>` |
| `@symblight/wc-material/chips` | `<md-assist-chip>`, `<md-filter-chip>`, `<md-input-chip>`, `<md-suggestion-chip>` |
| `@symblight/wc-material/dialog` | `<md-dialog>` |
| `@symblight/wc-material/fab` | `<md-fab>` |
| `@symblight/wc-material/icon` | `<md-icon>` |
| `@symblight/wc-material/icon-button` | `<md-icon-button>` |
| `@symblight/wc-material/progress-circular` | `<md-progress-circular>` |
| `@symblight/wc-material/progress-linear` | `<md-progress-linear>` |
| `@symblight/wc-material/radio-button` | `<md-radio-button>` |
| `@symblight/wc-material/select` | `<md-select>` |
| `@symblight/wc-material/switch` | `<md-switch>` |
| `@symblight/wc-material/text-field` | `<md-text-field>` |

### Theme

Apply the MD3 theme tokens in your app's entry CSS:

```css
@import '@symblight/wc-material/theme/theme.css';
```

Or in JavaScript:

```js
import '@symblight/wc-material/theme/theme.css';
```

## Example

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/@symblight/wc-material/theme/theme.css" />
  </head>
  <body>
    <md-button variant="filled">Click me</md-button>
    <md-text-field label="Name"></md-text-field>
    <md-checkbox></md-checkbox>
  </body>
</html>
```

```js
import '@symblight/wc-material/button';
import '@symblight/wc-material/text-field';
import '@symblight/wc-material/checkbox';
```

## Roadmap

- [ ] Native menu
- [ ] Menu
- [ ] Tooltip
- [ ] Tabs
