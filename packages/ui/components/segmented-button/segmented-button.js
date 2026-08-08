import { html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import checkIcon from "@material-design-icons/svg/filled/check.svg?raw";

import "../ripple/ripple.js";
import "../icon/icon.js";

import buttonStyles from "../button/base-button.css?inline";
import styles from "./segmented-button.css?inline";
import { BaseButton } from "../button/base-button.js";

/**
 * @tag md-segmented-button
 * @summary Material Design 3 segmented button segment.
 *
 * A single segment inside an `md-segmented-button-group`. Always renders as
 * a native `<button>` — segments never act as links.
 *
 * The `multiselect` property is synced down by the parent group; it controls
 * whether the segment exposes `role="radio"` + `aria-checked` (single-select)
 * or native button semantics + `aria-pressed` (multi-select). It is not
 * meant to be set by consumers directly.
 *
 * @slot - Label text
 * @slot icon - Leading icon. Automatically replaced by a checkmark while
 *   `selected` is true.
 *
 * @fires segment-activate - Internal event consumed by `md-segmented-button-group`.
 *   Not part of the public API — listen for `change` on the group instead.
 */
@customElement("md-segmented-button")
export class MdSegmentedButton extends BaseButton {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** The value this segment represents within its group. */
    value: { type: String, reflect: true },
    /** Whether this segment is the selected one (or one of the selected ones). */
    selected: { type: Boolean, reflect: true },
    /**
     * Set by the parent `md-segmented-button-group` — switches ARIA semantics
     * between radio (single-select) and toggle-button (multi-select).
     */
    multiselect: { type: Boolean, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [buttonStyles, styles];
  }

  constructor() {
    super();

    /** @type {string} */
    this.value = "";

    /** @type {boolean} */
    this.selected = false;

    /** @type {boolean} */
    this.multiselect = false;
  }

  get classes() {
    return classMap({
      "segmented-button_disabled": this.disabled,
      "segmented-button_selected": this.selected,
      "segmented-button_icon": this.hasIcon,
    });
  }

  /**
   * Returns the tabindex currently set on the inner button.
   * Called by the parent group to read roving-tabindex state.
   * @returns {number}
   */
  getTabIndex() {
    return this.buttonOrAnchor
      ? Number(this.buttonOrAnchor.getAttribute("tabindex") ?? "0")
      : 0;
  }

  /**
   * Sets the tabindex on the inner button.
   * Called by the parent group to drive roving-tabindex navigation.
   * @param {number} value
   */
  setTabIndex(value) {
    this.buttonOrAnchor?.setAttribute("tabindex", String(value));
  }

  /** Focuses the inner button. Called by the parent group on arrow-key nav. */
  focusInteractive() {
    this.buttonOrAnchor?.focus();
  }

  /** @param {Event} event */
  handleClick(event) {
    super.handleClick(event);
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("segment-activate", {
        bubbles: true,
        composed: true,
        detail: { segment: this },
      }),
    );
  }

  renderIcon() {
    return html`
      <span
        class="segmented-button__icon ${classMap({
          "segmented-button__icon_empty": !this.hasIcon && !this.selected,
        })}"
      >
        <md-icon class="segmented-button__check"
          >${unsafeSVG(checkIcon)}</md-icon
        >
        <slot
          name="icon"
          class="segmented-button__icon-slot"
          @slotchange=${this.updateChildren}
        ></slot>
      </span>
    `;
  }

  render() {
    return html`
      <md-ripple class="segmented-button__ripple" for="segment"></md-ripple>
      <button
        id="segment"
        part="button"
        type="button"
        class="button segmented-button ${this.classes}"
        ?disabled=${this.disabled}
        role=${this.multiselect ? nothing : "radio"}
        aria-checked=${this.multiselect ? nothing : this.selected}
        aria-pressed=${this.multiselect ? this.selected : nothing}
        tabindex="0"
      >
        ${this.renderIcon()}
        <span
          id="label"
          class="segmented-button__label ${classMap({
            "segmented-button__label_hidden": !this.childrenContent,
          })}"
        >
          <slot @slotchange=${this.handleSlotChange}></slot>
        </span>
      </button>
    `;
  }
}
