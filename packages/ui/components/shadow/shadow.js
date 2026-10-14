import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./shadow.css?inline";

/**
 * @tag md-shadow
 * @summary Material elevation shadow
 *
 * Paints the MD3 elevation shadow for its containing block. Place it as the
 * first child of a positioned element and give it a level (0–5), either with
 * the `level` attribute or the inherited `--md-elevation-level`. `level`
 * wins, so a fixed elevation can't leak to or from surrounding content.
 * Colour comes from `--md-shadow-color`, falling back to
 * `--md-sys-color-shadow`.
 *
 * @attr {0 | 1 | 2 | 3 | 4 | 5} level - Elevation level. Overrides the
 *   inherited `--md-elevation-level`.
 */
@customElement("md-shadow")
export default class MdShadow extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    level: { type: Number, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {number | undefined} */
    this.level = undefined;
  }

  render() {
    return html`<span class="shadow"></span>`;
  }
}
