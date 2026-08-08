# Plan: shrinking `data-grid.js` (1071 → ~770 lines)

Investigation only — no source files were changed to produce this plan.

## Context already on record

`.claude/plans/data-grid-plan.md` §15/§16 already ran one round of this
exact exercise: it pulled virtualization/pagination/row-updates/keyboard-nav/
focus/column-resize/sort/row-span/tree/selection/detail-panel/declarative-
columns out into 12 `controllers/data-grid-*-controller.js` files, and pulled
per-cell/per-header/footer/column-chrome rendering out into 11
`components/<name>/data-grid-<name>.js` custom elements. The binding rules
from that round, verified still true by reading the current code:

- Controllers never reference each other. Cross-controller wiring lives only
  on `MdDataGrid` (mostly in `updated()`, but also — newly confirmed while
  reading `RowSelectionController`/`TreeController` for this plan — in a few
  host methods that are the _documented_ exception: `RowSelectionController
.applyIds()`'s own doc comment calls `data-grid.js` "the one place allowed
  to know about both that controller and this one").
- Controller-owned reactive-feeling state is a plain field; the controller
  calls `host.requestUpdate()` itself.
- The host keeps thin one-line delegation methods as the public API surface.
- None of the 12 existing controllers actually implement Lit's
  `ReactiveController` interface or call `host.addController()` — verified by
  grepping all 12 files for `addController`/`hostConnected`/`hostUpdate`:
  zero hits. They're plain classes holding `this.host = host` that call
  `host.requestUpdate()` by hand. The one real `ReactiveController` in the
  tree is `@lit-labs/observers`'s `ResizeController`, nested _inside_
  `VirtualizationController` (`data-grid-virtualization-controller.js:50`,
  `new ResizeController(host, {...})`) — a controller-of-controllers
  composition, not something `data-grid.js` touches directly today.

This plan extends that convention rather than inventing a new one, and calls
out the one place it deliberately doesn't apply the task brief's suggested
extraction (selection/tree glue methods — see Phase 1).

---

## Research question 1: sub-component vs controller vs mixin vs render-helper function

**Verdict up front:** this codebase's own choices are already correct, and
the four tools map to four different _kinds_ of thing being extracted, not
four competing ways to do the same extraction. The decision isn't "which is
generally better," it's "what is the thing you're pulling out actually made
of":

| Extracting...                                                                                              | Use                                                                                                 | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A piece of **rendered DOM** with its own encapsulation/lifecycle/styling boundary, reusable in isolation   | **Sub-component** (own custom element)                                                              | Matches `md-data-cell`, `md-data-header-cell`, `md-data-footer`, etc. — each owns a shadow root, a `ContextConsumer`, its own `willUpdate`/`updated`, its own CSS file. The cost (extra shadow root + prop/attr boundary per instance) is already being paid today, per-cell, per-virtualized-row — this codebase has already decided that cost is acceptable for cell-grain pieces.                                                                                                                                                                                                                                                                                                                                                 |
| **Cross-cutting non-visual state/behavior** that needs host lifecycle hooks but produces no DOM of its own | **Reactive Controller** (or, as this repo actually does it, a plain class following the same shape) | Matches all 12 `controllers/*.js`. Composable (N independent controllers vs. one inheritance chain), each testable in isolation, no ordering/diamond problems.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Behavior/properties that must be shared across multiple _unrelated_ host classes**                       | **Mixin / base class**                                                                              | Matches `BaseButton`, `BaseMdChip` elsewhere in this library — those exist because several _different_ custom elements (filled/outlined/text button variants) need the same properties. `md-data-grid` has no siblings that need its virtualization/pagination/selection logic, so a mixin solves a problem this file doesn't have. Verdict: **don't use mixins here.** Stacking `MdDataGrid extends VirtualizationMixin(PaginationMixin(SelectionMixin(LitElement)))` would be strictly worse than the current 12-independent-controllers composition — it's ordering-sensitive, harder to test each concern alone, and pollutes one shared `this` namespace instead of `this._virtualization`/`this._pagination` staying distinct. |
| **Pure template composition** from data that's already computed, with no state or lifecycle of its own     | **Plain render-helper function**, `(host, ...args) => TemplateResult`, in a sibling module          | This is the tool `render()`'s three big blocks (header loop, skeleton rows, row loop) actually need. There's already a precedent for "plain function module, not a controller, not a component" in this exact directory: `data-grid-build-context.js` exports `buildDataGridContext(host)`.                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### The row-loop tradeoff specifically (the task's explicit ask)

