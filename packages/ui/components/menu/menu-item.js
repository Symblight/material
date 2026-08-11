import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import chevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?raw";

import { ListboxItemMixin } from "../shared/listbox-item-mixin.js";

import "../ripple/ripple.js";
import "../icon/icon.js";

import styles from "./menu-item.css?inline";

/** @import { MdMenu } from "./menu.js" */

const HOVER_CLOSE_DELAY = 180;

/**
 * Submenu elements that already have hover-intent listeners attached, so
 * repeated `slotchange` events don't accumulate duplicate listeners.
 * @type {WeakSet<Element>}
 */
const submenusWithHoverListeners = new WeakSet();

/**
 * @tag md-menu-item
 * @summary Material Design 3 menu item.
 *
 * Renders a single interactive row inside `<md-menu>`. Dispatches `select`
 * on activation (click / Enter / Space) unless `disabled`. Shares its
 * interactive-row rendering (button/`<a href>`, ripple, leading/trailing/
 * supporting-text/badge slots, roving tabindex) with `md-option`
 * (`components/select/option.js`) via `ListboxItemMixin`
 * (`components/shared/listbox-item-mixin.js`) — this class only adds
 * submenu/hover-intent behavior and typeahead's `label` getter on top.
 *
 * Slots:
 *  - *(default)* — item label text
 *  - `leading` — icon or checkmark
 *  - `supporting-text` — optional secondary line under the label
 *  - `trailing-badge` — optional small pill (e.g. "New")
 *  - `trailing` — optional plain text, e.g. a keyboard shortcut (`⌘C`)
 *  - `submenu` — a nested `<md-menu>`; presence of assigned content
 *    auto-renders a trailing chevron icon
 */
@customElement("md-menu-item")
export class MdMenuItem extends ListboxItemMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    keepOpen: { type: Boolean, reflect: true, attribute: "keep-open" },
    // ── Slot presence state ─────────────────────────────────────────────
    _hasSubmenu: { state: true },
    /** Mirrors the submenu's own open state onto `aria-expanded`. */
    _submenuOpen: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {boolean} */
    this.keepOpen = false;

    this._hasSubmenu = false;
    this._submenuOpen = false;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._hoverTimer = undefined;
  }

  /** @returns {boolean} */
  get hasSubmenu() {
    return this._hasSubmenu;
  }

  /** @returns {MdMenu | undefined} */
  get submenuEl() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector('slot[name="submenu"]')
    );
    return /** @type {MdMenu | undefined} */ (
      slot
        ?.assignedElements({ flatten: true })
        .find((el) => el.tagName === "MD-MENU") ?? undefined
    );
  }

  /** The item's default-slot label text, used for typeahead matching. */
  get label() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    if (!slot) return this.textContent?.trim() ?? "";
    return slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
  }

  // ── ListboxItemMixin hooks: submenu ARIA/chevron ─────────────────────────

  get _ariaHaspopup() {
    // APG: "A parent menuitem has aria-haspopup set to menu/true... and
    // aria-expanded set to false/true" synced to the submenu's visibility.
    return this._hasSubmenu ? "menu" : nothing;
  }

  get _ariaExpanded() {
    return this._hasSubmenu ? String(this._submenuOpen) : nothing;
  }

  _renderTrailingExtra() {
    return this._hasSubmenu
      ? html`<md-icon part="icon" class="md-menu-item__icon-wrapper">
          ${unsafeSVG(chevronRight)}
        </md-icon>`
      : nothing;
  }

  _onInteractivePointerLeave() {
    this._onPointerLeave();
  }

  /**
   * Opens this item's submenu (if any) and optionally focuses its first item.
   * Called by the parent `md-menu` in response to ArrowRight.
   * @returns {boolean} whether a submenu was opened
   */
  expandSubmenu() {
    if (!this._hasSubmenu) return false;
    this._openSubmenu({ focusFirst: true });
    return true;
  }

  /**
   * @param {{ focusFirst?: boolean }} [options]
   */
  _openSubmenu({ focusFirst = false } = {}) {
    const submenu = this.submenuEl;
    if (!submenu) return;
    clearTimeout(this._hoverTimer);
    submenu.anchorElement = this._interactiveEl ?? this;
    if (!submenu.open) {
      submenu.open = true;
    }
    if (focusFirst) {
      submenu.updateComplete.then(() => submenu.focusFirstItem());
    }
  }

  /**
   * @param {{ returnFocus?: boolean }} [options]
   */
  _closeSubmenu({ returnFocus = false } = {}) {
    const submenu = this.submenuEl;
    if (!submenu || !submenu.open) return;
    clearTimeout(this._hoverTimer);
    submenu.close({ returnFocus: false });
    if (returnFocus) this.focusInteractive();
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  /** @param {MouseEvent} event */
  _onClick(event) {
    if (this.disabled) {
      // `<a>` has no native `disabled` — unlike `<button disabled>`, it
      // still fires `click` and would navigate unless stopped here.
      event.preventDefault();
      return;
    }
    if (this._hasSubmenu) {
      event.stopPropagation();
      const submenu = this.submenuEl;
      if (submenu?.open) {
        this._closeSubmenu();
      } else {
        this._openSubmenu({ focusFirst: false });
      }
      return;
    }
    super._onClick(event);
  }

  /**
   * Submenus open on click/`ArrowRight` only, but hovering away from an
   * open submenu's parent item closes it after a short delay (cancelled if
   * the pointer moves into the submenu itself, see `_onSubmenuSlotChange`).
   */
  _onPointerLeave() {
    if (!this._hasSubmenu) return;
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(
      () => this._closeSubmenu(),
      HOVER_CLOSE_DELAY,
    );
  }

  /** @param {Event} event */
  _onSubmenuSlotChange(event) {
    const slot = /** @type {HTMLSlotElement} */ (event.target);
    this._hasSubmenu = slot.assignedElements({ flatten: true }).length > 0;

    const submenu = this.submenuEl;
    if (submenu && !submenusWithHoverListeners.has(submenu)) {
      submenusWithHoverListeners.add(submenu);

      submenu.addEventListener("pointerenter", () =>
        clearTimeout(this._hoverTimer),
      );
      submenu.addEventListener("pointerleave", () => {
        clearTimeout(this._hoverTimer);
        this._hoverTimer = setTimeout(
          () => this._closeSubmenu(),
          HOVER_CLOSE_DELAY,
        );
      });

      // Mirrors onto aria-expanded — "opening"/"closing" fire synchronously,
      // before the animation, so ARIA state doesn't trail the visual state.
      submenu.addEventListener("opening", () => {
        this._submenuOpen = true;
      });
      submenu.addEventListener("closing", () => {
        this._submenuOpen = false;
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._hoverTimer);
  }

  render() {
    // Submenu slot is a sibling of the interactive element, not nested
    // inside it — nesting a `menu` widget inside this item's `<button>`/
    // `<a>` broke the a11y tree and let submenu clicks bubble into `@click`.
    return html`
      ${this._renderInteractive()}
      <slot
        name="submenu"
        @slotchange=${(/** @type {Event} */ e) => this._onSubmenuSlotChange(e)}
      ></slot>
    `;
  }
}
