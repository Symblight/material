import { CSSResultGroup, CSSResultOrNative, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "../../ripple/ripple.ts";

import styles from "./base-chip.css?inline";

export default class BaseMdChip extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  @property({ type: Boolean, attribute: true, reflect: true })
  disabled = false;

  @state() protected _hasLeadingIcon = false;

  protected _handleClick(_e: Event) {
    // override in subclasses
  }

  protected _onSlotChange(e: Event, stateSetter: (v: boolean) => void) {
    const slot = e.target as HTMLSlotElement;
    stateSetter(slot.assignedNodes({ flatten: true }).length > 0);
  }

  render() {
    return html`
      <button
        id="chip"
        part="chip"
        class="chip ${classMap({
          chip_disabled: this.disabled,
        })}"
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <md-ripple for="chip"></md-ripple>
        <slot
          name="leading-icon"
          class="${classMap({ "chip__leading-icon": this._hasLeadingIcon })}"
          @slotchange=${(e: Event) =>
            this._onSlotChange(e, (v) => (this._hasLeadingIcon = v))}
        ></slot>
        <span class="chip__label"><slot></slot></span>
      </button>
    `;
  }
}
