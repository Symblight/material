# md-icon

A Material Design 3 icon web component built with Lit.

Wraps an SVG (or any inline icon) and applies consistent sizing and color inherited from the surrounding text.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-icon>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
</md-icon>
```

## Properties

`md-icon` has no properties — it is a pure slot wrapper. Size and color are inherited from the parent context via CSS.

## CSS Custom Properties

| Variable         | Default | Description                               |
| ---------------- | ------- | ----------------------------------------- |
| `--stroke-width` | `2px`   | Stroke width applied to SVG path elements |

## Styling

The component uses `font-size: inherit` and sizes the slotted SVG to `1em × 1em`, so you can control the icon size by setting `font-size` on the host or a parent element:

```css
md-icon {
  font-size: 24px; /* icon renders at 24×24 */
  color: #6750a4; /* fill color */
}
```

## Examples

### Basic icon

```html
<md-icon>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
</md-icon>
```

### Custom size via font-size

```html
<md-icon style="font-size: 32px;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
</md-icon>
```

### Color inherited from parent

```html
<span style="color: red;">
  <md-icon>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  </md-icon>
</span>
```