`render()`'s virtualized row loop is the single biggest and riskiest chunk
(~100 lines: `repeat(visibleItems, ..., (item, i) => {...})` with a nested
per-row `repeat()` over cells). Two real options:

- **(a) Extract as a plain function**, e.g. `renderRow(host, item,
virtualIndex, { gridTemplateColumns, effectiveRows, rowSpans })` returning
  the same `TemplateResult`, called from inside the _same_ `repeat()` call
  that's already in `render()`. This changes **zero** DOM shape: the
  `repeat()` call, its key function `(_item, i) => i`, and every node it
  produces are byte-identical to today — it is purely "the template literal
  is now authored in a different file." The DOM-recycling behavior
  `_measureAutoRows()` depends on (`.data-grid__rows > [data-index]`, re-read
  every call because the same node gets rebound to a different row while
  scrolling) is untouched because the actual elements produced don't change.
- **(b) Extract as a full custom element** (`<md-data-row>`). Rejected. Cells
  are _already_ separate custom elements (`md-data-cell`) directly parented
  by the `.data-grid__row` div that sets `grid-template-columns`; wrapping
  that div in another custom element means either (i) moving the CSS grid
  onto `md-data-row`'s own shadow root, adding one more shadow-boundary
  crossing _per virtualized row_ on top of the one already paid per-cell, for
  a piece that (unlike a cell) has no independent styling/reuse story of its
  own — the row's only job is grid-template-columns + colSpan-skip
  bookkeeping, both of which are already correctly BEM-scoped without a
  shadow boundary — or (ii) using light-DOM `<slot>` projection to keep
  `md-data-cell` visible to `data-grid.css`, which reintroduces exactly the
  slotting/`exportparts` complexity the current flat structure avoids. Given
  virtualization already recycles dozens of row nodes per scroll frame, this
  is added per-frame construction/attribute-diffing cost for no behavioral
  gain. **Use (a).**

Same reasoning applies to the header-cell loop and the skeleton-rows block —
neither needs its own state or shadow scoping; both are pure functions of
already-computed values (`columns`, `gridTemplateColumns`, controller
outputs).

---

## Research question 2: can controllers be wired via decorators instead of constructor code?

### What's actually shipped

- **`lit/decorators.js`** (verified via `node_modules/lit/decorators.js`)
  re-exports exactly: `customElement`, `property`, `state`, `eventOptions`,
  `query`, `queryAll`, `queryAsync`, `queryAssignedElements`,
  `queryAssignedNodes`. **No controller-wiring decorator ships with Lit
  itself.**
- **`@lit-labs/observers`** (`ResizeController`, `MutationController`, etc.)
  are constructed the same explicit way this repo already does:
  `new ResizeController(host, options)` in a constructor (confirmed in
  `data-grid-virtualization-controller.js:50`). No decorator variant ships.
- **`@lit/context`** _does_ ship this, for exactly one thing: `@provide` /
  `@consume`. Read directly from
  `node_modules/.pnpm/@lit+context@1.1.6/.../lib/decorators/consume.js`:

  ```js
  export function consume({ context, subscribe }) {
    return (protoOrTarget, nameOrContext) => {
      if (typeof nameOrContext === "object") {
        // Standard (TC39) decorators branch — this is the accessor-decorator
        // pattern the task asked about, straight from Lit's own source.
        nameOrContext.addInitializer(function () {
          new ContextConsumer(this, {
            context,
            callback: (value) => protoOrTarget.set.call(this, value),
            subscribe,
          });
        });
      } else {
        // Legacy/experimental decorators branch.
        protoOrTarget.constructor.addInitializer((element) => {
          new ContextConsumer(element, {
            context,
            callback: (value) => {
              element[nameOrContext] = value;
            },
            subscribe,
          });
        });
      }
    };
  }
  ```

  So the mechanism the task asked about — a decorator on an `accessor` class
  field that calls `context.addInitializer(...)` and constructs the
  controller-like object inside it, bound to the real instance — is not
  hypothetical; it's exactly how `@lit/context`'s own `@consume`/`@provide`
  work today, and this repo already depends on `@lit/context@1.1.6`, which
  ships it. **But this repo never imports `@provide`/`@consume`** — grepping
  every `@lit/context` usage across all 12 sub-components and the host
  (11 `ContextConsumer` sites + 1 `ContextProvider` site) shows 100% of them
  use the explicit `new ContextConsumer(this, {...})` /
  `new ContextProvider(this, {...})` constructor form. That's a deliberate,
  repo-wide-consistent choice already made, not an oversight.

