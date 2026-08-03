/**
 * Owns roving-tabindex focus state and Arrow-key navigation for
 * `md-data-grid`. Doesn't know about pagination or virtualization directly —
 * `onKeydown()` takes row/column counts and an `ensureRowVisible` callback
 * as parameters, supplied by the host.
 */
export class KeyboardNavController {
  /**
   * @param {import("../data-grid.js").MdDataGrid} host
   * @param {{ onFocusChange?: () => void }} [options] `onFocusChange` fires
   *   synchronously from `setFocusedCell()`, before `host.requestUpdate()`.
   *   `focusedCell` isn't a Lit reactive property (it changes far more
   *   selectively than the host's generic re-render), so the host uses this
   *   to rebuild the shared context immediately, the same way it used to
   *   before `focusedCell` moved into this controller — without needing to
   *   watch a `willUpdate()` property-changed gate for it.
   */
  constructor(host, options = {}) {
    this.host = host;
    this._onFocusChange = options.onFocusChange;

    /** @type {{ rowIndex: number, colIndex: number }} */
    this.focusedCell = { rowIndex: 0, colIndex: 0 };

    /**
     * `focusedCell` starts at (0, 0) so *some* cell always has `tabindex="0"`
     * for basic keyboard accessibility (Tab needs a target to land on) —
     * but that default shouldn't visually read as "highlighted" before the
     * user has actually clicked or navigated into the grid. This flips true
     * the first time `setFocusedCell()` runs for real (click or arrow-key
     * nav), and is what the highlight visual is actually gated on.
     * @type {boolean}
     */
    this.hasFocusedCell = false;
  }

  /**
   * @param {number} rowIndex
   * @param {number} colIndex
   */
  setFocusedCell(rowIndex, colIndex) {
    this.focusedCell = { rowIndex, colIndex };
    this.hasFocusedCell = true;
    this._onFocusChange?.();
    this.host.requestUpdate();
  }

  /**
   * @param {number} rowIndex
   * @param {number} colIndex
   */
  async focusCell(rowIndex, colIndex) {
    await this.host.updateComplete;
    const cells =
      /** @type {NodeListOf<import("../components/cell/data-grid-cell.js").MdDataCell>} */ (
        this.host.renderRoot.querySelectorAll("md-data-cell")
      );
    for (const cell of cells) {
      if (cell.rowIndex === rowIndex && cell.colIndex === colIndex) {
        cell.focusCell();
        break;
      }
    }
  }

  /**
   * @param {KeyboardEvent} event
   * @param {{ rowCount: number, colCount: number, ensureRowVisible: (rowIndex: number) => void }} params
   */
  onKeydown(event, { rowCount, colCount, ensureRowVisible }) {
    const { rowIndex, colIndex } = this.focusedCell;
    const maxRowIndex = Math.max(rowCount - 1, 0);
    const maxColIndex = Math.max(colCount - 1, 0);

    let nextRowIndex = rowIndex;
    let nextColIndex = colIndex;

    switch (event.key) {
      case "ArrowDown":
        nextRowIndex = Math.min(rowIndex + 1, maxRowIndex);
        break;
      case "ArrowUp":
        nextRowIndex = Math.max(rowIndex - 1, 0);
        break;
      case "ArrowRight":
        nextColIndex = Math.min(colIndex + 1, maxColIndex);
        break;
      case "ArrowLeft":
        nextColIndex = Math.max(colIndex - 1, 0);
        break;
      default:
        return;
    }

    if (nextRowIndex === rowIndex && nextColIndex === colIndex) return;

    event.preventDefault();
    ensureRowVisible(nextRowIndex);
    this.setFocusedCell(nextRowIndex, nextColIndex);
    this.focusCell(nextRowIndex, nextColIndex);
  }
}
