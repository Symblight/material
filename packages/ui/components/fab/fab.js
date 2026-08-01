import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { customElement } from "lit/decorators.js";

import { BaseButton } from "../button/base-button.js";

import "../ripple/ripple.js";

import styles from "./fab.css?inline";
import buttonStyles from "../button/base-button.css?inline";
import surfaceStyles from "./surface-fab.css?inline";
import primaryStyles from "./primary-fab.css?inline";
import secondaryStyles from "./secondary-fab.css?inline";
import tertiaryStyles from "./tertiary-fab.css?inline";

/** @typedef {"surface" | "primary" | "secondary" | "tertiary"} FABButtonVariant */
const VALID_VARIANTS = ["surface", "primary", "secondary", "tertiary"];

/** @typedef {"s" | "m" | "l"} FABButtonSize */
const VALID_SIZES = ["s", "m", "l"];

/**
 * @tag md-fab
 * @summary Material Floating action button web component
 */
@customElement("md-fab")
export default class FAB extends BaseButton {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** The variant style of the button. */
    variant: {},
    /** The variant size of the button. */
    size: {},
    label: { type: String, attribute: true },
    /** Tracks whether the button or link is focused. */
    focused: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [
      styles,
      buttonStyles,
      surfaceStyles,
      primaryStyles,
      secondaryStyles,
      tertiaryStyles,
    ];
  }

  constructor() {
    super();

    /**
     * The variant style of the button.
     * @type {FABButtonVariant}
     */
    this._variant = "surface";

    /**
     * The variant size of the button.
     * @type {FABButtonSize}
     */
    this._size = "m";

    /** @type {string} */
    this.label = "";

    /** @type {boolean} */
    this.focused = false;
  }

  /** @returns {FABButtonVariant} */
  get variant() {
    return this._variant;
  }

  /** @param {FABButtonVariant} variant */
  set variant(variant) {
    if (variant === this.variant) return;

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "surface";
      return;
    }
    this.setAttribute("variant", variant);
  }

  /** @returns {FABButtonSize} */
  get size() {
    return this._size;
  }

  /** @param {FABButtonSize} size */
  set size(size) {
    if (size === this.size) return;

    if (!VALID_SIZES.includes(size)) {
      this._size = "m";
      return;
    }
    this.setAttribute("size", size);
  }

  get classes() {
    return classMap({
      button_disabled: this.disabled,
      button_icon: this.hasIcon,
      button_focused: this.focused,
      button_label: !!this.label,
    });
  }

  handleFocus = () => {
    if (this.disabled) return;
    this.focused = this.buttonOrAnchor?.matches(":focus") ?? false;
  };

  renderIcon() {
    return html`<slot ?icon-only=${this.slotHasContent} name="icon"> </slot> `;
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
        ${this.label}
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
        ?aria-busy=${this.loading}
        @focus=${this.handleFocus}
        @blur=${this.handleFocus}
      >
        ${this.renderChildrenContent()}
      </a>`;
    }
    return html` <button
      part="button"
      type=${this.type}
      id="button"
      class="button ${this.classes}"
      ?disabled=${this.disabled}
      aria-busy=${this.loading}
      @focus=${this.handleFocus}
      @blur=${this.handleFocus}
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
