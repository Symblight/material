import { LitElement } from "lit";
import {
  property,
  customElement,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

@customElement("md-option")
export class MdOption extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) selected = false;

  @state()
  option: HTMLOptionElement | null = null;

  @queryAssignedElements()
  optionElement!: HTMLOptionElement[];
}
