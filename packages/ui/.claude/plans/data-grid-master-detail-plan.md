# Master detail — proposal, investigation, plan

Not implemented yet — for review. Implementation starts after this is approved.

## 1. Proposed usage

```js
const grid = document.querySelector("md-data-grid");

grid.columns = [
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];
grid.rows = orders;

// Returning undefined/nothing for a row means "not expandable" — no toggle
// icon renders for it at all.
grid.getDetailPanelContent = ({ row, rowIndex }) => {
  if (!row.items?.length) return undefined;
  return html`
    <div class="order-detail">
      <h4>Items in order #${row.id}</h4>
      <ul>
        ${row.items.map((item) => html`<li>${item.name} × ${item.qty}</li>`)}
      </ul>
    </div>
  `;
};

// Optional — defaults to real DOM measurement ("auto") when omitted.
grid.getDetailPanelHeight = ({ row }) => (row.items.length > 5 ? 240 : "auto");

grid.addEventListener(
  "md-data-grid-detail-panel-expanded-row-ids-change",
  (e) => {
    console.log("expanded:", e.detail); // Set<PropertyKey>
  },
);

// Imperative API, mirrors setPage/setPageSize/scrollToRow already on the host:
grid.toggleDetailPanel(orderId); // flip one row
grid.setExpandedDetailPanel(new Set([1, 4, 9])); // replace wholesale
```

```html
<md-data-grid id="grid" style="height: 480px; display: block;"></md-data-grid>
```

No new light-DOM/slot surface — same imperative-callback shape `renderCell`/`renderHeader` already use, so it's consistent with the rest of the column API rather than introducing a second style.

## 2. Proposed implementation sketch

### New files

- `controllers/data-grid-detail-panel-controller.js` — owns `detailPanelExpandedRowIds` mutation (`toggle(id)`, `setExpanded(ids)`, dispatch — same `_apply()` shape as `RowSelectionController`), plus a pure `buildRenderItems(effectiveRows)` that interleaves `{kind:'row', row, rowIndex}` and `{kind:'detail', row, rowIndex}` entries and a parallel `rowIndexToVirtualIndex` map (see §3b).
- `data-grid-detail-panel-column.js` — `GRID_DETAIL_PANEL_TOGGLE_FIELD` + `GRID_DETAIL_PANEL_TOGGLE_COL_DEF`, same file-naming pattern as `data-grid-checkbox-column.js`:

  ```js
  import { html } from "lit";

  import "./components/detail-toggle-cell/data-grid-detail-toggle-cell.js";

  export const GRID_DETAIL_PANEL_TOGGLE_FIELD = "__detail_panel_toggle__";

  /** @type {import("./data-grid.js").DataGridColumn} */
  export const GRID_DETAIL_PANEL_TOGGLE_COL_DEF = {
    field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
    headerName: "",
    width: 40,
    resizable: false,
    sortable: false,
    rowSpannable: false,
    align: "center",
    cellClassName: "data-grid-cell_detail-toggle",
    renderCell: ({ row, rowIndex }) =>
      html`<md-data-detail-toggle-cell
        .row=${row}
        .rowIndex=${rowIndex}
      ></md-data-detail-toggle-cell>`,
  };
  ```

  Differences from `GRID_CHECKBOX_SELECTION_COL_DEF`, both deliberate:
  - `width: 40` not `56` — one icon-button with no label to fit, vs. a checkbox needing its full touch-target padding trimmed. MUI's own detail-toggle column uses ~40px too.
  - No `renderHeader`/`headerClassName` — checkbox has a header checkbox for "select all"; there's no default "expand all" equivalent, so the header cell stays blank. An "expand/collapse all" affordance would be an explicit later addition, not default behavior (MUI doesn't have one out of the box either).

- `components/detail-toggle-cell/data-grid-detail-toggle-cell.js` — `md-icon-button` + `keyboard_arrow_right` icon (rotates 90° when expanded), renders nothing when `getDetailPanelContent(row)` is falsy for that row. Reads expand state + calls toggle through `dataGridContext`, same pattern as `md-data-grid-checkbox-cell`. Named `md-data-detail-toggle-cell` (no "grid") to follow the internal-vs-public naming split (`md-data-*` = internal, `md-data-grid-*` = public) rather than perpetuate `md-data-grid-checkbox-cell`'s older, inconsistent naming.

