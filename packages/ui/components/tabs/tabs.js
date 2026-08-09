import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "./tab.js";

/** @import { MdTab } from "./tab.js" */

import styles from "./tabs.css?inline";

/** @typedef {"primary" | "secondary"} TabsVariant */

@customElement("md-tabs")
export class MdTabs extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    variant: { type: String, reflect: true },
    value: { type: String, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {TabsVariant} */
    this.variant = "primary";

    this.value = "";

    /** @type {MdTab | null} */
    this._activeTab = null;
  }

  /** @returns {MdTab[]} */
  get _tabs() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    const elements = slot?.assignedElements() ?? [];
    return /** @type {MdTab[]} */ (
      elements.filter((node) => node.matches("md-tab"))
    );
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    if (changedProperties.has("value") && this._tabs.length > 0) {
      const newTab = this._tabs.find((t) => t.value === this.value) ?? null;
      if (newTab && newTab !== this._activeTab) {
        this._activateTab(newTab);
      }
    }
  }

  /** @param {MdTab} newTab */
  _activateTab(newTab) {
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

  _handleSlotChange() {
    const active = this._tabs.find((t) => t.value === this.value) ?? null;
    for (const tab of this._tabs) {
      tab.active = tab === active;
    }
    this._activeTab = active;
  }

  /** @param {CustomEvent} e */
  _handleTabActivate(e) {
    const newTab = /** @type {MdTab | undefined} */ (e.detail?.tab);
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
        <div part="divider" class="tabs__divider"></div>
      </div>
    `;
  }
}
