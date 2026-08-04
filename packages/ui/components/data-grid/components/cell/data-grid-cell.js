import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextConsumer } from "@lit/context";

import { dataGridContext } from "../../data-grid-context.js";
import styles from "./data-grid-cell.css?inline";

/** @typedef {import("../../data-grid.js").DataGridColumn} DataGridColumn */

/**
 * @tag md-data-cell
 * @summary One body cell of an `md-data-grid`. The host itself is the
 * rendered/focusable cell (no wrapper div) — `part`/`role` are set once in
 * the constructor, `colSpan`'s `grid-column` style is kept in sync in
 * `willUpdate()` (mirrors `md-data-column-header`), and `tabindex`/the
 * align/highlighted/row-span modifiers are kept in sync in `updated()`
 * (focus state and `rowHeight` both come from a context subscription rather
 * than a declared reactive property, so they can't be targeted by
 * `willUpdate()`'s `changed` map). Composed internally by the grid — not
 * intended to be used standalone.
 */
@customElement("md-data-cell")
export class MdDataCell extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    row: { attribute: false },
    column: { attribute: false },
    rowIndex: { type: Number },
    colIndex: { type: Number },
    colSpan: { type: Number },
    rowSpan: { type: Number },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {Record<string, unknown>} */
    this.row = {};

    /** @type {DataGridColumn} */
    this.column = { field: "" };

    /** @type {number} */
    this.rowIndex = 0;

    /** @type {number} */
    this.colIndex = 0;

    /** @type {number} */
    this.colSpan = 1;

    /**
     * Row-spanning owner: a run of `rowSpan` consecutive rows shares one
     * equal value in this column (see `RowSpanController`). Grows this
     * cell to `rowHeight * rowSpan` tall and lets it overflow past its own
     * row's box — the covered rows' cells for this column simply aren't
     * rendered, so there's nothing underneath to clip against.
     * @type {number}
     */
    this.rowSpan = 1;

    /** @private */
    this._gridConsumer = new ContextConsumer(this, {
      context: dataGridContext,
      subscribe: true,
    });

    this.setAttribute("part", "cell");
    this.setAttribute("role", "gridcell");

    this.addEventListener("focus", () =>
      this._gridConsumer.value?.setFocusedCell(this.rowIndex, this.colIndex),
    );
  }

  /** @returns {unknown} */
  get _value() {
    const { row, column, rowIndex } = this;
    const raw = row[column.field];
    return column.valueGetter
      ? column.valueGetter({ row, column, rowIndex, value: raw })
      : raw;
  }

  /** Imperatively focuses this cell (used for roving-tabindex keyboard navigation). */
  focusCell() {
    this.focus();
  }

  /** @param {import("lit").PropertyValues} changed */
  willUpdate(changed) {
    if (changed.has("colSpan")) {
      this.style.gridColumn = this.colSpan > 1 ? `span ${this.colSpan}` : "";
    }
  }

  /** @param {import("lit").PropertyValues} changed */
  updated(changed) {
    super.updated(changed);

    const { rowIndex, colIndex, column } = this;
    const focused =
      this._gridConsumer.value?.focusedCell?.rowIndex === rowIndex &&
      this._gridConsumer.value?.focusedCell?.colIndex === colIndex;
    // Native focus (click or roving-tabindex keyboard nav) already updates
    // focusedCell via the "focus" listener above — `focused` reflects that
    // logical state directly rather than relying on :focus/:focus-visible,
    // which don't reliably fire the same way across click vs. keyboard.
    // hasFocusedCell additionally gates out focusedCell's (0, 0) default,
    // which is only there so *some* cell has tabindex="0" — it shouldn't
    // look highlighted before the user has actually interacted.
    const highlighted =
      focused &&
      this._gridConsumer.value?.hasFocusedCell &&
      !this._gridConsumer.value?.disableCellHighlight;

    this.tabIndex = focused ? 0 : -1;

    const align = column.align ?? "left";
    this.classList.toggle("data-grid-cell_align-right", align === "right");
    this.classList.toggle("data-grid-cell_align-center", align === "center");
    this.classList.toggle("data-grid-cell_highlighted", Boolean(highlighted));

    // Depends on the grid's rowHeight (via context, not a declared property
    // of this component), so it's recomputed unconditionally here rather
    // than gated behind willUpdate()'s changed-property check — same reason
    // focused/highlighted above are.
    const rowHeight = this._gridConsumer.value?.rowHeight ?? 0;
    this.classList.toggle("data-grid-cell_row-span", this.rowSpan > 1);
    // Matches :host's own `height` (not `block-size`) in data-grid-cell.css
    // exactly, so this inline override unambiguously wins over it.
    this.style.height = this.rowSpan > 1 ? `${rowHeight * this.rowSpan}px` : "";
  }

  render() {
    const { row, column, rowIndex } = this;
    const value = this._value;

    return html`${column.renderCell
      ? column.renderCell({ row, column, rowIndex, value })
      : value}`;
  }
}
