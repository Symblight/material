import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "../column-separator/data-grid-column-separator.js";
import "../column-title/data-grid-column-title.js";
import styles from "./data-grid-column-header.css?inline";

/** @typedef {import("../../data-grid.js").DataGridColumn} DataGridColumn */

/**
 * @tag md-data-column-header
 * @summary One header cell of an `md-data-grid`. The host itself is the
 * positioned/rendered cell (no wrapper div) — `part`/`role` are set once in
 * the constructor, the align modifier class and colSpan's `grid-column`
 * style are kept in sync with `column`/`colSpan` in `willUpdate()`.
 * Composed internally by the grid — not intended to be used standalone.
 */
@customElement("md-data-column-header")
export class MdDataColumnHeader extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    column: { attribute: false },
    colIndex: { type: Number },
    colSpan: { type: Number },
    resizeColIndex: { type: Number },
    resizable: { type: Boolean },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {DataGridColumn} */
    this.column = { field: "" };

    /** @type {number} */
    this.colIndex = 0;

    /** @type {number} */
    this.colSpan = 1;

    /** @type {number} */
    this.resizeColIndex = 0;

    /** @type {boolean} */
    this.resizable = false;

    this.setAttribute("part", "header-cell");
    this.setAttribute("role", "columnheader");
  }

  /** @param {import("lit").PropertyValues} changed */
  willUpdate(changed) {
    if (changed.has("column")) {
      const align = this.column.align ?? "left";
      this.classList.toggle(
        "data-grid-column-header_align-right",
        align === "right",
      );
      this.classList.toggle(
        "data-grid-column-header_align-center",
        align === "center",
      );
    }
    if (changed.has("colSpan")) {
      this.style.gridColumn = this.colSpan > 1 ? `span ${this.colSpan}` : "";
    }
  }

  render() {
    const { column } = this;

    return html`
      <md-data-column-title>
        ${column.renderHeader
          ? column.renderHeader(column)
          : (column.headerName ?? column.field)}
      </md-data-column-title>
      <md-data-column-separator
        .resizeColIndex=${this.resizeColIndex}
        .resizable=${this.resizable}
      ></md-data-column-separator>
    `;
  }
}
