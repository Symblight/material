/** @import { ReactiveController, ReactiveControllerHost } from "lit" */
/** @import { Placement, ReferenceElement, OffsetOptions } from "@floating-ui/dom" */

import {
  computePosition,
  offset,
  flip as flipMiddleware,
  shift,
  size,
  autoUpdate,
} from "@floating-ui/dom";

import { HTMLForController } from "../components/html-for-controller/html-for-controller.js";

/**
 * @typedef {object} PopoverPositionControllerOptions
 * @property {() => HTMLElement | null | undefined} getSurfaceEl
 *   Returns the `popover`-attribute-carrying element to show/hide/position.
 *   Queried fresh on every call since Lit's `renderRoot` can be empty until
 *   first render.
 * @property {() => Placement} getPlacement
 * @property {() => OffsetOptions} getOffset
 * @property {() => boolean} getFlip
 * @property {() => "absolute" | "fixed"} [getStrategy]
 *   floating-ui's `computePosition()` strategy. Defaults to `"fixed"`
 *   (the original, only, behavior). `"absolute"` positions relative to the
 *   nearest positioned ancestor/containing block instead of the viewport —
 *   e.g. `<md-menu positioning="absolute">`.
 * @property {() => boolean} [getUseNativePopover]
 *   Whether `show()`/`hide()` drive the surface via the native Popover API
 *   (`showPopover()`/`hidePopover()`, native `toggle` event, top-layer
 *   rendering + built-in light-dismiss). Defaults to `true`. When `false`,
 *   this controller instead attaches its own outside-pointerdown light
 *   dismiss (see `_onDocumentPointerDown`) since none of that native
 *   behavior applies to a plain, non-`popover` element — the consumer is
 *   responsible for the element's own visibility (CSS keyed off its own
 *   `open`-reflecting attribute rather than `:popover-open`) and for not
 *   setting the `popover` attribute in the first place.
 * @property {() => boolean} [getMatchAnchorWidth]
 *   Opt-in: when true, forces the surface's `min-width` (inline style, so
 *   it wins over any CSS `min-inline-size`) to match the reference
 *   element's width on every position computation — e.g. `md-select`'s
 *   menu-mode popover should be exactly as wide as the trigger, unlike a
 *   context menu or a plain dropdown sized to its own content.
 * @property {() => HTMLElement | null | undefined} [getAnchorOverride]
 *   Optional explicit reference element that takes priority over the
 *   `for`-resolved control (e.g. a submenu anchored to its parent menu
 *   item's interactive element, or a tooltip anchored to something other
 *   than its `for` target).
 * @property {(isOpen: boolean) => void} onOpenChange
 *   Called whenever the surface's native `toggle` event fires, so the host
 *   can sync its own reflected `open` property when the browser closes the
 *   popover itself (light-dismiss / Escape). The host is responsible for
 *   guarding against redundant/self-triggered updates.
 * @property {(next: HTMLElement | null, prev: HTMLElement | null) => void} [onAnchorChange]
 *   Called whenever the `for`-resolved control element changes, so the host
 *   can manage its own trigger listeners (click/hover/contextmenu) and
 *   `aria-haspopup`/`aria-expanded` — those are consumer-specific concerns
 *   this controller intentionally knows nothing about.
 */

/**
 * Shared popover positioning + show/hide primitive for any `popover`
 * surface (`"auto"` or `"manual"`) anchored to a `for`-resolved trigger
 * element, an explicit anchor override, or arbitrary viewport coordinates.
 *
 * Encapsulates:
 *  - anchor resolution, via `HTMLForController`
 *  - floating-ui `computePosition()` with `offset()`/`flip()`/`shift()`
 *    middleware, plus `autoUpdate()` lifecycle (start on show, stop on
 *    hide/disconnect)
 *  - imperative `showPopover()`/`hidePopover()`, including the modern
 *    `{ source }` invoker option (so native popover ancestor-stacking still
 *    works for nested popovers opened imperatively), with a fallback for
 *    browsers that don't support it yet
 *  - listening to the surface's native `toggle` event to report
 *    browser-driven state changes back to the host
 *  - `setPointAnchor(x, y)` / `clearPointAnchor()` via a floating-ui virtual
 *    element, for anchoring to arbitrary viewport coordinates (e.g. a
 *    context-menu variant) instead of a `for`-resolved element
 *
 * Deliberately has NO knowledge of any consumer-specific concepts (menu
 * roving tabindex/typeahead/`role="menu"`/`select` events, tooltip
 * hover-delay semantics, etc.) so it can back both `<md-menu>` today and a
 * future `<md-tooltip>` (which would use `popover="manual"` and its own
 * hover-triggered open/close policy on top of the same positioning core).
 *
 * @implements {ReactiveController}
 */
