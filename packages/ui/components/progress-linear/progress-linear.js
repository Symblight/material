import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./progress-linear.css?inline";

/**
 * @tag md-progress-linear
 * @summary Material Design 3 linear progress indicator
 */
@customElement("md-progress-linear")
export default class MdProgressLinear extends LitElement {
  static properties = {
    /** Determinate progress value between 0 and 1. Omit for indeterminate. */
    value: { type: Number, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {number | undefined} */
    this.value = undefined;
  }

  get _indeterminate() {
    return this.value === undefined || this.value === null;
  }

  /** @param {import("lit").PropertyValues} changes */
  firstUpdated(changes) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("aria-hidden")) {
      this.setAttribute("aria-hidden", "true");
    }
  }

  render() {
    if (this._indeterminate) {
      return html`
        <div class="progress-linear">
          <div part="track" class="progress-linear__track"></div>
          <div
            part="bar"
            class="progress-linear__bar progress-linear__bar_secondary"
          ></div>
          <div
            part="bar"
            class="progress-linear__bar progress-linear__bar_primary"
          ></div>
        </div>
      `;
    }

    const clampedValue = Math.min(1, Math.max(0, this.value ?? 0));

    return html`
      <div
        class="progress-linear"
        style="--_progress-linear-value:${clampedValue}"
      >
        <div part="track" class="progress-linear__track"></div>
        <div
          part="stop-indicator"
          class="progress-linear__stop-indicator"
        ></div>
        <div
          part="active-indicator"
          class="progress-linear__active-indicator"
        ></div>
      </div>
    `;
  }
}
