import { CSSResultGroup, CSSResultOrNative } from "lit";
import { customElement, property } from "lit/decorators.js";

import BaseMdChip from "./base/base-chip.ts";

import baseStyles from "./base/base-chip.css?inline";
import elevatedStyles from "./base/elevated.css?inline";
import outlinedStyles from "./base/outlined.css?inline";
import styles from "./assist-chip.css?inline";

export type AssistChipVariant = "outlined" | "elevated";

/**
 * @tag md-assist-chip
 * @summary Material Design 3 Assist Chip
 *
 * Assist chips suggest smart or automated actions.
 * Supports optional leading icon and outlined/elevated variants.
 *
 * @slot - Label text
 * @slot leading-icon - Leading icon (18dp)
 */
@customElement("md-assist-chip")
export default class MdAssistChip extends BaseMdChip {
  static get styles(): CSSResultGroup {
    return [
      baseStyles,
      elevatedStyles,
      outlinedStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  /**
   * Visual variant of the chip.
   */
  @property({ type: String, reflect: true })
  variant: AssistChipVariant = "outlined";
}

declare global {
  interface HTMLElementTagNameMap {
    "md-assist-chip": MdAssistChip;
  }
}