export class PopoverPositionController {
  /**
   * @param {ReactiveControllerHost & HTMLElement} host
   * @param {PopoverPositionControllerOptions} options
   */
  constructor(host, options) {
    /** @type {ReactiveControllerHost & HTMLElement} */
    this.host = host;
    /** @type {PopoverPositionControllerOptions} */
    this.options = options;

    /** @type {HTMLElement | null} */
    this._anchorEl = null;

    /** @type {{ getBoundingClientRect: () => DOMRect } | null} */
    this._virtualEl = null;

    /** @type {(() => void) | undefined} */
    this._cleanupAutoUpdate = undefined;

    /** @type {HTMLElement | undefined} */
    this._toggleTarget = undefined;

    /**
     * Whether `_onDocumentPointerDown` is currently attached — tracked
     * explicitly rather than re-derived, since unlike the toggle listener
     * it isn't tied to a specific target element to compare against.
     * @type {boolean}
     */
    this._lightDismissAttached = false;

    this._onToggle = this._onToggle.bind(this);
    this._onDocumentPointerDown = this._onDocumentPointerDown.bind(this);
    this._onSurfaceFocusOut = this._onSurfaceFocusOut.bind(this);

    // Reuses the same `for`-attribute-resolves-an-element-by-id pattern used
    // by `md-ripple`, rather than reimplementing anchor resolution here.
    this._forController = new HTMLForController(host, (prev, next) => {
      this._anchorEl = next;
      this.options.onAnchorChange?.(next, prev);
    });

    (this.host = host).addController(this);
  }

  hostDisconnected() {
    this.stopAutoUpdate();
    this._detachToggleListener();
    this._detachLightDismiss();
  }

  /** @returns {boolean} */
  get _useNativePopover() {
    return this.options.getUseNativePopover?.() ?? true;
  }

  /** The `for`-resolved control element, if any. */
  get anchorEl() {
    return this._anchorEl;
  }

  /**
   * The floating-ui reference currently in effect: a point anchor (if
   * `setPointAnchor()` was called and not yet cleared) takes priority over
   * an explicit anchor override, which takes priority over the
   * `for`-resolved control element.
   * @returns {ReferenceElement | null}
   */
  get referenceEl() {
    return (
      this._virtualEl ??
      this.options.getAnchorOverride?.() ??
      this._anchorEl ??
      null
    );
  }

  /**
   * Anchors future positioning to arbitrary viewport coordinates via a
   * floating-ui virtual element, instead of a real anchor element.
   * @param {number} x
   * @param {number} y
   */
  setPointAnchor(x, y) {
    this._virtualEl = {
      getBoundingClientRect: () =>
        /** @type {DOMRect} */ ({
          x,
          y,
          top: y,
          left: x,
          right: x,
          bottom: y,
          width: 0,
          height: 0,
          toJSON() {
            return this;
          },
        }),
    };
  }

  /** Reverts to anchoring off the resolved element (anchor override or `for` control). */
  clearPointAnchor() {
    this._virtualEl = null;
  }

  /**
   * Shows the popover surface (if not already open), computes its position,
   * and starts `autoUpdate()`. Call whenever the host's own `open` state
   * becomes `true`.
   */
  async show() {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;

    if (this._useNativePopover) {
      this._attachToggleListener(surface);

      if (!surface.matches(":popover-open")) {
        // `source` establishes the imperative popover-invoker relationship so
        // native popover ancestor-stacking (light-dismiss closing only the
        // innermost popover in a chain) still works even though we call
        // showPopover() imperatively instead of via a declarative
        // `popovertarget`. Not yet supported in every browser — fall back to
        // plain showPopover() where the options-object form throws.
        const source =
          this.options.getAnchorOverride?.() ?? this._anchorEl ?? undefined;
        try {
          // `{ source }` isn't in TS's bundled DOM lib yet even though it
          // ships in current browsers — cast to bypass the stale type.
          /** @type {(options?: { source?: Element }) => void} */ (
            surface.showPopover
          ).call(surface, source ? { source } : undefined);
        } catch {
          try {
            surface.showPopover();
          } catch {
            /* already open, or Popover API unsupported */
          }
        }
      }
    } else {
      this._attachLightDismiss();
    }

    this.startAutoUpdate();
    await this.updatePosition();
  }

