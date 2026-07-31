import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("md-optgroup")
export class MdOptGroup extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    label: { type: String },
    options: { state: true },
  };

  constructor() {
    super();

    this.label = "";

    /** @type {Map<string, HTMLOptionElement>} */
    this.options = new Map();
  }

  /** @returns {HTMLOptGroupElement[]} */
  get groupElement() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    return /** @type {HTMLOptGroupElement[]} */ (
      slot?.assignedElements() ?? []
    );
  }

  render() {
    return html`<optgroup label="${this.label}">
      <slot></slot>
    </optgroup>`;
  }
}
