import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./list-item.ts";
import type { MdListItem } from "./list-item.ts";

import styles from "./list.css?inline";

/**
 * @tag md-list
 * @summary Material Design 3 list container.
 *
 * Renders a `<ul role="list">` and manages roving tabindex keyboard navigation
 * (Arrow Up / Arrow Down) across any interactive `md-list-item` children.
 */
@customElement("md-list")
export class MdList extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  /** Returns all slotted md-list-item elements. */
  private get _listItems(): MdListItem[] {
    const slot = this.renderRoot?.querySelector(
      "slot:not([name])",
    ) as HTMLSlotElement | null;
    if (!slot) return [];
    return slot
      .assignedElements({ flatten: true })
      .filter((el): el is MdListItem => el.tagName === "MD-LIST-ITEM");
  }

  /** Returns only interactive md-list-item elements (button or href). */
  private get _interactiveItems(): MdListItem[] {
    return this._listItems.filter((item) => item.button || item.href != null);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
  }

  private _handleKeydown = (event: KeyboardEvent) => {
    const items = this._interactiveItems;
    if (!items.length) return;

    const focused = items.find((item) => item.matches(":focus-within"));
    const currentIndex = focused ? items.indexOf(focused) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      this._focusItem(items, nextIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      this._focusItem(items, prevIndex);
    } else if (event.key === "Home") {
      event.preventDefault();
      this._focusItem(items, 0);
    } else if (event.key === "End") {
      event.preventDefault();
      this._focusItem(items, items.length - 1);
    }
  };

  private _focusItem(items: MdListItem[], index: number) {
    // Update tabindex: only the focused item is in tab order
    items.forEach((item, i) => {
      item.setTabIndex(i === index ? 0 : -1);
    });
    items[index].focusInteractive();
  }

  private _onSlotChange() {
    // On initial slot population, set up roving tabindex
    const items = this._interactiveItems;
    if (items.length === 0) return;

    // Check if any item already has tabindex=0; if not, assign first item
    const hasTabStop = items.some((item) => item.getTabIndex() === 0);
    if (!hasTabStop) {
      items.forEach((item, i) => {
        item.setTabIndex(i === 0 ? 0 : -1);
      });
    }
  }

  override render() {
    return html`
      <ul class="md-list" role="list">
        <slot @slotchange=${this._onSlotChange}></slot>
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-list": MdList;
  }
}
