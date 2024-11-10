import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./avatar.css?inline";

/**
 * @tag md-avatar
 * @summary Material Avatar web component
 */

@customElement("md-avatar")
export default class Avatar extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  @property({ type: String, attribute: true })
  src: string | undefined;
  @property({ type: Number, attribute: true })
  size: number | undefined;

  render() {
    const maskId = "md-avatar";
    const sizeSVG = Number(
      getComputedStyle(this)
        .getPropertyValue("--md-avatar-size")
        .replace("px", "")
    );

    return html` <svg class="avatar" aria-hidden="true" role="none">
      <mask id=${maskId}>
        <circle cx=${sizeSVG} cy=${sizeSVG} fill="white" r=${sizeSVG}></circle>
      </mask>
      <g mask="url(#${maskId})">
        <image
          x="0"
          y="0"
          height="100%"
          width="100%"
          class="avatar__image"
          href="${this.src}"
          preserveAspectRatio="xMidYMid slice"
        ></image>
        <circle
          cx=${sizeSVG}
          cy=${sizeSVG}
          r=${sizeSVG}
          class="avatar__circle"
          fill="${!this.src ? String("gray") : "none"}"
        ></circle>
      </g>
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-avatar": Avatar;
  }
}
