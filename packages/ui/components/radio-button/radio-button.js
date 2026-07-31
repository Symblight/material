import { html, isServer, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { RadioSelectionController } from "./radio-selection.js";
import { FormAssociateMixin, internals } from "./form-associate.js";

import "../ripple/ripple.js";

import styles from "./radio-button.css?inline";

/**
 * @tag md-radio
 * @summary Material Radio web component
 */

@customElement("md-radio")
export default class RadioButton extends FormAssociateMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    disabled: { type: Boolean, reflect: true },
    id: { type: String, attribute: true },
    value: { type: String },
    // form
    required: { type: Boolean, attribute: true, reflect: true },
    checked: { type: Boolean, reflect: true },
    name: { type: String, attribute: true },
  };

  /** @type {ShadowRootInit} */
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.selectionController = new RadioSelectionController(this);

    /** @type {boolean} */
    this.disabled = false;

    /** @type {string} */
    this.id = "";

    /** @type {string} */
    this.value = "on";

    /** @type {boolean} */
    this.required = false;

    /** @type {boolean} */
    this.checked = false;

    /** @type {string} */
    this.name = "";

    this.addController(this.selectionController);
    this[internals].role = "radio";
  }

  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (!isServer) {
      this.removeEventListener("click", this.handleClick);
    }
  }

  /** @returns {HTMLInputElement} */
  get input() {
    return /** @type {HTMLInputElement} */ (
      this.renderRoot?.querySelector("input")
    );
  }

  get form() {
    return this[internals].form;
  }

  get labels() {
    return this[internals].labels;
  }

  get type() {
    return this.localName;
  }

  /** @param {MouseEvent} event */
  handleClick(event) {
    if (this.disabled || !this.input) return;
    if (event.currentTarget !== event.target) {
      return;
    }

    if (event.composedPath()[0] !== event.target) {
      return;
    }

    const mouseEvent = new MouseEvent("click", { bubbles: true });
    this.input.dispatchEvent(mouseEvent);
  }

  /** @param {Event} event */
  handleInput(event) {
    const target = /** @type {HTMLInputElement} */ (event.target);
    this.checked = target.checked;
  }

  /** @param {import("lit").PropertyValues} _changedProperties */
  updated(_changedProperties) {
    if (_changedProperties.has("checked")) {
      if (this.checked) {
        this[internals].setFormValue(this.value);
      } else {
        this[internals].setFormValue(null);
      }
    }
    this[internals].ariaChecked = String(this.checked);
  }

  /** @param {Event} event */
  handleChange(event) {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);

    this.selectionController.select();
    this.updateValidity();
  }

  updateValidity() {
    if (!this.required) return;

    if (!this.selectionController.group) return;

    if (this.selectionController.selectedValue) {
      this[internals].setValidity({});
      return;
    }
    this[internals].setValidity({ customError: true }, "required");
    this[internals].reportValidity();
  }

  render() {
    return html`
      <md-ripple class="radio__ripple"></md-ripple>
      <input
        part="input"
        type="radio"
        class="radio__input"
        ?disabled=${this.disabled}
        ?required=${this.required}
        .name=${this.name}
        .value=${this.value}
        .checked=${this.checked}
        @change=${this.handleChange}
        @input=${this.handleInput}
      />

      <span
        class="radio__box ${classMap({
          radio__box_disabled: this.disabled,
          radio__box_checked: this.checked,
        })}"
      >
      </span>
    `;
  }
}
