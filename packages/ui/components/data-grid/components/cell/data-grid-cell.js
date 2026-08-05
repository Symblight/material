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
 * the constructor, an explicit `grid-column` (from `colIndex`/`colSpan`,
 * not left to auto-placement) is kept in sync in `willUpdate()` (mirrors
 * `md-data-column-header`), and `tabindex`/the align/highlighted/row-span
 * modifiers are kept in sync in `updated()`
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

    /**
     * Class name(s) last applied from `column.cellClassName` — tracked so
     * a changed (or cleared) value can be removed before the new one is
     * added, since `classList` is mutated directly here rather than
     * reconciled from a template.
     * @private @type {string}
     */
    this._appliedCellClassName = "";

    /** @private */
    this._gridConsumer = new ContextConsumer(this, {
      context: dataGridContext,
      subscribe: true,
    });

    this.setAttribute("part", "cell");
    this.setAttribute("role", "gridcell");

    // "focusin"/"focusout" (bubbling + composed), not "focus"/"blur" (neither
    // bubbles nor crosses the shadow boundary): a `renderCell` can put an
    // inner focusable element (e.g. an icon button) in this cell's shadow
    // tree, and per the WAI-ARIA APG grid pattern `focusCell()` below sends
    // DOM focus straight to that inner element, not this host — plain
    // "focus"/"blur" would never fire here for that case since the host
    // itself is never the event target.
    this.addEventListener("focusin", () =>
      this._gridConsumer.value?.setCellFocus(this.rowIndex, this.colIndex),
    );
    this.addEventListener("focusout", () =>
      this._gridConsumer.value?.clearCellFocus(this.rowIndex, this.colIndex),
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

  /**
   * Imperatively focuses this cell for roving-tabindex keyboard navigation.
   * Per the WAI-ARIA APG grid pattern, delegates to the first inner element
   * a `renderCell` opted into the tab sequence (`tabindex="0"`) — e.g. an
   * icon button — falling back to the cell host itself when there is none.
   */
  focusCell() {
    const target =
      /** @type {HTMLElement | null} */ (
        this.shadowRoot?.querySelector('[tabindex="0"]')
      ) ?? this;
    target.focus();
  }

  /** @param {import("lit").PropertyValues} changed */
  willUpdate(changed) {
    if (changed.has("colIndex") || changed.has("colSpan")) {
      // Explicit start (1-based CSS grid line) + span, not just a bare
      // `span N` left to auto-placement. A row-spanning owner cell in a
      // DIFFERENT row can cover this column for THIS row, in which case
      // this row's own cell for that column renders `nothing` — not an
      // empty placeholder, no DOM node at all. Auto-placement has no way
      // to know a "virtual" cell was skipped there; it just packs whatever
      // real DOM children this row actually has into the next available
      // tracks in order, shifting every cell after the gap one column
      // left per cell omitted before it — explicit placement makes each
      // cell's column independent of how many siblings happen to exist.
      this.style.gridColumn = `${this.colIndex + 1} / span ${this.colSpan}`;
    }
    if (
      (changed.has("rowIndex") || changed.has("colIndex")) &&
      this.matches(":focus-within")
    ) {
      // Virtualized scrolling recycles row/cell DOM nodes (data-grid.js's
      // row repeat() is keyed by slot position, not row identity, so the
      // same element gets rebound to a different row instead of torn down
      // and recreated). If THIS exact node (or an inner element delegated
      // to by focusCell(), hence :focus-within rather than :focus) currently
      // holds real browser focus and is being reassigned to a different
      // row/column, release that focus explicitly — left alone, focus would
      // silently "follow" the recycled node onto content the user never
      // actually focused, while dataGridContext's focusedCell (last set by
      // this cell's own "focusin" listener below, when it was still the
      // ORIGINAL row/column) stays pointed there — desyncing the highlight
      // and arrow-key navigation from where focus visibly/actually is.
      // Matches what already happens when a focused cell scrolls out of a
      // non-recycled virtualized window (its DOM node is removed, so focus
      // already reverts to the document) — recycling shouldn't change that
      // outcome, just how it gets there.
      //
      // `rowIndex`/`colIndex` are already the NEW (post-recycling) values
      // here — property setters apply before willUpdate() runs — so the
      // "focusout" listener below, which reads `this.rowIndex`/
      // `this.colIndex` when the native focusout event fires, would clear
      // focusedCell using the WRONG (new) identity, and its own stale-blur
      // guard would then (correctly, given that wrong input) treat it as a
      // no-op, leaving focusedCell stuck pointing at a cell that's no longer
      // focused. Clearing explicitly first, with the ORIGINAL identity from
      // `changed`, does the real work; releasing DOM focus below only needs
      // to make that release actually happen.
      this._gridConsumer.value?.clearCellFocus(
        /** @type {number} */ (changed.get("rowIndex") ?? this.rowIndex),
        /** @type {number} */ (changed.get("colIndex") ?? this.colIndex),
      );
      // Focus may be on this host itself or on an inner element inside its
      // shadow tree (delegated to by focusCell()) — release whichever one
      // actually holds it. Blurring an element that isn't focused is a
      // harmless no-op, so both calls are safe regardless of which applies.
      /** @type {HTMLElement | null} */ (
        this.shadowRoot?.activeElement
      )?.blur();
      this.blur();
    }
  }

  /** @param {import("lit").PropertyValues} changed */
  updated(changed) {
    super.updated(changed);

    const { rowIndex, colIndex, column } = this;
    const focused =
      this._gridConsumer.value?.focusedRegion === "cell" &&
      this._gridConsumer.value?.focusedCell?.rowIndex === rowIndex &&
      this._gridConsumer.value?.focusedCell?.colIndex === colIndex;
    // Native focus (click or roving-tabindex keyboard nav) already updates
    // focusedCell via the "focusin" listener above — `focused` reflects that
    // logical state directly rather than relying on :focus/:focus-visible,
    // which don't reliably fire the same way across click vs. keyboard.
    // hasFocus additionally gates out focusedCell's (0, 0) default, which is
    // only there so *some* cell has tabindex="0" — it shouldn't look
    // highlighted before the user has actually interacted. focusedRegion
    // gates the header/cell regions apart — a cell keeps its logical
    // focusedCell position (so Tab can return to it) even while the header
    // temporarily owns the grid's single Tab stop, so this can't rely on
    // focusedCell alone.
    const highlighted =
      focused &&
      this._gridConsumer.value?.hasFocus &&
      !this._gridConsumer.value?.disableCellHighlight;

    this.tabIndex = focused ? 0 : -1;

    const align = column.align ?? "left";
    this.classList.toggle("data-grid-cell_align-right", align === "right");
    this.classList.toggle("data-grid-cell_align-center", align === "center");
    this.classList.toggle("data-grid-cell_highlighted", Boolean(highlighted));

    const cellClassName =
      (typeof column.cellClassName === "function"
        ? column.cellClassName({
            row: this.row,
            column,
            rowIndex,
            value: this._value,
          })
        : column.cellClassName) ?? "";
    if (cellClassName !== this._appliedCellClassName) {
      for (const cls of this._appliedCellClassName.split(" ")) {
        if (cls) this.classList.remove(cls);
      }
      for (const cls of cellClassName.split(" ")) {
        if (cls) this.classList.add(cls);
      }
      this._appliedCellClassName = cellClassName;
    }

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
