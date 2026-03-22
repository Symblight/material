import { CSSResultGroup, LitElement, html, isServer, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import styles from "./switch.css?inline";

/**
 * @tag md-switch
 * @summary Material Design 3 Switch web component
 */
const internals = Symbol("internals");

@customElement("md-switch")
export default class MdSwitch extends LitElement {
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
      this.addEventListener("click", this._handleHostClick);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!isServer) {
      this.removeEventListener("click", this._handleHostClick);
    }
  }

  updated(changedValues: Map<string, unknown>): void {
    if (changedValues.has("selected") || changedValues.has("value")) {
      this[internals].setFormValue(this.selected ? this.value : null);
      this[internals].setValidity({ customError: false });
    }
  }

  /** Whether the switch is selected (on). */
  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  /** Disables the switch. */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /** Shows icons inside the handle (check when on, x when off). */
  @property({ type: Boolean, reflect: true })
  icons: boolean = false;

  /** Value submitted with the form when selected. */
  @property({ type: String })
  value: string = "on";

  /** Form field name. */
  @property({ type: String, attribute: true })
  name: string = "";

  /** Marks the field as required in a form. */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  @state() private _focused: boolean = false;

  @query("input")
  input!: HTMLInputElement;

  get form() {
    return this[internals].form;
  }

  get labels() {
    return this[internals].labels;
  }

  get type() {
    return this.localName;
  }

  private _handleHostClick(event: MouseEvent): void {
    if (this.disabled || !this.input) return;
    if (event.composedPath()[0] !== event.target) return;
    const mouseEvent = new MouseEvent("click", { bubbles: true });
    this.input.dispatchEvent(mouseEvent);
  }

  private _handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selected = target.checked;
    this[internals].setFormValue(this.selected ? this.value : null);
  }

  private _handleChange(event: Event): void {
    if (this.disabled) return;
    const copy = Reflect.construct(event.constructor, [event.type, event]);
    this.dispatchEvent(copy);
  }

  private _handleFocus(): void {
    if (this.disabled) return;
    this._focused = this.input?.matches(":focus") ?? false;
  }

  formResetCallback(): void {
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
          <div class="switch__state-layer"></div>
          <div
            class=${classMap({
              switch__handle: true,
              switch__handle_selected: this.selected,
              "switch__handle_with-icon": this.icons,
            })}
          >
            ${this.icons
              ? html`
                  <div class="switch__icon">
                    ${this.selected
                      ? html`<svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="16px"
                          viewBox="0 -960 960 960"
                          width="16px"
                        >
                          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
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
                        </svg>`}
                  </div>
                `
              : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-switch": MdSwitch;
  }
}
