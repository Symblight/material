import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * @tag md-item-group
 * @summary Wraps a set of `md-menu-item` elements into a visually distinct
 * group.
 *
 * Each top-level `md-item-group` child of `md-menu` is rendered as its own
 * `md-card` segment, with real spacing and independently rounded corners
 * between segments — the MD3 "vertical menu with gap" pattern. Gaps are
 * more expressive than dividers and make the relationship between items in
 * the same group clear at a glance. Purely a grouping/visual concern —
 * `md-menu`'s keyboard navigation and typeahead flatten through a group's
 * children automatically. Renders `display: contents`, so it never
 * introduces a box of its own beyond the segment card `md-menu` wraps it in.
 */
@customElement("md-item-group")
export class MdItemGroup extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
