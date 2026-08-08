import { expect, fixture, html } from "@open-wc/testing";

import "../segmented-button.js";
import "../segmented-button-group.js";

/** @import { MdSegmentedButton } from "../segmented-button.js" */
/** @import { MdSegmentedButtonGroup } from "../segmented-button-group.js" */

// ─── md-segmented-button (standalone segment) ────────────────────────────────

describe("md-segmented-button", () => {
  describe("rendering", () => {
    it("renders an inner <button>", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      expect(el.shadowRoot.querySelector("button#segment")).to.exist;
    });

    it("renders slot content as the label", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      expect(el).to.have.text("Day");
    });
  });

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.disabled).to.be.false;
    });

    it("disables the inner button when disabled is set", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button disabled>Day</md-segmented-button>`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.disabled).to.be.true;
    });
  });

  describe("selected", () => {
    it("reflects the selected attribute to the host", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button selected>Day</md-segmented-button>`,
        )
      );
      expect(el.hasAttribute("selected")).to.be.true;
    });
  });

  describe("ARIA — single-select (default)", () => {
    it('sets role="radio" on the inner button', async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.getAttribute("role")).to.equal("radio");
    });

    it('sets aria-checked="false" when not selected', async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.getAttribute("aria-checked")).to.equal("false");
    });

    it('sets aria-checked="true" when selected', async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button selected>Day</md-segmented-button>`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.getAttribute("aria-checked")).to.equal("true");
    });

    it("does not set aria-pressed", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button selected>Day</md-segmented-button>`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.hasAttribute("aria-pressed")).to.be.false;
    });
  });

  describe("ARIA — multiselect", () => {
    it("does not set role=radio", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button multiselect>Bold</md-segmented-button>`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.hasAttribute("role")).to.be.false;
    });

    it('sets aria-pressed="false" when not selected', async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button multiselect>Bold</md-segmented-button>`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.getAttribute("aria-pressed")).to.equal("false");
    });

    it('sets aria-pressed="true" when selected', async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button multiselect selected
            >Bold</md-segmented-button
          >`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.getAttribute("aria-pressed")).to.equal("true");
    });

    it("does not set aria-checked", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button multiselect selected
            >Bold</md-segmented-button
          >`,
        )
      );
      const inner = el.shadowRoot.querySelector("button#segment");
      expect(inner.hasAttribute("aria-checked")).to.be.false;
    });
  });

  describe("checkmark swap on selection", () => {
    it("hides the checkmark and shows the icon slot when not selected", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`
          <md-segmented-button>
            <span slot="icon">icon</span>
            Music
          </md-segmented-button>
        `)
      );
      await el.updateComplete;

      const check = el.shadowRoot.querySelector(".segmented-button__check");
      const iconSlot = el.shadowRoot.querySelector(
        ".segmented-button__icon-slot",
      );
      expect(getComputedStyle(check).display).to.equal("none");
      expect(getComputedStyle(iconSlot).display).to.not.equal("none");
    });

    it("shows the checkmark and hides the icon slot when selected", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`
          <md-segmented-button selected>
            <span slot="icon">icon</span>
            Music
          </md-segmented-button>
        `)
      );
      await el.updateComplete;

      const check = el.shadowRoot.querySelector(".segmented-button__check");
      const iconSlot = el.shadowRoot.querySelector(
        ".segmented-button__icon-slot",
      );
      expect(getComputedStyle(check).display).to.not.equal("none");
      expect(getComputedStyle(iconSlot).display).to.equal("none");
    });
  });

  describe("segment-activate event", () => {
    it("dispatches a bubbling, composed segment-activate event with detail.segment on click", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      let detail;
      el.addEventListener("segment-activate", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });

      /** @type {HTMLButtonElement} */ (
        el.shadowRoot.querySelector("button#segment")
      ).click();

      expect(detail).to.exist;
      expect(detail.segment).to.equal(el);
    });

    it("does not dispatch segment-activate when disabled", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(
          html`<md-segmented-button disabled>Day</md-segmented-button>`,
        )
      );
      let fired = false;
      el.addEventListener("segment-activate", () => {
        fired = true;
      });

      el.click();
      expect(fired).to.be.false;
    });
  });

  describe("roving tabindex API", () => {
    it("getTabIndex/setTabIndex read and write the inner button's tabindex", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      el.setTabIndex(-1);
      expect(el.getTabIndex()).to.equal(-1);
      expect(
        el.shadowRoot.querySelector("button#segment").getAttribute("tabindex"),
      ).to.equal("-1");
    });

    it("focusInteractive focuses the inner button", async () => {
      const el = /** @type {MdSegmentedButton} */ (
        await fixture(html`<md-segmented-button>Day</md-segmented-button>`)
      );
      el.focusInteractive();
      expect(el.shadowRoot.activeElement).to.equal(
        el.shadowRoot.querySelector("button#segment"),
      );
    });
  });
});

// ─── md-segmented-button-group ───────────────────────────────────────────────

