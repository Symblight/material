---
name: wc-material codebase patterns
description: Recurring implementation patterns discovered across the @symblight/wc-material component library
type: project
---

## CSS import convention

All CSS files use the `?inline` Vite query: `import styles from "./foo.css?inline"`.
`rollup-plugin-postcss-lit` transforms these into Lit CSSResult objects.
Multiple variant CSS files are merged in `static get styles()` — order: variant files first, then base/shared file last.

## md-shadow wiring

`md-shadow` reads `--md-elevation-level` from its `:host` context.
It must be the first element in the shadow root render output so it sits behind content.
Set `--md-elevation-level: 1` on `:host` for elevated, `0` for filled/outlined.
Hover state increments the level (1→2); active returns it (2→1).

## md-ripple wiring

`md-ripple` uses `HTMLForController` which resolves the `for` attribute to an element `id` within the same shadow root.
Pattern: `<md-ripple for="some-id"></md-ripple>` + `<div id="some-id">`.
Ripple listens for pointerdown/pointerup/pointerenter/pointerleave on the target element.
Only render ripple conditionally (when interactive && !disabled) using Lit `when` directive.

## BaseButton pattern

`BaseButton` provides: disabled, loading, href, type, form, focus tracking, slot observation (MutationController), click→form-submit wiring.
Leaf button component adds: variant property, per-variant CSS files, render() with md-shadow + md-ripple + button/anchor.
When href is set, renders `<a role="button">` instead of `<button>`.

## classMap for state classes

All components use `classMap` from `lit/directives/class-map.js` for conditional classes.
Convention: class names use BEM-style underscores (e.g. `button_disabled`, `card_interactive`).

## Barrel registration

All components self-register via `@customElement("md-*")`.
They are side-effect imported in `components/index.ts` for the "register all" bundle entry point.

## HTMLElementTagNameMap

Every component declares itself in the global `HTMLElementTagNameMap` at the bottom of its file for TypeScript support.

## Token naming convention

- Component-scoped public tokens: `--md-<component>-<property>` (e.g. `--md-card-shape`, `--md-badge-color`)
- System tokens: `--md-sys-color-*`, `--md-sys-shape-*`, `--md-sys-typescale-*`
- Internal (private) tokens: `--_<property>` (single underscore prefix, not for external use)
- Elevation: `--md-elevation-level` (shared, not component-scoped)

## Slot naming convention

Observed across button and planned card:

- `icon` — leading icon in buttons
- `header` — card headline/subhead/avatar area
- `media` — full-bleed image/video
- `actions` — bottom row of action buttons
  No "leading-icon" / "trailing-icon" split has been used yet; button uses a single `icon` slot.

**Why:** Documented after reading badge, button, base-button, shadow, and ripple source during card README authoring.

**How to apply:** Follow these patterns exactly when implementing new components or writing documentation.
