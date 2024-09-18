import { LitElement } from "lit";

type Constructor<T = {}> = new (...args: any[]) => T;

export const internals = Symbol("internals");
const privateInternals = Symbol("privateInternals");

export const FormAssociateMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class FormAssociate extends superClass {
    static formAssociated = true;

    // constructor(...args) {
    //   super(...args);
    //   this[internals] = this.attachInternals();
    // }
    public [internals]: ElementInternals;
    [privateInternals]: ElementInternals;

    // [internals]: ElementInternals;
    get [internals](): ElementInternals {
      if (!this[privateInternals]) {
        this[privateInternals] = this.attachInternals();
      }
      return this[privateInternals];
    }

    formAssociatedCallback() {
      // Called when the custom element is associated with a form
      console.log("CustomRadio element is associated with a form");

      // this[internals].setValidity(
      //   this.input.validity,
      //   this.input.validationMessage,
      //   this.input
      // );
    }

    formResetCallback() {
      this.checked = false;
      this[internals].setFormValue(this.value);
    }
    formDisabledCallback(disabled: boolean) {
      this.disabled = disabled;
    }

    formStateRestoreCallback(state, mode) {
      // Called when the form's state is restored
      console.log("Form state is restored");
    }

    public checkValidity(): boolean {
      console.log("check validity");
      return this[internals].checkValidity();
    }

    public reportValidity(): void {
      console.log("report validity");
      return this[internals].reportValidity();
    }

    get willValidate() {
      console.log("willValidate");
      return this[internals].willValidate;
    }

    public get validity(): ValidityState {
      console.log(" validity");
      return this[internals].validity;
    }

    public get validationMessage(): string {
      return this[internals].validationMessage;
    }
  }

  return FormAssociate;
};
