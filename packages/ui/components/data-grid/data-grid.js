import { html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextProvider } from "@lit/context";
import { repeat } from "lit/directives/repeat.js";

import "./components/column-header/data-grid-column-header.js";
import "./components/cell/data-grid-cell.js";
import "./components/footer/data-grid-footer.js";
import "../progress-linear/progress-linear.js";
import "../skeleton/skeleton.js";

import { dataGridContext } from "./data-grid-context.js";
import { VirtualizationController } from "./controllers/data-grid-virtualization-controller.js";
import { PaginationController } from "./controllers/data-grid-pagination-controller.js";
import { RowUpdatesController } from "./controllers/data-grid-row-updates-controller.js";
import { KeyboardNavController } from "./controllers/data-grid-keyboard-nav-controller.js";
import { ColumnResizeController } from "./controllers/data-grid-column-resize-controller.js";
import { SortController } from "./controllers/data-grid-sort-controller.js";
import { RowSpanController } from "./controllers/data-grid-row-span-controller.js";
import { TreeController } from "./controllers/data-grid-tree-controller.js";
import { RowSelectionController } from "./controllers/data-grid-selection-controller.js";
import { GRID_CHECKBOX_SELECTION_COL_DEF } from "./data-grid-checkbox-column.js";
import { buildDataGridContext } from "./data-grid-build-context.js";
import styles from "./data-grid.css?inline";

/**
 * @typedef {object} DataGridColumn
 * @property {string} field
 * @property {string} [headerName]
 * @property {number} [width]        // px; omitted columns share remaining space (grid `1fr`)
 * @property {number} [minWidth]     // px; only applies when `width` is unset — floor on the flexible column
 * @property {number} [maxWidth]     // px; only applies when `width` is unset — ceiling on the flexible column
 * @property {number} [colSpan]      // default 1; spans this many column tracks in the header AND every row — the next (colSpan - 1) columns render no header/data cell of their own for that row
 * @property {boolean} [resizable]   // default true — set false to opt this column out of drag-to-resize
 * @property {boolean} [sortable]    // default true — set false to opt this column out of click-to-sort
 * @property {boolean} [rowSpannable] // default true — set false to opt this column out of row spanning when the grid's rowSpanning is on
 * @property {"left" | "right" | "center"} [align]  // default "left"
 * @property {(params: DataGridCellParams) => unknown} [valueGetter]
 * @property {(params: DataGridCellParams) => import("lit").TemplateResult | string | number} [renderCell]
 * @property {(column: DataGridColumn) => import("lit").TemplateResult | string} [renderHeader]
 * @property {(params: DataGridCellParams) => unknown} [rowSpanValueGetter] // computes the equality key used to detect consecutive-equal-value runs; falls back to valueGetter, then the raw field value
 * @property {string | ((params: DataGridCellParams) => string)} [cellClassName] // extra class name(s) (space-separated) applied to every md-data-cell in this column — a plain string, or computed per cell
 * @property {string | ((column: DataGridColumn) => string)} [headerClassName] // extra class name(s) (space-separated) applied to this column's md-data-column-header — a plain string, or computed from the column
 */

/**
 * @typedef {object} DataGridCellParams
 * @property {Record<string, unknown>} row
 * @property {DataGridColumn} column
 * @property {number} rowIndex
 * @property {unknown} value
 */

/**
 * @typedef {object} DataGridPaginationModel
 * @property {number} page
 * @property {number} pageSize
 */

/**
 * One entry of `sortModel`. `sort: null | undefined` means the field is
 * tracked but the rule doesn't apply (no active direction) — distinct from
 * omitting the entry entirely, but both render/sort the same way.
 * @typedef {object} DataGridSortItem
 * @property {string} field
 * @property {"asc" | "desc" | null | undefined} sort
 */

