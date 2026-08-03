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
 * the constructor, `tabindex` and the align/highlighted modifier classes
 * are kept in sync in `updated()` (focus state comes from a context
 * subscription rather than a declared reactive property, so it can't be
 * targeted by `willUpdate()`'s `changed` map). Composed internally by the
 * grid — not intended to be used standalone.
 */
@customElement("md-data-cell")
export class MdDataCell extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    row: { attribute: false },
    column: { attribute: false },
    rowIndex: { type: Number },
    colIndex: { type: Number },
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
  }

  render() {
    const { row, column, rowIndex } = this;
    const value = this._value;

    return html`${column.renderCell
      ? column.renderCell({ row, column, rowIndex, value })
      : value}`;
  }
}
