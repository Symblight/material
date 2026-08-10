---
name: project_js_not_ts
description: Codebase actually uses .js files with JSDoc types (allowJs/checkJs), not .ts, despite CLAUDE.md describing TypeScript
type: project
---

Despite CLAUDE.md's component skeleton examples showing `.ts` files with real TypeScript syntax
(`@customElement`, `@property()` decorators imported from `lit/decorators.js`), every actual
component in `components/**` (button, chips, select, tabs, list, radio-button, etc.) is a `.js`
file using JSDoc annotations for types, e.g. `/** @type {import("lit").PropertyDeclarations} */`
above `static properties = {...}`, `/** @import Foo from "./foo.js" */` for type-only imports,
and `/** @param {Event} e */` on methods. Class field properties are NOT typed with `@property()`
decorators — they use the plain Lit `static properties = {...}` object map instead. The
`@customElement("md-x")` decorator IS still used (imported from `lit/decorators.js`) and does
work in plain `.js` — confirmed via `tsconfig.json`: `allowJs: true`, `checkJs: true`,
`experimentalDecorators: false` (so these must be standard/TC39 decorators supported by the
Vite/esbuild build, not TS legacy decorators).

**Why:** Not stated by the user — discovered by reading actual source during a planning task for
`md-segmented-button-group` (2026-08-08). CLAUDE.md's `.ts` examples appear aspirational/template
text rather than descriptive of current reality.

**How to apply:** When scaffolding a new component, mirror the `.js` + JSDoc pattern actually used
in sibling components (base-button.js, base-chip.js, tabs.js, list.js) rather than CLAUDE.md's
`.ts` skeleton. If a task explicitly requests `.ts`, flag the mismatch to the user rather than
silently picking one. Re-verify this is still true before relying on it, in case the codebase
migrates to real `.ts` later.

**Corollary — `HTMLElementTagNameMap` is centralized, not per-file.** Because components are
`.js`, they cannot contain a `declare global { ... }` block at all — that's TS-only syntax and is
a hard syntax error in a plain `.js` file (confirmed by tripping on this directly while building
`md-segmented-button`/`md-segmented-button-group`: I initially copied the `declare global` snippet
from CLAUDE.md's skeleton into the new `.js` files and had to revert it). Neither `button.js` nor
`tabs.js`/`tab.js` declare `HTMLElementTagNameMap` inline — every custom element's tag-to-class
mapping is registered once in `components/elements.d.ts` (import the class, add one line to the
`declare global { interface HTMLElementTagNameMap { ... } }` block there). Always edit
`elements.d.ts` for this, never write `declare global` inside a component `.js` file.
