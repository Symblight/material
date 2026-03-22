# md-text-field

A Material Design 3 text field web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-text-field label="Name"></md-text-field>
<md-text-field variant="outlined" label="Email" type="email"></md-text-field>
```

## Properties

| Property      | Attribute     | Type                     | Default    | Description                              |
| ------------- | ------------- | ------------------------ | ---------- | ---------------------------------------- |
| `variant`     | `variant`     | `"filled" \| "outlined"` | `"filled"` | Visual style variant                     |
| `label`       | `label`       | `string`                 | `""`       | Floating label text                      |
| `type`        | `type`        | `string`                 | `"text"`   | Native input type                        |
| `value`       | `value`       | `string`                 | `""`       | Current input value                      |
| `placeholder` | `placeholder` | `string`                 | `""`       | Placeholder text                         |
| `name`        | `name`        | `string`                 | `""`       | Form field name                          |
| `disabled`    | `disabled`    | `boolean`                | `false`    | Disables the field                       |
| `required`    | `required`    | `boolean`                | `false`    | Marks the field as required              |
| `error`       | `error`       | `boolean`                | `false`    | Applies error styling                    |
| `readOnly`    | `readonly`    | `boolean`                | `false`    | Makes the field read-only                |
| `multiline`   | `multiline`   | `boolean`                | `false`    | Renders a `<textarea>` instead of input  |
| `prefixText`  | `prefix-text` | `string`                 | `""`       | Static text shown before the input value |
| `suffixText`  | `suffix-text` | `string`                 | `""`       | Static text shown after the input value  |

## CSS Custom Properties

### Colors

| Variable                                    | Default                                         | Description                       |
| ------------------------------------------- | ----------------------------------------------- | --------------------------------- |
| `--md-text-field-foreground-color`          | `var(--md-sys-color-on-surface-variant)`        | Label and input text color        |
| `--md-text-field-background-color`          | `var(--md-sys-color-surface-container-highest)` | Field background (filled variant) |
| `--md-text-field-border-color`              | `var(--md-sys-color-on-surface-variant)`        | Bottom indicator / outline color  |
| `--md-text-field-primary-color`             | `var(--md-sys-color-primary)`                   | Focused indicator / label color   |
| `--md-text-field-error-color`               | `var(--md-sys-color-error)`                     | Error state color                 |
| `--md-text-field-error-hover-color`         | `var(--md-sys-color-on-error-container)`        | Error color on hover              |
| `--md-text-field-disabled-foreground-color` | _(system token)_                                | Text color when disabled          |
| `--md-text-field-disabled-background-color` | _(system token)_                                | Background color when disabled    |

### Spacing

| Variable                             | Default   | Description              |
| ------------------------------------ | --------- | ------------------------ |
| `--md-text-field-top-space`          | `1rem`    | Top internal padding     |
| `--md-text-field-bottom-space`       | `1rem`    | Bottom internal padding  |
| `--md-text-field-inline-start-space` | `1rem`    | Leading (left) padding   |
| `--md-text-field-inline-end-space`   | `1rem`    | Trailing (right) padding |
| `--md-text-field-leading-space`      | `0.75rem` | Leading icon gap         |
| `--md-text-field-trailing-space`     | `0.75rem` | Trailing icon gap        |

### Typography

| Variable                               | Default   | Description                            |
| -------------------------------------- | --------- | -------------------------------------- |
| `--md-text-field-font-size`            | `1rem`    | Input text font size                   |
| `--md-text-field-label-size`           | `1rem`    | Label font size (empty state)          |
| `--md-text-field-label-size-populated` | `0.75rem` | Label font size when field has a value |
| `--md-text-field-icon-size`            | `1.5rem`  | Leading / trailing icon size           |

### Variant-specific

| Variable                                      | Default               | Description                      |
| --------------------------------------------- | --------------------- | -------------------------------- |
| `--md-filled-text-field-shape`                | `0.25rem 0.25rem 0 0` | Corner radius (filled variant)   |
| `--md-filled-text-field-background-indicator` | _(system token)_      | Bottom indicator color (filled)  |
| `--md-outlined-text-field-shape`              | `0.25rem`             | Corner radius (outlined variant) |
| `--md-outlined-text-field-border-color`       | _(system token)_      | Border color (outlined variant)  |

## Examples

### Variants

```html
<md-text-field variant="filled" label="Filled"></md-text-field>
<md-text-field variant="outlined" label="Outlined"></md-text-field>
```

### States

```html
<md-text-field label="Disabled" disabled></md-text-field>
<md-text-field label="Read-only" readonly value="Cannot edit"></md-text-field>
<md-text-field label="Error" error></md-text-field>
<md-text-field label="Required" required></md-text-field>
```

### Input types

```html
<md-text-field label="Email" type="email"></md-text-field>
<md-text-field label="Password" type="password"></md-text-field>
<md-text-field label="Number" type="number"></md-text-field>
```

### Multiline (textarea)

```html
<md-text-field label="Bio" multiline></md-text-field>
```

### Prefix / suffix text

```html
<md-text-field label="Price" prefix-text="$" suffix-text="USD"></md-text-field>
```

### Custom colors

```html
<md-text-field
  label="Custom"
  style="
    --md-text-field-primary-color: #6750a4;
    --md-text-field-border-color: #958da5;
    --md-text-field-background-color: #f4eff4;
  "
></md-text-field>
```

### Custom shape (square corners)

```html
<md-text-field
  variant="outlined"
  label="Square"
  style="--md-outlined-text-field-shape: 0;"
></md-text-field>
```
