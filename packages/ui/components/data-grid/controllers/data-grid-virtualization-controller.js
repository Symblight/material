import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import { VirtualizerController } from "@tanstack/lit-virtual";

/**
 * Initial per-row height guess for `rowHeight: "auto"`, used only until each
 * row is actually measured (see `measureRow()`) — same value as
 * `data-grid.js`'s own `DEFAULT_ROW_HEIGHT`, not imported from there to
 * avoid a needless cross-module coupling for one shared number.
 */
const AUTO_ESTIMATED_ROW_HEIGHT = 52;

/**
 * @param {import("../data-grid.js").MdDataGrid} host
 * @returns {number}
 */
function estimateRowHeight(host) {
  return typeof host.rowHeight === "number"
    ? host.rowHeight
    : AUTO_ESTIMATED_ROW_HEIGHT;
}

/**
 * Owns scroll position and viewport measurement for `md-data-grid`'s
 * virtualization — either fixed (`rowHeight` a number) or dynamic
 * (`rowHeight: "auto"`, each row's real height measured via `measureRow()`)
 * — delegating the actual windowing math to `@tanstack/lit-virtual`'s
 * `VirtualizerController` rather than hand-rolled scrollTop/rAF bookkeeping.
 * `@tanstack/virtual-core` (the library underneath) already has a complete
 * per-item measurement system built in (`measureElement`/`resizeItem`/an
 * `itemSizeCache`, updated incrementally rather than by rebuilding the whole
 * positions array) — auto mode leans on that directly instead of
 * reimplementing it. Doesn't know about pagination or rows — row counts are
 * passed in as parameters by the host.
 *
 * The wrapped virtualizer owns scroll listening itself (attached directly
 * to the viewport element via its `getScrollElement()` callback, and
 * re-rendering the host on scroll via its own `onChange`), so `md-data-grid`
 * has no `@scroll` handler of its own to wire up at all.
 */
export class VirtualizationController {
  /** @param {import("../data-grid.js").MdDataGrid} host */
  constructor(host) {
    this.host = host;

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

    /**
     * `count`/`estimateSize`/`overscan` are only really known once `render()`
     * first runs (and can change on every subsequent one) — `_syncOptions()`
     * keeps them current, called from `visibleRange()` and `ensureRowVisible()`
     * below, the same two places that need a fresh virtualizer anyway.
     * @private
     */
    this._virtualizerController = new VirtualizerController(host, {
      count: host.rows.length,
      getScrollElement: () => this.viewportEl,
      estimateSize: () => estimateRowHeight(host),
      overscan: host.overscan,
    });

    // Mirrors the values passed above — lets _syncOptions() recognize its
    // very first call as already-synced, matching the state actually set.
    /** @private @type {number} */
    this._syncedRowCount = host.rows.length;
    /** @private @type {number | "auto"} */
    this._syncedRowHeight = host.rowHeight;
    /** @private @type {number} */
    this._syncedOverscan = host.overscan;
  }

