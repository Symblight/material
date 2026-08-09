import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../progress-circular/progress-circular.js";
import "../shadow/shadow.js";
import "../ripple/ripple.js";

import baseStyles from "./base-button.css?inline";
import styles from "./button.css?inline";
import filledStyles from "./filled-button.css?inline";
import elevatedStyles from "./elevated-button.css?inline";
import outlinedStyles from "./outlined-button.css?inline";
import textStyles from "./text-button.css?inline";
import tonalStyles from "./tonal-button.css?inline";
import { BaseButton } from "./base-button.js";

export const VALID_VARIANTS = [
  "filled",
  "outlined",
  "text",
  "elevated",
  "tonal",
];

/** @typedef {"filled" | "outlined" | "text" | "elevated" | "tonal"} ButtonVariant */

/**
 * @tag md-button
 * @summary Material Button web component
 */
@customElement("md-button")
export default class Button extends BaseButton {
  constructor() {
    super();

    /**
     * The variant style of the button.
     * @type {ButtonVariant}
     */
    this._variant = "filled";
  }

  /** @param {ButtonVariant} value */
  set variant(value) {
    this._variant = VALID_VARIANTS.includes(value) ? value : "filled";
    this.setAttribute("variant", this._variant);
    this.requestUpdate("variant", this._variant);
  }

  /** @returns {ButtonVariant} */
  get variant() {
    return this._variant;
  }

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [
      filledStyles,
      elevatedStyles,
      outlinedStyles,
      textStyles,
      tonalStyles,
      styles,
      baseStyles,
    ];
  }

  get classes() {
    return classMap({
      button_disabled: this.disabled,
      button_loading: this.loading,
      button_icon: this.hasIcon,
    });
  }

  /** @param {import("lit").PropertyValues} changes */
  firstUpdated(changes) {
    super.firstUpdated(changes);
    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", this.variant);
    }
  }

  renderIcon() {
    return html`${when(
        this.loading,
        () =>
          html`<div
            class="button__loading ${classMap({
              "button__icon-wrapper": !!this.childrenContent,
            })}"
          >
            <md-progress-circular
              class="button__progress-circular"
            ></md-progress-circular>
          </div>`,
      )}
      <slot part="icon" @slotchange=${this.updateChildren} name="icon"></slot>`;
  }

  renderChildrenContent() {
    return html`
      ${this.renderIcon()}
      <span
        id="label"
        part="label"
        class="button__content ${classMap({
          button__content_hidden: !this.childrenContent,
        })}"
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
    `;
  }

  renderButtonOrLink() {
    if (this.href) {
      return html`<a
        role="button"
        part="button"
        class="button ${this.classes}"
        href=${this.href}
        aria-disabled=${this.disabled}
        tabindex=${this.disabled ? -1 : 0}
        ?aria-busy=${this.loading}
      >
        ${this.renderChildrenContent()}
      </a>`;
    }
    return html`<button
      part="button"
      type=${this.type}
      id="button"
      class="button ${this.classes}"
      ?disabled=${this.disabled}
      aria-busy=${this.loading}
    >
      ${this.renderChildrenContent()}
    </button>`;
  }

  render() {
    return html`
      <md-shadow></md-shadow>
      <md-ripple class="button__ripple" for="button"></md-ripple>
      ${this.renderButtonOrLink()}
    `;
  }
}
