import { html } from "lit";
import { customElement } from "lit/decorators.js";

import "../shadow/shadow.js";

import { BaseTooltip } from "./base-tooltip.js";

import baseStyles from "./base-tooltip.css?inline";
import styles from "./rich-tooltip.css?inline";

/**
 * @tag md-rich-tooltip
 * @summary Material Design 3 rich tooltip.
 *
 * A larger, elevated tooltip surface (same elevation shadow language as
 * `md-menu`'s `.md-menu__card`, via `md-shadow`) that can contain an
 * optional subhead, longer supporting/body text, and up to two text-button
 * actions.
 *
 * Unlike `md-tooltip`, the surface accepts pointer interaction: moving the
 * pointer from the anchor onto the surface itself cancels the pending hide
 * instead of dismissing it, so a user can reach the action buttons. Closing
 * on outside click/focus-out is still handled for free by
 * `PopoverPositionController` (see `BaseTooltip`) once focus/pointer leaves
 * both the anchor and this surface.
 *
 * Slots:
 * - `subhead` — optional short title above the supporting text.
 * - *(default)* — supporting/body text.
 * - `actions` — up to two text-button actions (e.g. `md-button variant="text"`).
 */
@customElement("md-rich-tooltip")
export class MdRichTooltip extends BaseTooltip {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [baseStyles, styles];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerenter", this.#onSurfacePointerEnter);
    this.addEventListener("pointerleave", this.#onSurfacePointerLeave);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerenter", this.#onSurfacePointerEnter);
    this.removeEventListener("pointerleave", this.#onSurfacePointerLeave);
  }

  // Arrow-function fields (not `method() {}` + constructor `.bind(this)`):
  // only used within this class, added/removed by reference on `this`
  // itself, so they need a stable, auto-bound identity — see the identical
  // rationale in `base-tooltip.js`'s "Private event handlers" section.

  /**
   * Pointer moved from the anchor onto the surface itself — cancel any hide
   * scheduled by the anchor's `pointerleave`/`focusout`. No new open needs
   * scheduling: the tooltip is already open by the time the pointer can
   * reach the surface (it's only rendered/hit-testable once `open`).
   */
  #onSurfacePointerEnter = () => {
    this._cancelPendingClose();
  };

  /** Pointer left the surface — resume the normal hide-on-leave behavior. */
  #onSurfacePointerLeave = () => {
    this._scheduleClose();
  };

  render() {
    return html`
      <div class="md-rich-tooltip__card" part="surface">
        <md-shadow></md-shadow>
        <div class="md-rich-tooltip__subhead" part="subhead">
          <slot name="subhead"></slot>
        </div>
        <div class="md-rich-tooltip__body" part="body">
          <slot></slot>
        </div>
        <div class="md-rich-tooltip__actions" part="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}
