import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";

import { PopoverPositionController } from "../../shared/popover-position-controller.js";

import "../card/card.js";
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
 * Anchors a `popover="manual"` surface (an `<md-card variant="elevated">`)
 * to a `for`-resolved trigger, or to arbitrary viewport coordinates via
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
     * `_resolvedPositioning`.
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

    /**
     * Tracks the in-flight `_handleOpen()` call so `show()` can await the
     * full open sequence, not just the Lit update that kicks it off —
     * otherwise a caller's `focusFirstItem()` right after `show()` could
     * race `_initRovingTabindex()` and get silently overwritten.
     * @type {Promise<void>}
     */
    this._openPromise = Promise.resolve();

    /** Same role as `_openPromise`, for the close path. @type {Promise<void>} */
    this._closePromise = Promise.resolve();

    /** @type {number} */
    this._segmentCount = 1;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._hoverTimer = undefined;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._typeaheadTimer = undefined;

    /** @type {string} */
    this._typeaheadBuffer = "";

    this._popover = new PopoverPositionController(this, {
      // The host itself is the popover surface — see render()/menu.css.
      getSurfaceEl: () => this,
      getPlacement: () => this.placement,
      getOffset: () => ({
        mainAxis: this.offset + this.yOffset,
        crossAxis: this.xOffset,
      }),
      getFlip: () => this.flip,
      getStrategy: () =>
        this._resolvedPositioning === "fixed" ||
        this._resolvedPositioning === "popover"
          ? "fixed"
          : "absolute",
      getUseNativePopover: () => this._resolvedPositioning === "popover",
      getMatchAnchorWidth: () => this.matchAnchorWidth,
      getAnchorOverride: () => this.anchorElement ?? null,
      onAnchorChange: (next, prev) => this._onAnchorChange(next, prev),
      onOpenChange: (isOpen) => {
        if (this.open === isOpen) return;
        this.open = isOpen;
      },
    });

    this._onTriggerClick = this._onTriggerClick.bind(this);
    this._onTriggerContextMenu = this._onTriggerContextMenu.bind(this);
    this._onTriggerPointerEnter = this._onTriggerPointerEnter.bind(this);
    this._onTriggerPointerLeave = this._onTriggerPointerLeave.bind(this);
    this._onItemSelect = this._onItemSelect.bind(this);

    this._handleKeydown = (/** @type {KeyboardEvent} */ event) => {
      this._onKeydown(event);
    };

    // Recomputes segments when consumers mutate menu content after first render.
    this._childrenObserver = new MutationController(this, {
      config: { childList: true },
    });
    this._childrenObserver.callback = () => {
      this._syncSegments();
    };
  }

  /**
   * `positioning`, with the `"popover"` → `"fixed"` fallback applied when
   * the browser doesn't support the Popover API. Everything that cares how
   * the surface is actually positioned/shown reads this instead.
   * @returns {"absolute" | "fixed" | "document" | "popover"}
   */
  get _resolvedPositioning() {
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
   * `_resolvedPositioning`. Called on connect and whenever `positioning`
   * changes. Always `"manual"`, never `"auto"` — dismissal is handled by
   * `PopoverPositionController` regardless of positioning mode.
   */
  _syncPositioningMode() {
    if (this._resolvedPositioning === "popover") {
      this.setAttribute("popover", "manual");
    } else {
      this.removeAttribute("popover");
    }

    // "document" mode: hoist to a direct child of <body> so there's no
    // closer positioned ancestor. Safe from connectedCallback — moving an
    // already-connected node doesn't re-trigger it.
    if (
      this._resolvedPositioning === "document" &&
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
   * are routed to `seg-${n}` named slots (see `_syncSegments()`), not one
   * default slot `assignedElements()` could read.
   * @returns {Element[]}
   */
  get _slottedChildren() {
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
  get _menuItems() {
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
    collect(this._slottedChildren);
    return items;
  }

  /** @returns {MdMenuItem[]} */
  get _enabledMenuItems() {
    return this._menuItems.filter((item) => !item.disabled);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async show() {
    this._popover.clearPointAnchor();
    this.open = true;
    await this.updateComplete;
    await this._openPromise;
  }

  /** @param {{ returnFocus?: boolean }} [options] */
  async close({ returnFocus = true } = {}) {
    if (!this.open) return;
    this.open = false;
    await this.updateComplete;
    // Focus returns immediately — matching native popover light-dismiss —
    // rather than waiting on `_closePromise` below, so keyboard users
    // aren't stuck waiting out the close animation.
    if (returnFocus) {
      if (this.parentItem) {
        this.parentItem.focusInteractive();
      } else if (this._popover.anchorEl instanceof HTMLElement) {
        this._popover.anchorEl.focus();
      }
    }
    await this._closePromise;
  }

  /**
   * Opens the menu anchored to arbitrary viewport coordinates (context-menu
   * variant) using a floating-ui virtual element.
   * @param {number} x
   * @param {number} y
   */
  openAtPoint(x, y) {
    this._popover.setPointAnchor(x, y);
    this.open = true;
  }

  /**
   * Sets tabindex=0 on the first item and focuses it. Includes disabled
   * items — APG: "disabled menu items are focusable but cannot be
   * activated," so they still take part in the roving-tabindex sequence.
   */
  focusFirstItem() {
    const items = this._menuItems;
    if (!items.length) return;
    items.forEach((item, i) => item.setTabIndex(i === 0 ? 0 : -1));
    items[0].focusInteractive();
  }

  /** Sets tabindex=0 on the last item (including disabled) and focuses it. */
  focusLastItem() {
    const items = this._menuItems;
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
    const items = this._menuItems;
    if (!items.length) return;
    const target = items.find((item) => item.selected) ?? items[0];
    items.forEach((item) => item.setTabIndex(item === target ? 0 : -1));
    target.focusInteractive();
  }

  /** Routes to `focusSelectedItem()` or `focusFirstItem()` per `focusOnOpen`. */
  _focusOnOpen() {
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

    this._syncPositioningMode();

    this.addEventListener("keydown", this._handleKeydown);
    this.addEventListener("select", this._onItemSelect);
    this._syncSegments();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
    this.removeEventListener("select", this._onItemSelect);
    this._detachTriggerListeners(this._popover.anchorEl);
    clearTimeout(this._hoverTimer);
    clearTimeout(this._typeaheadTimer);
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

    if (changed.has("trigger") && this._popover.anchorEl) {
      this._detachTriggerListeners(this._popover.anchorEl);
      this._attachTriggerListeners(this._popover.anchorEl);
    }

    if (changed.has("positioning") && !this.open) {
      this._syncPositioningMode();
    }

    if (changed.has("open")) {
      if (this.open) {
        this._openPromise = this._handleOpen();
      } else {
        this._closePromise = this._handleClose();
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
  _onAnchorChange(next, prev) {
    this._detachTriggerListeners(prev);
    this._attachTriggerListeners(next);
  }

  /** @param {HTMLElement | null} control */
  _attachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;
    control.setAttribute("aria-haspopup", "menu");
    control.setAttribute("aria-expanded", this.open ? "true" : "false");
    this._syncAccessibleName(control);

    if (this.trigger === "click") {
      control.addEventListener("click", this._onTriggerClick);
    } else if (this.trigger === "hover") {
      control.addEventListener("click", this._onTriggerClick);
      control.addEventListener("pointerenter", this._onTriggerPointerEnter);
      control.addEventListener("pointerleave", this._onTriggerPointerLeave);
    } else if (this.trigger === "contextmenu") {
      control.addEventListener("contextmenu", this._onTriggerContextMenu);
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
  _syncAccessibleName(control) {
    this.setAttribute("aria-labelledby", control.id);
  }

  /** @param {HTMLElement | null} control */
  _detachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;
    control.removeAttribute("aria-haspopup");
    control.removeAttribute("aria-expanded");
    this.removeAttribute("aria-labelledby");
    control.removeEventListener("click", this._onTriggerClick);
    control.removeEventListener("pointerenter", this._onTriggerPointerEnter);
    control.removeEventListener("pointerleave", this._onTriggerPointerLeave);
    control.removeEventListener("contextmenu", this._onTriggerContextMenu);
  }

  /** @param {MouseEvent} event */
  _onTriggerClick(event) {
    event.stopPropagation();
    // The dismiss listener excludes clicks on the anchor itself (see
    // `PopoverPositionController._onDocumentClick`), so this is the only
    // code path that toggles `open` for a trigger click.
    this._popover.clearPointAnchor();
    if (this.open) {
      this.close();
      return;
    }
    this.open = true;
    this.updateComplete.then(() => this._focusOnOpen());
  }

  /** @param {MouseEvent} event */
  _onTriggerContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    this.openAtPoint(event.clientX, event.clientY);
    this.updateComplete.then(() => this._focusOnOpen());
  }

  _onTriggerPointerEnter() {
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(() => {
      this._popover.clearPointAnchor();
      this.open = true;
    }, HOVER_OPEN_DELAY);
  }

  _onTriggerPointerLeave() {
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(() => {
      this.close({ returnFocus: false });
    }, HOVER_CLOSE_DELAY);
  }

  // ── Popover open / close orchestration ──────────────────────────────────

  async _handleOpen() {
    this.dispatchEvent(new Event("opening"));
    await this._popover.show();
    if (this._popover.anchorEl instanceof HTMLElement) {
      this._popover.anchorEl.setAttribute("aria-expanded", "true");
    }
    this._initRovingTabindex();
    this._waitForMotion().then(() => this.dispatchEvent(new Event("opened")));
  }

  async _handleClose() {
    this.dispatchEvent(new Event("closing"));
    this._popover.hide();
    if (this._popover.anchorEl instanceof HTMLElement) {
      this._popover.anchorEl.setAttribute("aria-expanded", "false");
    }
    this._closeDescendantSubmenus();
    this._typeaheadBuffer = "";
    clearTimeout(this._typeaheadTimer);

    this._waitForMotion().then(() => this.dispatchEvent(new Event("closed")));
  }

  /**
   * Waits for the open/close CSS transition on `:host` to finish, or
   * resolves immediately if none runs (reduced motion, `animation="false"`,
   * etc). The two-frame race is only a bail-out for "nothing will animate";
   * `transitionend`/`transitioncancel` are the real completion signal.
   * @returns {Promise<void>}
   */
  async _waitForMotion() {
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
  _closeDescendantSubmenus() {
    for (const item of this._menuItems) {
      const submenu = item.submenuEl;
      if (submenu?.open) {
        submenu.close({ returnFocus: false });
      }
    }
  }

  _initRovingTabindex() {
    // Disabled items stay in the sequence (see focusFirstItem()) — only
    // activation is blocked, not focusability.
    const items = this._menuItems;
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
  _onItemSelect(event) {
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
  }

  // ── Keyboard navigation ──────────────────────────────────────────────────

  /** @param {KeyboardEvent} event */
  _onKeydown(event) {
    // Includes disabled items: ArrowDown/Up/Home/End/typeahead should still
    // land on and announce them (APG — focusable, just not activatable),
    // not skip them as if they didn't exist.
    const items = this._menuItems;
    const focused = items.find((item) => item.matches(":focus-within"));
    const currentIndex = focused ? items.indexOf(focused) : -1;

    switch (event.key) {
      case "ArrowDown": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this._focusItem(items, next);
        this._resetTypeahead();
        return;
      }
      case "ArrowUp": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this._focusItem(items, prev);
        this._resetTypeahead();
        return;
      }
      case "Home": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        this._focusItem(items, 0);
        return;
      }
      case "End": {
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        this._focusItem(items, items.length - 1);
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
          this._handleTypeahead(event.key, items);
        }
      }
    }
  }

  /**
   * @param {MdMenuItem[]} items
   * @param {number} index
   */
  _focusItem(items, index) {
    items.forEach((item, i) => item.setTabIndex(i === index ? 0 : -1));
    items[index].focusInteractive();
  }

  _resetTypeahead() {
    this._typeaheadBuffer = "";
    clearTimeout(this._typeaheadTimer);
  }

  /**
   * @param {string} char
   * @param {MdMenuItem[]} items
   */
  _handleTypeahead(char, items) {
    clearTimeout(this._typeaheadTimer);
    const lowerChar = char.toLowerCase();

    // Repeating the same character cycles through matches one step per
    // keypress (e.g. "S","S","S" -> Settings, Share, Sign out), matching
    // native <select>. Any other character extends a prefix search instead.
    const isRepeatCycle =
      this._typeaheadBuffer.length > 0 &&
      [...this._typeaheadBuffer].every((c) => c === lowerChar);

    this._typeaheadBuffer += lowerChar;
    this._typeaheadTimer = setTimeout(() => {
      this._typeaheadBuffer = "";
    }, TYPEAHEAD_RESET_DELAY);

    const searchTerm = isRepeatCycle ? lowerChar : this._typeaheadBuffer;
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
      this._focusItem(items, items.indexOf(match));
    }
  }

  // ── Segments (md-item-group-separated groups) ───────────────────────────

  _syncSegments() {
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
      this.updateComplete.then(() => this._initRovingTabindex());
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
            <md-card
              variant="elevated"
              class="md-menu__card"
              exportparts="surface"
            >
              <div class="md-menu__segment">
                <slot name="seg-${i}"></slot>
              </div>
            </md-card>
          `,
        )}
      </div>
    `;
  }
}
