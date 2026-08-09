/** @import { LitElement } from "lit" */

/**
 * @template {object} [T=object]
 * @typedef {new (...args: any[]) => T} Constructor
 */

export const internals = Symbol("internals");
const privateInternals = Symbol("privateInternals");

/**
 * Shared `ElementInternals` plumbing for form-associated custom elements:
 * lazy internals, `form`/`labels`/`validity` proxies, `<fieldset disabled>`
 * propagation, and a `required`-aware `updateValidity()`.
 *
 * Hosts that need `required` validation override `isValueMissing()` (and,
 * if their validation anchor isn't `this`, `validationTarget`) and call
 * `this.updateValidity()` whenever a property affecting either one changes.
 * Hosts with more complex validity needs (e.g. `md-radio`'s group-aware
 * check) can ignore `isValueMissing()` entirely and override
 * `updateValidity()` directly.
 * @template {Constructor<LitElement>} T
 * @param {T} superClass
 */
export const FormAssociateMixin = (superClass) => {
  class FormAssociate extends superClass {
    static formAssociated = true;

    /** @type {ElementInternals | undefined} */
    [privateInternals];

    /** @returns {ElementInternals} */
    get [internals]() {
      if (!this[privateInternals]) {
        this[privateInternals] = this.attachInternals();
      }
      return /** @type {ElementInternals} */ (this[privateInternals]);
    }

    /**
     * The message reported for a `required` host missing its value.
     * Override on the host class to customize.
     */
    requiredValidationMessage = "Please fill out this field.";

    formAssociatedCallback() {}

    /**
     * Called by `formResetCallback`. Hosts override this to reset their own
     * state (mirrors the `resetFormControl` hook used by `md-text-field`'s
     * `@open-wc/form-control` mixin).
     */
    resetFormControl() {}

    formResetCallback() {
      this.resetFormControl();
    }

    /** @param {boolean} disabled */
    formDisabledCallback(disabled) {
      /** @type {any} */ (this).disabled = disabled;
    }

    /**
     * @param {unknown} _state
     * @param {unknown} _mode
     */
    formStateRestoreCallback(_state, _mode) {}

    /** @returns {boolean} */
    checkValidity() {
      return this[internals].checkValidity();
    }

    /** @returns {boolean} */
    reportValidity() {
      return this[internals].reportValidity();
    }

    get willValidate() {
      return this[internals].willValidate;
    }

    /** @returns {ValidityState} */
    get validity() {
      return this[internals].validity;
    }

    /** @returns {string} */
    get validationMessage() {
      return this[internals].validationMessage;
    }

    /**
     * The element `setValidity()` anchors its message/focus to. Override on
     * the host class; defaults to the host itself.
     * @returns {HTMLElement | null | undefined}
     */
    get validationTarget() {
      return /** @type {HTMLElement} */ (/** @type {unknown} */ (this));
    }

    /**
     * Whether a `required` host is currently missing its value. Hosts
     * relying on the mixin's default `updateValidity()` MUST override this
     * (e.g. `!this.checked`, `!this.value`).
     * @returns {boolean}
     */
    isValueMissing() {
      return false;
    }

    /**
     * Recomputes `ElementInternals` validity from `required` and
     * `isValueMissing()`. Must be called by the host whenever a property
     * affecting either one changes: `ElementInternals`-based elements
     * default to *valid* until `setValidity()` is called, unlike native
     * `<input required>`, which browsers validate continuously.
     */
    updateValidity() {
      if (/** @type {any} */ (this).required && this.isValueMissing()) {
        this[internals].setValidity(
          { valueMissing: true },
          this.requiredValidationMessage,
          this.validationTarget ?? undefined,
        );
        return;
      }
      this[internals].setValidity({});
    }
  }

  return FormAssociate;
};
