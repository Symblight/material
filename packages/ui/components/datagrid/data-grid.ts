import { CSSResultGroup, CSSResultOrNative, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createContext } from "@lit/context";
import styles from "./data-grid.css?inline";
import { HTMLForController } from "../html-for-controller/html-for-controller.ts";
import { HTMLContainerController } from "./base/controller_container.ts";

export const dataGridContext = createContext(Symbol("column-context"));

type Column = {
  field: string;
  header?: string;
};

/**
 * @tag md-data-grid
 * @summary Material Data grid web component
 */
@customElement("md-data-grid")
export default class DataGrid extends LitElement {
  firstUpdated() {
    const rootNode = this.getRootNode();
    const container = this.parentElement;
    const width = container.clientWidth;
    this.width = width;
    console.log({ container, width }, 1111); // Gets the parent if inside Shadow DOM
  }

  @state()
  initialized: boolean = false;

  @state()
  width = 0;

  @property({ type: Array })
  columns: Column[] = [];
  @property({ type: Array })
  data: Record<string, any>[] = [];

  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  render() {
    const cellWidth = this.width / this.columns.length;
    return html`
      <div class="data-grid__scroller">
        <section class="data-grid__header">
          <div class="data-grid__header-row">
            ${this.columns.map(
              (column) =>
                html` <div
                  class="data-grid__header-cell"
                  style="width: ${cellWidth}px;"
                >
                  <div class="data-grid__header-title">
                    ${column.header || column.field}
                  </div>
                </div>`,
            )}
          </div>
        </section>
        <div class="data-grid__body" role="presentation">
          ${this.data.map(
            (row) => html`
              <div class="data-grid__row">
                ${Array.from(this.columns.values()).map(
                  (col) => html`
                    <div style="width: ${cellWidth}px;">
                      ${row[col.field] ?? ""}
                    </div>
                  `,
                )}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-data-grid": DataGrid;
  }
}
