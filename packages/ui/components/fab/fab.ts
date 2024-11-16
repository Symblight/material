import {
  CSSResultGroup,
  CSSResultOrNative,
  html,
} from "lit";
import { classMap } from "lit/directives/class-map.js";
import { customElement, property } from "lit/decorators.js";

import { BaseButton } from "../button/base-button.ts";

import styles from "./fab.css?inline";
import buttonStyles from "../button/base-button.css?inline";
import surfaceStyles from "./surface-fab.css?inline";
import primaryStyles from "./primary-fab.css?inline";
import secondaryStyles from "./secondary-fab.css?inline";
import tertiaryStyles from "./tertiary-fab.css?inline";

export type FABButtonVariant = "surface" | "primary" | "secondary" | "tertiary";
const VALID_VARIANTS = ["surface", "primary", "secondary", "tertiary"];

export type FABButtonSize = "s" | "m" | "l";
const VALID_SIZES = ["s", "m", "l"];

/**
 * @tag md-fab
 * @summary Material Floating action button web component
 */
@customElement("md-fab")
export default class FAB extends BaseButton {
  static get styles(): CSSResultGroup {
    return [
      styles,
      buttonStyles,
      surfaceStyles,
      primaryStyles,
      secondaryStyles,
      tertiaryStyles,
    ] as unknown as CSSResultOrNative[];
  }

  /*
   * The variant style of the button.
   */
  private _variant: FABButtonVariant = "surface";

  public get variant(): FABButtonVariant {
    return this._variant;
  }

  @property()
  public set variant(variant: FABButtonVariant) {
    if (variant === this.variant) return;

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "surface";
      return;
    }
    this.setAttribute("variant", variant);
  }

  /*
   * The variant size of the button.
   */
  private _size: FABButtonSize = "m";

  public get size(): FABButtonSize {
    return this._size;
  }

  @property()
  public set size(size: FABButtonSize) {
    if (size === this.size) return;

    if (!VALID_SIZES.includes(size)) {
      this._size = "m";
      return;
    }
    this.setAttribute("size", size);
  }

  @property({ type: String, attribute: true })
  accessor label: string = "";

  private get classes() {
    return classMap({
      button_disabled: this.disabled,
      button_icon: !!this.icon,
      button_focused: this.focused,
      button_label: !!this.label
    });
  }

  private renderIcon() {
    return html`<slot ?icon-only=${this.slotHasContent} name="icon"> </slot> `;
  }

  private renderChildrenContent() {
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
  private renderButtonOrLink() {
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

  override render() {
    return html`
      <md-shadow></md-shadow>
      <!-- <md-ripple class="button__ripple" for="button"></md-ripple> -->
      ${this.renderButtonOrLink()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-fab": FAB;
  }
}
