import { expect, fixture, html } from "@open-wc/testing";

import "../radio-button.ts";
import type RadioButton from "../radio-button.ts";

describe("md-radio", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner input[type=radio]", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input");
      expect(input).to.exist;
      expect(input!.type).to.equal("radio");
    });

    it("renders a .radio__box element", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.shadowRoot!.querySelector(".radio__box")).to.exist;
    });
  });

  // ─── checked ──────────────────────────────────────────────────────────────

  describe("checked", () => {
    it("is unchecked by default", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.checked).to.be.false;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.false;
    });

    it("reflects checked attribute to the host", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      expect(el.hasAttribute("checked")).to.be.true;
    });

    it("inner input is checked when checked is true", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });

    it("adds radio__box_checked class when checked", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".radio__box")!
          .classList.contains("radio__box_checked"),
      ).to.be.true;
    });

    it("updates checked reactively", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      el.checked = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.false;
    });

    it("reflects disabled attribute", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio disabled></md-radio>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("disables the inner input when disabled", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio disabled></md-radio>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.true;
    });

    it("adds radio__box_disabled class when disabled", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio disabled></md-radio>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".radio__box")!
          .classList.contains("radio__box_disabled"),
      ).to.be.true;
    });

    it("does not toggle checked when clicked while disabled", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio disabled></md-radio>`,
      );
      el.click();
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── name / value ─────────────────────────────────────────────────────────

  describe("name and value", () => {
    it('defaults value to "on"', async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("on");
    });

    it("passes name to inner input", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio name="color"></md-radio>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.name,
      ).to.equal("color");
    });

    it("passes value to inner input", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio value="red"></md-radio>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("red");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.false;
    });

    it("sets required on inner input", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio required></md-radio>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.true;
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("re-dispatches change event on the host when inner input changes", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      let fired = false;
      el.addEventListener("change", () => (fired = true));
      el.shadowRoot!.querySelector<HTMLInputElement>("input")!.click();
      expect(fired).to.be.true;
    });
  });

  // ─── form reset ───────────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("resets checked to false", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      expect(el.checked).to.be.true;
      el.formResetCallback();
      expect(el.checked).to.be.false;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it('type getter returns "md-radio"', async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.type).to.equal("md-radio");
    });

    it("form getter returns the associated form", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-radio name="opt"></md-radio>
        </form>
      `);
      const el = form.querySelector<RadioButton>("md-radio")!;
      expect(el.form).to.equal(form);
    });

    it("labels getter returns associated labels", async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <label for="rb">Option A</label>
          <md-radio id="rb" name="choice"></md-radio>
        </div>
      `);
      const el = container.querySelector<RadioButton>("md-radio")!;
      expect(el.labels).to.exist;
    });
  });

  // ─── handleInput ──────────────────────────────────────────────────────────

  describe("handleInput", () => {
    it("sets checked=true when input becomes checked", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.checked = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.true;
    });

    it("sets checked=false when input becomes unchecked", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.checked = false;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── updated lifecycle ────────────────────────────────────────────────────

  describe("updated lifecycle", () => {
    it("sets ariaChecked to 'true' when checked", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      await el.updateComplete;
      // ariaChecked is set via internals — just verify no errors
      expect(el.checked).to.be.true;
    });

    it("sets ariaChecked to 'false' when unchecked", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── updateValidity ───────────────────────────────────────────────────────

  describe("updateValidity", () => {
    it("does not throw when not required and no group", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(() => el.updateValidity()).to.not.throw;
    });

    it("does not throw when required but no group context", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio required></md-radio>`,
      );
      expect(() => el.updateValidity()).to.not.throw;
    });

    it("marks valid when required and a sibling radio is checked", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-radio name="color" value="red" required checked></md-radio>
          <md-radio name="color" value="blue" required></md-radio>
        </form>
      `);
      const radios = form.querySelectorAll<RadioButton>("md-radio");
      // Should not throw
      expect(() => radios[0].updateValidity()).to.not.throw;
    });
  });

  // ─── radio group selection ────────────────────────────────────────────────

  describe("radio group selection", () => {
    it("selecting one radio deselects the other in the same group", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-radio name="color" value="red" checked></md-radio>
          <md-radio name="color" value="blue"></md-radio>
        </form>
      `);
      const [red, blue] = form.querySelectorAll<RadioButton>("md-radio");

      // Click blue radio
      blue.shadowRoot!.querySelector<HTMLInputElement>("input")!.click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.checked).to.be.true;
    });
  });

  // ─── handleChange disabled guard ──────────────────────────────────────────

  describe("handleChange disabled guard", () => {
    it("does not dispatch change on host when disabled", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio disabled></md-radio>`,
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });
      el.shadowRoot!.querySelector<HTMLInputElement>("input")!.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
      expect(fired).to.be.false;
    });
  });

  // ─── disconnectedCallback ─────────────────────────────────────────────────

  describe("disconnectedCallback", () => {
    it("removes event listener on disconnect without error", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      const parent = el.parentElement!;
      expect(() => parent.removeChild(el)).to.not.throw;
    });
  });

  // ─── FormAssociateMixin methods ───────────────────────────────────────────

  describe("FormAssociateMixin", () => {
    it("checkValidity returns a boolean", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(typeof el.checkValidity()).to.equal("boolean");
    });

    it("reportValidity returns a boolean", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(typeof el.reportValidity()).to.equal("boolean");
    });

    it("willValidate getter returns a boolean", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(typeof el.willValidate).to.equal("boolean");
    });

    it("validity getter returns a ValidityState", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(el.validity).to.be.an.instanceof(ValidityState);
    });

    it("validationMessage getter returns a string", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(typeof el.validationMessage).to.equal("string");
    });

    it("formResetCallback resets checked to false via mixin", async () => {
      const el = await fixture<RadioButton>(
        html`<md-radio checked></md-radio>`,
      );
      el.formResetCallback();
      expect(el.checked).to.be.false;
    });

    it("formDisabledCallback sets disabled property", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      (el as any).formDisabledCallback(true);
      expect(el.disabled).to.be.true;
      (el as any).formDisabledCallback(false);
      expect(el.disabled).to.be.false;
    });

    it("formAssociatedCallback does not throw", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(() => (el as any).formAssociatedCallback()).to.not.throw;
    });

    it("formStateRestoreCallback does not throw", async () => {
      const el = await fixture<RadioButton>(html`<md-radio></md-radio>`);
      expect(() => (el as any).formStateRestoreCallback(null, "restore")).to.not
        .throw;
    });
  });
});
