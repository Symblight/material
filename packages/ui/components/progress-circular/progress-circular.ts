import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./progress-circular.css?inline";

/**
 * @tag md-progress-circular
 * @summary Material Spin web component
 */
@customElement("md-progress-circular")
export default class MdProgressCircular extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("aria-hidden")) {
      this.setAttribute("aria-hidden", "true");
    }
  }

  render() {
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      class="progress-circular__svg"
      viewBox="0 0 100 100"
      focusable="false"
      width="1em"
      height="1em"
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke-width="10"
        class="progress-circular__circle"
      ></circle>
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-progress-circular": MdProgressCircular;
  }
}
