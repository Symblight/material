import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";
import { submit } from "@open-wc/form-helpers";

import "../spin/spin.ts";

import styles from "./icon-button.css?inline";
import filledStyles from "./filled-icon-button.css?inline";
import standardStyles from "./standard-icon-button.css?inline";
import outlinedStyles from "./outlined-icon-button.css?inline";
import tonalStyles from "./tonal-icon-button.css?inline";

export type IconButtonVariant = "filled" | "standard" | "outlined" | "tonal";

const VALID_VARIANTS = ["filled", "standard", "outlined", "tonal"];

/**
 * @tag md-icon-button
 * @summary Material Button web component
 */
@customElement("md-icon-button")
export default class IconButton extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * The form associated with the button.
   * Type: String or HTMLFormElement
   */
  @property({ type: String })
  accessor form: HTMLFormElement | string;

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

  /**
   * The type of the button.
   */
  @property()
  accessor type: HTMLButtonElement["type"] = "button";

  /**
   * The href link for the button.
   */
  @property({ type: String, attribute: true })
  accessor href: boolean = false;

  /**
   * Indicates whether the button is disabled.
   */
  @property({ type: Boolean, attribute: true })
  accessor disabled: boolean = false;

  @property({ type: Boolean, attribute: true, reflect: true })
  accessor selected: boolean = false;

  /**
   * Tracks whether the button slot has content.
   */
  @state()
  accessor slotHasContent = false;

  /**
   * The icon associated with the button.
   */
  @state()
  accessor icon: Node | null = null;

  @state()
  accessor childrenContent: Node | null | string = null;

  static get styles(): CSSResultGroup {
    return [styles, filledStyles, standardStyles, outlinedStyles, tonalStyles] as unknown as CSSResultOrNative[];
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);

    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", this.variant);
    }
  }

  private handleClick() {
    if (this.type === "submit") {
      let targetForm: HTMLFormElement;

      if (this.form instanceof HTMLFormElement) {
        targetForm = this.form;
      } else if (typeof this.form === "string") {
        targetForm = document.getElementById(this.form) as HTMLFormElement;
      } else {
        targetForm = this.closest("form") as HTMLFormElement;
      }

      if (targetForm) {
        submit(targetForm);
      }
    }

    this.selected = !this.selected;
  }

  handleSlotchange(e: Event) {
    const childNodes = (e.target as HTMLSlotElement).assignedNodes({
      flatten: true,
    }) as Element[];

    this.childrenContent = childNodes
      .map((node) => (node.textContent ? node.textContent : ""))
      .join("")
      .trim();
  }

  get assignedNodesList() {
    const slotSelector = "slot:not([name])";
    const slotEl = this.renderRoot?.querySelector(
      slotSelector
    ) as HTMLSlotElement;
    return slotEl?.assignedNodes() ?? [];
  }

  private get classes() {
    return classMap({
      "icon-button_disabled": this.disabled,
    });
  }

  private renderIcon() {
    return html` ${when(
      this.selected,
      () => html`<slot name="selected"></slot>`,
      () => html`<slot></slot>`,
    )}`;
  }

  private renderButtonOrLink() {
    if (this.href) {
      return html`<a
        role="button"
        part="button"
        class="icon-button ${this.classes}"
        href=${this.href}
      >
        ${this.renderIcon()}
      </a>`;
    }
    return html` <button
      part="button"
      type=${this.type}
      class="icon-button ${this.classes}"
      ?disabled=${this.disabled}
      @click=${this.handleClick}
    >
      ${this.renderIcon()}
    </button>`;
  }

  override render() {
    return html` ${this.renderButtonOrLink()} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-icon-button": IconButton;
  }
}
