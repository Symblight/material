# Chips

Material Design 3 chip components built with Lit. Chips are compact elements that represent an input, attribute, or action.

[MD3 Chips guidelines](https://m3.material.io/components/chips/guidelines)

## Components

| Tag | Description |
|---|---|
| `md-assist-chip` | Suggests smart or automated actions |
| `md-filter-chip` | Toggleable tag for filtering content |
| `md-input-chip` | Represents a piece of user-entered input (e.g. a tag or contact) |
| `md-suggestion-chip` | Presents dynamically generated suggestions |

## Usage

```html
<script type="module" src="path/to/wc-material/dist/chips/index.js"></script>

<md-assist-chip>Add to calendar</md-assist-chip>
<md-filter-chip>Clothes</md-filter-chip>
<md-input-chip removable>React</md-input-chip>
<md-suggestion-chip>Good morning!</md-suggestion-chip>
```

---

## md-assist-chip

Suggests smart or automated actions. Not toggleable.

```html
<md-assist-chip variant="outlined">Add to calendar</md-assist-chip>
<md-assist-chip variant="elevated">Get directions</md-assist-chip>

<!-- With leading icon -->
<md-assist-chip variant="outlined">
  <span slot="leading-icon"><svg>…</svg></span>
  Add to calendar
</md-assist-chip>
```

### Properties

| Property  | Attribute | Type                       | Default      | Description          |
|-----------|-----------|----------------------------|--------------|----------------------|
| `variant` | `variant` | `"outlined" \| "elevated"` | `"outlined"` | Visual style variant |
| `disabled`| `disabled`| `boolean`                  | `false`      | Disables the chip    |

---

## md-filter-chip

Toggleable chip for filtering. Shows `leading-icon` slot when unselected, `selected-icon` slot when selected.

```html
<md-filter-chip>All</md-filter-chip>
<md-filter-chip selected>
  <span slot="selected-icon"><svg>…</svg></span>
  Nearby
</md-filter-chip>

<!-- With unselected icon -->
<md-filter-chip>
  <span slot="leading-icon"><svg>…</svg></span>
  Price
</md-filter-chip>
```

### Properties

| Property  | Attribute | Type                       | Default      | Description                    |
|-----------|-----------|----------------------------|--------------|--------------------------------|
| `variant` | `variant` | `"outlined" \| "elevated"` | `"outlined"` | Visual style variant           |
| `selected`| `selected`| `boolean`                  | `false`      | Whether the chip is toggled on |
| `disabled`| `disabled`| `boolean`                  | `false`      | Disables the chip              |

### Slots

| Slot            | Description                                  |
|-----------------|----------------------------------------------|
| *(default)*     | Label text                                   |
| `leading-icon`  | Icon shown when the chip is **not** selected |
| `selected-icon` | Icon shown when the chip **is** selected     |

### Events

| Event    | Description                             |
|----------|-----------------------------------------|
| `change` | Fired when `selected` toggles via click |

---

## md-input-chip

Represents a piece of user-entered information. Supports a leading icon or avatar, and an optional built-in remove button.

```html
<!-- With built-in remove button -->
<md-input-chip removable>TypeScript</md-input-chip>

<!-- Selected -->
<md-input-chip removable selected>React</md-input-chip>

<!-- With leading icon -->
<md-input-chip removable>
  <span slot="leading-icon"><svg>…</svg></span>
  Design
</md-input-chip>

<!-- With avatar -->
<md-input-chip removable avatar>
  <img slot="avatar" src="avatar.jpg" alt="Jane Doe" />
  Jane Doe
</md-input-chip>

<!-- Custom trailing icon (when removable is not set) -->
<md-input-chip>
  <span slot="trailing-icon"><svg>…</svg></span>
  Custom
</md-input-chip>
```

### Properties

| Property   | Attribute  | Type      | Default | Description                                                       |
|------------|------------|-----------|---------|-------------------------------------------------------------------|
| `removable`| `removable`| `boolean` | `false` | Shows a built-in close (×) button that fires the `remove` event  |
| `selected` | `selected` | `boolean` | `false` | Whether the chip is selected                                      |
| `avatar`   | `avatar`   | `boolean` | `false` | Renders the `avatar` slot instead of `leading-icon`              |
| `disabled` | `disabled` | `boolean` | `false` | Disables the chip and the remove button                          |

### Slots

| Slot            | Description                                                                |
|-----------------|----------------------------------------------------------------------------|
| *(default)*     | Label text                                                                 |
| `leading-icon`  | Leading icon (18dp). Not rendered when `avatar` is set                    |
| `avatar`        | Circular avatar (24dp). Only rendered when `avatar` attribute is set      |
| `trailing-icon` | Custom icon inside the remove button (only used when `removable` is unset)|

### Events

| Event    | Description                             |
|----------|-----------------------------------------|
| `change` | Fired when `selected` toggles via click |
| `remove` | Fired when the remove button is clicked |

---

## md-suggestion-chip

Presents AI-generated or dynamic suggestions. Not toggleable.

```html
<md-suggestion-chip variant="outlined">Good morning!</md-suggestion-chip>
<md-suggestion-chip variant="elevated">Set a reminder</md-suggestion-chip>

<!-- With leading icon -->
<md-suggestion-chip>
  <span slot="leading-icon"><svg>…</svg></span>
  AI suggestion
</md-suggestion-chip>
```

### Properties

| Property  | Attribute | Type                       | Default      | Description          |
|-----------|-----------|----------------------------|--------------|----------------------|
| `variant` | `variant` | `"outlined" \| "elevated"` | `"outlined"` | Visual style variant |
| `disabled`| `disabled`| `boolean`                  | `false`      | Disables the chip    |

---

## CSS Custom Properties

| Variable                      | Default                                 | Description          |
|-------------------------------|-----------------------------------------|----------------------|
| `--md-chip-container-color`   | `--md-sys-color-surface-container-low`  | Background color     |
| `--md-chip-label-color`       | `--md-sys-color-on-surface-variant`     | Label text color     |
| `--md-chip-border-color`      | `--md-sys-color-outline`                | Border color         |
| `--md-chip-border-width`      | `0.063rem`                              | Border width         |
| `--md-chip-border-radius`     | `--md-sys-shape-corner-small`           | Corner radius        |
| `--md-chip-height`            | `2rem`                                  | Chip height (32dp)   |
| `--md-chip-icon-size`         | `1.125rem`                              | Icon size (18dp)     |
| `--md-chip-icon-color`        | `--md-sys-color-primary`                | Icon color           |
| `--md-chip-label-text-size`   | `--md-sys-typescale-label-large-size`   | Label font size      |
| `--md-chip-label-text-weight` | `--md-sys-typescale-label-large-weight` | Label font weight    |