### Tooling viability check

`babel.config.json` is `{ "plugins": [["@babel/plugin-proposal-decorators",
{ "version": "2023-11" }]] }` — the modern TC39 Stage-3 decorators spec,
which does support `accessor` class fields. So a custom decorator _would_
work mechanically. However: commit `7882448` ("chore: bump babel/eslint/
toolchain deps, fix decorators plugin version", 2026-08-06 — three days
before this investigation) exists _because_ the decorators plugin version
broke `@web/test-runner`'s ability to transform any component under test at
all. Decorator tooling in this repo is demonstrably fragile enough to have
just caused an outage-grade build break. That's a live, recent data point
against adding a _new_, custom (non-Lit-maintained) decorator to the stack
right now, on top of the load-bearing ones already there.

### Concrete sketch, modeled directly on `@consume`'s own source

```js
// components/data-grid/data-grid-controller-decorator.js

/**
 * Class-field decorator that instantiates `ControllerClass` and assigns it
 * to the decorated field when the host is constructed — equivalent to
 * `this._foo = new FooController(this, options)` in the constructor.
 * Modeled directly on `@lit/context`'s own `@consume`/`@provide`
 * implementation (see node_modules/.pnpm/@lit+context@.../lib/decorators/
 * consume.js) — same `addInitializer` mechanism, generalized to this repo's
 * own plain controller classes instead of `ContextConsumer`.
 *
 * `optionsFactory`, not a plain options object, because several existing
 * controllers (`FocusController`, `ColumnResizeController`) need an option
 * that closes over the *instance* (`onFocusChange: () =>
 * this._gridContextProvider.setValue(...)`)  — the decorator factory itself
 * only runs once, at class-definition time, before any instance exists.
 *
 * @param {new (host: unknown, options?: unknown) => unknown} ControllerClass
 * @param {((host: unknown) => unknown) | unknown} [optionsFactory]
 */
export function controller(ControllerClass, optionsFactory) {
  return (_target, context) => {
    context.addInitializer(function () {
      const options =
        typeof optionsFactory === "function"
          ? optionsFactory(this)
          : optionsFactory;
      this[context.name] = new ControllerClass(this, options);
    });
  };
}
```

Usage in `data-grid.js`:

```js
export class MdDataGrid extends LitElement {
  @controller(VirtualizationController) accessor _virtualization;
  @controller(PaginationController) accessor _pagination;
  @controller(RowUpdatesController) accessor _rowUpdates;
  @controller(FocusController, (host) => ({
    onFocusChange: () =>
      host._gridContextProvider.setValue(buildDataGridContext(host)),
  }))
  accessor _focus;
  @controller(KeyboardNavController) accessor _keyboardNav;
  @controller(ColumnResizeController, (host) => ({
    onResizeStateChange: () =>
      host._gridContextProvider.setValue(buildDataGridContext(host)),
  }))
  accessor _columnResize;
  @controller(SortController) accessor _sort;
  @controller(RowSpanController) accessor _rowSpan;
  @controller(TreeController) accessor _tree;
  @controller(RowSelectionController) accessor _selection;
  @controller(DetailPanelController) accessor _detailPanel;
  // ...
}
```

Two problems this sketch does **not** solve cleanly, both real:

1. `this._tree.build(this.rows)` — today's constructor calls this
   _immediately after_ constructing `TreeController`, as a second statement.
   Field-decorator initializers run in declaration order but each is a
   single `addInitializer` callback; there's no clean place to bolt on "and
   then call one more method with an argument computed from another
   property" without either (a) making `TreeController`'s own constructor do
   the initial build itself (a real behavior change to that controller, out
   of scope for a pure wiring refactor) or (b) keeping this one line in the
   constructor anyway, which means the constructor doesn't fully disappear.
2. `_gridContextProvider` (the `ContextProvider`, not one of the 12
   controllers) still needs `.setValue(buildDataGridContext(this))` called
   once after every controller exists — decorator initializers guarantee
   _a_ runs before _b_ if declared in that order, but this call needs to run
   after _all_ of them, which means either it becomes its own decorator
   applied last (fragile — depends on field declaration order, invisible at
   the call site) or it stays as an explicit constructor line, again leaving
   the constructor non-empty.

