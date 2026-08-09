import { LitElement, html, isServer, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import {
  FormAssociateMixin,
  internals,
} from "../../shared/form-associate-mixin.js";

import styles from "./switch.css?inline";

/**
 * @tag md-switch
 * @summary Material Design 3 Switch web component
 */

@customElement("md-switch")
export default class MdSwitch extends FormAssociateMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Whether the switch is selected (on). */
    selected: { type: Boolean, reflect: true },
    /** Disables the switch. */
    disabled: { type: Boolean, reflect: true },
    /** Shows icons inside the handle (check when on, x when off). */
    icons: { type: Boolean, reflect: true },
    /** Value submitted with the form when selected. */
    value: { type: String },
    /** Form field name. */
    name: { type: String, attribute: true },
    /** Marks the field as required in a form. */
    required: { type: Boolean, reflect: true },
    _focused: { state: true },
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
    this.selected = false;

    /** @type {boolean} */
    this.disabled = false;

    /** @type {boolean} */
    this.icons = false;

    /** @type {string} */
    this.value = "on";

    /** @type {string} */
    this.name = "";

    /** @type {boolean} */
    this.required = false;

    /** @type {boolean} */
    this._focused = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.addEventListener("click", this._handleHostClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (!isServer) {
      this.removeEventListener("click", this._handleHostClick);
    }
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // Validity must be computed proactively, not only reactively on
    // `change`: `ElementInternals`-based elements default to *valid* until
    // `setValidity()` is called, unlike native `<input required>` which the
    // browser validates continuously. Without this, a `required` switch
    // reports as valid if the user submits the form without ever
    // interacting with it.
    this.updateValidity();
  }

  /** @param {Map<string, unknown>} changedValues */
  updated(changedValues) {
    if (
      changedValues.has("selected") ||
      changedValues.has("value") ||
      changedValues.has("required")
    ) {
      this[internals].setFormValue(this.selected ? this.value : null);
      this.updateValidity();
    }
  }

  isValueMissing() {
    return !this.selected;
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
  _handleHostClick(event) {
    if (this.disabled || !this.input) return;
    if (event.composedPath()[0] !== event.target) return;
    const mouseEvent = new MouseEvent("click", { bubbles: true });
    this.input.dispatchEvent(mouseEvent);
  }

  /** @param {Event} event */
  _handleInput(event) {
    const target = /** @type {HTMLInputElement} */ (event.target);
    this.selected = target.checked;
    this[internals].setFormValue(this.selected ? this.value : null);
  }

  /** @param {Event} event */
  _handleChange(event) {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);
  }

  _handleFocus() {
    if (this.disabled) return;
    this._focused = this.input?.matches(":focus") ?? false;
  }

  resetFormControl() {
    this.selected = false;
    this[internals].setFormValue(null);
  }

  render() {
    return html`
      <input
        part="input"
        type="checkbox"
        .checked=${this.selected}
        ?disabled=${this.disabled}
        ?required=${this.required}
        .name=${this.name}
        .value=${this.value}
        class="switch__input"
        aria-checked=${this.selected ? "true" : "false"}
        role="switch"
        @focus=${this._handleFocus}
        @blur=${this._handleFocus}
        @input=${this._handleInput}
        @change=${this._handleChange}
      />
      <div
        part="track"
        class=${classMap({
          switch__track: true,
          switch__track_selected: this.selected,
          switch__track_disabled: this.disabled,
          switch__track_focused: this._focused,
        })}
      >
        <div
          class=${classMap({
            "switch__handle-container": true,
            "switch__handle-container_selected": this.selected,
          })}
        >
          <div part="state-layer" class="switch__state-layer"></div>
          <div
            part="handle"
            class=${classMap({
              switch__handle: true,
              switch__handle_selected: this.selected,
              "switch__handle_with-icon": this.icons,
            })}
          >
            ${
              this.icons
                ? html`
                    <div part="icon" class="switch__icon">
                      ${
                        this.selected
                          ? html`<svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="16px"
                              viewBox="0 -960 960 960"
                              width="16px"
                            >
                              <path
                                d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
                              />
                            </svg>`
                          : html`<svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="16px"
                              viewBox="0 -960 960 960"
                              width="16px"
                            >
                              <path
                                d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
                              />
                            </svg>`
                      }
                    </div>
                  `
                : nothing
            }
          </div>
        </div>
      </div>
    `;
  }
}
