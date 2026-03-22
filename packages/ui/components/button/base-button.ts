import { LitElement, isServer } from "lit";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";
import { property, query, state } from "lit/decorators.js";
import { submit } from "@open-wc/form-helpers";

import MdRipple from "../ripple/ripple";

export abstract class BaseButton extends LitElement {
  private _observer;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected constructor() {
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
  form: HTMLFormElement | undefined;

  /**
   * The type of the button.
   */
  @property()
  type: HTMLButtonElement["type"] = "button";

  /**
   * Indicates a loading state for the button.
   */
  @property({ type: Boolean, attribute: true })
  loading: boolean = false;

  /**
   * The href link for the button.
   */
  @property({ type: String, attribute: true })
  href: string | undefined = undefined;

  /**
   * Indicates whether the button is disabled.
   */
  @property({ type: Boolean, attribute: true })
  disabled: boolean = false;

  /**
   * Tracks whether the button slot has content.
   */
  @state()
  slotHasContent = false;

  /**
   * Whether an icon is slotted into the button.
   */
  @state()
  hasIcon: boolean = false;

  @query(".button")
  buttonOrAnchor: HTMLButtonElement | HTMLAnchorElement | undefined;

  @query("md-ripple")
  ripple: MdRipple | undefined;

  @state()
  childrenContent: Node | null | string = null;

  connectedCallback(): void {
    super.connectedCallback();

    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (!isServer) {
      this.removeEventListener("click", this.handleClick);
    }
  }

  handleClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    if (this.type === "submit") {
      let targetForm: HTMLFormElement;

      if (this.form instanceof HTMLFormElement) {
        targetForm = this.form;
      } else {
        targetForm = this.closest("form") as HTMLFormElement;
      }

      if (targetForm) {
        submit(targetForm);
      }
    }
  }

  handleSlotChange(e: Event) {
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

    this.hasIcon = iconSlot ? iconSlot.assignedElements().length > 0 : false;
    this.manageTextObservedSlot();
  }

  firstUpdated(changes: any) {
    super.firstUpdated(changes);
    this.updateComplete.then(() => {
      this.updateChildren();
    });
  }
}
