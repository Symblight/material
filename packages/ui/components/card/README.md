# md-card

A Material Design 3 card web component built with Lit.

Groups related content and actions on a single surface. Supports three visual variants (elevated, filled, outlined) and an optional interactive mode with ripple, hover/pressed state layer, keyboard navigation, and link behaviour.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<!-- Elevated (default) -->
<md-card>
  <p>Card content</p>
</md-card>

<!-- Filled -->
<md-card variant="filled">
  <p>Card content</p>
</md-card>

<!-- Outlined -->
<md-card variant="outlined">
  <p>Card content</p>
</md-card>
```

## Variants

| Variant    | Background                  | Elevation | Border                |
| ---------- | --------------------------- | --------- | --------------------- |
| `elevated` | `surface-container-low`     | level 2   | none                  |
| `filled`   | `surface-container-highest` | none      | none                  |
| `outlined` | `surface`                   | none      | 1px `outline-variant` |

## Interactive

```html
<!-- Clickable card with ripple and state layer -->
<md-card interactive>
  <p>Click anywhere on the card</p>
</md-card>

<!-- Link card — entire card is a clickable anchor -->
<md-card interactive href="/destination">
  <p>Navigates on click</p>
</md-card>

<!-- Disabled interactive card -->
<md-card interactive disabled>
  <p>Not clickable</p>
</md-card>
```

## Slots

| Slot        | Description                                   |
| ----------- | --------------------------------------------- |
| `header`    | Headline, subhead, or avatar area             |
| `media`     | Full-bleed image or video                     |
| _(default)_ | Body content                                  |
| `actions`   | Action buttons row (flex row, bottom of card) |

```html
<md-card>
  <div slot="header">Headline</div>
  <img slot="media" src="image.jpg" alt="..." />
  <p>Body content goes in the default slot.</p>
  <div slot="actions">
    <md-button>Action</md-button>
  </div>
</md-card>
```

## Properties

| Property      | Attribute     | Type                                   | Default      | Description                                                              |
| ------------- | ------------- | -------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `variant`     | `variant`     | `"elevated" \| "filled" \| "outlined"` | `"elevated"` | Visual style of the card                                                 |
| `interactive` | `interactive` | `boolean`                              | `false`      | Enables ripple, state layer, pointer cursor, and keyboard interaction    |
| `disabled`    | `disabled`    | `boolean`                              | `false`      | Disables the card (only has effect when `interactive` is set)            |
| `href`        | `href`        | `string`                               | —            | Renders the surface as an `<a>` element (only when `interactive` is set) |

## CSS Custom Properties

| Variable                                | Default                                     | Description                        |
| --------------------------------------- | ------------------------------------------- | ---------------------------------- |
| `--md-card-container-color`             | `var(--md-sys-color-surface-container-low)` | Card background color              |
| `--md-card-outline-color`               | `var(--md-sys-color-outline-variant)`       | Border color (outlined variant)    |
| `--md-card-shape`                       | `var(--md-sys-shape-corner-medium, 1rem)`   | Corner radius                      |
| `--md-card-state-layer-color`           | `var(--md-sys-color-on-surface)`            | Color of hover/pressed state layer |
| `--md-card-hover-state-layer-opacity`   | `0.08`                                      | Opacity of state layer on hover    |
| `--md-card-pressed-state-layer-opacity` | `0.12`                                      | Opacity of state layer on press    |
| `--md-card-focus-state-layer-opacity`   | `0.12`                                      | Opacity of state layer on focus    |
| `--md-card-focus-ring-color`            | `var(--md-sys-color-primary)`               | Focus ring color                   |
| `--md-elevation-level`                  | `2` (elevated), `0` (filled/outlined)       | Shadow elevation level             |

```html
<!-- Custom shape and color -->
<md-card style="--md-card-shape: 0.5rem; --md-card-container-color: #f5f5f5;">
  <p>Custom styled card</p>
</md-card>
```

## Accessibility

| Mode                       | Role         | Keyboard         | Tab stop                                     |
| -------------------------- | ------------ | ---------------- | -------------------------------------------- |
| Non-interactive            | none         | —                | no                                           |
| `interactive`              | `button`     | `Enter`, `Space` | yes                                          |
| `interactive` + `href`     | native `<a>` | `Enter`          | yes                                          |
| `interactive` + `disabled` | `button`     | blocked          | no (`tabindex="-1"`, `aria-disabled="true"`) |

Slotted `<img>` elements must include a descriptive `alt` attribute. For link cards, ensure slotted text provides a meaningful description of the destination.