/**
 * An entry for `updateRows()`. Matched against existing rows via
 * `getRowId()`. Without `_action`, the entry shallow-merges onto the
 * existing row (or is inserted as a new row if no match is found). With
 * `_action: "delete"`, the matching row is removed.
 * @typedef {Record<string, unknown> & { _action?: "delete" }} DataGridRowUpdate
 */

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_HEADER_HEIGHT = 48;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SKELETON_ROW_COUNT = 8;

/**
 * Deterministic pseudo-random width (40–85%) for a skeleton cell, seeded by
 * its position — stable across re-renders (no jumping around on every
 * loading-state re-render, unlike `Math.random()`) while still varying per
 * cell/row, mimicking real text of differing lengths.
 * @param {number} rowIndex
 * @param {number} colIndex
 * @returns {number}
 */
function skeletonWidth(rowIndex, colIndex) {
  const seed = Math.sin(rowIndex * 12.9898 + colIndex * 78.233) * 43758.5453;
  const fraction = seed - Math.floor(seed);
  return 40 + Math.round(fraction * 45);
}

/**
 * A column's `colSpan`, clamped so it never reaches past the last column.
 * Shared by the header and every row's cell loop — both skip the next
 * `span - 1` columns and render one cell spanning `span` tracks instead.
 * @param {DataGridColumn[]} columns
 * @param {number} colIndex
 * @returns {number}
 */
function clampColSpan(columns, colIndex) {
  return Math.max(
    1,
    Math.min(columns[colIndex].colSpan ?? 1, columns.length - colIndex),
  );
}

/** @param {Record<string, unknown>} row */
const defaultGetRowId = (row) => /** @type {string | number} */ (row.id);

/**
 * @tag md-data-grid
 * @summary Virtualized Material Design 3 data grid.
 *
 * `columns` and `rows` are set imperatively
 * (`document.querySelector("md-data-grid").rows = [...]`) — not light-DOM
 * children. The one exception is `slot="empty-label"`: optional content
 * shown instead of the default "No rows" text when there are no rows to
 * display. Internally composes `md-data-column-header`, `md-data-cell`, and
 * `md-data-footer`.
 *
 * This class is an orchestration layer: virtualization, pagination, row
 * updates, and keyboard nav each live in their own Reactive Controller
 * (`data-grid-*-controller.js`). Cross-controller wiring (resetting scroll
 * on page change, clamping the page when `rows` changes) happens only in
 * `updated()` below — the controllers don't know about each other.
 */
