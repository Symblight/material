import { CSSResultGroup, CSSResultOrNative } from "lit";
import { customElement, property } from "lit/decorators.js";

import BaseMdChip from "./base/base-chip.ts";

import baseStyles from "./base/base-chip.css?inline";
import elevatedStyles from "./base/elevated.css?inline";
import outlinedStyles from "./base/outlined.css?inline";
import styles from "./suggestion-chip.css?inline";

export type SuggestionChipVariant = "outlined" | "elevated";

/**
 * @tag md-suggestion-chip
 * @summary Material Design 3 Suggestion Chip
 *
 * Suggestion chips help narrow a user's intent by presenting dynamically
 * generated suggestions (e.g., quick replies or smart actions).
 * Supports optional leading icon and outlined/elevated variants.
 *
 * @slot - Label text
 * @slot leading-icon - Leading icon (18dp)
 */
@customElement("md-suggestion-chip")
export default class MdSuggestionChip extends BaseMdChip {
  static get styles(): CSSResultGroup {
    return [
      baseStyles,
      elevatedStyles,
      outlinedStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  /** Visual variant */
  @property({ type: String, reflect: true })
  variant: SuggestionChipVariant = "outlined";
}

declare global {
  interface HTMLElementTagNameMap {
    "md-suggestion-chip": MdSuggestionChip;
  }
}
