import { html, LitElement } from "lit";
import { classMap } from "lit/directives/class-map.js";

import "../../ripple/ripple.js";

import styles from "./base-chip.css?inline";

export default class BaseMdChip extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    disabled: { type: Boolean, attribute: true, reflect: true },
    _hasLeadingIcon: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.disabled = false;
    this._hasLeadingIcon = false;
  }

  /**
   * @protected
   * @param {Event} _e
   */
  _handleClick(_e) {
    // override in subclasses
  }

  /**
   * @protected
   * @param {Event} e
   * @param {(v: boolean) => void} stateSetter
   */
  _onSlotChange(e, stateSetter) {
    const slot = /** @type {HTMLSlotElement} */ (e.target);
    stateSetter(slot.assignedNodes({ flatten: true }).length > 0);
  }

  render() {
    return html`
      <button
        id="chip"
        part="chip"
        class="chip ${classMap({
          chip_disabled: this.disabled,
        })}"
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <md-ripple for="chip"></md-ripple>
        <slot
          name="leading-icon"
          part="leading-icon"
          class="${classMap({ "chip__leading-icon": this._hasLeadingIcon })}"
          @slotchange=${(/** @type {Event} */ e) =>
            this._onSlotChange(e, (v) => (this._hasLeadingIcon = v))}
        ></slot>
        <span part="label" class="chip__label"><slot></slot></span>
      </button>
    `;
  }
}