  /**
   * Hides the popover surface and stops `autoUpdate()`. Call whenever the
   * host's own `open` state becomes `false`.
   */
  hide() {
    const surface = this.options.getSurfaceEl();
    if (this._useNativePopover) {
      if (surface?.matches(":popover-open")) {
        try {
          surface.hidePopover();
        } catch {
          /* already closed */
        }
      }
    } else {
      this._detachLightDismiss();
    }
    this.stopAutoUpdate();
  }

  /** Recomputes and applies the surface's position against the current reference. */
  async updatePosition() {
    const reference = this.referenceEl;
    const surface = this.options.getSurfaceEl();
    if (!reference || !surface) return;

    const middleware = [
      offset(this.options.getOffset()),
      shift({ padding: 8 }),
    ];
    if (this.options.getFlip()) middleware.push(flipMiddleware());
    if (this.options.getMatchAnchorWidth?.()) {
      middleware.push(
        size({
          apply: ({ rects }) => {
            Object.assign(surface.style, {
              minWidth: `${rects.reference.width}px`,
            });
          },
        }),
      );
    }

    const { x, y, placement } = await computePosition(reference, surface, {
      placement: this.options.getPlacement(),
      strategy: this.options.getStrategy?.() ?? "fixed",
      middleware,
    });

    // Exposes the *resolved* placement (post-flip() — may differ from the
    // requested `placement` when the preferred side didn't fit) as an
    // attribute, so a consumer's CSS can key open/close motion off which
    // edge the surface actually ended up anchored to — e.g. `md-menu`
    // reveals from the top when placed below its anchor and from the
    // bottom when flipped above it, per MD3's menu motion spec.
    surface.setAttribute("data-placement", placement);
    Object.assign(surface.style, { left: `${x}px`, top: `${y}px` });
  }

  startAutoUpdate() {
    this.stopAutoUpdate();
    const reference = this.referenceEl;
    const surface = this.options.getSurfaceEl();
    if (!reference || !surface) return;
    this._cleanupAutoUpdate = autoUpdate(reference, surface, () =>
      this.updatePosition(),
    );
  }

  stopAutoUpdate() {
    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = undefined;
  }

  /** @param {HTMLElement} surface */
  _attachToggleListener(surface) {
    if (this._toggleTarget === surface) return;
    this._detachToggleListener();
    surface.addEventListener("toggle", this._onToggle);
    this._toggleTarget = surface;
  }

  _detachToggleListener() {
    this._toggleTarget?.removeEventListener("toggle", this._onToggle);
    this._toggleTarget = undefined;
  }

  /** @param {Event} event */
  _onToggle(event) {
    const isOpen = /** @type {ToggleEvent} */ (event).newState === "open";
    this.options.onOpenChange(isOpen);
  }

  /**
   * Non-native-popover equivalent of the built-in light-dismiss a real
   * popover gets for free: closes on any pointerdown whose composed path
   * lands outside both the surface and its reference/anchor element
   * (`_onDocumentPointerDown`), and closes when focus moves outside the
   * surface entirely (`_onSurfaceFocusOut`) — native `popover="auto"` closes
   * on Tab-out for free via the browser's own focus handling, which none of
   * this applies to without the real `popover` attribute. Capture-phase on
   * the pointerdown listener so it still sees the event even if some
   * intervening handler calls `stopPropagation()`.
   */
  _attachLightDismiss() {
    if (this._lightDismissAttached) return;
    document.addEventListener("pointerdown", this._onDocumentPointerDown, {
      capture: true,
    });
    this.options
      .getSurfaceEl()
      ?.addEventListener("focusout", this._onSurfaceFocusOut);
    this._lightDismissAttached = true;
  }

  _detachLightDismiss() {
    if (!this._lightDismissAttached) return;
    document.removeEventListener("pointerdown", this._onDocumentPointerDown, {
      capture: true,
    });
    this.options
      .getSurfaceEl()
      ?.removeEventListener("focusout", this._onSurfaceFocusOut);
    this._lightDismissAttached = false;
  }

  /** @param {PointerEvent} event */
  _onDocumentPointerDown(event) {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;
    const path = event.composedPath();
    if (path.includes(surface)) return;
    const reference = this.referenceEl;
    if (reference instanceof HTMLElement && path.includes(reference)) return;
    this.options.onOpenChange(false);
  }

  /** @param {FocusEvent} event */
  _onSurfaceFocusOut(event) {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;
    // `Node.contains()` is shadow-including, so this correctly recognizes
    // focus moving between menu items (each item's interactive element
    // lives in its own shadow root) as "still inside" — only a genuine
    // focus-out (including focus leaving the document, where relatedTarget
    // is null) triggers the close.
    const next = /** @type {Node | null} */ (event.relatedTarget);
    if (next && surface.contains(next)) return;
    this.options.onOpenChange(false);
  }
}
