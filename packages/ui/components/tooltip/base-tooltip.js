/** @import { Placement } from "@floating-ui/dom" */

import { LitElement } from "lit";

import {
  PopoverPositionController,
  isElementInSubtree,
} from "../shared/popover-position-controller.js";

/** @typedef {Placement} TooltipPlacement */
/** @typedef {"absolute" | "fixed" | "document" | "popover"} TooltipPositioning */

let tooltipIdSeq = 0;

/** Default `showDelay`, ms — long enough that a passing hover doesn't open it.
 * Also doubles as the touch long-press duration (see `#onAnchorPointerDown`). */
const DEFAULT_SHOW_DELAY = 500;
/** Default `hideDelay`, ms — short, but long enough to move onto a rich tooltip's surface. */
const DEFAULT_HIDE_DELAY = 300;
/**
 * Pointer movement tolerance (px) while a touch long-press timer is pending —
 * exceeding this cancels the long-press, so a scroll/drag doesn't
 * accidentally open the tooltip.
 */
const LONG_PRESS_MOVE_TOLERANCE = 10;

/**
 * Shared positioning/trigger/accessibility base for `md-tooltip` and
 * `md-rich-tooltip`.
 *
 * Positioning, `for`-attribute anchor resolution, and show/hide/dismiss are
 * delegated to `PopoverPositionController` — the same primitive `md-menu`
 * uses (see `components/shared/popover-position-controller.js`) — so this class only
 * owns tooltip-specific concerns: hover/focus show+hide delays,
 * Escape-to-dismiss, and `role="tooltip"`/`aria-describedby` wiring.
 *
 * Neither this class nor its subclasses declare `for` as a Lit reactive
 * property — like `md-menu`, it's read once off the attribute by
 * `HTMLForController` (internal to `PopoverPositionController`) on connect.
 *
 * Subclasses supply their own `render()` and styles; this base renders
 * nothing itself (mirrors `BaseButton`/`BaseMdChip`).
 *
 * Private-field policy: anything only ever touched from within this class's
 * own body is a real `#private` field/method. `_scheduleClose()` and
 * `_cancelPendingClose()` stay on the `_`-prefixed convention instead,
 * because `MdRichTooltip` (a subclass) calls them directly — `#private`
 * members are not inherited/visible to subclasses at all, so making those
 * two truly private would break `md-rich-tooltip`'s hover-into-surface
 * handling.
 */
