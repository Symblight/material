import { LitElement, html, isServer, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { classMap } from "lit/directives/class-map.js";
import check from "@material-design-icons/svg/filled/check.svg?raw";

import "../ripple/ripple.js";

import {
  FormAssociateMixin,
  internals,
} from "../../shared/form-associate-mixin.js";

import styles from "./checkbox.css?inline";

/**
 * @tag md-checkbox
 * @summary Material Checkbox web component
 */

@customElement("md-checkbox")
export default class Checkbox extends FormAssociateMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    disabled: { type: Boolean, reflect: true },
    id: { type: String, attribute: true },
    value: { type: String },
    // form
    required: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    checked: { type: Boolean, reflect: true },
    name: { type: String, attribute: true },
    focused: { state: true },
  };

  requiredValidationMessage = "Please check this box if you want to proceed.";

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

    /** @type {boolean} */
    this.disabled = false;

    /** @type {string} */
    this.id = "";

    /** @type {string} */
    this.value = "on";

    /** @type {boolean} */
    this.required = false;

    /** @type {boolean} */
    this.indeterminate = false;

    /** @type {boolean} */
    this.error = false;

    /** @type {boolean} */
    this.checked = false;

    /** @type {string} */
    this.name = "";

    /** @type {boolean} */
    this.focused = false;
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

  /** @param {import("lit").PropertyValues} changedProperties */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // Validity must be computed proactively, not only reactively on
    // `change`: `ElementInternals`-based elements default to *valid* until
    // `setValidity()` is called, unlike native `<input required>` which the
    // browser validates continuously. Without this, a `required` checkbox
    // reports as valid if the user submits the form without ever
    // interacting with it.
    this.updateValidity();
  }

  /** @param {Map<string, unknown>} changedValues */
  updated(changedValues) {
    if (
      changedValues.has("checked") ||
      changedValues.has("value") ||
      changedValues.has("required")
    ) {
      this.updateValidity();
    }
  }

  isValueMissing() {
    return !this.checked;
  }

  get validationTarget() {
    return this.input;
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
    this.indeterminate = target.indeterminate;

    if (this.checked) {
      this[internals].setFormValue(this.value);
    } else {
      this[internals].setFormValue(null);
    }
  }

  resetFormControl() {
    this.checked = false;
    this[internals].setFormValue(null);
  }

  handleFocus() {
    if (this.disabled) return;
    this.focused = this.input?.matches(":focus") ?? false;
  }

  /** @param {Event} event */
  handleChange(event) {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);
  }

  render() {
    return html`
      <md-ripple class="checkbox__ripple" for="input"></md-ripple>
      <input
        id="input"
        part="input"
        type="checkbox"
        ?disabled=${this.disabled}
        ?required=${this.required}
        .checked=${this.checked}
        .indeterminate=${this.indeterminate}
        .name=${this.name}
        .value=${this.value}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
        @change=${this.handleChange}
        @input=${this.handleInput}
        class="checkbox__input  ${classMap({
          checkbox__input_focused: this.focused,
          checkbox__input_error: this.error,
        })}"
      />
      <span
        part="box"
        class="checkbox__box ${classMap({
          checkbox__box_checked: this.checked,
          checkbox__box_focused: this.focused,
          checkbox__box_indeterminate: this.indeterminate,
          checkbox__box_error: this.error,
          checkbox__box_disabled: this.disabled,
        })}"
      >
        ${when(
          this.checked,
          () => html`${unsafeSVG(check)}`,
          () => nothing,
        )}
        ${when(
          !this.checked && this.indeterminate,
          () =>
            html`<svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M240-440v-80h480v80H240Z" />
            </svg>`,
          () => nothing,
        )}
      </span>
    `;
  }
}
