import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  nothing,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import errorIcon from "@material-design-icons/svg/filled/error.svg?raw";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { when } from "lit/directives/when.js";
import { FormControlMixin, requiredValidator } from "@open-wc/form-control";

import { generateUniqueKey } from "../../shared/gen-id";

import "../icon/icon.ts";

import styles from "./text-field.css?inline";
import filledStyles from "./filled-field.css?inline";
import outlinedStyles from "./outlined-field.css?inline";

type TextFieldVariant = "filled" | "outlined";

const textFieldGeneratorKeys = generateUniqueKey("text-field-");

/**
 * @tag md-text-field
 * @summary Material Text Field web component
 */

@customElement("md-text-field")
export class TextField extends FormControlMixin(LitElement) {
  private leadingSlot: boolean;
  private trailingSlot: boolean;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static formControlValidators = [requiredValidator];

  constructor() {
    super();

    this.leadingSlot = false;
    this.trailingSlot = false;
  }

  static get styles(): CSSResultGroup {
    return [
      styles,
      filledStyles,
      outlinedStyles,
    ] as unknown as CSSResultOrNative[];
  }

  /**
   * The variant style of the textfield.
   */
  @property()
  accessor variant: TextFieldVariant = "filled";

  /**
   * The name associated with the text field.
   */
  @property({ type: String, attribute: true })
  accessor name = "";

  /**
   * The label for the text field.
   */
  @property({ type: String, attribute: true })
  accessor label = "";

  // form
  @property({ type: Boolean, attribute: true, reflect: true })
  required = false;

  /**
   * Indicates an error state.
   */
  @property({ type: Boolean, attribute: true, reflect: true }) accessor error = false;


  /**
   * The placeholder text for the text field.
   */
  @property({ type: String, attribute: true })
  accessor placeholder = "";

  /**
   * Indicates a dirty state.
   */
  @state()
  accessor dirty = false;

  /**
   * Indicates an active state (private).
   */
  @property({ type: Boolean, attribute: true })
  private accessor active = false;

  @state()
  private accessor focused: boolean = false;

  @state()
  accessor nativeError: boolean = false;

  @state()
  private accessor ariaId = `${textFieldGeneratorKeys.next().value}-${this.id}`;

  /**
   * Indicates whether the text field is disabled or not.
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor disabled = false;

  /**
   * Indicates whether the text field is read-only or not. Default is false.
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor readOnly = false;

  /**
   * Specifies the type of the text field. Default value is "text".
   */
  @property()
  accessor type: HTMLInputElement["type"] = "text";

  /**
   * The current value of the text field. It is always a string.
   */
  @property()
  accessor value = "";

  @property({ type: Boolean, attribute: true, reflect: true })
  accessor multiline = false;

  /**
   * The suffix for the text field.
   */
  @property({ type: String, attribute: "suffix-text" })
  accessor suffixText = "";

  /**
   * The prefix for the text field.
   */
  @property({ type: String, attribute: "prefix-text" })
  accessor prefixText = "";

  @query(".text-field__control")
  accessor inputOrTextArea: HTMLInputElement | HTMLAreaElement;

  @query(".text-field__control")
  accessor validationTarget: HTMLInputElement | HTMLAreaElement;

  resetFormControl(): void {
    this.value = "";
    this.setValue("");
    this.dirty = false;
  }

  get hasValidation() {
    return this.error || (!this.error && !!this.internals.validationMessage);
  }

  private handleChange(event: InputEvent) {
    if (this.disabled) return;
    this.value = ((event.target as HTMLInputElement) || null)?.value;
    this.setValue(this.value);
    this.dispatchEvent(new Event("change"));
    this.dirty = true;
  }

  private handleFocus() {
    if (this.disabled) return;
    this.focused = this.inputOrTextArea?.matches(":focus") ?? false;
  }

  override focus() {
    this.inputOrTextArea?.focus();
  }

