# md-switch

A Material Design 3 Switch web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-switch></md-switch>
<md-switch selected></md-switch>
<md-switch icons></md-switch>
```

## Properties

| Property   | Attribute  | Type      | Default | Description                                 |
| ---------- | ---------- | --------- | ------- | ------------------------------------------- |
| `selected` | `selected` | `boolean` | `false` | Whether the switch is on                    |
| `disabled` | `disabled` | `boolean` | `false` | Disables the switch                         |
| `icons`    | `icons`    | `boolean` | `false` | Shows check/x icons inside the handle       |
| `value`    | `value`    | `string`  | `"on"`  | Value submitted with the form when selected |
| `name`     | `name`     | `string`  | `""`    | Form field name                             |
| `required` | `required` | `boolean` | `false` | Marks the field as required in a form       |

## CSS Custom Properties

| Variable                                     | Default                                         | Description                |
| -------------------------------------------- | ----------------------------------------------- | -------------------------- |
| `--md-switch-track-width`                    | `52px`                                          | Width of the track         |
| `--md-switch-track-height`                   | `32px`                                          | Height of the track        |
| `--md-switch-track-shape`                    | `var(--md-sys-shape-corner-full)`               | Border radius of the track |
| `--md-switch-unselected-track-color`         | `var(--md-sys-color-surface-container-highest)` | Track background when off  |
| `--md-switch-unselected-track-outline-color` | `var(--md-sys-color-outline)`                   | Track border when off      |
| `--md-switch-selected-track-color`           | `var(--md-sys-color-primary)`                   | Track background when on   |
| `--md-switch-unselected-handle-color`        | `var(--md-sys-color-outline)`                   | Handle color when off      |
| `--md-switch-unselected-handle-size`         | `16px`                                          | Handle diameter when off   |
| `--md-switch-selected-handle-color`          | `var(--md-sys-color-on-primary)`                | Handle color when on       |
| `--md-switch-selected-handle-size`           | `24px`                                          | Handle diameter when on    |
| `--md-switch-selected-icon-color`            | `var(--md-sys-color-on-primary-container)`      | Icon fill when on          |
| `--md-switch-unselected-icon-color`          | `var(--md-sys-color-surface-container-highest)` | Icon fill when off         |

> All variables fall back to Material Design 3 system tokens. Include the MD3 theme CSS
> (`@symblight/wc-material/theme/theme.css`) or define the `--md-sys-color-*` tokens yourself.

## Examples

### Basic states

```html
<md-switch></md-switch>
<md-switch selected></md-switch>
<md-switch disabled></md-switch>
<md-switch disabled selected></md-switch>
```

### With icons

```html
<md-switch icons></md-switch> <md-switch icons selected></md-switch>
```

### Inside a form

```html
<form>
  <label>
    Enable notifications
    <md-switch name="notifications" value="enabled"></md-switch>
  </label>
</form>
```

### Custom colors

```html
<md-switch
  selected
  style="
    --md-switch-selected-track-color: #006494;
    --md-switch-selected-handle-color: #ffffff;
  "
></md-switch>
```

### Via CSS class

```css
.brand-switch {
  --md-switch-selected-track-color: oklch(45% 0.22 250);
  --md-switch-selected-handle-color: oklch(98% 0.01 250);
}
```

```html
<md-switch class="brand-switch" selected></md-switch>
```

## Events

| Event    | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| `change` | Fired when the switch is toggled (re-dispatched from the inner input) |
