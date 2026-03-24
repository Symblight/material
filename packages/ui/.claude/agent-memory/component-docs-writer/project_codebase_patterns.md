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

Observed across button, card, and list:

- `icon` — leading icon in buttons (single slot, not split)
- `header` — card headline/subhead/avatar area
- `media` — full-bleed image/video
- `actions` — bottom row of action buttons
- `leading` / `trailing` — generic leading/trailing zones in `md-list-item` (current source)
- `overline` — small metadata text above label in list items
- `supporting-text` — secondary text below label in list items

**Note — list slot API divergence:** The `list-item.spec.ts` test file expects granular named slots (`leading-icon`, `leading-avatar`, `leading-media`, `leading-selection`, `trailing-icon`, `trailing-text`, `trailing-selection`) that do NOT yet exist in `list-item.ts`. The current source only implements `leading` and `trailing`. The tests reflect a planned future API, not the shipped implementation. Document only what the source implements; flag the gap.

**Why:** Discovered during md-list README authoring (2026-03-24).

**How to apply:** Follow these patterns exactly when implementing new components or writing documentation. When the list-item source is updated to add granular slots, the README will need updating too.