### Pros / cons vs. this codebase's current style

**Pros:**

- Slightly less boilerplate per simple controller (no options): one line
  instead of a `/** @private */`-commented `this._foo = new
FooController(this);`.
- Declares the controller as part of the class's field list, visually
  grouped, rather than interleaved in constructor prose.

**Cons — and why the verdict is _don't adopt this_:**

- **Breaks a 12-file-wide, currently 100% consistent convention** (11
  `ContextConsumer` sites + all 12 `controllers/*.js` instantiations) for a
  win that only pays off on the handful of controllers with _no_ options —
  the two with instance-closing options (`_focus`, `_columnResize`) end up
  _more_ convoluted with the `optionsFactory` indirection than the current
  direct `this._focus = new FocusController(this, { onFocusChange: () =>
... })`.
- **Loses the inline "why" comments this codebase clearly values.** Every
  controller instantiation today carries a comment explaining a non-obvious
  choice (e.g. the `_focus`/`_columnResize` comments explaining exactly why
  those two need `onFocusChange`/`onResizeStateChange` at all — see
  `data-grid.js:334-349`). A one-line `@controller(...) accessor _focus;`
  has nowhere natural to put that prose without it floating awkwardly above
  a decorator instead of above a `this.x = ...` statement, and this repo's
  own stated style (per this agent's brief) is "very-explicit,
  heavily-commented constructor-wiring" — this is a direct regression
  against that.
- **Doesn't fully remove the constructor anyway** (per problems 1 and 2
  above) — so the payoff is "the constructor gets 10-15 lines shorter"
  while every other file in the directory stays on the explicit pattern,
  in exchange for a second decorator-based subsystem to reason about
  alongside `@lit/context`'s (unused-here) one.
- **Timing risk is not hypothetical** — the decorator toolchain broke test
  transformation entirely three days before this investigation. Adding a
  new custom decorator increases the toolchain's exposure to exactly the
  class of failure that just happened, for a two-figure line-count win.

**Recommendation: do not adopt.** Keep explicit `new
XController(this, options)` constructor wiring. It is more consistent, more
debuggable (stack traces point at a real line, not an initializer closure),
already uniform across 12 controller files + 11 context-consumer sites, and
the comment density it enables is a stated project value, not incidental
verbosity.

---

## Extraction plan

Ordered by risk, safest first. Each item names the destination file
following `data-grid-<concern>.js` (top-level, plain-function modules — same
tier as the existing `data-grid-build-context.js`) or
`controllers/data-grid-<concern>-controller.js` / `components/<name>/` where
those tiers actually apply.

### Phase 0 — correction to the task brief (no extraction, but stated per instructions)

