# md-data-grid

A virtualized Material Design 3 data grid web component built with Lit.

`rows` is always set imperatively as a JS property (row data can't be expressed as HTML attributes). `columns` can be too, or declared instead as `<md-data-grid-column>` light-DOM children — see [Declarative columns](#declarative-columns) below. Internally the grid composes `md-data-header-cell`, `md-data-cell`, and `md-data-footer`; these are implementation detail and not meant to be used standalone. Two other light-DOM exceptions — `slot="empty-label"` and `slot="footer"` — let you declaratively override that internal rendering; see [Slots](#slots) below. Rows can also be expanded into a full-width, arbitrary-content detail row — see [Master detail](#master-detail).

## Declarative columns

Instead of (or alongside) setting `columns` imperatively, columns can be declared as `<md-data-grid-column>` children — useful for static column sets authored directly as markup (SSG output, a template-engine-driven page, etc.):

```html
<md-data-grid id="grid" style="height: 400px; display: block;">
  <md-data-grid-column
    field="id"
    header-name="ID"
    width="80"
  ></md-data-grid-column>
  <md-data-grid-column field="name" header-name="Name"></md-data-grid-column>
  <md-data-grid-column
    field="status"
    header-name="Status"
    width="140"
  ></md-data-grid-column>
</md-data-grid>
```

`<md-data-grid-column>` renders nothing itself — it's purely a data carrier, read into `columns` whenever a child is added, removed, reordered, or has an attribute changed. Its attributes mirror `DataGridColumn`'s serializable fields (`field`, `header-name`, `width`, `min-width`, `max-width`, `col-span`, `resizable`, `sortable`, `row-spannable`, `align`, `cell-class-name`, `header-class-name`). `resizable`/`sortable`/`row-spannable` are three-state, not the usual boolean-attribute two — omit the attribute to inherit the default, or set it to exactly `"false"` to opt out (same convention `aria-*` attributes use, for the same reason: `DataGridColumn`'s own boolean fields default to `true` when _unspecified_, which a plain presence/absence attribute can't represent).

`DataGridColumn`'s function-valued fields (`valueGetter`, `renderCell`, `renderHeader`, `rowSpanValueGetter`) can't be HTML attributes at all — set them as JS properties on the element itself:

```js
document.querySelector('md-data-grid-column[field="status"]').renderCell = ({
  row,
}) => html`<span class="pill">${row.status}</span>`;
```

When one or more `<md-data-grid-column>` children are present, they always win — mixing them with an imperative `grid.columns = [...]` assignment on the same grid isn't a supported combination. Doing it anyway prints a one-time `console.warn` and the assignment is rejected outright (not applied even momentarily) in favor of the declarative children.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-data-grid id="grid" style="height: 400px; display: block;"></md-data-grid>

<script type="module">
  const grid = document.getElementById("grid");

  grid.columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name" },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: ({ row }) => `${row.status}`,
    },
  ];

  grid.rows = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    status: i % 2 === 0 ? "active" : "inactive",
  }));

  grid.addEventListener("md-data-grid-row-click", (e) => {
    console.log(e.detail.row);
  });
