import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./hr.css?inline";

@customElement("md-hr")
export class MdHr extends LitElement {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  render() {
    return html`<hr />`;
  }
}
