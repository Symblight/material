/**
 * Owns MUI-style row selection for `md-data-grid` — highlighted rows, not
 * checkboxes. Single-row selection is on by default (plain click replaces
 * the selection with just that row); Ctrl/Cmd-click toggles a row into/out
 * of the selection additively; Shift-click extends/shrinks the selection
 * relative to the last-clicked row (the "anchor") — see `_shiftRange()` for
 * the merge-vs-replace distinction that matters there. Both multi-selection
 * mechanisms are opt-out via `host.disableMultipleRowSelection` (a modified
 * click then behaves like a plain click); selecting on click at all is
 * opt-out via `host.disableRowSelectionOnClick`, for rows with their own
 * interactive cell content.
 */
export class RowSelectionController {
  /** @param {import("../data-grid.js").MdDataGrid} host */
  constructor(host) {
    this.host = host;

    /** @private @type {number | null} row index shift-range is measured from */
    this._anchorIndex = null;
  }

  /**
   * Clears the shift-range anchor — call whenever row order can change
   * (sorting, a new `rows` array) so a later shift-click can't silently
   * range-select against a position that now means something else.
   */
  resetAnchor() {
    this._anchorIndex = null;
  }

  /**
   * @param {Record<string, unknown>} row
   * @returns {boolean}
   */
  isSelected(row) {
    return this.host.rowSelectionModel.has(this.host.getRowId(row));
  }

  /**
   * Applies a row click to the selection per the modifier keys held, sets
   * `host.rowSelectionModel` to the result, and dispatches
   * `md-data-grid-row-selection-model-change`.
   * @param {Record<string, unknown>} row
   * @param {number} rowIndex
   * @param {{ shiftKey?: boolean, ctrlKey?: boolean, metaKey?: boolean }} modifiers
   * @param {Record<string, unknown>[]} rows the exact rows about to render (post-sort, post-pagination) — shift-range is measured over this order
   */
  select(row, rowIndex, modifiers, rows) {
    const host = this.host;
    const id = host.getRowId(row);
    const multiEnabled = !host.disableMultipleRowSelection;

    /** @type {Set<PropertyKey> | null} */
    let next;
    if (modifiers.shiftKey && multiEnabled && this._anchorIndex !== null) {
      next = this._shiftRange(rowIndex, rows);
      if (!next) return; // no-op — see _shiftRange()
    } else if ((modifiers.ctrlKey || modifiers.metaKey) && multiEnabled) {
      next = new Set(host.rowSelectionModel);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this._anchorIndex = rowIndex;
    } else {
      next = new Set([id]);
      this._anchorIndex = rowIndex;
    }

    this._apply(next);
  }

  /**
   * Shift-click's range, merged into the existing selection rather than
   * replacing it — matching MUI, which only ever adds/removes the ids in
   * the computed range against a copy of the current selection, never
   * rebuilds the model from scratch. A replace-based version would silently
   * drop anything selected outside the anchor-to-clicked span (an earlier
   * Ctrl-click, or a previous unrelated shift gesture).
   *
   * Two modes, chosen by whether the just-clicked row is already selected:
   * - **Not selected (growing)**: adds every row between the anchor and
   *   the clicked row (inclusive) to the selection.
   * - **Already selected (shrinking)**: removes rows between the anchor
   *   and one row *short* of the clicked row — deliberately excluding the
   *   clicked row itself from the removal, so shift-clicking an
   *   already-selected row never deselects that exact row, only backs the
   *   range off beyond it. Shift-clicking the anchor row itself (nothing
   *   left to back off) is therefore a no-op — signaled by returning
   *   `null` — matching MUI's own early return in this case.
   *
   * The anchor advances to the clicked row after every shift-click (not
   * just plain/Ctrl clicks), so a following shift-click extends/shrinks
   * relative to *this* click, not the original one — also matching MUI.
   * @private
   * @param {number} clickedIndex
   * @param {Record<string, unknown>[]} rows the exact rows about to render — shift-range is measured over this order
   * @returns {Set<PropertyKey> | null} `null` means no-op, nothing to apply
   */
  _shiftRange(clickedIndex, rows) {
    const host = this.host;
    const anchorIndex = /** @type {number} */ (this._anchorIndex);
    const clickedId = host.getRowId(rows[clickedIndex]);
    const growing = !host.rowSelectionModel.has(clickedId);

    if (!growing && anchorIndex === clickedIndex) return null;

    const endIndex = growing
      ? clickedIndex
      : anchorIndex > clickedIndex
        ? clickedIndex + 1
        : clickedIndex - 1;
    const [start, end] =
      anchorIndex < endIndex
        ? [anchorIndex, endIndex]
        : [endIndex, anchorIndex];

    const next = new Set(host.rowSelectionModel);
    for (let i = start; i <= end; i++) {
      const rangeId = host.getRowId(rows[i]);
      if (growing) next.add(rangeId);
      else next.delete(rangeId);
    }

    this._anchorIndex = clickedIndex;
    return next;
  }

  /**
   * Header checkbox "select all": if every row in `rows` is already
   * selected, clears the selection entirely; otherwise selects all of
   * them, replacing the current selection wholesale (rows outside `rows`
   * that were previously selected are dropped, same as MUI). `rows` is
   * meant to be the grid's whole dataset (`host.rows`), not just the
   * current page — matching MUI's own default, "select all" spans every
   * page, not only the one currently visible.
   * @param {Record<string, unknown>[]} rows
   */
  toggleAll(rows) {
    const host = this.host;
    const allSelected =
      rows.length > 0 &&
      rows.every((row) => host.rowSelectionModel.has(host.getRowId(row)));
    const next = allSelected
      ? new Set()
      : new Set(rows.map((row) => host.getRowId(row)));
    this._apply(next);
  }

  /**
   * @private
   * @param {Set<PropertyKey>} next
   */
  _apply(next) {
    const host = this.host;
    host.rowSelectionModel = next;
    host.dispatchEvent(
      new CustomEvent("md-data-grid-row-selection-model-change", {
        detail: new Set(next),
        bubbles: true,
        composed: true,
      }),
    );
  }
}
