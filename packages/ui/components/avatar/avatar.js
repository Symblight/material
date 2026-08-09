import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./avatar.css?inline";

/**
 * @tag md-avatar
 * @summary Material Avatar web component
 */

@customElement("md-avatar")
export default class Avatar extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    src: { type: String, attribute: true },
    size: { type: Number, attribute: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {string | undefined} */
    this.src = undefined;

    /** @type {number | undefined} */
    this.size = undefined;
  }

  render() {
    const maskId = "md-avatar";
    const sizeSVG = Number(
      getComputedStyle(this)
        .getPropertyValue("--md-avatar-size")
        .replace("px", ""),
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
          part="image"
          class="avatar__image"
          href="${this.src}"
          preserveAspectRatio="xMidYMid slice"
        ></image>
        <circle
          cx=${sizeSVG}
          cy=${sizeSVG}
          r=${sizeSVG}
          part="fallback"
          class="avatar__circle"
          fill="${!this.src ? String("gray") : "none"}"
        ></circle>
      </g>
    </svg>`;
  }
}
