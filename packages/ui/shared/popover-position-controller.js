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
 *   floating-ui `computePosition()` strategy. Defaults to `"fixed"`;
 *   `"absolute"` positions relative to the nearest positioned ancestor
 *   instead of the viewport (e.g. `<md-menu positioning="absolute">`).
 * @property {() => boolean} [getUseNativePopover]
 *   Whether `show()`/`hide()` drive the surface via the native Popover API.
 *   Defaults to `true`; when `false` the consumer owns visibility itself.
 *
 *   Only controls *showing* — dismissal is always self-managed by this
 *   controller, never native `popover="auto"` light-dismiss, so consumers
 *   should render with `popover="manual"`.
 * @property {() => boolean} [getMatchAnchorWidth]
 *   Opt-in: forces the surface's `min-width` to match the reference
 *   element's width on every position computation (e.g. `md-select`'s menu
 *   should be exactly as wide as the trigger).
 * @property {() => HTMLElement | null | undefined} [getAnchorOverride]
 *   Explicit reference element taking priority over the `for`-resolved
 *   control (e.g. a submenu anchored to its parent item, not its own `for`).
 * @property {(isOpen: boolean) => void} onOpenChange
 *   Called on the surface's native `toggle` event, so the host can sync its
 *   own `open` property when the browser closes the popover itself.
 * @property {(next: HTMLElement | null, prev: HTMLElement | null) => void} [onAnchorChange]
 *   Called when the `for`-resolved control changes, so the host can manage
 *   its own trigger listeners and `aria-haspopup`/`aria-expanded`.
 */

/**
 * Composed-tree-aware "is `node` inside `root`'s subtree" check. Plain
 * `Node.contains()` does not cross shadow boundaries, so this instead walks
 * the same chain a composed `composedPath()` would: through a slotted
 * node's `assignedSlot`, and from a `ShadowRoot` up to its `host`.
 * @param {Node} node
 * @param {Node} root
 * @returns {boolean}
 */
function isElementInSubtree(node, root) {
  /** @type {Node | null} */
  let current = node;
  while (current) {
    if (current === root) return true;
    if (current instanceof Element && current.assignedSlot) {
      current = current.assignedSlot;
    } else if (current.parentNode) {
      current = current.parentNode;
    } else if (
      typeof ShadowRoot !== "undefined" &&
      current instanceof ShadowRoot
    ) {
      current = current.host;
    } else {
      current = null;
    }
  }
  return false;
}

