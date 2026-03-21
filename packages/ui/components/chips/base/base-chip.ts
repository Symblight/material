import { CSSResultGroup, CSSResultOrNative, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import styles from "./chip.css?inline";
import outlinedStyles from "./outlined-chip.css?inline";

export type ChipVariant = "elevated" | "outlined";

/**
 * @tag md-chips
 * @summary Material Chip web component
 */

@customElement("md-chip")
export default class MdChip extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles, outlinedStyles] as unknown as CSSResultOrNative[];
  }

  /**
   * The variant style of the chips.
   */
  @property()
  variant: ChipVariant = "outlined";

  /**
   * Indicates whether the chips is disabled or not.
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  disabled = false;

  render() {
    return html`
      <div
        part="box"
        class="chip ${classMap({
          chip_disabled: this.disabled,
          chip_variant_elevated: this.variant === "elevated",
          chip_variant_outlined: this.variant === "outlined",
        })}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-chip": MdChip;
  }
}
