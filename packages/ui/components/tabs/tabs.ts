import {
  LitElement,
  html,
  CSSResultGroup,
  CSSResultOrNative,
  PropertyValues,
} from "lit";
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "./tab.ts";
import { MdTab } from "./tab.ts";

import styles from "./tabs.css?inline";

export type TabsVariant = "primary" | "secondary";

@customElement("md-tabs")
export class MdTabs extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  @property({ type: String, reflect: true }) variant: TabsVariant = "primary";
  @property({ type: String, reflect: true }) value = "";

  @queryAssignedElements({ selector: "md-tab" })
  private _tabs!: MdTab[];

  private _activeTab: MdTab | null = null;

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has("value") && this._tabs.length > 0) {
      const newTab = this._tabs.find((t) => t.value === this.value) ?? null;
      if (newTab && newTab !== this._activeTab) {
        this._activateTab(newTab);
      }
    }
  }

  private _activateTab(newTab: MdTab) {
    const previousTab = this._activeTab;

    for (const tab of this._tabs) {
      tab.active = tab === newTab;
    }
    this._activeTab = newTab;

    // Animate the indicator: slide from previousTab's position to newTab's.
    // Called synchronously — indicator DOM positions are available before Lit
    // re-renders, so getBoundingClientRect() returns correct values here.
    if (previousTab) {
      newTab.animateIndicator(previousTab);
    }
  }

  private _handleSlotChange() {
    const active = this._tabs.find((t) => t.value === this.value) ?? null;
    for (const tab of this._tabs) {
      tab.active = tab === active;
    }
    this._activeTab = active;
  }

  private _handleTabActivate(e: CustomEvent) {
    const newTab = e.detail?.tab as MdTab | undefined;
    if (!newTab || newTab.disabled || newTab === this._activeTab) return;

    const prevValue = this.value;
    const previousTab = this._activeTab;

    for (const tab of this._tabs) {
      tab.active = tab === newTab;
    }
    this._activeTab = newTab;
    this.value = newTab.value;

    if (previousTab) {
      newTab.animateIndicator(previousTab);
    }

    if (prevValue !== this.value) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: this.value, index: this._tabs.indexOf(newTab) },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  render() {
    return html`
      <div
        class="${classMap({
          tabs: true,
          tabs_primary: this.variant === "primary",
          tabs_secondary: this.variant === "secondary",
        })}"
        role="tablist"
        @tab-activate=${this._handleTabActivate}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
        <div class="tabs__divider"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-tabs": MdTabs;
  }
}
