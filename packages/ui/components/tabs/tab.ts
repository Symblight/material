import { LitElement, html, CSSResultGroup, CSSResultOrNative } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "../ripple/ripple.ts";

import styles from "./tab.css?inline";

@customElement("md-tab")
export class MdTab extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  @property({ type: String, reflect: true }) value = "";
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _hasIcon = false;
  @state() private _hasLabel = false;

  @query(".tab__indicator") private _indicator!: HTMLElement | null;

  private _onIconSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _onLabelSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasLabel = slot
      .assignedNodes({ flatten: true })
      .some(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE ||
          (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim()),
      );
  }

  private _handleClick() {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("tab-activate", {
        bubbles: true,
        composed: true,
        detail: { tab: this },
      }),
    );
  }

  /** Returns the indicator element's bounding rect — used by md-tabs for animation. */
  getIndicatorClientRect(): DOMRect | undefined {
    return this._indicator?.getBoundingClientRect();
  }

  /** Slides the indicator from previousTab's position to this tab's natural position. */
  animateIndicator(previousTab: MdTab): void {
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

  private _buildKeyframes(previousTab: MdTab): Keyframe[] | null {
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

declare global {
  interface HTMLElementTagNameMap {
    "md-tab": MdTab;
  }
}
