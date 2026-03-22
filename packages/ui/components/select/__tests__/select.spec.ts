import { expect, fixture, html } from "@open-wc/testing";

import "../select.ts";
import type Select from "../select.ts";

describe("md-select", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an md-text-field", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      expect(el.shadowRoot!.querySelector("md-text-field")).to.exist;
    });

    it("renders a native <select> inside md-text-field", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      expect(tf.querySelector("select")).to.exist;
    });

    it("native select has class select__native-control", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const select = tf.querySelector("select")!;
      expect(select.classList.contains("select__native-control")).to.be.true;
    });
  });

  // ─── options ──────────────────────────────────────────────────────────────

  describe("options from md-option", () => {
    it("renders slotted md-option elements as native <option> elements", async () => {
      const el = await fixture<Select>(html`
        <md-select>
          <md-option value="a">Alpha</md-option>
          <md-option value="b">Beta</md-option>
        </md-select>
      `);
      await el.updateComplete;

      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const nativeSelect = tf.querySelector<HTMLSelectElement>("select")!;
      // updateSlottedOptions triggers on slotchange — allow microtask to settle
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const options = nativeSelect.querySelectorAll("option");
      expect(options.length).to.equal(2);
    });

    it("passes value from md-option to native option", async () => {
      const el = await fixture<Select>(html`
        <md-select>
          <md-option value="red">Red</md-option>
        </md-select>
      `);
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const option = tf.querySelector<HTMLOptionElement>("option");
      expect(option).to.exist;
      expect(option!.value).to.equal("red");
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      expect(el.disabled).to.be.false;
    });

    it("reflects disabled attribute to host", async () => {
      const el = await fixture<Select>(html`<md-select disabled></md-select>`);
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("passes disabled to the native select", async () => {
      const el = await fixture<Select>(html`<md-select disabled></md-select>`);
      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const nativeSelect = tf.querySelector<HTMLSelectElement>("select")!;
      expect(nativeSelect.disabled).to.be.true;
    });
  });

  // ─── variant ──────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "filled"', async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      expect(el.variant).to.equal("filled");
    });

    it("passes variant to the inner md-text-field", async () => {
      const el = await fixture<Select>(
        html`<md-select variant="outlined"></md-select>`,
      );
      await el.updateComplete;
      const tf = el.shadowRoot!.querySelector<any>("md-text-field")!;
      expect(tf.variant).to.equal("outlined");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      expect(el.required).to.be.false;
    });

    it("passes required to the native select", async () => {
      const el = await fixture<Select>(html`<md-select required></md-select>`);
      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const nativeSelect = tf.querySelector<HTMLSelectElement>("select")!;
      expect(nativeSelect.required).to.be.true;
    });
  });

  // ─── setValue ─────────────────────────────────────────────────────────────

  describe("setValue", () => {
    it("updates the value property", async () => {
      const el = await fixture<Select>(html`<md-select></md-select>`);
      el.setValue("foo");
      expect(el.value).to.equal("foo");
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("dispatches a change event when native select changes", async () => {
      const el = await fixture<Select>(html`
        <md-select>
          <md-option value="a">A</md-option>
          <md-option value="b">B</md-option>
        </md-select>
      `);
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      let fired = false;
      el.addEventListener("change", () => (fired = true));

      const tf = el.shadowRoot!.querySelector("md-text-field")!;
      const nativeSelect = tf.querySelector<HTMLSelectElement>("select")!;
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(fired).to.be.true;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it("form getter returns the associated form", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-select name="color"></md-select>
        </form>
      `);
      const el = form.querySelector<Select>("md-select")!;
      expect(el.form).to.equal(form);
    });
  });
});