  connectedCallback() {
    super.connectedCallback();

    const slots = Array.from(this.shadowRoot?.host.children || []).map(
      (element) => element.attributes.getNamedItem("slot")
    );
    const trailingSlot = slots.find((slot) => slot?.nodeValue === "trailing");
    const leadingSlot = slots.find((slot) => slot?.nodeValue === "leading");

    this.trailingSlot = !!trailingSlot;
    this.leadingSlot = !!leadingSlot;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  private get renderLeading() {
    if (!this.leadingSlot) return nothing;
    return html`
      <div class="text-field__icon text-field__leading">
        <slot name="leading"></slot>
      </div>
    `;
  }

  private get renderTrailing() {
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

          () => html` <slot name="trailing"> </slot> `
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

  private get renderInput() {
    const ariaId = this.hasValidation && this.ariaId;
    return html`
      <input
        part="input"
        .type=${this.type}
        .id=${this.id}
        .name=${this.name}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        ?required=${this.required}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        aria-describedby=${ariaId || ""}
        ?aria-error=${this.hasValidation}
        aria-label=${this.label}
        @input=${this.handleChange}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
        class="text-field__input text-field__control ${classMap({
          ...this.textFieldClass,
        })}"
      />
    `;
  }

  private get renderTextarea() {
    const ariaId = this.hasValidation && this.ariaId;
    return html`
      <textarea
        part="input"
        .id=${this.id}
        .name=${this.name}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        ?required=${this.required}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        aria-describedby=${ariaId || ""}
        ?aria-error=${this.hasValidation}
        aria-label=${this.label}
        @input=${this.handleChange}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
        class="text-field__control text-field__textarea ${classMap({
          ...this.textFieldClass,
        })}"
      ></textarea>
    `;
  }
  private get renderFilledLabel() {
    return when(
      this.label && this.variant === "filled",
      () => html`
        <label
          class="text-field__label text-field__filled-label ${classMap({
            "text-field__label_active": this.focused,
            "text-field__label_error": this.hasValidation,
            "text-field__filled-label_populated": this.populated,
            "text-field__label_outlined": this.variant === "outlined",
          })}"
          >${this.label}</label
        >
      `,
      () => nothing
    );
  }

  private get renderInputOrTextArea() {
    return when(
      !this.multiline,
      () => this.renderInput,
      () => this.renderTextarea
    );
  }

  private get renderFilled() {
    return when(
      this.variant === "filled",
      () =>
        html`<div
          class="text-field__indicator ${classMap({
            "text-field__indicator_focused": this.focused || this.active,
            "text-field__indicator_error": this.hasValidation,
          })}"
        ></div>`,
      () => nothing
    );
  }

  private get renderOutlined() {
    return when(
      this.variant === "outlined",
      () =>
        html`<fieldset
          aria-hidden="true"
          class="text-field__outlined-indicator ${classMap({
            "text-field__outlined-indicator_focused":
              this.focused || this.active,
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
      () => nothing
    );
  }

  private get renderOutlinedLabel() {
    return when(
      this.label && this.variant === "outlined",
      () => html`
        <div>
          <label
            class="text-field__label text-field__outlined-label ${classMap({
              "text-field__label_active": this.focused,
              "text-field__label_error": this.hasValidation,
              "text-field__outlined-label_populated": this.populated,
              "text-field__outlined-label_leading": this.leadingSlot,
            })}"
            >${this.label}</label
          >
        </div>
      `,
      () => nothing
    );
  }

  private get renderHelpText() {
    const ariaId = this.hasValidation && this.ariaId;
    return html` <div
      class="text-field__help-text ${classMap({
        "text-field__help-text_visible": this.hasValidation,
        "text-field__help-text_error": this.hasValidation,
      })}"
      id=${ariaId}
    >
      <slot name="help-text"></slot>
    </div>`;
  }

  private get renderPreffix() {
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
      () => nothing
    );
  }
  private get renderSuffix() {
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
      () => nothing
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
          ${this.renderLeading} ${this.renderOutlinedLabel}
        </div>
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
            ${this.renderPreffix} ${this.renderInputOrTextArea}
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

declare global {
  interface HTMLElementTagNameMap {
    "md-text-field": TextField;
  }
}
