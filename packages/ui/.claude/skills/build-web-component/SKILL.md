---
name: build-web-component
description: >
  Use this skill whenever the user wants to build, scaffold, or modify a Material Design 3 web component using Lit and TypeScript. Triggers include: creating a new component (button, checkbox, avatar, card, chip, dialog, fab, icon, list, menu, navigation, progress, radio, select, slider, snackbar, switch, tabs, text-field, tooltip), adding features to an existing Lit component, writing CSS for a web component using BEM and CSS custom properties, reviewing or refactoring component code for MD3 compliance, or any mention of `LitElement`, `@customElement`, `CSSResultGroup`, MD3 tokens, or Material web components. Always use this skill when the user asks to "create a component", "build a web component", or references the m3.material.io design system.
---

# Build Material Web Component (Lit + MD3)

## Stack

| Layer | Technology |
|---|---|
| Base class | `LitElement` (Lit 3.x) |
| Language | TypeScript |
| Styling | CSS files, BEM methodology, imported inline |
| Design system | Material Design 3 — https://m3.material.io/ |
| Tokens | MD3 sys/ref/comp tokens via CSS custom properties |

---

## File Structure

```
src/components/<component-name>/
├── <component-name>.ts        # LitElement class
└── <component-name>.css       # Component styles (BEM + custom props)
```

Global token file (read-only, never edit):
```
/theme.css            # --md-sys-color-*, --md-sys-typescale-*, etc.
```

---

## Component TypeScript Template

```ts
import { LitElement, html, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./<component-name>.css?inline";

@customElement("md-<component-name>")
export class Md<ComponentName> extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles];
  }

  // Public API — reflect simple primitives to attributes
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = "";

  // Internal state — never reflected
  @state() private _focused = false;

  render() {
    return html`
      <div
        class="<component-name>
               ${this.disabled ? "<component-name>_disabled" : ""}
               ${this._focused ? "<component-name>_focused" : ""}"
      >
        <!-- slots, icons, ripple, etc. -->
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-<component-name>": Md<ComponentName>;
  }
}
```

---

## CSS Conventions

### 1. Import (always `?inline`)

```ts
import styles from "./<component-name>.css?inline";
```

### 2. `:host` — internal custom properties + size/display defaults

Define **internal** shorthand variables in `:host`. Map them from MD3 sys/ref tokens.
Use `color-mix(in oklch, …)` for alpha/blending. Use `:where()` for zero-specificity
overrides that a parent theme can easily beat.

```css
:host {
  /* Internal custom props — component-scoped */
  --md-checkbox-size: 18px;
  --md-checkbox-container-color: var(--md-sys-color-surface-variant);
  --md-checkbox-outline-color: color-mix(
    in oklch,
    var(--md-sys-color-on-surface),
    transparent 40%
  );
  --md-checkbox-check-color: var(--md-sys-color-on-primary);

  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
```

### 3. BEM naming

```
Block:    .<component-name>           e.g. .checkbox
Element:  .<block>__<element>         e.g. .checkbox__input
Modifier: .<block>__<element>_<mod>   e.g. .checkbox__input_focused
          .<block>_<mod>              e.g. .checkbox_disabled
```

**No camelCase, no double underscores on modifiers.**

```css
.checkbox { }
.checkbox_disabled { opacity: 0.38; pointer-events: none; }

.checkbox__input { }
.checkbox__input_focused { outline: 2px solid var(--md-sys-color-primary); }

.checkbox__icon { }
```

### 4. `:where()` for reusable / overridable rules

Use `:where()` when the rule should have **zero added specificity** so a consumer
or parent theme can override without `!important`:

```css
:where(.checkbox__input) {
  width: var(--md-checkbox-size);
  height: var(--md-checkbox-size);
  border-radius: 2px;
}
```

### 5. `color-mix` patterns

```css
/* 80 % transparent overlay */
color-mix(in oklch, var(--md-sys-color-primary), transparent 80%)

/* Blend two role colors */
color-mix(in oklch, var(--md-sys-color-error), var(--md-sys-color-surface) 30%)
```

### 6. State layers (MD3 pattern)

```css
.checkbox__state-layer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}

.checkbox:hover .checkbox__state-layer   { opacity: 0.08; }
.checkbox:active .checkbox__state-layer  { opacity: 0.12; }
.checkbox_focused .checkbox__state-layer { opacity: 0.12; }
```

---

## MD3 Token Reference (most-used)

```
Color roles (--md-sys-color-*)
  primary / on-primary / primary-container / on-primary-container
  secondary / on-secondary / secondary-container / on-secondary-container
  tertiary / on-tertiary / tertiary-container / on-tertiary-container
  error / on-error / error-container / on-error-container
  surface / on-surface / surface-variant / on-surface-variant
  outline / outline-variant
  inverse-surface / inverse-on-surface / inverse-primary
  background / on-background
  shadow / scrim

Typescale (--md-sys-typescale-<role>-<property>)
  display-large / display-medium / display-small
  headline-large / headline-medium / headline-small
  title-large / title-medium / title-small
  label-large / label-medium / label-small
  body-large / body-medium / body-small
  Properties: font / line-height / size / tracking / weight

Elevation (--md-sys-elevation-level0 … level5)
Shape (--md-sys-shape-corner-<none|extra-small|small|medium|large|extra-large|full>)
Motion (--md-sys-motion-easing-* / --md-sys-motion-duration-*)
```

Full token list: https://m3.material.io/foundations/design-tokens/overview

---

## Checklist Before Finishing a Component

- [ ] `:host` declares all internal `--md-<name>-*` custom properties
- [ ] Every color references a `--md-sys-color-*` token (no raw hex)
- [ ] BEM class names — no camelCase, no inline styles
- [ ] `?inline` import, `static get styles()` returns array
- [ ] State layers for hover / focus / pressed / dragged
- [ ] `:where()` wraps rules intended to be overridable by parents
- [ ] `color-mix(in oklch, …)` for alpha variants
- [ ] `disabled` state reduces opacity to 0.38 and blocks pointer events
- [ ] `@customElement`, global `HTMLElementTagNameMap` declaration present
- [ ] Component name prefixed `md-`

---

## Reference Files

- `references/md3-components.md` — MD3 component anatomy cheat-sheet (read when building a specific component type for first time)
- https://m3.material.io/ — authoritative design spec (fetch when in doubt about interaction model, states, or anatomy)