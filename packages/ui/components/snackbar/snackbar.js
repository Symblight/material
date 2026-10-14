import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import closeIcon from "@material-design-icons/svg/outlined/close.svg?raw";

import "../shadow/shadow.js";
import "../icon/icon.js";
import "../icon-button/icon-button.js";

import styles from "./snackbar.css?inline";

/**
 * @tag md-snackbar
 * @summary Material Design 3 snackbar (purely presentational).
 *
 * Renders the snackbar surface only. It has no `open` state, timers, queueing,
 * animations or screen positioning — showing, hiding and placing it is the
 * consumer's responsibility. The close icon button only dispatches a `close`
 * event; it never hides the snackbar itself.
 *
 * @slot - Supporting text.
 * @slot action - Optional action, typically `<md-button variant="text">`.
 *
 * @fires close - Dispatched when the close icon button is clicked. Bubbles,
 *   composed, cancelable.
 *
 * @csspart surface - The snackbar container.
 * @csspart text - Supporting text wrapper.
 * @csspart action - Action wrapper.
 * @csspart close - The close icon button.
 *
 * @cssprop --md-snackbar-container-color - Container color.
 * @cssprop --md-snackbar-supporting-text-color - Supporting text color.
 * @cssprop --md-snackbar-action-color - Slotted action label color.
 * @cssprop --md-snackbar-icon-color - Close icon color.
 * @cssprop --md-snackbar-shape - Container corner radius.
 * @cssprop --md-snackbar-min-inline-size - Minimum width.
 * @cssprop --md-snackbar-max-inline-size - Maximum width.
 * @cssprop --md-snackbar-text-font - Supporting text font family.
 * @cssprop --md-snackbar-text-size - Supporting text font size.
 * @cssprop --md-snackbar-text-line-height - Supporting text line height.
 * @cssprop --md-snackbar-text-weight - Supporting text font weight.
 * @cssprop --md-snackbar-text-tracking - Supporting text letter spacing.
 */
@customElement("md-snackbar")
export class MdSnackbar extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Shows a close icon button that dispatches `close` when clicked. */
    showClose: { type: Boolean, attribute: "show-close", reflect: true },
    /** Two-line layout: raises the minimum height to 68dp. */
    multiline: { type: Boolean, reflect: true },
    /** Longer-action layout: the action moves below the supporting text. */
    stacked: { type: Boolean, reflect: true },
    /** Accessible label of the close icon button. */
    closeLabel: { type: String, attribute: "close-label" },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {boolean} */
    this.showClose = false;

    /** @type {boolean} */
    this.multiline = false;

    /** @type {boolean} */
    this.stacked = false;

    /** @type {string} */
    this.closeLabel = "Close";
  }

  /** Whether the `action` slot has content. */
  #hasAction = false;

  /** @param {Event} event */
  #onActionSlotChange(event) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    const hasAction = slot.assignedNodes({ flatten: true }).length > 0;
    if (hasAction === this.#hasAction) return;
    this.#hasAction = hasAction;
    this.requestUpdate();
  }

  #onCloseClick() {
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }

  render() {
    return html`
      <div
        part="surface"
        class="md-snackbar ${classMap({
          "md-snackbar--multiline": this.multiline || this.stacked,
          "md-snackbar--stacked": this.stacked,
          "md-snackbar--has-action": this.#hasAction,
          "md-snackbar--has-close": this.showClose,
        })}"
        role="status"
        aria-live="polite"
      >
        <md-shadow level="3"></md-shadow>
        <div part="text" class="md-snackbar__text"><slot></slot></div>
        <div
          part="action"
          class="md-snackbar__action"
          ?hidden=${!this.#hasAction}
        >
          <slot name="action" @slotchange=${this.#onActionSlotChange}></slot>
        </div>
        ${
          this.showClose
            ? html`<md-icon-button
                part="close"
                class="md-snackbar__close"
                aria-label=${this.closeLabel}
                @click=${this.#onCloseClick}
              >
                <md-icon>${unsafeSVG(closeIcon)}</md-icon>
              </md-icon-button>`
            : null
        }
      </div>
    `;
  }
}
