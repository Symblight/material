# md-data-grid

A virtualized Material Design 3 data grid web component built with Lit.

`md-data-grid` has no light-DOM children — `columns` and `rows` are set imperatively as JS properties (they hold objects and functions, which can't be expressed as HTML attributes). Internally it composes `md-data-column-header`, `md-data-cell`, and `md-data-footer`; these are implementation detail and not meant to be used standalone. The one exception is `slot="empty-label"` — see [Slots](#slots) below.

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

| Property               | Attribute                | Type                                 | Default             | Description                                                                                                                      |
| ---------------------- | ------------------------ | ------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `columns`              | —                        | `DataGridColumn[]`                   | `[]`                | Column definitions                                                                                                               |
| `rows`                 | —                        | `object[]`                           | `[]`                | Row data. In pagination `server` mode, only the current page's rows                                                              |
| `rowHeight`            | `row-height`             | `number`                             | `40`                | Fixed row height in px (drives virtualization math)                                                                              |
| `headerHeight`         | `header-height`          | `number`                             | `48`                | Header row height in px                                                                                                          |
| `overscan`             | `overscan`               | `number`                             | `5`                 | Extra rows rendered above/below the visible window                                                                               |
| `getRowId`             | —                        | `(row) => string \| number`          | `row => row.id`     | Row identity, used for keyed rendering and dedupe                                                                                |
| `getRowClassName`      | —                        | `(row, rowIndex) => string`          | —                   | Optional per-row class name (e.g. to highlight a row)                                                                            |
| `paginationModel`      | —                        | `{ page: number, pageSize: number }` | —                   | Setting this enables pagination; leave unset for full virtualized scroll                                                         |
| `paginationMode`       | `pagination-mode`        | `"client" \| "server"`               | `"client"`          | `client`: `rows` holds the full dataset, sliced internally. `server`: `rows` is just the current page                            |
| `rowCount`             | `row-count`              | `number`                             | `rows.length`       | Total row count across all pages. Required in `server` mode                                                                      |
| `pageSizeOptions`      | —                        | `number[]`                           | `[10, 25, 50, 100]` | Choices shown in the footer's "Rows per page" selector. `[]` hides the selector entirely                                         |
| `hidePagination`       | `hide-pagination`        | `boolean`                            | `false`             | Hides `md-data-footer` without disabling pagination logic — drive `page`/`pageSize` from your own UI via `setPage`/`setPageSize` |
| `disableCellHighlight` | `disable-cell-highlight` | `boolean`                            | `false`             | Disables the primary-color border shown around the last-clicked/keyboard-navigated cell                                          |
| `disableColumnResize`  | `disable-column-resize`  | `boolean`                            | `false`             | Disables drag-to-resize on every column, regardless of each column's `resizable` field                                           |

### `DataGridColumn`

| Field          | Type                                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `field`        | `string`                                                             | Key into each row object                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `headerName`   | `string`                                                             | Header label (defaults to `field`)                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `width`        | `number`                                                             | Column width in px (omit for a flexible `1fr` column). Exact — takes priority over `minWidth`/`maxWidth`                                                                                                                                                                                                                                                                                                                                                                                   |
| `minWidth`     | `number`                                                             | Floor (px) on the flexible column, only applies when `width` is unset                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `maxWidth`     | `number`                                                             | Ceiling (px) on the flexible column, only applies when `width` is unset. Sizes the column by content up to the cap rather than growing to fill space and then clamping — `fr` units can't be combined with a hard ceiling in a single CSS Grid track, so a capped column stops absorbing leftover row width. A sibling column left as plain `1fr` still absorbs whatever this one doesn't use                                                                                              |
| `colSpan`      | `number`                                                             | Header-only, default `1`. The header cell spans this many column tracks; the next `colSpan - 1` columns render no header cell of their own (their data cells are unaffected — every row still renders one cell per column). Clamped so a span can never reach past the last column                                                                                                                                                                                                         |
| `resizable`    | `boolean`                                                            | Default `true`. Set `false` to opt this column out of drag-to-resize. The last column never gets a handle, regardless of this field. On a `colSpan` column, the handle resizes the _last covered_ column's width, not the spanning column's own. Resizing trades width with the immediate right-hand neighbor (that neighbor shrinks/grows by the same amount) — the grid's total width never changes, and the trade is capped as soon as either column hits its own `minWidth`/`maxWidth` |
| `align`        | `"left" \| "right" \| "center"`                                      | Text alignment for both header and cells (default `"left"`)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `valueGetter`  | `(params: DataGridCellParams) => unknown`                            | Computes the cell's value from the row                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `renderCell`   | `(params: DataGridCellParams) => TemplateResult \| string \| number` | Custom cell renderer                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `renderHeader` | `(column: DataGridColumn) => TemplateResult \| string`               | Custom header renderer                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

`DataGridCellParams` is `{ row, column, rowIndex, value }`.

## Methods

| Method                  | Description                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `scrollToRow(index)`    | Scrolls the viewport so `rows[index]` is within view                                            |
| `getVisibleRows()`      | Returns `{ row, rowIndex }[]` for the rows currently rendered (including overscan)              |
| `setPage(page)`         | Changes the current page (clamped, no-op if pagination isn't enabled)                           |
| `setPageSize(pageSize)` | Changes the page size and resets to page `0`                                                    |
| `updateRows(changes)`   | Applies a batch of row add/update/delete changes without replacing `rows` wholesale — see below |

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

| Event                                  | `detail`                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `md-data-grid-row-click`               | `{ row, rowIndex }`                           | Fired when a row is clicked                                                                                                                                                                                                                                                                                                                                                                                        |
| `md-data-grid-pagination-model-change` | `{ page, pageSize }`                          | Fired whenever the page changes (footer buttons or `setPage`/`setPageSize`)                                                                                                                                                                                                                                                                                                                                        |
| `md-data-grid-rows-update`             | `{ added, updated, deleted }` (arrays of ids) | Fired once per `updateRows()` call that actually changed something                                                                                                                                                                                                                                                                                                                                                 |
| `md-data-grid-column-resize`           | `{ field, colIndex, width, phase }`           | Fired continuously while dragging a column's resize handle — `phase` is `"start"`, `"resize"` (once per pointer move), or `"end"`. `colIndex`/`field`/`width` describe the dragged column (the last covered column, for a `colSpan` header); its immediate right-hand neighbor changes width too (by the same amount, opposite direction) but isn't reflected in this event — read `grid.columns` if you need both |

## Slots

| Slot          | Description                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `empty-label` | Optional content shown instead of the default "No rows" text when there are zero rows (or zero rows on the current page). Plain text or any markup — the default is just fallback content, replaced entirely by whatever you slot in |

```html
<md-data-grid id="grid">
  <span slot="empty-label">No results match your filters.</span>
</md-data-grid>
```

## CSS Shadow Parts

Every part below is reachable directly as `md-data-grid::part(name)` — you never need to reach into any sub-component yourself. `md-data-cell`, `md-data-column-header`, and `md-data-footer` have no wrapper element, so `part` lives directly on their own tag and is already visible one level up with no forwarding needed; parts nested deeper (inside `md-data-column-header` or `md-data-footer`'s own shadow roots — the label, separator, count text, buttons, page-size select) are forwarded up via `exportparts`.

| Part                  | Element                                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`                | The grid's outer container                                                                                                                                                                                                                                                                                       |
| `header`              | The sticky header row — has a vertical divider between columns (`border-inline`)                                                                                                                                                                                                                                 |
| `header-cell`         | A single header cell (`md-data-column-header`'s own tag — its host is the rendered cell, no wrapper element)                                                                                                                                                                                                     |
| `title`               | The header's label (on `md-data-column-header`, forwarded — rendered by `md-data-column-title`, a nested sub-component). Owns single-line truncation (`text-overflow: ellipsis`) independently from `header-cell` so a long label never forces the column wider                                                  |
| `separator`           | The vertical divider on a column's trailing edge (on `md-data-column-header`, forwarded — rendered by `md-data-column-separator`, a nested sub-component). An SVG rect, not a border, so its ends can be rounded. Doubles as the drag handle when the column is resizable, turning primary-colored on hover/drag |
| `header-gutter`       | Trailing spacer matching the viewport's scrollbar width, keeping header/body columns aligned                                                                                                                                                                                                                     |
| `viewport`            | The scrollable viewport                                                                                                                                                                                                                                                                                          |
| `empty-state`         | The "No rows" / `slot="empty-label"` container, shown in place of the row area when there are zero rows                                                                                                                                                                                                          |
| `spacer`              | The full-height scroll spacer behind the virtualized row window                                                                                                                                                                                                                                                  |
| `rows`                | The translated window of currently-rendered rows                                                                                                                                                                                                                                                                 |
| `row`                 | A single data row — also carries `getRowClassName`'s output as an additional part token, e.g. `::part(row--pending)`. No vertical column dividers (only the header has those)                                                                                                                                    |
| `cell`                | A single data cell (`md-data-cell`'s own tag — its host is the rendered/focusable cell, no wrapper element)                                                                                                                                                                                                      |
| `footer`              | The pagination footer (`md-data-footer`'s own tag — its host is the rendered footer bar, no wrapper element)                                                                                                                                                                                                     |
| `rows-per-page-label` | The "Rows per page:" label (forwarded)                                                                                                                                                                                                                                                                           |
| `page-size-select`    | The page-size `md-select` (forwarded)                                                                                                                                                                                                                                                                            |
| `page-size-option`    | Each `md-option` inside the page-size select (forwarded)                                                                                                                                                                                                                                                         |
| `footer-count`        | The "X–Y of Z" count text (forwarded)                                                                                                                                                                                                                                                                            |
| `footer-prev`         | The previous-page button (forwarded)                                                                                                                                                                                                                                                                             |
| `footer-next`         | The next-page button (forwarded)                                                                                                                                                                                                                                                                                 |

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
