# md-avatar

A Material Design 3 avatar web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Image avatar -->
<md-avatar src="https://example.com/photo.jpg"></md-avatar>

<!-- Fallback (no image) -->
<md-avatar></md-avatar>
```

## Properties

| Property | Attribute | Type     | Description                  |
| -------- | --------- | -------- | ---------------------------- |
| `src`    | `src`     | `string` | URL of the avatar image      |
| `size`   | `size`    | `number` | Size hint (see CSS variable) |

## CSS Custom Properties

| Variable                   | Default                                                                         | Description                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--md-avatar-size`         | `26px`                                                                          | Radius of the avatar circle. Rendered size is `2 × this value` (e.g. `26px` → `52px` diameter). |
| `--md-avatar-stroke-color` | `color-mix(in oklch, var(--md-sys-color-secondary-container), transparent 80%)` | Color of the circular border/stroke drawn around the avatar.                                    |

> `--md-avatar-stroke-color` falls back to the Material Design system token `--md-sys-color-secondary-container`. Make sure your page includes the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) or define the token yourself.

## Examples

### Default size

```html
<md-avatar src="https://i.pravatar.cc/150"></md-avatar>
```

### Custom size (80 px diameter)

```html
<md-avatar
  src="https://i.pravatar.cc/150"
  style="--md-avatar-size: 40px;"
></md-avatar>
```

### Custom stroke color

```html
<md-avatar
  src="https://i.pravatar.cc/150"
  style="--md-avatar-stroke-color: #6750a4;"
></md-avatar>
```

### Applying overrides via CSS class

```css
.avatar-large {
  --md-avatar-size: 48px;
  --md-avatar-stroke-color: oklch(60% 0.15 270);
}
```

```html
<md-avatar class="avatar-large" src="https://i.pravatar.cc/150"></md-avatar>
```

### No image (fallback)

When `src` is omitted the circle is filled with a gray placeholder.

```html
<md-avatar></md-avatar>
```
