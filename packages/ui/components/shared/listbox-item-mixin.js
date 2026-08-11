import { html, nothing } from "lit";

import "../ripple/ripple.js";
import "../icon/icon.js";

/** @import { LitElement } from "lit" */

/**
 * @template {object} [T=object]
 * @typedef {new (...args: any[]) => T} Constructor
 */

/**
 * Shared interactive-row behavior for `md-menu-item` and `md-option`: the
 * `<button>`/`<a href>` render, `md-ripple`, leading/trailing/supporting-text
 * slots, the roving-tabindex API `md-menu` calls, and click/keydown
 * activation (dispatches `select` unless `disabled`).
 *
 * Submenu/hover-intent behavior and typeahead stay `md-menu-item`-only.
 * ARIA role/`aria-selected`/`aria-haspopup`/`aria-expanded` and the
 * trailing-extra/pointerleave render hooks are overridable getters
 * (`_ariaRole`, `_renderTrailingExtra()`, etc.) that default to
 * `md-menu-item`-style no-ops, since `md-option` diverges on all of them.
 * @template {Constructor<LitElement>} T
 * @param {T} superClass
 */
export const ListboxItemMixin = (superClass) => {
  class ListboxItem extends superClass {
    /** @type {import("lit").PropertyDeclarations} */
    static properties = {
      value: { type: String },
      /**
       * When set, the item's interactive element renders as an `<a href>`
       * instead of a `<button>` — a navigation item rather than an action.
       */
      href: { type: String },
      disabled: { type: Boolean, reflect: true },
      selected: { type: Boolean, reflect: true },
      // ── Slot presence state ─────────────────────────────────────────────
      _hasLeading: { state: true },
      _hasSupportingText: { state: true },
      _hasTrailingBadge: { state: true },
      _hasTrailing: { state: true },
    };

    /** @param {any[]} args */
    constructor(...args) {
      super(...args);

      /** @type {string} */
      this.value = "";

      /** @type {string | undefined} */
      this.href = undefined;

      /** @type {boolean} */
      this.disabled = false;

      /** @type {boolean} */
      this.selected = false;

      this._hasLeading = false;
      this._hasSupportingText = false;
      this._hasTrailingBadge = false;
      this._hasTrailing = false;
    }

    /** @returns {HTMLButtonElement | undefined} */
    get _interactiveEl() {
      return /** @type {HTMLButtonElement | undefined} */ (
        this.renderRoot?.querySelector(".md-menu-item__interactive") ??
          undefined
      );
    }

    /**
     * ARIA role of the interactive element. Default `"menuitem"`.
     * Overridden by `md-option` to `"option"`.
     * @returns {string}
     */
    get _ariaRole() {
      return "menuitem";
    }

    /**
     * `aria-selected` value, or `nothing` to omit the attribute entirely.
     * Default omits it (matches `md-menu-item`, which never emits
     * `aria-selected`). Overridden by `md-option`.
     * @returns {string | typeof nothing}
     */
    get _ariaSelected() {
      return nothing;
    }

    /**
     * `aria-haspopup` value. Default `nothing`. Overridden by `md-menu-item`
     * from its own submenu state.
     * @returns {string | typeof nothing}
     */
    get _ariaHaspopup() {
      return nothing;
    }

    /**
     * `aria-expanded` value. Default `nothing`. Overridden by `md-menu-item`
     * from its own submenu state.
     * @returns {string | typeof nothing}
     */
    get _ariaExpanded() {
      return nothing;
    }

    /**
     * Extra content rendered after the trailing/badge zones — e.g.
     * `md-menu-item`'s auto-rendered submenu chevron. Default none.
     * @returns {import("lit").TemplateResult<1> | typeof nothing}
     */
    _renderTrailingExtra() {
      return nothing;
    }

    /**
     * Extra `pointerleave` handling on the interactive element — e.g.
     * `md-menu-item`'s submenu hover-intent close. Default no-op.
     */
    _onInteractivePointerLeave() {}

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

    // ── Event handlers ───────────────────────────────────────────────────────

    /** @param {MouseEvent} event */
    _onClick(event) {
      if (this.disabled) {
        // `<a>` has no native `disabled` — unlike `<button disabled>`, it
        // still fires `click` and would navigate unless stopped here.
        event.preventDefault();
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
     * `<a>` only fires `click` on Enter, not Space — unlike `<button>`,
     * which activates on both. Without this, Space silently does nothing on
     * an `href` item while it activates a `<button>`-based one.
     * @param {KeyboardEvent} event
     */
    _onInteractiveKeydown(event) {
      if (event.key !== " ") return;
      event.preventDefault();
      /** @type {HTMLElement | undefined} */ (this._interactiveEl)?.click();
    }

    /**
     * @param {Event} event
     * @param {(v: boolean) => void} setter
     */
    _onSlotChange(event, setter) {
      const slot = /** @type {HTMLSlotElement} */ (event.target);
      setter(slot.assignedNodes({ flatten: true }).length > 0);
    }

    // ── Render helpers ───────────────────────────────────────────────────────

    _renderLeadingZone() {
      return html`
        <span
          part="leading"
          class="md-menu-item__leading-wrapper ${
            this._hasLeading ? "has-content" : ""
          }"
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
            class="md-menu-item__supporting-text-wrapper ${
              this._hasSupportingText ? "has-content" : ""
            }"
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
          class="md-menu-item__badge-wrapper ${
            this._hasTrailingBadge ? "has-content" : ""
          }"
        >
          <slot
            name="trailing-badge"
            @slotchange=${(/** @type {Event} */ e) =>
              this._onSlotChange(e, (v) => (this._hasTrailingBadge = v))}
          ></slot>
        </span>
        <span
          part="trailing"
          class="md-menu-item__trailing-wrapper ${
            this._hasTrailing ? "has-content" : ""
          }"
        >
          <slot
            name="trailing"
            @slotchange=${(/** @type {Event} */ e) =>
              this._onSlotChange(e, (v) => (this._hasTrailing = v))}
          ></slot>
        </span>
        ${this._renderTrailingExtra()}
      `;
    }

    _renderInteractive() {
      const content = html`<md-ripple for="menu-item"></md-ripple>
        ${this._renderLeadingZone()} ${this._renderTextZone()}
        ${this._renderTrailingZone()}`;

      if (this.href) {
        // `disabled` has no effect on `<a>` — mirror md-card/md-button's
        // href-variant handling: aria-disabled + tabindex=-1 instead, with
        // pointer-events:none in CSS to block clicks.
        return html`
          <a
            id="menu-item"
            class="md-menu-item__interactive"
            part="interactive"
            role=${this._ariaRole}
            href=${this.href}
            tabindex="-1"
            aria-disabled=${this.disabled ? "true" : nothing}
            aria-selected=${this._ariaSelected}
            aria-haspopup=${this._ariaHaspopup}
            aria-expanded=${this._ariaExpanded}
            @click=${this._onClick}
            @keydown=${this._onInteractiveKeydown}
            @pointerleave=${this._onInteractivePointerLeave}
          >
            ${content}
          </a>
        `;
      }

      return html`
        <button
          id="menu-item"
          class="md-menu-item__interactive"
          part="interactive"
          type="button"
          role=${this._ariaRole}
          tabindex="-1"
          aria-disabled=${this.disabled ? "true" : nothing}
          aria-selected=${this._ariaSelected}
          aria-haspopup=${this._ariaHaspopup}
          aria-expanded=${this._ariaExpanded}
          @click=${this._onClick}
          @pointerleave=${this._onInteractivePointerLeave}
        >
          ${content}
        </button>
      `;
    }
  }

  return ListboxItem;
};
