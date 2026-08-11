import { html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ContextProvider } from "@lit/context";
import { live } from "lit/directives/live.js";
import { choose } from "lit/directives/choose.js";

import arrowDropUp from "@material-design-icons/svg/outlined/arrow_drop_up.svg?raw";

import { MdOption } from "./option.js";

import "./option.js";
import "./group.js";
import "./hr.js";
import "../menu/menu.js";

import { BaseSelect } from "./base-select.js";
import { MdOptionGroup } from "./group.js";
import { MdHr } from "./hr.js";
import { selectContext } from "./select-context.js";

export { selectContext };

/** @typedef {MdOption | MdOptionGroup | MdHr} MenuElementItem */
/**
 * @typedef {object} MenuItem
 * @property {"option" | "optgroup" | "hr"} type
 * @property {MenuElementItem} element
 * @property {MenuItem[]} children
 */

/**
 * @tag md-select
 * @summary Material Design 3 select, backed by an `md-menu` popover
 * combobox.
 *
 * The trigger is a text-field-styled button that opens an `md-menu` popover
 * built from slotted `md-option`/`md-option-group`/`md-hr` children. A
 * visually-hidden native `<select>` is kept alongside as the form's
 * validationTarget/value mirror, with its `<option>`/`<optgroup>` tree
 * fabricated from the slotted options (`md-option` can't be a real
 * `<option>` child) rather than reparented like `md-native-select` does.
 *
 * For a plain browser-native dropdown instead, use `md-native-select`.
 *
 * Slot: *(default)* — `md-option`, `md-option-group`, `md-hr` children.
 */
