# Segmented Button

Material Design 3 segmented button components built with Lit. A segmented button group presents a set of related, mutually exclusive (or independently toggleable) choices as a single connected control.

[MD3 Segmented Buttons guidelines](https://m3.material.io/components/segmented-buttons/guidelines)

## Components

| Tag                         | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| `md-segmented-button-group` | Container that coordinates selection, keyboard navigation, and disabling |
| `md-segmented-button`       | A single segment inside the group                                        |

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-segmented-button-group label="View density" value="day">
  <md-segmented-button value="day">Day</md-segmented-button>
  <md-segmented-button value="week">Week</md-segmented-button>
  <md-segmented-button value="month">Month</md-segmented-button>
</md-segmented-button-group>
```

`md-segmented-button` always renders a native `<button>` internally — segments never act as links.

---

## md-segmented-button-group

Coordinates single-select (radio-like, mutually exclusive) or multi-select (independent toggle) behavior, roving-tabindex keyboard navigation, and cascades `disabled` / selection state down to its slotted segments.

```html
<!-- Single-select (default) -->
<md-segmented-button-group label="View density" value="day">
  <md-segmented-button value="day">Day</md-segmented-button>
  <md-segmented-button value="week">Week</md-segmented-button>
</md-segmented-button-group>

<!-- Multi-select -->
<md-segmented-button-group multiselect label="Text style" .values=${["bold"]}>
  <md-segmented-button value="bold">Bold</md-segmented-button>
  <md-segmented-button value="italic">Italic</md-segmented-button>
</md-segmented-button-group>
```

### Properties

| Property      | Attribute     | Type       | Default | Description                                                                                                                         |
| ------------- | ------------- | ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `multiselect` | `multiselect` | `boolean`  | `false` | Enables independent toggle selection instead of single-select                                                                       |
| `value`       | —             | `string`   | `""`    | The selected value (single-select mode only)                                                                                        |
| `values`      | —             | `string[]` | `[]`    | The selected values (multi-select mode only) — set as a property                                                                    |
| `label`       | `label`       | `string`   | `""`    | Accessible name for the group (`aria-label`)                                                                                        |
| `disabled`    | `disabled`    | `boolean`  | `false` | Cascades a disabled state down to every segment (one-way — re-enabling the group does not restore prior per-segment disabled state) |

### Slots

| Slot        | Description                    |
| ----------- | ------------------------------ |
| _(default)_ | `md-segmented-button` elements |

### Events

| Event    | Description                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `change` | Fired when the selection changes. Single-select detail: `{ value: string }`. Multi-select detail: `{ values: string[] }` |

### Keyboard navigation

Arrow Right/Down and Arrow Left/Up move roving focus between segments (wrapping at the ends), Home/End jump to the first/last segment, and disabled segments are skipped.

---

## md-segmented-button

A single segment inside an `md-segmented-button-group`. Exposes `role="radio"` + `aria-checked` in single-select mode, or native button semantics + `aria-pressed` in multi-select mode (mirrors the parent group's `multiselect`).

```html
<md-segmented-button value="music">
  <md-icon slot="icon"><svg>…</svg></md-icon>
  Music
</md-segmented-button>

<!-- Icon-only (no label content) -->
<md-segmented-button value="music">
  <md-icon slot="icon"><svg>…</svg></md-icon>
</md-segmented-button>
```

### Properties

| Property   | Attribute  | Type      | Default | Description                                                            |
| ---------- | ---------- | --------- | ------- | ---------------------------------------------------------------------- |
| `value`    | `value`    | `string`  | `""`    | The value this segment represents within its group                     |
| `selected` | `selected` | `boolean` | `false` | Whether this segment is the selected one (or one of the selected ones) |
| `disabled` | `disabled` | `boolean` | `false` | Disables the segment                                                   |

### Slots

| Slot        | Description                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| _(default)_ | Label text                                                                                            |
| `icon`      | Leading icon (wrap it in `<md-icon>`). Automatically replaced by a checkmark while `selected` is true |

---

## CSS Custom Properties

### Group (`md-segmented-button-group`)

| Variable                                    | Default                                  | Description                      |
| ------------------------------------------- | ---------------------------------------- | -------------------------------- |
| `--md-segmented-button-group-outline-color` | `--md-sys-color-outline`                 | Outer border color               |
| `--md-segmented-button-group-shape`         | `--md-sys-shape-corner-full` (`6.25rem`) | Corner radius of the whole group |
| `--md-segmented-button-group-height`        | `2.5rem`                                 | Minimum height of the group      |

### Segment (`md-segmented-button`)

| Variable                                         | Default                                                  | Description                          |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| `--md-segmented-button-label-color`              | `--md-sys-color-on-surface`                              | Label text color                     |
| `--md-segmented-button-icon-color`               | `--md-sys-color-on-surface-variant`                      | Icon color (ripple/state-layer tint) |
| `--md-segmented-button-selected-container-color` | `--md-sys-color-secondary-container`                     | Background color when selected       |
| `--md-segmented-button-selected-label-color`     | `--md-sys-color-on-secondary-container`                  | Label text color when selected       |
| `--md-segmented-button-selected-icon-color`      | `--md-sys-color-on-secondary-container`                  | Icon color when selected             |
| `--md-segmented-button-divider-color`            | `--md-sys-color-outline`                                 | Divider line color between segments  |
| `--md-segmented-button-focus-color`              | `--md-sys-color-secondary`                               | Focus-visible outline color          |
| `--md-segmented-button-inline-space`             | `1rem`                                                   | Leading/trailing padding             |
| `--md-segmented-button-block-space`              | `0.625rem`                                               | Top/bottom padding                   |
| `--md-segmented-button-label-text-font`          | `--md-sys-typescale-label-large-font`                    | Label font family                    |
| `--md-segmented-button-label-text-size`          | `--md-sys-typescale-label-large-size` (`0.875rem`)       | Label font size                      |
| `--md-segmented-button-label-text-weight`        | `--md-sys-typescale-label-large-weight` (`500`)          | Label font weight                    |
| `--md-segmented-button-label-text-line-height`   | `--md-sys-typescale-label-large-line-height` (`1.25rem`) | Label line height                    |
| `--md-segmented-button-motion-easing`            | `--md-sys-motion-easing-standard`                        | Background-color transition easing   |

## Examples

### Multi-select

```html
<md-segmented-button-group multiselect label="Text style" .values=${["bold"]}>
  <md-segmented-button value="bold">Bold</md-segmented-button>
  <md-segmented-button value="italic">Italic</md-segmented-button>
  <md-segmented-button value="underline">Underline</md-segmented-button>
</md-segmented-button-group>
```

### With leading icons

```html
<md-segmented-button-group label="Media type" value="music">
  <md-segmented-button value="music">
    <md-icon slot="icon"><svg>…</svg></md-icon>
    Music
  </md-segmented-button>
  <md-segmented-button value="movies">
    <md-icon slot="icon"><svg>…</svg></md-icon>
    Movies
  </md-segmented-button>
</md-segmented-button-group>
```

### Disabled group

```html
<md-segmented-button-group label="View density" value="day" disabled>
  <md-segmented-button value="day">Day</md-segmented-button>
  <md-segmented-button value="week">Week</md-segmented-button>
</md-segmented-button-group>
```

### A single disabled segment

```html
<md-segmented-button-group label="View density" value="day">
  <md-segmented-button value="day">Day</md-segmented-button>
  <md-segmented-button value="week" disabled>Week</md-segmented-button>
  <md-segmented-button value="month">Month</md-segmented-button>
</md-segmented-button-group>
```

### Listening for changes

```js
group.addEventListener("change", (e) => {
  // single-select: e.detail.value
  // multi-select:  e.detail.values
  console.log(e.detail);
});
```
