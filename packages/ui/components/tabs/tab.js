import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "../ripple/ripple.js";

import styles from "./tab.css?inline";

@customElement("md-tab")
export class MdTab extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    value: { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    _hasIcon: { state: true },
    _hasLabel: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.value = "";
    this.active = false;
    this.disabled = false;
    this._hasIcon = false;
    this._hasLabel = false;
  }

  /** @returns {HTMLElement | null} */
  get _indicator() {
    return this.renderRoot?.querySelector(".tab__indicator") ?? null;
  }

  /** @param {Event} e */
  _onIconSlotChange(e) {
    const slot = /** @type {HTMLSlotElement} */ (e.target);
    this._hasIcon = slot.assignedNodes({ flatten: true }).length > 0;
  }

  /** @param {Event} e */
  _onLabelSlotChange(e) {
    const slot = /** @type {HTMLSlotElement} */ (e.target);
    this._hasLabel = slot
      .assignedNodes({ flatten: true })
      .some(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE ||
          (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim()),
      );
  }

  _handleClick() {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("tab-activate", {
        bubbles: true,
        composed: true,
        detail: { tab: this },
      }),
    );
  }

  /**
   * Returns the indicator element's bounding rect — used by md-tabs for animation.
   * @returns {DOMRect | undefined}
   */
  getIndicatorClientRect() {
    return this._indicator?.getBoundingClientRect();
  }

  /**
   * Slides the indicator from previousTab's position to this tab's natural position.
   * @param {MdTab} previousTab
   */
  animateIndicator(previousTab) {
    const indicator = this._indicator;
    if (!indicator) return;

    // cancel any in-progress indicator animation
    indicator.getAnimations().forEach((a) => a.cancel());

    const frames = this._buildKeyframes(previousTab);
    if (!frames) return;

    indicator.animate(frames, {
      duration: 250,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    });
  }

  /**
   * @param {MdTab} previousTab
   * @returns {Keyframe[] | null}
   */
  _buildKeyframes(previousTab) {
    if (!this.active) return null;

    const fromRect = previousTab.getIndicatorClientRect();
    const toRect = this._indicator?.getBoundingClientRect();

    if (!fromRect || !toRect || !toRect.width) {
      // fallback: fade in
      return [{ opacity: 0 }, { transform: "none" }];
    }

    const dx = fromRect.left - toRect.left;
    const scale = fromRect.width / toRect.width;

    if (isNaN(scale)) {
      return [{ opacity: 0 }, { transform: "none" }];
    }

    return [
      {
        transform: `translateX(${dx.toFixed(4)}px) scaleX(${scale.toFixed(4)})`,
      },
      { transform: "none" },
    ];
  }

  render() {
    const iconAndLabel = this._hasIcon && this._hasLabel;
    return html`
      <button
        id="tab"
        role="tab"
        aria-selected="${this.active ? "true" : "false"}"
        tabindex="${this.active ? "0" : "-1"}"
        ?disabled=${this.disabled}
        class="${classMap({
          tab: true,
          tab_active: this.active,
          tab_disabled: this.disabled,
          "tab_has-icon": this._hasIcon,
          "tab_icon-and-label": iconAndLabel,
        })}"
        @click=${this._handleClick}
      >
        <md-ripple for="tab"></md-ripple>
        <div class="tab__state-layer"></div>
        <slot
          name="icon"
          class="tab__icon"
          @slotchange=${this._onIconSlotChange}
        ></slot>
        <span class="tab__label">
          <slot @slotchange=${this._onLabelSlotChange}></slot>
        </span>
        <div class="tab__indicator"></div>
      </button>
    `;
  }
}
