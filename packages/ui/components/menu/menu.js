import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";

import { PopoverPositionController } from "../shared/popover-position-controller.js";

import "../shadow/shadow.js";
import "./menu-item.js";
import "./item-group.js";

/** @import { MdMenuItem } from "./menu-item.js" */

import styles from "./menu.css?inline";

/** @typedef {"standard" | "vibrant"} MenuVariant */
/** @typedef {"click" | "hover" | "contextmenu"} MenuTrigger */
/** @typedef {import("@floating-ui/dom").Placement} MenuPlacement */
/** @typedef {"absolute" | "fixed" | "document" | "popover"} MenuPositioning */

const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 150;
const TYPEAHEAD_RESET_DELAY = 500;

/**
 * @tag md-menu
 * @summary Material Design 3 menu.
 *
 * Anchors a `popover="manual"` surface (an elevated `.md-menu__card` div,
 * styled in-house rather than via `<md-card>`) to a `for`-resolved trigger,
 * or to arbitrary viewport coordinates via
 * `openAtPoint()` for the context-menu variant. `"manual"`, not `"auto"` —
 * dismiss is handled entirely by `PopoverPositionController`, not native
 * light-dismiss (see that controller's class doc for why).
 *
 * Positioning, anchor resolution, and show/hide/dismiss are delegated to
 * `PopoverPositionController` (a reusable primitive also meant for a future
 * tooltip); `md-menu` itself only owns menu-specific concerns: trigger
 * wiring, roving tabindex, typeahead, submenu chevrons, `select` dispatch.
 *
 * Slot: *(default)* — `md-menu-item`, `md-menu-group`, and `md-hr` children.
 *
 * Private-field policy: anything only ever touched from within this class's
 * own body is a real `#private` field/method. `_enabledMenuItems` stays on
 * the `_`-prefixed convention instead, because `menu.spec.js` reaches into
 * it directly (`el._enabledMenuItems`) — `#private` members aren't visible
 * outside the class at all, so privatizing it would break that test. The
 * `_segmentCount` reactive property (declared in `static properties` below)
 * also stays as-is — Lit's reactivity is wired to that literal property
 * name, so turning it into a real private field would need a backing field
 * plus an explicit `requestUpdate()` call, a bigger change than a rename.
 */
