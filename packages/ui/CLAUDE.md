# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Full build (wireit: vite build → CSS build)
pnpm sb               # Start Storybook on port 6006
pnpm test             # Run tests with @web/test-runner (Playwright/Chromium)
pnpm lint             # ESLint on .ts files
pnpm format           # Prettier
```

To run a single test file:
```bash
pnpm web-test-runner components/button/__tests__/button.spec.ts --node-resolve
```

## Architecture

This is `@symblight/wc-material` — a Material Design 3 web components library built with **Lit**.

### Component conventions

- Each component lives under `components/<name>/` with a `<name>.ts` and one or more `.css` files
- Custom elements use the `md-*` prefix (e.g. `md-button`, `md-text-field`)
- Components are registered via `@customElement("md-<name>")` and declared in `HTMLElementTagNameMap` for TypeScript support
- CSS files are imported with the `?inline` query (`import styles from "./button.css?inline"`) — `rollup-plugin-postcss-lit` transforms them into Lit `CSSResult` objects
- Multiple CSS files per component are merged in `static get styles()` (e.g. button has per-variant CSS files: `filled-button.css`, `outlined-button.css`, etc.)
- Storybook stories live in `components/<name>/stories/`; tests in `components/<name>/__tests__/`

### Base classes and shared primitives

- `BaseButton` (`components/button/base-button.ts`) — shared logic for buttons: `disabled`, `loading`, `href`, `type`, form submit, focus tracking, slot observation
- `BaseMdChip` (`components/chips/base/base-chip.ts`) — shared base for all chip variants
- `md-shadow` (`components/shadow/shadow.ts`) — elevation shadow element used inside buttons and cards
- `md-ripple` (`components/ripple/ripple.ts`) — Material ripple effect; attaches to a sibling element via a `for` attribute resolved by `HTMLForController`
- `HTMLForController` (`components/html-for-controller/html-for-controller.ts`) — Lit `ReactiveController` that finds an element by `for` attribute within the same shadow root and wires up event listeners

### State and context

- `@lit/context` is used for parent→child communication (e.g. `selectContext` in `md-select`)
- `@lit-labs/observers/mutation-controller` is used where slot content mutations must be tracked
- Form-associated components use `ElementInternals` (`this.attachInternals()`) and expose `formResetCallback()`

### Build pipeline

The build is orchestrated by **wireit**:
1. `build-ts` — runs `vite build`, outputs JS/TS to `dist/`
2. `build` — depends on `build-ts`, then runs `scripts/build-css.mjs` to bundle `theme.css` via esbuild and post-process with PostCSS into `dist/theme.css`

The library entry point is `components/index.ts`, which side-effect-imports every component to register it. The package exports:
- `.` → `dist/index.es.js` (ES module)
- `./theme/theme.css` → `dist/theme.css`

### Testing

Tests use `@open-wc/testing` (`fixture`, `expect`) with `@web/test-runner` and Playwright (Chromium). Test files match `**/*test.ts` or `**/*.spec.ts`.
