import {
  CSSResultGroup,
  html,
  isServer,
  LitElement,
  PropertyValues,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { RadioSelectionController } from "./radio-selection";
import { FormAssociateMixin, internals } from "./form-associate";

import styles from "./radio-button.css?inline";

/**
 * @tag md-radio
 * @summary Material Radio web component
 */

@customElement("md-radio")
export default class RadioButton extends FormAssociateMixin(LitElement) {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private selectionController = new RadioSelectionController(this);

  static get styles(): CSSResultGroup {
    return [styles];
  }

  constructor() {
    super();
    this.addController(this.selectionController)
    this[internals].role = "radio";
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!isServer) {
      this.addEventListener("click", this.handleClick);

      if (this.input) {
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) {
      this.removeEventListener("click", this.handleClick);
    }
  }

  @property({ type: Boolean, reflect: true })
  accessor disabled: boolean = false;

  @property({ type: String, attribute: true })
  accessor id: string = "";

  @property({ type: String })
  accessor value: string = "on";

  // form
  @property({ type: Boolean, attribute: true, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  accessor indeterminate: boolean = false;

  @property({ type: Boolean, reflect: true })
  accessor error: boolean = false;

  @property({ type: Boolean, reflect: true })
  accessor checked: boolean = false;

  @query("input")
  accessor input!: HTMLInputElement;

  @property({ type: String, attribute: true })
  accessor name: string = "";

  get form() {
    return this[internals].form;
  }

  get labels() {
    return this[internals].labels;
  }

  get type() {
    return this.localName;
  }

  @state()
  private accessor focused: boolean = false;

  private handleClick(event: MouseEvent): void {
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

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
  }


  public updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("checked")) {
      if (this.checked) {
        this[internals].setFormValue(this.value);
      } else {
        this[internals].setFormValue(null);
      }
    }
    this[internals].ariaChecked = String(this.checked);
  }

  private handleFocus() {
    if (this.disabled) return;
    this.focused = this.input?.matches(":focus") ?? false;
  }

  private handleChange(event: Event) {
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
      <input
        part="input"
        type="radio"
        class="radio__input"
        ?disabled=${this.disabled}
        ?required=${this.required}
        .name=${this.name}
        .value=${this.value}
        .checked=${this.checked}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
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

declare global {
  interface HTMLElementTagNameMap {
    "md-radio": RadioButton;
  }
}
