---
name: slotchange timing vs @query child render
description: Testing pattern caveat — slotchange fires before child Lit components have rendered their shadow DOM, so @query-decorated elements are undefined at that point
type: feedback
---

In `@web/test-runner` / Playwright Chromium, the `slotchange` event on an `md-list` fires synchronously as the slot is populated during initial `fixture()` upgrade. At that moment the slotted `md-list-item` children have been connected but have not yet completed their first Lit render cycle. As a result, `@query`-decorated properties (e.g. `_interactiveEl` pointing to the inner `<button>` in the child's shadow DOM) are still `undefined`. Any `setTabIndex()` call made during `_onSlotChange()` silently no-ops, so the child's `getTabIndex()` fallback value (`0`) is returned for both the first and second item — making an assertion of `-1` impossible via the initial slot-change path.

**Why:** Lit renders child elements asynchronously after connection; `@query` results are only available after the child's first `render()` completes, which happens after the microtask queue drains following `connectedCallback`.

**How to apply:** When testing roving-tabindex setup that depends on `setTabIndex()` reaching a child's `@query`-decorated shadow element, do not assert the result of the initial `_onSlotChange` path. Instead, drive the state through the keyboard navigation path (`ArrowDown` / `ArrowUp` / `Home` / `End` keydown events), which is called after the elements are fully rendered and `_interactiveEl` is populated. The keyboard path reliably produces the expected tabindex values.
