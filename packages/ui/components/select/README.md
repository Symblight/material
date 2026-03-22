# md-select

A Material Design 3 select (dropdown) web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-select label="Country">
  <md-select-option value="us">United States</md-select-option>
  <md-select-option value="uk">United Kingdom</md-select-option>
  <md-select-option value="de">Germany</md-select-option>
</md-select>
```

## Properties

| Property   | Attribute  | Type                     | Default    | Description                           |
| ---------- | ---------- | ------------------------ | ---------- | ------------------------------------- |
| `variant`  | `variant`  | `"filled" \| "outlined"` | `"filled"` | Visual style variant                  |
| `disabled` | `disabled` | `boolean`                | `false`    | Disables the select                   |
| `required` | `required` | `boolean`                | `false`    | Marks the field as required in a form |
| `value`    | `value`    | `string`                 | —          | Currently selected value              |
| `name`     | `name`     | `string`                 | `""`       | Form field name                       |
| `id`       | `id`       | `string`                 | `""`       | Element id                            |

## CSS Custom Properties

`md-select` shares its visual styling with `md-text-field`. You can use all text-field CSS variables to customise it. See [`../text-field/README.md`](../text-field/README.md) for the full list.

Key variables most commonly overridden:

| Variable                           | Default                                         | Description               |
| ---------------------------------- | ----------------------------------------------- | ------------------------- |
| `--md-text-field-foreground-color` | `var(--md-sys-color-on-surface-variant)`        | Label / text color        |
| `--md-text-field-background-color` | `var(--md-sys-color-surface-container-highest)` | Background fill           |
| `--md-text-field-border-color`     | `var(--md-sys-color-on-surface-variant)`        | Indicator / border color  |
| `--md-text-field-primary-color`    | `var(--md-sys-color-primary)`                   | Focus ring / active color |
| `--md-text-field-error-color`      | `var(--md-sys-color-error)`                     | Error state color         |

## Examples

### Variants

```html
<md-select variant="filled" label="Filled">
  <md-select-option value="a">Option A</md-select-option>
</md-select>

<md-select variant="outlined" label="Outlined">
  <md-select-option value="a">Option A</md-select-option>
</md-select>
```

### Disabled & required

```html
<md-select disabled label="Disabled">
  <md-select-option value="x">Option</md-select-option>
</md-select>

<md-select required name="role" label="Role *">
  <md-select-option value="admin">Admin</md-select-option>
  <md-select-option value="user">User</md-select-option>
</md-select>
```

### Pre-selected value

```html
<md-select value="uk" label="Country">
  <md-select-option value="us">United States</md-select-option>
  <md-select-option value="uk">United Kingdom</md-select-option>
</md-select>
```

### Custom colors

```html
<md-select
  label="Custom"
  style="
    --md-text-field-primary-color: #6750a4;
    --md-text-field-border-color: #6750a4;
  "
>
  <md-select-option value="1">One</md-select-option>
</md-select>
```
