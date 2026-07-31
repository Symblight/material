import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("md-option")
export class MdOption extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    value: { type: String },
    selected: { type: Boolean, reflect: true },
  };

  constructor() {
    super();

    this.value = "";
    this.selected = false;
  }

  /** @returns {HTMLOptionElement[]} */
  get optionElement() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    return /** @type {HTMLOptionElement[]} */ (
      slot?.assignedElements({ flatten: true }) ?? []
    );
  }

  /** @returns {HTMLOptionElement} */
  get option() {
    return /** @type {HTMLOptionElement} */ (
      this.renderRoot?.querySelector("option")
    );
  }

  render() {
    return html`<option value="${this.value}" ?selected="${this.selected}">
      <slot></slot>
    </option>`;
  }
}
