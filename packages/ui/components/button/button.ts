import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";
import { submit } from "@open-wc/form-helpers";

import MdRipple from "../ripple/ripple";

import "../progress-circular/progress-circular.ts";
import "../shadow/shadow.ts";
import "../ripple/ripple.ts";

import styles from "./button.css?inline";
import filledStyles from "./filled-button.css?inline";
import elevatedStyles from "./elevated-button.css?inline";
import outlinedStyles from "./outlined-button.css?inline";
import textStyles from "./text-button.css?inline";
import tonalStyles from "./tonal-button.css?inline";

export type ButtonVariant =
  | "filled"
  | "outlined"
  | "text"
  | "elevated"
  | "tonal";
const VALID_VARIANTS = ["filled", "outlined", "text", "elevated", "tonal"];

/**
 * @tag md-button
 * @summary Material Button web component
 */
@customElement("md-button")
export default class Button extends LitElement {
  private _observer;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  constructor() {
    super();
    this.slotHasContent = false;

    this._observer = new MutationController(this, {
      config: {
        characterData: true,
        subtree: true,
      },
    });

    this._observer.callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "characterData") {
          this.manageTextObservedSlot();
          return;
        }
      }
    };
  }

  /**
   * The form associated with the button.
   * Type: String or HTMLFormElement
   */
  @property({ type: String })
  accessor form: HTMLFormElement | undefined;

  /**
   * The variant style of the button.
   */
  private _variant: ButtonVariant = "filled";

  public get variant(): ButtonVariant {
    return this._variant;
  }

  @property()
  public set variant(variant: ButtonVariant) {
    if (variant === this.variant) return;

    if (!VALID_VARIANTS.includes(variant)) {
      this._variant = "filled";
      return;
    }
    this.setAttribute("variant", variant);
  }

  /**
   * The type of the button.
   */
  @property()
  accessor type: HTMLButtonElement["type"] = "button";

  /**
   * Indicates a danger state for the button.
   */
  @property({ type: Boolean, attribute: true })
  accessor danger: boolean = false;

  /**
   * Indicates a loading state for the button.
   */
  @property({ type: Boolean, attribute: true })
  accessor loading: boolean = false;

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

  @query(".button")
  accessor buttonOrAnchor: HTMLButtonElement | HTMLAnchorElement | undefined;

  @query("md-ripple")
  accessor ripple: MdRipple | undefined;

  /**
   * The focused state.
   */
  @state()
  accessor focused: boolean = false;

  @state()
  accessor childrenContent: Node | null | string = null;

  static get styles(): CSSResultGroup {
    return [
      filledStyles,
      elevatedStyles,
      outlinedStyles,
      textStyles,
      tonalStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }
  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this.handleClick);
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
  }

  private handleFocus() {
    if (this.disabled) return;
    this.focused = this.buttonOrAnchor?.matches(":focus") ?? false;
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
      slotSelector,
    ) as HTMLSlotElement;
    return slotEl?.assignedNodes() ?? [];
  }

  manageTextObservedSlot() {
    const assignedNodes = [...(this.assignedNodesList as Element[])].filter(
      (node) => {
        if (node.tagName) {
          return true;
        }
        return node.textContent ? node.textContent.trim() : false;
      },
    );

    this.slotHasContent = assignedNodes.length > 0;
  }

  updateChildren() {
    const iconSlot = this.shadowRoot?.querySelector(
      'slot[name="icon"]',
    ) as HTMLSlotElement;
    const icon = !iconSlot
      ? []
      : iconSlot.assignedElements().map((element) => {
          const newElement = element.cloneNode(true) as HTMLElement;
          newElement.removeAttribute("slot");
          return newElement;
        });

    this.manageTextObservedSlot();
    const [iconEl] = icon;
    this.icon = iconEl;
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);
    this.updateComplete.then(() => {
      this.updateChildren();
    });

    if (!this.hasAttribute("variant")) {
      this.setAttribute("variant", this.variant);
    }
  }

  private get classes() {
    return classMap({
      button_disabled: this.disabled,
      button_danger: this.danger,
      button_loading: this.loading,
      button_icon: !!this.icon,
      button_focused: this.focused,
    });
  }

  private renderIcon() {
    return html`${when(
        this.loading,
        () =>
          html`<div
            class="button__loading ${classMap({
              button__icon: !!this.childrenContent,
            })}"
          >
            <md-progress-circular
              class="button__progress-circular"
            ></md-progress-circular>
          </div>`,
      )}
      <slot ?icon-only=${this.slotHasContent} name="icon"> </slot> `;
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
        <slot @slotchange=${this.handleSlotchange}></slot>
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
    "md-button": Button;
  }
}
