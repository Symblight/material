import { LitElement, html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import arrowDropDown from "@material-design-icons/svg/outlined/arrow_drop_down.svg?raw";

import "../text-field/text-field.js";
import "../icon/icon.js";

import styles from "./select.css?inline";
import {
  FormAssociateMixin,
  internals,
} from "../../shared/form-associate-mixin.js";

/** @import { TextField, TextFieldVariant } from "../text-field/text-field.js" */

export { internals };

/**
 * Shared base for `md-select` (menu-popover combobox) and `md-native-select`
 * (real `<select>` wrapper). Owns the mode-agnostic properties, the
 * `md-text-field` shell, and form association. Subclasses supply
 * `renderControl()`/`renderExtra()`, `resetFormControl()`, and their own
 * option-collection logic.
 */
export class BaseSelect extends FormAssociateMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    disabled: { type: Boolean, reflect: true },
    value: { type: String, attribute: true },
    required: { type: Boolean, reflect: true },
    name: { type: String, attribute: true },
    label: { type: String, attribute: true },
    /** The variant style of the textField. */
    variant: {},
  };

  requiredValidationMessage = "Please select an item in the list.";

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

    /** @type {string | undefined} */
    this.value = undefined;

    /** @type {boolean} */
    this.required = false;

    /** @type {string} */
    this.name = "";

    /** @type {string} */
    this.label = "";

    /** @type {TextFieldVariant} */
    this.variant = "filled";
  }

  get form() {
    return this[internals].form;
  }

  get labels() {
    return this[internals].labels;
  }

  /** @returns {TextField | null} */
  get textField() {
    return /** @type {TextField | null} */ (
      this.renderRoot?.querySelector("md-text-field")
    );
  }

  /**
   * The real `<select>` both subclasses render inside `md-text-field` —
   * visible in `md-native-select`, hidden validationTarget in `md-select`.
   * @returns {HTMLSelectElement | null}
   */
  get select() {
    return /** @type {HTMLSelectElement | null} */ (
      this.renderRoot?.querySelector("select")
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("focusout", this._onFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("focusout", this._onFocusOut);
  }

  _onFocusOut = () => {
    queueMicrotask(() => {
      if (!this.matches(":focus-within") && this.textField) {
        this.textField.focused = false;
      }
    });
  };

  /** @param {import("lit").PropertyValues} changed */
  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.textField) {
      // Forces md-text-field's label to stay floated (see
      // TextField.populated) — this element's own value never flows into
      // the text field's own `value`.
      this.textField.value = " ";
    }
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("required")) {
      this.updateValidity();
    }
  }

  isValueMissing() {
    return !this.value;
  }

  get validationTarget() {
    return this.select;
  }

  /** @param {string} value */
  setValue(value) {
    this.value = value;
    this[internals].setFormValue(value);
    if (this.select && this.select.value !== value) {
      this.select.value = value;
    }
  }

  /** @param {Event} event */
  handleChange(event) {
    const value = /** @type {HTMLSelectElement} */ (event.target || null)
      ?.value;
    this.setValue(value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /**
   * Trailing icon SVG. `md-select` swaps this to `arrow_drop_up` while open.
   * @returns {string}
   */
  get _trailingIcon() {
    return arrowDropDown;
  }

  /**
   * The "input"-slotted control markup. Must be overridden.
   * @param {string | null} _ariaLabel
   * @param {string | null} _ariaLabelledBy
   * @returns {unknown}
   */
  renderControl(_ariaLabel, _ariaLabelledBy) {
    return nothing;
  }

  /**
   * Extra markup rendered as a sibling of `<md-text-field>`, e.g.
   * `md-select`'s `<md-menu>` popover.
   * @returns {unknown}
   */
  renderExtra() {
    return nothing;
  }

  render() {
    const ariaLabel = this.getAttribute("aria-label");
    const ariaLabelledBy = this.getAttribute("aria-labelledby");

    return html`
      <md-text-field
        id="select-field"
        class="select__field"
        .label="${this.label}"
        part="text-field"
        exportparts="box, input, prefix, suffix, wrapper, label, help-text"
        ?disabled=${this.disabled}
        .variant="${this.variant}"
      >
        ${this.renderControl(ariaLabel, ariaLabelledBy)}

        <md-icon slot="trailing" class="select__trailing-icon">
          ${unsafeSVG(this._trailingIcon)}
        </md-icon>
      </md-text-field>
      ${this.renderExtra()}
    `;
  }
}
