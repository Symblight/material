import { html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";

import { BaseSelect } from "./base-select.js";
import { internals } from "../../shared/form-associate-mixin.js";

/**
 * @tag md-native-select
 * @summary Material Design 3 select, backed by a genuine native `<select>`.
 *
 * Children must be real `<option>`/`<optgroup>` elements. They're reparented
 * into the shadow `<select>` rather than slotted — a native `<select>`
 * ignores slotted light-DOM options (`select.options` stays empty even
 * though a `<slot>` receives them), so slotting can't work here. Don't
 * revert this to a `<slot>`.
 *
 * ```html
 * <md-native-select label="Sort by" name="sort">
 *   <option value="name" selected>Name</option>
 *   <option value="date">Date modified</option>
 * </md-native-select>
 * ```
 */
@customElement("md-native-select")
export class MdNativeSelect extends BaseSelect {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    multiple: { type: Boolean, reflect: true },
    size: { type: Number },
  };

  constructor() {
    super();

    /** @type {boolean} */
    this.multiple = false;

    /** @type {number} */
    this.size = 0;

    // Watches light-DOM children directly (not a <slot>, see class doc) so
    // options added after first render get reparented too.
    this._optionsObserver = new MutationController(this, {
      config: { childList: true },
    });
    this._optionsObserver.callback = () => {
      // Reparenting itself mutates children — only re-sync if something's
      // actually still left to move, or this re-fires on its own work.
      if (this.children.length === 0) return;
      this._updateOptions();
    };
  }

  /** @param {import("lit").PropertyValues} changed */
  firstUpdated(changed) {
    super.firstUpdated(changed);
    this._updateOptions();
  }

  _updateOptions() {
    this._reparentOptions();
    this._syncValueFromSelect();
  }

  /** Moves top-level light-DOM `<option>`/`<optgroup>` children into the real `<select>`. */
  _reparentOptions() {
    const select = this.select;
    if (!select) return;
    for (const child of Array.from(this.children)) {
      if (child.tagName === "OPTION" || child.tagName === "OPTGROUP") {
        select.appendChild(child);
      }
    }
  }

  /**
   * Adopts the real `<select>`'s own selection into `value` (applying an
   * already-set `value` to it first, if any). Skipped for `multiple` —
   * assigning `.value` there is destructive, deselecting every other option.
   */
  _syncValueFromSelect() {
    const select = this.select;
    if (!select) return;
    if (!this.multiple && this.value !== undefined) {
      select.value = this.value;
    }
    this.setValue(select.value);
  }

  /** @param {string} value */
  setValue(value) {
    const select = this.select;
    if (this.multiple && select) {
      // A single string can't represent multiple selections — FormData is
      // the only way to submit multiple values under one field name.
      const formData = new FormData();
      for (const option of Array.from(select.selectedOptions)) {
        formData.append(this.name || "", option.value);
      }
      this.value = select.value;
      this[internals].setFormValue(formData);
      return;
    }
    super.setValue(value);
  }

  resetFormControl() {
    const select = this.select;
    if (!select) return;
    // A <select> that's genuinely part of the form's control list gets this
    // for free on reset; this one only reaches the form via ElementInternals,
    // so restore each option's `.selected` from `.defaultSelected` ourselves.
    for (const option of Array.from(select.options)) {
      option.selected = option.defaultSelected;
    }
    this.setValue(select.value);
  }

  /**
   * @param {string | null} ariaLabel
   * @param {string | null} ariaLabelledBy
   */
  renderControl(ariaLabel, ariaLabelledBy) {
    return html`
      <select
        .name=${this.name}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?multiple=${this.multiple}
        .size=${this.size}
        aria-label=${ariaLabel ?? nothing}
        aria-labelledby=${ariaLabelledBy ?? nothing}
        part="select"
        @change=${this.handleChange}
        class="select__native-control select__block"
        slot="input"
      ></select>
    `;
  }
}
