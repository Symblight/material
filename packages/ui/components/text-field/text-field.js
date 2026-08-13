import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import errorIcon from "@material-design-icons/svg/filled/error.svg?raw";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { when } from "lit/directives/when.js";
import { FormControlMixin, requiredValidator } from "@open-wc/form-control";

import { generateUniqueKey } from "../../shared/gen-id.js";

import "../icon/icon.js";

import filledStyles from "./filled-field.css?inline";
import outlinedStyles from "./outlined-field.css?inline";
import styles from "./text-field.css?inline";

/** @typedef {"filled" | "outlined"} TextFieldVariant */
const VALID_VARIANTS = ["filled", "outlined"];

const textFieldGeneratorKeys = generateUniqueKey("text-field-");

/**
 * @tag md-text-field
 * @summary Material Text Field web component
 */

@customElement("md-text-field")
export class TextField extends FormControlMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** The variant style of the textfield. */
    variant: {},
    /** The name associated with the text field. */
    name: { type: String, attribute: true },
    /** The label for the text field. */
    label: { type: String, attribute: true },
    // form
    required: { type: Boolean, attribute: true, reflect: true },
    /** Indicates an error state. */
    error: { type: Boolean, attribute: true, reflect: true },
    /** The placeholder text for the text field. */
    placeholder: { type: String, attribute: true },
    /** Indicates a dirty state. */
    dirty: { state: true },
    focused: { state: true },
    nativeError: { state: true },
    ariaId: { state: true },
    /**
     * The element slotted into `input`, if any (set on `slotchange`). Must
     * be reactive: the label's `for` binding reads it to decide whether to
     * target the fallback `<input>` (see `renderFilledLabel`/
     * `renderOutlinedLabel`) — without `state: true` here, setting it in
     * `updateSlottedInput()` wouldn't trigger a re-render, leaving `for`
     * stuck with whatever it was at the last unrelated render.
     */
    customInputElement: { state: true },
    /** Indicates whether the text field is disabled or not. */
    disabled: { type: Boolean, attribute: true, reflect: true },
    /** Indicates whether the text field is read-only or not. Default is false. */
    readOnly: { type: Boolean, attribute: true, reflect: true },
    /** Specifies the type of the text field. Default value is "text". */
    type: {},
    /** The current value of the text field. It is always a string. */
    value: {},
    multiline: { type: Boolean, attribute: true, reflect: true },
    /** The suffix for the text field. */
    suffixText: { type: String, attribute: "suffix-text" },
    /** The prefix for the text field. */
    prefixText: { type: String, attribute: "prefix-text" },
  };

  /** @type {ShadowRootInit} */
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static formControlValidators = [requiredValidator];

  constructor() {
    super();

    this.leadingSlot = false;
    this.trailingSlot = false;

    /** @type {HTMLElement | null} */
    this.customInputElement = null;

    /** @type {TextFieldVariant} */
    this._variant = "filled";

    this.name = "";
    this.label = "";
    this.required = false;
    this.error = false;
    this.placeholder = "";
    this.dirty = false;
    this.focused = false;
    this.nativeError = false;
    this.ariaId = `${textFieldGeneratorKeys.next().value}-${this.id}`;
    this.disabled = false;
    this.readOnly = false;

    /** @type {HTMLInputElement["type"]} */
    this.type = "text";

    this.value = "";
    this.multiline = false;
    this.suffixText = "";
    this.prefixText = "";
  }

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles, filledStyles, outlinedStyles];
  }

  get variant() {
    return this._variant;
  }

  /** @param {TextFieldVariant} variant */
  set variant(variant) {
    if (variant === this.variant) return;

    this.requestUpdate("variant", this.variant);

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "filled";
      return;
    }
    this._variant = variant;

    this.setAttribute("variant", this.variant);
  }

  get inputId() {
    return `${this.ariaId}-control`;
  }

  /** @returns {HTMLInputElement | HTMLAreaElement} */
  get inputOrTextArea() {
    return /** @type {HTMLInputElement | HTMLAreaElement} */ (
      this.renderRoot?.querySelector(".text-field__control")
    );
  }

  /** @returns {HTMLInputElement | HTMLAreaElement} */
  get validationTarget() {
    return /** @type {HTMLInputElement | HTMLAreaElement} */ (
      this.renderRoot?.querySelector(".text-field__control")
    );
  }

  resetFormControl() {
    this.value = "";
    this.setValue("");
    this.dirty = false;
  }

  get hasValidation() {
    return this.error || (!this.error && !!this.internals.validationMessage);
  }

  /** @param {InputEvent} event */
  handleChange(event) {
    if (this.disabled) return;
    this.value = /** @type {HTMLInputElement} */ (event.target || null)?.value;
    this.setValue(this.value);
    this.dispatchEvent(new Event("change"));
    this.dirty = true;
  }

  handleFocus = () => {
    if (this.disabled) return;
    const control = this.customInputElement || this.inputOrTextArea;
    this.focused = control?.matches(":focus") ?? false;
  };

  focus() {
    const control = this.customInputElement || this.inputOrTextArea;
    control?.focus();
  }

  connectedCallback() {
    super.connectedCallback();

    const slots = Array.from(this.shadowRoot?.host.children || []).map(
      (element) => element.attributes.getNamedItem("slot"),
    );
    const trailingSlot = slots.find((slot) => slot?.nodeValue === "trailing");
    const leadingSlot = slots.find((slot) => slot?.nodeValue === "leading");

    this.trailingSlot = !!trailingSlot;
    this.leadingSlot = !!leadingSlot;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.customInputElement) {
      this.customInputElement.removeEventListener("focus", this.handleFocus);
      this.customInputElement.removeEventListener("blur", this.handleFocus);
    }
  }

  get renderLeading() {
    if (!this.leadingSlot) return nothing;
    return html`
      <div class="text-field__icon text-field__leading">
        <slot name="leading"></slot>
      </div>
    `;
  }

  get renderTrailing() {
    if (!this.trailingSlot) return nothing;
    return html`
      <div class="text-field__icon text-field__trailing">
        ${when(
          this.hasValidation && this.trailingSlot,
          () =>
            html`<md-icon
              name=${"alert"}
              class="${classMap({
                "text-field__icon_error": this.hasValidation,
              })}"
            >
              ${unsafeSVG(errorIcon)}
            </md-icon>`,

          () => html` <slot name="trailing"> </slot> `,
        )}
      </div>
    `;
  }

  get textFieldClass() {
    return {
      "text-field__control_disabled": this.disabled,
    };
  }

  get populated() {
    return this.focused || !!this.value || !!this.placeholder;
  }

  /** @param {CustomEvent} event */
  updateSlottedInput(event) {
    const [inputElement] = /** @type {HTMLSlotElement} */ (
      event.target
    ).assignedNodes();

    if (this.customInputElement) {
      this.customInputElement.removeEventListener("focus", this.handleFocus);
      this.customInputElement.removeEventListener("blur", this.handleFocus);
    }

    if (inputElement instanceof HTMLElement) {
      this.customInputElement = inputElement;
      inputElement.addEventListener("focus", this.handleFocus);
      inputElement.addEventListener("blur", this.handleFocus);
    } else {
      this.customInputElement = null;
    }
  }

  get renderInput() {
    const ariaId = this.hasValidation && this.ariaId;
    return html`
      <input
        part="input"
        id=${this.inputId}
        .type=${this.type}
        .name=${this.name}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        ?required=${this.required}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        aria-describedby=${ariaId || nothing}
        ?aria-invalid=${this.hasValidation}
        @input=${this.handleChange}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
        class="text-field__input text-field__control ${classMap({
          ...this.textFieldClass,
        })}"
      />
    `;
  }

  get renderTextarea() {
    const ariaId = this.hasValidation && this.ariaId;
    return html`
      <textarea
        part="input"
        id=${this.inputId}
        .name=${this.name}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        ?required=${this.required}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        aria-describedby=${ariaId || nothing}
        ?aria-invalid=${this.hasValidation}
        @input=${this.handleChange}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
        class="text-field__control text-field__textarea ${classMap({
          ...this.textFieldClass,
        })}"
      ></textarea>
    `;
  }

  /*
   * `for` only targets `inputId` when the fallback `<input>`/`<textarea>`
   * (renderInputOrTextArea) is actually what's rendered. When custom
   * content is slotted into `input` instead, that fallback element still
   * exists in the DOM (a <slot>'s fallback content isn't removed, only
   * unrendered) — so leaving `for` pointed at it means clicking the label
   * still triggers the browser's native label-click-forwarding onto that
   * hidden element, firing a second, separate synthetic click that bubbles
   * up alongside the label's own, double-firing any click listener on an
   * ancestor (e.g. toggling a popover open then immediately closed again).
   */
  get renderFilledLabel() {
    return when(
      this.label && this.variant === "filled",
      () => html`
        <label
          for=${this.customInputElement ? nothing : this.inputId}
          part="label"
          class="text-field__label text-field__filled-label ${classMap({
            "text-field__label_active": this.focused,
            "text-field__label_error": this.hasValidation,
            "text-field__filled-label_populated": this.populated,
          })}"
          >${this.label}</label
        >
      `,
      () => nothing,
    );
  }

  get renderInputOrTextArea() {
    return when(
      !this.multiline,
      () => this.renderInput,
      () => this.renderTextarea,
    );
  }

  get renderFilled() {
    return when(
      this.variant === "filled",
      () =>
        html`<div
          part="indicator"
          class="text-field__indicator ${classMap({
            "text-field__indicator_focused": this.focused,
            "text-field__indicator_error": this.hasValidation,
          })}"
        ></div>`,
      () => nothing,
    );
  }

  get renderOutlined() {
    return when(
      this.variant === "outlined",
      () =>
        html`<fieldset
          aria-hidden="true"
          part="indicator"
          class="text-field__outlined-indicator ${classMap({
            "text-field__outlined-indicator_focused": this.focused,
            "text-field__outlined-indicator_error": this.hasValidation,
          })}"
        >
          <legend
            class="text-field__outlined-legend ${classMap({
              "text-field__outlined-legend_focused":
                !!this.label && (this.focused || !!this.value),
            })}"
          >
            <span class="text-field__outlined-legend-label">${this.label}</span>
          </legend>
        </fieldset>`,
      () => nothing,
    );
  }

  get renderOutlinedLabel() {
    return when(
      this.label && this.variant === "outlined",
      () => html`
        <label
          for=${this.customInputElement ? nothing : this.inputId}
          part="label"
          class="text-field__label text-field__outlined-label ${classMap({
            "text-field__label_active": this.focused,
            "text-field__label_error": this.hasValidation,
            "text-field__outlined-label_populated": this.populated,
            "text-field__outlined-label_leading": this.leadingSlot,
          })}"
        >
          ${this.label}
        </label>
      `,
      () => nothing,
    );
  }

  get renderHelpText() {
    const ariaId = this.hasValidation && this.ariaId;
    return html` <div
      part="help-text"
      class="text-field__help-text ${classMap({
        "text-field__help-text_visible": this.hasValidation,
        "text-field__help-text_error": this.hasValidation,
      })}"
      id=${ariaId || nothing}
    >
      <slot name="help-text"></slot>
    </div>`;
  }

  get renderPrefix() {
    return when(
      this.prefixText,
      () =>
        html`<div
          class="text-field__affix ${classMap({
            "text-field__affix_hidden": !this.populated,
          })}"
        >
          ${this.prefixText}
        </div>`,
      () => nothing,
    );
  }

  get renderSuffix() {
    return when(
      this.suffixText,
      () =>
        html`<div
          class="text-field__affix ${classMap({
            "text-field__affix_hidden": !this.populated,
          })}"
        >
          ${this.suffixText}
        </div>`,
      () => nothing,
    );
  }

  render() {
    return html` <div
        part="box"
        class="text-field ${classMap({
          "text-field_multiline": this.multiline,
          "text-field_status_error": this.hasValidation,
          "text-field_status_focused": this.focused,
          "text-field_disabled": this.disabled,
          "text-field_variant_filled": this.variant === "filled",
          "text-field_variant_outlined": this.variant === "outlined",
        })}"
      >
        <div part="prefix" class="text-field__leading-wrapper">
          ${this.renderLeading}
        </div>
        ${this.renderOutlinedLabel}
        <div
          part="wrapper"
          class="text-field__input-wrapper ${classMap({
            "text-field__input-wrapper_variant_filled":
              this.variant === "filled",
            "text-field__input-wrapper_variant_outlined":
              this.variant === "outlined",
            "text-field__input-wrapper_focused": this.populated && this.label,
            "text-field__input-wrapper_label": this.label,
            "text-field__input-wrapper_multiline": this.multiline,
          })}"
        >
          ${this.renderFilledLabel}
          <div class="text-field__wrapper">
            ${this.renderPrefix}
            <slot name="input" @slotchange=${this.updateSlottedInput}>
              ${this.renderInputOrTextArea}
            </slot>
            ${this.renderSuffix}
          </div>
        </div>

        <div part="suffix" class="text-field__trailing-wrapper">
          ${this.renderTrailing}
        </div>
        ${this.renderFilled} ${this.renderOutlined}
      </div>
      ${this.renderHelpText}`;
  }
}
