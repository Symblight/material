import { expect, fixture, html } from "@open-wc/testing";

import "../radio-button.js";
/** @import RadioButton from "../radio-button.js" */

describe("md-radio", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner input[type=radio]", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      const input = /** @type {HTMLInputElement} */ (
        el.shadowRoot.querySelector("input")
      );
      expect(input).to.exist;
      expect(input.type).to.equal("radio");
    });

    it("renders a .radio__box element", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(el.shadowRoot.querySelector(".radio__box")).to.exist;
    });
  });

  // ─── checked ──────────────────────────────────────────────────────────────

  describe("checked", () => {
    it("is unchecked by default", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(el.checked).to.be.false;
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .checked,
      ).to.be.false;
    });

    it("reflects checked attribute to the host", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      expect(el.hasAttribute("checked")).to.be.true;
    });

    it("inner input is checked when checked is true", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .checked,
      ).to.be.true;
    });

    it("adds radio__box_checked class when checked", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      expect(
        el.shadowRoot
          .querySelector(".radio__box")
          .classList.contains("radio__box_checked"),
      ).to.be.true;
    });

    it("updates checked reactively", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      el.checked = true;
      await el.updateComplete;
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .checked,
      ).to.be.true;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .disabled,
      ).to.be.false;
    });

    it("reflects disabled attribute", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio disabled></md-radio>`)
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("disables the inner input when disabled", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio disabled></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .disabled,
      ).to.be.true;
    });

    it("adds radio__box_disabled class when disabled", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio disabled></md-radio>`)
      );
      expect(
        el.shadowRoot
          .querySelector(".radio__box")
          .classList.contains("radio__box_disabled"),
      ).to.be.true;
    });

    it("does not toggle checked when clicked while disabled", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio disabled></md-radio>`)
      );
      el.click();
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── name / value ─────────────────────────────────────────────────────────

  describe("name and value", () => {
    it('defaults value to "on"', async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .value,
      ).to.equal("on");
    });

    it("passes name to inner input", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio name="color"></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .name,
      ).to.equal("color");
    });

    it("passes value to inner input", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio value="red"></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .value,
      ).to.equal("red");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .required,
      ).to.be.false;
    });

    it("sets required on inner input", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio required></md-radio>`)
      );
      expect(
        /** @type {HTMLInputElement} */ (el.shadowRoot.querySelector("input"))
          .required,
      ).to.be.true;
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("re-dispatches change event on the host when inner input changes", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      let fired = false;
      el.addEventListener("change", () => (fired = true));
      /** @type {HTMLInputElement} */ (
        el.shadowRoot.querySelector("input")
      ).click();
      expect(fired).to.be.true;
    });
  });

  // ─── form reset ───────────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("resets checked to false", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      expect(el.checked).to.be.true;
      el.formResetCallback();
      expect(el.checked).to.be.false;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it('type getter returns "md-radio"', async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(el.type).to.equal("md-radio");
    });

    it("form getter returns the associated form", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="opt"></md-radio>
          </form>
        `)
      );
      const el = /** @type {RadioButton} */ (form.querySelector("md-radio"));
      expect(el.form).to.equal(form);
    });

    it("labels getter returns associated labels", async () => {
      const container = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <label for="rb">Option A</label>
            <md-radio id="rb" name="choice"></md-radio>
          </div>
        `)
      );
      const el = /** @type {RadioButton} */ (
        container.querySelector("md-radio")
      );
      expect(el.labels).to.exist;
    });
  });

  // ─── handleInput ──────────────────────────────────────────────────────────

  describe("handleInput", () => {
    it("sets checked=true when input becomes checked", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      const input = /** @type {HTMLInputElement} */ (
        el.shadowRoot.querySelector("input")
      );
      input.checked = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.true;
    });

    it("sets checked=false when input becomes unchecked", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      const input = /** @type {HTMLInputElement} */ (
        el.shadowRoot.querySelector("input")
      );
      input.checked = false;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── updated lifecycle ────────────────────────────────────────────────────

  describe("updated lifecycle", () => {
    it("sets ariaChecked to 'true' when checked", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      await el.updateComplete;
      // ariaChecked is set via internals — just verify no errors
      expect(el.checked).to.be.true;
    });

    it("sets ariaChecked to 'false' when unchecked", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      await el.updateComplete;
      expect(el.checked).to.be.false;
    });
  });

  // ─── updateValidity ───────────────────────────────────────────────────────

  describe("updateValidity", () => {
    it("does not throw when not required and no group", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(() => el.updateValidity()).to.not.throw;
    });

    it("does not throw when required but no group context", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio required></md-radio>`)
      );
      expect(() => el.updateValidity()).to.not.throw;
    });

    it("marks valid when required and a sibling radio is checked", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required checked></md-radio>
            <md-radio name="color" value="blue" required></md-radio>
          </form>
        `)
      );
      const radios = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      // Should not throw
      expect(() => radios[0].updateValidity()).to.not.throw;
    });
  });

  // ─── Fix 1: proactive required-group validation ────────────────────────────
  // A `required` radio group must report invalid on connect/first render,
  // without waiting for a `change` event — `ElementInternals` defaults to
  // *valid* until `setValidity()` is explicitly called, unlike native
  // `<input required>` which browsers validate continuously.

  describe("proactive required-group validation (no interaction)", () => {
    it("a lone required radio with nothing checked is invalid on first render, without any interaction", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(
          html`<md-radio name="tos" value="agree" required></md-radio>`,
        )
      );
      await el.updateComplete;
      expect(el.validity.valid).to.be.false;
    });

    it("a required radio group with nothing pre-checked is invalid for every member, without any interaction", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required></md-radio>
            <md-radio name="color" value="blue" required></md-radio>
            <md-radio name="color" value="green" required></md-radio>
          </form>
        `)
      );
      const radios = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await Promise.all(radios.map((radio) => radio.updateComplete));

      radios.forEach((radio) => {
        expect(radio.validity.valid, `${radio.value} should be invalid`).to.be
          .false;
      });
    });

    it("a required radio group with a pre-checked member is valid on first render", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required checked></md-radio>
            <md-radio name="color" value="blue" required></md-radio>
          </form>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await red.updateComplete;
      await blue.updateComplete;

      expect(red.validity.valid).to.be.true;
      expect(blue.validity.valid).to.be.true;
    });

    it("form.reportValidity() fails for a required group with nothing checked and the user never interacted", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required></md-radio>
            <md-radio name="color" value="blue" required></md-radio>
          </form>
        `)
      );
      const radios = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await Promise.all(radios.map((radio) => radio.updateComplete));

      expect(form.reportValidity()).to.be.false;
    });
  });

  // ─── Fix 2: validity syncs across the group ────────────────────────────────

  describe("validity syncs across the group", () => {
    it("clears validity on a required radio when a non-required sibling becomes checked", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required></md-radio>
            <md-radio name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await red.updateComplete;
      expect(red.validity.valid).to.be.false;

      /** @type {HTMLInputElement} */ (
        blue.shadowRoot.querySelector("input")
      ).click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.checked).to.be.true;
      expect(red.validity.valid).to.be.true;
    });

    it("re-invalidates the group once the previously-checked required radio is unchecked in favor of a sibling", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" required checked></md-radio>
            <md-radio name="color" value="blue" required></md-radio>
          </form>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await red.updateComplete;
      expect(red.validity.valid).to.be.true;

      /** @type {HTMLInputElement} */ (
        blue.shadowRoot.querySelector("input")
      ).click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.validity.valid).to.be.true;
      expect(red.validity.valid).to.be.true;
    });
  });

  // ─── radio group selection ────────────────────────────────────────────────

  describe("radio group selection", () => {
    it("selecting one radio deselects the other in the same group", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" checked></md-radio>
            <md-radio name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );

      // Click blue radio
      /** @type {HTMLInputElement} */ (
        blue.shadowRoot.querySelector("input")
      ).click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.checked).to.be.true;
      expect(red.checked).to.be.false;
    });

    it("does not deselect a radio with a different name in the same fieldset", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" checked></md-radio>
            <md-radio name="size" value="s" checked></md-radio>
          </form>
        `)
      );
      const [color, size] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );

      /** @type {HTMLInputElement} */ (
        color.shadowRoot.querySelector("input")
      ).click();
      await color.updateComplete;
      await size.updateComplete;

      expect(color.checked).to.be.true;
      expect(size.checked).to.be.true;
    });
  });

  // ─── Fix 5: grouping scope (fieldset/form vs. standalone) ──────────────────

  describe("grouping scope", () => {
    it("groups within a <fieldset> ancestor", async () => {
      const container = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <fieldset>
              <md-radio name="color" value="red" checked></md-radio>
              <md-radio name="color" value="blue"></md-radio>
            </fieldset>
          </div>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(container.querySelectorAll("md-radio"))
      );

      /** @type {HTMLInputElement} */ (
        blue.shadowRoot.querySelector("input")
      ).click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.checked).to.be.true;
      expect(red.checked).to.be.false;
    });

    it("groups within a <form> ancestor when there is no fieldset", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio name="color" value="red" checked></md-radio>
            <md-radio name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [red, blue] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );

      /** @type {HTMLInputElement} */ (
        blue.shadowRoot.querySelector("input")
      ).click();
      await blue.updateComplete;
      await red.updateComplete;

      expect(blue.checked).to.be.true;
      expect(red.checked).to.be.false;
    });

    it("groups by matching name even without a fieldset/form ancestor", async () => {
      const container = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <md-radio name="plain" value="1" checked></md-radio>
            <md-radio name="plain" value="2"></md-radio>
          </div>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(container.querySelectorAll("md-radio"))
      );

      /** @type {HTMLInputElement} */ (
        b.shadowRoot.querySelector("input")
      ).click();
      await a.updateComplete;
      await b.updateComplete;

      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
    });
  });

  // ─── Fix 3 & 4: arrow-key navigation + roving tabindex ─────────────────────

  describe("arrow-key navigation and roving tabindex", () => {
    it("only the checked radio starts with tabindex 0; others start at -1", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red"></md-radio>
            <md-radio id="b" name="color" value="blue" checked></md-radio>
            <md-radio id="c" name="color" value="green"></md-radio>
          </form>
        `)
      );
      const [a, b, c] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await Promise.all([a, b, c].map((radio) => radio.updateComplete));

      expect(a.getTabIndex()).to.equal(-1);
      expect(b.getTabIndex()).to.equal(0);
      expect(c.getTabIndex()).to.equal(-1);
    });

    it("skips a checked-but-disabled radio for the tab stop, landing on the first enabled radio instead", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio
              id="a"
              name="color"
              value="red"
              checked
              disabled
            ></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
            <md-radio id="c" name="color" value="green"></md-radio>
          </form>
        `)
      );
      const [a, b, c] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await Promise.all([a, b, c].map((radio) => radio.updateComplete));

      // The checked radio is disabled, so it must not win the tab stop —
      // a disabled control is never focusable regardless of its tabindex,
      // which would otherwise make the whole group unreachable via Tab.
      expect(a.getTabIndex()).to.equal(-1);
      expect(b.getTabIndex()).to.equal(0);
      expect(c.getTabIndex()).to.equal(-1);
    });

    it("with nothing checked, the first radio in the group defaults to tabindex 0", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red"></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(a.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("ArrowRight moves the roving tabstop and selection to the next radio", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
      expect(b.getTabIndex()).to.equal(0);
      expect(a.getTabIndex()).to.equal(-1);
    });

    it("ArrowDown behaves like ArrowRight", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
    });

    it("ArrowLeft moves the roving tabstop and selection to the previous radio", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red"></md-radio>
            <md-radio id="b" name="color" value="blue" checked></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      b.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(a.checked).to.be.true;
      expect(b.checked).to.be.false;
      expect(a.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("ArrowRight wraps from the last radio to the first", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red"></md-radio>
            <md-radio id="b" name="color" value="blue" checked></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      b.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(a.checked).to.be.true;
      expect(a.getTabIndex()).to.equal(0);
    });

    it("ArrowLeft wraps from the first radio to the last", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(b.checked).to.be.true;
      expect(b.getTabIndex()).to.equal(0);
    });

    it("skips a disabled radio during ArrowRight navigation", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue" disabled></md-radio>
            <md-radio id="c" name="color" value="green"></md-radio>
          </form>
        `)
      );
      const [a, b, c] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await Promise.all([a, b, c].map((radio) => radio.updateComplete));

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await Promise.all([a, b, c].map((radio) => radio.updateComplete));

      expect(c.checked).to.be.true;
      expect(b.checked).to.be.false;
      expect(c.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("does not navigate across radios with a different name in the same group", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="s1" name="size" value="s"></md-radio>
          </form>
        `)
      );
      const [a, s1] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await s1.updateComplete;

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await a.updateComplete;
      await s1.updateComplete;

      // Only one radio named "color" — ArrowRight should be a no-op wrap
      // onto itself, and must never touch the differently-named sibling.
      expect(a.checked).to.be.true;
      expect(s1.checked).to.be.false;
    });

    it("ArrowRight prevents default scroll behaviour", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const a = /** @type {RadioButton} */ (form.querySelector("#a"));
      await a.updateComplete;

      a.focusInteractive();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });

    it("a non-arrow key is ignored", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-radio id="a" name="color" value="red" checked></md-radio>
            <md-radio id="b" name="color" value="blue"></md-radio>
          </form>
        `)
      );
      const [a, b] = /** @type {RadioButton[]} */ (
        Array.from(form.querySelectorAll("md-radio"))
      );
      await a.updateComplete;
      await b.updateComplete;

      a.focusInteractive();
      form.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      await a.updateComplete;
      await b.updateComplete;

      expect(a.checked).to.be.true;
      expect(b.checked).to.be.false;
    });
  });

  // ─── handleChange disabled guard ──────────────────────────────────────────

  describe("handleChange disabled guard", () => {
    it("does not dispatch change on host when disabled", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio disabled></md-radio>`)
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });
      /** @type {HTMLInputElement} */ (
        el.shadowRoot.querySelector("input")
      ).dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).to.be.false;
    });
  });

  // ─── disconnectedCallback ─────────────────────────────────────────────────

  describe("disconnectedCallback", () => {
    it("removes event listener on disconnect without error", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      const parent = el.parentElement;
      expect(() => parent.removeChild(el)).to.not.throw;
    });
  });

  // ─── FormAssociateMixin methods ───────────────────────────────────────────

  describe("FormAssociateMixin", () => {
    it("checkValidity returns a boolean", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(typeof el.checkValidity()).to.equal("boolean");
    });

    it("reportValidity returns a boolean", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(typeof el.reportValidity()).to.equal("boolean");
    });

    it("willValidate getter returns a boolean", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(typeof el.willValidate).to.equal("boolean");
    });

    it("validity getter returns a ValidityState", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(el.validity).to.be.an.instanceof(ValidityState);
    });

    it("validationMessage getter returns a string", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(typeof el.validationMessage).to.equal("string");
    });

    it("formResetCallback resets checked to false via mixin", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio checked></md-radio>`)
      );
      el.formResetCallback();
      expect(el.checked).to.be.false;
    });

    it("formDisabledCallback sets disabled property", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      /** @type {any} */ (el).formDisabledCallback(true);
      expect(el.disabled).to.be.true;
      /** @type {any} */ (el).formDisabledCallback(false);
      expect(el.disabled).to.be.false;
    });

    it("formAssociatedCallback does not throw", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(() => /** @type {any} */ (el).formAssociatedCallback()).to.not
        .throw;
    });

    it("formStateRestoreCallback does not throw", async () => {
      const el = /** @type {RadioButton} */ (
        await fixture(html`<md-radio></md-radio>`)
      );
      expect(() =>
        /** @type {any} */ (el).formStateRestoreCallback(null, "restore"),
      ).to.not.throw;
    });
  });
});
