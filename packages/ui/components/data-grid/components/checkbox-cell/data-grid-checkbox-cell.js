import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextConsumer } from "@lit/context";

import "../../../checkbox/checkbox.js";

import { dataGridContext } from "../../data-grid-context.js";
import styles from "./data-grid-checkbox-cell.css?inline";

/**
 * @tag md-data-grid-checkbox-cell
 * @summary The per-row checkbox rendered by `GRID_CHECKBOX_SELECTION_COL_DEF`
 * when `md-data-grid`'s `checkboxSelection` is on. Reads/writes selection
 * through `dataGridContext` — reused as-is by `md-data-cell`'s generic
 * `renderCell` mechanism, so this is just an ordinary custom column, not a
 * special case baked into the grid itself. `md-checkbox`'s own default
 * touch-target padding (`0.688rem` on every side, on top of its `1.125rem`
 * visual box) is trimmed down via an inline style — it isn't exposed as a
 * `--md-checkbox-*` custom property, and left as-is it doesn't fit inside
 * `GRID_CHECKBOX_SELECTION_COL_DEF`'s narrow column. Composed internally —
 * not intended to be used standalone.
 */
@customElement("md-data-grid-checkbox-cell")
export class MdDataGridCheckboxCell extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    row: { attribute: false },
    rowIndex: { type: Number },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {Record<string, unknown>} */
    this.row = {};

    /** @type {number} */
    this.rowIndex = 0;

    /** @private */
    this._gridConsumer = new ContextConsumer(this, {
      context: dataGridContext,
      subscribe: true,
    });
  }

  /**
   * A checkbox click always toggles just that row into/out of the
   * selection additively (like Ctrl/Cmd-click), never replaces the whole
   * selection with just this row the way a plain row click does —
   * checking one box while others are already checked shouldn't uncheck
   * them. Shift-click still range-selects, matching the row-click
   * behavior it shares its underlying `select()` call with. Stops the
   * click from also reaching the row's own `@click` handler (it bubbles
   * there otherwise) and prevents the checkbox's own native toggle —
   * `checked` is fully derived from `rowSelectionModel` on the next
   * render, not owned by the checkbox itself.
   * @param {MouseEvent} event
   */
  _onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this._gridConsumer.value?.toggleRowSelection(this.row, this.rowIndex, {
      shiftKey: event.shiftKey,
      ctrlKey: true,
      metaKey: true,
    });
  }

  render() {
    const ctx = this._gridConsumer.value;
    const selected = ctx
      ? ctx.rowSelectionModel.has(ctx.getRowId(this.row))
      : false;

    return html`
      <md-checkbox
        .checked=${selected}
        aria-label="Select row"
        @click=${this._onClick}
      ></md-checkbox>
    `;
  }
}
