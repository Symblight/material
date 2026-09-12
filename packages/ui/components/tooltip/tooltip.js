import { html } from "lit";
import { customElement } from "lit/decorators.js";

import { BaseTooltip } from "./base-tooltip.js";

import baseStyles from "./base-tooltip.css?inline";
import styles from "./tooltip.css?inline";

/**
 * @tag md-tooltip
 * @summary Material Design 3 plain tooltip.
 *
 * A short, single/few-line text label describing an anchor element (set via
 * the `for` attribute), shown on hover/focus after `showDelay` and hidden
 * after `hideDelay`. Non-interactive (`pointer-events: none`) — see
 * `md-rich-tooltip` for a larger, elevated surface that supports a subhead,
 * longer supporting text, and action buttons.
 *
 * Positioning, anchor resolution, and show/hide/dismiss are delegated to
 * `PopoverPositionController` via `BaseTooltip` — see that class for the
 * shared behavior (hover/focus delays, Escape dismiss, `aria-describedby`).
 *
 * Slot: *(default)* — plain text label.
 */
@customElement("md-tooltip")
export class MdTooltip extends BaseTooltip {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [baseStyles, styles];
  }

  render() {
    return html`
      <div class="md-tooltip__surface" part="surface">
        <slot></slot>
      </div>
    `;
  }
}
