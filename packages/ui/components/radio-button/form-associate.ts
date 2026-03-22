import { LitElement } from "lit";

type Constructor<T = object> = new (...args: any[]) => T;

export const internals = Symbol("internals");
const privateInternals = Symbol("privateInternals");

export const FormAssociateMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class FormAssociate extends superClass {
    static formAssociated = true;

    [privateInternals]: ElementInternals | undefined;

    get [internals](): ElementInternals {
      if (!this[privateInternals]) {
        this[privateInternals] = this.attachInternals();
      }
      return this[privateInternals]!;
    }

    formAssociatedCallback() {}

    formResetCallback() {
      (this as any).checked = false;
      this[internals].setFormValue(null);
    }

    formDisabledCallback(disabled: boolean) {
      (this as any).disabled = disabled;
    }

    formStateRestoreCallback(_state: unknown, _mode: unknown) {}

    public checkValidity(): boolean {
      return this[internals].checkValidity();
    }

    public reportValidity(): boolean {
      return this[internals].reportValidity();
    }

    get willValidate() {
      return this[internals].willValidate;
    }

    public get validity(): ValidityState {
      return this[internals].validity;
    }

    public get validationMessage(): string {
      return this[internals].validationMessage;
    }
  }

  return FormAssociate;
};
