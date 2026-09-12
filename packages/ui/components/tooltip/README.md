# md-tooltip / md-rich-tooltip

Material Design 3 tooltips. `md-tooltip` is a short, plain-text label describing an anchor element; `md-rich-tooltip` is a larger, elevated surface that supports a subhead, longer supporting text, and up to two text-button actions. Both anchor to a trigger element resolved via the `for` attribute and share positioning, dismissal, and hover/focus-delay behavior through a common `BaseTooltip` base class.

## Installation

```bash
npm install @symblight/wc-material
```

## Import

```js
import "@symblight/wc-material"; // registers all components
// or individually:
import "@symblight/wc-material/tooltip";
```

## Basic Usage

```html
<md-icon-button id="more-actions" aria-label="More actions">
  <md-icon><!-- more_vert svg --></md-icon>
</md-icon-button>
<md-tooltip for="more-actions">More actions</md-tooltip>
```

`md-tooltip`/`md-rich-tooltip` find their trigger the same way `md-menu`/`md-ripple` do — via `for="<id>"` resolved against the host's root node (`HTMLForController`, internal to `PopoverPositionController`). The tooltip opens on `pointerenter`/`focusin` of the trigger (after `showDelay`) and closes on `pointerleave`/`focusout` (after `hideDelay`), or immediately on `Escape`. On touch, a long-press (holding past `showDelay` without moving more than ~10px) opens the tooltip instead — a plain tap does not, matching the MD3 spec's touch trigger.

## Examples

### 1. Rich tooltip with subhead and supporting text

```html
<md-button id="favorite-trigger" variant="outlined">Hover me</md-button>
<md-rich-tooltip for="favorite-trigger">
  <span slot="subhead">Add to favorites</span>
  Save this item to your favorites list so you can find it again later.
</md-rich-tooltip>
```

### 2. Rich tooltip with actions

Because `md-rich-tooltip` cancels its pending close when the pointer moves from the anchor onto its own surface, users can move the pointer across to click an action without the tooltip dismissing first.

```html
<md-button id="delete-trigger" variant="outlined">Delete</md-button>
<md-rich-tooltip for="delete-trigger">
  <span slot="subhead">Delete file?</span>
  This action can be undone from the trash for the next 30 days.
  <md-button slot="actions" variant="text" id="undo-action">Undo</md-button>
  <md-button slot="actions" variant="text" id="dismiss-action">
    Dismiss
  </md-button>
</md-rich-tooltip>

<script type="module">
  document.querySelector("#undo-action").addEventListener("click", () => {
    console.log("undo");
  });
</script>
```

### 3. Rich tooltip with no subhead (body text only)

The `subhead` row collapses entirely (no reserved space/gap) when nothing is slotted into it. The same is true of the `actions` row.

```html
<md-button id="body-only-trigger" variant="outlined">Hover me</md-button>
<md-rich-tooltip for="body-only-trigger">
  Supporting text describing this control, with no subhead.
</md-rich-tooltip>
```

### 4. Non-default placement and positioning

`placement` accepts any floating-ui placement (`"top"`, `"bottom-start"`, `"left"`, `"right-end"`, etc.); `positioning="fixed"` renders the surface via `position: fixed` instead of the native Popover API top layer.

```html
<md-button id="bottom-trigger" variant="outlined">Hover me</md-button>
<md-tooltip for="bottom-trigger" placement="bottom" positioning="fixed">
  Tooltip below the anchor
</md-tooltip>
```

### 5. Instant tooltip (no delay)

Set `show-delay`/`hide-delay` to `0` to show/hide immediately instead of the MD3 default hover-intent delays.

```html
<md-button id="instant-trigger" variant="outlined">Hover me</md-button>
<md-tooltip for="instant-trigger" show-delay="0" hide-delay="0">
  Instant tooltip
</md-tooltip>
```

### 6. Imperative show()/hide()

```js
const tooltip = document.querySelector("md-tooltip");
tooltip.show(); // opens immediately, bypassing showDelay
tooltip.hide(); // closes immediately, bypassing hideDelay
```

### CSS custom property overrides

```html
<md-tooltip
  for="trigger"
  style="
    --md-tooltip-container-color: #1a1a1a;
    --md-tooltip-shape: 0.5rem;
  "
>
  Custom styled tooltip
</md-tooltip>
```

---

## API — shared (`BaseTooltip`)

Both `md-tooltip` and `md-rich-tooltip` extend `BaseTooltip`, which owns positioning/anchor-resolution/dismiss (delegated to `PopoverPositionController`, the same primitive `md-menu` uses), hover/focus show+hide delays, Escape-to-dismiss, and `role="tooltip"`/`aria-describedby` wiring.

### Properties

