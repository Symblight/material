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
  });
});
