import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./icon.css?inline";

/**
 * @tag md-icon
 * @summary Material Icon web component
 */

@customElement("md-icon")
export default class Icon extends LitElement {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  render() {
    return html`<slot></slot>`;
  }
}
