# md-badge

A Material Design 3 badge web component built with Lit.

Renders a small dot (no value) or a pill with text (value provided).

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Small dot badge -->
<md-badge></md-badge>

<!-- Large badge with number -->
<md-badge value="3"></md-badge>

<!-- Truncates at max (default 999) -->
<md-badge value="1000"></md-badge>
```

## Properties

| Property | Attribute | Type     | Default | Description                                                 |
| -------- | --------- | -------- | ------- | ----------------------------------------------------------- |
| `value`  | `value`   | `string` | `""`    | Text or number to display. Leave empty for the dot variant. |
| `max`    | `max`     | `number` | `999`   | Maximum numeric value before truncating with `+`.           |

## CSS Custom Properties

| Variable                          | Default                                                | Description                             |
| --------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `--md-badge-color`                | `var(--md-sys-color-error)`                            | Badge background color                  |
| `--md-badge-on-color`             | `var(--md-sys-color-on-error)`                         | Badge text/foreground color             |
| `--md-badge-border-radius`        | `var(--md-sys-shape-corner-full, 9999px)`              | Border radius                           |
| `--md-badge-font-family`          | `var(--md-sys-typescale-label-small-font, sans-serif)` | Font family                             |
| `--md-badge-font-size`            | `var(--md-sys-typescale-label-small-size, 11px)`       | Font size                               |
| `--md-badge-font-weight`          | `var(--md-sys-typescale-label-small-weight, 500)`      | Font weight                             |
| `--md-badge-small-size`           | `6px`                                                  | Diameter of the small dot variant       |
| `--md-badge-large-height`         | `16px`                                                 | Height of the large pill variant        |
| `--md-badge-large-min-width`      | `16px`                                                 | Minimum width of the large variant      |
| `--md-badge-large-padding-inline` | `4px`                                                  | Horizontal padding of the large variant |

## Examples

### Small dot

```html
<md-badge></md-badge>
```

### Numeric badge

```html
<md-badge value="5"></md-badge>
```

### Overflow truncation

```html
<!-- Displays "999+" -->
<md-badge value="1000"></md-badge>

<!-- Custom max -->
<md-badge value="100" max="99"></md-badge>
```

### Custom color

```html
<md-badge
  value="2"
  style="--md-badge-color: #6750a4; --md-badge-on-color: #fff;"
></md-badge>
```
