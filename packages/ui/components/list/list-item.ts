import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import "../ripple/ripple.ts";

import styles from "./list-item.css?inline";

/**
 * @tag md-list-item
 * @summary Material Design 3 list item.
 *
 * Non-interactive by default — renders a static `<li>` layout.
 *
 * Set `button` to wrap content in a `<button>` with ripple + focus ring.
 * Set `href` to wrap content in an `<a>` with ripple + focus ring.
 *
 * Slots:
 *  - *(default)* — headline / label text
 *  - `overline` — small metadata text above label
 *  - `supporting-text` — secondary text below label
 *  - `leading` — any leading content (icon, avatar, media, selection control)
 *  - `trailing` — any trailing content (icon, text, selection control)
 */
@customElement("md-list-item")
export class MdListItem extends LitElement {
  static get styles(): CSSResultGroup {
    return [styles] as unknown as CSSResultOrNative[];
  }

  /** Renders an inner `<button>` with ripple and focus ring. */
  @property({ type: Boolean, reflect: true })
  button: boolean = false;

  /**
   * When set, renders an inner `<a href="...">` with ripple and focus ring.
   * Takes precedence over `button` if both are set.
   */
  @property({ type: String, reflect: true })
  href: string | undefined = undefined;

  // ── Slot presence state ─────────────────────────────────────────────────

  @state() private _hasOverline = false;
  @state() private _hasSupportingText = false;
  @state() private _hasLeading = false;
  @state() private _hasTrailing = false;

  @query(".md-list-item__interactive")
  private _interactiveEl: HTMLButtonElement | HTMLAnchorElement | undefined;

  // ── Slot change helpers ─────────────────────────────────────────────────

  private _onSlotChange(event: Event, setter: (v: boolean) => void) {
    const slot = event.target as HTMLSlotElement;
    setter(slot.assignedNodes({ flatten: true }).length > 0);
  }

  // ── Roving tabindex API (called by md-list) ─────────────────────────────

  /** Returns the tabindex of the interactive inner element. */
  getTabIndex(): number {
    return this._interactiveEl
      ? Number(this._interactiveEl.getAttribute("tabindex") ?? "0")
      : 0;
  }

  /** Sets the tabindex of the interactive inner element. */
  setTabIndex(value: number) {
    if (this._interactiveEl) {
      this._interactiveEl.setAttribute("tabindex", String(value));
    }
  }

  /** Focuses the interactive inner element (button or a). */
  focusInteractive() {
    this._interactiveEl?.focus();
  }

  // ── Render helpers ──────────────────────────────────────────────────────

  private _renderLeadingZone() {
    return html`
      <div
        class="md-list-item__leading-wrapper ${classMap({ "has-content": this._hasLeading })}"
      >
        <slot
          name="leading"
          @slotchange=${(e: Event) =>
            this._onSlotChange(e, (v) => (this._hasLeading = v))}
        ></slot>
      </div>
    `;
  }

  private _renderTextZone() {
    return html`
      <span class="md-list-item__text">
        <span
          class="md-list-item__overline-wrapper ${classMap({ "has-content": this._hasOverline })}"
        >
          <span class="md-list-item__overline">
            <slot
              name="overline"
              @slotchange=${(e: Event) =>
                this._onSlotChange(e, (v) => (this._hasOverline = v))}
            ></slot>
          </span>
        </span>
        <span class="md-list-item__label">
          <slot></slot>
        </span>
        <span
          class="md-list-item__supporting-text-wrapper ${classMap({ "has-content": this._hasSupportingText })}"
        >
          <span class="md-list-item__supporting-text">
            <slot
              name="supporting-text"
              @slotchange=${(e: Event) =>
                this._onSlotChange(e, (v) => (this._hasSupportingText = v))}
            ></slot>
          </span>
        </span>
      </span>
    `;
  }

  private _renderTrailingZone() {
    return html`
      <div
        class="md-list-item__trailing-wrapper ${classMap({ "has-content": this._hasTrailing })}"
      >
        <slot
          name="trailing"
          @slotchange=${(e: Event) =>
            this._onSlotChange(e, (v) => (this._hasTrailing = v))}
        ></slot>
      </div>
    `;
  }

  private _renderInteractiveContent() {
    return html`
      ${this._renderLeadingZone()} ${this._renderTextZone()}
      ${this._renderTrailingZone()}
    `;
  }

  override render() {
    return html`
      <li class="md-list-item">
        ${when(
          this.href != null,
          () => html`
            <a
              id="list-item-interactive"
              class="md-list-item__interactive"
              part="interactive"
              href=${this.href!}
              tabindex="0"
            >
              <md-ripple for="list-item-interactive"></md-ripple>
              ${this._renderInteractiveContent()}
            </a>
          `,
          () =>
            when(
              this.button,
              () => html`
                <button
                  id="list-item-interactive"
                  class="md-list-item__interactive"
                  part="interactive"
                  type="button"
                  tabindex="0"
                >
                  <md-ripple for="list-item-interactive"></md-ripple>
                  ${this._renderInteractiveContent()}
                </button>
              `,
              () => html`
                ${this._renderLeadingZone()} ${this._renderTextZone()}
                ${this._renderTrailingZone()}
              `,
            ),
        )}
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-list-item": MdListItem;
  }
}
