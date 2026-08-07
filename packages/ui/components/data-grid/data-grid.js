import { html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextProvider } from "@lit/context";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";

import "./components/header-cell/data-grid-header-cell.js";
import "./components/column/data-grid-column.js";
import "./components/cell/data-grid-cell.js";
import "./components/footer/data-grid-footer.js";
import "../progress-linear/progress-linear.js";
import "../skeleton/skeleton.js";

import { dataGridContext } from "./data-grid-context.js";
import { DeclarativeSlotController } from "./controllers/data-grid-declarative-slot-controller.js";
import {
  VirtualizationController,
  estimateRowHeight,
} from "./controllers/data-grid-virtualization-controller.js";
import { PaginationController } from "./controllers/data-grid-pagination-controller.js";
import { RowUpdatesController } from "./controllers/data-grid-row-updates-controller.js";
import { KeyboardNavController } from "./controllers/data-grid-keyboard-nav-controller.js";
import { FocusController } from "./controllers/data-grid-focus-controller.js";
import { ColumnResizeController } from "./controllers/data-grid-column-resize-controller.js";
import { SortController } from "./controllers/data-grid-sort-controller.js";
import { RowSpanController } from "./controllers/data-grid-row-span-controller.js";
import { TreeController } from "./controllers/data-grid-tree-controller.js";
import { RowSelectionController } from "./controllers/data-grid-selection-controller.js";
import { DetailPanelController } from "./controllers/data-grid-detail-panel-controller.js";
import { GRID_CHECKBOX_SELECTION_COL_DEF } from "./data-grid-checkbox-column.js";
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from "./data-grid-detail-panel-column.js";
import { GRID_TREE_DATA_GROUPING_COL_DEF } from "./data-grid-tree-data-column.js";
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
 * @property {string | ((column: DataGridColumn) => string)} [headerClassName] // extra class name(s) (space-separated) applied to this column's md-data-header-cell — a plain string, or computed from the column
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

const DEFAULT_ROW_HEIGHT = 52;
const DEFAULT_HEADER_HEIGHT = 48;
const DEFAULT_OVERSCAN = 8;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SKELETON_ROW_COUNT = 8;

/**
 * Initial size guess for a detail-panel row, used only until it's actually
 * rendered and measured (same "guess corrected by real measurement" pattern
 * `rowHeight: "auto"` already uses for ordinary rows) — content is arbitrary
 * and typically taller than one row, so a plain row's own estimate wouldn't
 * be a reasonable starting point.
 */
