import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";

/** @import { MdMenu } from "../menu.js" */
/** @import { MdMenuItem } from "../menu-item.js" */

/** @param {number} [ms] */
const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

describe("md-menu", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el).to.exist;
    });

    it("is itself the popover=auto surface", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.getAttribute("popover")).to.equal("auto");
    });

    it("renders a role=menu container inside md-card", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      const list = el.shadowRoot.querySelector('[role="menu"]');
      expect(list).to.exist;
      expect(el.shadowRoot.querySelector("md-card")).to.exist;
    });

    it("defaults: placement=bottom-start, offset=4, flip=true, variant=standard, trigger=click", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.placement).to.equal("bottom-start");
      expect(el.offset).to.equal(4);
      expect(el.flip).to.be.true;
      expect(el.variant).to.equal("standard");
      expect(el.trigger).to.equal("click");
    });

    it('defaults menuRole="menu" and focusOnOpen="first"', async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.menuRole).to.equal("menu");
      expect(el.focusOnOpen).to.equal("first");
    });

    it('menu-role="listbox" renders role=listbox instead of role=menu', async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu menu-role="listbox"></md-menu>`)
      );
      expect(el.shadowRoot.querySelector('[role="listbox"]')).to.exist;
      expect(el.shadowRoot.querySelector('[role="menu"]')).to.not.exist;
    });

    it("reflects menuRole onto the host's own role attribute, not just the inner list", async () => {
      // aria-controls/similar id-based references (e.g. md-select's trigger
      // button) resolve against the HOST's accessible role — a role set only
      // on an inner shadow-DOM div doesn't propagate up to it.
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.getAttribute("role")).to.equal("menu");

      el.menuRole = "listbox";
      await el.updateComplete;
      expect(el.getAttribute("role")).to.equal("listbox");
    });
  });

  // ─── Segments (md-item-group) ───────────────────────────────────────────

  describe("segments", () => {
    it("renders a single .md-menu__card segment with no md-item-group present", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`
          <md-menu>
            <md-menu-item value="a">A</md-menu-item>
            <md-menu-item value="b">B</md-menu-item>
          </md-menu>
        `)
      );
      expect(el.shadowRoot.querySelectorAll(".md-menu__card").length).to.equal(
        1,
      );
    });

    it("renders one .md-menu__card segment per top-level md-item-group", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`
          <md-menu>
            <md-item-group>
              <md-menu-item value="a">A</md-menu-item>
              <md-menu-item value="b">B</md-menu-item>
            </md-item-group>
            <md-item-group>
              <md-menu-item value="c">C</md-menu-item>
            </md-item-group>
          </md-menu>
        `)
      );
      expect(el.shadowRoot.querySelectorAll(".md-menu__card").length).to.equal(
        2,
      );
      // Roving tabindex/typeahead still flatten through the groups.
      expect(el._enabledMenuItems.map((item) => item.value)).to.deep.equal([
        "a",
        "b",
        "c",
      ]);
    });
  });

  // ─── Opens / closes via trigger ─────────────────────────────────────────

  describe("opens/closes via trigger", () => {
    it("clicking the for-anchored trigger opens the menu", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger">Open</button>
            <md-menu for="trigger">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger")
      );
      await menu.updateComplete;

      trigger.click();
      await tick();

      expect(menu.open).to.be.true;
      expect(menu.matches(":popover-open")).to.be.true;
    });

    it("clicking the trigger again closes an open menu", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger2">Open</button>
            <md-menu for="trigger2">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger2")
      );
      await menu.updateComplete;

      trigger.click();
      await tick();
      expect(menu.open).to.be.true;

      menu.close();
      await tick();
      expect(menu.open).to.be.false;
      expect(menu.matches(":popover-open")).to.be.false;
    });

    it("sets aria-haspopup and aria-expanded on the resolved trigger", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger3">Open</button>
            <md-menu for="trigger3">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger3")
      );
      await menu.updateComplete;

      expect(trigger.getAttribute("aria-haspopup")).to.equal("menu");
      expect(trigger.getAttribute("aria-expanded")).to.equal("false");

      trigger.click();
      await tick();
      expect(trigger.getAttribute("aria-expanded")).to.equal("true");
    });
  });

  // ─── select event ────────────────────────────────────────────────────────

  describe("select event", () => {
    it("fires select with the correct value when an item is activated", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger4">Open</button>
            <md-menu for="trigger4">
              <md-menu-item value="alpha">Alpha</md-menu-item>
              <md-menu-item value="beta">Beta</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger4")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const items = /** @type {MdMenuItem[]} */ (
        Array.from(el.querySelectorAll("md-menu-item"))
      );
      await Promise.all(items.map((i) => i.updateComplete));

      let received;
      menu.addEventListener("select", (/** @type {CustomEvent} */ e) => {
        received = e.detail;
      });

      const betaButton = items[1].shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      betaButton.click();
      await tick();

      expect(received).to.exist;
      expect(received.value).to.equal("beta");
      expect(received.item).to.equal(items[1]);
    });

    it("closes the menu after selecting an item without keep-open", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger5">Open</button>
            <md-menu for="trigger5">
              <md-menu-item value="only">Only</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger5")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const item = /** @type {MdMenuItem} */ (el.querySelector("md-menu-item"));
      await item.updateComplete;
      item.shadowRoot.querySelector(".md-menu-item__interactive").click();
      await tick();

      expect(menu.open).to.be.false;
    });

    it("does not close the menu when the selected item has keep-open", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger6">Open</button>
            <md-menu for="trigger6">
              <md-menu-item value="only" keep-open>Only</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger6")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const item = /** @type {MdMenuItem} */ (el.querySelector("md-menu-item"));
      await item.updateComplete;
      item.shadowRoot.querySelector(".md-menu-item__interactive").click();
      await tick();

      expect(menu.open).to.be.true;
    });
  });

  // ─── Disabled items ──────────────────────────────────────────────────────

  describe("disabled items", () => {
    it("a disabled item does not dispatch select on click", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger7">Open</button>
            <md-menu for="trigger7">
              <md-menu-item value="off" disabled>Off</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger7")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const item = /** @type {MdMenuItem} */ (el.querySelector("md-menu-item"));
      await item.updateComplete;

      let fired = false;
      menu.addEventListener("select", () => {
        fired = true;
      });

      const button = /** @type {HTMLButtonElement} */ (
        item.shadowRoot.querySelector(".md-menu-item__interactive")
      );
      expect(button.disabled).to.be.true;
      button.click();
      await tick();

      expect(fired).to.be.false;
    });

    it("disabled items are excluded from roving tabindex / keyboard nav", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger8">Open</button>
            <md-menu for="trigger8">
              <md-menu-item id="i1" value="one">One</md-menu-item>
              <md-menu-item id="i2" value="two" disabled>Two</md-menu-item>
              <md-menu-item id="i3" value="three">Three</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger8")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const i1 = /** @type {MdMenuItem} */ (el.querySelector("#i1"));
      const i2 = /** @type {MdMenuItem} */ (el.querySelector("#i2"));
      const i3 = /** @type {MdMenuItem} */ (el.querySelector("#i3"));
      await Promise.all([i1, i2, i3].map((i) => i.updateComplete));

      expect(i1.getTabIndex()).to.equal(0);

      const btn1 = i1.shadowRoot.querySelector(".md-menu-item__interactive");
      btn1.focus();

      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await menu.updateComplete;

      // Disabled item (i2) is skipped — focus/tabindex moves directly to i3.
      expect(i3.getTabIndex()).to.equal(0);
      expect(i2.getTabIndex()).to.equal(-1);
      expect(i1.getTabIndex()).to.equal(-1);
    });
  });

  // ─── Escape ──────────────────────────────────────────────────────────────

  describe("Escape", () => {
    it("closes the menu and returns focus to the trigger", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger9">Open</button>
            <md-menu for="trigger9">
              <md-menu-item id="onlyitem" value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger9")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();
      expect(menu.open).to.be.true;

      const item = /** @type {MdMenuItem} */ (el.querySelector("#onlyitem"));
      await item.updateComplete;
      const btn = item.shadowRoot.querySelector(".md-menu-item__interactive");
      btn.focus();

      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      await tick();

      expect(menu.open).to.be.false;
      expect(el.shadowRoot ?? document.activeElement).to.exist;
      expect(document.activeElement).to.equal(trigger);
    });
  });

  // ─── Roving tabindex ─────────────────────────────────────────────────────

  describe("roving tabindex", () => {
    it("ArrowDown moves the tabstop to the next item", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger10">Open</button>
            <md-menu for="trigger10">
              <md-menu-item id="a" value="a">A</md-menu-item>
              <md-menu-item id="b" value="b">B</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger10")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const a = /** @type {MdMenuItem} */ (el.querySelector("#a"));
      const b = /** @type {MdMenuItem} */ (el.querySelector("#b"));
      await Promise.all([a, b].map((i) => i.updateComplete));

      a.shadowRoot.querySelector(".md-menu-item__interactive").focus();

      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await menu.updateComplete;

      expect(b.getTabIndex()).to.equal(0);
      expect(a.getTabIndex()).to.equal(-1);
    });

    it("ArrowUp moves the tabstop to the previous item and wraps", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger11">Open</button>
            <md-menu for="trigger11">
              <md-menu-item id="c" value="c">C</md-menu-item>
              <md-menu-item id="d" value="d">D</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger11")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const c = /** @type {MdMenuItem} */ (el.querySelector("#c"));
      const d = /** @type {MdMenuItem} */ (el.querySelector("#d"));
      await Promise.all([c, d].map((i) => i.updateComplete));

      c.shadowRoot.querySelector(".md-menu-item__interactive").focus();

      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      await menu.updateComplete;

      // Wraps from the first item to the last.
      expect(d.getTabIndex()).to.equal(0);
      expect(c.getTabIndex()).to.equal(-1);
    });
  });

  // ─── focusSelectedItem / focusLastItem / focus-on-open ──────────────────

  describe("focusSelectedItem / focusLastItem", () => {
    it("focusSelectedItem() focuses the item marked selected", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger13">Open</button>
            <md-menu for="trigger13">
              <md-menu-item id="e" value="e">E</md-menu-item>
              <md-menu-item id="f" value="f" selected>F</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.updateComplete;
      await menu.show();
      menu.focusSelectedItem();

      const f = /** @type {MdMenuItem} */ (el.querySelector("#f"));
      expect(f.getTabIndex()).to.equal(0);
    });

    it("focusSelectedItem() falls back to the first item when none is selected", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger14">Open</button>
            <md-menu for="trigger14">
              <md-menu-item id="g" value="g">G</md-menu-item>
              <md-menu-item id="h" value="h">H</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.updateComplete;
      await menu.show();
      menu.focusSelectedItem();

      const g = /** @type {MdMenuItem} */ (el.querySelector("#g"));
      expect(g.getTabIndex()).to.equal(0);
    });

    it("focusLastItem() sets tabindex=0 on the last item", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger15">Open</button>
            <md-menu for="trigger15">
              <md-menu-item id="i" value="i">I</md-menu-item>
              <md-menu-item id="j" value="j">J</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.updateComplete;
      await menu.show();
      menu.focusLastItem();

      const i = /** @type {MdMenuItem} */ (el.querySelector("#i"));
      const j = /** @type {MdMenuItem} */ (el.querySelector("#j"));
      expect(j.getTabIndex()).to.equal(0);
      expect(i.getTabIndex()).to.equal(-1);
    });

    it('focus-on-open="selected" makes the trigger click focus the selected item, not the first', async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger12">Open</button>
            <md-menu for="trigger12" focus-on-open="selected">
              <md-menu-item id="k" value="k">K</md-menu-item>
              <md-menu-item id="l" value="l" selected>L</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger12")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const l = /** @type {MdMenuItem} */ (el.querySelector("#l"));
      expect(l.getTabIndex()).to.equal(0);
    });
  });
});
