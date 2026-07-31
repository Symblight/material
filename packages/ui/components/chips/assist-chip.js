import { customElement } from "lit/decorators.js";

import BaseMdChip from "./base/base-chip.js";

import baseStyles from "./base/base-chip.css?inline";
import elevatedStyles from "./base/elevated.css?inline";
import outlinedStyles from "./base/outlined.css?inline";
import styles from "./assist-chip.css?inline";

/** @typedef {"outlined" | "elevated"} AssistChipVariant */

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
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Visual variant of the chip. */
    variant: { type: String, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [baseStyles, elevatedStyles, outlinedStyles, styles];
  }

  constructor() {
    super();

    /** @type {AssistChipVariant} */
    this.variant = "outlined";
  }
}
