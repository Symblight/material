import { ResizeController } from "@lit-labs/observers/resize-controller.js";

/**
 * Owns scroll position and viewport measurement for `md-data-grid`'s fixed
 * row-height virtualization. Doesn't know about pagination or rows — row
 * counts are passed in as parameters by the host.
 */
export class VirtualizationController {
  /** @param {import("../data-grid.js").MdDataGrid} host */
  constructor(host) {
    this.host = host;

    /** @type {number} */
    this.scrollTop = 0;

    /** @type {number} @private */
    this._scrollRaf = 0;

    /** @private */
    this._resize = new ResizeController(host, {
      target: null,
      callback: (entries) => {
        const entry = entries[0];
        if (!entry) return { height: 0, scrollbarWidth: 0 };
        const el = /** @type {HTMLElement} */ (entry.target);
        return {
          height: entry.contentRect.height,
          // the viewport scrolls vertically only, so any offsetWidth/clientWidth
          // gap is the vertical scrollbar's own width, not horizontal scroll content
          scrollbarWidth: el.offsetWidth - el.clientWidth,
        };
      },
    });

    host.addController(this);
  }

  hostDisconnected() {
    if (this._scrollRaf) cancelAnimationFrame(this._scrollRaf);
  }

  /** @returns {HTMLElement | null} */
  get viewportEl() {
    return /** @type {HTMLElement | null} */ (
      this.host.renderRoot?.querySelector(".data-grid__viewport")
    );
  }

  /** @returns {number} */
  get viewportHeight() {
    return this._resize.value?.height ?? 0;
  }

  /**
   * Width of the viewport's vertical scrollbar, if visible. The header sits
   * outside `.data-grid__viewport` (so it isn't narrowed by the scrollbar),
   * so the host adds this back as a trailing empty column to keep header
   * and body columns aligned.
   * @returns {number}
   */
  get scrollbarWidth() {
    return this._resize.value?.scrollbarWidth ?? 0;
  }

  /** Call once the viewport element exists in the DOM (host's `firstUpdated`). */
  observeViewport() {
    const viewport = this.viewportEl;
    if (viewport) this._resize.observe(viewport);
  }

  /**
   * Virtualization window (indices into whatever row array the host is
   * rendering), including overscan.
   * @param {number} rowCount
   * @returns {{ startIndex: number, endIndex: number }}
   */
  visibleRange(rowCount) {
    const { rowHeight, overscan } = this.host;
    if (!this.viewportHeight) {
      return { startIndex: 0, endIndex: Math.min(rowCount, overscan * 2) };
    }
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / rowHeight) - overscan,
    );
    const endIndex = Math.min(
      rowCount,
      Math.ceil((this.scrollTop + this.viewportHeight) / rowHeight) + overscan,
    );
    return { startIndex, endIndex };
  }

  /**
   * `width` is an exact size and wins outright — `minWidth`/`maxWidth` only
   * apply to flexible (no `width`) columns, and only change anything when
   * at least one of them is actually set (otherwise stays a bare `1fr`, same
   * as before this existed).
   *
   * `fr` units can't be combined with `minmax()`'s own max slot via CSS math
   * functions like `min()` (mixing `fr` into `min()`/`max()`/`clamp()` isn't
   * valid CSS — the browser silently drops the whole declaration), so a
   * capped column can't both keep absorbing leftover row width via `fr` *and*
   * have a hard ceiling in one track function. `maxWidth` therefore sizes the
   * column by content instead (`minmax(min, {maxWidth}px)`, no `fr`) — it
   * stops growing at the cap rather than growing then clamping. Any sibling
   * column left as a bare `1fr` still absorbs whatever space this one isn't
   * using.
   * @param {import("../data-grid.js").DataGridColumn[]} columns
   */
  gridTemplateColumns(columns) {
    return columns
      .map((column) => {
        if (column.width) return `${column.width}px`;
        if (!column.minWidth && !column.maxWidth) return "1fr";
        const min = column.minWidth ? `${column.minWidth}px` : "0";
        const max = column.maxWidth ? `${column.maxWidth}px` : "1fr";
        return `minmax(${min}, ${max})`;
      })
      .join(" ");
  }

  /** @param {number} index */
  scrollToRow(index) {
    const viewport = this.viewportEl;
    if (!viewport) return;
    viewport.scrollTop = index * this.host.rowHeight;
  }

  /**
   * @param {number} rowIndex
   * @param {number} rowCount
   */
  ensureRowVisible(rowIndex, rowCount) {
    const { startIndex, endIndex } = this.visibleRange(rowCount);
    if (rowIndex < startIndex || rowIndex >= endIndex) {
      this.scrollToRow(rowIndex);
    }
  }

  resetScroll() {
    this.scrollTop = 0;
    const viewport = this.viewportEl;
    if (viewport) viewport.scrollTop = 0;
    this.host.requestUpdate();
  }

  /** @param {Event} event */
  onScroll(event) {
    if (this._scrollRaf) return;
    const target = /** @type {HTMLElement} */ (event.target);
    this._scrollRaf = requestAnimationFrame(() => {
      this._scrollRaf = 0;
      this.scrollTop = target.scrollTop;
      this.host.requestUpdate();
    });
  }
}
