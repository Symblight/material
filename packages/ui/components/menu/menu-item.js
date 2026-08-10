import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import chevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?raw";

import "../ripple/ripple.js";
import "../icon/icon.js";

import styles from "./menu-item.css?inline";

/** @import { MdMenu } from "./menu.js" */

const HOVER_CLOSE_DELAY = 180;

/**
 * Tracks which submenu elements already have this module's hover-intent
 * listeners attached, so repeated `slotchange` events (e.g. the submenu
 * re-rendering) don't accumulate duplicate listeners.
 * @type {WeakSet<Element>}
 */
const submenusWithHoverListeners = new WeakSet();

/**
 * @tag md-menu-item
 * @summary Material Design 3 menu item.
 *
 * Renders a single interactive row inside `<md-menu>`. Dispatches `select`
 * on activation (click / Enter / Space) unless `disabled`.
 *
 * Slots:
 *  - *(default)* — item label text
 *  - `leading` — icon or checkmark
 *  - `supporting-text` — optional secondary line under the label
 *  - `trailing-badge` — optional small pill (e.g. "New")
 *  - `trailing` — optional plain text, e.g. a keyboard shortcut (`⌘C`)
 *  - `submenu` — a nested `<md-menu>`; presence of assigned content
 *    auto-renders a trailing chevron icon
 */