</script>
```

## Properties

| Property                      | Attribute                        | Type                                                                   | Default             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `columns`                     | —                                | `DataGridColumn[]`                                                     | `[]`                | Column definitions                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `rows`                        | —                                | `object[]`                                                             | `[]`                | Row data. In pagination `server` mode, only the current page's rows                                                                                                                                                                                                                                                                                                                                                                              |
| `rowHeight`                   | `row-height`                     | `number \| "auto"`                                                     | `52`                | Fixed row height in px, or `"auto"` to size each row to its own content (measured via `ResizeObserver`; row-spanning is disabled in this mode)                                                                                                                                                                                                                                                                                                   |
| `headerHeight`                | `header-height`                  | `number`                                                               | `48`                | Header row height in px                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `overscan`                    | `overscan`                       | `number`                                                               | `8`                 | Extra rows rendered above/below the visible window — raise it if fast/flung scrolling shows blank space before rows catch up                                                                                                                                                                                                                                                                                                                     |
| `getRowId`                    | —                                | `(row) => string \| number`                                            | `row => row.id`     | Row identity, used for keyed rendering and dedupe                                                                                                                                                                                                                                                                                                                                                                                                |
| `getRowClassName`             | —                                | `(row, rowIndex) => string`                                            | —                   | Optional per-row class name (e.g. to highlight a row)                                                                                                                                                                                                                                                                                                                                                                                            |
| `paginationModel`             | —                                | `{ page: number, pageSize: number }`                                   | —                   | Setting this enables pagination; leave unset for full virtualized scroll                                                                                                                                                                                                                                                                                                                                                                         |
| `paginationMode`              | `pagination-mode`                | `"client" \| "server"`                                                 | `"client"`          | `client`: `rows` holds the full dataset, sliced internally. `server`: `rows` is just the current page                                                                                                                                                                                                                                                                                                                                            |
| `rowCount`                    | `row-count`                      | `number`                                                               | `rows.length`       | Total row count across all pages. Required in `server` mode                                                                                                                                                                                                                                                                                                                                                                                      |
| `pageSizeOptions`             | —                                | `number[]`                                                             | `[10, 25, 50, 100]` | Choices shown in the footer's "Rows per page" selector. `[]` hides the selector entirely                                                                                                                                                                                                                                                                                                                                                         |
| `hidePagination`              | `hide-pagination`                | `boolean`                                                              | `false`             | Hides `md-data-footer` without disabling pagination logic — drive `page`/`pageSize` from your own UI via `setPage`/`setPageSize`                                                                                                                                                                                                                                                                                                                 |
| `disableCellHighlight`        | `disable-cell-highlight`         | `boolean`                                                              | `false`             | Disables the primary-color border shown around the last-clicked/keyboard-navigated cell                                                                                                                                                                                                                                                                                                                                                          |
| `disableColumnResize`         | `disable-column-resize`          | `boolean`                                                              | `false`             | Disables drag-to-resize on every column, regardless of each column's `resizable` field                                                                                                                                                                                                                                                                                                                                                           |
| `sortModel`                   | —                                | `DataGridSortItem[]`                                                   | `[]`                | Controlled sort state — set to initialize, or read/listen for the current state. Single-column sort: setting it replaces the array wholesale                                                                                                                                                                                                                                                                                                     |
| `disableColumnSorting`        | `disable-column-sorting`         | `boolean`                                                              | `false`             | Disables click-to-sort on every column, regardless of each column's `sortable` field                                                                                                                                                                                                                                                                                                                                                             |
| `rowSpanning`                 | `row-spanning`                   | `boolean`                                                              | `false`             | Opt-in (unlike resize/sort, off by default). Consecutive rows with an equal value in a column merge into one taller cell — see [Row spanning](#row-spanning)                                                                                                                                                                                                                                                                                     |
| `loading`                     | `loading`                        | `boolean`                                                              | `false`             | While `rows` is empty: renders `md-skeleton` placeholder rows instead of the "No rows" empty state. Once `rows` has data: renders an indeterminate `md-progress-linear` pinned full-width to the top of the scrollable body, plus a translucent overlay over it, instead. Toggle it like any other property (attribute, or imperatively via a ref/`querySelector`) — the grid doesn't fetch anything itself, this is purely the visual indicator |
| `rowSelectionModel`           | —                                | `Set<string \| number>`                                                | `new Set()`         | Controlled row-selection state — set to initialize, or read/listen for the current state. See [Row selection](#row-selection)                                                                                                                                                                                                                                                                                                                    |
| `disableMultipleRowSelection` | `disable-multiple-row-selection` | `boolean`                                                              | `false`             | Disables Ctrl/Cmd-click and Shift-click — a modified click then behaves like a plain click (single-row selection only)                                                                                                                                                                                                                                                                                                                           |
| `disableRowSelectionOnClick`  | `disable-row-selection-on-click` | `boolean`                                                              | `false`             | Disables selecting a row by clicking it — for rows with their own interactive cell content. `rowSelectionModel` can still be driven programmatically                                                                                                                                                                                                                                                                                             |
| `checkboxSelection`           | `checkbox-selection`             | `boolean`                                                              | `false`             | Prepends a non-resizable, non-sortable `md-checkbox` column (`GRID_CHECKBOX_SELECTION_COL_DEF`) driving the same `rowSelectionModel`. See [Checkbox selection](#checkbox-selection)                                                                                                                                                                                                                                                              |
| `getDetailPanelContent`       | —                                | `(params: { row, rowIndex }) => TemplateResult \| string \| undefined` | —                   | Setting this enables master detail — prepends a non-resizable, non-sortable expand-toggle column (`GRID_DETAIL_PANEL_TOGGLE_COL_DEF`). Return `undefined`/`null` for a row to leave it without a toggle at all. See [Master detail](#master-detail)                                                                                                                                                                                              |
| `detailPanelExpandedRowIds`   | —                                | `Set<string \| number>`                                                | `new Set()`         | Controlled expand state — set to initialize, or read/listen for the current state. See [Master detail](#master-detail)                                                                                                                                                                                                                                                                                                                           |

### `DataGridColumn`

| Field                | Type                                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `field`              | `string`                                                             | Key into each row object                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `headerName`         | `string`                                                             | Header label (defaults to `field`)                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `width`              | `number`                                                             | Column width in px (omit for a flexible `1fr` column). Exact — takes priority over `minWidth`/`maxWidth`                                                                                                                                                                                                                                                                                                                                                                                   |
| `minWidth`           | `number`                                                             | Floor (px) on the flexible column, only applies when `width` is unset                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `maxWidth`           | `number`                                                             | Ceiling (px) on the flexible column, only applies when `width` is unset. Sizes the column by content up to the cap rather than growing to fill space and then clamping — `fr` units can't be combined with a hard ceiling in a single CSS Grid track, so a capped column stops absorbing leftover row width. A sibling column left as plain `1fr` still absorbs whatever this one doesn't use                                                                                              |
| `colSpan`            | `number`                                                             | Default `1`. The header cell **and every row's data cell** for this column span this many column tracks; the next `colSpan - 1` columns render no header/data cell of their own for that row. Clamped so a span can never reach past the last column                                                                                                                                                                                                                                       |
| `resizable`          | `boolean`                                                            | Default `true`. Set `false` to opt this column out of drag-to-resize. The last column never gets a handle, regardless of this field. On a `colSpan` column, the handle resizes the _last covered_ column's width, not the spanning column's own. Resizing trades width with the immediate right-hand neighbor (that neighbor shrinks/grows by the same amount) — the grid's total width never changes, and the trade is capped as soon as either column hits its own `minWidth`/`maxWidth` |
| `sortable`           | `boolean`                                                            | Default `true`. Set `false` to opt this column out of click-to-sort                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `rowSpannable`       | `boolean`                                                            | Default `true`. Set `false` to opt this column out of row spanning when the grid's `rowSpanning` is on. Always `false` in effect for a `colSpan > 1` column — the two don't combine                                                                                                                                                                                                                                                                                                        |
| `align`              | `"left" \| "right" \| "center"`                                      | Text alignment for both header and cells (default `"left"`)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `valueGetter`        | `(params: DataGridCellParams) => unknown`                            | Computes the cell's value from the row — also used as the sort key when `renderCell` returns something other than a plain sortable value                                                                                                                                                                                                                                                                                                                                                   |
| `renderCell`         | `(params: DataGridCellParams) => TemplateResult \| string \| number` | Custom cell renderer                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `renderHeader`       | `(column: DataGridColumn) => TemplateResult \| string`               | Custom header renderer                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `rowSpanValueGetter` | `(params: DataGridCellParams) => unknown`                            | Only used when `rowSpanning` is on. Computes the equality key used to detect consecutive-equal-value runs (`===` comparison) — falls back to `valueGetter`, then the raw field value, when omitted                                                                                                                                                                                                                                                                                         |
| `cellClassName`      | `string \| ((params: DataGridCellParams) => string)`                 | Extra class name(s) (space-separated) applied to every `md-data-cell` in this column — a static string, or computed per cell. `GRID_CHECKBOX_SELECTION_COL_DEF` uses this to zero out the cell's default padding                                                                                                                                                                                                                                                                           |
| `headerClassName`    | `string \| ((column: DataGridColumn) => string)`                     | Extra class name(s) (space-separated) applied to this column's `md-data-header-cell` — a static string, or computed from the column. `GRID_CHECKBOX_SELECTION_COL_DEF` uses this to zero out the header's default padding too                                                                                                                                                                                                                                                              |

`DataGridCellParams` is `{ row, column, rowIndex, value }`.

`DataGridSortItem` is `{ field: string, sort: "asc" | "desc" | null | undefined }` — `sort: null | undefined` means the field is tracked but the rule doesn't apply (no active direction).

## Methods

| Method                        | Description                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `scrollToRow(index)`          | Scrolls the viewport so `rows[index]` is within view                                            |
| `getVisibleRows()`            | Returns `{ row, rowIndex }[]` for the rows currently rendered (including overscan)              |
| `setPage(page)`               | Changes the current page (clamped, no-op if pagination isn't enabled)                           |
| `setPageSize(pageSize)`       | Changes the page size and resets to page `0`                                                    |
| `updateRows(changes)`         | Applies a batch of row add/update/delete changes without replacing `rows` wholesale — see below |
| `toggleDetailPanel(id)`       | Expands/collapses one row's detail panel, by row id (as returned by `getRowId`)                 |
| `setExpandedDetailPanel(ids)` | Replaces `detailPanelExpandedRowIds` wholesale with a new `Set` of row ids                      |

### `updateRows(changes)`

`changes` is a `DataGridRowUpdate` or an array of them. Each entry is matched against existing rows via `getRowId()` (not necessarily a literal `.id` field — if `getRowId = row => row.uuid`, entries must carry `uuid`, not `id`):

- **No `_action`, matches an existing row** — shallow-merges onto it: `{...existingRow, ...entry}`. Only include the fields that changed.
- **No `_action`, no match** — inserted as a new row, appended to the end of `rows` (in the order given in `changes`).
- **`_action: "delete"`** — removes the matching row. No-op if it doesn't exist.

Entries whose id can't be resolved via `getRowId()` are skipped with a `console.warn`; the rest of the batch still applies. In client-pagination mode, if the change leaves `paginationModel.page` out of range, the page is automatically clamped (same logic as `setPage`). `rowCount` in server mode is never touched — you own it.

```js
grid.updateRows([
  { id: 2, _action: "delete" },
  { id: 5, status: "shipped" }, // merges onto the existing row with id 5
  { id: 42, name: "New Row" }, // no row with id 42 -> inserted at the end
]);
```

## Events

| Event                                               | `detail`                                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `md-data-grid-row-click`                            | `{ row, rowIndex }`                                           | Fired when a row is clicked                                                                                                                                                                                                                                                                                                                                                                                        |
| `md-data-grid-pagination-model-change`              | `{ page, pageSize }`                                          | Fired whenever the page changes (footer buttons or `setPage`/`setPageSize`)                                                                                                                                                                                                                                                                                                                                        |
| `md-data-grid-rows-update`                          | `{ added, updated, deleted }` (arrays of ids)                 | Fired once per `updateRows()` call that actually changed something                                                                                                                                                                                                                                                                                                                                                 |
| `md-data-grid-column-resize`                        | `{ field, colIndex, width, phase }`                           | Fired continuously while dragging a column's resize handle — `phase` is `"start"`, `"resize"` (once per pointer move), or `"end"`. `colIndex`/`field`/`width` describe the dragged column (the last covered column, for a `colSpan` header); its immediate right-hand neighbor changes width too (by the same amount, opposite direction) but isn't reflected in this event — read `grid.columns` if you need both |
| `md-data-grid-sort-model-change`                    | `DataGridSortItem[]` (the new `sortModel`)                    | Fired when a sortable column's title is clicked — cycles none → asc → desc → none, replacing `sortModel` wholesale (single-column sort)                                                                                                                                                                                                                                                                            |
| `md-data-grid-row-selection-model-change`           | `Set<string \| number>` (the new `rowSelectionModel`)         | Fired whenever a row click changes the selection — see [Row selection](#row-selection)                                                                                                                                                                                                                                                                                                                             |
| `md-data-grid-detail-panel-expanded-row-ids-change` | `Set<string \| number>` (the new `detailPanelExpandedRowIds`) | Fired whenever a toggle click, `toggleDetailPanel()`, or `setExpandedDetailPanel()` changes which rows are expanded — see [Master detail](#master-detail)                                                                                                                                                                                                                                                          |

## Slots

| Slot          | Description                                                                                                                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `empty-label` | Optional content shown instead of the default "No rows" text when there are zero rows (or zero rows on the current page). Plain text or any markup — the default is just fallback content, replaced entirely by whatever you slot in                                        |
| `footer`      | Optional content that replaces the internal, pagination-driven `md-data-footer` entirely. Whatever you slot in wins outright — even if `paginationModel` is unset or `hidePagination` is `true` — since it's ordinary `<slot>` fallback-content behavior, not a conditional |

```html
<md-data-grid id="grid">
  <span slot="empty-label">No results match your filters.</span>
