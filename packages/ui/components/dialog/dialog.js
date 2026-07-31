import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./dialog.css?inline";

import "../icon-button/icon-button.js";
import "../icon/icon.js";

/**
 * @tag md-dialog
 * @summary Material Dialog web component
 */

@customElement("md-dialog")
export default class MdDialog extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** The state indicating whether the dialog is open. */
    isOpen: { type: Boolean, state: true },
    /** The state indicating whether the dialog is in the process of opening. */
    isOpening: { type: Boolean, state: true },
    /** The type associated with the dialog. */
    type: {},
    /** Property that reflects the open state of the dialog. */
    open: { type: Boolean, attribute: true, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {boolean} */
    this.isOpen = false;

    /** @type {boolean} */
    this.isOpening = false;

    this.type = nothing;
  }

  /** @returns {HTMLDialogElement | undefined} */
  get dialog() {
    return /** @type {HTMLDialogElement | undefined} */ (
      this.renderRoot?.querySelector("dialog") ?? undefined
    );
  }

  get open() {
    return this.isOpen;
  }

  /** @param {boolean} open */
  set open(open) {
    if (open === this.isOpen) {
      return;
    }

    this.isOpen = open;
    if (open) {
      this.setAttribute("open", "");
      this.show();
    } else {
      this.removeAttribute("open");
      this.close();
    }
  }

  show() {
    this.isOpening = true;
    const dialog = this.dialog;

    if (!dialog || dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }
    const preventOpen = !this.dispatchEvent(
      new Event("open", { cancelable: true }),
    );
    if (preventOpen) {
      this.open = false;
      return;
    }
    dialog.showModal();
    this.open = true;
    /** @type {HTMLElement | null} */ (
      this.querySelector("[autofocus]")
    )?.focus();
    this.dispatchEvent(new Event("opened"));
    this.isOpening = false;
  }

  async close() {
    this.isOpening = false;
    const dialog = this.dialog;
    // Check if already closed or if `dialog.show()` was called while awaiting.
    if (!dialog || !dialog.open || this.isOpening) {
      this.open = false;
      return;
    }
    dialog.close();
    this.open = false;
    this.dispatchEvent(new Event("closed"));
  }

  render() {
    return html`<dialog
      modal-mode="mega"
      ?open=${this.isOpen}
      class="dialog"
      @close=${this.close}
    >
      <header class="dialog__header">
        <slot name="headline"></slot>
      </header>
      <div class="dialog__body">
        <slot></slot>
      </div>
      <footer class="dialog__footer">
        <slot name="footer"></slot>
      </footer>
    </dialog>`;
  }
}
