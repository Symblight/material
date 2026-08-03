import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./data-grid-column-title.css?inline";

/**
 * @tag md-data-column-title
 * @summary The label inside an `md-data-grid` column header. Owns the
 * single-line truncation styling (`overflow: hidden` + `text-overflow:
 * ellipsis` + `white-space: nowrap`, plus `min-inline-size: 0` so it can
 * actually shrink below its content size in the header's flex row) —
 * mirrors `md-data-cell`'s own truncation handling, and for the same
 * reason: without it, a long label forces its column's track wider than
 * intended instead of showing "…".
 *
 * Deliberately kept separate from `md-data-column-header` itself (rather
 * than putting `overflow: hidden` there) — `md-data-column-separator`
 * hangs half outside the header's own box by design (its hit-area is
 * centered on the column boundary), and `overflow: hidden` on the header
 * would clip that hit-area along with the text.
 *
 * Composed internally by `md-data-column-header` — not intended to be used
 * standalone.
 */
@customElement("md-data-column-title")
export class MdDataColumnTitle extends LitElement {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this.setAttribute("part", "title");
  }

  render() {
    return html`<slot></slot>`;
  }
}
