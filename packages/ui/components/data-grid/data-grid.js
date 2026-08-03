import { html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextProvider } from "@lit/context";
import { repeat } from "lit/directives/repeat.js";

import "./components/column-header/data-grid-column-header.js";
import "./components/cell/data-grid-cell.js";
import "./components/footer/data-grid-footer.js";

import { dataGridContext } from "./data-grid-context.js";
import { VirtualizationController } from "./controllers/data-grid-virtualization-controller.js";
import { PaginationController } from "./controllers/data-grid-pagination-controller.js";
import { RowUpdatesController } from "./controllers/data-grid-row-updates-controller.js";
import { KeyboardNavController } from "./controllers/data-grid-keyboard-nav-controller.js";
import { ColumnResizeController } from "./controllers/data-grid-column-resize-controller.js";
import { buildDataGridContext } from "./data-grid-build-context.js";
import styles from "./data-grid.css?inline";

/**
 * @typedef {object} DataGridColumn
 * @property {string} field
 * @property {string} [headerName]
 * @property {number} [width]        // px; omitted columns share remaining space (grid `1fr`)
 * @property {number} [minWidth]     // px; only applies when `width` is unset — floor on the flexible column
 * @property {number} [maxWidth]     // px; only applies when `width` is unset — ceiling on the flexible column
 * @property {number} [colSpan]      // default 1; header cell only — spans this many column tracks, and the next (colSpan - 1) columns render no header cell of their own
 * @property {boolean} [resizable]   // default true — set false to opt this column out of drag-to-resize
 * @property {"left" | "right" | "center"} [align]  // default "left"
 * @property {(params: DataGridCellParams) => unknown} [valueGetter]
 * @property {(params: DataGridCellParams) => import("lit").TemplateResult | string | number} [renderCell]
 * @property {(column: DataGridColumn) => import("lit").TemplateResult | string} [renderHeader]
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

    /** @type {boolean} */
    this.hidePagination = false;

    /** @type {boolean} */
    this.disableCellHighlight = false;

    /** @type {boolean} */
    this.disableColumnResize = false;

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
      changed.has("disableCellHighlight")
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
  }

  /** Rows sliced to the current page (client mode) or passed through as-is (server mode / no pagination). */
  get _effectiveRows() {
    return this._pagination.effectiveRows();
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
    const effectiveRows = this._pagination.effectiveRows();
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
   * @param {Record<string, unknown>} row
   * @param {number} rowIndex
   */
  _onRowClick(row, rowIndex) {
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
    const rowCount = this._pagination.effectiveRows().length;
    this._keyboardNav.onKeydown(event, {
      rowCount,
      colCount: this.columns.length,
      ensureRowVisible: (rowIndex) =>
        this._virtualization.ensureRowVisible(rowIndex, rowCount),
    });
  }

  render() {
    const gridTemplateColumns = this._virtualization.gridTemplateColumns(
      this.columns,
    );
    const scrollbarWidth = this._virtualization.scrollbarWidth;
    const headerGridTemplateColumns = scrollbarWidth
      ? `${gridTemplateColumns} ${scrollbarWidth}px`
      : gridTemplateColumns;
    const effectiveRows = this._pagination.effectiveRows();
    const { startIndex, endIndex } = this._virtualization.visibleRange(
      effectiveRows.length,
    );
    const visibleRows = effectiveRows.slice(startIndex, endIndex);
    const totalHeight = effectiveRows.length * this.rowHeight;
    const offsetY = startIndex * this.rowHeight;

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
              this.columns,
              (column) => column.field,
              (column, colIndex) => {
                if (colIndex <= coveredUntil) return nothing;
                const span = Math.max(
                  1,
                  Math.min(column.colSpan ?? 1, this.columns.length - colIndex),
                );
                coveredUntil = colIndex + span - 1;
                const resizeColIndex = coveredUntil;
                const resizable = this._columnResize.isResizable(
                  column,
                  resizeColIndex,
                );
                return html`
                  <md-data-column-header
                    exportparts="separator, title"
                    .column=${column}
                    .colIndex=${colIndex}
                    .colSpan=${span}
                    .resizeColIndex=${resizeColIndex}
                    .resizable=${resizable}
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
          ${effectiveRows.length === 0
            ? html`
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
                        return html`
                          <div
                            class="data-grid__row ${rowClassName}"
                            part="row ${rowClassName}"
                            role="row"
                            style="grid-template-columns: ${gridTemplateColumns}; height: ${this
                              .rowHeight}px; --height: ${this.rowHeight}px;"
                            @click=${() => this._onRowClick(row, rowIndex)}
                          >
                            ${repeat(
                              this.columns,
                              (column) => column.field,
                              (column, colIndex) => html`
                                <md-data-cell
                                  .row=${row}
                                  .column=${column}
                                  .rowIndex=${rowIndex}
                                  .colIndex=${colIndex}
                                ></md-data-cell>
                              `,
                            )}
                          </div>
                        `;
                      },
                    )}
                  </div>
                </div>
              `}
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
