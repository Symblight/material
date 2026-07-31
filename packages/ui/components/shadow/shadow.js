import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./shadow.css?inline";

/**
 * @tag md-shadow
 * @summary Material Button web component
 */
@customElement("md-shadow")
export default class MdShadow extends LitElement {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  render() {
    return html`<span class="shadow"></span>`;
  }
}
