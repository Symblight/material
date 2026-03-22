# md-radio

A Material Design 3 radio button web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-radio name="color" value="red"></md-radio>
<md-radio name="color" value="blue" checked></md-radio>
<md-radio name="color" value="green"></md-radio>
```

## Properties

| Property        | Attribute       | Type      | Default | Description                           |
| --------------- | --------------- | --------- | ------- | ------------------------------------- |
| `checked`       | `checked`       | `boolean` | `false` | Whether this radio is selected        |
| `disabled`      | `disabled`      | `boolean` | `false` | Disables the radio button             |
| `required`      | `required`      | `boolean` | `false` | Marks the field as required in a form |
| `indeterminate` | `indeterminate` | `boolean` | `false` | Indeterminate visual state            |
| `error`         | `error`         | `boolean` | `false` | Applies error styling                 |
| `value`         | `value`         | `string`  | `"on"`  | Value submitted with the form         |
| `name`          | `name`          | `string`  | `""`    | Groups radio buttons together         |
| `id`            | `id`            | `string`  | `""`    | Element id                            |

## CSS Custom Properties

| Variable                      | Default                                  | Description                        |
| ----------------------------- | ---------------------------------------- | ---------------------------------- |
| `--md-radio-background-color` | `transparent`                            | Fill color of the radio control    |
| `--md-radio-border-color`     | `var(--md-sys-color-on-surface-variant)` | Border / ring color of the control |

> `--md-radio-border-color` falls back to the MD3 system token `--md-sys-color-on-surface-variant`. Include the theme CSS or define the token manually.

## Examples

### Radio group

```html
<form>
  <md-radio name="plan" value="free"></md-radio>
  <label>Free</label>

  <md-radio name="plan" value="pro" checked></md-radio>
  <label>Pro</label>

  <md-radio name="plan" value="enterprise"></md-radio>
  <label>Enterprise</label>
</form>
```

### Disabled

```html
<md-radio name="size" value="s" disabled></md-radio>
<md-radio name="size" value="m" checked disabled></md-radio>
```

### Error state

```html
<md-radio name="terms" value="yes" error></md-radio>
<label>Accept terms (required)</label>
```

### Custom colors

```html
<md-radio
  name="theme"
  value="purple"
  checked
  style="
    --md-radio-border-color: #6750a4;
    --md-radio-background-color: #6750a4;
  "
></md-radio>
```

### Via CSS class

```css
.brand-radio {
  --md-radio-border-color: oklch(50% 0.2 270);
  --md-radio-background-color: oklch(50% 0.2 270);
}
```

```html
<md-radio class="brand-radio" name="choice" value="1" checked></md-radio>
```
