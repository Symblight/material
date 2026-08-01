import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../ripple/ripple.js";

import styles from "./icon-button.css?inline";
import filledStyles from "./filled-icon-button.css?inline";
import standardStyles from "./standard-icon-button.css?inline";
import outlinedStyles from "./outlined-icon-button.css?inline";
import tonalStyles from "./tonal-icon-button.css?inline";
import { BaseButton } from "../button/base-button.js";

/** @typedef {"filled" | "standard" | "outlined" | "tonal"} IconButtonVariant */

const VALID_VARIANTS = ["filled", "standard", "outlined", "tonal"];

/**
 * @tag md-icon-button
 * @summary Material Button web component
 */
@customElement("md-icon-button")
export default class IconButton extends BaseButton {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** The variant style of the button. */
    variant: {},
    selected: { type: Boolean, attribute: true, reflect: true },
    toggle: { type: Boolean, attribute: true, reflect: true },
    /** The icon associated with the button. */
    selectedIcon: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [filledStyles, standardStyles, outlinedStyles, tonalStyles, styles];
  }

  constructor() {
    super();

    /**
     * The variant style of the button.
     * @type {IconButtonVariant}
     */
    this._variant = "standard";

    /** @type {boolean} */
    this.selected = false;

    /** @type {boolean} */
    this.toggle = false;

    /** @type {Node | null} */
    this.selectedIcon = null;
  }

  /** @returns {IconButtonVariant} */
  get variant() {
    return this._variant;
  }

  /** @param {IconButtonVariant} variant */
  set variant(variant) {
    if (variant === this.variant) return;

    this.requestUpdate("variant", this.variant);

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "standard";
      return;
    }
    this._variant = variant;

    this.setAttribute("variant", this.variant);
  }

  /** @param {import("lit").PropertyValues} changes */
  firstUpdated(changes) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", this.variant);
    }
  }

  get classes() {
    return classMap({
      "icon-button_disabled": this.disabled,
    });
  }

  renderIcon() {
    return html` ${when(
      this.toggle && this.selected,
      () => html`<slot name="selected"></slot>`,
      () => html`<slot></slot>`,
    )}`;
  }

  renderButtonOrLink() {
    if (this.href) {
      return html`<a
        role="button"
        part="button"
        id="button"
        class="icon-button ${this.classes}"
        href=${this.href}
      >
        ${this.renderIcon()}
      </a>`;
    }
    return html` <button
      part="button"
      id="button"
      type=${this.type}
      class="icon-button ${this.classes}"
      ?disabled=${this.disabled}
    >
      ${this.renderIcon()}
    </button>`;
  }

  render() {
    return html`
      <md-ripple class="icon-button__ripple" for="button"></md-ripple>
      ${this.renderButtonOrLink()}
    `;
  }
}
