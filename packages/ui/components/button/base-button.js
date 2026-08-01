import { LitElement, isServer } from "lit";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";
import { submit } from "@open-wc/form-helpers";

/** @import MdRipple from "../ripple/ripple.js" */

export class BaseButton extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /**
     * The form associated with the button.
     * Type: String or HTMLFormElement
     */
    form: { type: String },
    /** The type of the button. */
    type: {},
    /** Indicates a loading state for the button. */
    loading: { type: Boolean, attribute: true },
    /** The href link for the button. */
    href: { type: String, attribute: true },
    /** Indicates whether the button is disabled. */
    disabled: { type: Boolean, attribute: true },
    /** Tracks whether the button slot has content. */
    slotHasContent: { state: true },
    /** Whether an icon is slotted into the button. */
    hasIcon: { state: true },
    childrenContent: { state: true },
  };

  /** @type {ShadowRootInit} */
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  constructor() {
    super();

    /** @type {HTMLFormElement | undefined} */
    this.form = undefined;

    /** @type {HTMLButtonElement["type"]} */
    this.type = "button";

    /** @type {boolean} */
    this.loading = false;

    /** @type {string | undefined} */
    this.href = undefined;

    /** @type {boolean} */
    this.disabled = false;

    this.slotHasContent = false;

    /** @type {boolean} */
    this.hasIcon = false;

    /** @type {Node | null | string} */
    this.childrenContent = null;

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

  /** @returns {HTMLButtonElement | HTMLAnchorElement | undefined} */
  get buttonOrAnchor() {
    return /** @type {HTMLButtonElement | HTMLAnchorElement | undefined} */ (
      this.renderRoot?.querySelector(".button") ?? undefined
    );
  }

  /** @returns {MdRipple | undefined} */
  get ripple() {
    return /** @type {MdRipple | undefined} */ (
      this.renderRoot?.querySelector("md-ripple") ?? undefined
    );
  }

  connectedCallback() {
    super.connectedCallback();

    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (!isServer) {
      this.removeEventListener("click", this.handleClick);
    }
  }

  /** @param {Event} event */
  handleClick(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    if (this.type === "submit") {
      /** @type {HTMLFormElement} */
      let targetForm;

      if (this.form instanceof HTMLFormElement) {
        targetForm = this.form;
      } else {
        targetForm = /** @type {HTMLFormElement} */ (this.closest("form"));
      }

      if (targetForm) {
        submit(targetForm);
      }
    }
  }

  /** @param {Event} e */
  handleSlotChange(e) {
    const childNodes = /** @type {Element[]} */ (
      /** @type {HTMLSlotElement} */ (e.target).assignedNodes({
        flatten: true,
      })
    );

    this.childrenContent = childNodes
      .map((node) => (node.textContent ? node.textContent : ""))
      .join("")
      .trim();
  }

  get assignedNodesList() {
    const slotSelector = "slot:not([name])";
    const slotEl = /** @type {HTMLSlotElement} */ (
      this.renderRoot?.querySelector(slotSelector)
    );
    return slotEl?.assignedNodes() ?? [];
  }

  manageTextObservedSlot() {
    const assignedNodes = [
      .../** @type {Element[]} */ (this.assignedNodesList),
    ].filter((node) => {
      if (node.tagName) {
        return true;
      }
      return node.textContent ? node.textContent.trim() : false;
    });

    this.slotHasContent = assignedNodes.length > 0;
  }

  updateChildren() {
    const iconSlot = /** @type {HTMLSlotElement} */ (
      this.shadowRoot?.querySelector('slot[name="icon"]')
    );

    this.hasIcon = iconSlot ? iconSlot.assignedElements().length > 0 : false;
    this.manageTextObservedSlot();
  }

  /** @param {import("lit").PropertyValues} changes */
  firstUpdated(changes) {
    super.firstUpdated(changes);
    this.updateComplete.then(() => {
      this.updateChildren();
    });
  }
}
