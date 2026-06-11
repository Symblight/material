import { LitElement, html, CSSResultGroup, CSSResultOrNative } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./tab-panel.css?inline";

@customElement("md-tab-panel")
export class MdTabPanel extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) active = false;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-tab-panel": MdTabPanel;
  }
}
