import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./tab-panel.css?inline";

@customElement("md-tab-panel")
export class MdTabPanel extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    value: { type: String },
    active: { type: Boolean, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.value = "";
    this.active = false;
  }

  render() {
    return html`<slot></slot>`;
  }
}