describe("md-segmented-button-group", () => {
  describe("rendering", () => {
    it("renders the element", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(
          html`<md-segmented-button-group></md-segmented-button-group>`,
        )
      );
      expect(el).to.exist;
    });

    it("distributes slotted md-segmented-button children", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      expect(el.querySelector("#a")).to.exist;
    });
  });

  describe("ARIA", () => {
    it('defaults to role="radiogroup" (single-select)', async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(
          html`<md-segmented-button-group></md-segmented-button-group>`,
        )
      );
      const wrapper = el.shadowRoot.querySelector(".segmented-button-group");
      expect(wrapper.getAttribute("role")).to.equal("radiogroup");
    });

    it('sets role="group" when multiselect', async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(
          html`<md-segmented-button-group
            multiselect
          ></md-segmented-button-group>`,
        )
      );
      const wrapper = el.shadowRoot.querySelector(".segmented-button-group");
      expect(wrapper.getAttribute("role")).to.equal("group");
    });

    it("sets aria-label from the label property", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(
          html`<md-segmented-button-group
            label="View density"
          ></md-segmented-button-group>`,
        )
      );
      const wrapper = el.shadowRoot.querySelector(".segmented-button-group");
      expect(wrapper.getAttribute("aria-label")).to.equal("View density");
    });
  });

  describe("single-select mutual exclusivity", () => {
    it("selects the segment matching the initial value", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group value="b">
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));
      expect(a.selected).to.be.false;
      expect(b.selected).to.be.true;
    });

    it("clicking a segment selects it and deselects the previously selected one", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group value="a">
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
            <md-segmented-button id="c" value="c">C</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));
      const c = /** @type {MdSegmentedButton} */ (el.querySelector("#c"));

      b.shadowRoot.querySelector("button#segment").click();
      await el.updateComplete;

      expect(a.selected).to.be.false;
      expect(b.selected).to.be.true;
      expect(c.selected).to.be.false;
      expect(el.value).to.equal("b");
    });

    it("clicking the already-selected segment is a no-op (no change event)", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group value="a">
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      a.shadowRoot.querySelector("button#segment").click();

      expect(fired).to.be.false;
    });
  });

  describe("multi-select independent toggles", () => {
    it("toggles a segment on independently of the others", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group multiselect>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      a.shadowRoot.querySelector("button#segment").click();
      await el.updateComplete;

      expect(a.selected).to.be.true;
      expect(b.selected).to.be.false;
      expect(el.values).to.deep.equal(["a"]);
    });

    it("selecting a second segment leaves the first selected", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group multiselect .values=${["a"]}>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      b.shadowRoot.querySelector("button#segment").click();
      await el.updateComplete;

      expect(a.selected).to.be.true;
      expect(b.selected).to.be.true;
      expect(el.values).to.have.members(["a", "b"]);
    });

    it("clicking a selected segment again toggles it off", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group multiselect .values=${["a"]}>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      a.shadowRoot.querySelector("button#segment").click();
      await el.updateComplete;

      expect(a.selected).to.be.false;
      expect(el.values).to.deep.equal([]);
    });
  });

  describe("change event detail shape", () => {
    it("single-select: detail is { value }", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group value="a">
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      let detail;
      el.addEventListener("change", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });

      el.querySelector("#b").shadowRoot.querySelector("button#segment").click();

      expect(detail).to.deep.equal({ value: "b" });
    });

    it("multi-select: detail is { values }", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group multiselect>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      let detail;
      el.addEventListener("change", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });

      el.querySelector("#a").shadowRoot.querySelector("button#segment").click();

      expect(detail).to.deep.equal({ values: ["a"] });
    });
  });

  describe("roving tabindex", () => {
    it("sets tabindex=0 on the first segment after slot population", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));
      expect(a.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("ArrowRight moves the roving tabstop to the next segment", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      a.shadowRoot.querySelector("button#segment").focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await el.updateComplete;

      expect(a.getTabIndex()).to.equal(-1);
      expect(b.getTabIndex()).to.equal(0);
    });

    it("ArrowRight wraps from the last segment to the first", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      b.shadowRoot.querySelector("button#segment").focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await el.updateComplete;

      expect(a.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("ArrowLeft moves the roving tabstop to the previous segment", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      b.shadowRoot.querySelector("button#segment").focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await el.updateComplete;

      expect(a.getTabIndex()).to.equal(0);
      expect(b.getTabIndex()).to.equal(-1);
    });

    it("ArrowDown behaves like ArrowRight", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));

      a.shadowRoot.querySelector("button#segment").focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      expect(b.getTabIndex()).to.equal(0);
      expect(a.getTabIndex()).to.equal(-1);
    });

    it("skips a disabled segment during ArrowRight navigation", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b" disabled
              >B</md-segmented-button
            >
            <md-segmented-button id="c" value="c">C</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const c = /** @type {MdSegmentedButton} */ (el.querySelector("#c"));

      a.shadowRoot.querySelector("button#segment").focus();
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await el.updateComplete;

      expect(c.getTabIndex()).to.equal(0);
      expect(a.getTabIndex()).to.equal(-1);
    });

    it("ArrowRight prevents default scroll behaviour", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });
  });

  describe("disabled cascading", () => {
    it("cascades disabled=true to every segment", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group disabled>
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b">B</md-segmented-button>
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const a = /** @type {MdSegmentedButton} */ (el.querySelector("#a"));
      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));
      expect(a.disabled).to.be.true;
      expect(b.disabled).to.be.true;
    });

    it("a disabled segment does not fire a group change event when clicked", async () => {
      const el = /** @type {MdSegmentedButtonGroup} */ (
        await fixture(html`
          <md-segmented-button-group value="a">
            <md-segmented-button id="a" value="a">A</md-segmented-button>
            <md-segmented-button id="b" value="b" disabled
              >B</md-segmented-button
            >
          </md-segmented-button-group>
        `)
      );
      await el.updateComplete;

      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      const b = /** @type {MdSegmentedButton} */ (el.querySelector("#b"));
      b.click();

      expect(fired).to.be.false;
    });
  });
});
