import { expect, fixture, html } from "@open-wc/testing";

import "../select.js";
/** @import Select from "../select.js" */

describe("md-select", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an md-text-field", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      expect(el.shadowRoot.querySelector("md-text-field")).to.exist;
    });

    it("renders a native <select> inside md-text-field", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      expect(tf.querySelector("select")).to.exist;
    });

    it("native select has class select__native-control", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      const select = tf.querySelector("select");
      expect(select.classList.contains("select__native-control")).to.be.true;
    });
  });

  // ─── options ──────────────────────────────────────────────────────────────

  describe("options from md-option", () => {
    it("renders slotted md-option elements as native <option> elements", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b">Beta</md-option>
          </md-select>
        `)
      );
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      // updateSlottedOptions triggers on slotchange — allow microtask to settle
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const options = nativeSelect.querySelectorAll("option");
      expect(options.length).to.equal(2);
    });

    it("passes value from md-option to native option", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="red">Red</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const option = /** @type {HTMLOptionElement} */ (
        tf.querySelector("option")
      );
      expect(option).to.exist;
      expect(option.value).to.equal("red");
    });
  });

  describe("md-option label mirroring", () => {
    it("excludes leading/trailing slot content from the mirrored native option label", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">
              <md-icon slot="leading">icon</md-icon>
              Alpha
              <span slot="trailing">⌘A</span>
            </md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const option = /** @type {HTMLOptionElement} */ (
        tf.querySelector("option")
      );
      expect(option.textContent.trim()).to.equal("Alpha");
    });
  });

  describe("menu mode (default)", () => {
    it("renders a trigger button instead of an interactive native select", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const trigger = tf.querySelector("#select-trigger");
      expect(trigger).to.exist;
      expect(trigger.tagName).to.equal("BUTTON");

      const nativeSelect = tf.querySelector("select");
      expect(nativeSelect.classList.contains("select__native-control_hidden"))
        .to.be.true;
      expect(nativeSelect.getAttribute("aria-hidden")).to.equal("true");
      expect(nativeSelect.getAttribute("tabindex")).to.equal("-1");
    });

    it("highlights the text-field when the popover opens", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      expect(tf.focused).to.be.false;

      const trigger = tf.querySelector("#select-trigger");
      trigger.click();
      await new Promise((r) => setTimeout(r, 30));
      expect(tf.focused).to.be.true;
    });

    it("renders an md-menu, forwarding md-option children into it", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b" selected>Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const menu = el.shadowRoot.querySelector("md-menu");
      expect(menu).to.exist;
      // Anchored to the whole md-text-field, not the inner trigger button —
      // the button excludes the field's own padding/leading area, so
      // anchoring to it misaligned the popover from the field's visible box.
      expect(menu.getAttribute("for")).to.equal("select-field");

      const items = el.querySelectorAll("md-option");
      expect(items.length).to.equal(2);
      expect(items[1].hasAttribute("selected")).to.be.true;
    });

    it("shows the selected item's label on the trigger button", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b" selected>Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      expect(trigger.textContent.trim()).to.equal("Beta");
    });

    it("sets combobox/listbox ARIA on the trigger button", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      expect(trigger.getAttribute("role")).to.equal("combobox");
      expect(trigger.getAttribute("aria-haspopup")).to.equal("listbox");
      expect(trigger.getAttribute("aria-controls")).to.equal("select-listbox");
      expect(trigger.getAttribute("aria-expanded")).to.equal("false");
    });

    it("aria-expanded on the trigger tracks the popover open state", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      trigger.click();
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;

      expect(trigger.getAttribute("aria-expanded")).to.equal("true");
    });

    it("renders menu-mode md-option rows with role=option and aria-selected reflecting the current value", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b" selected>Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const menu = el.shadowRoot.querySelector("md-menu");
      expect(menu.getAttribute("menu-role")).to.equal("listbox");

      const options = /** @type {import("../option.js").MdOption[]} */ (
        Array.from(el.querySelectorAll("md-option"))
      );
      await Promise.all(options.map((o) => o.updateComplete));

      for (const option of options) {
        const interactive = option.shadowRoot.querySelector(
          ".md-menu-item__interactive",
        );
        expect(interactive.getAttribute("role")).to.equal("option");
      }

      const selected = options.find((o) => o.value === "b");
      const selectedInteractive = selected.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(selectedInteractive.getAttribute("aria-selected")).to.equal(
        "true",
      );
    });

    it("ArrowDown on the closed trigger opens the menu and focuses the selected item", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b" selected>Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      const menu = /** @type {import("../../menu/menu.js").MdMenu} */ (
        el.shadowRoot.querySelector("md-menu")
      );

      trigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;

      expect(menu.open).to.be.true;
      const betaItem = Array.from(el.querySelectorAll("md-option")).find(
        (item) => item.value === "b",
      );
      expect(betaItem.getTabIndex()).to.equal(0);
    });

    it("Home on the closed trigger opens the menu and focuses the first item", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b" selected>Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      const menu = /** @type {import("../../menu/menu.js").MdMenu} */ (
        el.shadowRoot.querySelector("md-menu")
      );

      trigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;

      expect(menu.open).to.be.true;
      const alphaItem = Array.from(el.querySelectorAll("md-option")).find(
        (item) => item.value === "a",
      );
      expect(alphaItem.getTabIndex()).to.equal(0);
    });

    it("End on the closed trigger opens the menu and focuses the last item", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">Alpha</md-option>
            <md-option value="b">Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const trigger = el.shadowRoot
        .querySelector("md-text-field")
        .querySelector("#select-trigger");
      const menu = /** @type {import("../../menu/menu.js").MdMenu} */ (
        el.shadowRoot.querySelector("md-menu")
      );

      trigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;

      expect(menu.open).to.be.true;
      const betaItem = Array.from(el.querySelectorAll("md-option")).find(
        (item) => item.value === "b",
      );
      expect(betaItem.getTabIndex()).to.equal(0);
    });

    it("selecting an option updates the value and syncs the hidden native select", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select name="role">
            <md-option value="a">Alpha</md-option>
            <md-option value="b">Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      let changed = false;
      el.addEventListener("change", () => {
        changed = true;
      });

      const betaItem = /** @type {import("../option.js").MdOption} */ (
        Array.from(el.querySelectorAll("md-option")).find(
          (item) => item.value === "b",
        )
      );
      await betaItem.updateComplete;
      betaItem.shadowRoot.querySelector(".md-menu-item__interactive").click();
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;

      expect(el.value).to.equal("b");
      expect(changed).to.be.true;
      expect(el.select.value).to.equal("b");
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      expect(el.disabled).to.be.false;
    });

    it("reflects disabled attribute to host", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select disabled></md-select>`)
      );
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("passes disabled to the native select", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select disabled></md-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      expect(nativeSelect.disabled).to.be.true;
    });
  });

  // ─── variant ──────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "filled"', async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      expect(el.variant).to.equal("filled");
    });

    it("passes variant to the inner md-text-field", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select variant="outlined"></md-select>`)
      );
      await el.updateComplete;
      const tf = /** @type {any} */ (
        el.shadowRoot.querySelector("md-text-field")
      );
      expect(tf.variant).to.equal("outlined");
    });
  });

  // ─── required ─────────────────────────────────────────────────────────────

  describe("required", () => {
    it("is not required by default", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      expect(el.required).to.be.false;
    });

    it("passes required to the native select", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select required></md-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      expect(nativeSelect.required).to.be.true;
    });
  });

  // ─── setValue ─────────────────────────────────────────────────────────────

  describe("setValue", () => {
    it("updates the value property", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      el.setValue("foo");
      expect(el.value).to.equal("foo");
    });
  });

  // ─── change event ─────────────────────────────────────────────────────────

  describe("change event", () => {
    it("dispatches a change event when native select changes", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">A</md-option>
            <md-option value="b">B</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      let fired = false;
      el.addEventListener("change", () => (fired = true));

      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(fired).to.be.true;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it("form getter returns the associated form", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-select name="color"></md-select>
          </form>
        `)
      );
      const el = /** @type {Select} */ (form.querySelector("md-select"));
      expect(el.form).to.equal(form);
    });
  });

  // ─── label ────────────────────────────────────────────────────────────────

  describe("label", () => {
    it('defaults to ""', async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select></md-select>`)
      );
      expect(el.label).to.equal("");
    });

    it("passes label to the inner md-text-field", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select label="Choose color"></md-select>`)
      );
      await el.updateComplete;
      const tf = /** @type {any} */ (
        el.shadowRoot.querySelector("md-text-field")
      );
      expect(tf.label).to.equal("Choose color");
    });
  });

  // ─── name ─────────────────────────────────────────────────────────────────

  describe("name", () => {
    it("passes name to the native select", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`<md-select name="size"></md-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      expect(nativeSelect.name).to.equal("size");
    });
  });

  // ─── formResetCallback ────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("resets value to the first option value", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="alpha">Alpha</md-option>
            <md-option value="beta">Beta</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      el.setValue("beta");
      expect(el.value).to.equal("beta");

      el.formResetCallback();
      expect(el.value).to.equal("alpha");
    });
  });

  // ─── handleChange dispatches both events ──────────────────────────────────

  describe("handleChange dispatches input event", () => {
    it("dispatches an input event when native select changes", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">A</md-option>
            <md-option value="b">B</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      let inputFired = false;
      el.addEventListener("input", () => (inputFired = true));

      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(inputFired).to.be.true;
    });
  });

  // ─── optgroup rendering ───────────────────────────────────────────────────

  describe("optgroup options", () => {
    it("renders native optgroup when md-option-group is slotted", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option-group label="Fruits">
              <md-option value="apple">Apple</md-option>
            </md-option-group>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      const optgroup = nativeSelect.querySelector("optgroup");
      expect(optgroup).to.exist;
    });

    it("renders native hr when md-hr is slotted", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">A</md-option>
            <md-hr></md-hr>
            <md-option value="b">B</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      const tf = el.shadowRoot.querySelector("md-text-field");
      const nativeSelect = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      const hr = nativeSelect.querySelector("hr");
      expect(hr).to.exist;
    });
  });

  // ─── selected option as reset value ───────────────────────────────────────

  describe("firstOptionValue from selected md-option", () => {
    it("uses the pre-selected option as the reset value", async () => {
      const el = /** @type {Select} */ (
        await fixture(html`
          <md-select>
            <md-option value="a">A</md-option>
            <md-option value="b" selected>B</md-option>
          </md-select>
        `)
      );
      await new Promise((r) => setTimeout(r, 0));
      await el.updateComplete;

      // The first selected option should be used as the reset anchor
      expect(el.firstOptionValue).to.equal("b");
    });
  });
});