@customElement("md-select")
export default class Select extends BaseSelect {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    firstOptionValue: { state: true },
    options: { state: true },
    /** Mirrors `md-menu`'s open state, to drive `aria-expanded` on the trigger button. */
    _menuOpen: { state: true },
  };

  constructor() {
    super();

    /** @type {string} */
    this.firstOptionValue = "";

    /** @type {MenuItem[]} */
    this.options = [];

    /** @type {boolean} */
    this._menuOpen = false;

    // Provides { value } to descendant md-option/md-option-group — see
    // select-context.js.
    this._contextProvider = new ContextProvider(this, {
      context: selectContext,
      initialValue: { value: "" },
    });
  }

  /**
   * The `md-menu` popover, if present. Named distinctly from `menu` (the
   * slotted option-like elements) to avoid a clash.
   * @returns {import("../menu/menu.js").MdMenu | null}
   */
  get menuEl() {
    return this.renderRoot?.querySelector("md-menu") ?? null;
  }

  /** @returns {(MdOption | MdOptionGroup | MdHr)[]} */
  get menu() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    return /** @type {(MdOption | MdOptionGroup | MdHr)[]} */ (
      slot?.assignedElements() ?? []
    );
  }

  resetFormControl() {
    this.setValue(this.firstOptionValue);
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value")) {
      this._contextProvider.setValue({ value: this.value ?? "" });
    }
  }

  /** @param {CustomEvent<{ value: string }>} event */
  _onMenuSelect(event) {
    this.setValue(event.detail.value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /**
   * Highlights `md-text-field` as soon as the popover opens, since Safari
   * doesn't focus a `<button>` on click by default. Doesn't force
   * `focused = false` on close — `md-menu` returns focus to the trigger,
   * and `md-text-field`'s own blur tracking clears it once focus leaves.
   *
   * Also mirrors open state into `_menuOpen`, which drives `aria-expanded`
   * on the trigger button directly (not via `md-menu`'s automatic wiring,
   * which targets `md-text-field` as the popover's `for` anchor instead).
   * @param {Event} event
   */
  _onMenuToggle(event) {
    const isOpen = /** @type {ToggleEvent} */ (event).newState === "open";
    this._menuOpen = isOpen;
    if (isOpen && this.textField) {
      this.textField.focused = true;
    }
  }

  /**
   * Arrow/Home/End pressed on the trigger while closed. `md-menu`'s keydown
   * handling only fires once focus is inside the open menu (a sibling, not
   * an ancestor, of this button), so opening + navigating on these keys has
   * to happen here. Enter/Space already open the menu via native `click`.
   * @param {KeyboardEvent} event
   */
  _onTriggerKeydown(event) {
    if (this.disabled) return;
    const menuEl = this.menuEl;
    if (!menuEl || menuEl.open) return;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        menuEl.show().then(() => menuEl.focusSelectedItem());
        return;
      case "Home":
        event.preventDefault();
        menuEl.show().then(() => menuEl.focusFirstItem());
        return;
      case "End":
        event.preventDefault();
        menuEl.show().then(() => menuEl.focusLastItem());
        return;
      default:
        return;
    }
  }

  /**
   * @param {MenuItem[]} items
   * @returns {string}
   */
  collectFirstOptionValue(items) {
    for (const item of items) {
      if (item.type === "option") {
        return /** @type {MdOption} */ (item.element).value;
      }
      if (item.type === "optgroup" && item.children.length) {
        const found = this.collectFirstOptionValue(item.children);
        if (found !== "") return found;
      }
    }
    return "";
  }

  /**
   * @param {Element[]} items
   * @param {MenuItem[]} options
   */
  convertAndMoveOptions(items, options = []) {
    items.forEach((option) => {
      if (option instanceof MdOption) {
        options.push({
          element: option,
          type: "option",
          children: [],
        });
      }

      if (option instanceof MdOptionGroup) {
        /** @type {MenuItem[]} */
        const childrenOptions = [];
        this.convertAndMoveOptions([...option.children], childrenOptions);
        options.push({
          element: option,
          type: "optgroup",
          children: childrenOptions,
        });
      }

      if (option instanceof MdHr) {
        options.push({
          element: option,
          type: "hr",
          children: [],
        });
      }
    });
  }

  /**
   * The current value's display label, read from `this.options` (not the
   * DOM) so it's correct even before a pending re-render commits.
   * @param {MenuItem[]} items
   * @returns {string}
   */
  findSelectedLabel(items) {
    for (const item of items) {
      if (item.type === "option") {
        const el = /** @type {MdOption} */ (item.element);
        if (el.value === this.value) {
          return el.label;
        }
      }
      if (item.type === "optgroup" && item.children.length) {
        const found = this.findSelectedLabel(item.children);
        if (found) return found;
      }
    }
    return "";
  }

  updateSlottedOptions() {
    this.options = [];
    this.convertAndMoveOptions(this.menu, this.options);

    // Reset value: first selected option, falling back to the first option.
    const selectedOption = this.options.find(
      (item) =>
        item.type === "option" &&
        /** @type {MdOption} */ (item.element).selected,
    );
    this.firstOptionValue = selectedOption
      ? /** @type {MdOption} */ (selectedOption.element).value
      : this.collectFirstOptionValue(this.options);

    // `value` may still be unset the first time options are known (no
    // `value` attribute given) — assign a default so `required` doesn't
    // report invalid forever.
    if (this.value === undefined) {
      this.setValue(this.firstOptionValue);
    }
    this.updateValidity();

    this.requestUpdate();

    this.updateComplete.then(() => {
      if (this.value !== undefined && this.select) {
        this.select.value = this.value;
      }
    });
  }

  /**
   * Fabricates the real `<option>`/`<optgroup>`/`<hr>` tree for the hidden
   * mirror `<select>`, since `md-option` can't be a genuine `<option>` child.
   * @param {MenuItem[]} items
   * @returns {import("lit").TemplateResult<1>}
   */
  renderMenu(items) {
    return html`${items.map((node) => {
      const option = node.element;
      return html`${choose(node.type, [
        [
          "option",
          () => {
            const item = /** @type {MdOption} */ (option);
            return html` <option
              .value="${item.value}"
              ?selected="${item.selected}"
            >
              ${item.label}
            </option>`;
          },
        ],
        [
          "optgroup",
          () =>
            html` <optgroup
              .label="${/** @type {MdOptionGroup} */ (option).label}"
            >
              ${this.renderMenu(node.children)}
            </optgroup>`,
        ],
        ["hr", () => html` <hr />`],
      ])}`;
    })}`;
  }

  /**
   * The hidden `<select>` kept as the form's validationTarget/value mirror
   * (the trigger button is the real control). Hidden via CSS clipping, not
   * `display: none`, so `reportValidity()` still has something to anchor to.
   * @param {string | null} ariaLabel
   * @param {string | null} ariaLabelledBy
   */
  renderHiddenSelect(ariaLabel, ariaLabelledBy) {
    return html`
      <select
        .name=${this.name}
        .value=${live(this.value)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-label=${ariaLabel ?? ""}
        aria-labelledby=${ariaLabelledBy ?? ""}
        aria-hidden="true"
        tabindex="-1"
        part="select"
        @change=${this.handleChange}
        class="select__native-control select__native-control_hidden"
        slot="input"
      >
        ${this.renderMenu(this.options)}
      </select>
    `;
  }

  get _trailingIcon() {
    return this._menuOpen ? arrowDropUp : super._trailingIcon;
  }

  /**
   * @param {string | null} ariaLabel
   * @param {string | null} ariaLabelledBy
   */
  renderControl(ariaLabel, ariaLabelledBy) {
    return html`
      <button
        id="select-trigger"
        type="button"
        part="select"
        class="select__native-control select__block"
        ?disabled=${this.disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="select-listbox"
        aria-expanded=${this._menuOpen ? "true" : "false"}
        aria-label=${ariaLabel ?? nothing}
        aria-labelledby=${ariaLabelledBy ?? nothing}
        @keydown=${this._onTriggerKeydown}
        slot="input"
      >
        ${this.findSelectedLabel(this.options)}
      </button>
      ${this.renderHiddenSelect(ariaLabel, ariaLabelledBy)}
    `;
  }

  renderExtra() {
    return html`
      <md-menu
        id="select-listbox"
        for="select-field"
        placement="bottom-start"
        match-anchor-width
        menu-role="listbox"
        focus-on-open="selected"
        @select=${this._onMenuSelect}
        @toggle=${this._onMenuToggle}
      >
        <slot @slotchange=${this.updateSlottedOptions}></slot>
      </md-menu>
    `;
  }
}
