import { CSSResultGroup, CSSResultOrNative, LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./progress-circular.css?inline";

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 282.743

/**
 * @tag md-progress-circular
 * @summary Material Design 3 circular progress indicator
 */
@customElement("md-progress-circular")
export default class MdProgressCircular extends LitElement {
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
    const indeterminate = this._indeterminate;
    const clampedValue = Math.min(1, Math.max(0, this.value ?? 0));
    const dashArray = indeterminate
      ? nothing
      : `${CIRCUMFERENCE * clampedValue} ${CIRCUMFERENCE}`;

    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      class="progress-circular__svg${indeterminate ? " progress-circular__svg_indeterminate" : ""}"
      viewBox="0 0 100 100"
      focusable="false"
      width="1em"
      height="1em"
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="${RADIUS}"
        fill="none"
        stroke-width="10"
        class="progress-circular__track"
      ></circle>
      <circle
        cx="50"
        cy="50"
        r="${RADIUS}"
        fill="none"
        stroke-width="10"
        class="progress-circular__circle"
        stroke-dasharray="${dashArray}"
      ></circle>
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-progress-circular": MdProgressCircular;
  }
}
