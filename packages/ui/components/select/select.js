import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { createContext } from "@lit/context";
import { live } from "lit/directives/live.js";
import { choose } from "lit/directives/choose.js";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import search from "@material-design-icons/svg/outlined/arrow_drop_down.svg?raw";
import check from "@material-design-icons/svg/outlined/check.svg?raw";

/** @import { TextField, TextFieldVariant } from "../text-field/text-field.js" */
import { MdOption } from "./option.js";
import { MdMenuItem } from "../menu/menu-item.js";

import "./option.js";
import "./group.js";
import "./hr.js";
import "../menu/menu-item.js";
import "../menu/menu.js";
import "../menu/group.js";

import "../text-field/text-field.js";

import styles from "./select.css?inline";
import { MdOptGroup } from "./group.js";
import { MdHr } from "./hr.js";
import {
  FormAssociateMixin,
  internals,
} from "../../shared/form-associate-mixin.js";

/**
 * @typedef {import("@lit/context").Context<symbol, { registerBlockConsumer: (option: MdOption) => void }>} ContextSelect
 */

/** @type {ContextSelect} */
export const selectContext = createContext(Symbol("select"));

/**
 * @tag md-select
 * @summary Material Select web component
 */

/** @typedef {MdOption | MdMenuItem | MdOptGroup | MdHr} MenuElementItem */
/** An option-like leaf: either an `md-option` or an `md-menu-item`. */
/** @typedef {MdOption | MdMenuItem} OptionLike */
/**
 * @typedef {object} MenuItem
 * @property {"option" | "optgroup" | "hr"} type
 * @property {MenuElementItem} element
 * @property {MenuItem[]} children
 */

