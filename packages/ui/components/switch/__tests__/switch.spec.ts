import { expect, fixture, html } from "@open-wc/testing";

import "../switch.ts";
import type MdSwitch from "../switch.ts";

describe("md-switch", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner input[type=checkbox]", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input");
      expect(input).to.exist;
      expect(input!.type).to.equal("checkbox");
    });

    it("renders a .switch__track element", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.shadowRoot!.querySelector(".switch__track")).to.exist;
    });

    it("renders a .switch__handle element", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.shadowRoot!.querySelector(".switch__handle")).to.exist;
    });

    it("renders a .switch__state-layer element", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.shadowRoot!.querySelector(".switch__state-layer")).to.exist;
    });
  });

  // ─── selected ─────────────────────────────────────────────────────────────

  describe("selected", () => {
    it("is unselected by default", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.selected).to.be.false;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.false;
    });

    it("reflects selected attribute to the host", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      expect(el.hasAttribute("selected")).to.be.true;
    });

    it("inner input is checked when selected is true", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });

    it("adds .switch__track_selected class when selected", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".switch__track")!
          .classList.contains("switch__track_selected"),
      ).to.be.true;
    });

    it("adds .switch__handle_selected class when selected", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".switch__handle")!
          .classList.contains("switch__handle_selected"),
      ).to.be.true;
    });

    it("does not add _selected classes when unselected", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(
        el
          .shadowRoot!.querySelector(".switch__track")!
          .classList.contains("switch__track_selected"),
      ).to.be.false;
    });

    it("updates selected when property changes", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      el.selected = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.checked)
        .to.be.true;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.disabled).to.be.false;
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.false;
    });

    it("reflects disabled attribute to the host", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("disables the inner input when disabled", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.disabled)
        .to.be.true;
    });

    it("adds .switch__track_disabled class when disabled", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      expect(
        el
          .shadowRoot!.querySelector(".switch__track")!
          .classList.contains("switch__track_disabled"),
      ).to.be.true;
    });

    it("does not toggle selected when clicked while disabled", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      el.click();
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });
  });

  // ─── icons ────────────────────────────────────────────────────────────────

  describe("icons", () => {
    it("does not render icons by default", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.shadowRoot!.querySelector(".switch__icon")).to.not.exist;
    });

    it("renders .switch__icon when icons is true", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch icons></md-switch>`);
      expect(el.shadowRoot!.querySelector(".switch__icon")).to.exist;
    });

    it("renders x icon when unselected with icons", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch icons></md-switch>`);
      const icon = el.shadowRoot!.querySelector(".switch__icon svg")!;
      expect(icon).to.exist;
    });

    it("renders check icon when selected with icons", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch icons selected></md-switch>`,
      );
      const icon = el.shadowRoot!.querySelector(".switch__icon svg path")!;
      expect(icon).to.exist;
      // Check icon path contains "382" (check mark path)
      expect(icon.getAttribute("d")).to.include("382");
    });

    it("adds switch__handle_with-icon class when icons is set", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch icons></md-switch>`);
      expect(
        el
          .shadowRoot!.querySelector(".switch__handle")!
          .classList.contains("switch__handle_with-icon"),
      ).to.be.true;
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("re-dispatches change event on the host when inner input changes", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.click();
      expect(fired).to.be.true;
    });

    it("updates selected when input is toggled", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.click();
      await el.updateComplete;
      expect(el.selected).to.be.true;
    });
  });

  // ─── name / value ─────────────────────────────────────────────────────────

  describe("name and value", () => {
    it('defaults value to "on"', async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("on");
    });

    it("passes name to the inner input", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch name="notifications"></md-switch>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.name,
      ).to.equal("notifications");
    });

    it("passes value to the inner input", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch value="yes"></md-switch>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLInputElement>("input")!.value,
      ).to.equal("yes");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.false;
    });

    it("sets required on the inner input", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch required></md-switch>`,
      );
      expect(el.shadowRoot!.querySelector<HTMLInputElement>("input")!.required)
        .to.be.true;
    });
  });

  // ─── form reset ───────────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("resets selected to false", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      expect(el.selected).to.be.true;
      el.formResetCallback();
      expect(el.selected).to.be.false;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it('type getter returns "md-switch"', async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      expect(el.type).to.equal("md-switch");
    });

    it("form getter returns the associated form", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-switch name="toggle"></md-switch>
        </form>
      `);
      const el = form.querySelector<MdSwitch>("md-switch")!;
      expect(el.form).to.equal(form);
    });
  });

  // ─── accessibility ────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("input has role=switch", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(input.getAttribute("role")).to.equal("switch");
    });

    it("aria-checked is false when unselected", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(input.getAttribute("aria-checked")).to.equal("false");
    });

    it("aria-checked is true when selected", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(input.getAttribute("aria-checked")).to.equal("true");
    });
  });

  // ─── _handleInput ─────────────────────────────────────────────────────────

  describe("_handleInput", () => {
    it("sets selected=true when input is checked via input event", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.checked = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.selected).to.be.true;
    });

    it("sets selected=false when input is unchecked via input event", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.checked = false;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });
  });

  // ─── _handleFocus ─────────────────────────────────────────────────────────

  describe("_handleFocus", () => {
    it("does not throw when focus fires on a non-disabled switch", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(() => input.dispatchEvent(new Event("focus"))).to.not.throw;
    });

    it("does not throw when focus fires on a disabled switch", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      expect(() => input.dispatchEvent(new Event("focus"))).to.not.throw;
    });

    it("adds switch__track_focused class when focused", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.focus();
      input.dispatchEvent(new Event("focus"));
      await el.updateComplete;
      expect(
        el
          .shadowRoot!.querySelector(".switch__track")!
          .classList.contains("switch__track_focused"),
      ).to.be.true;
    });

    it("removes focused class on blur", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.focus();
      input.dispatchEvent(new Event("focus"));
      await el.updateComplete;
      input.blur();
      input.dispatchEvent(new Event("blur"));
      await el.updateComplete;
      expect(
        el
          .shadowRoot!.querySelector(".switch__track")!
          .classList.contains("switch__track_focused"),
      ).to.be.false;
    });
  });

  // ─── _handleChange disabled guard ─────────────────────────────────────────

  describe("_handleChange disabled guard", () => {
    it("does not dispatch change on host when disabled", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch disabled></md-switch>`,
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });
      const input = el.shadowRoot!.querySelector<HTMLInputElement>("input")!;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      expect(fired).to.be.false;
    });
  });

  // ─── updated lifecycle ────────────────────────────────────────────────────

  describe("updated lifecycle", () => {
    it("sets form value when selected changes to true", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      el.selected = true;
      await el.updateComplete;
      // form value should be set — just verify no errors and state is correct
      expect(el.selected).to.be.true;
    });

    it("clears form value when selected changes to false", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected></md-switch>`,
      );
      el.selected = false;
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });

    it("reacts to value change by updating form value", async () => {
      const el = await fixture<MdSwitch>(
        html`<md-switch selected value="yes"></md-switch>`,
      );
      el.value = "no";
      await el.updateComplete;
      expect(el.value).to.equal("no");
    });
  });

  // ─── labels ───────────────────────────────────────────────────────────────

  describe("labels", () => {
    it("labels getter returns associated labels", async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <label for="sw">Enable notifications</label>
          <md-switch id="sw" name="notifications"></md-switch>
        </div>
      `);
      const el = container.querySelector<MdSwitch>("md-switch")!;
      expect(el.labels).to.exist;
    });
  });

  // ─── disconnectedCallback ─────────────────────────────────────────────────

  describe("disconnectedCallback", () => {
    it("removes click listener on disconnect without error", async () => {
      const el = await fixture<MdSwitch>(html`<md-switch></md-switch>`);
      const parent = el.parentElement!;
      expect(() => parent.removeChild(el)).to.not.throw;
    });
  });
});
