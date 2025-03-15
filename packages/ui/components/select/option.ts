import { html, LitElement } from "lit";
import {
  property,
  customElement,
  state,
  queryAssignedElements,
  query,
} from "lit/decorators.js";

@customElement("md-option")
export class MdOption extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) selected = false;

  @queryAssignedElements({ flatten: true })
  optionElement!: HTMLOptionElement[];

  @query("option")
  option!: HTMLOptionElement;

  render() {
    return html`<option value="${this.value}" ?selected="${this.selected}">
      <slot></slot>
    </option>`;
  }
}
