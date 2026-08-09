import { html, isServer, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { RadioSelectionController } from "./radio-selection.js";
import {
  FormAssociateMixin,
  internals,
} from "../../shared/form-associate-mixin.js";

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

  resetFormControl() {
    this.checked = false;
    this[internals].setFormValue(null);
  }

  /** Returns the tabindex currently set on the inner input. */
  getTabIndex() {
    return this.input ? Number(this.input.getAttribute("tabindex") ?? "0") : 0;
  }

  /**
   * Sets the tabindex on the inner input. Called by `RadioSelectionController`
   * to implement roving tabindex across a group of radios.
   * @param {number} value
   */
  setTabIndex(value) {
    this.input?.setAttribute("tabindex", String(value));
  }

  /** Moves focus to the inner input. */
  focusInteractive() {
    this.input?.focus();
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

  /** @param {import("lit").PropertyValues} changedProperties */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // Validity must be computed proactively, not only reactively on
    // `change`: `ElementInternals`-based elements default to *valid* until
    // `setValidity()` is called, unlike native `<input required>` which the
    // browser validates continuously. Without this, a `required` radio
    // group with nothing pre-selected reports as valid if the user submits
    // the form without ever interacting with any radio in the group.
    this.selectionController.syncTabIndex();
    this.selectionController.updateGroupValidity();
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    if (changedProperties.has("checked")) {
      if (this.checked) {
        this[internals].setFormValue(this.value);
      } else {
        this[internals].setFormValue(null);
      }
    }
    this[internals].ariaChecked = String(this.checked);

    if (changedProperties.has("checked") || changedProperties.has("disabled")) {
      this.selectionController.syncTabIndex();
    }

    if (changedProperties.has("checked") || changedProperties.has("required")) {
      this.selectionController.updateGroupValidity();
    }
  }

  /** @param {Event} event */
  handleChange(event) {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);

    this.selectionController.select();
    this.selectionController.updateGroupValidity();
  }

  /**
   * Recomputes this radio's own `ElementInternals` validity. Not called
   * directly by user interaction anymore — use
   * `selectionController.updateGroupValidity()` instead, which recomputes
   * validity for every radio sharing this radio's `name` in the group (not
   * just whichever radio's `handleChange` happened to fire). Kept as a
   * per-instance method because that's what `updateGroupValidity()` calls
   * for each radio in the group.
   */
  updateValidity() {
    if (!this.required) {
      this[internals].setValidity({});
      return;
    }

    const controls = this.selectionController.controls.length
      ? this.selectionController.controls
      : [this];

    const hasSelection = controls.some(
      (radio) => radio.name === this.name && radio.checked,
    );

    if (hasSelection) {
      this[internals].setValidity({});
      return;
    }

    this[internals].setValidity(
      { customError: true },
      "required",
      this.input ?? undefined,
    );
  }

  render() {
    return html`
      <md-ripple class="radio__ripple"></md-ripple>
      <input
        part="input"
        type="radio"
        class="radio__input"
        tabindex="0"
        ?disabled=${this.disabled}
        ?required=${this.required}
        .name=${this.name}
        .value=${this.value}
        .checked=${this.checked}
        @change=${this.handleChange}
        @input=${this.handleInput}
      />

      <span
        part="box"
        class="radio__box ${classMap({
          radio__box_disabled: this.disabled,
          radio__box_checked: this.checked,
        })}"
      >
      </span>
    `;
  }
}
