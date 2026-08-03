# Plan: `<md-data-grid>`

## 1. File layout

```
components/data-grid/
  data-grid.js              # md-data-grid — root, owns rows/columns/virtualization
  data-grid-cell.js         # md-data-cell — one body cell
  data-grid-column-header.js # md-data-column-header — one header cell
  data-grid-footer.js       # md-data-footer — pagination footer (count + prev/next)
  data-grid-context.js      # dataGridContext (createContext)
  data-grid.css
  data-grid-cell.css
  data-grid-column-header.css
  data-grid-footer.css
  index.js                  # re-exports + side-effect imports (pattern from chips/index.js, tabs/index.js)
  README.md
  __tests__/data-grid.spec.js
  stories/data-grid.stories.js
```

Registered as a side-effect import in `components/index.js`, and all four tags added to `HTMLElementTagNameMap` in `components/elements.d.ts`.

Note: CLAUDE.md says components use `<name>.ts`, but every real component (`select.js`, `list.js`, `button.js`, ...) is actually `.js` with JSDoc types + `tsc --noEmit` type checking (see commit `186872d migration from ts`). This plan follows the actual codebase convention: **`.js` + JSDoc**.

## 2. Component tree

`md-data-grid` has no light-DOM children from the consumer's point of view — `columns`/`rows` are set imperatively via `querySelector`/`getElementById`. Internally, its own `render()` composes child custom elements: `md-data-column-header` (one per column, in the sticky header), `md-data-cell` (one per column, per virtualized row), and — only when pagination is enabled and not hidden — a single `md-data-footer`. These are implementation detail, not user-facing slots.

```
md-data-grid
├── .data-grid__header  (sticky, not virtualized)
│     └── md-data-column-header × N columns
├── .data-grid__viewport (scroll container)
│     └── .data-grid__spacer (sized to rows.length * rowHeight)
│           └── .data-grid__rows (translateY-positioned window)
│                 └── .data-grid__row × visible rows
│                       └── md-data-cell × N columns
└── md-data-footer  (rendered only if paginationModel is set and hidePagination is false)
```

## 3. Context (`data-grid-context.js`)

