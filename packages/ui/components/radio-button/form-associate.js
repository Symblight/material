/** @import { LitElement } from "lit" */

/**
 * @template {object} [T=object]
 * @typedef {new (...args: any[]) => T} Constructor
 */

export const internals = Symbol("internals");
const privateInternals = Symbol("privateInternals");

/**
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

    formAssociatedCallback() {}

    formResetCallback() {
      /** @type {any} */ (this).checked = false;
      this[internals].setFormValue(null);
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
  }

  return FormAssociate;
};