The brief suggested `_toggleRowSelection`, `_selectTreeDataGroup`, and
`_toggleSelectAll` (lines 738–780) as candidates to move onto
`RowSelectionController`/`TreeController` since they "mostly just delegate."
Reading the actual controllers changes this conclusion: `RowSelectionController
.applyIds()`'s doc comment explicitly says `data-grid.js` is "the one place
allowed to know about both [`TreeController`] and [`RowSelectionController`]."
All three methods call into _both_ controllers (`_selectTreeDataGroup` reads
`this._tree.computeCascadingSelection(...)` and writes via
`this._selection.applyIds(...)`; `_toggleSelectAll` reads `this._tree.rows`
and writes via `this._selection.toggleAllIds(...)`). Moving any of them onto
either controller would require giving that controller a direct reference to
the other — exactly the thing §15 rejected ("controllers reference each
other directly — rejected, couples construction order, harder to test in
isolation"). **These three methods stay on the host.** They're already
correctly following the pattern; they just look bigger than they are because
of comment density, not because they're doing per-controller work that could
move. Net line change: 0. `_onRowMouseDown` (7 lines, no controller calls at
all) isn't worth its own file either.

### Phase 1 — pure data extraction (lowest risk, no behavior touched)

| #   | What moves                                                                                                                                                                                                                                                            | Destination                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                                        | Est. savings                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 1a  | Module-level `@typedef` blocks: `DataGridColumn`, `DataGridCellParams`, `DataGridPaginationModel`, `DataGridSortItem`, `DataGridRowUpdate` (lines ~36–85)                                                                                                             | new `data-grid-types.js` (JSDoc-only, no runtime code)       | **Do not** rename the types or drop them from `data-grid.js` outright — 19 files elsewhere in this directory reference them as `import(".../data-grid.js").DataGridColumn` etc. (verified by grep). Instead, re-declare each as a one-line forwarding typedef in `data-grid.js`: `/** @typedef {import("./data-grid-types.js").DataGridColumn} DataGridColumn */`. Zero call sites elsewhere need to change. | ~45 lines net (50 removed, ~5 forwarding lines added) |
| 1b  | Module constants + tiny pure helpers: `DEFAULT_ROW_HEIGHT`, `DEFAULT_HEADER_HEIGHT`, `DEFAULT_OVERSCAN`, `DEFAULT_PAGE_SIZE_OPTIONS`, `SKELETON_ROW_COUNT`, `DETAIL_PANEL_ESTIMATED_HEIGHT`, `skeletonWidth()`, `clampColSpan()`, `defaultGetRowId()` (lines ~87–133) | new `data-grid-constants.js`                                 | Plain function/constant module, same tier as `data-grid-build-context.js`. `clampColSpan`/`skeletonWidth` are only consumed by `render()` and its future helper functions (Phase 3) — moving them here now means Phase 3 doesn't need to also move them.                                                                                                                                                     | ~40 lines net                                         |
| 1c  | `static properties = { ... }` object body (lines 159–227, ~69 lines)                                                                                                                                                                                                  | new `data-grid-properties.js` exporting `dataGridProperties` | Plain object literal, no closures — safe to hoist verbatim. `data-grid.js` becomes `static properties = dataGridProperties;`.                                                                                                                                                                                                                                                                                | ~65 lines net                                         |

**Phase 1 total: ~150 lines. Risk: very low** — nothing here changes
behavior, identity, or timing; it's pure code motion of data that doesn't
close over `this`.

### Phase 2 — render() decomposition into render-helper functions (medium effort, low-to-medium risk)

New file: `data-grid-render.js` (or split into `data-grid-render-header.js` +
`data-grid-render-rows.js` if reviewers prefer smaller files — either is
consistent with the `data-grid-build-context.js` precedent; the plan below
assumes one file for cohesion since all three functions share
`clampColSpan`/column-skip logic).

| #   | What moves                                                                                                                                                    | New export                                                                              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Est. savings  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 2a  | Header-cell loop IIFE (lines ~843–876)                                                                                                                        | `renderHeaderCells(host, columns)`                                                      | Pure function of `columns` + controller reads (`host._columnResize.isResizable`, `host._sort.isSortable/getSort/toggleSort`) already available via `host`. Same `repeat()` call, same key fn, moved verbatim.                                                                                                                                                                                                                                                                                                                                                                                                                          | ~28 lines net |
| 2b  | Skeleton-rows block (lines ~899–929)                                                                                                                          | `renderSkeletonRows(columns, gridTemplateColumns, rowHeight)`                           | Fully pure — no controller reads, just `columns` + two numbers. Easiest of the three.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ~24 lines net |
| 2c  | Real-row loop body — the whole `repeat(visibleItems, (_item,i)=>i, (item,i)=>{...})` callback, including the nested per-row cell `repeat()` (lines ~946–1045) | `renderRow(host, item, virtualIndex, { gridTemplateColumns, effectiveRows, rowSpans })` | **The one that needs care.** Per the Q1 analysis above: extract as a plain function, _not_ a custom element — this preserves the exact same `repeat()` call/key/DOM identity in `render()`, so `_measureAutoRows()`'s `data-index` re-read contract is untouched. The extraction itself is mechanical (cut the callback body, paste into the new function, `render()`'s `repeat()` call becomes `repeat(visibleItems, (_item, i) => i, (item, i) => renderRow(this, item, startIndex + i, {...}))`). Verify with the existing virtualization/row-span test suites after moving — this is the block those tests most directly exercise. | ~82 lines net |

**Phase 2 total: ~134 lines net removed from `data-grid.js`; `render()`
itself shrinks from ~270 lines to roughly ~130** (grid-template setup,
derived values, the three delegating calls, and the static shell markup:
header wrapper, viewport wrapper, loading indicator, empty state, footer
slot). **Risk: low for 2a/2b (fully pure), low-medium for 2c** — mechanical
cut-paste with no logic change, but it's the block most sensitive to the
DOM-recycling contract, so it's the one to run the full test suite against
before/after, specifically `rowHeight: "auto"` and row-spanning tests.