const DETAIL_PANEL_ESTIMATED_HEIGHT = 128;

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
 * children. Two light-DOM slots exist as declarative overrides of otherwise
 * internal rendering: `slot="empty-label"` (optional content shown instead
 * of the default "No rows" text when there are no rows to display) and
 * `slot="footer"` (optional content that replaces the internal, pagination-
 * driven `md-data-footer` entirely — native `<slot>` fallback-content
 * semantics mean whatever's slotted in wins outright, regardless of
 * `paginationModel`/`hidePagination`). Internally composes
 * `md-data-header-cell`, `md-data-cell`, and `md-data-footer`.
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
    // noAccessor: true — a custom get/set pair is defined below instead, so
    // an assignment while <md-data-grid-column> children are present can
    // warn (DeclarativeColumnsController.sync() is the one legitimate writer
    // in that case, and marks itself via _isSyncing so its own writes don't
    // trip the warning).
    columns: { state: true, noAccessor: true },
    rows: { state: true },
    rowHeight: {
      attribute: "row-height",
      converter: {
        fromAttribute: (value) => (value === "auto" ? "auto" : Number(value)),
        toAttribute: (value) => String(value),
      },
    },
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
    getDetailPanelContent: { state: true },
    detailPanelExpandedRowIds: { state: true },
    treeData: { type: Boolean, attribute: "tree-data", reflect: true },
    getDataPath: { state: true },
    treeDataExpandedGroupIds: { state: true },
    autoGroupColumnDef: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @private @type {DataGridColumn[]} */
    this._columnsValue = [];

    /** @type {Record<string, unknown>[]} */
    this.rows = [];

    /** @type {number | "auto"} */
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

    /**
     * @type {((params: { row: Record<string, unknown>, rowIndex: number }) => unknown) | undefined}
     */
    this.getDetailPanelContent = undefined;

    /** @type {Set<PropertyKey>} */
    this.detailPanelExpandedRowIds = new Set();

    /** @type {boolean} */
    this.treeData = false;

    /** @type {((row: Record<string, unknown>) => PropertyKey[] | undefined) | undefined} */
    this.getDataPath = undefined;

    /** @type {Set<PropertyKey>} */
    this.treeDataExpandedGroupIds = new Set();

    /**
     * Shallow-merged onto `GRID_TREE_DATA_GROUPING_COL_DEF` — same shape as
     * an ordinary `DataGridColumn`, lets you override `headerName`/
     * `valueGetter`/etc. for the grouping/toggle column without redefining
     * it from scratch.
     * @type {Partial<DataGridColumn> | undefined}
     */
    this.autoGroupColumnDef = undefined;

    // Not @private: data-grid-build-context.js reads these directly as an
    // internal sibling module — see §15 of the data-grid plan.
    this._virtualization = new VirtualizationController(this);
    this._pagination = new PaginationController(this);
    this._rowUpdates = new RowUpdatesController(this);
    this._focus = new FocusController(this, {
      // focus state isn't a Lit reactive property, so willUpdate()'s
      // property-changed gate can't see it change — rebuild the context
      // immediately instead of waiting for the next tracked-property update.
      onFocusChange: () =>
        this._gridContextProvider.setValue(buildDataGridContext(this)),
    });
    this._keyboardNav = new KeyboardNavController(this);
    this._columnResize = new ColumnResizeController(this, {
      // resizingColumnField isn't a Lit reactive property either — same
      // reasoning as _focus's onFocusChange above, fired only on drag
      // start/end, never per pointermove (see the controller's own doc
      // comment on why per-move state deliberately bypasses Lit).
      onResizeStateChange: () =>
        this._gridContextProvider.setValue(buildDataGridContext(this)),
    });
    this._sort = new SortController(this);
    this._rowSpan = new RowSpanController(this);
    this._tree = new TreeController(this);
    this._tree.build(this.rows);
    this._selection = new RowSelectionController(this);
    this._detailPanel = new DetailPanelController(this);
    this._declarativeColumns = new DeclarativeSlotController(this, {
      selector: "md-data-grid-column",
      hostProperty: "columns",
      toValue: (el) =>
        /** @type {import("./components/column/data-grid-column.js").MdDataGridColumn} */ (
          el
        ).toColumnDef(),
      changeEvent: "md-data-grid-column-change",
    });

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
    // Must run before render() below (not in updated(), which runs after
    // it) — render() consumes the tree indirectly via _sortedRows once
    // treeData is on, so a stale/pre-change tree here would make the very
    // update that changed rows/treeData/getDataPath render against the
    // *previous* tree instead of the new one, one full cycle late.
    if (
      changed.has("rows") ||
      changed.has("getRowId") ||
      changed.has("treeData") ||
      changed.has("getDataPath")
    ) {
      this._tree.build();
    }
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
      changed.has("disableMultipleRowSelection") ||
      changed.has("detailPanelExpandedRowIds") ||
      changed.has("getDetailPanelContent") ||
      changed.has("treeData") ||
      changed.has("getDataPath") ||
      changed.has("treeDataExpandedGroupIds") ||
      changed.has("autoGroupColumnDef")
    ) {
      // Reads this._tree (rebuilt above, same pass) via getRowDepth/
      // hasChildren/getTreeDataCheckboxState/rows — must come after it.
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
    if (
      changed.has("rows") ||
      changed.has("sortModel") ||
      changed.has("treeDataExpandedGroupIds")
    ) {
      // Expand/collapse changes which index a row lands at in
      // _effectiveRows, same as a sort or a rows swap already does —
      // invalidates any shift-range anchor the same way.
      this._selection.resetAnchor();
    }
    // Detail-row content is always arbitrary/dynamic height, regardless of
    // whether ordinary rows use a fixed `rowHeight` — needs the same real
    // measurement `rowHeight: "auto"` already gets, whenever the feature's
    // in use at all (cheap to over-trigger: see _measureAutoRows()'s own
    // doc comment on why calling it is a no-op for anything unchanged).
    if (this.rowHeight === "auto" || this.getDetailPanelContent) {
      this._measureAutoRows();
    }
  }

  /**
   * Feeds every currently-rendered row's *real* rendered height back into
   * the virtualizer for `rowHeight: "auto"` (and, independently, for every
   * detail-panel row regardless of `rowHeight` — see the `updated()` call
   * site above) — runs after every update (rather than once), since row
   * divs are DOM-recycled (the row `repeat()` in `render()` below is keyed
   * by slot position, not row identity, so the same node gets rebound to a
   * different row as you scroll instead of remounted) and `measureRow()`
   * re-reads each node's current `data-index` every call, which is what
   * makes it track that rebinding correctly. Cheap to call unconditionally:
   * a row whose measured size hasn't actually changed since last time is a
   * no-op inside `measureRow()` (see its own doc comment) — true for a
   * fixed-height row measured this way too, not just "auto" ones.
   * @private
   */
  _measureAutoRows() {
    const rows = this.renderRoot.querySelectorAll(
      ".data-grid__rows > [data-index]",
    );
    for (const row of rows) {
      this._virtualization.measureRow(row);
    }
  }

  /** @returns {DataGridColumn[]} */
  get columns() {
    return this._columnsValue;
  }

  /**
   * Custom accessor (see `noAccessor: true` above) instead of a plain Lit
   * property — the only place that can catch the exact assignment that
   * conflicts with `<md-data-grid-column>` children, rather than lazily
   * noticing it on some later, unrelated mutation (or never, if none ever
   * happens again). `DeclarativeSlotController.sync()` is the one
   * legitimate writer once declarative children exist; it marks its own
   * writes via `isSyncing` so they don't trip this.
   *
   * On a real conflict, the assignment is rejected outright (not applied
   * even transiently) and replaced with an immediate resync from the DOM —
   * "declarative children are authoritative" needs to be a hard guarantee,
   * not "usually true, unless nothing happens to re-trigger a sync before
   * something reads `columns` again".
   * @param {DataGridColumn[]} value
   */
  set columns(value) {
    if (
      this._declarativeColumns?.hasDeclarativeChildren &&
      !this._declarativeColumns.isSyncing
    ) {
      if (!this._declarativeColumns.warnedAboutConflict) {
        console.warn(
          "<md-data-grid>: `columns` was assigned directly while " +
            "<md-data-grid-column> children are present. The declarative " +
            "children are authoritative and this assignment is being " +
            "rejected — use one approach or the other, not both.",
        );
        this._declarativeColumns.warnedAboutConflict = true;
      }
      this._declarativeColumns.sync();
      return;
    }
    const old = this._columnsValue;
    this._columnsValue = value;
    this.requestUpdate("columns", old);
  }

  /**
   * `columns` with `GRID_CHECKBOX_SELECTION_COL_DEF`/
   * `GRID_TREE_DATA_GROUPING_COL_DEF`/`GRID_DETAIL_PANEL_TOGGLE_COL_DEF`
   * prepended when `checkboxSelection`/`treeData`+`getDataPath`/
   * `getDetailPanelContent` are on — the actual list rendered (header +
   * every row) and the one every column-index-based controller (resize,
   * keyboard nav) operates against, so these are genuinely columns 0/1/2
   * rather than a visual overlay bolted on separately. Checkbox first, then
   * tree-toggle, then detail-toggle, then user columns — checkbox stays
   * first (matches MUI's own reading order), tree-toggle next since it's
   * structural to row identity/hierarchy. `columns` itself (the public
   * property) is never touched — `ColumnResizeController` writes back to it
   * with these synthetic columns' offset subtracted out again.
   */
  get _columns() {
    const withDetailToggle = this.getDetailPanelContent
      ? [GRID_DETAIL_PANEL_TOGGLE_COL_DEF, ...this.columns]
      : this.columns;
    const withTreeToggle =
      this.treeData && this.getDataPath
        ? [
            { ...GRID_TREE_DATA_GROUPING_COL_DEF, ...this.autoGroupColumnDef },
            ...withDetailToggle,
          ]
        : withDetailToggle;
    return this.checkboxSelection
      ? [GRID_CHECKBOX_SELECTION_COL_DEF, ...withTreeToggle]
      : withTreeToggle;
  }

  /**
   * `rows` run through the active sort — the shared starting point for
   * pagination/virtualization/keyboard nav below. Under `treeData`, this is
   * the collapse-aware, hierarchy-preserving flattening of the tree instead
   * — sorting happens *within* each group's own children (see
   * `TreeController.sortedVisibleRows()`), never across the whole tree at
   * once, so the hierarchy itself is never disturbed by `sortModel`.
   */
  get _sortedRows() {
    if (this.treeData && this.getDataPath) {
      return this._tree.sortedVisibleRows(
        this._sort.createComparator(),
        this.treeDataExpandedGroupIds,
      );
    }
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

  /**
   * `undefined` when `getDetailPanelContent` is unset — lets
   * `VirtualizationController` keep using its own plain-`rowHeight` default
   * untouched, exactly as before this feature existed. Only built at all
   * when there's an actual per-index difference to describe.
   * @param {import("./controllers/data-grid-detail-panel-controller.js").DetailPanelRenderItem[]} items
   * @returns {((index: number) => number) | undefined}
   */
  _estimateItemSize(items) {
    if (!this.getDetailPanelContent) return undefined;
    return (index) =>
      items[index]?.kind === "detail"
        ? DETAIL_PANEL_ESTIMATED_HEIGHT
        : estimateRowHeight(this);
  }

  /**
   * `index` is a data row index (position in `_effectiveRows`), same
   * contract as before master-detail existed — translated internally into
   * a virtual/rendered index, since an expanded row anywhere above `index`
   * shifts everything below it by one.
   * @param {number} index
   */
  scrollToRow(index) {
    const { rowIndexToVirtualIndex } = this._detailPanel.buildRenderItems(
      this._effectiveRows,
    );
    this._virtualization.scrollToRow(rowIndexToVirtualIndex[index] ?? index);
  }

  /** @returns {{ row: Record<string, unknown>, rowIndex: number }[]} */
  getVisibleRows() {
    const effectiveRows = this._pagination.effectiveRows(this._sortedRows);
    const { items } = this._detailPanel.buildRenderItems(effectiveRows);
    const { startIndex, endIndex } = this._virtualization.visibleRange(
      items.length,
      this._estimateItemSize(items),
    );
    return items
      .slice(startIndex, endIndex)
      .filter((item) => item.kind === "row")
      .map((item) => ({ row: item.row, rowIndex: item.rowIndex }));
  }

  /** @param {PropertyKey} id */
  toggleDetailPanel(id) {
    this._detailPanel.toggle(id);
  }

  /** @param {Set<PropertyKey>} ids */
  setExpandedDetailPanel(ids) {
    this._detailPanel.setExpanded(ids);
  }

  /**
   * Expands/collapses one tree-data group's children, by group id (real
   * row id, or a synthetic auto-generated group's own id).
   * @param {PropertyKey} id
   */
  toggleTreeDataGroup(id) {
    this._tree.toggleExpanded(id);
  }

  /** @param {Set<PropertyKey>} ids */
  setExpandedTreeDataGroups(ids) {
    this._tree.setExpanded(ids);
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
      // With both checkboxSelection and treeData on, a plain row click goes
      // through the same cascading path as the checkbox itself
      // (_toggleRowSelection -> _selectTreeDataGroup) rather than the flat
      // single-row `select()` below — otherwise checking a box cascades to
      // the parent but clicking the row it's on doesn't, which reads as
      // broken rather than as two intentionally different selection modes.
      // Without checkboxSelection there's no checkbox to be consistent
      // with, so a plain click keeps its existing single-row/shift/ctrl
      // highlight-selection behavior even when treeData is on.
      if (this.checkboxSelection && this.treeData && this.getDataPath) {
        this._toggleRowSelection(row, rowIndex, {
          shiftKey: event.shiftKey,
          ctrlKey: true,
          metaKey: true,
        });
      } else {
        const modifiers = this.checkboxSelection
          ? { shiftKey: event.shiftKey, ctrlKey: true, metaKey: true }
          : event;
        this._selection.select(row, rowIndex, modifiers, rows);
      }
    }
    this.dispatchEvent(
      new CustomEvent("md-data-grid-row-click", {
        detail: { row, rowIndex },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Checkbox-cell click path (via `dataGridContext.toggleRowSelection`),
   * also reused by `_onRowClick()` above for a plain row click once
   * checkboxSelection and treeData are both on — see that call site's own
   * comment for why the two need to agree. Keyed by the tree node's own
   * `.key` under treeData rather than `getRowId(row)` — same reasoning as
   * `RowSelectionController._rowId()`/`MdDataGridCheckboxCell._id()`: `row`
   * here can be a synthetic auto-generated group with no real fields for
   * `getRowId()` to read at all.
   * @param {Record<string, unknown>} row
   * @param {number} rowIndex
   * @param {{ shiftKey?: boolean, ctrlKey?: boolean, metaKey?: boolean }} modifiers
   */
  _toggleRowSelection(row, rowIndex, modifiers) {
    if (!this.treeData || !this.getDataPath) {
      this._selection.select(row, rowIndex, modifiers, this._effectiveRows);
      return;
    }
    this._selectTreeDataGroup(
      /** @type {PropertyKey} */ (
        /** @type {{ key: PropertyKey }} */ (row).key
      ),
    );
  }

  /**
   * A group checkbox's cascading select/deselect, including upward
   * propagation to ancestors (see `TreeController
   * .computeCascadingSelection()`'s own doc comment for why that's needed —
   * without it, checking every child individually, never the parent's own
   * checkbox, would leave the parent permanently `indeterminate`). Named
   * distinctly from the public `toggleTreeDataGroup(id)` above, which
   * expands/collapses a group's *children* rather than selecting them — the
   * two are unrelated concepts that happen to both apply to a "group id"
   * and are easy to conflate by name alone. Keyed directly by the tree
   * node's id rather than a row object — a synthetic group has no real row
   * to resolve via `getRowId()`.
   * @param {PropertyKey} id
   */
  _selectTreeDataGroup(id) {
    this._selection.applyIds(
      this._tree.computeCascadingSelection(id, this.rowSelectionModel),
    );
  }

  /** Header checkbox "select all" — spans real rows and, under treeData, synthetic group ids too, matching `TreeController.rows`' own collapse-state-ignorant "whole dataset" contract. */
  _toggleSelectAll() {
    if (!this.treeData || !this.getDataPath) {
      this._selection.toggleAll(this.rows);
      return;
    }
    const ids = /** @type {PropertyKey[]} */ (
      this._tree.rows.map((node) => node.key)
    );
    this._selection.toggleAllIds(ids);
  }

  /** @param {KeyboardEvent} event */
  _onKeydown(event) {
    const effectiveRows = this._pagination.effectiveRows(this._sortedRows);
    const { items, rowIndexToVirtualIndex } =
      this._detailPanel.buildRenderItems(effectiveRows);
    this._keyboardNav.onKeydown(event, {
      rowCount: effectiveRows.length,
      colCount: this._columns.length,
      // KeyboardNavController deals entirely in plain data rowIndex (it has
      // no reason to know detail rows exist — see DetailPanelController's
      // own doc comment) — translated into a virtual index here, the one
      // point where that has to happen for scrolling to land correctly.
      ensureRowVisible: (rowIndex) =>
        this._virtualization.ensureRowVisible(
          rowIndexToVirtualIndex[rowIndex],
          items.length,
        ),
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
    // Detail-panel rows are a rendering/virtualization-only concept — every
    // other index below (rowSpans, selection, sort, pagination) still runs
    // entirely over `effectiveRows`/data rowIndex, never `renderItems`. See
    // DetailPanelController's own doc comment for why that split matters.
    const { items: renderItems } =
      this._detailPanel.buildRenderItems(effectiveRows);
    const estimateItemSize = this._estimateItemSize(renderItems);
    const { startIndex, endIndex, offsetY } = this._virtualization.visibleRange(
      renderItems.length,
      estimateItemSize,
    );
    const visibleItems = renderItems.slice(startIndex, endIndex);
    const totalHeight = this._virtualization.totalSize(
      renderItems.length,
      estimateItemSize,
    );
    const rowSpans = this._rowSpan.computeSpans(effectiveRows);
    const showSkeletonRows = this.loading && effectiveRows.length === 0;
    const showLoadingOverlay = this.loading && effectiveRows.length > 0;
    const skeletonRowHeight =
      typeof this.rowHeight === "number" ? this.rowHeight : DEFAULT_ROW_HEIGHT;

    return html`
      <div class="data-grid" part="root" @keydown=${this._onKeydown}>
        <div
          class="data-grid__header"
          part="header"
          role="row"
          style="grid-template-columns: ${headerGridTemplateColumns}; height: ${
            this.headerHeight
          }px;"
        >
          ${(() => {
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
                  <md-data-header-cell
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
                  ></md-data-header-cell>
                `;
              },
            );
          })()}
          ${
            scrollbarWidth
              ? html`<div
                  class="data-grid__header-gutter"
                  part="header-gutter"
                ></div>`
              : nothing
          }
        </div>
        <div class="data-grid__viewport" part="viewport">
          ${
            showLoadingOverlay
              ? html`<md-progress-linear
                  class="data-grid__loading-indicator"
                  part="loading-indicator"
                  aria-label="Loading"
                ></md-progress-linear>`
              : nothing
          }
          ${
            effectiveRows.length === 0
              ? showSkeletonRows
                ? html`
                    <div class="data-grid__skeleton-rows" part="skeleton-rows">
                      ${Array.from(
                        { length: SKELETON_ROW_COUNT },
                        (_, rowIndex) => html`
                          <div
                            class="data-grid__row"
                            part="row"
                            style="grid-template-columns: ${gridTemplateColumns}; height: ${skeletonRowHeight}px;"
                          >
                            ${columns.map(
                              (_column, colIndex) => html`
                                <div
                                  class="data-grid__skeleton-cell"
                                  part="cell"
                                >
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
                        visibleItems,
                        (_item, i) => i,
                        (item, i) => {
                          const virtualIndex = startIndex + i;

                          if (item.kind === "detail") {
                            return html`
                              <div
                                class="data-grid__detail-row"
                                part="detail-row"
                                role="row"
                                data-index=${virtualIndex}
                              >
                                <div
                                  class="data-grid__detail-row-cell"
                                  part="detail-cell"
                                  role="gridcell"
                                >
                                  ${item.content}
                                </div>
                              </div>
                            `;
                          }

                          const { row, rowIndex } = item;
                          const rowClassName =
                            this.getRowClassName?.(row, rowIndex) ?? "";
                          const selected = this._selection.isSelected(row);
                          /** @type {Record<string, boolean>} */
                          const rowClasses = {
                            "data-grid__row": true,
                            "data-grid__row_selected": selected,
                          };
                          for (const cls of rowClassName.split(" ")) {
                            if (cls) rowClasses[cls] = true;
                          }
                          const heightStyle =
                            typeof this.rowHeight === "number"
                              ? `height: ${this.rowHeight}px; --height: ${this.rowHeight}px;`
                              : "";
                          return html`
                            <div
                              class=${classMap(rowClasses)}
                              part="row ${rowClassName}"
                              role="row"
                              aria-selected=${selected}
                              data-index=${virtualIndex}
                              style="grid-template-columns: ${gridTemplateColumns}; ${heightStyle}"
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
                                    if (colIndex <= coveredUntil)
                                      return nothing;
                                    const span = clampColSpan(
                                      columns,
                                      colIndex,
                                    );
                                    coveredUntil = colIndex + span - 1;
                                    const spanInfo = rowSpans.get(
                                      column.field,
                                    )?.[rowIndex];
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
                `
          }
          ${
            showLoadingOverlay
              ? html`<div
                  class="data-grid__loading-overlay"
                  part="loading-overlay"
                ></div>`
              : nothing
          }
        </div>
        <slot name="footer">
          ${
            this.paginationModel && !this.hidePagination
              ? html`<md-data-footer
                  exportparts="rows-per-page-label,page-size-select,page-size-option,footer-count,footer-prev,footer-next"
                ></md-data-footer>`
              : nothing
          }
        </slot>
      </div>
    `;
  }
}
