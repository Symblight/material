import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { createContext } from "@lit/context";
import { live } from "lit/directives/live.js";
import { choose } from "lit/directives/choose.js";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import search from "@material-design-icons/svg/outlined/arrow_drop_down.svg?raw";

/** @import { TextField, TextFieldVariant } from "../text-field/text-field.js" */
import { MdOption } from "./option.js";

import "./option.js";
import "./group.js";
import "./hr.js";

import "../text-field/text-field.js";

import styles from "./select.css?inline";
import { MdOptGroup } from "./group.js";
import { MdHr } from "./hr.js";

/**
 * @typedef {import("@lit/context").Context<symbol, { registerBlockConsumer: (option: MdOption) => void }>} ContextSelect
 */

/** @type {ContextSelect} */
export const selectContext = createContext(Symbol("select"));

/**
 * @tag md-select
 * @summary Material Select web component
 */

/** @typedef {MdOption | MdOptGroup | MdHr} MenuElementItem */
/**
 * @typedef {object} MenuItem
 * @property {"option" | "optgroup" | "hr"} type
 * @property {MenuElementItem} element
 * @property {MenuItem[]} children
 */

const internals = Symbol("internals");

@customElement("md-select")
export default class Select extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    firstOptionValue: { state: true },
    options: { state: true },
    disabled: { type: Boolean, reflect: true },
    value: { type: String, attribute: true },
    required: { type: Boolean, reflect: true },
    name: { type: String, attribute: true },
    label: { type: String, attribute: true },
    /** The variant style of the textField. */
    variant: {},
    multiple: { type: Boolean, reflect: true },
    size: { type: Number },
  };

  static formAssociated = true;

  /** @type {ElementInternals} */
  [internals];

  /** @type {ShadowRootInit} */
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  constructor() {
    super();

    /** @type {string} */
    this.firstOptionValue = "";

    /** @type {MenuItem[]} */
    this.options = [];

    this[internals] = this.attachInternals();

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

    /** @type {boolean} */
    this.multiple = false;

    /** @type {number} */
    this.size = 0;
  }

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  get form() {
    return this[internals].form;
  }

  /** @returns {TextField | null} */
  get textField() {
    return /** @type {TextField | null} */ (
      this.renderRoot?.querySelector("md-text-field")
    );
  }

  /** @returns {HTMLSelectElement} */
  get select() {
    return /** @type {HTMLSelectElement} */ (
      this.renderRoot?.querySelector("select")
    );
  }

  /** @returns {(MdOption | MdOptGroup | MdHr)[]} */
  get menu() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    return /** @type {(MdOption | MdOptGroup | MdHr)[]} */ (
      slot?.assignedElements() ?? []
    );
  }

  /** @param {import("lit").PropertyValues} _changedProperties */
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    if (this.textField) {
      this.textField.value = " ";
    }
  }

  formResetCallback() {
    this.setValue(this.firstOptionValue);
    if (this.multiple) {
      this.options.forEach((item) => {
        if (item.type === "option") {
          /** @type {MdOption} */ (item.element).selected = false;
        }
      });
    }
  }

  /** @param {string} value */
  setValue(value) {
    this.value = value;
    this[internals].setFormValue(value);
  }

  /** @param {Event} event */
  handleChange(event) {
    const value = /** @type {HTMLSelectElement} */ ((event.target) || null)
      ?.value;
    this.setValue(value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /**
   * @param {MenuItem[]} items
   * @returns {string}
   */
  collectFirstOptionValue(items) {
    for (const item of items) {
      if (item.type === "option") {
        return /** @type {MdOption} */ (item.element).value;
      }
      if (item.type === "optgroup" && item.children.length) {
        const found = this.collectFirstOptionValue(item.children);
        if (found !== "") return found;
      }
    }
    return "";
  }

  /**
   * @param {Element[]} items
   * @param {MenuItem[]} options
   */
  convertAndMoveOptions(items, options = []) {
    items.forEach((option) => {
      if (option instanceof MdOption) {
        options.push({
          element: option,
          type: "option",
          children: [],
        });
      }

      if (option instanceof MdOptGroup) {
        /** @type {MenuItem[]} */
        const childrenOptions = [];
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

  updateSlottedOptions() {
    this.options = [];
    this.convertAndMoveOptions(this.menu, this.options);

    // Determine the reset value: first selected option, fallback to first option
    const selectedOption = this.options.find(
      (item) =>
        item.type === "option" &&
        /** @type {MdOption} */ (item.element).selected,
    );
    this.firstOptionValue = selectedOption
      ? /** @type {MdOption} */ (selectedOption.element).value
      : this.collectFirstOptionValue(this.options);

    this.requestUpdate();

    // After render, imperatively sync select.value if value prop is set
    this.updateComplete.then(() => {
      if (this.value !== undefined && this.select) {
        this.select.value = this.value;
      }
    });
  }

  /**
   * @param {MenuItem[]} items
   * @returns {import("lit").TemplateResult<1>}
   */
  renderMenu(items) {
    return html`${items.map((node) => {
      const option = node.element;
      return html`${choose(node.type, [
        [
          "option",
          () =>
            html` <option
              .value="${/** @type {MdOption} */ (option).value}"
              ?selected="${/** @type {MdOption} */ (option).selected}"
            >
              ${option.textContent}
            </option>`,
        ],
        [
          "optgroup",
          () =>
            html` <optgroup
              .label="${/** @type {MdOptGroup} */ (option).label}"
            >
              ${this.renderMenu(node.children)}
            </optgroup>`,
        ],
        ["hr", () => html` <hr />`],
      ])}`;
    })}`;
  }

  render() {
    const ariaLabel = this.getAttribute("aria-label");
    const ariaLabelledBy = this.getAttribute("aria-labelledby");

    return html`
      <md-text-field
        .label="${this.label}"
        part="text-field"
        ?disabled=${this.disabled}
        .variant="${this.variant}"
      >
        <select
          .name=${this.name}
          .value=${live(this.value)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?multiple=${this.multiple}
          .size=${this.size}
          aria-label=${ariaLabel ?? ""}
          aria-labelledby=${ariaLabelledBy ?? ""}
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
