import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./shadow.css?inline";
/**
 * @tag md-shadow
 * @summary Material Button web component
 */
@customElement("md-shadow")
export default class MdShadow extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  render() {
    return html`<span class="shadow"></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-shadow": MdShadow;
  }
}
