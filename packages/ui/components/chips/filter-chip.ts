import { CSSResultGroup, CSSResultOrNative, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import BaseMdChip from "./base/base-chip.ts";

import baseStyles from "./base/base-chip.css?inline";
import elevatedStyles from "./base/elevated.css?inline";
import outlinedStyles from "./base/outlined.css?inline";
import selectedStyles from "./base/selected-chip.css?inline";
import styles from "./filter-chip.css?inline";

export type FilterChipVariant = "outlined" | "elevated";

/**
 * @tag md-filter-chip
 * @summary Material Design 3 Filter Chip
 *
 * Filter chips use tags or descriptive words to filter content.
 * Toggles a selected state. When selected, renders the `selected-icon` slot
 * in the leading position (e.g. a checkmark); otherwise renders `leading-icon`.
 *
 * @slot - Label text
 * @slot leading-icon - Icon shown when the chip is NOT selected
 * @slot selected-icon - Icon shown when the chip IS selected (e.g. checkmark)
 *
 * @fires change - Fired when selected state changes
 */
@customElement("md-filter-chip")
export default class MdFilterChip extends BaseMdChip {
  static get styles(): CSSResultGroup {
    return [
      baseStyles,
      elevatedStyles,
      outlinedStyles,
      selectedStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  /** Visual variant */
  @property({ type: String, reflect: true })
  variant: FilterChipVariant = "outlined";

  /** Whether the chip is selected (toggled on) */
  @property({ type: Boolean, reflect: true })
  selected = false;

  @state() private _hasSelectedIcon = false;

  protected override _handleClick(_e: Event) {
    if (this.disabled) return;
    this.selected = !this.selected;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <button
        id="chip"
        part="chip"
        class="chip ${classMap({
          chip_disabled: this.disabled,
          chip_focused: this._focused,
          chip_selected: this.selected,
        })}"
        ?disabled=${this.disabled}
        aria-pressed=${this.selected}
        @focus=${this._handleFocus}
        @blur=${this._handleBlur}
        @click=${this._handleClick}
      >
        <md-ripple for="chip"></md-ripple>
        ${when(
          this.selected,
          () =>
            html`<slot
              name="selected-icon"
              class="${classMap({
                "chip__leading-icon": this._hasSelectedIcon,
              })}"
              @slotchange=${(e: Event) =>
                this._onSlotChange(e, (v) => (this._hasSelectedIcon = v))}
            ></slot>`,
          () =>
            html`<slot
              name="leading-icon"
              class="${classMap({
                "chip__leading-icon": this._hasLeadingIcon,
              })}"
              @slotchange=${(e: Event) =>
                this._onSlotChange(e, (v) => (this._hasLeadingIcon = v))}
            ></slot>`,
        )}
        <span class="chip__label"><slot></slot></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-filter-chip": MdFilterChip;
  }
}
