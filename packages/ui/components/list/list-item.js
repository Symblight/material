import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../ripple/ripple.js";

import styles from "./list-item.css?inline";

/**
 * @tag md-list-item
 * @summary Material Design 3 list item.
 *
 * Non-interactive by default — renders a static `<li>` layout.
 *
 * Set `button` to wrap content in a `<button>` with ripple + focus ring.
 * Set `href` to wrap content in an `<a>` with ripple + focus ring.
 *
 * Slots:
 *  - *(default)* — headline / label text
 *  - `overline` — small metadata text above label
 *  - `supporting-text` — secondary text below label
 *  - `leading` — any leading content (icon, avatar, media, selection control)
 *  - `trailing` — any trailing content (icon, text, selection control)
 */
@customElement("md-list-item")
export class MdListItem extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Renders an inner `<button>` with ripple and focus ring. */
    button: { type: Boolean, reflect: true },
    /**
     * When set, renders an inner `<a href="...">` with ripple and focus ring.
     * Takes precedence over `button` if both are set.
     */
    href: { type: String, reflect: true },
    // ── Slot presence state ─────────────────────────────────────────────────
    _hasOverline: { state: true },
    _hasSupportingText: { state: true },
    _hasLeading: { state: true },
    _hasTrailing: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {boolean} */
    this.button = false;

    /** @type {string | undefined} */
    this.href = undefined;

    this._hasOverline = false;
    this._hasSupportingText = false;
    this._hasLeading = false;
    this._hasTrailing = false;
  }

  /** @returns {HTMLButtonElement | HTMLAnchorElement | undefined} */
  get _interactiveEl() {
    return /** @type {HTMLButtonElement | HTMLAnchorElement | undefined} */ (
      this.renderRoot?.querySelector(".md-list-item__interactive") ?? undefined
    );
  }

  // ── Slot change helpers ─────────────────────────────────────────────────

  /**
   * @param {Event} event
   * @param {(v: boolean) => void} setter
   */
  _onSlotChange(event, setter) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    setter(slot.assignedNodes({ flatten: true }).length > 0);
  }

  // ── Roving tabindex API (called by md-list) ─────────────────────────────

  /** Returns the tabindex of the interactive inner element. */
  getTabIndex() {
    return this._interactiveEl
      ? Number(this._interactiveEl.getAttribute("tabindex") ?? "0")
      : 0;
  }

  /**
   * Sets the tabindex of the interactive inner element.
   * @param {number} value
   */
  setTabIndex(value) {
    if (this._interactiveEl) {
      this._interactiveEl.setAttribute("tabindex", String(value));
    }
  }

  /** Focuses the interactive inner element (button or a). */
  focusInteractive() {
    this._interactiveEl?.focus();
  }

  // ── Render helpers ──────────────────────────────────────────────────────

  _renderLeadingZone() {
    return html`
      <div
        part="leading"
        class="md-list-item__leading-wrapper ${classMap({
          "has-content": this._hasLeading,
        })}"
      >
        <slot
          name="leading"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasLeading = v))}
        ></slot>
      </div>
    `;
  }

  _renderTextZone() {
    return html`
      <span class="md-list-item__text">
        <span
          class="md-list-item__overline-wrapper ${classMap({
            "has-content": this._hasOverline,
          })}"
        >
          <span part="overline" class="md-list-item__overline">
            <slot
              name="overline"
              @slotchange=${(/** @type {Event} */ e) =>
                this._onSlotChange(e, (v) => (this._hasOverline = v))}
            ></slot>
          </span>
        </span>
        <span part="label" class="md-list-item__label">
          <slot></slot>
        </span>
        <span
          class="md-list-item__supporting-text-wrapper ${classMap({
            "has-content": this._hasSupportingText,
          })}"
        >
          <span part="supporting-text" class="md-list-item__supporting-text">
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
      <div
        part="trailing"
        class="md-list-item__trailing-wrapper ${classMap({
          "has-content": this._hasTrailing,
        })}"
      >
        <slot
          name="trailing"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasTrailing = v))}
        ></slot>
      </div>
    `;
  }

  _renderInteractiveContent() {
    return html`
      ${this._renderLeadingZone()} ${this._renderTextZone()}
      ${this._renderTrailingZone()}
    `;
  }

  render() {
    return html`
      <li class="md-list-item">
        ${when(
          this.href != null,
          () => html`
            <a
              id="list-item-interactive"
              class="md-list-item__interactive"
              part="interactive"
              href=${/** @type {string} */ (this.href)}
              tabindex="0"
            >
              <md-ripple for="list-item-interactive"></md-ripple>
              ${this._renderInteractiveContent()}
            </a>
          `,
          () =>
            when(
              this.button,
              () => html`
                <button
                  id="list-item-interactive"
                  class="md-list-item__interactive"
                  part="interactive"
                  type="button"
                  tabindex="0"
                >
                  <md-ripple for="list-item-interactive"></md-ripple>
                  ${this._renderInteractiveContent()}
                </button>
              `,
              () => html`
                ${this._renderLeadingZone()} ${this._renderTextZone()}
                ${this._renderTrailingZone()}
              `,
            ),
        )}
      </li>
    `;
  }
}
