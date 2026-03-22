import { CSSResultGroup, CSSResultOrNative, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../progress-circular/progress-circular.ts";
import "../shadow/shadow.ts";
import "../ripple/ripple.ts";

import baseStyles from "./base-button.css?inline";
import styles from "./button.css?inline";
import filledStyles from "./filled-button.css?inline";
import elevatedStyles from "./elevated-button.css?inline";
import outlinedStyles from "./outlined-button.css?inline";
import textStyles from "./text-button.css?inline";
import tonalStyles from "./tonal-button.css?inline";
import { BaseButton } from "./base-button.ts";

const VALID_VARIANTS = [
  "filled",
  "outlined",
  "text",
  "elevated",
  "tonal",
] as const;

export type ButtonVariant = (typeof VALID_VARIANTS)[number];

/**
 * @tag md-button
 * @summary Material Button web component
 */
@customElement("md-button")
export default class Button extends BaseButton {
  /*
   * The variant style of the button.
   */
  @property({ reflect: true })
  variant: ButtonVariant = "filled";

  static get styles(): CSSResultGroup {
    return [
      filledStyles,
      elevatedStyles,
      outlinedStyles,
      textStyles,
      tonalStyles,
      styles,
      baseStyles,
    ] as unknown as CSSResultOrNative[];
  }

  private get classes() {
    return classMap({
      button_disabled: this.disabled,
      button_loading: this.loading,
      button_icon: this.hasIcon,
    });
  }

  private renderIcon() {
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
      <slot
        @slotchange=${this.updateChildren}
        name="icon"
      ></slot>`;
  }

  private renderChildrenContent() {
    return html`
      ${this.renderIcon()}
      <span
        id="label"
        class="button__content ${classMap({
          button__content_hidden: !this.childrenContent,
        })}"
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
    `;
  }

  private renderButtonOrLink() {
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

  override render() {
    return html`
      <md-shadow></md-shadow>
      <md-ripple class="button__ripple" for="button"></md-ripple>
      ${this.renderButtonOrLink()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-button": Button;
  }
}