### `data-grid.js` changes

- New properties: `getDetailPanelContent`, `getDetailPanelHeight` (state, function-valued, not attributes — matches `getRowId`/`getRowClassName`), `detailPanelExpandedRowIds` (`Set`, defaults empty, same convention as `rowSelectionModel`).
- New public methods: `toggleDetailPanel(id)`, `setExpandedDetailPanel(ids)`.
- `_columns` getter extended: `[checkboxCol?, detailToggleCol?, ...columns]` when `getDetailPanelContent` is set.
- `render()`'s row loop switches from iterating `visibleRows` (sliced `effectiveRows`) to iterating `this._detailPanel.buildRenderItems(effectiveRows)`, branching per `item.kind` — data rows render exactly as today; detail rows render a single full-width div (`grid-template-columns: 1fr` / no column grid) containing `getDetailPanelContent(item)`.
- `dataGridContext` gains `detailPanelExpandedRowIds`/`toggleDetailPanel` for the toggle cell to read.

### `VirtualizationController` changes

Covered in §3a — the one real architectural change, everything else above is additive.

## 3. What needs resolving before implementation

**a) `count`/`estimateSize` are currently hardwired to `host.rows.length`/`host.rowHeight`.**
Every virtualization method (`visibleRange`, `totalSize`, `_syncOptions`) assumes one virtual item per row, sized by a single global `rowHeight`. Detail rows break both assumptions: they're extra items not present in `rows`, and their height is inherently dynamic (arbitrary user content) even when normal rows use a fixed `rowHeight`. `VirtualizationController` needs to take an item **count** and a **per-index** `estimateSize(index)` from the caller instead of deriving both from `host.rows`/`host.rowHeight` itself — otherwise it has to import "detail panel" as a concept, which breaks the existing "controllers don't know about each other" rule the codebase holds elsewhere.

**b) `rowIndex` and "virtual item index" diverge the moment any row is expanded.**
`md-data-cell.rowIndex`, `_focus.focusedCell.rowIndex`, `KeyboardNavController`'s arrow-key math, `_selection.select(row, rowIndex, ...)`, and `RowSpanController.computeSpans()` all currently assume `rowIndex` is both "position in `effectiveRows`" _and_ "position in the virtualized/rendered list" — today those are the same number. They must **stay** the same number for all of the above (selection/keyboard-nav/row-span math must keep operating on pure data rows, unaware detail panels exist at all — arrow-down/up should skip over a detail row, not land on it, since it has no columns). Only `scrollToRow(index)`/`ensureRowVisible(rowIndex)` (and `data-index` on the rendered DOM node, which `measureElement` keys off) need to translate a data `rowIndex` into a virtual index via the map `buildRenderItems()` produces. Get this translation wrong and arrow-key scrolling or `scrollToRow()` will land on the wrong row as soon as anything above it is expanded.

**c) `_measureAutoRows()`'s gate is wrong for this feature.**
It only measures rendered rows `if (this.rowHeight === "auto")`. Detail-row content needs real measurement regardless of what `rowHeight` is set to for normal rows (unless `getDetailPanelHeight` gives a fixed number). The gate becomes "measure if `rowHeight === 'auto'` OR any detail row is currently rendered," and the query selector (`.data-grid__rows > .data-grid__row`) needs to also catch detail-row elements.

**d) Pagination must stay untouched.**
`pageSize` should count only data rows — a page of 10 shows 10 data rows plus however many of _those_ happen to be expanded, never fewer data rows to make room. This falls out for free as long as detail-row injection happens strictly after `effectiveRows`/pagination slicing (which `buildRenderItems()` already does by construction) — flagging it because it'd be an easy thing to accidentally break by injecting earlier.

