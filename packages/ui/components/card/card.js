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
  }

  /** @returns {import("lit/directive.js").DirectiveResult<typeof import("lit/directives/class-map.js").ClassMapDirective>} */
  get classes() {
    return classMap({
      "md-card__surface": true,
      card_interactive: this.interactive,
      card_disabled: this.interactive && this.disabled,
    });
  }

  renderSlots() {
    return html`
      <div part="content" class="md-card__content">
        <div part="media" class="md-card__media">
          <slot name="media"></slot>
        </div>
        <slot name="header"></slot>
        <slot></slot>
        <slot name="actions"></slot>
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
        // No `for`: a ripple directly in the shadow root attaches to the
        // host, which sees pointer events from slotted content too.
        () => html`<md-ripple></md-ripple>`,
      )}
      ${this.renderSurface()} ${this.renderSlots()}
    `;
  }
}