@customElement("md-select")
export default class Select extends FormAssociateMixin(LitElement) {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    firstOptionValue: { state: true },
    options: { state: true },
    /**
     * True when any slotted child (recursively through `md-optgroup`) is an
     * `md-menu-item`. In this mode the visible, interactive control is an
     * `md-menu` popover instead of the native `<select>` dropdown — the
     * native `<select>` still renders (visually hidden) purely as the
     * `validationTarget`/value mirror for form participation.
     */
    _menuMode: { state: true },
    /** Mirrors `md-menu`'s open state, to drive `aria-expanded` on the trigger button. */
    _menuOpen: { state: true },
    disabled: { type: Boolean, reflect: true },
    value: { type: String, attribute: true },
    required: { type: Boolean, reflect: true },
    name: { type: String, attribute: true },
    label: { type: String, attribute: true },
    /** The variant style of the textField. */
    variant: {},
    multiple: { type: Boolean, reflect: true },
    size: { type: Number },
  };

  requiredValidationMessage = "Please select an item in the list.";

  /** @type {ShadowRootInit} */
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  constructor() {
    super();

    /** @type {string} */
    this.firstOptionValue = "";

    /** @type {MenuItem[]} */
    this.options = [];

    /** @type {boolean} */
    this._menuMode = false;

    /** @type {boolean} */
    this._menuOpen = false;

    /** @type {boolean} */
    this.disabled = false;

    /** @type {string | undefined} */
    this.value = undefined;

    /** @type {boolean} */
    this.required = false;

    /** @type {string} */
    this.name = "";

    /** @type {string} */
    this.label = "";

    /** @type {TextFieldVariant} */
    this.variant = "filled";

    /** @type {boolean} */
    this.multiple = false;

    /** @type {number} */
    this.size = 0;
  }

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  get form() {
    return this[internals].form;
  }

  get labels() {
    return this[internals].labels;
  }

  /** @returns {TextField | null} */
  get textField() {
    return /** @type {TextField | null} */ (
      this.renderRoot?.querySelector("md-text-field")
    );
  }

  /** @returns {HTMLSelectElement} */
  get select() {
    return /** @type {HTMLSelectElement} */ (
      this.renderRoot?.querySelector("select")
    );
  }

  /**
   * The menu-mode `md-menu` popover, if present. Named distinctly from
   * `menu` (which returns the slotted option-like elements) to avoid a
   * clash.
   * @returns {import("../menu/menu.js").MdMenu | null}
   */
  get menuEl() {
    return this.renderRoot?.querySelector("md-menu") ?? null;
  }

  /** @returns {(MdOption | MdOptGroup | MdHr)[]} */
  get menu() {
    const slot = /** @type {HTMLSlotElement | null} */ (
      this.renderRoot?.querySelector("slot:not([name])")
    );
    return /** @type {(MdOption | MdOptGroup | MdHr)[]} */ (
      slot?.assignedElements() ?? []
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("focusout", this._onFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("focusout", this._onFocusOut);
  }

  _onFocusOut = () => {
    queueMicrotask(() => {
      if (!this.matches(":focus-within") && this.textField) {
        this.textField.focused = false;
      }
    });
  };

  /** @param {import("lit").PropertyValues} _changedProperties */
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    if (this.textField) {
      this.textField.value = " ";
    }
  }

  resetFormControl() {
    this.setValue(this.firstOptionValue);
    if (this.multiple) {
      this.options.forEach((item) => {
        if (item.type === "option") {
          /** @type {MdOption} */ (item.element).selected = false;
        }
      });
    }
  }

  /** @param {import("lit").PropertyValues} changedProperties */
  updated(changedProperties) {
    if (changedProperties.has("value") || changedProperties.has("required")) {
      this.updateValidity();
    }
  }

  isValueMissing() {
    return !this.value;
  }

  get validationTarget() {
    return this.select;
  }

  /** @param {string} value */
  setValue(value) {
    this.value = value;
    this[internals].setFormValue(value);
    // In menu mode, the native `<select>` isn't the interaction source (it's
    // hidden, kept only as the validationTarget/value mirror) — nothing else
    // syncs its `.value` the way a real native `change` event would.
    if (this.select) {
      this.select.value = value;
    }
  }

  /** @param {Event} event */
  handleChange(event) {
    const value = /** @type {HTMLSelectElement} */ (event.target || null)
      ?.value;
    this.setValue(value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /** @param {CustomEvent<{ value: string }>} event */
  _onMenuSelect(event) {
    this.setValue(event.detail.value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  /**
   * Highlights `md-text-field` (its normal focus-ring styling) as soon as
   * the menu-mode popover opens, rather than relying solely on the trigger
   * button's own native `focus` event — Safari, notably, doesn't focus a
   * `<button>` on click by default, so that alone wouldn't reliably
   * highlight the field on open. Closing intentionally doesn't force
   * `focused = false` here: `md-menu.close()` returns focus to the trigger
   * by default, so the field should stay highlighted, and `md-text-field`'s
   * own existing blur tracking (bound to whatever's slotted into `input`)
   * already clears it correctly once focus genuinely leaves.
   *
   * Also mirrors the open state into `_menuOpen`, which drives the trigger
   * button's own `aria-expanded` (kept on the button itself — the actual
   * focusable/interactive combobox control — rather than relying on
   * `md-menu`'s automatic trigger-attribute wiring, which lands on
   * `md-text-field` since that's the `for` anchor used for popover
   * positioning, not the button).
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
   * Arrow Up/Down/Home/End pressed on the trigger button while the
   * popover is closed. Native `<select>` opens and navigates on these
   * keys without a prior click; `md-menu`'s own keydown handling only
   * sees events once focus is already inside the open menu (it's a
   * sibling of this button in the shadow root, not an ancestor), so
   * without this the keys would otherwise do nothing. Enter/Space aren't
   * handled here — they already open the menu via the button's native
   * `click` event (which `md-menu`'s trigger listener handles).
   * @param {KeyboardEvent} event
   */
  _onTriggerKeydown(event) {
    if (!this._menuMode || this.disabled) return;
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
        return /** @type {OptionLike} */ (item.element).value;
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
      if (option instanceof MdOption || option instanceof MdMenuItem) {
        options.push({
          element: option,
          type: "option",
          children: [],
        });
      }

      if (option instanceof MdOptGroup) {
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
   * @param {Element[]} elements
   * @returns {boolean}
   */
  _hasMenuItem(elements) {
    for (const el of elements) {
      if (el instanceof MdMenuItem) return true;
      if (el instanceof MdOptGroup && this._hasMenuItem([...el.children])) {
        return true;
      }
    }
    return false;
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
        const el = /** @type {OptionLike} */ (item.element);
        if (el.value === this.value) {
          return el instanceof MdMenuItem
            ? el.label
            : (el.textContent ?? "").trim();
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
    this._menuMode = this._hasMenuItem(this.menu);

    // Determine the reset value: first selected option, fallback to first option
    const selectedOption = this.options.find(
      (item) =>
        item.type === "option" &&
        /** @type {OptionLike} */ (item.element).selected,
    );
    this.firstOptionValue = selectedOption
      ? /** @type {OptionLike} */ (selectedOption.element).value
      : this.collectFirstOptionValue(this.options);

    // `value` may still be unset the first time options are known (no
    // `value` attribute was given). Without this, `required` would report
    // invalid forever even though a real option is selected by default,
    // since nothing else ever assigns an initial `value`.
    if (this.value === undefined) {
      this.setValue(this.firstOptionValue);
    }
    this.updateValidity();

    this.requestUpdate();

    // After render, imperatively sync select.value if value prop is set
    this.updateComplete.then(() => {
      if (this.value !== undefined && this.select) {
        this.select.value = this.value;
      }
    });
  }

  /**
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
            const item = /** @type {OptionLike} */ (option);
            const label =
              item instanceof MdMenuItem ? item.label : item.textContent;
            return html` <option
              .value="${item.value}"
              ?selected="${item.selected}"
            >
              ${label}
            </option>`;
          },
        ],
        [
          "optgroup",
          () =>
            html` <optgroup
              .label="${/** @type {MdOptGroup} */ (option).label}"
            >
              ${this.renderMenu(node.children)}
            </optgroup>`,
        ],
        ["hr", () => html` <hr />`],
      ])}`;
    })}`;
  }

  /**
   * Menu-mode counterpart to `renderMenu()` — same tree, rendered as
   * `md-menu-item`/`md-menu-group`/`md-hr` for the `md-menu` popover
   * instead of native `<option>`/`<optgroup>`/`<hr>` for the hidden
   * `<select>`. `selected` is computed live against `this.value` rather
   * than trusting each element's own (possibly stale/initial) `selected`
   * property.
   * @param {MenuItem[]} items
   * @returns {import("lit").TemplateResult<1>}
   */
  renderMenuItems(items) {
    return html`${items.map((node) => {
      const option = node.element;
      return html`${choose(node.type, [
        [
          "option",
          () => {
            const item = /** @type {OptionLike} */ (option);
            const label =
              item instanceof MdMenuItem ? item.label : item.textContent;
            const isSelected = item.value === this.value;
            return html`
              <md-menu-item
                type="option"
                .value="${item.value}"
                ?selected="${isSelected}"
              >
                ${
                  isSelected
                    ? html`<md-icon slot="leading"
                        >${unsafeSVG(check)}</md-icon
                      >`
                    : nothing
                }
                ${label}
              </md-menu-item>
            `;
          },
        ],
        [
          "optgroup",
          () =>
            html`<md-menu-group
              label="${/** @type {MdOptGroup} */ (option).label}"
            >
              ${this.renderMenuItems(node.children)}
            </md-menu-group>`,
        ],
        ["hr", () => html`<md-hr></md-hr>`],
      ])}`;
    })}`;
  }

  /**
   * The native `<select>`, shared by both modes — visible/interactive in
   * native mode, visually-hidden (validationTarget/value-mirror only) in
   * menu mode. Always kept in the `input` slot (even hidden) rather than
   * unslotted, so `validationTarget`/`reportValidity()` anchors to a
   * genuinely rendered element instead of inert, unprojected content.
   * @param {string | null} ariaLabel
   * @param {string | null} ariaLabelledBy
   */
  renderNativeSelect(ariaLabel, ariaLabelledBy) {
    return html`
      <select
        .name=${this.name}
        .value=${live(this.value)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?multiple=${this.multiple}
        .size=${this.size}
        aria-label=${ariaLabel ?? ""}
        aria-labelledby=${ariaLabelledBy ?? ""}
        aria-hidden=${this._menuMode ? "true" : nothing}
        tabindex=${this._menuMode ? -1 : 0}
        part="select"
        @change=${this.handleChange}
        class="select__native-control ${
          this._menuMode ? "select__native-control_hidden" : ""
        }"
        slot="input"
      >
        ${this.renderMenu(this.options)}
      </select>
    `;
  }

  render() {
    const ariaLabel = this.getAttribute("aria-label");
    const ariaLabelledBy = this.getAttribute("aria-labelledby");

    return html`
      <md-text-field
        id="select-field"
        class="select__field"
        .label="${this.label}"
        part="text-field"
        exportparts="box, input, prefix, suffix, wrapper, label, help-text"
        ?disabled=${this.disabled}
        .variant="${this.variant}"
      >
        ${
          this._menuMode
            ? html`
                <!--
                  a11y note: this combobox trigger keeps real DOM focus-move
                  into the open listbox (menuEl.focusFirstItem()/etc. below
                  and md-menu's own roving tabindex) rather than the
                  canonical ARIA combobox pattern of keeping focus on this
                  button and pointing aria-activedescendant at the "active"
                  option. Real-focus-move popups are a recognized, valid
                  alternative — not broken — but it's a deliberate choice,
                  not an oversight: switching to aria-activedescendant would
                  need real screen-reader (NVDA/JAWS) validation before
                  landing, which isn't feasible to do blind.
                -->
                <button
                  id="select-trigger"
                  type="button"
                  part="select"
                  class="select__native-control"
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
                ${this.renderNativeSelect(ariaLabel, ariaLabelledBy)}
              `
            : this.renderNativeSelect(ariaLabel, ariaLabelledBy)
        }
        <slot @slotchange=${this.updateSlottedOptions}></slot>

        <md-icon slot="trailing"> ${unsafeSVG(search)} </md-icon>
      </md-text-field>

      ${
        this._menuMode
          ? html`
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
                ${this.renderMenuItems(this.options)}
              </md-menu>
            `
          : nothing
      }
    `;
  }
}
