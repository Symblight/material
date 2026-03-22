# md-progress-circular

A Material Design 3 circular progress indicator web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Indeterminate spinner -->
<md-progress-circular></md-progress-circular>
```

## CSS Custom Properties

`md-progress-circular` inherits its color from the standard CSS `color` property, which defaults to the MD3 system token `--md-sys-color-primary`.

| Property / Variable      | Default                       | Description                         |
| ------------------------ | ----------------------------- | ----------------------------------- |
| `color` _(CSS property)_ | `var(--md-sys-color-primary)` | Color of the spinning indicator arc |

> Include the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) to have `--md-sys-color-primary` resolve correctly, or set the `color` property directly on the element.

## Examples

### Default (uses primary token)

```html
<md-progress-circular></md-progress-circular>
```

### Custom color via `color`

```html
<md-progress-circular style="color: #6750a4;"></md-progress-circular>
```

### Custom size via `width` / `height`

```html
<md-progress-circular
  style="width: 64px; height: 64px; color: #6750a4;"
></md-progress-circular>
```

### Via CSS class

```css
.spinner-brand {
  color: oklch(50% 0.2 270);
  width: 48px;
  height: 48px;
}
```

```html
<md-progress-circular class="spinner-brand"></md-progress-circular>
```

### Inside a button (loading state)

```html
<md-button loading>
  <md-progress-circular style="color: inherit;"></md-progress-circular>
  Saving…
</md-button>
```
