import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextConsumer } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import check from "@material-design-icons/svg/outlined/check.svg?raw";

import { ListboxItemMixin } from "../shared/listbox-item-mixin.js";
import { selectContext } from "./select-context.js";

import styles from "../menu/menu-item.css?inline";

/** @import { SelectContextValue } from "./select-context.js" */

const DEFAULT_CONTEXT = /** @type {SelectContextValue} */ ({
  value: "",
});

/**
 * @tag md-option
 * @summary Material Design 3 select option.
 *
 * A single option in `md-select`'s `md-menu`-popover combobox. Renders as a
 * listbox row (shared with `md-menu-item` via `ListboxItemMixin`);
 * `aria-selected` and the checkmark come from comparing `value` against
 * `selectContext.value`, not the `selected` property (which only seeds
 * `md-select`'s form-reset value).
 *
 * Slots: same as `md-menu-item` — *(default)* label, `leading`,
 * `supporting-text`, `trailing-badge`, `trailing`.
 */
@customElement("md-option")
export class MdOption extends ListboxItemMixin(LitElement) {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    // Imperative controller, matching this codebase's other reactive
    // controllers, rather than the `@consume` decorator.
    this._context = new ContextConsumer(this, {
      context: selectContext,
      subscribe: true,
    });
  }

  /** @returns {SelectContextValue} */
  get _selectContext() {
    return this._context.value ?? DEFAULT_CONTEXT;
  }

  /** The option's default-slot label text, mirroring `md-menu-item.label`. */
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

  /** @returns {boolean} */
  get _isSelected() {
    return this.value === this._selectContext.value;
  }

  // ── ListboxItemMixin hooks ────────────────────────────────────────────────

  get _ariaRole() {
    return "option";
  }

  get _ariaSelected() {
    return String(this._isSelected);
  }

  _renderLeadingZone() {
    if (this._isSelected) {
      return html`
        <span part="leading" class="md-menu-item__leading-wrapper has-content">
          <md-icon>${unsafeSVG(check)}</md-icon>
        </span>
      `;
    }
    return super._renderLeadingZone();
  }

  render() {
    return this._renderInteractive();
  }
}
