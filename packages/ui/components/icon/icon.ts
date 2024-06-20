import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./icon.css?inline";

/**
 * @tag md-icon
 * @summary Material Icon web component
 */

@customElement("md-icon")
export default class Icon extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-icon": Icon;
  }
}
