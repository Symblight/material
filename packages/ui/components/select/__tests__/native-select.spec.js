import { expect, fixture, html } from "@open-wc/testing";

import "../native-select.js";
/** @import { MdNativeSelect } from "../native-select.js" */

describe("md-native-select", () => {
  // ─── rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an md-text-field", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      expect(el.shadowRoot.querySelector("md-text-field")).to.exist;
    });

    it("renders a real, interactive <select> inside md-text-field", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      const select = /** @type {HTMLSelectElement} */ (
        tf.querySelector("select")
      );
      expect(select).to.exist;
      expect(select.classList.contains("select__native-control_hidden")).to.be
        .false;
      expect(select.hasAttribute("aria-hidden")).to.be.false;
    });

    it("does not render a trigger button or an md-menu popover", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      const tf = el.shadowRoot.querySelector("md-text-field");
      expect(tf.querySelector("#select-trigger")).to.not.exist;
      expect(el.shadowRoot.querySelector("md-menu")).to.not.exist;
    });
  });

  // ─── reparenting real <option>/<optgroup> children ──────────────────────

  describe("reparenting", () => {
    it("moves real light-DOM <option> children into the shadow <select>, leaving none in the light DOM", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;

      const select = el.select;
      expect(select.options.length).to.equal(2);
      expect(select.options[0].value).to.equal("a");
      expect(select.options[1].value).to.equal("b");

      // The real nodes moved — they're no longer light-DOM children of the
      // host at all (this is what makes them "real" options: not slotted,
      // not cloned, just relocated).
      expect(el.children.length).to.equal(0);
    });

    it("moves a whole <optgroup> (with its nested <option>s) as one unit", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <optgroup label="Fruits">
              <option value="apple">Apple</option>
              <option value="pear">Pear</option>
            </optgroup>
          </md-native-select>
        `)
      );
      await el.updateComplete;

      const select = el.select;
      const optgroup = select.querySelector("optgroup");
      expect(optgroup).to.exist;
      expect(optgroup.label).to.equal("Fruits");
      expect(select.options.length).to.equal(2);
    });

    it("reparents an <option> appended after first render (mutation)", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      expect(el.select.options.length).to.equal(1);

      const newOption = document.createElement("option");
      newOption.value = "b";
      newOption.textContent = "Beta";
      el.appendChild(newOption);

      // MutationController's callback runs asynchronously off a microtask.
      await new Promise((r) => setTimeout(r, 30));

      expect(el.select.options.length).to.equal(2);
      expect(el.select.options[1].value).to.equal("b");
      expect(el.children.length).to.equal(0);
    });
  });

  // ─── value ────────────────────────────────────────────────────────────────

  describe("value", () => {
    it("adopts the real <select>'s own default-selection (first option) when no value/selected is given", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      expect(el.value).to.equal("a");
    });

    it("adopts the value of the <option selected> the consumer authored", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
            <option value="b" selected>Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      expect(el.value).to.equal("b");
      expect(el.select.value).to.equal("b");
    });

    it("applies a value attribute authored before options existed to the real <select> once they do", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select value="b">
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      expect(el.value).to.equal("b");
      expect(el.select.value).to.equal("b");
    });

    it("setValue() updates the value property and the real <select>", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      el.setValue("b");
      expect(el.value).to.equal("b");
      expect(el.select.value).to.equal("b");
    });
  });

  // ─── change/input events ───────────────────────────────────────────────────

  describe("change event", () => {
    it("dispatches change/input when the real <select> changes", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;

      let changed = false;
      let inputFired = false;
      el.addEventListener("change", () => (changed = true));
      el.addEventListener("input", () => (inputFired = true));

      el.select.value = "b";
      el.select.dispatchEvent(new Event("change", { bubbles: true }));

      expect(changed).to.be.true;
      expect(inputFired).to.be.true;
      expect(el.value).to.equal("b");
    });
  });

  // ─── disabled / required / label / name / variant ─────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      expect(el.disabled).to.be.false;
    });

    it("passes disabled to the real <select>", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select disabled></md-native-select>`)
      );
      expect(el.select.disabled).to.be.true;
    });
  });

  describe("required", () => {
    it("passes required to the real <select>", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select required></md-native-select>`)
      );
      expect(el.select.required).to.be.true;
    });
  });

  describe("label", () => {
    it("passes label to the inner md-text-field", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(
          html`<md-native-select label="Sort by"></md-native-select>`,
        )
      );
      await el.updateComplete;
      const tf = /** @type {any} */ (
        el.shadowRoot.querySelector("md-text-field")
      );
      expect(tf.label).to.equal("Sort by");
    });
  });

  describe("name", () => {
    it("passes name to the real <select>", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select name="sort"></md-native-select>`)
      );
      expect(el.select.name).to.equal("sort");
    });
  });

  describe("variant", () => {
    it('defaults to "filled"', async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      expect(el.variant).to.equal("filled");
    });
  });

  // ─── multiple / size ────────────────────────────────────────────────────────

  describe("multiple / size", () => {
    it("is single-select (multiple=false) by default", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`<md-native-select></md-native-select>`)
      );
      expect(el.multiple).to.be.false;
    });

    it("passes multiple and size to the real <select>", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(
          html`<md-native-select multiple size="4"></md-native-select>`,
        )
      );
      expect(el.select.multiple).to.be.true;
      expect(el.select.size).to.equal(4);
    });

    it("submits every selected option's value via FormData under the same name", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-native-select name="roles" multiple>
              <option value="tutor" selected>Tutor</option>
              <option value="student" selected>Student</option>
              <option value="classroom">Classroom</option>
            </md-native-select>
          </form>
        `)
      );
      const el = /** @type {MdNativeSelect} */ (
        form.querySelector("md-native-select")
      );
      await el.updateComplete;

      const formData = new FormData(form);
      expect(formData.getAll("roles")).to.deep.equal(["tutor", "student"]);
    });
  });

  // ─── formResetCallback ────────────────────────────────────────────────────

  describe("formResetCallback", () => {
    it("restores each option's .selected to its authored .defaultSelected", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select>
            <option value="a" selected>Alpha</option>
            <option value="b">Beta</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;
      expect(el.value).to.equal("a");

      el.setValue("b");
      expect(el.value).to.equal("b");

      el.formResetCallback();
      expect(el.value).to.equal("a");
      expect(el.select.options[0].selected).to.be.true;
      expect(el.select.options[1].selected).to.be.false;
    });

    it("resets multi-select selections without throwing", async () => {
      const el = /** @type {MdNativeSelect} */ (
        await fixture(html`
          <md-native-select multiple>
            <option value="a" selected>A</option>
            <option value="b">B</option>
          </md-native-select>
        `)
      );
      await el.updateComplete;

      el.select.options[1].selected = true;
      el.formResetCallback();
      await el.updateComplete;

      expect(el.select.options[0].selected).to.be.true;
      expect(el.select.options[1].selected).to.be.false;
    });
  });

  // ─── form association ─────────────────────────────────────────────────────

  describe("form association", () => {
    it("form getter returns the associated form", async () => {
      const form = /** @type {HTMLFormElement} */ (
        await fixture(html`
          <form>
            <md-native-select name="color"></md-native-select>
          </form>
        `)
      );
      const el = /** @type {MdNativeSelect} */ (
        form.querySelector("md-native-select")
      );
      expect(el.form).to.equal(form);
    });
  });
});