/**
 * Shared popover positioning + show/hide primitive for any `popover`
 * surface anchored to a `for`-resolved trigger, an explicit anchor
 * override, or arbitrary viewport coordinates.
 *
 * Encapsulates anchor resolution (`HTMLForController`), floating-ui
 * `computePosition()` + `autoUpdate()`, imperative `showPopover()`/
 * `hidePopover()` (with the `{ source }` invoker option for nested-popover
 * stacking, falling back where unsupported), reporting browser-driven
 * `toggle` changes back to the host, point-anchoring via a virtual element,
 * and dismissal — click-outside/focus-out are always handled by this
 * controller itself, never native `popover="auto"` light-dismiss (see
 * `_attachLightDismiss()` for why).
 *
 * Has no knowledge of consumer-specific concepts (menu roving
 * tabindex/typeahead, tooltip hover-delay, etc.), so it can back both
 * `<md-menu>` and a future `<md-tooltip>` on the same positioning core.
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
     * Whether the light-dismiss listeners are currently attached — tracked
     * explicitly since, unlike the toggle listener, they aren't tied to a
     * specific target element to compare against.
     * @type {boolean}
     */
    this._lightDismissAttached = false;

    /**
     * Composed path of the most recent `window` `pointerdown`, cached for
     * `_onSurfaceFocusOut` to consult when the focus-out's `relatedTarget`
     * is `null` (e.g. click on a non-focusable element). Cleared on detach
     * and on every keydown so a stale pointer interaction can't leak into a
     * later keyboard-driven focus change.
     * @type {EventTarget[]}
     */
    this._pointerPath = [];

    this._onToggle = this._onToggle.bind(this);
    this._onWindowPointerDown = this._onWindowPointerDown.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onSurfaceFocusOut = this._onSurfaceFocusOut.bind(this);
    this._onSurfaceKeydown = this._onSurfaceKeydown.bind(this);

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
   * @param {{ source?: HTMLElement }} [options]
   *   `source` explicitly sets the native popover invoker (see
   *   `HTMLElement.showPopover({ source })`), taking priority over the
   *   auto-resolved anchor override / `for`-resolved control.
   */
  async show({ source } = {}) {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;

    if (this._useNativePopover) {
      this._attachToggleListener(surface);

      if (!surface.matches(":popover-open")) {
        // `source` preserves native popover ancestor-stacking for nested
        // popovers opened imperatively. Not supported everywhere — fall
        // back to plain showPopover() where the options-object form throws.
        const resolvedSource =
          source ??
          this.options.getAnchorOverride?.() ??
          this._anchorEl ??
          undefined;
        try {
          // `{ source }` isn't in TS's bundled DOM lib yet — cast around it.
          /** @type {(options?: { source?: Element }) => void} */ (
            surface.showPopover
          ).call(
            surface,
            resolvedSource ? { source: resolvedSource } : undefined,
          );
        } catch {
          try {
            surface.showPopover();
          } catch {
            /* already open, or Popover API unsupported */
          }
        }
      }
    }

    // Dismiss is always self-managed (see `_attachLightDismiss()`) whether
    // or not the surface is also a native popover.
    this._attachLightDismiss();

    this.startAutoUpdate();
    await this.updatePosition();
  }

  /**
   * Hides the popover surface and stops `autoUpdate()`. Call whenever the
   * host's own `open` state becomes `false`.
   */
  hide() {
    const surface = this.options.getSurfaceEl();
    if (this._useNativePopover && surface?.matches(":popover-open")) {
      try {
        surface.hidePopover();
      } catch {
        /* already closed */
      }
    }
    this._detachLightDismiss();
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

    // Resolved placement (post-flip(), may differ from the requested one)
    // as an attribute, so consumer CSS can key open/close motion off it.
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
   * This controller's own click-outside/focus-out dismiss, used for every
   * surface — never native `popover="auto"` light-dismiss, even when
   * `getUseNativePopover()` is `true`. Two reasons (ported from
   * material-web's `menu/internal/menu.ts`, same rationale applies here):
   * native light-dismiss fires on `pointerdown` so Tab-focus-out never
   * triggers it, and Safari on iOS doesn't bubble `click` on `window` for
   * non-"clickable" targets — hence listening on `document`, not `window`.
   *
   * Four listeners: `_onWindowPointerDown` caches the pointerdown path for
   * `_onSurfaceFocusOut` to consult; `_onDocumentClick` is the actual
   * click-outside-closes check (capture-phase, so `stopPropagation()`
   * elsewhere can't hide it); `_onSurfaceFocusOut` closes on any focus-out
   * of the surface+anchor subtrees; `_onSurfaceKeydown` clears the cached
   * pointer path so it can't leak into a later keyboard-driven focus change.
   */
  _attachLightDismiss() {
    if (this._lightDismissAttached) return;
    window.addEventListener("pointerdown", this._onWindowPointerDown, {
      capture: true,
    });
    document.addEventListener("click", this._onDocumentClick, {
      capture: true,
    });
    const surface = this.options.getSurfaceEl();
    surface?.addEventListener("focusout", this._onSurfaceFocusOut);
    surface?.addEventListener("keydown", this._onSurfaceKeydown);
    this._lightDismissAttached = true;
  }

  _detachLightDismiss() {
    if (!this._lightDismissAttached) return;
    window.removeEventListener("pointerdown", this._onWindowPointerDown, {
      capture: true,
    });
    document.removeEventListener("click", this._onDocumentClick, {
      capture: true,
    });
    const surface = this.options.getSurfaceEl();
    surface?.removeEventListener("focusout", this._onSurfaceFocusOut);
    surface?.removeEventListener("keydown", this._onSurfaceKeydown);
    this._lightDismissAttached = false;
    this._pointerPath = [];
  }

  /** @param {PointerEvent} event */
  _onWindowPointerDown(event) {
    this._pointerPath = event.composedPath();
  }

  /** @param {MouseEvent} event */
  _onDocumentClick(event) {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;
    const path = event.composedPath();
    if (path.includes(surface)) return;
    const reference = this.referenceEl;
    if (reference instanceof HTMLElement && path.includes(reference)) return;
    this.options.onOpenChange(false);
  }

  /**
   * @param {FocusEvent} event
   */
  _onSurfaceFocusOut(event) {
    const surface = this.options.getSurfaceEl();
    if (!surface) return;

    const reference = this.referenceEl;
    const anchorEl = reference instanceof HTMLElement ? reference : null;

    // Pointerdown targeted the anchor itself (e.g. clicking an
    // already-focused trigger to close it) — that's a toggle, not a dismiss.
    if (anchorEl && this._pointerPath.includes(anchorEl)) return;

    const related = /** @type {Node | null} */ (event.relatedTarget);
    if (related) {
      // Not a dismiss if focus is moving within the surface's subtree, or
      // into the anchor's subtree as part of the same pointer interaction.
      if (
        isElementInSubtree(related, surface) ||
        (this._pointerPath.length !== 0 &&
          anchorEl &&
          isElementInSubtree(related, anchorEl))
      ) {
        return;
      }
    } else if (this._pointerPath.includes(surface)) {
      // No relatedTarget — fall back to the cached pointer path: a click
      // inside the surface (e.g. a non-focusable divider) isn't a dismiss.
      return;
    }

    this.options.onOpenChange(false);
  }

  /**
   * The pointer interaction (if any) is done — clear the cached path so it
   * doesn't influence a later, unrelated keyboard-driven focus change (e.g.
   * click the anchor, then Shift+Tab).
   */
  _onSurfaceKeydown() {
    this._pointerPath = [];
  }
}
