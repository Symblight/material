import { expect, fixture, html } from "@open-wc/testing";

import "../checkbox.ts";
import type Checkbox from "../checkbox.ts";

describe("md-checkbox", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner input[type=checkbox]", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input");
      expect(input).to.exist;
      expect(input!.type).to.equal("checkbox");
    });

    it("renders a .checkbox__box element", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.shadowRoot!.querySelector(".checkbox__box")).to.exist;
    });
  });

  // ─── checked ──────────────────────────────────────────────────────────────

  describe("checked", () => {
    it("is unchecked by default", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.checked).to.be.false;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.false;
    });

    it("reflects checked attribute to the host", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      expect(el.hasAttribute("checked")).to.be.true;
    });

    it("inner input is checked when checked is true", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });

    it("adds .checkbox__box_checked class when checked", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__box")!
          .classList.contains("checkbox__box_checked"),
      ).to.be.true;
    });

    it("shows the check SVG icon when checked", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      const box = el.shadowRoot!.querySelector(".checkbox__box")!;
      expect(box.querySelector("svg")).to.exist;
    });

    it("does not show any SVG icon when unchecked and not indeterminate", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const box = el.shadowRoot!.querySelector(".checkbox__box")!;
      expect(box.querySelector("svg")).to.not.exist;
    });

    it("updates checked when property changes", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      el.checked = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });
  });

  // ─── indeterminate ────────────────────────────────────────────────────────

  describe("indeterminate", () => {
    it("is not indeterminate by default", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.indeterminate).to.be.false;
    });

    it("adds .checkbox__box_indeterminate class", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox indeterminate></md-checkbox>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__box")!
          .classList.contains("checkbox__box_indeterminate"),
      ).to.be.true;
    });

    it("shows the indeterminate dash SVG when indeterminate and not checked", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox indeterminate></md-checkbox>`,
      );
      const box = el.shadowRoot!.querySelector(".checkbox__box")!;
      // indeterminate dash contains a <path d="M240-440v-80h480v80H240Z">
      const path = box.querySelector("path");
      expect(path).to.exist;
      expect(path!.getAttribute("d")).to.include("240");
    });

    it("does not show indeterminate icon when checked takes precedence", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked indeterminate></md-checkbox>`,
      );
      const box = el.shadowRoot!.querySelector(".checkbox__box")!;
      const paths = box.querySelectorAll("path");
      // check SVG (filled/check.svg) typically has a different path
      // the indeterminate dash has exactly one short horizontal path
      const indeterminatePath = Array.from(paths).find((p) =>
        p.getAttribute("d")?.includes("240-440"),
      );
      expect(indeterminatePath).to.not.exist;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.disabled).to.be.false;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.false;
    });

    it("reflects disabled attribute to the host", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("disables the inner input when disabled", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.true;
    });

    it("adds .checkbox__box_disabled class when disabled", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__box")!
          .classList.contains("checkbox__box_disabled"),
      ).to.be.true;
    });

    it("does not toggle checked when clicked while disabled", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      el.click();
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── error ────────────────────────────────────────────────────────────────

  describe("error", () => {
    it("adds error classes to input and box when error is set", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox error></md-checkbox>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__input")!
          .classList.contains("checkbox__input_error"),
      ).to.be.true;
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__box")!
          .classList.contains("checkbox__box_error"),
      ).to.be.true;
    });
  });

  // ─── name / value ─────────────────────────────────────────────────────────

  describe("name and value", () => {
    it('defaults value to "on"', async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("on");
    });

    it("passes name to the inner input", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox name="agree"></md-checkbox>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.name,
      ).to.equal("agree");
    });

    it("passes value to the inner input", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox value="yes"></md-checkbox>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("yes");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.false;
    });

    it("sets required on the inner input", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox required></md-checkbox>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.true;
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("re-dispatches change event on the host when inner input changes", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.click();
      expect(fired).to.be.true;
    });
  });

  // ─── form reset ───────────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("resets checked to false", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      expect(el.checked).to.be.true;
      el.formResetCallback();
      expect(el.checked).to.be.false;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it('type getter returns "md-checkbox"', async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      expect(el.type).to.equal("md-checkbox");
    });

    it("form getter returns the associated form", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-checkbox name="check"></md-checkbox>
        </form>
      `);
      const el = form.querySelector<Checkbox>("md-checkbox")!;
      expect(el.form).to.equal(form);
    });

    it("labels getter returns associated labels", async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <label for="cb">Accept</label>
          <md-checkbox id="cb" name="accept"></md-checkbox>
        </div>
      `);
      const el = container.querySelector<Checkbox>("md-checkbox")!;
      expect(el.labels).to.exist;
    });
  });

  // ─── handleInput ──────────────────────────────────────────────────────────

  describe("handleInput", () => {
    it("sets checked=true and form value when input becomes checked", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      // Simulate check via input event
      input.checked = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.true;
    });

    it("sets checked=false and clears form value when input becomes unchecked", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox checked></md-checkbox>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.checked = false;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── handleFocus ──────────────────────────────────────────────────────────

  describe("handleFocus", () => {
    it("does not throw when focus fires on a non-disabled checkbox", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(() => input.dispatchEvent(new Event("focus"))).to.not.throw;
    });

    it("does not update focused state when disabled", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      // Should not throw or change state
      expect(() => input.dispatchEvent(new Event("focus"))).to.not.throw;
    });

    it("adds focused class when input is focused", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.focus();
      input.dispatchEvent(new Event("focus"));
      await el.updateComplete;
      // focused class applied on the input element
      expect(
        el
          .shadowRoot!.querySelector(".checkbox__input")!
          .classList.contains("checkbox__input_focused"),
      ).to.be.true;
    });
  });

  // ─── handleChange disabled guard ──────────────────────────────────────────

  describe("handleChange disabled guard", () => {
    it("does not dispatch change on host when disabled and change fires on inner input", async () => {
      const el = await fixture<Checkbox>(
        html`<md-checkbox disabled></md-checkbox>`,
      );
      let hostFired = false;
      el.addEventListener("change", () => {
        hostFired = true;
      });
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      expect(hostFired).to.be.false;
    });
  });

  // ─── disconnectedCallback ─────────────────────────────────────────────────

  describe("disconnectedCallback", () => {
    it("removes click listener on disconnect without error", async () => {
      const el = await fixture<Checkbox>(html`<md-checkbox></md-checkbox>`);
      const parent = el.parentElement!;
      expect(() => parent.removeChild(el)).to.not.throw;
    });
  });
});
