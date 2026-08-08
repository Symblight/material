import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./skeleton.css?inline";

/**
 * @tag md-skeleton
 * @summary Placeholder block shown in place of content that hasn't loaded
 * yet. The host itself is the pulsing block (no wrapper div, no shadow
 * content) — size it with plain CSS (`width`/`height`, or `style="width:
 * 60%"` for a variable-width placeholder mimicking real text of differing
 * lengths). `variant` switches the default shape: `"text"` (default, a
 * line of text), `"circular"` (an avatar), or `"rectangular"` (a plain
 * block, square corners).
 */
@customElement("md-skeleton")
export class MdSkeleton extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    variant: { type: String, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {"text" | "circular" | "rectangular"} */
    this.variant = "text";

    this.setAttribute("aria-hidden", "true");
  }
}
