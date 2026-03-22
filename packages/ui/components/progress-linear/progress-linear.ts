import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./progress-linear.css?inline";

/**
 * @tag md-progress-linear
 * @summary Material Design 3 linear progress indicator
 */
@customElement("md-progress-linear")
export default class MdProgressLinear extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  /** Determinate progress value between 0 and 1. Omit for indeterminate. */
  @property({ type: Number, reflect: true }) value?: number;

  private get _indeterminate() {
    return this.value === undefined || this.value === null;
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("aria-hidden")) {
      this.setAttribute("aria-hidden", "true");
    }
  }

  render() {
    if (this._indeterminate) {
      return html`
        <div class="progress-linear">
          <div class="progress-linear__track"></div>
          <div
            class="progress-linear__bar progress-linear__bar_secondary"
          ></div>
          <div class="progress-linear__bar progress-linear__bar_primary"></div>
        </div>
      `;
    }

    const clampedValue = Math.min(1, Math.max(0, this.value ?? 0));

    return html`
      <div class="progress-linear" style="--_progress:${clampedValue}">
        <div class="progress-linear__track"></div>
        <div class="progress-linear__stop-indicator"></div>
        <div class="progress-linear__active-indicator"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-progress-linear": MdProgressLinear;
  }
}