@customElement("md-menu")
export class MdMenu extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    open: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
    offset: { type: Number, reflect: true },
    /** Extra nudge along the anchor-relative cross axis, additive with `offset`. */
    xOffset: { type: Number, reflect: true, attribute: "x-offset" },
    /** Extra nudge along the anchor-relative main axis, added on top of `offset`. */
    yOffset: { type: Number, reflect: true, attribute: "y-offset" },
    /**
     * Positioning strategy: nearest positioned ancestor (`"absolute"`), the
     * window (`"fixed"`), the whole document via hoisting to `<body>`
     * (`"document"`), or the native Popover API top layer (`"popover"`,
     * default — falls back to `"fixed"` if unsupported). See
     * `#resolvedPositioning`.
     */
    positioning: { type: String, reflect: true },
    flip: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
    trigger: { type: String, reflect: true },
    animation: { type: String, reflect: true },

    matchAnchorWidth: {
      type: Boolean,
      reflect: true,
      attribute: "match-anchor-width",
    },

    menuRole: { type: String, reflect: true, attribute: "menu-role" },

    focusOnOpen: { type: String, reflect: true, attribute: "focus-on-open" },

    anchorElement: { attribute: false },

    _segmentCount: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  /**
   * Tracks the in-flight `#handleOpen()` call so `show()` can await the
   * full open sequence, not just the Lit update that kicks it off —
   * otherwise a caller's `focusFirstItem()` right after `show()` could
   * race `#initRovingTabindex()` and get silently overwritten.
   * @type {Promise<void>}
   */
  #openPromise = Promise.resolve();

  /** Same role as `#openPromise`, for the close path. @type {Promise<void>} */
  #closePromise = Promise.resolve();

  /**
   * Explicit invoker requested via `show({ source })`/`toggle({ source })`,
   * stashed here since `open`'s `updated()` handler (not `show()` itself)
   * is what actually calls `#handleOpen()` → `#popover.show()`. Cleared
   * once consumed.
   * @type {HTMLElement | undefined}
   */
  #pendingSource;

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #hoverTimer;

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #typeaheadTimer;

  /** @type {string} */
  #typeaheadBuffer = "";

  /** @type {PopoverPositionController} */
  #popover;

  /** @type {MutationController} */
  #childrenObserver;

  constructor() {
    super();

    /** @type {boolean} */
    this.open = false;

    /** @type {MenuPlacement} */
    this.placement = "bottom-start";

    /** @type {number} */
    this.offset = 4;

    /** @type {number} */
    this.xOffset = 0;

    /** @type {number} */
    this.yOffset = 0;

    /** @type {MenuPositioning} */
    this.positioning = "popover";

    /** @type {boolean} */
    this.flip = true;

    /** @type {MenuVariant} */
    this.variant = "standard";

    /** @type {MenuTrigger} */
    this.trigger = "click";

    /** @type {"true" | "false"} */
    this.animation = "true";

    /** @type {boolean} */
    this.matchAnchorWidth = false;

    /** @type {"menu" | "listbox"} */
    this.menuRole = "menu";

    /** @type {"first" | "selected"} */
    this.focusOnOpen = "first";

    /** @type {HTMLElement | undefined} */
    this.anchorElement = undefined;

    /** @type {number} */
    this._segmentCount = 1;

    this.#popover = new PopoverPositionController(this, {
      // The host itself is the popover surface — see render()/menu.css.
      getSurfaceEl: () => this,
      getPlacement: () => this.placement,
      getOffset: () => ({
        mainAxis: this.offset + this.yOffset,
        crossAxis: this.xOffset,
      }),
      getFlip: () => this.flip,
      getStrategy: () =>
        this.#resolvedPositioning === "fixed" ||
        this.#resolvedPositioning === "popover"
          ? "fixed"
          : "absolute",
      getUseNativePopover: () => this.#resolvedPositioning === "popover",
      getMatchAnchorWidth: () => this.matchAnchorWidth,
      getAnchorOverride: () => this.anchorElement ?? null,
      onAnchorChange: (next, prev) => this.#onAnchorChange(next, prev),
      onOpenChange: (isOpen) => {
        if (this.open === isOpen) return;
        this.open = isOpen;
      },
    });

    // Recomputes segments when consumers mutate menu content after first render.
    this.#childrenObserver = new MutationController(this, {
      config: { childList: true },
    });
    this.#childrenObserver.callback = () => {
      this.#syncSegments();
    };
  }

  /**
   * `positioning`, with the `"popover"` → `"fixed"` fallback applied when
   * the browser doesn't support the Popover API. Everything that cares how
   * the surface is actually positioned/shown reads this instead.
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
   * changes. Always `"manual"`, never `"auto"` — dismissal is handled by
   * `PopoverPositionController` regardless of positioning mode.
   */
  #syncPositioningMode() {
    if (this.#resolvedPositioning === "popover") {
      this.setAttribute("popover", "manual");
    } else {
      this.removeAttribute("popover");
    }

    // "document" mode: hoist to a direct child of <body> so there's no
    // closer positioned ancestor. Safe from connectedCallback — moving an
    // already-connected node doesn't re-trigger it.
    if (
      this.#resolvedPositioning === "document" &&
      this.parentNode !== document.body
    ) {
      document.body.appendChild(this);
    }
  }

  /** The `md-menu-item` that hosts this menu as a submenu, if any. */
  get parentItem() {
    const parent = this.parentElement;
    return parent?.tagName === "MD-MENU-ITEM"
      ? /** @type {MdMenuItem} */ (parent)
      : null;
  }

  /**
   * The ancestor `md-menu` this menu is nested under, if it's a submenu.
   * @returns {MdMenu | null}
   */
  get parentMenu() {
    return /** @type {MdMenu | null} */ (
      this.parentItem?.closest("md-menu") ?? null
    );
  }

  /**
   * Direct light-DOM children, read off the host directly since children
   * are routed to `seg-${n}` named slots (see `#syncSegments()`), not one
   * default slot `assignedElements()` could read.
   * @returns {Element[]}
   */
  get #slottedChildren() {
    return Array.from(this.children);
  }

  /**
   * Flattens listbox-item-like children (anything implementing
   * `ListboxItemMixin`'s roving-tabindex API, recognized by duck-typing so
   * any future item type works without a `menu.js` change), descending
   * into `md-item-group`/`md-menu-group`/`md-option-group` wrappers.
   *
   * Also resolves through a forwarded `<slot>` — `md-select` forwards its
   * own default slot straight into `<md-menu>`, so `md-menu`'s only real
   * DOM child in that case is the `<slot>` itself.
   * @returns {MdMenuItem[]}
   */
  get #menuItems() {
    /** @type {MdMenuItem[]} */
    const items = [];
    /** @param {Element[]} nodes */
    const collect = (nodes) => {
      for (const node of nodes) {
        if (node instanceof HTMLSlotElement) {
          collect(
            /** @type {Element[]} */ (node.assignedElements({ flatten: true })),
          );
        } else if (
          typeof (/** @type {any} */ (node).getTabIndex) === "function"
        ) {
          items.push(/** @type {MdMenuItem} */ (node));
        } else if (
          node.tagName === "MD-MENU-GROUP" ||
          node.tagName === "MD-ITEM-GROUP" ||
          node.tagName === "MD-OPTION-GROUP"
        ) {
          collect(Array.from(node.children));
        }
      }
    };
    collect(this.#slottedChildren);
    return items;
  }

  /**
   * Stays on the `_`-prefixed convention (not `#private`) — `menu.spec.js`
   * reaches into this directly. See the class doc comment.
   * @returns {MdMenuItem[]}
   */
  get _enabledMenuItems() {
    return this.#menuItems.filter((item) => !item.disabled);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * @param {{ source?: HTMLElement }} [options]
   *   `source` explicitly sets the popover's native invoker (see
   *   `HTMLElement.showPopover({ source })`), overriding the anchor
   *   auto-resolved from `anchorElement`/`for`. Establishing this
   *   relationship makes the browser treat `source` as this menu's
   *   ancestor for native popover stacking/light-dismiss purposes — useful
   *   when opening a menu from something other than its own trigger (e.g.
   *   a different button momentarily driving the same menu).
   */
  async show({ source } = {}) {
    // Only stash `source` if this call will actually drive an open
    // transition — otherwise nothing consumes it and it'd leak into the
    // next real open (`open` already `true` means `updated()` won't fire).
    if (!this.open) {
      this.#pendingSource = source;
    }
    this.#popover.clearPointAnchor();
    this.open = true;
    await this.updateComplete;
    await this.#openPromise;
  }

  /**
   * Opens the menu if closed, closes it if open — mirrors the native
   * `HTMLElement.togglePopover(options)`.
   * @param {{ source?: HTMLElement, force?: boolean }} [options]
   *   `force: true` always opens, `force: false` always closes; omitted,
   *   it flips the current state. `source` is forwarded to `show()`.
   */
  async toggle({ source, force } = {}) {
    const shouldOpen = force ?? !this.open;
    if (shouldOpen) {
      await this.show({ source });
    } else {
      await this.close();
    }
  }

  /** @param {{ returnFocus?: boolean }} [options] */
  async close({ returnFocus = true } = {}) {
    if (!this.open) return;
    this.open = false;
    await this.updateComplete;
    // Focus returns immediately — matching native popover light-dismiss —
    // rather than waiting on `#closePromise` below, so keyboard users
    // aren't stuck waiting out the close animation.
    if (returnFocus) {
      if (this.parentItem) {
        this.parentItem.focusInteractive();
      } else if (this.#popover.anchorEl instanceof HTMLElement) {
        this.#popover.anchorEl.focus();
      }
    }
    await this.#closePromise;
  }

  /**
   * Opens the menu anchored to arbitrary viewport coordinates (context-menu
   * variant) using a floating-ui virtual element.
   * @param {number} x
   * @param {number} y
   */
  openAtPoint(x, y) {
    this.#popover.setPointAnchor(x, y);
    this.open = true;
  }

  /**
   * Sets tabindex=0 on the first item and focuses it. Includes disabled
   * items — APG: "disabled menu items are focusable but cannot be
   * activated," so they still take part in the roving-tabindex sequence.
   */
  focusFirstItem() {
    const items = this.#menuItems;
    if (!items.length) return;
    items.forEach((item, i) => item.setTabIndex(i === 0 ? 0 : -1));
    items[0].focusInteractive();
  }

  /** Sets tabindex=0 on the last item (including disabled) and focuses it. */
  focusLastItem() {
    const items = this.#menuItems;
    if (!items.length) return;
    const last = items.length - 1;
    items.forEach((item, i) => item.setTabIndex(i === last ? 0 : -1));
    items[last].focusInteractive();
  }

  /**
   * Opt-in counterpart to `focusFirstItem()` for consumers (e.g.
   * `md-select`) whose items carry persistent `selected` state — focuses
   * the item with `selected` set, falling back to the first item if none is
   * selected.
   */
  focusSelectedItem() {
    const items = this.#menuItems;
    if (!items.length) return;
    const target = items.find((item) => item.selected) ?? items[0];
    items.forEach((item) => item.setTabIndex(item === target ? 0 : -1));
    target.focusInteractive();
  }

  /** Routes to `focusSelectedItem()` or `focusFirstItem()` per `focusOnOpen`. */
  #focusOnOpen() {
    if (this.focusOnOpen === "selected") {
      this.focusSelectedItem();
    } else {
      this.focusFirstItem();
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    const placementAuthored = this.hasAttribute("placement");

    super.connectedCallback();

    if (!placementAuthored && this.parentItem) {
      this.placement = "right-start";
    }

    this.#syncPositioningMode();

    this.addEventListener("keydown", this.#handleKeydown);
    this.addEventListener("select", this.#onItemSelect);
    this.#syncSegments();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.#handleKeydown);
    this.removeEventListener("select", this.#onItemSelect);
    this.#detachTriggerListeners(this.#popover.anchorEl);
    clearTimeout(this.#hoverTimer);
    clearTimeout(this.#typeaheadTimer);
  }

  /** @param {import("lit").PropertyValues} changed */
  updated(changed) {
    super.updated(changed);

    if (changed.has("menuRole")) {
      this.setAttribute(
        "role",
        this.menuRole === "listbox" ? "listbox" : "menu",
      );
    }

    if (changed.has("trigger") && this.#popover.anchorEl) {
      this.#detachTriggerListeners(this.#popover.anchorEl);
      this.#attachTriggerListeners(this.#popover.anchorEl);
    }

    if (changed.has("positioning") && !this.open) {
      this.#syncPositioningMode();
    }

    if (changed.has("open")) {
      if (this.open) {
        this.#openPromise = this.#handleOpen();
      } else {
        this.#closePromise = this.#handleClose();
      }
    }
  }

  // ── Anchor / trigger wiring ──────────────────────────────────────────────

  /**
   * Called by `PopoverPositionController` whenever the `for`-resolved
   * control changes. Attaches/detaches trigger listeners and
   * `aria-haspopup`/`aria-expanded` — concerns the shared controller
   * doesn't know about.
   *
   * With no `for` attribute, `HTMLForController` falls back to the host's
   * root node (e.g. the context-menu variant, driven via `openAtPoint()`)
   * rather than a real element — trigger wiring is skipped then, since
   * that isn't an `HTMLElement` and listening on the whole document would
   * intercept unrelated events.
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
    control.setAttribute("aria-haspopup", "menu");
    control.setAttribute("aria-expanded", this.open ? "true" : "false");
    this.#syncAccessibleName(control);

    if (this.trigger === "click") {
      control.addEventListener("click", this.#onTriggerClick);
    } else if (this.trigger === "hover") {
      control.addEventListener("click", this.#onTriggerClick);
      control.addEventListener("pointerenter", this.#onTriggerPointerEnter);
      control.addEventListener("pointerleave", this.#onTriggerPointerLeave);
    } else if (this.trigger === "contextmenu") {
      control.addEventListener("contextmenu", this.#onTriggerContextMenu);
    }
  }

  /**
   * Gives the menu role an accessible name via `aria-labelledby` pointing
   * at the trigger (APG requirement), so a screen-reader user landing
   * directly in an open menu doesn't hear an unlabeled "menu". Set on the
   * host, not `.md-menu__list` — `aria-labelledby` IDREFs don't resolve
   * out of a shadow root to a light-DOM element otherwise.
   * @param {HTMLElement} control
   */
  #syncAccessibleName(control) {
    this.setAttribute("aria-labelledby", control.id);
  }

  /** @param {HTMLElement | null} control */
  #detachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;
    control.removeAttribute("aria-haspopup");
    control.removeAttribute("aria-expanded");
    this.removeAttribute("aria-labelledby");
    control.removeEventListener("click", this.#onTriggerClick);
    control.removeEventListener("pointerenter", this.#onTriggerPointerEnter);
    control.removeEventListener("pointerleave", this.#onTriggerPointerLeave);
    control.removeEventListener("contextmenu", this.#onTriggerContextMenu);
  }

  // ── Private event handlers ───────────────────────────────────────────────
  //
  // Declared as arrow-function fields (not `method() {}` + constructor
  // `.bind(this)`) so each has a stable, auto-bound identity from
  // construction — required for add/removeEventListener to match, and
  // because a `#private` *method* can't be `.bind()`-reassigned and can't be
  // handed to `addEventListener` by bare reference (both throw). See
  // `components/tooltip/base-tooltip.js`'s identical rationale.

  /** @param {MouseEvent} event */
  #onTriggerClick = (event) => {
    event.stopPropagation();
    // The dismiss listener excludes clicks on the anchor itself (see
    // `PopoverPositionController`'s `#onDocumentClick`), so this is the only
    // code path that toggles `open` for a trigger click.
    this.#popover.clearPointAnchor();
    if (this.open) {
      this.close();
      return;
    }
    this.open = true;
    this.updateComplete.then(() => this.#focusOnOpen());
  };

  /** @param {MouseEvent} event */
  #onTriggerContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.openAtPoint(event.clientX, event.clientY);
    this.updateComplete.then(() => this.#focusOnOpen());
  };

  #onTriggerPointerEnter = () => {
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(() => {
      this.#popover.clearPointAnchor();
      this.open = true;
    }, HOVER_OPEN_DELAY);
  };

  #onTriggerPointerLeave = () => {
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(() => {
      this.close({ returnFocus: false });
    }, HOVER_CLOSE_DELAY);
  };

  #handleKeydown = (/** @type {KeyboardEvent} */ event) => {
    this.#onKeydown(event);
  };

  // ── Popover open / close orchestration ──────────────────────────────────

  async #handleOpen() {
    this.dispatchEvent(new Event("opening"));
    const source = this.#pendingSource;
    this.#pendingSource = undefined;
    await this.#popover.show({ source });
    if (this.#popover.anchorEl instanceof HTMLElement) {
      this.#popover.anchorEl.setAttribute("aria-expanded", "true");
    }
    this.#initRovingTabindex();
    this.#waitForMotion().then(() => this.dispatchEvent(new Event("opened")));
  }

  async #handleClose() {
    this.dispatchEvent(new Event("closing"));
    this.#popover.hide();
    if (this.#popover.anchorEl instanceof HTMLElement) {
      this.#popover.anchorEl.setAttribute("aria-expanded", "false");
    }
    this.#closeDescendantSubmenus();
    this.#typeaheadBuffer = "";
    clearTimeout(this.#typeaheadTimer);

    this.#waitForMotion().then(() => this.dispatchEvent(new Event("closed")));
  }

  /**
   * Waits for the open/close CSS transition on `:host` to finish, or
   * resolves immediately if none runs (reduced motion, `animation="false"`,
   * etc). The two-frame race is only a bail-out for "nothing will animate";
   * `transitionend`/`transitioncancel` are the real completion signal.
   * @returns {Promise<void>}
   */
  async #waitForMotion() {
    const started = await Promise.race([
      new Promise((resolve) =>
        this.addEventListener("transitionrun", () => resolve(true), {
          once: true,
        }),
      ),
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(false)),
        ),
      ),
    ]);
    if (!started) return;
    await new Promise((resolve) => {
      this.addEventListener("transitionend", resolve, { once: true });
      this.addEventListener("transitioncancel", resolve, { once: true });
    });
  }

  /** Closes any still-open submenus. Defensive fallback for §7 — see menu.spec.js. */
  #closeDescendantSubmenus() {
    for (const item of this.#menuItems) {
      const submenu = item.submenuEl;
      if (submenu?.open) {
        submenu.close({ returnFocus: false });
      }
    }
  }

  #initRovingTabindex() {
    // Disabled items stay in the sequence (see focusFirstItem()) — only
    // activation is blocked, not focusability.
    const items = this.#menuItems;
    if (!items.length) return;
    const alreadyTabbable = items.filter((item) => item.getTabIndex() === 0);
    let target = alreadyTabbable[0] ?? items[0];
    if (this.focusOnOpen === "selected") {
      target = items.find((item) => item.selected) ?? target;
    }
    items.forEach((item) => item.setTabIndex(item === target ? 0 : -1));
  }

  // ── select event re-dispatch ─────────────────────────────────────────────

  /** @param {Event} event */
  #onItemSelect = (event) => {
    if (event.target === this) return;

    const detail =
      /** @type {CustomEvent<{ value: string, item: MdMenuItem }>} */ (event)
        .detail;

    this.dispatchEvent(
      new CustomEvent("select", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );

    if (!detail.item?.keepOpen) {
      this.close({ returnFocus: !this.parentItem });
    }
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────

  /** @param {KeyboardEvent} event */
  #onKeydown(event) {
    // Includes disabled items: ArrowDown/Up/Home/End/typeahead should still
    // land on and announce them (APG — focusable, just not activatable),
    // not skip them as if they didn't exist.
    const items = this.#menuItems;
    const focused = items.find((item) => item.matches(":focus-within"));
    const currentIndex = focused ? items.indexOf(focused) : -1;

    switch (event.key) {
      case "ArrowDown": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this.#focusItem(items, next);
        this.#resetTypeahead();
        return;
      }
      case "ArrowUp": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this.#focusItem(items, prev);
        this.#resetTypeahead();
        return;
      }
      case "Home": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        this.#focusItem(items, 0);
        return;
      }
      case "End": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        this.#focusItem(items, items.length - 1);
        return;
      }
      case "ArrowRight": {
        if (focused?.expandSubmenu()) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      case "Enter":
      case " ": {
        // APG: Enter/Space on a menuitem that owns a submenu opens it and
        // moves focus to its first item — same as ArrowRight. For a plain
        // item, fall through to native <button>/<a> click-from-keypress
        // activation (unhandled here) rather than reimplementing it.
        if (focused?.hasSubmenu) {
          event.preventDefault();
          event.stopPropagation();
          focused.expandSubmenu();
        }
        return;
      }
      case "ArrowLeft": {
        if (this.parentItem) {
          event.preventDefault();
          event.stopPropagation();
          this.close({ returnFocus: true });
        }
        return;
      }
      case "Escape": {
        event.preventDefault();
        event.stopPropagation();
        this.close({ returnFocus: true });
        return;
      }
      default: {
        if (
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          event.stopPropagation();
          this.#handleTypeahead(event.key, items);
        }
      }
    }
  }

  /**
   * @param {MdMenuItem[]} items
   * @param {number} index
   */
  #focusItem(items, index) {
    items.forEach((item, i) => item.setTabIndex(i === index ? 0 : -1));
    items[index].focusInteractive();
  }

  #resetTypeahead() {
    this.#typeaheadBuffer = "";
    clearTimeout(this.#typeaheadTimer);
  }

  /**
   * @param {string} char
   * @param {MdMenuItem[]} items
   */
  #handleTypeahead(char, items) {
    clearTimeout(this.#typeaheadTimer);
    const lowerChar = char.toLowerCase();

    // Repeating the same character cycles through matches one step per
    // keypress (e.g. "S","S","S" -> Settings, Share, Sign out), matching
    // native <select>. Any other character extends a prefix search instead.
    const isRepeatCycle =
      this.#typeaheadBuffer.length > 0 &&
      [...this.#typeaheadBuffer].every((c) => c === lowerChar);

    this.#typeaheadBuffer += lowerChar;
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeaheadBuffer = "";
    }, TYPEAHEAD_RESET_DELAY);

    const searchTerm = isRepeatCycle ? lowerChar : this.#typeaheadBuffer;
    const currentIndex = items.findIndex((item) =>
      item.matches(":focus-within"),
    );
    const startIndex =
      isRepeatCycle && currentIndex >= 0 ? currentIndex + 1 : 0;
    const searchOrder =
      startIndex === 0
        ? items
        : [...items.slice(startIndex), ...items.slice(0, startIndex)];

    const match = searchOrder.find((item) =>
      item.label.toLowerCase().startsWith(searchTerm),
    );
    if (match) {
      this.#focusItem(items, items.indexOf(match));
    }
  }

  // ── Segments (md-item-group-separated groups) ───────────────────────────

  #syncSegments() {
    /** @type {Element[][]} */
    const groups = [[]];
    for (const child of Array.from(this.children)) {
      if (child.tagName === "MD-ITEM-GROUP") {
        if (groups[groups.length - 1].length) {
          groups.push([]);
        }
        groups[groups.length - 1].push(child);
        groups.push([]);
        continue;
      }
      groups[groups.length - 1].push(child);
    }

    const nonEmptyGroups = groups.filter((group) => group.length);
    nonEmptyGroups.forEach((group, index) => {
      group.forEach((el) => {
        el.setAttribute("slot", `seg-${index}`);
      });
    });

    this._segmentCount = Math.max(nonEmptyGroups.length, 1);

    if (this.open) {
      this.updateComplete.then(() => this.#initRovingTabindex());
    }
  }

  render() {
    const segments = Array.from({ length: this._segmentCount }, (_, i) => i);
    return html`
      <div
        class="md-menu__list"
        role=${this.menuRole === "listbox" ? "listbox" : "menu"}
        aria-orientation="vertical"
      >
        ${segments.map(
          (i) => html`
            <div class="md-menu__card" part="surface">
              <md-shadow></md-shadow>
              <div class="md-menu__segment">
                <slot name="seg-${i}"></slot>
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }
}
