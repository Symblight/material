import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../shadow/shadow.js";
import "../ripple/ripple.js";

import styles from "./card.css?inline";
import elevatedStyles from "./elevated-card.css?inline";
import filledStyles from "./filled-card.css?inline";
import outlinedStyles from "./outlined-card.css?inline";

/** @typedef {"elevated" | "filled" | "outlined"} CardVariant */

/**
 * @tag md-card
 * @summary Material Design 3 card component.
 *
 * Groups related content and actions on a single surface. Supports three
 * visual variants (elevated, filled, outlined) and an optional interactive
 * mode with ripple feedback, keyboard navigation, and link behaviour.
 */
@customElement("md-card")
export class MdCard extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    /** Visual style of the card. Controls background colour, shadow, and border. */
    variant: { reflect: true },
    /**
     * Enables ripple feedback, hover/pressed/focus-visible states, pointer
     * cursor, and keyboard interaction.
     */
    interactive: { type: Boolean, reflect: true },
    /**
     * Disables the card when `interactive` is set: applies opacity,
     * pointer-events: none, and aria-disabled on the inner surface.
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * When set (and `interactive` is set), the inner surface is rendered as an
     * `<a>` element pointing to this URL.
     */
    href: { type: String, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [elevatedStyles, filledStyles, outlinedStyles, styles];
  }

  constructor() {
    super();

    /** @type {CardVariant} */
    this.variant = "elevated";

    /** @type {boolean} */
    this.interactive = false;

    /** @type {boolean} */
    this.disabled = false;

    /** @type {string | undefined} */
    this.href = undefined;

    /**
     * Tracks all elements currently slotted into the card so we can attach and
     * remove pointer-enter/leave listeners as slot content changes.
     * @type {Set<Element>}
     */
    this._slottedChildren = new Set();
  }

  /** @returns {import("../ripple/ripple.js").default | undefined} */
  get rippleEl() {
    return /** @type {import("../ripple/ripple.js").default | undefined} */ (
      this.renderRoot?.querySelector("md-ripple") ?? undefined
    );
  }

  get classes() {
    return classMap({
      "md-card__surface": true,
      card_interactive: this.interactive,
      card_disabled: this.interactive && this.disabled,
    });
  }

  /**
   * Unified pointer event handler.
   *
   * Handles events coming from:
   *  - the host element itself (pointerenter/leave/down/up bubbled from the
   *    host boundary for real pointer movement)
   *  - each slotted child element (pointerenter/leave attached directly because
   *    these events are non-bubbling and do not reach the host when only the
   *    child is entered)
   * @param {Event} event
   */
  handleEvent(event) {
    if (!this.interactive || this.disabled) return;
    const ripple = this.rippleEl;
    if (!ripple) return;
    ripple.handleEvent(event);
  }

  connectedCallback() {
    super.connectedCallback();
    // pointerenter/leave must be on the host to catch events at the card boundary.
    // pointerdown/up bubble so host-level capture is sufficient.
    this.addEventListener("pointerenter", this);
    this.addEventListener("pointerleave", this);
    this.addEventListener("pointerdown", this);
    this.addEventListener("pointerup", this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerenter", this);
    this.removeEventListener("pointerleave", this);
    this.removeEventListener("pointerdown", this);
    this.removeEventListener("pointerup", this);
    // Clean up any lingering slotted-child listeners.
    for (const child of this._slottedChildren) {
      child.removeEventListener("pointerenter", this);
      child.removeEventListener("pointerleave", this);
    }
    this._slottedChildren.clear();
  }

  /**
   * Called whenever the content of any slot changes.  We attach pointerenter
   * and pointerleave directly to each slotted element because those events are
   * non-bubbling: a `pointerenter` fired on a slotted child does not propagate
   * to the host element, so the host-level listener would never see it.
   * @param {Event} event
   */
  _onSlotChange(event) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    const assigned = slot.assignedElements({ flatten: true });

    // Remove listeners from elements that are no longer slotted.
    for (const child of this._slottedChildren) {
      if (!assigned.includes(child)) {
        child.removeEventListener("pointerenter", this);
        child.removeEventListener("pointerleave", this);
        this._slottedChildren.delete(child);
      }
    }

    // Add listeners to newly slotted elements.
    for (const child of assigned) {
      if (!this._slottedChildren.has(child)) {
        child.addEventListener("pointerenter", this);
        child.addEventListener("pointerleave", this);
        this._slottedChildren.add(child);
      }
    }
  }

  renderSlots() {
    return html`
      <div part="content" class="md-card__content">
        <div part="media" class="md-card__media">
          <slot name="media" @slotchange=${this._onSlotChange}></slot>
        </div>
        <slot name="header" @slotchange=${this._onSlotChange}></slot>
        <slot @slotchange=${this._onSlotChange}></slot>
        <slot name="actions" @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }

  renderSurface() {
    if (this.interactive && this.href) {
      return html`
        <a
          id="card-surface"
          part="surface"
          class=${this.classes}
          href=${this.href}
          aria-disabled=${this.interactive && this.disabled ? "true" : nothing}
          tabindex=${this.disabled ? -1 : 0}
        ></a>
      `;
    }

    return html`
      <div
        id="card-surface"
        part="surface"
        class=${this.classes}
        role=${this.interactive ? "button" : nothing}
        tabindex=${this.interactive ? (this.disabled ? -1 : 0) : nothing}
        aria-disabled=${this.interactive && this.disabled ? "true" : nothing}
      ></div>
    `;
  }

  render() {
    return html`
      <md-shadow></md-shadow>
      ${when(
        this.interactive && !this.disabled,
        () => html`<md-ripple for="card-surface"></md-ripple>`,
      )}
      ${this.renderSurface()} ${this.renderSlots()}
    `;
  }
}
