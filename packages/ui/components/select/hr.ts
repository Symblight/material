import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("md-hr")
export class MdHr extends LitElement {
  protected render() {
    return html`<hr />`;
  }
}
