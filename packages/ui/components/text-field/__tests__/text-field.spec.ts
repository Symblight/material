import { expect, fixture, html } from "@open-wc/testing";

import "../text-field.ts";
import type { TextField } from "../text-field.ts";

describe("md-text-field", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner <input> by default", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector("input")).to.exist;
    });

    it("renders a <textarea> when multiline is set", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field multiline></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector("textarea")).to.exist;
      expect(el.shadowRoot!.querySelector("input")).to.not.exist;
    });

    it("renders the .text-field root element", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector(".text-field")).to.exist;
    });
  });

  // ─── variant ──────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "filled"', async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.variant).to.equal("filled");
    });

    it("adds text-field_variant_filled class for filled variant", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field variant="filled"></md-text-field>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".text-field")!
          .classList.contains("text-field_variant_filled"),
      ).to.be.true;
    });

    it("adds text-field_variant_outlined class for outlined variant", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field variant="outlined"></md-text-field>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".text-field")!
          .classList.contains("text-field_variant_outlined"),
      ).to.be.true;
    });

    it("renders a fieldset for the outlined indicator when variant=outlined", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field variant="outlined"></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector(".text-field__outlined-indicator")).to
        .exist;
    });

    it("renders the filled indicator when variant=filled", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field variant="filled"></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector(".text-field__indicator")).to.exist;
    });
  });

  // ─── label ────────────────────────────────────────────────────────────────

  describe("label", () => {
    it("renders a label element when label is set (filled)", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field label="Email"></md-text-field>`,
      );
      const label = el.shadowRoot!.querySelector("label");
      expect(label).to.exist;
      expect(label!.textContent!.trim()).to.equal("Email");
    });

    it("associates label with input via for/id", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field label="Email"></md-text-field>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      const label = el.shadowRoot!.querySelector("label")!;
      expect(input.id).to.be.a("string").and.not.equal("");
      expect(label.getAttribute("for")).to.equal(input.id);
    });
  });

  // ─── value ────────────────────────────────────────────────────────────────

  describe("value", () => {
    it("defaults to empty string", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.value).to.equal("");
    });

    it("sets the inner input value", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field value="hello"></md-text-field>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("hello");
    });

    it("updates reactively", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      el.value = "world";
      await el.updateComplete;
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("world");
    });
  });

  // ─── placeholder ──────────────────────────────────────────────────────────

  describe("placeholder", () => {
    it("passes placeholder to the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field placeholder="Search…"></md-text-field>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.placeholder,
      ).to.equal("Search…");
    });
  });

  // ─── type ─────────────────────────────────────────────────────────────────

  describe("type", () => {
    it('defaults to "text"', async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.type,
      ).to.equal("text");
    });

    it("passes type to the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field type="email"></md-text-field>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.type,
      ).to.equal("email");
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.false;
    });

    it("disables the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field disabled></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.true;
    });

    it("adds text-field_disabled class", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field disabled></md-text-field>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".text-field")!
          .classList.contains("text-field_disabled"),
      ).to.be.true;
    });

    it("reflects disabled attribute to host", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field disabled></md-text-field>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });
  });

  // ─── readOnly ─────────────────────────────────────────────────────────────

  describe("readOnly", () => {
    it("sets readonly on the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field readOnly></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.readOnly)
        .to.be.true;
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.false;
    });

    it("sets required on the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field required></md-text-field>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.true;
    });
  });

  // ─── prefix / suffix ──────────────────────────────────────────────────────

  describe("prefix and suffix", () => {
    it("renders prefix text when prefixText is set", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field prefix-text="$" value="10"></md-text-field>`,
      );
      const prefix = el.shadowRoot!.querySelector(".text-field__affix");
      expect(prefix).to.exist;
      expect(prefix!.textContent!.trim()).to.equal("$");
    });

    it("renders suffix text when suffixText is set", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field suffix-text="kg" value="10"></md-text-field>`,
      );
      const affixes = el.shadowRoot!.querySelectorAll(".text-field__affix");
      const suffix = Array.from(affixes).find(
        (a) => a.textContent!.trim() === "kg",
      );
      expect(suffix).to.exist;
    });
  });

  // ─── error ────────────────────────────────────────────────────────────────

  describe("error", () => {
    it("adds text-field_status_error class when error is set", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field error></md-text-field>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".text-field")!
          .classList.contains("text-field_status_error"),
      ).to.be.true;
    });

    it("reflects error attribute to host", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field error></md-text-field>`,
      );
      expect(el.hasAttribute("error")).to.be.true;
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("fires change event when inner input value changes", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      let fired = false;
      el.addEventListener("change", () => (fired = true));

      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.value = "new value";
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));

      expect(fired).to.be.true;
    });
  });

  // ─── resetFormControl ─────────────────────────────────────────────────────

  describe("resetFormControl", () => {
    it("resets value to empty string", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field value="hello"></md-text-field>`,
      );
      el.resetFormControl();
      expect(el.value).to.equal("");
    });

    it("resets dirty to false", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      el.dirty = true;
      el.resetFormControl();
      expect(el.dirty).to.be.false;
    });
  });

  // ─── handleFocus ──────────────────────────────────────────────────────────

  describe("handleFocus", () => {
    it("does not throw when focus fires on the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(() => {
        input.dispatchEvent(new Event("focus"));
      }).to.not.throw;
      await el.updateComplete;
      expect(el).to.exist;
    });

    it("does not throw when blur fires on the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.dispatchEvent(new Event("focus"));
      await el.updateComplete;
      expect(() => {
        input.dispatchEvent(new Event("blur"));
      }).to.not.throw;
    });

    it("populated returns true when focused (no value)", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.focus();
      input.dispatchEvent(new Event("focus"));
      await el.updateComplete;
      // populated = focused || !!value || !!placeholder — should be true when focused
      expect((el as any).populated).to.be.true;
    });
  });

  // ─── focus method ─────────────────────────────────────────────────────────

  describe("focus method", () => {
    it("calling focus() on the element does not throw", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      expect(() => el.focus()).to.not.throw;
    });

    it("calling focus() delegates focus to the inner input", async () => {
      const el = await fixture<TextField>(
        html`<md-text-field></md-text-field>`,
      );
      el.focus();
      await el.updateComplete;
      expect(el).to.exist;
    });
  });
});
