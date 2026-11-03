# Changelog

## 0.5.2

### Changed

- `md-text-field`: `leadingSlot` and `trailingSlot` are now read-only. They update on their own when leading or trailing content is added or removed.

### Fixed

- `md-text-field` (outlined): the border no longer runs through a floated label when the field has a placeholder but no value and no focus. The notch now opens whenever the label floats.
- `md-text-field` (outlined): a resting label no longer overlaps the leading icon. It now starts after the icon, lined up with the input text, in single-line and multiline fields.
- `md-text-field`: leading and trailing icons added after the field connects are now detected. Previously they were only read once in `connectedCallback`.

## 0.5.0

### Breaking changes

- **`md-ripple`: internals are private.** `pressed`, `hovered`, `rippleAnimation`, `mdSurfaceEl`, `myController`, `createRipple()`, `endRipple()`, `onControlChange()` and `handleEvent()` are no longer public. To check state, look for the `surface_hovered` / `surface_pressed` classes on the ripple's inner `.surface` element. To drive a ripple, point it at a control with `for` or place it inside one, then dispatch pointer events on that control.
- **`md-ripple` without `for` attaches to its parent element** (or to the shadow host when it sits directly in a shadow root). It used to listen on the whole root node: every press anywhere in the shadow root or document triggered it, and hover never worked.
- **`md-card`: `handleEvent()` and `rippleEl` are removed.** The card no longer forwards pointer events to its ripple. The ripple attaches to the card host directly and still reacts to slotted content.
- **`md-snackbar`: `--md-elevation-level` no longer sets its elevation.** The level is fixed at 3 via `<md-shadow level="3">`. Setting it on the host used to leak into slotted content too: a text button in the `action` slot would draw a shadow it shouldn't have.
- **`md-menu`, `md-rich-tooltip`**: elevation is fixed at level 2 via `<md-shadow level="2">` instead of a CSS variable on the internal `md-shadow`.

### Added

- `@symblight/wc-material/ripple` and `@symblight/wc-material/shadow` entry points.
- `md-shadow` `level` attribute (0–5). It takes priority over an inherited `--md-elevation-level`, so a fixed elevation can't leak to or from surrounding content.
- `md-shadow` story in Storybook.

### Fixed

- `md-ripple` no longer gets stuck pressed when the pointer is released outside the control or the press is cancelled (`pointerleave`, `pointercancel`).
- `md-ripple` ignores right and middle mouse buttons.
- `md-ripple` grows from the press point in RTL layouts.
- `md-radio`'s ripple now ignores a disabled radio and shows the MD3 hover state layer.
- `md-shadow` no longer intercepts clicks on content it overlaps (`pointer-events: none`).
- `md-shadow` color follows the theme (`--md-sys-color-shadow`), and `--md-shadow-color` set on an ancestor now applies.
- `md-shadow` transitions only `box-shadow` and respects `prefers-reduced-motion`.
