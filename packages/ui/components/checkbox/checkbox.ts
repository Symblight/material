import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  isServer,
  nothing,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { classMap } from "lit/directives/class-map.js";
import check from "@material-design-icons/svg/filled/check.svg?raw";

import styles from "./checkbox.css?inline";

/**
 * @tag md-checkbox
 * @summary Material Checkbox web component
 */
const internals = Symbol("internals");

@customElement("md-checkbox")
export default class Checkbox extends LitElement {
  static readonly formAssociated = true;
  [internals]: ElementInternals;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static get styles(): CSSResultGroup {
    return [styles];
  }

  constructor() {
    super();
    this[internals] = this.attachInternals();
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) {
      this.removeEventListener("click", this.handleClick);
    }
  }

  updated(changedValues: Map<string, unknown>): void {
    if (changedValues.has("checked") || changedValues.has("value")) {
      // set the value of the input
      this[internals].setValidity({ customError: false });
    }
  }

  @property({ type: Boolean, reflect: true })
  accessor disabled: boolean = false;

  @property({ type: String, attribute: true })
  accessor id: string = "";

  @property({ type: String })
  accessor value: string = "on";

  // form
  @property({ type: Boolean, reflect: true })
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
    this.indeterminate = target.indeterminate;

    if (this.checked) {
      this[internals].setFormValue(this.value);
    } else {
      this[internals].setFormValue(null);
    }
  }

  formResetCallback() {
    this.checked = false;
    this[internals].setFormValue(this.value);
  }

  private handleFocus() {
    if (this.disabled) return;
    this.focused = this.input?.matches(":focus") ?? false;
  }

  private handleChange(event: Event) {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);
  }

  onValidate(state: boolean) {
    if (!state) {
      this[internals].setValidity({ customError: true }, "required");
    } else if (state === true) {
      this[internals].setValidity({});
    }
  }

  render() {
    return html`
      <input
        part="input"
        type="checkbox"
        .id=${this.id}
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
              fill="#5f6368"
            >
              <path d="M240-440v-80h480v80H240Z" />
            </svg>`,
          () => nothing,
        )}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-checkbox": Checkbox;
  }
}
