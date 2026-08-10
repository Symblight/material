import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./group.css?inline";

/**
 * @tag md-menu-group
 * @summary Material Design 3 menu section group.
 *
 * Wraps a set of `md-menu-item` elements under an optional "Label text"
 * header, mirroring `md-optgroup` (`components/select/group.js`). Purely a
 * visual/semantic grouping — `md-menu`'s keyboard navigation and typeahead
 * flatten through a group's children automatically.
 */
@customElement("md-menu-group")
export class MdMenuGroup extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    label: { type: String },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {string} */
    this.label = "";
  }

  render() {
    return html`
      <div
        class="md-menu-group"
        role="group"
        aria-label=${this.label || nothing}
      >
        ${
          this.label
            ? html`<div class="md-menu-group__label" role="presentation">
                ${this.label}
              </div>`
            : nothing
        }
        <slot></slot>
      </div>
    `;
  }
}