@customElement("md-menu-item")
export class MdMenuItem extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    keepOpen: { type: Boolean, reflect: true, attribute: "keep-open" },
    /**
     * Sets the behavior/ARIA role of the item. `"menuitem"` (default) is
     * the generic action-menu row; `"option"` is for a consumer using
     * `md-menu` as a listbox-style popover (e.g. `md-select`'s menu mode)
     * — it renders `role="option"` and `aria-selected` instead of
     * `role="menuitem"`. Purely a rendering/ARIA concern: roving
     * tabindex, typeahead, and `select`-event dispatch are unaffected.
     */
    type: { type: String, reflect: true },
    // ── Slot presence state ─────────────────────────────────────────────
    _hasLeading: { state: true },
    _hasSupportingText: { state: true },
    _hasTrailingBadge: { state: true },
    _hasTrailing: { state: true },
    _hasSubmenu: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {string} */
    this.value = "";

    /** @type {boolean} */
    this.disabled = false;

    /** @type {boolean} */
    this.selected = false;

    /** @type {boolean} */
    this.keepOpen = false;

    /** @type {"menuitem" | "option"} */
    this.type = "menuitem";

    this._hasLeading = false;
    this._hasSupportingText = false;
    this._hasTrailingBadge = false;
    this._hasTrailing = false;
    this._hasSubmenu = false;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._hoverTimer = undefined;
  }

  /** @returns {HTMLButtonElement | undefined} */
  get _interactiveEl() {
    return /** @type {HTMLButtonElement | undefined} */ (
      this.renderRoot?.querySelector(".md-menu-item__interactive") ?? undefined
    );
  }

  /** @returns {boolean} */
  get hasSubmenu() {
    return this._hasSubmenu;
  }

  /** @returns {MdMenu | undefined} */
  get submenuEl() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector('slot[name="submenu"]')
    );
    return /** @type {MdMenu | undefined} */ (
      slot
        ?.assignedElements({ flatten: true })
        .find((el) => el.tagName === "MD-MENU") ?? undefined
    );
  }

  /** The item's default-slot label text, used for typeahead matching. */
  get label() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    if (!slot) return this.textContent?.trim() ?? "";
    return slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
  }

  // ── Roving tabindex API (called by md-menu) ─────────────────────────────

  getTabIndex() {
    return this._interactiveEl
      ? Number(this._interactiveEl.getAttribute("tabindex") ?? "0")
      : 0;
  }

  /** @param {number} value */
  setTabIndex(value) {
    this._interactiveEl?.setAttribute("tabindex", String(value));
  }

  focusInteractive() {
    this._interactiveEl?.focus();
  }

  /**
   * Opens this item's submenu (if any) and optionally focuses its first item.
   * Called by the parent `md-menu` in response to ArrowRight.
   * @returns {boolean} whether a submenu was opened
   */
  expandSubmenu() {
    if (!this._hasSubmenu) return false;
    this._openSubmenu({ focusFirst: true });
    return true;
  }

  /**
   * @param {{ focusFirst?: boolean }} [options]
   */
  _openSubmenu({ focusFirst = false } = {}) {
    const submenu = this.submenuEl;
    if (!submenu) return;
    clearTimeout(this._hoverTimer);
    submenu.anchorElement = this._interactiveEl ?? this;
    if (!submenu.open) {
      submenu.open = true;
    }
    if (focusFirst) {
      submenu.updateComplete.then(() => submenu.focusFirstItem());
    }
  }

  /**
   * @param {{ returnFocus?: boolean }} [options]
   */
  _closeSubmenu({ returnFocus = false } = {}) {
    const submenu = this.submenuEl;
    if (!submenu || !submenu.open) return;
    clearTimeout(this._hoverTimer);
    submenu.close({ returnFocus: false });
    if (returnFocus) this.focusInteractive();
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  /** @param {MouseEvent} event */
  _onClick(event) {
    if (this.disabled) return;
    if (this._hasSubmenu) {
      event.stopPropagation();
      const submenu = this.submenuEl;
      if (submenu?.open) {
        this._closeSubmenu();
      } else {
        this._openSubmenu({ focusFirst: false });
      }
      return;
    }
    this.dispatchEvent(
      new CustomEvent("select", {
        detail: { value: this.value, item: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Submenus open on click (or `ArrowRight`) only, not on hover — but
   * hovering away from an already-open submenu's parent item still closes
   * it after a short delay (cancelled if the pointer moves into the
   * submenu itself, see `_onSubmenuSlotChange`), so it doesn't linger once
   * the user has moved on to a different item.
   */
  _onPointerLeave() {
    if (!this._hasSubmenu) return;
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(
      () => this._closeSubmenu(),
      HOVER_CLOSE_DELAY,
    );
  }

  /** @param {Event} event */
  _onSubmenuSlotChange(event) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    this._hasSubmenu = slot.assignedElements({ flatten: true }).length > 0;

    const submenu = this.submenuEl;
    if (submenu && !submenusWithHoverListeners.has(submenu)) {
      submenusWithHoverListeners.add(submenu);

      // Default placement (beside the parent item, not below it) is owned
      // by `md-menu` itself — see `connectedCallback()` in menu.js.

      submenu.addEventListener("pointerenter", () =>
        clearTimeout(this._hoverTimer),
      );
      submenu.addEventListener("pointerleave", () => {
        clearTimeout(this._hoverTimer);
        this._hoverTimer = setTimeout(
          () => this._closeSubmenu(),
          HOVER_CLOSE_DELAY,
        );
      });
    }
  }

  /**
   * @param {Event} event
   * @param {(v: boolean) => void} setter
   */
  _onSlotChange(event, setter) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    setter(slot.assignedNodes({ flatten: true }).length > 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._hoverTimer);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  _renderLeadingZone() {
    return html`
      <span
        part="leading"
        class="md-menu-item__leading-wrapper ${classMap({
          "has-content": this._hasLeading,
        })}"
      >
        <slot
          name="leading"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasLeading = v))}
        ></slot>
      </span>
    `;
  }

  _renderTextZone() {
    return html`
      <span class="md-menu-item__text">
        <span part="label" class="md-menu-item__label"><slot></slot></span>
        <span
          class="md-menu-item__supporting-text-wrapper ${classMap({
            "has-content": this._hasSupportingText,
          })}"
        >
          <span part="supporting-text" class="md-menu-item__supporting-text">
            <slot
              name="supporting-text"
              @slotchange=${(/** @type {Event} */ e) =>
                this._onSlotChange(e, (v) => (this._hasSupportingText = v))}
            ></slot>
          </span>
        </span>
      </span>
    `;
  }

  _renderTrailingZone() {
    return html`
      <span
        part="trailing-badge"
        class="md-menu-item__badge-wrapper ${classMap({
          "has-content": this._hasTrailingBadge,
        })}"
      >
        <slot
          name="trailing-badge"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasTrailingBadge = v))}
        ></slot>
      </span>
      <span
        part="trailing"
        class="md-menu-item__trailing-wrapper ${classMap({
          "has-content": this._hasTrailing,
        })}"
      >
        <slot
          name="trailing"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasTrailing = v))}
        ></slot>
      </span>
      ${
        this._hasSubmenu
          ? html`<md-icon part="icon" class="md-menu-item__icon-wrapper">
              ${unsafeSVG(chevronRight)}
            </md-icon>`
          : nothing
      }
      <slot
        name="submenu"
        @slotchange=${(/** @type {Event} */ e) => this._onSubmenuSlotChange(e)}
      ></slot>
    `;
  }

  render() {
    return html`
      <button
        id="menu-item"
        class="md-menu-item__interactive"
        part="interactive"
        type="button"
        role=${this.type === "option" ? "option" : "menuitem"}
        tabindex="-1"
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled ? "true" : nothing}
        aria-selected=${this.type === "option" ? String(this.selected) : nothing}
        @click=${this._onClick}
        @pointerleave=${this._onPointerLeave}
      >
        <md-ripple for="menu-item"></md-ripple>
        ${this._renderLeadingZone()} ${this._renderTextZone()}
        ${this._renderTrailingZone()}
      </button>
    `;
  }
}
