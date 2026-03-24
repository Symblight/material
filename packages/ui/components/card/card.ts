import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  nothing,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../shadow/shadow.ts";
import "../ripple/ripple.ts";
import type MdRipple from "../ripple/ripple.ts";

import styles from "./card.css?inline";
import elevatedStyles from "./elevated-card.css?inline";
import filledStyles from "./filled-card.css?inline";
import outlinedStyles from "./outlined-card.css?inline";

export type CardVariant = "elevated" | "filled" | "outlined";

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
  static get styles(): CSSResultGroup {
    return [
      elevatedStyles,
      filledStyles,
      outlinedStyles,
      styles,
    ] as unknown as CSSResultOrNative[];
  }

  /** Visual style of the card. Controls background colour, shadow, and border. */
  @property({ reflect: true })
  variant: CardVariant = "elevated";

  /**
   * Enables ripple feedback, hover/pressed/focus-visible states, pointer
   * cursor, and keyboard interaction.
   */
  @property({ type: Boolean, reflect: true })
  interactive: boolean = false;

  /**
   * Disables the card when `interactive` is set: applies opacity,
   * pointer-events: none, and aria-disabled on the inner surface.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * When set (and `interactive` is set), the inner surface is rendered as an
   * `<a>` element pointing to this URL.
   */
  @property({ type: String, reflect: true })
  href: string | undefined = undefined;

  @query("md-ripple")
  private rippleEl: MdRipple | undefined;

  /**
   * Tracks all elements currently slotted into the card so we can attach and
   * remove pointer-enter/leave listeners as slot content changes.
   */
  private _slottedChildren = new Set<Element>();

  private get classes() {
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
   */
  handleEvent(event: Event) {
    if (!this.interactive || this.disabled) return;
    const ripple = this.rippleEl;
    if (!ripple) return;
    ripple.handleEvent(event);
  }

  override connectedCallback() {
    super.connectedCallback();
    // pointerenter/leave must be on the host to catch events at the card boundary.
    // pointerdown/up bubble so host-level capture is sufficient.
    this.addEventListener("pointerenter", this);
    this.addEventListener("pointerleave", this);
    this.addEventListener("pointerdown", this);
    this.addEventListener("pointerup", this);
  }

  override disconnectedCallback() {
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
   */
  private _onSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
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

  private renderSlots() {
    return html`
      <div class="md-card__content">
        <div class="md-card__media">
          <slot name="media" @slotchange=${this._onSlotChange}></slot>
        </div>
        <slot name="header" @slotchange=${this._onSlotChange}></slot>
        <slot @slotchange=${this._onSlotChange}></slot>
        <slot name="actions" @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }

  private renderSurface() {
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

  override render() {
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

declare global {
  interface HTMLElementTagNameMap {
    "md-card": MdCard;
  }
}