@customElement("md-data-grid")
export class MdDataGrid extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    columns: { state: true },
    rows: { state: true },
    rowHeight: { type: Number, attribute: "row-height" },
    headerHeight: { type: Number, attribute: "header-height" },
    overscan: { type: Number },
    getRowId: { state: true },
    getRowClassName: { state: true },
    paginationModel: { state: true },
    paginationMode: { attribute: "pagination-mode" },
    pageSizeOptions: { state: true },
    rowCount: { type: Number, attribute: "row-count" },
    sortModel: { state: true },
    rowSpanning: { type: Boolean, attribute: "row-spanning", reflect: true },
    loading: { type: Boolean, attribute: "loading", reflect: true },
    rowSelectionModel: { state: true },
    hidePagination: {
      type: Boolean,
      attribute: "hide-pagination",
      reflect: true,
    },
    disableCellHighlight: {
      type: Boolean,
      attribute: "disable-cell-highlight",
      reflect: true,
    },
    disableColumnResize: {
      type: Boolean,
      attribute: "disable-column-resize",
      reflect: true,
    },
    disableColumnSorting: {
      type: Boolean,
      attribute: "disable-column-sorting",
      reflect: true,
    },
    disableMultipleRowSelection: {
      type: Boolean,
      attribute: "disable-multiple-row-selection",
      reflect: true,
    },
    disableRowSelectionOnClick: {
      type: Boolean,
      attribute: "disable-row-selection-on-click",
      reflect: true,
    },
    checkboxSelection: {
      type: Boolean,
      attribute: "checkbox-selection",
      reflect: true,
    },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {DataGridColumn[]} */
    this.columns = [];

    /** @type {Record<string, unknown>[]} */
    this.rows = [];

    /** @type {number} */
    this.rowHeight = DEFAULT_ROW_HEIGHT;

    /** @type {number} */
    this.headerHeight = DEFAULT_HEADER_HEIGHT;

    /** @type {number} */
    this.overscan = DEFAULT_OVERSCAN;

    /** @type {(row: Record<string, unknown>) => string | number} */
    this.getRowId = defaultGetRowId;

    /** @type {((row: Record<string, unknown>, rowIndex: number) => string) | undefined} */
    this.getRowClassName = undefined;

    /** @type {DataGridPaginationModel | undefined} */
    this.paginationModel = undefined;

    /** @type {"client" | "server"} */
    this.paginationMode = "client";

    /** @type {number[]} */
    this.pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

    /** @type {number | undefined} */
    this.rowCount = undefined;

    /** @type {DataGridSortItem[]} */
    this.sortModel = [];

    /** @type {boolean} */
    this.rowSpanning = false;

    /** @type {boolean} */
    this.loading = false;

    /** @type {Set<PropertyKey>} */
    this.rowSelectionModel = new Set();

    /** @type {boolean} */
    this.hidePagination = false;

    /** @type {boolean} */
    this.disableCellHighlight = false;

    /** @type {boolean} */
    this.disableColumnResize = false;

    /** @type {boolean} */
    this.disableColumnSorting = false;

    /** @type {boolean} */
    this.disableMultipleRowSelection = false;

    /** @type {boolean} */
    this.disableRowSelectionOnClick = false;

    /** @type {boolean} */
    this.checkboxSelection = false;

    // Not @private: data-grid-build-context.js reads these directly as an
    // internal sibling module — see §15 of the data-grid plan.
    this._virtualization = new VirtualizationController(this);
    this._pagination = new PaginationController(this);
    this._rowUpdates = new RowUpdatesController(this);
    this._keyboardNav = new KeyboardNavController(this, {
      // focusedCell isn't a Lit reactive property, so willUpdate()'s
      // property-changed gate can't see it change — rebuild the context
      // immediately instead of waiting for the next tracked-property update.
      onFocusChange: () =>
        this._gridContextProvider.setValue(buildDataGridContext(this)),
    });
    this._columnResize = new ColumnResizeController(this);
    this._sort = new SortController(this);
    this._rowSpan = new RowSpanController(this);
    this._tree = new TreeController(this);
    this._tree.build(this.rows);
    this._selection = new RowSelectionController(this);

    /** @private */
    this._gridContextProvider = new ContextProvider(this, {
      context: dataGridContext,
    });
    this._gridContextProvider.setValue(buildDataGridContext(this));
  }

  /** @param {import("lit").PropertyValues} changed */
  firstUpdated(changed) {
    super.firstUpdated(changed);
    this._virtualization.observeViewport();
  }

  /** @param {import("lit").PropertyValues} changed */
  willUpdate(changed) {
    if (
      changed.has("rowHeight") ||
      changed.has("getRowId") ||
      changed.has("rows") ||
      changed.has("paginationModel") ||
      changed.has("paginationMode") ||
      changed.has("pageSizeOptions") ||
      changed.has("rowCount") ||
      changed.has("disableCellHighlight") ||
      changed.has("rowSelectionModel") ||
      changed.has("disableMultipleRowSelection")
    ) {
      this._gridContextProvider.setValue(buildDataGridContext(this));
    }
  }

  /**
   * All cross-controller wiring lives here — the controllers themselves
   * don't reference each other. See §15 of the data-grid plan.
   * @param {import("lit").PropertyValues} changed
   */
  updated(changed) {
    super.updated(changed);
    if (changed.has("paginationModel")) {
      this._virtualization.resetScroll();
    }
    if (changed.has("rows") && this.paginationModel) {
      // No-op if the current page is still in range.
      this._pagination.setPage(this.paginationModel.page);
    }
    if (changed.has("rows") || changed.has("getRowId")) {
      this._tree.build();
    }
    if (changed.has("rows") || changed.has("sortModel")) {
      this._selection.resetAnchor();
    }
  }

  /**
   * `columns` with `GRID_CHECKBOX_SELECTION_COL_DEF` prepended when
   * `checkboxSelection` is on — the actual list rendered (header + every
   * row) and the one every column-index-based controller (resize,
   * keyboard nav) operates against, so the checkbox column is genuinely
   * column 0 rather than a visual overlay bolted on separately. `columns`
   * itself (the public property) is never touched — `ColumnResizeController`
   * writes back to it with the checkbox's offset subtracted out again.
   */
  get _columns() {
    return this.checkboxSelection
      ? [GRID_CHECKBOX_SELECTION_COL_DEF, ...this.columns]
      : this.columns;
  }

  /** `rows` run through the active sort — the shared starting point for pagination/virtualization/keyboard nav below. */
  get _sortedRows() {
    return this._sort.sortedRows(this.rows);
  }

  /** Sorted rows sliced to the current page (client mode) or passed through as-is (server mode / no pagination). */
  get _effectiveRows() {
    return this._pagination.effectiveRows(this._sortedRows);
  }

  /** @returns {number} */
  get _pageCount() {
    return this._pagination.pageCount;
  }

  /** @param {number} index */
  scrollToRow(index) {
    this._virtualization.scrollToRow(index);
  }

  /** @returns {{ row: Record<string, unknown>, rowIndex: number }[]} */
  getVisibleRows() {
    const effectiveRows = this._pagination.effectiveRows(this._sortedRows);
    const { startIndex, endIndex } = this._virtualization.visibleRange(
      effectiveRows.length,
    );
    return effectiveRows
      .slice(startIndex, endIndex)
      .map((row, i) => ({ row, rowIndex: startIndex + i }));
  }

  /** @param {number} page */
  setPage(page) {
    this._pagination.setPage(page);
  }

  /** @param {number} pageSize */
  setPageSize(pageSize) {
    this._pagination.setPageSize(pageSize);
  }

  /**
   * Applies a batch of row changes without replacing `rows` wholesale.
   *
   * Each entry is matched against existing rows via `getRowId()`:
   * - `{ ...fields, _action: "delete" }` removes the matching row.
   * - `{ ...fields }` (no `_action`) shallow-merges onto the matching row,
   *   or — if no row matches — is inserted as a new row, appended to the end.
   *
   * Entries whose id can't be resolved via `getRowId()` are skipped with a
   * console warning. Dispatches a single `md-data-grid-rows-update` event
   * summarizing the batch.
   * @param {DataGridRowUpdate | DataGridRowUpdate[]} changes
   */
  updateRows(changes) {
    this._rowUpdates.update(changes);
  }

  /** @param {Event} event */
  _onScroll(event) {
    this._virtualization.onScroll(event);
  }

  /**
   * Shift-clicking to range-select rows is also, natively, how a browser
   * extends a text selection — without this, every shift-click after the
   * first drags a text-selection highlight across whatever cell content
   * sits between the anchor row and the clicked one. That selection is
   * made at mousedown (before `click` fires), so it has to be suppressed
   * here, not in `_onRowClick()`; preventing default on `mousedown` blocks
   * the native selection without blocking the click that follows it.
   * @param {MouseEvent} event
   */
  _onRowMouseDown(event) {
    if (event.shiftKey) event.preventDefault();
  }

  /**
   * @param {MouseEvent} event
   * @param {Record<string, unknown>} row
   * @param {number} rowIndex
   * @param {Record<string, unknown>[]} rows the exact rows this click happened against — for shift-range selection
   */
  _onRowClick(event, row, rowIndex, rows) {
    if (!this.disableRowSelectionOnClick) {
      // With checkboxSelection on, a plain row click behaves like the
      // checkbox's own click — additive (add/remove just this row) rather
      // than replacing the whole selection with it — matching what the
      // visible checkboxes imply: clicking a row is another way to check
      // its box, not a single-select action that would silently uncheck
      // every other one. Shift-click still range-selects either way.
      const modifiers = this.checkboxSelection
        ? { shiftKey: event.shiftKey, ctrlKey: true, metaKey: true }
        : event;
      this._selection.select(row, rowIndex, modifiers, rows);
    }
    this.dispatchEvent(
      new CustomEvent("md-data-grid-row-click", {
        detail: { row, rowIndex },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** @param {KeyboardEvent} event */
  _onKeydown(event) {
    const rowCount = this._pagination.effectiveRows(this._sortedRows).length;
    this._keyboardNav.onKeydown(event, {
      rowCount,
      colCount: this._columns.length,
      ensureRowVisible: (rowIndex) =>
        this._virtualization.ensureRowVisible(rowIndex, rowCount),
    });
  }

  render() {
    const columns = this._columns;
    const gridTemplateColumns =
      this._virtualization.gridTemplateColumns(columns);
    const scrollbarWidth = this._virtualization.scrollbarWidth;
    const headerGridTemplateColumns = scrollbarWidth
      ? `${gridTemplateColumns} ${scrollbarWidth}px`
      : gridTemplateColumns;
    const effectiveRows = this._pagination.effectiveRows(this._sortedRows);
    const { startIndex, endIndex } = this._virtualization.visibleRange(
      effectiveRows.length,
    );
    const visibleRows = effectiveRows.slice(startIndex, endIndex);
    const totalHeight = effectiveRows.length * this.rowHeight;
    const offsetY = startIndex * this.rowHeight;
    // Computed over the full (post-sort, post-pagination) effectiveRows —
    // not just visibleRows — so a run's owner still reports its true span
    // even when part of the run is outside the current virtualized window.
    const rowSpans = this._rowSpan.computeSpans(effectiveRows);
    // Skeleton rows replace the empty state while there's no data yet to
    // show real virtualized rows for; once some rows exist, a reload is
    // shown as the thin progress bar + overlay instead (below) — the two
    // are mutually exclusive, never both at once.
    const showSkeletonRows = this.loading && effectiveRows.length === 0;
    const showLoadingOverlay = this.loading && effectiveRows.length > 0;

    return html`
      <div class="data-grid" part="root">
        <div
          class="data-grid__header"
          part="header"
          role="row"
          style="grid-template-columns: ${headerGridTemplateColumns}; height: ${this
            .headerHeight}px;"
        >
          ${(() => {
            // `repeat()` invokes this callback once per column, in array
            // order, synchronously within this render pass — a closured
            // counter is enough to track how far a preceding colSpan reaches
            // and skip the header cells it covers.
            let coveredUntil = -1;
            return repeat(
              columns,
              (column) => column.field,
              (column, colIndex) => {
                if (colIndex <= coveredUntil) return nothing;
                const span = clampColSpan(columns, colIndex);
                coveredUntil = colIndex + span - 1;
                const resizeColIndex = coveredUntil;
                const resizable = this._columnResize.isResizable(
                  column,
                  resizeColIndex,
                );
                const sortable = this._sort.isSortable(column);
                const sort = this._sort.getSort(column.field);
                return html`
                  <md-data-column-header
                    exportparts="separator, title, sort-icon"
                    .column=${column}
                    .colIndex=${colIndex}
                    .colSpan=${span}
                    .resizeColIndex=${resizeColIndex}
                    .resizable=${resizable}
                    .sortable=${sortable}
                    .sort=${sort}
                    @click=${() => {
                      if (sortable) this._sort.toggleSort(column.field);
                    }}
                  ></md-data-column-header>
                `;
              },
            );
          })()}
          ${scrollbarWidth
            ? html`<div
                class="data-grid__header-gutter"
                part="header-gutter"
              ></div>`
            : nothing}
        </div>
        <div
          class="data-grid__viewport"
          part="viewport"
          @scroll=${this._onScroll}
          @keydown=${this._onKeydown}
        >
          ${showLoadingOverlay
            ? html`<md-progress-linear
                class="data-grid__loading-indicator"
                part="loading-indicator"
                aria-label="Loading"
              ></md-progress-linear>`
            : nothing}
          ${effectiveRows.length === 0
            ? showSkeletonRows
              ? html`
                  <div class="data-grid__skeleton-rows" part="skeleton-rows">
                    ${Array.from(
                      { length: SKELETON_ROW_COUNT },
                      (_, rowIndex) => html`
                        <div
                          class="data-grid__row"
                          part="row"
                          style="grid-template-columns: ${gridTemplateColumns}; height: ${this
                            .rowHeight}px;"
                        >
                          ${columns.map(
                            (_column, colIndex) => html`
                              <div class="data-grid__skeleton-cell" part="cell">
                                <md-skeleton
                                  part="skeleton"
                                  style="width: ${skeletonWidth(
                                    rowIndex,
                                    colIndex,
                                  )}%;"
                                ></md-skeleton>
                              </div>
                            `,
                          )}
                        </div>
                      `,
                    )}
                  </div>
                `
              : html`
                  <div class="data-grid__empty-state" part="empty-state">
                    <slot name="empty-label">No rows</slot>
                  </div>
                `
            : html`
                <div
                  class="data-grid__spacer"
                  part="spacer"
                  style="height: ${totalHeight}px;"
                >
                  <div
                    class="data-grid__rows"
                    part="rows"
                    style="transform: translateY(${offsetY}px);"
                  >
                    ${repeat(
                      visibleRows,
                      (row) => this.getRowId(row),
                      (row, i) => {
                        const rowIndex = startIndex + i;
                        const rowClassName =
                          this.getRowClassName?.(row, rowIndex) ?? "";
                        const selected = this._selection.isSelected(row);
                        return html`
                          <div
                            class="data-grid__row ${rowClassName} ${selected
                              ? "data-grid__row_selected"
                              : ""}"
                            part="row ${rowClassName}"
                            role="row"
                            aria-selected=${selected}
                            style="grid-template-columns: ${gridTemplateColumns}; height: ${this
                              .rowHeight}px; --height: ${this.rowHeight}px;"
                            @mousedown=${this._onRowMouseDown}
                            @click=${(/** @type {MouseEvent} */ event) =>
                              this._onRowClick(
                                event,
                                row,
                                rowIndex,
                                effectiveRows,
                              )}
                          >
                            ${(() => {
                              // Same coveredUntil skip as the header loop
                              // above, reset per row — a column's colSpan
                              // merges its cells across every row, not
                              // just the header.
                              let coveredUntil = -1;
                              return repeat(
                                columns,
                                (column) => column.field,
                                (column, colIndex) => {
                                  if (colIndex <= coveredUntil) return nothing;
                                  const span = clampColSpan(columns, colIndex);
                                  coveredUntil = colIndex + span - 1;
                                  const spanInfo = rowSpans.get(column.field)?.[
                                    rowIndex
                                  ];
                                  // Covered by an earlier row's row-span run
                                  // for this column — that owner cell paints
                                  // over this slot by overflowing downward.
                                  if (spanInfo && !spanInfo.owner)
                                    return nothing;
                                  return html`
                                    <md-data-cell
                                      .row=${row}
                                      .column=${column}
                                      .rowIndex=${rowIndex}
                                      .colIndex=${colIndex}
                                      .colSpan=${span}
                                      .rowSpan=${spanInfo?.span ?? 1}
                                    ></md-data-cell>
                                  `;
                                },
                              );
                            })()}
                          </div>
                        `;
                      },
                    )}
                  </div>
                </div>
              `}
          ${showLoadingOverlay
            ? html`<div
                class="data-grid__loading-overlay"
                part="loading-overlay"
              ></div>`
            : nothing}
        </div>
        ${this.paginationModel && !this.hidePagination
          ? html`<md-data-footer
              exportparts="rows-per-page-label,page-size-select,page-size-option,footer-count,footer-prev,footer-next"
            ></md-data-footer>`
          : nothing}
      </div>
    `;
  }
}
