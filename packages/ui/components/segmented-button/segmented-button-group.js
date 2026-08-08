import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";

import "./segmented-button.js";

/** @import { MdSegmentedButton } from "./segmented-button.js" */

import styles from "./segmented-button-group.css?inline";

/**
 * @tag md-segmented-button-group
 * @summary Material Design 3 segmented button group.
 *
 * Container for `md-segmented-button` segments. Coordinates single-select
 * (radio-like, mutually exclusive) or multi-select (independent toggle)
 * behavior, roving tabindex keyboard navigation, and cascades `disabled` /
 * selection state down to its slotted segments.
 *
 * @slot - `md-segmented-button` elements
 *
 * @fires change - Fired when the selection changes.
 *   Single-select detail: `{ value: string }`.
 *   Multi-select detail: `{ values: string[] }`.
 */
@customElement("md-segmented-button-group")
export class MdSegmentedButtonGroup extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Enables independent toggle selection instead of single-select. */
    multiselect: { type: Boolean, reflect: true },
    /** The selected value (single-select mode only). */
    value: { type: String },
    /** The selected values (multi-select mode only). */
    values: { type: Array },
    /** Accessible name for the group (`aria-label`). */
    label: { type: String },
    /** Cascades a disabled state down to every segment. */
    disabled: { type: Boolean, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {boolean} */
    this.multiselect = false;

    /** @type {string} */
    this.value = "";

    /** @type {string[]} */
    this.values = [];

    /** @type {string} */
    this.label = "";

    /** @type {boolean} */
    this.disabled = false;

    this._handleKeydown = (/** @type {KeyboardEvent} */ event) => {
      const items = this._enabledSegments;
      if (!items.length) return;

      const focused = items.find((item) => item.matches(":focus-within"));
      const currentIndex = focused ? items.indexOf(focused) : -1;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex =
          currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this._focusSegment(items, nextIndex);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this._focusSegment(items, prevIndex);
      } else if (event.key === "Home") {
        event.preventDefault();
        this._focusSegment(items, 0);
      } else if (event.key === "End") {
        event.preventDefault();
        this._focusSegment(items, items.length - 1);
      }
    };
  }

  /**
   * Returns all slotted md-segmented-button elements.
   * @returns {MdSegmentedButton[]}
   */
  get _segments() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    if (!slot) return [];
    return /** @type {MdSegmentedButton[]} */ (
      slot
        .assignedElements({ flatten: true })
        .filter((el) => el.tagName === "MD-SEGMENTED-BUTTON")
    );
  }

  /**
   * Returns only non-disabled segments — the set roving tabindex / arrow
   * navigation is allowed to land on.
   * @returns {MdSegmentedButton[]}
   */
  get _enabledSegments() {
    return this._segments.filter((segment) => !segment.disabled);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
  }

  /**
   * Pushes `multiselect` / `disabled` down onto every segment.
   */
  _syncSegmentProps() {
    for (const segment of this._segments) {
      segment.multiselect = this.multiselect;
      // One-way cascade: group disabled forces segments disabled. Re-enabling
      // the group does not attempt to restore prior per-segment disabled state.
      if (this.disabled) {
        segment.disabled = true;
      }
    }
  }

  /**
   * Applies the current `value` / `values` to every segment's `selected`.
   */
  _syncSelection() {
    const segments = this._segments;
    if (this.multiselect) {
      for (const segment of segments) {
        segment.selected = this.values.includes(segment.value);
      }
    } else {
      for (const segment of segments) {
        segment.selected = this.value !== "" && segment.value === this.value;
      }
    }
  }

  /**
   * @param {MdSegmentedButton[]} items
   * @param {number} index
   */
  _focusSegment(items, index) {
    const all = this._segments;
    all.forEach((segment) => {
      segment.setTabIndex(segment === items[index] ? 0 : -1);
    });
    items[index].focusInteractive();
  }

  /** @param {CustomEvent} e */
  _handleSegmentActivate(e) {
    const segment = /** @type {MdSegmentedButton | undefined} */ (
      e.detail?.segment
    );
    if (!segment || segment.disabled) return;

    if (this.multiselect) {
      const values = new Set(this.values);
      if (values.has(segment.value)) {
        values.delete(segment.value);
      } else {
        values.add(segment.value);
      }
      this.values = [...values];
      this._syncSelection();
      this._focusSegment(this._segments, this._segments.indexOf(segment));

      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { values: this.values },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    if (this.value === segment.value) return;

    this.value = segment.value;
    this._syncSelection();
    this._focusSegment(this._segments, this._segments.indexOf(segment));

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onSlotChange() {
    this._syncSegmentProps();
    this._syncSelection();

    const segments = this._segments;
    if (!segments.length) return;

    // Each segment's own default tabindex is "0" (set in its own template,
    // independent of the group). On initial population that means every
    // segment is individually tabbable until normalized here. Only skip
    // normalizing when exactly one roving tabstop already exists — that
    // signals a later slot-change (e.g. a segment added at runtime) where an
    // established tabstop from prior arrow-key navigation should be left
    // alone, rather than the initial "every segment defaults to 0" state.
    const tabStops = segments.filter((segment) => segment.getTabIndex() === 0);
    if (tabStops.length !== 1) {
      const [first] = this._enabledSegments;
      segments.forEach((segment) => {
        segment.setTabIndex(segment === first ? 0 : -1);
      });
    }
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    if (
      changedProperties.has("disabled") ||
      changedProperties.has("multiselect")
    ) {
      this._syncSegmentProps();
    }
    if (
      changedProperties.has("value") ||
      changedProperties.has("values") ||
      changedProperties.has("multiselect")
    ) {
      this._syncSelection();
    }
  }

  render() {
    return html`
      <div
        class="segmented-button-group"
        role=${this.multiselect ? "group" : "radiogroup"}
        aria-label=${this.label ? this.label : nothing}
        @segment-activate=${this._handleSegmentActivate}
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
