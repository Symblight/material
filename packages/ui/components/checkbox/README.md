# md-checkbox

A Material Design 3 checkbox web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-checkbox></md-checkbox>
<md-checkbox checked></md-checkbox>
<md-checkbox indeterminate></md-checkbox>
```

## Properties

| Property        | Attribute       | Type      | Default  | Description                              |
|-----------------|-----------------|-----------|----------|------------------------------------------|
| `checked`       | `checked`       | `boolean` | `false`  | Whether the checkbox is checked          |
| `disabled`      | `disabled`      | `boolean` | `false`  | Disables the checkbox                    |
| `indeterminate` | `indeterminate` | `boolean` | `false`  | Shows indeterminate (mixed) state        |
| `required`      | `required`      | `boolean` | `false`  | Marks the field as required in a form    |
| `error`         | `error`         | `boolean` | `false`  | Applies error styling                    |
| `value`         | `value`         | `string`  | `"on"`   | Value submitted with the form            |
| `name`          | `name`          | `string`  | `""`     | Form field name                          |
| `id`            | `id`            | `string`  | `""`     | Element id                               |

## CSS Custom Properties

| Variable                         | Default                               | Description                        |
|----------------------------------|---------------------------------------|------------------------------------|
| `--md-checkbox-background-color` | `transparent`                         | Background of the checkbox control |
| `--md-checkbox-border-color`     | `var(--md-sys-color-on-surface-variant)` | Border color of the checkbox    |

> Both variables fall back to Material Design system tokens. Include the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) or define `--md-sys-color-on-surface-variant` yourself.

## Examples

### Basic states

```html
<md-checkbox></md-checkbox>
<md-checkbox checked></md-checkbox>
<md-checkbox indeterminate></md-checkbox>
<md-checkbox disabled></md-checkbox>
<md-checkbox error></md-checkbox>
```

### Inside a form

```html
<form>
  <md-checkbox name="agree" value="yes" required></md-checkbox>
  <label>I agree to the terms</label>
</form>
```

### Custom colors

```html
<md-checkbox
  checked
  style="
    --md-checkbox-background-color: #6750a4;
    --md-checkbox-border-color: #6750a4;
  "
></md-checkbox>
```

### Via CSS class

```css
.brand-checkbox {
  --md-checkbox-background-color: oklch(50% 0.2 270);
  --md-checkbox-border-color: oklch(50% 0.2 270);
}
```

```html
<md-checkbox class="brand-checkbox" checked></md-checkbox>
```
