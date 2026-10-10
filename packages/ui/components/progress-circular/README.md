# md-progress-circular

A Material Design 3 circular progress indicator web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Indeterminate -->
<md-progress-circular aria-label="Loading"></md-progress-circular>

<!-- Determinate -->
<md-progress-circular
  aria-label="Uploading"
  value="0.65"
></md-progress-circular>
```

Or import the component directly:

```js
import "@symblight/wc-material/progress-circular";
```

## Properties

| Property | Type     | Default     | Description                                                                                                |
| -------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `value`  | `number` | `undefined` | Determinate progress from `0` to `1` (clamped). Omit, or pass a non-numeric value, for indeterminate mode. |

## Parts

| Part     | Element    | Description                             |
| -------- | ---------- | --------------------------------------- |
| `track`  | `<circle>` | The background track circle             |
| `circle` | `<circle>` | The progress arc (animated/determinate) |

## CSS Custom Properties

| Property                                            | Default                                                  | Description                                     |
| --------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `--md-progress-circular-size`                       | `1em`                                                    | Outer diameter; also sets the host width/height |
| `--md-progress-circular-active-indicator-thickness` | `4px`                                                    | Stroke width of the progress arc                |
| `--md-progress-circular-track-thickness`            | `var(--md-progress-circular-active-indicator-thickness)` | Stroke width of the track                       |
| `--md-progress-circular-active-indicator-color`     | `var(--md-sys-color-primary)`                            | Color of the progress arc                       |
| `--md-progress-circular-track-color`                | `var(--md-sys-color-secondary-container)`                | Color of the track                              |

> Resize with `font-size` on the element (defaults to `40px`, the M3 size) or with `--md-progress-circular-size`. Not with `width`/`height` — the arc geometry is computed from the size, and the stroke keeps its thickness at every size. The host sets its own `font-size`, so it does not inherit it from the parent; use `font-size: inherit` to match surrounding text.

> Include the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) to have color tokens resolve correctly.

## Accessibility

The element has `role="progressbar"` (via `ElementInternals`). In determinate mode it exposes `aria-valuenow` (the clamped value), `aria-valuemin="0"` and `aria-valuemax="1"`; in indeterminate mode these are omitted. A `value` that is not a finite number is treated as indeterminate.

Always give it an accessible name:

```html
<md-progress-circular aria-label="Loading" value="0.4"></md-progress-circular>
```

At `value="0"` the arc is hidden (round caps would otherwise paint a dot). Under `prefers-reduced-motion: reduce` the value transition is disabled and the indeterminate animation slows down; in forced-colors mode the arc uses `Highlight` and the track `CanvasText`.

Do not place the indicator inside a `<button>`/`md-button`: button content is presentational, so the progress would not be announced. Put it next to the button and reflect the busy state on the button itself (e.g. `disabled` plus a label change).

## Examples

### Custom color

```html
<md-progress-circular
  aria-label="Loading"
  style="--md-progress-circular-active-indicator-color: var(--md-sys-color-tertiary);
         --md-progress-circular-track-color: var(--md-sys-color-tertiary-container);"
></md-progress-circular>
```

### Custom size and thickness

```html
<md-progress-circular
  aria-label="Loading"
  style="font-size: 64px;
         --md-progress-circular-active-indicator-thickness: 8px;"
></md-progress-circular>
```

### Via CSS class

```css
.spinner-small {
  font-size: 24px;
}
```

```html
<md-progress-circular
  class="spinner-small"
  aria-label="Loading"
></md-progress-circular>
```
