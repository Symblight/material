# md-skeleton

A Material Design 3 loading-placeholder web component built with Lit.

The host itself is the pulsing block — no wrapper element, no shadow content. Size it with plain CSS (`width`/`height`, or an inline `style` for a variable-width placeholder mimicking real text of differing lengths).

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- A line of text, full width -->
<md-skeleton></md-skeleton>

<!-- A shorter line, mimicking real content -->
<md-skeleton style="width: 60%;"></md-skeleton>

<!-- An avatar placeholder -->
<md-skeleton
  variant="circular"
  style="width: 40px; height: 40px;"
></md-skeleton>
```

## Properties

| Property  | Attribute | Type                                    | Default  | Description                                                                                                                                                         |
| --------- | --------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant` | `variant` | `"text" \| "circular" \| "rectangular"` | `"text"` | `text`/`rectangular` are both rounded-rectangle blocks (`text` is the default shape for a line of text); `circular` is a full circle, for avatar-style placeholders |

## CSS Custom Properties

| Variable               | Default                                                                | Description                                                                    |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `--md-skeleton-color`  | `color-mix(in oklch, var(--md-sys-color-on-surface), transparent 88%)` | Block color                                                                    |
| `--md-skeleton-radius` | `var(--md-sys-shape-corner-extra-small, 0.25rem)`                      | Corner radius (`text`/`rectangular` only — `circular` is always a full circle) |
| `--md-skeleton-height` | `1em`                                                                  | Block height                                                                   |
| `--md-skeleton-width`  | `100%`                                                                 | Block width                                                                    |

Pulses via an opacity animation (respecting `prefers-reduced-motion`). Plain `width`/`height`/`border-radius` on the element also work directly and take priority over the custom properties above, same as any other CSS.

## Examples

### A few lines of varying width

```html
<div style="display: flex; flex-direction: column; gap: 0.5rem;">
  <md-skeleton style="width: 80%;"></md-skeleton>
  <md-skeleton style="width: 55%;"></md-skeleton>
  <md-skeleton style="width: 70%;"></md-skeleton>
</div>
```

### Avatar + text placeholder

```html
<div style="display: flex; align-items: center; gap: 0.75rem;">
  <md-skeleton
    variant="circular"
    style="width: 40px; height: 40px;"
  ></md-skeleton>
  <div style="display: flex; flex-direction: column; gap: 0.375rem; flex: 1;">
    <md-skeleton style="width: 40%;"></md-skeleton>
    <md-skeleton style="width: 70%;"></md-skeleton>
  </div>
</div>
```