| Property      | Attribute     | Type                                               | Default     | Description                                                                                                                                                       |
| ------------- | ------------- | -------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`        | `open`        | `boolean`                                          | `false`     | Whether the tooltip is open. Reflects as an attribute.                                                                                                            |
| `placement`   | `placement`   | `Placement` (floating-ui, e.g. `"top"`)            | `"top"`     | Preferred position relative to the anchor.                                                                                                                        |
| `offset`      | `offset`      | `number`                                           | `4`         | Main-axis distance (px) between the anchor and the tooltip surface.                                                                                               |
| `flip`        | `flip`        | `boolean`                                          | `true`      | Whether floating-ui may flip `placement` to stay in the viewport.                                                                                                 |
| `positioning` | `positioning` | `"absolute" \| "fixed" \| "document" \| "popover"` | `"popover"` | Positioning strategy — same semantics as `md-menu`'s `positioning`. `"popover"` uses the native Popover API and falls back to `"fixed"` on unsupported browsers.  |
| `showDelay`   | `show-delay`  | `number`                                           | `500`       | Milliseconds to wait after `pointerenter`/`focusin` of the anchor before opening. On touch, this same value is the long-press duration (see Accessibility below). |
| `hideDelay`   | `hide-delay`  | `number`                                           | `300`       | Milliseconds to wait after `pointerleave`/`focusout` of the anchor before closing. Not used for touch, which has no sustained hover state to leave.               |

`for` (the anchor's `id`) is read once off the attribute on connect rather than declared as a reactive property — same convention as `md-menu`.

### Methods

| Method   | Returns | Description                                                                                                                                                                                                                                                                                                            |
| -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `show()` | `void`  | Opens the tooltip immediately, bypassing `showDelay`.                                                                                                                                                                                                                                                                  |
| `hide()` | `void`  | Closes the tooltip immediately, bypassing `hideDelay`. If focus is currently inside the tooltip's own surface (e.g. a rich tooltip's action button), focus is returned to the anchor afterward. A hover-driven close (mouse `pointerleave`/`hideDelay` elapsing) never goes through `hide()` and so never moves focus. |

---

## API — md-tooltip

Non-interactive (`pointer-events: none`) — a single default slot holding a short, plain-text label. Inherits all properties/methods from `BaseTooltip` above; adds no properties of its own.

### Slots

| Slot        | Description      |
| ----------- | ---------------- |
| _(default)_ | Plain-text label |

### CSS Parts

| Part      | Element | Description                            |
| --------- | ------- | -------------------------------------- |
| `surface` | `<div>` | The tooltip's background/label surface |

### CSS Custom Properties

| Property                              | Default                                                 | Description                                                  |
| ------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| `--md-tooltip-container-color`        | `var(--md-sys-color-inverse-surface)`                   | Surface background color                                     |
| `--md-tooltip-label-text-color`       | `var(--md-sys-color-inverse-on-surface)`                | Label text color                                             |
| `--md-tooltip-shape`                  | `var(--md-sys-shape-corner-extra-small, 0.25rem)`       | Corner radius                                                |
| `--md-tooltip-label-text-font`        | `var(--md-sys-typescale-body-small-font, inherit)`      | Label font family                                            |
| `--md-tooltip-label-text-size`        | `var(--md-sys-typescale-body-small-size, 0.75rem)`      | Label font size                                              |
| `--md-tooltip-label-text-line-height` | `var(--md-sys-typescale-body-small-line-height, 1rem)`  | Label line height                                            |
| `--md-tooltip-label-text-weight`      | `var(--md-sys-typescale-body-small-weight, 400)`        | Label font weight                                            |
| `--md-tooltip-label-text-tracking`    | `var(--md-sys-typescale-body-small-tracking, 0.025rem)` | Label letter spacing                                         |
| `--md-tooltip-z-index`                | `1000`                                                  | Stacking order for `fixed`/`absolute`/`document` positioning |

The surface's max width is fixed at `15.625rem` (250dp, the MD3 plain-tooltip maximum) and is not exposed as a custom property.

---

## API — md-rich-tooltip

Interactive (`pointer-events: auto`) — an elevated card surface (via `md-shadow`, the same elevation language as `md-menu`'s card) that can hold an optional subhead, longer supporting/body text, and up to two text-button actions. Moving the pointer from the anchor onto the surface itself cancels the pending close instead of dismissing it, so the user can reach the action buttons; outside click/focus-out dismissal is still handled by the underlying `PopoverPositionController`. Inherits all properties/methods from `BaseTooltip` above; adds no properties of its own.

### Slots

| Slot        | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `subhead`   | Optional short title above the supporting text                  |
| _(default)_ | Supporting/body text                                            |
| `actions`   | Up to two text-button actions (e.g. `md-button variant="text"`) |

The `subhead` and `actions` rows are hidden entirely (no reserved space) when nothing is slotted into them.

### CSS Parts

| Part      | Element | Description                            |
| --------- | ------- | -------------------------------------- |
| `surface` | `<div>` | The card surface wrapping everything   |
| `subhead` | `<div>` | Wrapper around the `subhead` slot      |
| `body`    | `<div>` | Wrapper around the default (body) slot |
| `actions` | `<div>` | Wrapper around the `actions` slot      |

### CSS Custom Properties

| Property                                        | Default                                                    | Description                              |
| ----------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `--md-rich-tooltip-container-color`             | `var(--md-sys-color-surface-container)`                    | Card background color                    |
| `--md-rich-tooltip-subhead-color`               | `var(--md-sys-color-on-surface)`                           | Subhead text color                       |
| `--md-rich-tooltip-supporting-text-color`       | `var(--md-sys-color-on-surface-variant)`                   | Body text color                          |
| `--md-rich-tooltip-shape`                       | `var(--md-sys-shape-corner-medium, 0.75rem)`               | Corner radius                            |
| `--md-rich-tooltip-min-width`                   | `12.5rem` (200dp)                                          | Minimum inline size of the surface       |
| `--md-rich-tooltip-max-width`                   | `20rem` (320dp)                                            | Maximum inline size of the surface       |
| `--md-rich-tooltip-subhead-font`                | `var(--md-sys-typescale-title-small-font, inherit)`        | Subhead font family                      |
| `--md-rich-tooltip-subhead-size`                | `var(--md-sys-typescale-title-small-size, 0.875rem)`       | Subhead font size                        |
| `--md-rich-tooltip-subhead-line-height`         | `var(--md-sys-typescale-title-small-line-height, 1.25rem)` | Subhead line height                      |
| `--md-rich-tooltip-subhead-weight`              | `var(--md-sys-typescale-title-small-weight, 500)`          | Subhead font weight                      |
| `--md-rich-tooltip-supporting-text-font`        | `var(--md-sys-typescale-body-medium-font, inherit)`        | Body font family                         |
| `--md-rich-tooltip-supporting-text-size`        | `var(--md-sys-typescale-body-medium-size, 0.875rem)`       | Body font size                           |
| `--md-rich-tooltip-supporting-text-line-height` | `var(--md-sys-typescale-body-medium-line-height, 1.25rem)` | Body line height                         |
| `--md-rich-tooltip-supporting-text-weight`      | `var(--md-sys-typescale-body-medium-weight, 400)`          | Body font weight                         |
| `--md-elevation-level`                          | `2` (set on `.md-rich-tooltip__card`)                      | Shadow elevation level (via `md-shadow`) |

`--md-tooltip-z-index` (from `base-tooltip.css`, shared with `md-tooltip`) also applies to `md-rich-tooltip`'s stacking order for `fixed`/`absolute`/`document` positioning.

---

## Accessibility

| Aspect               | Detail                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host role            | `role="tooltip"`, set once on connect                                                                                                                                                                                                                                                                                                                                             |
| Anchor ARIA          | `aria-describedby` set on the `for`-resolved anchor, pointing at the tooltip's `id` (auto-generated if the tooltip has none). Appended to any pre-existing `aria-describedby` token list (e.g. a form control's own helper-text description) rather than overwriting it, and only the tooltip's own token is removed on disconnect — the rest of the attribute is left as it was. |
| Show trigger         | `pointerenter` or `focusin` on the anchor, opening after `showDelay`; on touch, a long-press (`pointerdown` held past `showDelay` without moving more than ~10px) — a plain tap does not open it                                                                                                                                                                                  |
| Hide trigger         | `pointerleave` or `focusout` on the anchor, closing after `hideDelay`; re-entering before `hideDelay` elapses cancels the pending close. Focus moving from the anchor into the tooltip's own surface (e.g. Tab into a rich tooltip's action button) does not schedule a close                                                                                                     |
| Rich tooltip surface | Moving the pointer from the anchor onto the `md-rich-tooltip` surface cancels the pending close (instead of dismissing), so the user can reach action buttons                                                                                                                                                                                                                     |
| Keyboard dismiss     | `Escape` closes an open tooltip immediately, regardless of anchor focus. If focus was inside the tooltip's own surface at the time (e.g. a rich tooltip's action button), focus is returned to the anchor afterward instead of being dropped to `<body>`                                                                                                                          |
| Imperative dismiss   | `show()`/`hide()` bypass the show/hide delays entirely; `hide()` returns focus to the anchor under the same focus-inside-surface condition as Escape                                                                                                                                                                                                                              |
| Reduced motion       | `prefers-reduced-motion: reduce` disables the open/close scale/opacity transition                                                                                                                                                                                                                                                                                                 |

`md-tooltip` never receives pointer events itself (`pointer-events: none`), so it cannot be a keyboard focus stop; `md-rich-tooltip`'s action buttons (typically `md-button`) are independently focusable/tabbable as normal interactive elements once the tooltip is open.

## Related Components

- [`md-menu`](../menu/README.md) — shares `PopoverPositionController`, `for`-attribute anchor resolution, and the `"popover"`/`"fixed"`/`"absolute"`/`"document"` `positioning` semantics
- `md-shadow` — used internally by `md-rich-tooltip` for its elevation
- [`md-button`](../button/README.md) — suitable for `md-rich-tooltip`'s `actions` slot (`variant="text"`)
- [`md-icon-button`](../icon-button/README.md) — common `md-tooltip` anchor for icon-only controls
