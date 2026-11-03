# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Full build (wireit: vite build → CSS build)
pnpm sb               # Start Storybook on port 6006
pnpm test             # Run tests with @web/test-runner (local Chrome)
pnpm lint             # ESLint on .js files (parsed with @typescript-eslint/parser for decorator syntax)
pnpm typecheck        # tsc --noEmit over JSDoc types (first CI step)
pnpm format           # Prettier
```

To run a single test file:

```bash
pnpm web-test-runner components/button/__tests__/button.spec.js --node-resolve
```

Tests run in the locally installed Google Chrome via `@web/test-runner`'s default Chrome launcher (no Playwright). Set `CHROME_PATH` if Chrome isn't in a standard location. The husky pre-commit hook runs `pnpm test`, so commits fail without it.

## Architecture

This is `@symblight/wc-material` — a Material Design 3 web components library built with **Lit**.

Source is **plain JavaScript with JSDoc types**, not TypeScript. Write `.js` files and type them with JSDoc (`/** @type {...} */`, `/** @import {X} from "..." */`). The only `.ts` sources are the declaration files `components/types.d.ts` and `components/elements.d.ts`. Babel (via `vite-plugin-babel`) compiles the decorators.

### Component conventions

- Each component lives under `components/<name>/` with a `<name>.js` and one or more `.css` files
- Custom elements use the `md-*` prefix (e.g. `md-button`, `md-text-field`)
- Components are registered via `@customElement("md-<name>")` (the only decorator in use). Reactive properties are declared with `static properties = { ... }`, not `@property`
- Add new elements to the `HTMLElementTagNameMap` declarations in `components/elements.d.ts`
- CSS files are imported with the `?inline` query (`import styles from "./button.css?inline"`) — `rollup-plugin-postcss-lit` transforms them into Lit `CSSResult` objects
- SVG icons are imported as strings with `?raw` (`import errorIcon from "@material-design-icons/svg/filled/error.svg?raw"`) and rendered with `unsafeSVG()` inside `md-icon`
- Multiple CSS files per component are merged in `static get styles()` (e.g. button has per-variant CSS files: `filled-button.css`, `outlined-button.css`, etc.)
- Storybook stories live in `components/<name>/stories/`; tests in `components/<name>/__tests__/`
- Private fields and methods use native `#name`, never `_name`. This includes internal render state (e.g. "slot has content" flags): store it in a `#field` and call `this.requestUpdate()` when it changes, instead of declaring a `_name: { state: true }` reactive property

### Base classes and shared primitives

- `BaseButton` (`components/button/base-button.js`) — shared logic for buttons: `disabled`, `loading`, `href`, `type`, form submit, focus tracking, slot observation
- `BaseMdChip` (`components/chips/base/base-chip.js`, default export) — shared base for all chip variants
- `md-shadow` (`components/shadow/shadow.js`) — elevation shadow element used inside buttons and cards
- `md-ripple` (`components/ripple/ripple.js`) — Material ripple effect; attaches to a sibling element via a `for` attribute resolved by `HTMLForController`
- `HTMLForController` (`components/html-for-controller/html-for-controller.js`) — Lit `ReactiveController` that finds an element by `for` attribute within the same shadow root and wires up event listeners

### State and context

- `@lit/context` is used for parent→child communication (e.g. `selectContext` in `md-select`)
- `@lit-labs/observers/mutation-controller` is used where slot content mutations must be tracked
- Form-associated components use `ElementInternals` (`this.attachInternals()`) and expose `formResetCallback()`

### Build pipeline

The build is orchestrated by **wireit**:

1. `build-ts` — runs `vite build` with `preserveModules`, outputs per-component JS plus `.d.ts` (via `vite-plugin-dts`) to `dist/`
2. `build` — depends on `build-ts`, then runs `scripts/build-css.mjs` to bundle `theme.css` via esbuild and post-process with PostCSS into `dist/theme.css`

The library entry point is `components/index.js`, which side-effect-imports every component to register it. The package exports:

- `.` → `dist/index.js` (ES module)
- one subpath per component, e.g. `./card` → `dist/card/card2.js`. Add a matching entry to `package.json` `exports` when you add a component
- `./theme/theme.css` → `dist/theme.css`

### Testing

Tests use `@open-wc/testing` (`fixture`, `expect`) with `@web/test-runner` in local Chrome. Test files match `components/**/*.spec.js`.