**e) Row-span interaction.**
`rowSpanning` merges consecutive equal-value cells vertically; a detail row sitting between two same-value rows would visually break a span run. Simplest correct behavior (matches MUI): leave `RowSpanController` untouched (it already only sees `effectiveRows`, never detail items) and accept that an expanded row visually interrupts a span run's continuity — same "documented tradeoff, not solved" precedent the codebase already sets for row-span + virtualization scroll-out. Worth a one-line README note, not a code fix.

**f) Selection/click semantics on the detail row itself.**
Clicking inside detail-panel content shouldn't select/deselect the parent row — the detail row's wrapper div gets no `@click`/`@mousedown` selection wiring at all (unlike data rows). No `disableRowSelectionOnClick`-style opt-out needed here — just never wire selection on the detail wrapper, full stop.

**g) Caching `getDetailPanelContent`'s return value.**
If it returns a fresh `html\`...\``each call, Lit's own`repeat()`keyed diffing (keyed by row id, not array position) should preserve the underlying DOM across re-renders without needing a separate cache — same as`renderCell` already relies on with no cache today. Worth confirming with a test (type into a field inside detail content, scroll away and back, verify it's the same node / state didn't reset) rather than assuming.

**h) Accessibility.**
Toggle button needs `aria-expanded`/`aria-label` reflecting state (MUI: `aria-label="Show details for row"` / `"Hide details for row"`). Detail row's `role` — MUI renders it as `role="row"` containing one `role="gridcell"` that spans every column, for screen-reader consistency with the rest of the grid; worth matching rather than inventing something new.

## 4. Implementation plan

1. **`DetailPanelController`** — `detailPanelExpandedRowIds` state + `toggle()`/`setExpanded()`/`_apply()` (mirrors `RowSelectionController` almost exactly), plus pure `buildRenderItems(effectiveRows)` and `rowIndexToVirtualIndex(effectiveRows)` helpers, unit-tested standalone against plain arrays/Sets — no DOM needed for this part.
2. **Widen `VirtualizationController`** to accept an explicit `count`/`estimateSize(index)` pair from the caller instead of deriving them from `host.rows`/`host.rowHeight` — behavior-preserving default (data-grid.js passes the same `estimateRowHeight(host)` closure it does today when there are no detail rows) verified against the _existing_ virtualization test suite before touching anything else, so a regression here is caught immediately.
3. **`GRID_DETAIL_PANEL_TOGGLE_COL_DEF` + `md-data-detail-toggle-cell`** — same shape as the checkbox column/cell, new context fields (`detailPanelExpandedRowIds`, `toggleDetailPanel`, and a way to know if a row _has_ content — probably `hasDetailPanelContent(row)` precomputed once per render rather than the cell calling `getDetailPanelContent` itself and discarding the result).
4. **`data-grid.js` wiring** — new properties/methods, `_columns` prepending, `render()`'s row loop switched to `buildRenderItems()`, detail-row template (full-width, no per-column grid), `_measureAutoRows()`'s gate widened, `scrollToRow`/`ensureRowVisible` routed through the index translation from step 1.
5. **Tests**, roughly in this order: `DetailPanelController` unit tests (pure logic) → toggle-cell rendering/click → full-grid integration (expand via click, `toggleDetailPanel()`, `setExpandedDetailPanel()`, event firing, keyboard nav skipping detail rows, scrollToRow landing correctly with rows expanded above the target, pagination row count unaffected by expansion, row-span + detail-row coexistence).
6. **README** — new "Master detail" section (usage example, API table, the row-span caveat from §3e), Slots/CSS-parts table additions if a `part="detail-row"`/`part="detail-toggle"` is added (recommend yes, for consistency with every other internal element already being reachable via `::part()`).

## Open questions before implementing

- Naming: `md-data-detail-toggle-cell` vs. following `md-data-grid-checkbox-cell`'s older (inconsistent) convention?
- Is the `getDetailPanelHeight` escape hatch worth having in v1, or ship measurement-only ("auto" always) and add it later if someone needs the perf win?
- Accessibility shape in §3h — confirm before wiring ARIA attributes into the toggle cell.
