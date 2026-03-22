import { CSSResultGroup, CSSResultOrNative, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import closeIcon from "@material-design-icons/svg/filled/close.svg?raw";

import BaseMdChip from "./base/base-chip.ts";

import baseStyles from "./base/base-chip.css?inline";
import selectedStyles from "./base/selected-chip.css?inline";
import styles from "./input-chip.css?inline";

/**
 * @tag md-input-chip
 * @summary Material Design 3 Input Chip
 *
 * Input chips represent a piece of user-entered information (e.g., a contact
 * or filter value). They support an optional leading avatar or icon and a
 * trailing remove button.
 *
 * @slot - Label text
 * @slot leading-icon - Leading icon (18dp) — hidden when avatar is set
 * @slot avatar - Circular avatar image (24dp)
 * @slot trailing-icon - Icon inside the remove button — only used when `removable` is not set
 *
 * @fires remove - Fired when the trailing remove button is clicked
 * @fires change - Fired when selected state changes
 */
@customElement("md-input-chip")
export default class MdInputChip extends BaseMdChip {
  static get styles(): CSSResultGroup {
    return [
      baseStyles,
      selectedStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  /** Show a circular avatar slot instead of the leading icon */
  @property({ type: Boolean, reflect: true })
  avatar = false;

  /** Whether the chip is selected */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** Show a built-in close button that fires the `remove` event on click */
  @property({ type: Boolean, reflect: true })
  removable = false;

  @state() private _hasTrailingIcon = false;

  protected override _handleClick(_e: Event) {
    if (this.disabled) return;
    this.selected = !this.selected;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private _handleRemove(e: Event) {
    e.stopPropagation();
    if (this.disabled) return;
    this.dispatchEvent(new Event("remove", { bubbles: true, composed: true }));
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
          "chip_has-avatar": this.avatar,
        })}"
        ?disabled=${this.disabled}
        aria-pressed=${this.selected}
        @focus=${this._handleFocus}
        @blur=${this._handleBlur}
        @click=${this._handleClick}
      >
        <md-ripple for="chip"></md-ripple>
        ${this.avatar
          ? html`<span class="chip__avatar"><slot name="avatar"></slot></span>`
          : html`<slot
              name="leading-icon"
              class="${classMap({
                "chip__leading-icon": this._hasLeadingIcon,
              })}"
              @slotchange=${(e: Event) =>
                this._onSlotChange(e, (v) => (this._hasLeadingIcon = v))}
            ></slot>`}
        <span class="chip__label"><slot></slot></span>
        ${this.removable
          ? html`<button
              class="chip__remove"
              aria-label="Remove"
              tabindex="-1"
              ?disabled=${this.disabled}
              @click=${this._handleRemove}
            >
              <span class="chip__remove-icon" aria-hidden="true">
                ${unsafeSVG(closeIcon)}
              </span>
            </button>`
          : html`<button
              class="${classMap({
                chip__remove: true,
                chip__remove_hidden: !this._hasTrailingIcon,
              })}"
              aria-label="Remove"
              tabindex="-1"
              ?disabled=${this.disabled}
              @click=${this._handleRemove}
            >
              <span class="chip__remove-icon" aria-hidden="true">
                <slot
                  name="trailing-icon"
                  @slotchange=${(e: Event) =>
                    this._onSlotChange(e, (v) => (this._hasTrailingIcon = v))}
                ></slot>
              </span>
            </button>`}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-input-chip": MdInputChip;
  }
}