  /**
   * Neither `_resize` nor `_virtualizerController` above need this class
   * itself registered as a controller — both are Reactive Controllers in
   * their own right and self-register on construction; this class has no
   * lifecycle hooks of its own, just a facade over the two of them.
   * @private
   */
  get _virtualizer() {
    return this._virtualizerController.getVirtualizer();
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
   * `count`/`estimateSize`/`overscan` can all change between renders;
   * `scrollToFn`/`observeElementRect`/`observeElementOffset` were supplied
   * once by `VirtualizerController` at construction and never change, so
   * they're carried forward from the instance's current options rather
   * than re-specified here — `setOptions()` on the raw `Virtualizer`
   * (unlike the wrapper) requires the full option set, not just a partial
   * update.
   *
   * `visibleRange()` (and therefore this) runs on every render — including
   * every scroll-driven one, which during a fast fling can fire many times
   * a second. `setOptions()` invalidates the virtualizer's own memoized
   * measurements even when nothing actually changed, and a fresh
   * `estimateSize` closure every call defeats that memoization too (it's a
   * new function reference each time, so nothing can tell it's the *same*
   * function as last time) — extra work stacked on every scroll frame is
   * exactly what makes the rendered window fall further behind a fast
   * scroll, which is what shows up as blank space until it catches up.
   * Skipping the call entirely when row count/height/overscan are all
   * unchanged (the common case for every frame *within* a scroll gesture,
   * as opposed to a data change) removes that self-inflicted cost.
   * @private
   * @param {number} rowCount
   */
  _syncOptions(rowCount) {
    const { rowHeight, overscan } = this.host;
    if (
      rowCount === this._syncedRowCount &&
      rowHeight === this._syncedRowHeight &&
      overscan === this._syncedOverscan
    ) {
      return;
    }
    this._syncedRowCount = rowCount;
    this._syncedRowHeight = rowHeight;
    this._syncedOverscan = overscan;
    this._virtualizer.setOptions({
      ...this._virtualizer.options,
      count: rowCount,
      estimateSize: () => estimateRowHeight(this.host),
      overscan,
    });
  }

  /**
   * Virtualization window (indices into whatever row array the host is
   * rendering), including overscan.
   *
   * Before the viewport's first ResizeObserver callback fires (same async
   * delay `this.viewportHeight` itself is subject to), the virtualizer's
   * own internal rect defaults to `{ height: 0 }` — its computed range for
   * a zero-height viewport is just a handful of rows (`overscan` worth),
   * not the roomier `overscan * 2` window this used before switching to
   * `@tanstack/lit-virtual`. Falling back to that same explicit, wider
   * window here (keyed off our own `viewportHeight`, not the virtualizer's
   * item count) keeps first-paint behavior identical either way.
   *
   * `offsetY` (how far to translateY the rendered row window) comes from
   * here too, alongside the indices — it's `items[0].start`, the first
   * visible item's actual position, which only equals `startIndex *
   * rowHeight` when every row is exactly `estimateSize` tall. In fixed mode
   * that's always true, so this is a no-op change from the old hand-computed
   * `startIndex * rowHeight`; in `"auto"` mode, rows above the window can be
   * taller or shorter than the estimate once measured, so only the
   * virtualizer's own tracked position is actually correct.
   * @param {number} rowCount
   * @returns {{ startIndex: number, endIndex: number, offsetY: number }}
   */
  visibleRange(rowCount) {
    this._syncOptions(rowCount);
    if (!this.viewportHeight) {
      return {
        startIndex: 0,
        endIndex: Math.min(rowCount, this.host.overscan * 2),
        offsetY: 0,
      };
    }
    const items = this._virtualizer.getVirtualItems();
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }
    return {
      startIndex: items[0].index,
      endIndex: items[items.length - 1].index + 1,
      offsetY: items[0].start,
    };
  }

  /**
   * Total scrollable height of all `rowCount` rows — `getTotalSize()`
   * accounts for every row actually measured so far (via `measureRow()`)
   * plus `estimateSize()` for the rest, rather than assuming every row is
   * exactly `rowHeight` tall. Equivalent to the old `rowCount * rowHeight`
   * whenever nothing has been measured yet (fixed mode never measures), so
   * this is a behavior-preserving switch for that case.
   * @param {number} rowCount
   * @returns {number}
   */
  totalSize(rowCount) {
    this._syncOptions(rowCount);
    return this._virtualizer.getTotalSize();
  }

  /**
   * Feeds a rendered row's *real* height back into the virtualizer for
   * `rowHeight: "auto"` — call for every currently-rendered row on every
   * update. `measureElement()` reads the row's own `data-index` attribute
   * to know which logical row it's measuring (required since row divs are
   * DOM-recycled — data-grid.js's row `repeat()` rebinds the same node to a
   * different row as you scroll, rather than remounting — so a one-time
   * "measure on mount" ref wouldn't track that rebinding), synchronously
   * re-measures immediately, and additionally registers a `ResizeObserver`
   * on the node so a *later* reflow (e.g. content that wraps differently
   * after a column resize) is caught too without an explicit call. Calling
   * this repeatedly for a row whose measured size hasn't actually changed
   * is a cheap no-op internally — `resizeItem()` only notifies/re-renders on
   * a real delta — so this is safe to call unconditionally, not just once.
   * @param {Element} rowEl
   */
  measureRow(rowEl) {
    this._virtualizer.measureElement(rowEl);
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

  /**
   * Scrolls `rows[index]` to the top of the viewport (`align: "start"`) —
   * unconditional, unlike `ensureRowVisible()` below, which only scrolls
   * when the row isn't already in view.
   * @param {number} index
   */
  scrollToRow(index) {
    this._virtualizer.scrollToIndex(index, { align: "start" });
  }

  /**
   * @param {number} rowIndex
   * @param {number} rowCount
   */
  ensureRowVisible(rowIndex, rowCount) {
    this._syncOptions(rowCount);
    // "auto" is a no-op if rowIndex is already fully in view, and otherwise
    // scrolls the minimum distance needed to bring it into view (from
    // whichever edge is closer) — matches arrow-key navigation's own
    // "only scroll as far as necessary" expectation.
    this._virtualizer.scrollToIndex(rowIndex, { align: "auto" });
  }

  resetScroll() {
    const viewport = this.viewportEl;
    if (viewport) viewport.scrollTop = 0;
    this.host.requestUpdate();
  }
}
