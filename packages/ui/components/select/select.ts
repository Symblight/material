import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  PropertyValues,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Context, createContext, provide } from "@lit/context";
import { live } from "lit/directives/live.js";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import search from "@material-design-icons/svg/outlined/arrow_drop_down.svg?raw";

import { TextField, TextFieldVariant } from "../text-field/text-field.ts";
import { MdOption } from "./option.ts";

import "../text-field/text-field.ts";

import styles from "./select.css?inline";

export type ContextSelect = Context<
  symbol,
  { registerBlockConsumer: (option: MdOption) => void }
>;

export const selectContext: ContextSelect = createContext(Symbol("select"));

/**
 * @tag md-select
 * @summary Material Select web component
 */


// TODO
// grouping options

const internals = Symbol("internals");

@customElement("md-select")
export default class Select extends LitElement {
  @query("md-text-field")
  accessor textField: TextField | null = null;

  @query("select")
  accessor select: HTMLSelectElement | null = null;

  @state()
  accessor firstOptionValue: string = "";

  static readonly formAssociated = true;
  [internals]: ElementInternals;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private options = new Map();
  constructor() {
    super();

    this.options = new Map();
    this[internals] = this.attachInternals();
  }
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  get form() {
    return this[internals].form;
  }

  @provide({ context: selectContext })
  contextRegistration = {
    registerBlockConsumer: (option: MdOption) => this.registerBlock(option),
  };

  @property({ type: Boolean, reflect: true })
  accessor disabled: boolean = false;

  @property({ type: String, attribute: true })
  accessor id: string = "";

  @property({ type: String, attribute: true })
  accessor value: string | undefined;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String, attribute: true })
  accessor name: string = "";

  /**
   * The variant style of the textField.
   */
  @property()
  accessor variant: TextFieldVariant = "filled";

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.textField) {
      this.textField.value = " ";
    }
  }

  formResetCallback() {
    this.setValue(this.firstOptionValue);
  }

  registerBlock(block: MdOption) {
    this.options.set(block.value, block);
    if (this.value === undefined) {
      this.setValue(block.value);
      this.firstOptionValue = block.value;
    }
    if (block.selected) {
      this.setValue(block.value);
    }
    this.requestUpdate();
  }

  setValue(value: string) {
    this.value = value;
    this[internals].setFormValue(value);
  }

  handleChange(event: MouseEvent) {
    const value = ((event.target as HTMLSelectElement) || null)?.value;
    this.setValue(value);
    this.dispatchEvent(new Event("change"));
  }

  private updateSlottedOptions(event: CustomEvent) {
    const options = (event.target as HTMLSlotElement).assignedNodes();

    options.forEach((option) => {
      if (option instanceof MdOption) {
        this.options.set(option.value, option);
      }
    });
    this.requestUpdate();
  }

  render() {
    return html`
      <md-text-field
        label="Username"
        part="text-field"
        ?disabled=${this.disabled}
        .variant="${this.variant}"
      >
        <select
          .id=${this.id}
          .name=${this.name}
          .value=${live(this.value)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          part="select"
          @change=${this.handleChange}
          class="select__native-control"
          slot="input"
        >
          ${[...this.options.values()].map(
            (option) =>
              html`<option
                ?selected="${option.selected}"
                value="${option.value}"
              >
                ${option.textContent}
              </option>`,
          )}
        </select>

        <md-icon slot="trailing"> ${unsafeSVG(search)} </md-icon>
      </md-text-field>
      <slot @slotchange=${this.updateSlottedOptions}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-select": Select;
  }
}
