# md-button

A Material Design 3 button web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-button>Click me</md-button>
<md-button variant="outlined">Outlined</md-button>
<md-button variant="text">Text</md-button>
<md-button variant="elevated">Elevated</md-button>
<md-button variant="tonal">Tonal</md-button>
```

## Properties

| Property   | Attribute  | Type                                                        | Default    | Description                        |
| ---------- | ---------- | ----------------------------------------------------------- | ---------- | ---------------------------------- |
| `variant`  | `variant`  | `"filled" \| "outlined" \| "text" \| "elevated" \| "tonal"` | `"filled"` | Visual style variant               |
| `disabled` | `disabled` | `boolean`                                                   | `false`    | Disables the button                |
| `loading`  | `loading`  | `boolean`                                                   | `false`    | Shows a loading indicator          |
| `href`     | `href`     | `boolean`                                                   | `false`    | Renders as an anchor element       |
| `type`     | `type`     | `"button" \| "submit" \| "reset"`                           | `"button"` | Native button type                 |
| `form`     | `form`     | `string`                                                    | —          | Associates button with a form `id` |

## CSS Custom Properties

| Variable                            | Default         | Description                        |
| ----------------------------------- | --------------- | ---------------------------------- |
| `--md-button-foreground-color`      | `inherit`       | Text / icon color                  |
| `--md-button-background-color`      | `transparent`   | Background fill                    |
| `--md-button-border-color`          | `transparent`   | Border color                       |
| `--md-button-border-size`           | `0`             | Border width                       |
| `--md-button-border-radius`         | `6.25rem`       | Corner radius                      |
| `--md-button-font-size`             | `1rem`          | Label font size                    |
| `--md-button-inline-start-space`    | `1.5rem`        | Leading (left) padding             |
| `--md-button-inline-end-space`      | `1.5rem`        | Trailing (right) padding           |
| `--md-button-block-start-space`     | `0.625rem`      | Top padding                        |
| `--md-button-block-end-space`       | `0.625rem`      | Bottom padding                     |
| `--md-button-pressed-state-color`   | `transparent`   | Ripple/state-layer color on press  |
| `--md-button-pressed-state-opacity` | `12%`           | Opacity of the pressed state layer |
| `--md-button-hovered-state-opacity` | `8%`            | Opacity of the hover state layer   |
| `--md-elevation-level`              | _(per variant)_ | Material elevation level (0–5)     |

## Examples

### Variants

```html
<md-button variant="filled">Filled</md-button>
<md-button variant="outlined">Outlined</md-button>
<md-button variant="text">Text</md-button>
<md-button variant="elevated">Elevated</md-button>
<md-button variant="tonal">Tonal</md-button>
```

### Disabled & loading

```html
<md-button disabled>Disabled</md-button> <md-button loading>Saving…</md-button>
```

### Custom colors via CSS

```html
<md-button
  style="
  --md-button-background-color: #6750a4;
  --md-button-foreground-color: #fff;
"
>
  Custom filled
</md-button>
```

### Custom padding and radius

```css
.compact-btn {
  --md-button-block-start-space: 0.25rem;
  --md-button-block-end-space: 0.25rem;
  --md-button-inline-start-space: 0.75rem;
  --md-button-inline-end-space: 0.75rem;
  --md-button-border-radius: 0.25rem;
}
```

```html
<md-button class="compact-btn">Compact</md-button>
```

### Submit button inside a form

```html
<form id="my-form">
  <md-text-field name="email" label="Email"></md-text-field>
  <md-button type="submit" form="my-form">Submit</md-button>
</form>
```