export class BaseTooltip extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    open: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
    offset: { type: Number, reflect: true },
    flip: { type: Boolean, reflect: true },
    /**
     * Positioning strategy — same semantics/fallback as `md-menu`'s
     * `positioning`: nearest positioned ancestor (`"absolute"`), the window
     * (`"fixed"`), hoisted to `<body>` (`"document"`), or the native
     * Popover API top layer (`"popover"`, default — falls back to `"fixed"`
     * if unsupported). See `#resolvedPositioning`.
     */
    positioning: { type: String, reflect: true },
    /** Milliseconds to wait after pointerenter/focusin before opening. */
    showDelay: { type: Number, reflect: true, attribute: "show-delay" },
    /** Milliseconds to wait after pointerleave/focusout before closing. */
    hideDelay: { type: Number, reflect: true, attribute: "hide-delay" },
  };

  /**
   * Single reused hover/focus delay timer — same shape as `md-menu`'s
   * `_hoverTimer` (`HOVER_OPEN_DELAY`/`HOVER_CLOSE_DELAY`): always cleared
   * before being rescheduled, whether for an open or a close.
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  #hoverTimer;

  /**
   * Touch long-press timer — separate from `#hoverTimer` since a touch
   * interaction starts on `pointerdown` (not `pointerenter`) and is
   * cancelled by movement/`pointerup`/`pointercancel`, not by a
   * `pointerleave`-driven close. See `#onAnchorPointerDown`.
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  #longPressTimer;

  /**
   * Viewport coordinates of the touch `pointerdown` that started the
   * pending long-press timer, so `#onAnchorPointerMove` can cancel it once
   * the pointer has moved more than `LONG_PRESS_MOVE_TOLERANCE` (a
   * scroll/drag, not a long-press).
   * @type {{ x: number, y: number } | null}
   */
  #longPressOrigin = null;

  /** @type {PopoverPositionController} */
  #popover;

  constructor() {
    super();

    /** @type {boolean} */
    this.open = false;

    /** MD3 plain/rich tooltips default to appearing above their anchor. */
    /** @type {TooltipPlacement} */
    this.placement = "top";

    /** @type {number} */
    this.offset = 4;

    /** @type {boolean} */
    this.flip = true;

    /** @type {TooltipPositioning} */
    this.positioning = "popover";

    /** @type {number} */
    this.showDelay = DEFAULT_SHOW_DELAY;

    /** @type {number} */
    this.hideDelay = DEFAULT_HIDE_DELAY;

    this.#popover = new PopoverPositionController(this, {
      // The host itself is the popover surface — see subclass render()/CSS.
      getSurfaceEl: () => this,
      getPlacement: () => this.placement,
      getOffset: () => ({ mainAxis: this.offset }),
      getFlip: () => this.flip,
      getStrategy: () =>
        this.#resolvedPositioning === "fixed" ||
        this.#resolvedPositioning === "popover"
          ? "fixed"
          : "absolute",
      getUseNativePopover: () => this.#resolvedPositioning === "popover",
      onAnchorChange: (next, prev) => this.#onAnchorChange(next, prev),
      onOpenChange: (isOpen) => {
        if (this.open === isOpen) return;
        this.open = isOpen;
      },
    });
  }

  /**
   * `positioning`, with the `"popover"` → `"fixed"` fallback applied when
   * the browser doesn't support the Popover API. Copied from `md-menu`'s
   * getter of the same name — everything that cares how the surface is
   * actually positioned/shown reads this instead of `positioning` directly.
   * @returns {"absolute" | "fixed" | "document" | "popover"}
   */
  get #resolvedPositioning() {
    if (
      this.positioning === "popover" &&
      typeof HTMLElement.prototype.showPopover !== "function"
    ) {
      return "fixed";
    }
    return this.positioning;
  }

  /**
   * Syncs the `popover` attribute and `"document"`-mode DOM hoisting to
   * `#resolvedPositioning`. Called on connect and whenever `positioning`
   * changes. Copied from `md-menu`'s method of the same name.
   */
  #syncPositioningMode() {
    if (this.#resolvedPositioning === "popover") {
      this.setAttribute("popover", "manual");
    } else {
      this.removeAttribute("popover");
    }

    if (
      this.#resolvedPositioning === "document" &&
      this.parentNode !== document.body
    ) {
      document.body.appendChild(this);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Opens the tooltip immediately, bypassing `showDelay`. */
  show() {
    clearTimeout(this.#hoverTimer);
    this.#cancelLongPress();
    this.open = true;
  }

  /**
   * Closes the tooltip immediately, bypassing `hideDelay`. If focus is
   * currently inside this tooltip's own surface (e.g. a keyboard user
   * Tabbed into a rich tooltip's action button, then pressed Escape — see
   * `#onWindowKeydown`), focus is returned to the anchor afterward so it
   * isn't dropped to `<body>`. A close triggered by the mouse
   * (pointerleave/hideDelay, via `_scheduleClose()`) never goes through
   * `hide()` and so never yanks focus around.
   */
  hide() {
    clearTimeout(this.#hoverTimer);
    this.#cancelLongPress();
    const shouldReturnFocus = this.#isFocusInSurface();
    this.open = false;
    if (shouldReturnFocus && this.#popover.anchorEl instanceof HTMLElement) {
      this.#popover.anchorEl.focus();
    }
  }

  /**
   * Whether the currently focused element is inside this tooltip's own
   * surface (the host itself — see `getSurfaceEl` above). Used by `hide()`
   * to decide whether closing should return focus to the anchor.
   * @returns {boolean}
   */
  #isFocusInSurface() {
    const active = document.activeElement;
    return active !== null && isElementInSubtree(active, this);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.#syncPositioningMode();
    // Constant for the lifetime of the element — tooltips don't have a
    // "role" variant the way md-menu's menuRole does, so this is set once
    // here rather than reactively in updated().
    this.setAttribute("role", "tooltip");
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#detachTriggerListeners(this.#popover.anchorEl);
    // Defensive: guaranteed detach even if the tooltip was still open at
    // disconnect — the normal path is the open/close branch in updated().
    window.removeEventListener("keydown", this.#onWindowKeydown);
    clearTimeout(this.#hoverTimer);
    this.#cancelLongPress();
  }

  /** @param {import("lit").PropertyValues} changed */
  updated(changed) {
    super.updated(changed);

    if (changed.has("positioning") && !this.open) {
      this.#syncPositioningMode();
    }

    if (changed.has("open")) {
      if (this.open) {
        // Scoped to while open, not the whole connected lifetime — avoids N
        // permanent `window` listeners on a page with many tooltip
        // instances that are rarely/never opened.
        window.addEventListener("keydown", this.#onWindowKeydown);
        this.#popover.show();
      } else {
        window.removeEventListener("keydown", this.#onWindowKeydown);
        this.#popover.hide();
      }
    }
  }

  // ── Anchor / trigger wiring ──────────────────────────────────────────────

  /**
   * Called by `PopoverPositionController` whenever the `for`-resolved
   * control changes. Attaches/detaches hover+focus trigger listeners and
   * `aria-describedby` — concerns the shared controller doesn't know about.
   * Mirrors `md-menu`'s `_onAnchorChange`/`_attachTriggerListeners`/
   * `_detachTriggerListeners`, but wires `aria-describedby` (tooltip
   * semantics) instead of `aria-haspopup`/`aria-expanded` (menu semantics).
   * @param {HTMLElement | null} next
   * @param {HTMLElement | null} prev
   */
  #onAnchorChange(next, prev) {
    this.#detachTriggerListeners(prev);
    this.#attachTriggerListeners(next);
  }

  /** @param {HTMLElement | null} control */
  #attachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;

    if (!this.id) {
      this.id = `md-tooltip-${++tooltipIdSeq}`;
    }
    this.#addDescribedByToken(control);

    control.addEventListener("pointerenter", this.#onAnchorPointerEnter);
    control.addEventListener("pointerleave", this.#onAnchorPointerLeave);
    control.addEventListener("pointerdown", this.#onAnchorPointerDown);
    control.addEventListener("pointerup", this.#onAnchorPointerUp);
    control.addEventListener("pointercancel", this.#onAnchorPointerCancel);
    control.addEventListener("pointermove", this.#onAnchorPointerMove);
    control.addEventListener("focusin", this.#onAnchorFocusIn);
    control.addEventListener("focusout", this.#onAnchorFocusOut);
  }

  /** @param {HTMLElement | null} control */
  #detachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;

    this.#removeDescribedByToken(control);

    control.removeEventListener("pointerenter", this.#onAnchorPointerEnter);
    control.removeEventListener("pointerleave", this.#onAnchorPointerLeave);
    control.removeEventListener("pointerdown", this.#onAnchorPointerDown);
    control.removeEventListener("pointerup", this.#onAnchorPointerUp);
    control.removeEventListener("pointercancel", this.#onAnchorPointerCancel);
    control.removeEventListener("pointermove", this.#onAnchorPointerMove);
    control.removeEventListener("focusin", this.#onAnchorFocusIn);
    control.removeEventListener("focusout", this.#onAnchorFocusOut);
  }

  /**
   * `control`'s `aria-describedby` as a token list (space-separated, same
   * convention as `class`) — shared by `#addDescribedByToken`/
   * `#removeDescribedByToken` so neither clobbers a pre-existing value (e.g.
   * a form control's own helper-text description).
   * @param {HTMLElement} control
   * @returns {string[]}
   */
  #describedByTokens(control) {
    return (control.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean);
  }

  /**
   * Appends this tooltip's own `id` to `control`'s `aria-describedby` token
   * list — a no-op if the token is already present.
   * @param {HTMLElement} control
   */
  #addDescribedByToken(control) {
    const tokens = this.#describedByTokens(control);
    if (tokens.includes(this.id)) return;
    control.setAttribute("aria-describedby", [...tokens, this.id].join(" "));
  }

  /**
   * Removes precisely this tooltip's own `id` token from `control`'s
   * `aria-describedby`, restoring the attribute to what it would have been
   * before `#addDescribedByToken` ran — any other tokens (pre-existing or
   * added elsewhere in the meantime) are left in place, and the attribute is
   * only removed entirely once no tokens remain.
   * @param {HTMLElement} control
   */
  #removeDescribedByToken(control) {
    const tokens = this.#describedByTokens(control).filter(
      (token) => token !== this.id,
    );
    if (tokens.length) {
      control.setAttribute("aria-describedby", tokens.join(" "));
    } else {
      control.removeAttribute("aria-describedby");
    }
  }

  // ── Private event handlers ───────────────────────────────────────────────
  //
  // Declared as arrow-function fields (not `method() {}` + constructor
  // `.bind(this)`) so each has a stable, auto-bound identity from
  // construction — required for add/removeEventListener to match, and for
  // `#private` methods specifically: a private *method* reassigned via
  // `.bind()` would throw ("private method is not writable"), and passing a
  // private method by bare reference to addEventListener would throw at
  // call time too (DOM dispatch calls it with `this` set to the event
  // target, which fails the private-member brand check). An arrow-function
  // field sidesteps both — it closes over the correct `this` lexically.

  /** @param {PointerEvent} event */
  #onAnchorPointerEnter = (event) => {
    // Touch has no sustained hover state — it opens via long-press instead
    // (see `#onAnchorPointerDown`), not on pointerenter.
    if (event.pointerType === "touch") return;
    this.#scheduleOpen();
  };

  /** @param {PointerEvent} event */
  #onAnchorPointerLeave = (event) => {
    if (event.pointerType === "touch") {
      // No sustained hover to leave — just cancel a not-yet-fired long-press.
      this.#cancelLongPress();
      return;
    }
    this._scheduleClose();
  };

  /**
   * MD3's touch trigger is a long-press, not a tap: starts timing on
   * `pointerdown` (not `pointerenter`, which fires immediately on tap and
   * would make every tap "work" only by the coincidence of holding past
   * `showDelay`). Opens if the timer completes before `pointerup`/
   * `pointercancel`/`pointerleave`, or before the pointer moves more than
   * `LONG_PRESS_MOVE_TOLERANCE` (so a scroll/drag doesn't trigger it).
   * @param {PointerEvent} event
   */
  #onAnchorPointerDown = (event) => {
    if (event.pointerType !== "touch") return;
    this.#cancelLongPress();
    this.#longPressOrigin = { x: event.clientX, y: event.clientY };
    this.#longPressTimer = setTimeout(() => {
      this.#longPressTimer = undefined;
      this.#longPressOrigin = null;
      this.open = true;
    }, this.showDelay);
  };

  /** @param {PointerEvent} event */
  #onAnchorPointerMove = (event) => {
    if (event.pointerType !== "touch" || !this.#longPressOrigin) return;
    const dx = event.clientX - this.#longPressOrigin.x;
    const dy = event.clientY - this.#longPressOrigin.y;
    if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE) {
      this.#cancelLongPress();
    }
  };

  /** @param {PointerEvent} event */
  #onAnchorPointerUp = (event) => {
    if (event.pointerType !== "touch") return;
    this.#cancelLongPress();
  };

  /** @param {PointerEvent} event */
  #onAnchorPointerCancel = (event) => {
    if (event.pointerType !== "touch") return;
    this.#cancelLongPress();
  };

  #onAnchorFocusIn = () => {
    this.#scheduleOpen();
  };

  /** @param {FocusEvent} event */
  #onAnchorFocusOut = (event) => {
    // Focus moving forward from the anchor into the tooltip's own surface
    // (e.g. Tab into a rich tooltip's action button) isn't a dismiss —
    // mirrors `_onSurfacePointerEnter`/`_onSurfacePointerLeave` in
    // rich-tooltip.js, but for keyboard focus instead of the mouse.
    const related = /** @type {Node | null} */ (event.relatedTarget);
    if (related && isElementInSubtree(related, this)) return;
    this._scheduleClose();
  };

  /** @param {KeyboardEvent} event */
  #onWindowKeydown = (event) => {
    if (event.key === "Escape" && this.open) {
      this.hide();
    }
  };

  /** Clears a pending touch long-press timer, if any, without side effects. */
  #cancelLongPress() {
    clearTimeout(this.#longPressTimer);
    this.#longPressTimer = undefined;
    this.#longPressOrigin = null;
  }

  // ── Hover/focus delay scheduling ─────────────────────────────────────────
  //
  // Mirrors md-menu's `_onTriggerPointerEnter`/`_onTriggerPointerLeave`
  // (`HOVER_OPEN_DELAY`/`HOVER_CLOSE_DELAY`) shape: a single reused timer,
  // always cleared before being rescheduled. `md-rich-tooltip` reuses
  // `_scheduleClose()`/`_cancelPendingClose()` for pointerenter/pointerleave
  // on its own surface, so moving the pointer from the anchor onto the
  // surface keeps the tooltip open instead of dismissing it. Those two stay
  // on the `_`-prefixed convention (not `#private`) specifically because
  // `md-rich-tooltip`, a subclass, calls them — see the class doc comment.

  #scheduleOpen() {
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(() => {
      this.open = true;
    }, this.showDelay);
  }

  _scheduleClose() {
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(() => {
      this.open = false;
    }, this.hideDelay);
  }

  /** Cancels a pending close without scheduling a new open. */
  _cancelPendingClose() {
    clearTimeout(this.#hoverTimer);
  }
}
