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
    /** The type associated with the dialog. */
    type: {},
    /** Whether the dialog is open. */
    open: { type: Boolean, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.type = nothing;

    /** @type {boolean} */
    this.open = false;
  }

  /** @returns {HTMLDialogElement | undefined} */
  get dialog() {
    return /** @type {HTMLDialogElement | undefined} */ (
      this.renderRoot?.querySelector("dialog") ?? undefined
    );
  }

  /**
   * All native `<dialog>` side effects live here, gated on the `open` property
   * having changed. `updated()` only ever runs after `render()` has populated
   * `renderRoot`, so `this.dialog` is guaranteed to exist — including on the
   * very first update, whether `open` was set via `.show()`, direct property
   * assignment, or attribute reflection from server-rendered markup.
   * @param {import("lit").PropertyValues} changedProperties
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (!changedProperties.has("open")) {
      return;
    }

    const dialog = this.dialog;
    if (!dialog) {
      return;
    }

    if (this.open) {
      if (dialog.open) {
        return;
      }

      const preventOpen = !this.dispatchEvent(
        new Event("open", { cancelable: true }),
      );
      if (preventOpen) {
        this.open = false;
        return;
      }

      try {
        dialog.showModal();
      } catch {
        // e.g. disconnected before this ran — don't leave state claiming "open"
        this.open = false;
        return;
      }
      /** @type {HTMLElement | null} */ (
        this.querySelector("[autofocus]")
      )?.focus();
      this.dispatchEvent(new Event("opened"));
    } else if (dialog.open) {
      dialog.close();
      this.dispatchEvent(new Event("closed"));
    }
  }

  async show() {
    this.open = true;
    await this.updateComplete;
  }

  async close() {
    this.open = false;
    await this.updateComplete;
  }

  /** Syncs state back when the native `<dialog>` closes itself (Escape, `<form method="dialog">`). */
  handleNativeClose() {
    if (this.open) {
      this.open = false;
    }
  }

  render() {
    return html`<dialog
      modal-mode="mega"
      class="dialog"
      @close=${this.handleNativeClose}
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
