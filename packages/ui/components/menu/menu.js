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

const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 150;
const TYPEAHEAD_RESET_DELAY = 500;

/**
 * @tag md-menu
 * @summary Material Design 3 menu.
 *
 * Anchors a `popover="auto"` surface (rendered via `<md-card variant="elevated">`)
 * to a trigger element resolved via the `for` attribute, or to arbitrary
 * viewport coordinates via `openAtPoint()` for the context-menu variant.
 * Positioning, anchor resolution, and imperative `showPopover()`/
 * `hidePopover()` are delegated to `PopoverPositionController`
 * (`shared/popover-position-controller.js`) — a reusable primitive shared
 * with any future `popover`-backed component (e.g. a tooltip) that needs
 * the same floating-ui-driven anchor/position/show-hide behavior without
 * any menu-specific concepts. `md-menu` itself only owns menu-specific
 * concerns: trigger wiring (click/hover/contextmenu +
 * `aria-haspopup`/`aria-expanded`), roving tabindex, typeahead, submenu
 * chevron rendering, and `select` event dispatch.
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
    flip: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
    trigger: { type: String, reflect: true },
    /**
     * Forces the surface to be exactly as wide as its anchor (e.g.
     * `md-select`'s menu-mode popover matching the trigger's width) instead
     * of sizing to its own content.
     */
    matchAnchorWidth: {
      type: Boolean,
      reflect: true,
      attribute: "match-anchor-width",
    },
    /**
     * ARIA role of the `.md-menu__list` container. `"menu"` (default) is
     * the generic action-menu; `"listbox"` is for a consumer using this
     * menu as a listbox-style popover (e.g. `md-select`'s menu mode —
     * paired with `md-menu-item[type="option"]`). Purely an ARIA concern;
     * roving tabindex/typeahead/`select`-event dispatch are unaffected.
     */
    menuRole: { type: String, reflect: true, attribute: "menu-role" },
    /**
     * Which item receives focus when the menu opens via its trigger
     * (click, contextmenu, or a consumer's own keyboard-driven open).
     * `"first"` (default) matches existing generic-menu behavior;
     * `"selected"` opts into focusing the enabled item with `selected`
     * set instead (falling back to the first item), matching how a native
     * `<select>` opens to its current value — see `focusSelectedItem()`.
     */
    focusOnOpen: { type: String, reflect: true, attribute: "focus-on-open" },
    /**
     * Overrides the floating-ui reference element. Set imperatively by a
     * parent `md-menu-item` when this menu is used as a `submenu`.
     */
    anchorElement: { attribute: false },
    /**
     * Number of `.md-menu__card` segments to render — one per top-level
     * `md-item-group`, plus one for each run of non-grouped children. See
     * `_syncSegments()`.
     */
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

    /** @type {boolean} */
    this.flip = true;

    /** @type {MenuVariant} */
    this.variant = "standard";

    /** @type {MenuTrigger} */
    this.trigger = "click";

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
     * *full* open sequence (popover positioning + `_initRovingTabindex()`),
     * not just the Lit update that kicks it off — `updated()` invokes
     * `_handleOpen()` without awaiting it, so without this a caller doing
     * `await menu.show()` then an explicit `focusFirstItem()`/
     * `focusLastItem()` could race `_initRovingTabindex()` and have its
     * choice of focus target silently overwritten.
     * @type {Promise<void>}
     */
    this._openPromise = Promise.resolve();

    /** @type {number} */
    this._segmentCount = 1;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._hoverTimer = undefined;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._typeaheadTimer = undefined;

    /** @type {string} */
    this._typeaheadBuffer = "";

    /**
     * Native popover light-dismiss runs on `pointerdown`, which fires
     * *before* the trigger's own `click` handler — so a click on an
     * already-open menu's trigger has already been light-dismissed by the
     * time `_onTriggerClick` runs, and would otherwise be misread as
     * "currently closed" and immediately reopen it. This flag, set for one
     * tick whenever a close is native (not requested via `close()`),
     * suppresses that reopen — matching native `popovertarget` toggle-button
     * semantics (click-to-close, not close-then-reopen flicker).
     * @type {boolean}
     */
    this._justDismissed = false;

    // Owns anchor resolution, floating-ui positioning, autoUpdate, and
    // imperative showPopover()/hidePopover() — see file header docs.
    this._popover = new PopoverPositionController(this, {
      // The host itself is the popover surface — see render()/menu.css.
      getSurfaceEl: () => this,
      getPlacement: () => this.placement,
      getOffset: () => this.offset,
      getFlip: () => this.flip,
      getMatchAnchorWidth: () => this.matchAnchorWidth,
      getAnchorOverride: () => this.anchorElement ?? null,
      onAnchorChange: (next, prev) => this._onAnchorChange(next, prev),
      onOpenChange: (isOpen) => {
        if (this.open === isOpen) return;
        if (!isOpen) {
          this._justDismissed = true;
          setTimeout(() => {
            this._justDismissed = false;
          }, 0);
        }
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

    // Tracks additions/removals of direct light-DOM children (menu items,
    // `md-menu-group`/`md-item-group` wrappers) so segments can be
    // recomputed when consumers mutate the menu's content after first
    // render.
    this._childrenObserver = new MutationController(this, {
      config: { childList: true },
    });
    this._childrenObserver.callback = () => {
      this._syncSegments();
    };
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
   * Direct light-DOM children. Read directly off the host rather than via
   * `assignedElements()` because children are routed to one of several
   * `seg-${n}` named slots (see `_syncSegments()`), not a single default
   * slot.
   * @returns {Element[]}
   */
  get _slottedChildren() {
    return Array.from(this.children);
  }

  /**
   * Flattens `md-menu-item` children, descending into `md-item-group`
   * (visual/segment grouping) and `md-menu-group` ("Label text" header
   * grouping) wrappers.
   * @returns {MdMenuItem[]}
   */
  get _menuItems() {
    /** @type {MdMenuItem[]} */
    const items = [];
    /** @param {Element[]} nodes */
    const collect = (nodes) => {
      for (const node of nodes) {
        if (node.tagName === "MD-MENU-ITEM") {
          items.push(/** @type {MdMenuItem} */ (node));
        } else if (
          node.tagName === "MD-MENU-GROUP" ||
          node.tagName === "MD-ITEM-GROUP"
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
    if (!returnFocus) return;
    if (this.parentItem) {
      this.parentItem.focusInteractive();
    } else if (this._popover.anchorEl instanceof HTMLElement) {
      this._popover.anchorEl.focus();
    }
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

  /** Sets tabindex=0 on the first enabled item and focuses it. */
  focusFirstItem() {
    const items = this._enabledMenuItems;
    if (!items.length) return;
    items.forEach((item, i) => item.setTabIndex(i === 0 ? 0 : -1));
    items[0].focusInteractive();
  }

  /** Sets tabindex=0 on the last enabled item and focuses it. */
  focusLastItem() {
    const items = this._enabledMenuItems;
    if (!items.length) return;
    const last = items.length - 1;
    items.forEach((item, i) => item.setTabIndex(i === last ? 0 : -1));
    items[last].focusInteractive();
  }

  /**
   * Opt-in counterpart to `focusFirstItem()` for consumers (e.g.
   * `md-select`) whose items carry persistent `selected` state — focuses
   * the enabled item with `selected` set, falling back to the first
   * enabled item if none is selected.
   */
  focusSelectedItem() {
    const items = this._enabledMenuItems;
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
    // Read BEFORE super.connectedCallback() schedules Lit's own first
    // update: `placement` is a `reflect: true` property with a constructor
    // default, so by the time that update runs, Lit will have written
    // "bottom-start" onto the attribute regardless of whether the author
    // set one — checking `hasAttribute` any later can no longer tell an
    // authored value apart from our own default.
    const placementAuthored = this.hasAttribute("placement");

    super.connectedCallback();

    // The host itself is the popover surface (see render()/menu.css) —
    // always "auto" for native top-layer rendering + light-dismiss.
    this.setAttribute("popover", "auto");

    // Submenus default to opening beside their parent item, not below it —
    // unless the author explicitly set a placement.
    if (!placementAuthored && this.parentItem) {
      this.placement = "right-start";
    }

    this.addEventListener("keydown", this._handleKeydown);
    this.addEventListener("select", this._onItemSelect);
    this._syncSegments();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
    this.removeEventListener("select", this._onItemSelect);
    this._detachTriggerListeners(this._popover.anchorEl);
    // Positioning/autoUpdate/toggle-listener teardown is handled by
    // PopoverPositionController's own hostDisconnected().
    clearTimeout(this._hoverTimer);
    clearTimeout(this._typeaheadTimer);
  }

  /** @param {import("lit").PropertyValues} changed */
  updated(changed) {
    super.updated(changed);

    if (changed.has("menuRole")) {
      // `aria-controls`/similar references (e.g. `md-select`'s trigger
      // button pointing at this element by id) resolve against the HOST's
      // own accessible role — `.md-menu__list` having `role="listbox"`
      // doesn't propagate that up to a shadow-DOM-encapsulated host with no
      // role of its own, so it needs setting here too, not just in render().
      this.setAttribute(
        "role",
        this.menuRole === "listbox" ? "listbox" : "menu",
      );
    }

    if (changed.has("trigger") && this._popover.anchorEl) {
      this._detachTriggerListeners(this._popover.anchorEl);
      this._attachTriggerListeners(this._popover.anchorEl);
    }

    if (changed.has("open")) {
      if (this.open) {
        this._openPromise = this._handleOpen();
      } else {
        this._handleClose();
      }
    }
  }

  // ── Anchor / trigger wiring ──────────────────────────────────────────────

  /**
   * Called by `PopoverPositionController` whenever the `for`-resolved
   * control element changes. Attaches/detaches this menu's own trigger
   * listeners (click/hover/contextmenu) and `aria-haspopup`/`aria-expanded`
   * — concerns the shared controller intentionally knows nothing about.
   *
   * When no `for` attribute is set, `HTMLForController` falls back to the
   * host's root node (the `Document` or an ancestor `ShadowRoot`) rather
   * than a real anchor element — e.g. the context-menu variant (AC §6),
   * which is driven entirely via `openAtPoint()`. Trigger wiring is skipped
   * in that case: it isn't a real `HTMLElement` (no `setAttribute`), and
   * attaching a click/contextmenu listener to the whole document would
   * silently intercept unrelated events anywhere on the page.
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

  /** @param {HTMLElement | null} control */
  _detachTriggerListeners(control) {
    if (!(control instanceof HTMLElement)) return;
    control.removeAttribute("aria-haspopup");
    control.removeAttribute("aria-expanded");
    control.removeEventListener("click", this._onTriggerClick);
    control.removeEventListener("pointerenter", this._onTriggerPointerEnter);
    control.removeEventListener("pointerleave", this._onTriggerPointerLeave);
    control.removeEventListener("contextmenu", this._onTriggerContextMenu);
  }

  /** @param {MouseEvent} event */
  _onTriggerClick(event) {
    event.stopPropagation();
    if (this._justDismissed) {
      // Light-dismiss already closed the menu for this same interaction —
      // treat this click as the dismiss, not a request to reopen.
      this._justDismissed = false;
      return;
    }
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
    await this._popover.show();
    if (this._popover.anchorEl instanceof HTMLElement) {
      this._popover.anchorEl.setAttribute("aria-expanded", "true");
    }
    this._initRovingTabindex();
  }

  _handleClose() {
    this._popover.hide();
    if (this._popover.anchorEl instanceof HTMLElement) {
      this._popover.anchorEl.setAttribute("aria-expanded", "false");
    }
    this._closeDescendantSubmenus();
    this._typeaheadBuffer = "";
    clearTimeout(this._typeaheadTimer);
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
    const items = this._enabledMenuItems;
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
    const items = this._enabledMenuItems;
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
      case "Tab": {
        // Let focus leave the menu naturally; native popover light-dismiss
        // will close it.
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
    this._typeaheadBuffer += char.toLowerCase();
    this._typeaheadTimer = setTimeout(() => {
      this._typeaheadBuffer = "";
    }, TYPEAHEAD_RESET_DELAY);

    const match = items.find((item) =>
      item.label.toLowerCase().startsWith(this._typeaheadBuffer),
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
