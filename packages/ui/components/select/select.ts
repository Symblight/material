import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  PropertyValues,
  TemplateResult,
} from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { Context, createContext } from "@lit/context";
import { live } from "lit/directives/live.js";
import { choose } from "lit/directives/choose.js";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import search from "@material-design-icons/svg/outlined/arrow_drop_down.svg?raw";

import { TextField, TextFieldVariant } from "../text-field/text-field.ts";
import { MdOption } from "./option.ts";

import "./option.ts";
import "./group.ts";
import "./hr.ts";

import "../text-field/text-field.ts";

import styles from "./select.css?inline";
import { MdOptGroup } from "./group.ts";
import { MdHr } from "./hr.ts";

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
type MenuElementItem = MdOption | MdOptGroup | MdHr;
type MenuItem = {
  type: "option" | "optgroup" | "hr";
  element: MenuElementItem;
  children: MenuItem[];
};

const internals = Symbol("internals");

@customElement("md-select")
export default class Select extends LitElement {
  @query("md-text-field")
  accessor textField: TextField | null = null;

  @query("select")
  accessor select!: HTMLSelectElement;

  @state()
  accessor firstOptionValue: string = "";

  static readonly formAssociated = true;
  [internals]: ElementInternals;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @state()
  options: MenuItem[] = [];

  constructor() {
    super();

    this.options = [];
    this[internals] = this.attachInternals();
  }
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  get form() {
    return this[internals].form;
  }

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

  @queryAssignedElements()
  menu!: (MdOption | MdOptGroup | MdHr)[];

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.textField) {
      this.textField.value = " ";
    }
  }

  formResetCallback() {
    this.setValue(this.firstOptionValue);
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

  private convertAndMoveOptions(items: Element[], options: MenuItem[] = []) {
    items.forEach((option) => {
      if (option instanceof MdOption) {
        options.push({
          element: option,
          type: "option",
          children: [],
        });
      }

      if (option instanceof MdOptGroup) {
        const childrenOptions: MenuItem[] = [];
        this.convertAndMoveOptions([...option.children], childrenOptions);
        options.push({
          element: option,
          type: "optgroup",
          children: childrenOptions,
        });
      }

      if (option instanceof MdHr) {
        options.push({
          element: option,
          type: "hr",
          children: [],
        });
      }
    });
  }

  private updateSlottedOptions() {
    this.options = [];
    this.convertAndMoveOptions(this.menu, this.options);
    this.requestUpdate();
  }

  private renderMenu(items: MenuItem[]): TemplateResult<1> {
    return html`${items.map((node) => {
      const option = node.element;
      return html`${choose(node.type, [
        [
          "option",
          () =>
            html` <option
              .value="${(option as MdOption).value}"
              ?selected="${(option as MdOption).selected}"
            >
              ${option.textContent}
            </option>`,
        ],
        [
          "optgroup",
          () =>
            html` <optgroup .label="${(option as MdOptGroup).label}">
              ${this.renderMenu(node.children)}
            </optgroup>`,
        ],
        ["hr", () => html` <hr />`],
      ])}`;
    })}`;
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
          ${this.renderMenu(this.options)}
        </select>
        <slot @slotchange=${this.updateSlottedOptions}></slot>

        <md-icon slot="trailing"> ${unsafeSVG(search)} </md-icon>
      </md-text-field>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-select": Select;
  }
}
