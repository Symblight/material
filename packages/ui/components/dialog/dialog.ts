import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  nothing,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";

import styles from "./dialog.css?inline";

import "../icon-button/icon-button.ts";
import "../icon/icon.ts";

/**
 * @tag md-dialog
 * @summary Pavetra Dialog web component
 */

@customElement("md-dialog")
export default class MdDialog extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  /**
   * The state indicating whether the dialog is open.
   */
  @property({ type: Boolean, state: true })
  private isOpen: boolean = false;

  /**
   * The state indicating whether the dialog is in the process of opening.
   */
  @property({ type: Boolean, state: true })
  private isOpening: boolean = false;

  /**
   * The type associated with the dialog.
   */
  @property()
  type = nothing;

  /**
   * Reference to the dialog element.
   */
  @query("dialog") dialog: HTMLDialogElement | undefined;

  /**
   * Property that reflects the open state of the dialog.
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  get open() {
    return this.isOpen;
  }

  set open(open: boolean) {
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
    const dialog = this.dialog!;

    if (!dialog || dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }
    const preventOpen = !this.dispatchEvent(
      new Event("open", { cancelable: true })
    );
    if (preventOpen) {
      this.open = false;
      return;
    }
    dialog.showModal();
    this.open = true;
    (this.querySelector("[autofocus]") as HTMLDialogElement)?.focus();
    this.dispatchEvent(new Event("opened"));
    this.isOpening = false;
  }

  async close() {
    this.isOpening = false;
    const dialog = this.dialog!;
    // Check if already closed or if `dialog.show()` was called while awaiting.
    if (!dialog || !dialog.open || this.isOpening) {
      this.open = false;
      return;
    }
    dialog.close();
    this.open = false;
    this.dispatchEvent(new Event("closed"));
  }

  override render() {
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

declare global {
  interface HTMLElementTagNameMap {
    "md-dialog": MdDialog;
  }
}
