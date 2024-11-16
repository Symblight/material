import { CSSResultGroup, CSSResultOrNative, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../ripple/ripple.ts";

import styles from "./icon-button.css?inline";
import filledStyles from "./filled-icon-button.css?inline";
import standardStyles from "./standard-icon-button.css?inline";
import outlinedStyles from "./outlined-icon-button.css?inline";
import tonalStyles from "./tonal-icon-button.css?inline";
import { BaseButton } from "../button/base-button.ts";

export type IconButtonVariant = "filled" | "standard" | "outlined" | "tonal";

const VALID_VARIANTS = ["filled", "standard", "outlined", "tonal"];

/**
 * @tag md-icon-button
 * @summary Material Button web component
 */
@customElement("md-icon-button")
export default class IconButton extends BaseButton {
  /**
   * The variant style of the button.
   */
  private _variant: IconButtonVariant = "standard";

  public get variant(): IconButtonVariant {
    return this._variant;
  }

  @property()
  public set variant(variant: IconButtonVariant) {
    if (variant === this.variant) return;

    this.requestUpdate("variant", this.variant);

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "standard";
      return;
    }
    this._variant = variant;

    this.setAttribute("variant", this.variant);
  }

  @property({ type: Boolean, attribute: true, reflect: true })
  accessor selected: boolean = false;

  @property({ type: Boolean, attribute: true, reflect: true })
  accessor toggle: boolean = false;

  /**
   * The icon associated with the button.
   */
  @state()
  accessor selectedIcon: Node | null = null;

  static get styles(): CSSResultGroup {
    return [
      filledStyles,
      standardStyles,
      outlinedStyles,
      tonalStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", this.variant);
    }
  }

  private get classes() {
    return classMap({
      "icon-button_disabled": this.disabled,
    });
  }

  private renderIcon() {
    return html` ${when(
      this.toggle && this.selected,
      () => html`<slot name="selected"></slot>`,
      () => html`<slot></slot>`
    )}`;
  }

  private renderButtonOrLink() {
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

  override render() {
    return html`
      <!-- <md-ripple class="icon-button__ripple" for="button"></md-ripple> -->
      ${this.renderButtonOrLink()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-icon-button": IconButton;
  }
}