`@lit/context` is already a project dependency (used, if only partially, by `select.js`'s `selectContext`). `md-data-grid` **provides** a context value; `md-data-column-header`, `md-data-cell`, and `md-data-footer` **consume** it. This avoids threading grid-wide state (density, row height, focus position, pagination) through every single cell/footer instance as individual properties — only `row`/`column`/`rowIndex`/`colIndex` are passed directly to cells, since those genuinely vary per cell.

```js
// data-grid-context.js
import { createContext } from "@lit/context";

/**
 * @typedef {object} DataGridContextValue
 * @property {number} rowHeight
 * @property {(row: object) => string | number} getRowId
 * @property {{ rowIndex: number, colIndex: number }} focusedCell
 * @property {(rowIndex: number, colIndex: number) => void} setFocusedCell
 * @property {number} page                 // current page index, 0 when pagination disabled
 * @property {number} pageSize
 * @property {number} pageCount
 * @property {number} rowCount
 * @property {number} firstRowIndex        // 0-based index of first row on the current page
 * @property {number} lastRowIndex         // 0-based index of last row on the current page
 * @property {(page: number) => void} setPage
 * @property {(pageSize: number) => void} setPageSize
 */

/** @type {import("@lit/context").Context<symbol, DataGridContextValue>} */
export const dataGridContext = createContext(Symbol("data-grid"));
```

`md-data-grid` provides it via the `@provide` decorator:

```js
import { provide } from "@lit/context";
import { dataGridContext } from "./data-grid-context.js";

@customElement("md-data-grid")
export class MdDataGrid extends LitElement {
  @provide({ context: dataGridContext })
  _gridContext = {
    rowHeight: this.rowHeight,
    getRowId: this.getRowId,
    focusedCell: { rowIndex: 0, colIndex: 0 },
    setFocusedCell: (rowIndex, colIndex) => {
      this._gridContext = {
        ...this._gridContext,
        focusedCell: { rowIndex, colIndex },
      };
    },
  };
  // reassigning _gridContext (new object identity) is what notifies subscribed consumers
}
```

Children consume with `@consume({ context: dataGridContext, subscribe: true })`.

## 4. `md-data-column-header`

```js
/**
 * @typedef {import("./data-grid.js").DataGridColumn} DataGridColumn
 */
@customElement("md-data-column-header")
export class MdDataColumnHeader extends LitElement {
  static properties = {
    column: { attribute: false },
    colIndex: { type: Number },
  };

  /** @type {import("./data-grid-context.js").DataGridContextValue} */
  @consume({ context: dataGridContext, subscribe: true })
  _grid;

  static get styles() {
    return [styles];
  } // :host { display: contents; } — see §10

  render() {
    const { column } = this;
    return html`
      <div
        class="data-grid-column-header"
        part="header-cell"
        role="columnheader"
      >
        ${column.renderHeader
          ? column.renderHeader(column)
          : (column.headerName ?? column.field)}
      </div>
    `;
  }
}
```

## 5. `md-data-cell`

```js
@customElement("md-data-cell")
export class MdDataCell extends LitElement {
  static properties = {
    row: { attribute: false },
    column: { attribute: false },
    rowIndex: { type: Number },
    colIndex: { type: Number },
  };

  @consume({ context: dataGridContext, subscribe: true })
  _grid;

  static get styles() {
    return [styles];
  } // :host { display: contents; }

  get _value() {
    const { row, column, rowIndex } = this;
    const raw = row[column.field];
    return column.valueGetter
      ? column.valueGetter({ row, column, rowIndex, value: raw })
      : raw;
  }

  render() {
    const { row, column, rowIndex, colIndex } = this;
    const value = this._value;
    const focused =
      this._grid?.focusedCell?.rowIndex === rowIndex &&
      this._grid?.focusedCell?.colIndex === colIndex;

    return html`
      <div
        class="data-grid-cell"
        part="cell"
        role="gridcell"
        tabindex=${focused ? "0" : "-1"}
        @focus=${() => this._grid?.setFocusedCell(rowIndex, colIndex)}
      >
        ${column.renderCell
          ? column.renderCell({ row, column, rowIndex, value })
          : value}
      </div>
    `;
  }
}
```

Roving tabindex across the grid (Arrow keys) is handled at the `md-data-grid` level (same spirit as `md-list`'s `_handleKeydown`/`_focusItem`), computing the next `{rowIndex, colIndex}` arithmetically — not by querying DOM, since off-screen cells aren't rendered — then calling `scrollToRow` if the target is outside the virtualized window, and updating `focusedCell` via context so the newly-visible cell picks up `tabindex="0"`.

## 6. `md-data-footer`

A dedicated element rather than a plain `<div>` baked into `md-data-grid`'s own template — same architectural pattern as `md-data-cell`/`md-data-column-header`: composed internally by `md-data-grid`'s `render()`, consumes `dataGridContext` for all the pagination state it needs, exposes its own `part`s for external styling.

```js
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { consume } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import chevronLeft from "@material-design-icons/svg/outlined/chevron_left.svg?raw";
import chevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?raw";

import "../icon-button/icon-button.js";

import { dataGridContext } from "./data-grid-context.js";
import styles from "./data-grid-footer.css?inline";

@customElement("md-data-footer")
export class MdDataFooter extends LitElement {
  /** @type {import("./data-grid-context.js").DataGridContextValue} */
  @consume({ context: dataGridContext, subscribe: true })
  _grid;

  static get styles() {
    return [styles];
  }

  render() {
    const { page, pageCount, rowCount, firstRowIndex, lastRowIndex, setPage } =
      this._grid;

    return html`
      <div class="data-grid-footer" part="footer">
        <span class="data-grid-footer__count" part="footer-count">
          ${firstRowIndex + 1}–${lastRowIndex + 1} of ${rowCount}
        </span>
        <md-icon-button
          part="footer-prev"
          ?disabled=${page <= 0}
          @click=${() => setPage(page - 1)}
          aria-label="Previous page"
        >
          ${unsafeSVG(chevronLeft)}
        </md-icon-button>
        <md-icon-button
          part="footer-next"
          ?disabled=${page >= pageCount - 1}
          @click=${() => setPage(page + 1)}
          aria-label="Next page"
        >
          ${unsafeSVG(chevronRight)}
        </md-icon-button>
      </div>
    `;
  }
}
```

`md-data-grid` decides _whether_ to render it at all — `${this.paginationModel && !this.hidePagination ? html`<md-data-footer></md-data-footer>` : nothing}` — so hiding pagination (§8) is a grid-level concern, not something `md-data-footer` decides for itself.

## 7. `md-data-grid` public API

```js
static properties = {
  columns: { state: true },      // DataGridColumn[]
  rows: { state: true },         // object[]
  rowHeight: { type: Number, attribute: "row-height" },       // px, default 40
  headerHeight: { type: Number, attribute: "header-height" }, // px, default 48
  overscan: { type: Number },    // extra rows rendered above/below viewport, default 5
  getRowId: { state: true },     // (row) => string|number, default row => row.id
  getRowClassName: { state: true }, // (row, rowIndex) => string, optional per-row class for highlighting (e.g. a "pending" row)
  paginationModel: { state: true },  // { page: number, pageSize: number } | undefined — undefined = pagination disabled (default), see §9
  paginationMode: { attribute: "pagination-mode" }, // "client" | "server", default "client", see §9
  rowCount: { type: Number, attribute: "row-count" }, // total row count across all pages; defaults to rows.length in client mode, required in server mode, see §9
  hidePagination: { type: Boolean, attribute: "hide-pagination", reflect: true }, // default false; hides md-data-footer without disabling pagination logic — see §9
};
```

```js
/**
 * @typedef {object} DataGridColumn
 * @property {string} field
 * @property {string} [headerName]
 * @property {number} [width]        // px; omitted columns share remaining space (grid `1fr`)
 * @property {number} [minWidth]
 * @property {"left" | "right" | "center"} [align]  // default "left"; applied to both header and body cells
 * @property {(params: DataGridCellParams) => unknown} [valueGetter]
 * @property {(params: DataGridCellParams) => import("lit").TemplateResult | string | number} [renderCell]
 * @property {(column: DataGridColumn) => import("lit").TemplateResult | string} [renderHeader]
 */

/**
 * @typedef {object} DataGridCellParams
 * @property {object} row
 * @property {DataGridColumn} column
 * @property {number} rowIndex
 * @property {unknown} value
 */
```

Public methods:

- `scrollToRow(index)` — scrolls the viewport so `rows[index]` is within view.
- `getVisibleRows()` — returns the rows currently rendered in the DOM (the virtualized window, including overscan): `{ row: object, rowIndex: number }[]`, derived from the same `startIndex`/`endIndex` used to render (§8). Useful for tests and for consumers that need to know what's actually on screen (e.g. lazy-loading more data as the window nears the end of `rows`). When pagination is enabled, `rowIndex` is relative to the current page (§9), matching `rows`/`_effectiveRows` indexing.
- `setPage(page)` — convenience for `grid.paginationModel = { ...grid.paginationModel, page }`; validates against `pageCount` (§9). This is the same function passed through context (§3) as `setPage` for `md-data-footer` to call.
- `setPageSize(pageSize)` — same, for `pageSize`; resets `page` to `0` since the row range changes.

Events:

- `md-data-grid-row-click` — `detail: { row, rowIndex }`.
- `md-data-grid-pagination-model-change` — `detail: { page, pageSize }`, dispatched whenever `md-data-footer`'s prev/next controls (or `setPage`/`setPageSize`) change the page — regardless of whether the footer is visible (`hidePagination`). In server mode this is the signal for the consumer to fetch the new page's data and assign it to `rows` (§9).

## 8. Virtualization (fixed row height)

- Viewport: `div.data-grid__viewport` with `overflow-y: auto`, height controlled by consumer via CSS (`#grid { height: 400px }`).
- Inner spacer: `div` sized to `rows.length * rowHeight` so the scrollbar reflects true content size.
- Rendered window: `div.data-grid__rows` positioned with `transform: translateY(startIndex * rowHeight)`, containing only `rows.slice(startIndex, endIndex)`, each wrapped in a `.data-grid__row` that hosts `colIndex` `md-data-cell`s.
- `startIndex = max(0, floor(scrollTop / rowHeight) - overscan)`, `endIndex = min(rows.length, ceil((scrollTop + viewportHeight) / rowHeight) + overscan)`.
- Scroll handler is `requestAnimationFrame`-throttled, updates internal state (`_scrollTop`) via `requestUpdate()` rather than a public reactive property.
- `ResizeObserver` (`@lit-labs/observers`, already a project dependency) on the viewport tracks `viewportHeight`.
- Header row (`md-data-column-header` row) is not virtualized — always rendered, `position: sticky; top: 0`.
- Column layout uses CSS Grid on `.data-grid__header` and every `.data-grid__row`: `grid-template-columns` built from `columns.map(c => c.width ? `${c.width}px` : "1fr")`, computed once and reused for both so header/body cells line up.

## 9. Pagination

Modeled on MUI X's `GridPaginationModel`/`paginationMode`/`rowCount` (see [`gridPaginationSelector.ts`](https://github.com/mui/mui-x/blob/master/packages/x-data-grid/src/hooks/features/pagination/gridPaginationSelector.ts)), adapted to this project's flat-property Lit convention — no nested Redux-like state, just plain reactive properties on `md-data-grid`.

**Disabled by default** — if `paginationModel` is left `undefined`, the grid behaves exactly as in §8: `rows` is virtualized in full, no `md-data-footer` is rendered. Setting `grid.paginationModel = { page: 0, pageSize: 25 }` opts in.

**Hiding the footer without disabling pagination** — `hidePagination` (§7) controls only whether `md-data-footer` is rendered; the `paginationModel`-driven row slicing and virtualization keep working underneath. This is for consumers who want the grid to page its data but drive `page`/`pageSize` from their own UI elsewhere (calling `grid.setPage(n)` directly) instead of the built-in footer.

**`paginationMode: "client"` (default)** — `rows` holds the _entire_ dataset. The grid derives the current page's slice itself (mirrors `gridPaginationRowRangeSelector`):

```js
const firstRowIndex = Math.min(pageSize * page, rows.length - 1);
const lastRowIndex = Math.min(firstRowIndex + pageSize - 1, rows.length - 1);
const _effectiveRows = rows.slice(firstRowIndex, lastRowIndex + 1);
```

`rowCount` defaults to `rows.length` and doesn't need to be set explicitly.

**`paginationMode: "server"`** — `rows` holds _only_ the current page (the consumer fetches per-page data). `_effectiveRows = rows` directly, no slicing. `rowCount` must be set explicitly by the consumer (total count from the server), since `rows.length` is just the current page's size and can't be used to compute `pageCount`.

**`_effectiveRows` feeds §8's virtualization** in place of `rows` — the spacer height, `startIndex`/`endIndex` math, and rendered `md-data-cell`s all operate on `_effectiveRows`. Changing `paginationModel.page` resets `_scrollTop` to `0` (row indices restart per page) and re-triggers the scroll/resize computation.

`pageCount = Math.max(1, Math.ceil(rowCount / pageSize))` (mirrors MUI X's `getPageCount`), used to disable the "next" control at the last page and to clamp `setPage`.

**Footer** — `<md-data-footer>` (§6) is rendered below `.data-grid__viewport`, _not_ virtualized, only when `paginationModel` is set and `hidePagination` is `false`. It reads `page`/`pageCount`/`rowCount`/`firstRowIndex`/`lastRowIndex` and calls `setPage` entirely through `dataGridContext` — `md-data-grid` passes it no properties directly.

Clicking prev/next updates `paginationModel` (new object identity, propagated through context) and dispatches `md-data-grid-pagination-model-change` (§7) from `md-data-grid` — the event is always dispatched from the grid itself, not from `md-data-footer`, so consumers only need one listener regardless of whether the built-in footer or a custom `hidePagination`-driven UI triggered the change.

## 10. Styling

BEM + MD3 CSS custom properties, consistent with `list.css`/`select.css`. Because `md-data-cell`/`md-data-column-header` are themselves grid items participating in the parent's `grid-template-columns`, their `:host` must be `display: contents` so the inner `.data-grid-cell`/`.data-grid-column-header` div — not the custom element wrapper — is the actual grid item; otherwise column alignment between header and body breaks. `md-data-footer` is a normal block-level `:host` (not a grid item), since it sits below the header/row grid rather than inside it.

Classes: `.data-grid`, `.data-grid__header`, `.data-grid__viewport`, `.data-grid__row`, plus each sub-component's own root class (`.data-grid-cell`, `.data-grid-column-header`, `.data-grid-footer`). Tokens: `--md-data-grid-row-height`, `--md-sys-color-*` for borders/hover/focus ring.

## 11. Testing

`__tests__/data-grid.spec.js` (`@open-wc/testing`):

- renders one `md-data-column-header` per column, in order
- only renders `md-data-cell`s within the visible window + overscan for a large `rows` array (assert DOM row count << `rows.length`)
- `renderCell`/`renderHeader`/`valueGetter` callbacks receive correct params and their return value appears in the cell
- scrolling the viewport shifts the rendered window and updates `translateY`
- `getVisibleRows()` matches the actually-rendered `md-data-cell`/row DOM after scrolling (including overscan)
- `md-data-grid-row-click` fires with correct `detail`
- `getRowId` fallback and custom override both dedupe correctly
- context: focusing a cell updates `focusedCell` and moves `tabindex="0"`; Arrow key navigation moves focus and scrolls off-screen targets into view
- pagination (client mode): `_effectiveRows` is the correct slice of `rows` for a given `paginationModel`; changing `page` resets scroll and re-renders the correct slice; footer count text and prev/next disabled-state are correct at the first/last page
- pagination (server mode): `_effectiveRows` equals `rows` unmodified (no client-side slicing); `pageCount` is computed from `rowCount`, not `rows.length`; changing pages dispatches `md-data-grid-pagination-model-change` without mutating `rows` itself
- `setPage`/`setPageSize` clamp to valid ranges and update `md-data-footer`
- `hidePagination`: `md-data-footer` is absent from the DOM when `true`, even with a `paginationModel` set; `_effectiveRows`/virtualization still reflect the current page; `setPage` called directly still works and still dispatches `md-data-grid-pagination-model-change`

`__tests__/data-grid-cell.spec.js`, `__tests__/data-grid-column-header.spec.js`, `__tests__/data-grid-footer.spec.js`: isolated unit tests for each sub-component against a stub context value — the footer spec covers prev/next disabled state at page boundaries and the count text format.

## 12. Visual design (per reference screenshot — transactions table)

Reference: a rounded card containing a 4-column table (Дата / Описание / Сумма / Категория), thin row dividers, no vertical grid lines, right-aligned amount and category columns, category rendered as a small colored pill, one row highlighted (peach background) showing a dashed "Выбрать ⌄" chip instead of a category pill.

- **Container**: `md-data-grid` is _not_ itself a card — it's placed in `<md-card>`'s default slot, same as any other block content (`md-card`'s `renderSlots()` already has an unnamed `<slot>`). The card supplies the rounded surface (`--md-card-shape`), elevation/shadow (`md-shadow` internally), and outer padding; `md-data-grid`'s own default styling stays flat/transparent (no border, no shadow, `background: transparent`) so it composes cleanly inside a card _or_ sits directly on a page.
- **Row dividers**: `.data-grid__row` gets `border-bottom: 1px solid var(--md-sys-color-outline-variant)`; last row's border removed (`:last-child`). No vertical borders anywhere — column separation is spacing only.
- **Header**: muted text (`--md-sys-color-on-surface-variant`), smaller/medium-weight label typography, sits above the first divider; no distinct background.
- **Column alignment**: Дата/Описание use `align: "left"` (default); Сумма/Категория use `align: "right"` — applied as `text-align` on both `.data-grid-column-header` and `.data-grid-cell` via the new `align` field (§7).
- **Amount column**: plain text cell (no `renderCell` needed), styled via a `valueGetter` that formats the number; color comes from app-level CSS (e.g. a `negative`/`positive` class from `renderCell` if both signs are needed later) — for an all-expenses table like the screenshot, a static muted-red text color on the column is enough.
- **Category pill**: `renderCell` returns an `md-assist-chip` (or a plain `<span>` if a non-interactive pill is preferred) with per-category color set via inline `style`, overriding the chip's own custom properties: `--md-chip-container-color`, `--md-chip-label-color`, `--md-chip-border-width: 0`. Category → color mapping lives in the consuming app (demo/story), not in the library — the grid stays domain-agnostic.
- **Highlighted "pending" row**: driven by `getRowClassName`, e.g. `(row) => row.pending ? "row--pending" : ""`; `.data-grid__row.row--pending` gets a peach/amber background (`color-mix` off `--md-sys-color-tertiary-container` or a plain app-level token). Its `renderCell` for the category column conditionally returns the "Выбрать" picker chip instead of a pill when `row.category` is unset — again pure `renderCell` branching, no extra grid API.
- **"Выбрать" control**: an `md-assist-chip` with a trailing chevron icon and a dashed border (`--md-chip-border-width: 0.063rem`, `border-style: dashed` via a demo-local class) — visually a trigger, wiring it to an actual picker (e.g. `md-select` in a popover) is out of scope for v1 and can be a follow-up.
- **Footer buttons**: the two rounded placeholders cut off at the bottom of the reference screenshot map to `md-data-footer`'s prev/next `md-icon-button`s (§6, §9) — pagination, not a separate demo-only element.

## 13. Stretch goals (out of scope for v1)

Column resize/reorder, sorting, pinned columns, row selection, dynamic row height.

## 14. Implementation steps

Ordered so each step only depends on files already created in a prior step.

1. **Scaffold files** — create the `components/data-grid/` directory and empty files listed in §1 (`data-grid.js`, `data-grid-cell.js`, `data-grid-column-header.js`, `data-grid-footer.js`, `data-grid-context.js`, matching `.css` files, `index.js`).
2. **`data-grid-context.js`** — `createContext(Symbol("data-grid"))` + `DataGridContextValue` JSDoc typedef, including the pagination fields (§3).
3. **`md-data-column-header`** — properties (`column`, `colIndex`), `@consume` wiring, render header text/`renderHeader`, `:host { display: contents }` CSS (§4, §10).
4. **`md-data-cell`** — properties (`row`, `column`, `rowIndex`, `colIndex`), `@consume` wiring, `_value` getter (`valueGetter` fallback), render `renderCell`/plain value, focus → `setFocusedCell`, `tabindex` roving logic, `:host { display: contents }` CSS (§5, §10).
5. **`md-data-footer`** — `@consume` wiring (no own properties, everything from context), prev/next `md-icon-button`s, count text, disabled state at page boundaries (§6).
6. **`md-data-grid` — static shape** — `properties` block (`columns`, `rows`, `rowHeight`, `headerHeight`, `overscan`, `getRowId`, `getRowClassName`, `paginationModel`, `paginationMode`, `rowCount`, `hidePagination`), constructor defaults, `DataGridColumn`/`DataGridCellParams` JSDoc typedefs (§7).
7. **`md-data-grid` — context provider** — `@provide({ context: dataGridContext })`, `setFocusedCell` implementation that reassigns the context object (§3).
8. **`md-data-grid` — grid-template-columns** — helper that maps `columns` → `"{width}px" | "1fr"` string, reused by header and every row (§8).
9. **`md-data-grid` — virtualization core** — `_scrollTop`/`_viewportHeight` state, `ResizeObserver` on the viewport, `rAF`-throttled scroll handler, `startIndex`/`endIndex` math, `scrollToRow(index)` and `getVisibleRows()` public methods (§8).
10. **`md-data-grid` — pagination** — `_effectiveRows` derivation (client-mode slicing vs. server-mode passthrough), `pageCount` computation, `setPage`/`setPageSize`, pushing `page`/`pageCount`/`rowCount`/`firstRowIndex`/`lastRowIndex`/`setPage`/`setPageSize` into the context object from step 7, scroll reset on page change, feeding `_effectiveRows` into step 9's virtualization instead of raw `rows` (§9).
11. **`md-data-grid` — render()** — sticky header (`md-data-column-header` per column), spacer + translateY-positioned row window (`md-data-cell` per column per visible row) over `_effectiveRows`, `getRowClassName` applied per `.data-grid__row`, `<md-data-footer>` conditionally rendered based on `paginationModel && !hidePagination`, `md-data-grid-row-click` dispatch, listening for `md-data-footer`'s page changes to dispatch `md-data-grid-pagination-model-change` (§2, §6, §7, §8, §9).
12. **`md-data-grid` — keyboard navigation** — Arrow key handler computing next `{rowIndex, colIndex}` arithmetically, calling `scrollToRow` when the target is outside the current window, updating `focusedCell` via context (§5).
13. **Styling pass** — `data-grid.css` (flat/transparent host, row dividers, sticky header, `align` → `text-align`), `data-grid-cell.css`, `data-grid-column-header.css`, `data-grid-footer.css` (count text + button layout); verify visually nested inside `<md-card>` per §12 (visual design) against the reference screenshot.
14. **Wire up exports** — `components/data-grid/index.js` re-exports/side-effect-imports all four elements; add the import to `components/index.js`; add `md-data-grid`, `md-data-cell`, `md-data-column-header`, `md-data-footer` to `HTMLElementTagNameMap` in `components/elements.d.ts`; add `"./data-grid"` to `package.json` `exports` (mirroring existing per-component export entries).
15. **Tests** (§11) — `data-grid-cell.spec.js`, `data-grid-column-header.spec.js`, and `data-grid-footer.spec.js` against a stub context first (smallest units), then `data-grid.spec.js` for virtualization window size, callback params, scroll behavior, row-click event, `getRowId` dedupe, focus/keyboard navigation, and client/server pagination including `hidePagination`.
16. **Storybook story** — `stories/data-grid.stories.js`: a basic columns/rows demo, a paginated demo (both `client` and `server` mode, and one with `hide-pagination` driving page changes from an external button), plus the `md-card`-wrapped transactions-table story reproducing the reference screenshot (category pills, pending row, "Выбрать" chip, footer).
17. **README.md** — usage snippet (from "Proposed usage" above), full prop/column/event API tables including pagination and `hidePagination`, following the format of `select/README.md`.
18. **Manual verification** — `pnpm sb`, check the story against the screenshot (alignment, dividers, pill colors, sticky header, virtualized scroll with a large dataset, footer behavior at first/last page, footer disappearing with `hide-pagination`); `pnpm typecheck` and `pnpm lint` clean.

---

## Proposed usage

```html
<md-card style="width: 480px;">
  <md-data-grid id="grid" style="height: 360px; width: 100%;"></md-data-grid>
</md-card>

<script type="module">
  import "@symblight/wc-material/card";
  import "@symblight/wc-material/data-grid";
  import "@symblight/wc-material/chips";
  import { html } from "lit";

  const CATEGORY_COLORS = {
    Food: { bg: "#e3f2e5", fg: "#2e7d43" },
    Rent: { bg: "#e6edfb", fg: "#2f5fc4" },
    Subscriptions: { bg: "#fbe6ef", fg: "#c23a72" },
  };

  const grid = document.getElementById("grid");

  grid.columns = [
    { field: "date", headerName: "Дата", width: 72 },
    { field: "description", headerName: "Описание" }, // no width -> flexible 1fr
    {
      field: "amount",
      headerName: "Сумма",
      width: 110,
      align: "right",
      valueGetter: ({ row }) => `−${row.amount.toFixed(2)} €`,
    },
    {
      field: "category",
      headerName: "Категория",
      width: 140,
      align: "right",
      renderCell: ({ row }) => {
        if (!row.category) {
          return html`<md-assist-chip
            class="category-picker"
            style="--md-chip-border-width: 0.063rem; --md-chip-container-color: transparent;"
          >
            Выбрать
          </md-assist-chip>`;
        }
        const { bg, fg } = CATEGORY_COLORS[row.category];
        return html`<md-assist-chip
          style="--md-chip-container-color: ${bg}; --md-chip-label-color: ${fg}; --md-chip-border-width: 0;"
        >
          ${row.category}
        </md-assist-chip>`;
      },
    },
  ];

  grid.getRowClassName = (row) => (row.pending ? "row--pending" : "");

  // 42 transactions total; footer shows "1–6 of 42" with prev/next controls
  // (the two rounded placeholders at the bottom of the reference screenshot).
  grid.rows = allTransactions; // full client-side dataset
  grid.paginationModel = { page: 0, pageSize: 6 };

  grid.addEventListener("md-data-grid-row-click", (e) => {
    console.log(e.detail.row);
  });
  grid.addEventListener("md-data-grid-pagination-model-change", (e) => {
    console.log(e.detail.page, e.detail.pageSize); // grid already re-rendered; nothing to fetch in client mode
  });
</script>
```

### Pagination usage — server mode

`rows` holds only the current page; `rowCount` carries the total so the footer/`pageCount` can be computed without fetching everything.

```html
<md-data-grid
  id="grid"
  pagination-mode="server"
  style="height: 320px;"
></md-data-grid>

<script type="module">
  const grid = document.getElementById("grid");
  grid.columns = [
    /* ... */
  ];
  grid.paginationModel = { page: 0, pageSize: 25 };

  async function loadPage(page, pageSize) {
    const res = await fetch(
      `/api/transactions?page=${page}&pageSize=${pageSize}`,
    );
    const { rows, totalCount } = await res.json();
    grid.rows = rows; // just this page's rows
    grid.rowCount = totalCount; // total across all pages, drives pageCount/footer
  }

  grid.addEventListener("md-data-grid-pagination-model-change", (e) => {
    loadPage(e.detail.page, e.detail.pageSize);
  });

  loadPage(0, 25);
</script>
```

---

## 15. Internal architecture: splitting `data-grid.js` into Reactive Controllers

`data-grid.js` grew to own five entangled concerns in one class: virtualization/scroll, pagination, row updates, keyboard nav/focus, and context assembly. Lit's `ReactiveController` interface (`hostConnected`/`hostDisconnected`/`hostUpdate`/`hostUpdated`, a `host` reference, `host.requestUpdate()`) is the framework's own answer to "React hooks" — already used twice in this file (`ResizeController`, `ContextProvider`). This section documents the split.

### File layout

```
components/data-grid/
  data-grid.js                          # host — properties, lifecycle wiring, render()
  data-grid-virtualization-controller.js # scroll position, ResizeObserver (viewport height + scrollbar width), visibleRange()
  data-grid-pagination-controller.js     # effectiveRows(), rowCount, pageCount, pageRange(), setPage(), setPageSize()
  data-grid-row-updates-controller.js    # updateRows()
  data-grid-keyboard-nav-controller.js   # focusedCell state, onKeydown(), focusCell()
  data-grid-build-context.js             # buildDataGridContext(host) — plain function, not a controller (no lifecycle needed, just reads the others and returns a snapshot)
```

### The interdependency problem

Unlike independent hooks, these concerns depend on each other: virtualization needs pagination's row count; pagination needs to reset scroll (virtualization's job) on page change; keyboard nav needs data from all three. Three ways to wire this, decided via `/grill-me`:

1. **Host reacts via `updated()`** (chosen) — controllers know nothing about each other. `PaginationController.setPage()` only sets `host.paginationModel`; the host's `updated(changed)` does `if (changed.has("paginationModel")) this._virtualization.resetScroll()`. Equivalent to a React `useEffect(fn, [dep])`. Bonus: this also fixes an inconsistency — page-clamping used to only happen inside `updateRows()`/`setPage()`, not on a plain `grid.rows = [...]` assignment. Routing it through `updated()` (`if (changed.has("rows") && paginationModel) this._pagination.setPage(current)`) makes it consistent regardless of how `rows` changed.
2. Controllers reference each other directly — rejected, couples construction order, harder to test in isolation.
3. Host passes data as explicit params — used for the _one-shot_ dependencies (e.g. `visibleRange(rowCount)` takes `rowCount` as a parameter rather than reaching into the pagination controller itself; `KeyboardNavController.onKeydown(event, { rowCount, colCount, ensureRowVisible })` takes small injected values/callbacks rather than sibling controller references).

### Other decisions this surfaced

- `focusedCell` moves from being nested inside the context-provider's value (with an awkward self-referencing `this._gridContextProvider.value?.focusedCell ?? {...}` fallback) to being `KeyboardNavController`'s own independent state. `buildDataGridContext()` just reads it directly — no more self-reference hack.
- Controller-owned reactive-feeling state (`scrollTop`, `focusedCell`) are plain fields, not Lit `@property`/`state` — controllers must call `host.requestUpdate()` explicitly after changing them (same pattern `ResizeController` itself already uses internally).
- Public API (`scrollToRow`, `getVisibleRows`, `setPage`, `setPageSize`, `updateRows`) stays on `MdDataGrid` as thin one-line delegations to the relevant controller, so the external contract in the README doesn't change.
- Existing tests reach into `el._effectiveRows`, `el._pageCount`, `el._gridContextProvider.value.focusedCell` directly — these stay as host getters/the same context shape so no test rewrites are needed, only the internals move.

### Post-implementation fix: `focusedCell` context sync

Testing caught a real regression the design above didn't anticipate: `focusedCell` isn't a Lit reactive property (it lives on `KeyboardNavController` as a plain field, changed via arrow-key nav), so `willUpdate()`'s property-changed gate — which only checks actual tracked properties (`rows`, `paginationModel`, etc.) — never sees it change and never rebuilds the shared context. Before the refactor, `setFocusedCell` sidestepped this entirely by calling `_gridContextProvider.setValue()` directly and immediately, bypassing the gate on purpose.

Fixed by giving `KeyboardNavController` an injected `onFocusChange` callback (constructor option), wired by the host to `() => this._gridContextProvider.setValue(buildDataGridContext(this))`. `setFocusedCell()` calls it synchronously before `host.requestUpdate()`. This keeps the controller decoupled from context internals (it only knows "something happened", not what a context provider is) while restoring the original immediate-rebuild behavior. Caught by the existing `keyboard navigation` test suite (`el._gridContextProvider.value.focusedCell` assertions) — both failed cleanly with the exact stale-value symptom before this fix.

## 16. Current file layout (supersedes §1 and §15's layout)

```
components/data-grid/
  data-grid.js                          # host — properties, lifecycle wiring, render()
  data-grid-context.js                  # dataGridContext (createContext) + DataGridContextValue typedef
  data-grid-build-context.js            # buildDataGridContext(host) — plain function
  data-grid.css
  controllers/
    data-grid-virtualization-controller.js
    data-grid-pagination-controller.js
    data-grid-row-updates-controller.js
    data-grid-keyboard-nav-controller.js
    data-grid-column-resize-controller.js
  components/                           # internal sub-components (own custom elements, not controllers)
    cell/data-grid-cell.js / .css
    column-header/data-grid-column-header.js / .css
    column-separator/data-grid-column-separator.js / .css
    column-title/data-grid-column-title.js / .css
    footer/data-grid-footer.js / .css
  index.js
  README.md
  __tests__/
  stories/
```

Also added since §15: `DataGridColumn.colSpan` (header cell spans N column tracks via `grid-column: span N`); `slot="empty-label"` overriding the default "No rows" text; `exportparts` on internal sub-component usages in `data-grid.js` so nested parts are reachable as `md-data-grid::part(...)` from outside; drag-to-resize (`ColumnResizeController` + `md-data-column-separator`); each `components/` sub-component given its own folder (`cell/`, `column-header/`, etc.), mirroring the top-level `components/<name>/` convention.

`md-data-cell`, `md-data-column-header`, `md-data-footer`, and `md-data-column-separator` were all later refactored to be host-only (no wrapper `<div>`) — `part`, ARIA role, event listeners, and dynamic classes/styles live directly on `this`/`:host` rather than an inner element. `md-data-column-header`'s label was further split into its own `md-data-column-title` sub-component specifically so its `overflow: hidden` (needed to stop a long label from blowing out its grid track) doesn't also clip `md-data-column-separator`, which deliberately hangs half outside the header's box to sit centered on the column boundary. Because a nested descendant's `overflow: hidden` doesn't zero out an _ancestor's_ own intrinsic-size contribution to the outer grid track, `md-data-column-header`'s `:host` needs its own explicit `min-inline-size: 0` (unconditional, unlike the automatic-minimum-size-via-overflow trick) to avoid the blowout independently of the title's clipping.