</md-data-grid>

<md-data-grid id="grid-custom-footer">
  <div slot="footer">42 items total</div>
</md-data-grid>
```

## CSS Shadow Parts

Every part below is reachable directly as `md-data-grid::part(name)` — you never need to reach into any sub-component yourself. `md-data-cell`, `md-data-header-cell`, and `md-data-footer` have no wrapper element, so `part` lives directly on their own tag and is already visible one level up with no forwarding needed; parts nested deeper (inside `md-data-header-cell` or `md-data-footer`'s own shadow roots — the label, separator, count text, buttons, page-size select) are forwarded up via `exportparts`.

| Part                  | Element                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`                | The grid's outer container                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `header`              | The sticky header row — has a vertical divider between columns (`border-inline`)                                                                                                                                                                                                                                                                                                                                                                                                                |
| `header-cell`         | A single header cell (`md-data-header-cell`'s own tag — its host is the rendered cell, no wrapper element)                                                                                                                                                                                                                                                                                                                                                                                      |
| `title`               | The header's label (on `md-data-header-cell`, forwarded — rendered by `md-data-column-title`, a nested sub-component). Owns single-line truncation (`text-overflow: ellipsis`) independently from `header-cell` so a long label never forces the column wider                                                                                                                                                                                                                                   |
| `sort-icon`           | The sort direction arrow next to a sortable column's title (on `md-data-header-cell`, forwarded). Hidden until hover for an unsorted-but-sortable column; visible (and rotated 180° for `desc`) when it's the active sort column                                                                                                                                                                                                                                                                |
| `separator`           | The vertical divider on a column's trailing edge (on `md-data-header-cell`, forwarded — rendered by `md-data-column-separator`, a nested sub-component). An SVG rect, not a border, so its ends can be rounded. Doubles as the drag handle when the column is resizable, turning primary-colored on hover/drag                                                                                                                                                                                  |
| `header-gutter`       | Trailing spacer matching the viewport's scrollbar width, keeping header/body columns aligned                                                                                                                                                                                                                                                                                                                                                                                                    |
| `loading-indicator`   | The `md-progress-linear` pinned to the top of the viewport when `loading` is set and `rows` isn't empty (`md-progress-linear`'s own tag — no forwarding needed). Absolutely positioned inside `viewport`, so it doesn't affect layout and stays put regardless of scroll position                                                                                                                                                                                                               |
| `loading-overlay`     | The translucent veil covering the viewport when `loading` is set and `rows` isn't empty, beneath `loading-indicator`                                                                                                                                                                                                                                                                                                                                                                            |
| `skeleton-rows`       | The container of placeholder rows shown when `loading` is set and `rows` is empty, in place of the "No rows" empty state                                                                                                                                                                                                                                                                                                                                                                        |
| `skeleton`            | Each `md-skeleton` placeholder bar within `skeleton-rows` (`md-skeleton`'s own tag — no forwarding needed)                                                                                                                                                                                                                                                                                                                                                                                      |
| `viewport`            | The scrollable viewport                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `empty-state`         | The "No rows" / `slot="empty-label"` container, shown in place of the row area when there are zero rows                                                                                                                                                                                                                                                                                                                                                                                         |
| `spacer`              | The full-height scroll spacer behind the virtualized row window                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `rows`                | The translated window of currently-rendered rows                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `row`                 | A single data row — also carries `getRowClassName`'s output as an additional part token, e.g. `::part(row--pending)`. No vertical column dividers (only the header has those). Also reused, unmodified, for each row inside `skeleton-rows`. A selected row also gets `aria-selected="true"` and an internal `data-grid__row_selected` class — restyle the highlight via `--md-data-grid-row-selected-color`/`--md-data-grid-row-selected-hover-color` rather than targeting the class directly |
| `cell`                | A single data cell (`md-data-cell`'s own tag — its host is the rendered/focusable cell, no wrapper element)                                                                                                                                                                                                                                                                                                                                                                                     |
| `detail-row`          | A row's expanded detail row, when `getDetailPanelContent` is set and that row is in `detailPanelExpandedRowIds` — full-width, outside the column grid `row` uses. See [Master detail](#master-detail)                                                                                                                                                                                                                                                                                           |
| `detail-cell`         | The single content container inside `detail-row`, wrapping whatever `getDetailPanelContent` returned                                                                                                                                                                                                                                                                                                                                                                                            |
| `footer`              | The pagination footer (`md-data-footer`'s own tag — its host is the rendered footer bar, no wrapper element)                                                                                                                                                                                                                                                                                                                                                                                    |
| `rows-per-page-label` | The "Rows per page:" label (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `page-size-select`    | The page-size `md-select` (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `page-size-option`    | Each `md-option` inside the page-size select (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `footer-count`        | The "X–Y of Z" count text (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `footer-prev`         | The previous-page button (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `footer-next`         | The next-page button (forwarded)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Examples

### Custom cell rendering

```html
<md-data-grid id="grid" style="height: 400px; display: block;"></md-data-grid>

<script type="module">
  const grid = document.getElementById("grid");
  grid.columns = [
    { field: "name", headerName: "Name" },
    {
      field: "status",
      headerName: "Status",
      renderCell: ({ row }) =>
        html`<md-assist-chip>${row.status}</md-assist-chip>`,
    },
  ];
  grid.rows = [{ id: 1, name: "Ada", status: "active" }];
</script>
```

### Pagination — client mode

```html
<script type="module">
  grid.columns = COLUMNS;
  grid.rows = allRows; // full dataset
  grid.paginationModel = { page: 0, pageSize: 25 };
</script>
```

### Pagination — server mode

```html
<md-data-grid id="grid" pagination-mode="server"></md-data-grid>

<script type="module">
  async function loadPage(page, pageSize) {
    const res = await fetch(`/api/rows?page=${page}&pageSize=${pageSize}`);
    const { rows, totalCount } = await res.json();
    grid.rows = rows;
    grid.rowCount = totalCount;
  }

  grid.paginationModel = { page: 0, pageSize: 25 };
  grid.addEventListener("md-data-grid-pagination-model-change", (e) => {
    loadPage(e.detail.page, e.detail.pageSize);
  });
  loadPage(0, 25);
</script>
```

### Highlighting a row

```html
<script type="module">
  grid.getRowClassName = (row) => (row.pending ? "row--pending" : "");
</script>

<style>
  #grid::part(row--pending) {
    background-color: color-mix(
      in oklch,
      var(--md-sys-color-tertiary-container),
      transparent 40%
    );
  }
</style>
```

### Column sorting

Click a sortable column's title to cycle none → asc → desc → none. `sortModel` is controlled — set it to initialize, and listen for `md-data-grid-sort-model-change` to stay in sync (or drive it entirely from your own UI).

```html
<script type="module">
  grid.columns = [
    { field: "id", headerName: "ID", sortable: false },
    { field: "rating", headerName: "Rating" },
  ];

  grid.sortModel = [{ field: "rating", sort: "desc" }];

  grid.addEventListener("md-data-grid-sort-model-change", (e) => {
    console.log(e.detail); // [{ field: "rating", sort: "asc" }] or []
  });
</script>
```

### Column resize

Every column gets a drag handle on its trailing edge by default (except the last column). Dragging it trades width with the column immediately to its right — like Excel/Sheets, the grid's total width never changes — and dispatches `md-data-grid-column-resize` continuously while dragging.

```html
<script type="module">
  grid.columns = [
    { field: "id", headerName: "ID", width: 80, resizable: false },
    { field: "name", headerName: "Name", minWidth: 120, maxWidth: 400 },
  ];

  grid.addEventListener("md-data-grid-column-resize", (e) => {
    if (e.detail.phase === "end") {
      console.log(`${e.detail.field} resized to ${e.detail.width}px`);
    }
  });
</script>
```

### Loading indicator

`loading` is purely visual — the grid never fetches data itself, so drive it from whatever's actually loading your rows (a fetch, a server-mode page change, etc.). What it renders depends on whether there's data to show yet:

- **`rows` is empty** (typically the first load): `md-skeleton` placeholder rows, one bar per column, in place of the "No rows" empty state.
- **`rows` already has data** (a refresh/re-fetch): an indeterminate `md-progress-linear` pinned full-width to the top of the viewport, plus a translucent overlay over the existing rows — so you keep seeing the stale data while the new page loads, rather than it flashing to a skeleton.

Both are absolutely positioned so they never shift layout or affect virtualization/scroll math.

```html
<md-data-grid id="grid"></md-data-grid>

<script type="module">
  async function loadRows() {
    grid.loading = true;
    try {
      grid.rows = await fetchRows();
    } finally {
      grid.loading = false;
    }
  }
</script>
```

Setting it via a framework ref works the same way, since it's just a property like any other:

```jsx
<md-data-grid ref={(el) => el && (el.loading = isFetching)}></md-data-grid>
```

### Row spanning

Off by default — set `row-spanning` to turn it on. Consecutive rows with an equal value (`===`, or `rowSpanValueGetter` for custom grouping) in a column merge into one taller cell; the covered rows render no cell of their own for that column.

```html
<md-data-grid id="grid" row-spanning></md-data-grid>

<script type="module">
  grid.columns = [
    { field: "department", headerName: "Department" },
    { field: "name", headerName: "Name" },
  ];
  // Adjacent equal "department" values merge — sort/group your data first
  // if you want spans across the whole dataset rather than by-coincidence
  // adjacency.
  grid.rows = [
    { id: 1, department: "Engineering", name: "Ada" },
    { id: 2, department: "Engineering", name: "Grace" },
    { id: 3, department: "Design", name: "Ray" },
  ];
</script>
```

Runs are detected over the exact rows about to render (after sorting and pagination) — a run never crosses a page boundary, and re-sorting naturally re-detects runs against the new row order.

**Known limitation**: a spanning cell renders taller by overflowing past its own (virtualized) row rather than restructuring layout, so its full height is only correct while that row is actually mounted. If you scroll so a run's first (owner) row moves outside the rendered window while later rows in that run are still visible, those rows show blank cells for that column until you scroll back far enough for the owner to remount. Doesn't apply to `colSpan` columns — the two features don't combine.

### Row selection

Highlight-based by default, not checkboxes — see [Checkbox selection](#checkbox-selection) below for that. Single-row selection is on by default — click a row to select it (replacing any previous selection). Hold Ctrl/Cmd to toggle a row into/out of the selection additively; hold Shift to extend or shrink the selection relative to the last-clicked row (the "anchor"). `rowSelectionModel` is controlled — set it to initialize, and listen for `md-data-grid-row-selection-model-change` to stay in sync.

Shift-click merges into whatever's already selected rather than replacing it wholesale, matching MUI's own DataGrid — a row selected earlier via Ctrl-click (or an unrelated shift gesture) stays selected even though it's outside the new range. Two modes, chosen by whether the row you shift-click is already selected:

- **Not selected** — grows the selection: adds every row between the anchor and the clicked row.
- **Already selected** — shrinks the selection: removes rows between the anchor and one row _short_ of the clicked row. The clicked row itself is deliberately excluded from removal, so shift-clicking a selected row never deselects that exact row, only backs the range off beyond it. Shift-clicking the anchor row itself (nothing left to back off) is a no-op.

The anchor advances to the clicked row after _every_ shift-click, not just plain/Ctrl clicks — a follow-up shift-click extends/shrinks relative to the row you just shift-clicked, not the original one.

```html
<md-data-grid id="grid"></md-data-grid>

<script type="module">
  grid.columns = COLUMNS;
  grid.rows = ROWS;

  grid.rowSelectionModel = new Set([2]); // pre-select row id 2

  grid.addEventListener("md-data-grid-row-selection-model-change", (e) => {
    console.log([...e.detail]); // ids of every currently-selected row
  });
</script>
```

If a cell has its own interactive content (a button, a link, a nested control), set `disable-row-selection-on-click` so clicking it doesn't also select the row — `rowSelectionModel` still works programmatically, and `md-data-grid-row-click` still fires:

```html
<md-data-grid id="grid" disable-row-selection-on-click></md-data-grid>
```

Set `disable-multiple-row-selection` to restrict selection to a single row at a time — Ctrl/Cmd-click and Shift-click then behave like a plain click instead of extending the selection:

```html
<md-data-grid id="grid" disable-multiple-row-selection></md-data-grid>
```

### Checkbox selection

Set `checkboxSelection` to prepend a checkbox column — same `rowSelectionModel`, same events, just an `md-checkbox` per row (and a header checkbox) instead of a plain row highlight. Internally this merges `GRID_CHECKBOX_SELECTION_COL_DEF` (a non-resizable, non-sortable `DataGridColumn`, exported for reference) as `columns[0]`; your own `columns` array is never mutated.

```html
<md-data-grid id="grid" checkbox-selection></md-data-grid>

<script type="module">
  grid.columns = COLUMNS;
  grid.rows = ROWS;
</script>
```

With `checkboxSelection` on, a plain click **anywhere in the row** — not just the checkbox — adds/removes just that row (like Ctrl/Cmd-click on a plain row) instead of replacing the whole selection with it: checking one box, then clicking a different row, shouldn't silently uncheck the first one. Shift-click still range-selects. This only changes plain-click behavior when `checkboxSelection` is on — without it, a plain row click still replaces the selection as documented in [Row selection](#row-selection) above. Combine with `disable-row-selection-on-click` if you only want the checkbox itself to change the selection.

The header checkbox selects/clears **every row in the whole dataset** (`rows`, not just the current page) — matching MUI's own default — and shows an indeterminate state when only some rows are selected. It renders nothing when `disable-multiple-row-selection` is set, since "select all" doesn't apply to single-row selection.

### Master detail

Set `getDetailPanelContent` to make rows expandable into a full-width detail row rendered below them, with arbitrary content. Internally this prepends `GRID_DETAIL_PANEL_TOGGLE_COL_DEF` (a non-resizable, non-sortable `DataGridColumn`, exported for reference) as the first column — after the checkbox column, if `checkboxSelection` is also on — rendering an expand/collapse icon-button per row; your own `columns` array is never mutated.

```html
<md-data-grid id="grid" style="height: 400px; display: block;"></md-data-grid>

<script type="module">
  grid.columns = COLUMNS;
  grid.rows = ORDERS;

  grid.getDetailPanelContent = ({ row }) => {
    if (!row.items?.length) return undefined; // no toggle for this row at all
    return html`
      <div style="padding: 0.5rem 0;">
        <h4>Items in order #${row.id}</h4>
        <ul>
          ${row.items.map((item) => html`<li>${item.name} × ${item.qty}</li>`)}
        </ul>
      </div>
    `;
  };

  grid.addEventListener(
    "md-data-grid-detail-panel-expanded-row-ids-change",
    (e) => console.log([...e.detail]), // ids of every currently-expanded row
  );
</script>
```

`detailPanelExpandedRowIds` is controlled, same convention as `rowSelectionModel` — set it to initialize, or drive it entirely yourself:

```js
grid.detailPanelExpandedRowIds = new Set([2]); // pre-expand order id 2
grid.toggleDetailPanel(5); // flip one row
grid.setExpandedDetailPanel(new Set([1, 4, 9])); // replace wholesale
```

A row with nothing to show (`getDetailPanelContent` returning `undefined`/`null` for it) gets no toggle icon at all — there's nothing to expand.

Detail rows are a rendering/virtualization concern only — they're never counted against `paginationModel.pageSize` (a page of 10 always shows 10 data rows, plus however many of those happen to be expanded), and every other index-based concern (`rowSelectionModel`, keyboard navigation, `rowSpanning`, sorting) operates entirely on data rows, unaware detail rows exist. Clicking inside detail content never selects the row it belongs to.

**Known limitation**: an expanded row visually interrupts a `rowSpanning` run it would otherwise be part of — the two features work together, but a spanning cell's run breaks across an expanded row in between, same category of tradeoff as [Row spanning](#row-spanning)'s own scroll-out limitation above.

### Hiding the built-in footer

```html
<md-data-grid id="grid" hide-pagination></md-data-grid>

<script type="module">
  grid.paginationModel = { page: 0, pageSize: 25 };
  // drive paging from your own UI:
  nextButton.addEventListener("click", () =>
    grid.setPage(grid.paginationModel.page + 1),
  );
</script>
```
