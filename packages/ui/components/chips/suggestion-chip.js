import { customElement } from "lit/decorators.js";

import BaseMdChip from "./base/base-chip.js";

import baseStyles from "./base/base-chip.css?inline";
import elevatedStyles from "./base/elevated.css?inline";
import outlinedStyles from "./base/outlined.css?inline";
import styles from "./suggestion-chip.css?inline";

/** @typedef {"outlined" | "elevated"} SuggestionChipVariant */

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
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Visual variant */
    variant: { type: String, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [baseStyles, elevatedStyles, outlinedStyles, styles];
  }

  constructor() {
    super();

    /** @type {SuggestionChipVariant} */
    this.variant = "outlined";
  }
}