### Phase 3 — optional, low-priority

| #   | What moves                         | Destination                                                                                 | Notes                                                                                                                                                                                                                                                                                                                                                  | Est. savings  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| 3a  | `_columns` getter (lines ~519–547) | `computeEffectiveColumns(host)` in `data-grid-constants.js` or a new `data-grid-columns.js` | Pure function of `host.columns`/`host.checkboxSelection`/`host.treeData`/`host.getDataPath`/`host.getDetailPanelContent`/`host.autoGroupColumnDef` + the three `GRID_*_COL_DEF` imports (already imported at top of `data-grid.js`, would move with it). Low payoff relative to Phase 1/2, include only if the reviewer wants to push past ~800 lines. | ~24 lines net |

Not recommended: extracting constructor property-default assignments
(lines ~234–330). Each carries its own `/** @type {...} */` comment
immediately above the assignment — this pairing is what lets `tsc
--noEmit` (per `CLAUDE.md`) infer types in a `.js` + JSDoc codebase without a
separate `.d.ts`. Moving the assignments to a helper function would either
duplicate the JSDoc (defeating the point) or lose type inference on those
properties. This section is already about as tight as it can get without
fighting the codebase's own `.js`+JSDoc convention (see `data-grid-plan.md`
§1's note on why `.js`+JSDoc was chosen over `.ts` in the first place).

---

## Sequencing recommendation

1. **Phase 1 first, all three sub-items in one PR.** Zero behavior risk,
   mechanical, easy to review line-by-line against the original file. Run
   the full `data-grid` test suite — should be a no-op diff in test results.
2. **Phase 2a + 2b next, together.** Both fully pure, no shared risk with
   2c. Same test-suite-as-regression-check approach.
3. **Phase 2c on its own,** with explicit before/after manual verification
   (per this project's `verify` skill) of: scrolling through a large row
   set (virtualization recycling), `rowHeight: "auto"` (measurement
   re-binding), row-spanning (`rowSpanning` on, checking the owner-cell
   overflow still paints over the right rows after the refactor), and
   master-detail expand/collapse (detail-row branch inside the same loop).
   This is the one step worth a dedicated review pass rather than bundling
   with anything else, precisely because it's the block the task brief
   flagged as identity/performance-sensitive.
4. **Phase 3, optional,** only if line count still needs to come down
   further after 1–2c land and settle.

Do not attempt the Q2 decorator-wiring pattern as part of this work — see
verdict above (not recommended, and it doesn't meaningfully help the
line-count goal anyway once the two problem controllers and the
context-provider ordering issue are accounted for).

---

## Target end state

| Stage                    | `data-grid.js` line count |
| ------------------------ | ------------------------- |
| Current                  | 1071                      |
| After Phase 1            | ~920                      |
| After Phase 2            | ~790                      |
| After Phase 3 (optional) | ~765                      |

**Realistic target: ~770–800 lines** (not lower without either reversing the
Phase-3-adjacent "don't touch the constructor" call or revisiting whether
some of the ~110-line selection/keydown block's comment density could be
trimmed — not recommended, see Phase 0).

`data-grid.js`'s final shape: a genuine orchestration layer —
`static properties`/`static styles` as one-line references to sibling
modules, a constructor that's still ~140 lines but is _entirely_ "declare a
default, instantiate a controller, wire the two or three cross-controller
callbacks that must live here per §15," the four lifecycle methods
(`firstUpdated`/`willUpdate`/`updated`/`_measureAutoRows`) unchanged (they're
already exactly the cross-controller glue §15 says belongs here), the
`columns` custom accessor unchanged (host-only concern, nothing to extract),
derived getters (`_columns`, `_sortedRows`, `_effectiveRows`, `_pageCount`)
unchanged or minimally reduced (Phase 3), the public delegation methods
unchanged (already minimal), the selection/keydown handlers unchanged per
Phase 0's correction, and `render()` reduced to structural shell + three
calls into `data-grid-render.js`. No new custom elements, no new
controllers, no mixins, no decorators — three new plain-function/data
modules (`data-grid-types.js`, `data-grid-constants.js`,
`data-grid-properties.js`) plus one new render-helper module
(`data-grid-render.js`), all at the same top-level tier `data-grid-context.js`
/ `data-grid-build-context.js` already occupy.
