import { LitElement, html, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
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
  static get styles(): CSSResultGroup {
    return [styles];
  }

  /** Text or number to display. Leave empty for the small dot variant. */
  @property({ type: String, reflect: true })
  value: string = "";

  /** Maximum numeric value before truncating with "+". Defaults to 999. */
  @property({ type: Number })
  max: number = 999;

  private get _label(): string {
    if (this.value === "" || this.value == null) return "";
    const num = Number(this.value);
    if (!Number.isNaN(num) && num > this.max) {
      return `${this.max}+`;
    }
    return String(this.value);
  }

  private get _isSmall(): boolean {
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

declare global {
  interface HTMLElementTagNameMap {
    "md-badge": MdBadge;
  }
}
