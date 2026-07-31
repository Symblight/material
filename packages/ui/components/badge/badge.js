import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import styles from "./badge.css?inline";

/**
 * @tag md-badge
 * @summary Material Badge web component (MD3)
 *
 * Small badge: no value — renders a 6px dot.
 * Large badge: value provided — renders a pill with text.
 * Numbers above `max` are displayed as `{max}+`.
 */
@customElement("md-badge")
export class MdBadge extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Text or number to display. Leave empty for the small dot variant. */
    value: { type: String, reflect: true },
    /** Maximum numeric value before truncating with "+". Defaults to 999. */
    max: { type: Number },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {string} */
    this.value = "";

    /** @type {number} */
    this.max = 999;
  }

  /**
   * @private
   * @returns {string}
   */
  get _label() {
    if (this.value === "" || this.value == null) return "";
    const num = Number(this.value);
    if (!Number.isNaN(num) && num > this.max) {
      return `${this.max}+`;
    }
    return String(this.value);
  }

  /**
   * @private
   * @returns {boolean}
   */
  get _isSmall() {
    return this._label === "";
  }

  render() {
    const label = this._label;
    return html`
      <div
        role="status"
        aria-label=${label || "notification"}
        class=${classMap({
          badge: true,
          badge_small: this._isSmall,
          badge_large: !this._isSmall,
        })}
      >
        ${label}
      </div>
    `;
  }
}
