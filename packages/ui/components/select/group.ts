import { html, LitElement } from "lit";
import {
  property,
  customElement,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

@customElement("md-optgroup")
export class MdOptGroup extends LitElement {
  @property({ type: String }) label = "";

  @state()
  options: Map<string, HTMLOptionElement> = new Map();

  @queryAssignedElements()
  groupElement!: HTMLOptGroupElement[];

  protected render() {
    return html`<optgroup label="${this.label}">
      <slot></slot>
    </optgroup>`;
  }
}
