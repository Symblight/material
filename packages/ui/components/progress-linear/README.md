# md-progress-linear

A Material Design 3 linear progress indicator web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Indeterminate -->
<md-progress-linear></md-progress-linear>

<!-- Determinate -->
<md-progress-linear value="0.65"></md-progress-linear>
```

Or import the component directly:

```js
import "@symblight/wc-material/progress-linear";
```

## Properties

| Property | Type     | Default     | Description                                                                                |
| -------- | -------- | ----------- | ------------------------------------------------------------------------------------------ |
| `value`  | `number` | `undefined` | Determinate progress from `0` to `1`. Omit (or set to `undefined`) for indeterminate mode. |

## CSS Custom Properties

| Property                                      | Default                                   | Description                                       |
| --------------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `--md-progress-linear-track-height`           | `4px`                                     | Height of the track and active indicator          |
| `--md-progress-linear-active-indicator-color` | `var(--md-sys-color-primary)`             | Color of the active (progress) bar                |
| `--md-progress-linear-track-color`            | `var(--md-sys-color-secondary-container)` | Color of the background track                     |
| `--md-progress-linear-stop-indicator-color`   | `var(--md-sys-color-primary)`             | Color of the Expressive stop-dot at the trail end |

> Include the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) to have color tokens resolve correctly.

## Examples

### Indeterminate

```html
<md-progress-linear></md-progress-linear>
```

### Determinate

```html
<md-progress-linear value="0.4"></md-progress-linear>
```

### Custom color

```html
<md-progress-linear
  value="0.7"
  style="--md-progress-linear-active-indicator-color: var(--md-sys-color-tertiary);
         --md-progress-linear-track-color: var(--md-sys-color-tertiary-container);"
></md-progress-linear>
```

### Custom height

```html
<md-progress-linear
  value="0.5"
  style="--md-progress-linear-track-height: 8px;"
></md-progress-linear>
```
