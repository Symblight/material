# md-select / md-native-select

Material Design 3 select (dropdown) web components built with Lit.

`md-select` and `md-native-select` used to be a single `md-select` flipped
between two unrelated implementations by a `native` boolean attribute —
they're now two separate components (the same shape change `md-menu-item`'s
old `type="menuitem" | "option"` attribute went through earlier, split into
`md-menu-item`/`md-option`: a boolean flag flipping a component's entire
identity/rendering is the wrong shape). Both share a common base
(`components/select/base-select.js`) and are real, form-associated controls
(`ElementInternals`-backed), but they take different child types and open
different UI:

- **`md-select`** — the visible, interactive control is an `md-menu` popover
  combobox. Takes `md-option`/`md-option-group`/`md-hr` children (custom
  elements), so options can carry rich content — leading icons, supporting
  text — and the selected row gets an automatic checkmark.
- **`md-native-select`** — a genuine native `<select>`; the browser's own
  OS/platform dropdown opens. Takes plain `<option>`/`<optgroup>` children
  (real HTML, not custom elements — a custom element can't be a genuine
  `<option>`/`<optgroup>` child of a native `<select>`, and can't even be
  _slotted_ into one from a shadow root). Supports `multiple`/`size`, which
  `md-select` does not.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- md-select: a richer md-menu popover -->
<md-select label="Country">
  <md-option value="us">United States</md-option>
  <md-option value="uk">United Kingdom</md-option>
  <md-option value="de">Germany</md-option>
</md-select>

<!-- md-native-select: the browser's own OS/platform dropdown -->
<md-native-select label="Country">
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="de">Germany</option>
</md-native-select>
```

## `md-select`

`md-option` is the only child type `md-select` accepts (alongside
`md-option-group` for grouping, and `md-hr` for a divider).

### Properties

| Property   | Attribute  | Type                     | Default    | Description                           |
| ---------- | ---------- | ------------------------ | ---------- | ------------------------------------- |
| `variant`  | `variant`  | `"filled" \| "outlined"` | `"filled"` | Visual style variant                  |
| `disabled` | `disabled` | `boolean`                | `false`    | Disables the select                   |
| `required` | `required` | `boolean`                | `false`    | Marks the field as required in a form |
| `value`    | `value`    | `string`                 | —          | Currently selected value              |
| `name`     | `name`     | `string`                 | `""`       | Form field name                       |
| `label`    | `label`    | `string`                 | `""`       | Field label                           |

The visible, interactive control is an `md-menu` popover (`menu-role="listbox"`), so `md-option`s can render rich content (leading icons, supporting text, etc.), and the selected row gets an automatic leading checkmark. A native `<select>` still exists underneath, visually hidden — kept in sync as the form's `validationTarget`/value mirror, but it's not what the user opens/clicks.

`multiple` isn't supported — there's no multi-select UI in the `md-menu`-popover path. Use `md-native-select` for that.

## `md-native-select`

Plain `<option>`/`<optgroup>` elements only — not `md-option`/`md-option-group`.

### Properties

| Property   | Attribute  | Type                     | Default    | Description                                |
| ---------- | ---------- | ------------------------ | ---------- | ------------------------------------------ |
| `variant`  | `variant`  | `"filled" \| "outlined"` | `"filled"` | Visual style variant                       |
| `disabled` | `disabled` | `boolean`                | `false`    | Disables the select                        |
| `required` | `required` | `boolean`                | `false`    | Marks the field as required in a form      |
| `value`    | `value`    | `string`                 | —          | Currently selected value                   |
| `name`     | `name`     | `string`                 | `""`       | Form field name                            |
| `label`    | `label`    | `string`                 | `""`       | Field label                                |
| `multiple` | `multiple` | `boolean`                | `false`    | Native multi-select                        |
| `size`     | `size`     | `number`                 | `0`        | Native `<select size>` — visible row count |

`md-select` fabricates a real `<select>`/`<option>`/`<optgroup>` tree internally and lets the browser's own OS/platform dropdown handle everything, including `multiple`.

Children are the user's actual `<option>`/`<optgroup>` DOM nodes, _reparented_ (moved via `appendChild`) into the real `<select>` living in the shadow root — not cloned or rebuilt from extracted data, and not declaratively slotted (a real `<select>` in a shadow root can't use slotted light-DOM `<option>`s as its functional options at all — this is a hard platform constraint). So each option's own real `.value`/`.selected`/`.defaultSelected` just works, including form-reset (each option's `.selected` is restored to its `.defaultSelected`).

## Parts

| Part         | Element                                        | Description                         |
| ------------ | ---------------------------------------------- | ----------------------------------- |
| `text-field` | nested `<md-text-field>`                       | The host of the internal text field |
| `select`     | `<select>` or trigger `<button>` (`md-select`) | The interactive control             |

Both components also forward `md-text-field`'s own parts, so you can reach into the internal field directly — `::part(input)`, `::part(box)`, `::part(label)`, `::part(help-text)`, `::part(prefix)`, `::part(suffix)`, and `::part(wrapper)` all work without going through `::part(text-field)`.

## CSS Custom Properties

Both components share their visual styling with `md-text-field`. You can use all text-field CSS variables to customise them. See [`../text-field/README.md`](../text-field/README.md) for the full list. `md-select`'s `md-option` rows share `md-menu-item`'s `--md-menu-item-*` custom properties — see [`../menu/README.md`](../menu/README.md).

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
  <md-option value="a">Option A</md-option>
</md-select>

<md-select variant="outlined" label="Outlined">
  <md-option value="a">Option A</md-option>
</md-select>
```

### Disabled & required

```html
<md-select disabled label="Disabled">
  <md-option value="x">Option</md-option>
</md-select>

<md-select required name="role" label="Role *">
  <md-option value="admin">Admin</md-option>
  <md-option value="user">User</md-option>
</md-select>
```

### Pre-selected value

```html
<md-select value="uk" label="Country">
  <md-option value="us">United States</md-option>
  <md-option value="uk">United Kingdom</md-option>
</md-select>
```

### Grouped options

```html
<md-select label="Location">
  <md-option-group label="Person">
    <md-option value="tutor">Tutor</md-option>
    <md-option value="student">Student</md-option>
  </md-option-group>
  <md-hr></md-hr>
  <md-option-group label="Place">
    <md-option value="classroom">Classroom</md-option>
    <md-option value="online">Online</md-option>
  </md-option-group>
</md-select>
```

### Menu mode with leading icons

```html
<md-select label="Sort by">
  <md-option value="name">
    <md-icon slot="leading"><!-- icon svg --></md-icon>
    Name
  </md-option>
  <md-option value="date">
    <md-icon slot="leading"><!-- icon svg --></md-icon>
    Date modified
  </md-option>
</md-select>
```

### Native multi-select

```html
<md-native-select label="Roles" name="roles" multiple size="4">
  <option value="tutor">Tutor</option>
  <option value="student" selected>Student</option>
  <option value="classroom">Classroom</option>
  <option value="online">Online</option>
</md-native-select>
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
  <md-option value="1">One</md-option>
</md-select>
```
