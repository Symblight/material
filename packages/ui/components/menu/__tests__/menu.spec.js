import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";

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

    it("is itself the popover=manual surface (dismiss is self-managed, not native light-dismiss)", async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.getAttribute("popover")).to.equal("manual");
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

  // ─── positioning ─────────────────────────────────────────────────────────

  describe("positioning", () => {
    it('defaults to "popover"', async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu></md-menu>`)
      );
      expect(el.positioning).to.equal("popover");
    });

    it('positioning="fixed" does not set the popover attribute and stays position:fixed', async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu positioning="fixed"></md-menu>`)
      );
      expect(el.hasAttribute("popover")).to.be.false;
      expect(getComputedStyle(el).position).to.equal("fixed");
    });

    it('positioning="absolute" does not set the popover attribute and computes position:absolute', async () => {
      const el = /** @type {MdMenu} */ (
        await fixture(html`<md-menu positioning="absolute"></md-menu>`)
      );
      expect(el.hasAttribute("popover")).to.be.false;
      expect(getComputedStyle(el).position).to.equal("absolute");
    });

    it('positioning="document" hoists the surface to a direct child of <body>', async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <md-menu positioning="document" id="doc-menu"></md-menu>
          </div>
        `)
      );
      const menu = document.getElementById("doc-menu");
      expect(menu.parentNode).to.equal(document.body);
      expect(el.querySelector("#doc-menu")).to.not.exist;
      menu.remove();
    });

    it('positioning="fixed" still opens/closes via show()/close(), without :popover-open', async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="fixedTrigger1">Open</button>
            <md-menu for="fixedTrigger1" positioning="fixed">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.show();
      expect(menu.open).to.be.true;
      expect(menu.matches(":popover-open")).to.be.false;
      expect(getComputedStyle(menu).display).to.not.equal("none");

      await menu.close();
      expect(menu.open).to.be.false;
    });

    it('positioning="fixed" closes on an outside click (own light-dismiss)', async () => {
      // Dismiss is driven by a `document` `click` listener (capture phase),
      // not `pointerdown` — see `PopoverPositionController._onDocumentClick`
      // — so a real outside interaction is a pointerdown *followed by* a
      // click, matching what the browser actually fires for a real click.
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="fixedTrigger2">Open</button>
            <md-menu for="fixedTrigger2" positioning="fixed">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.show();
      expect(menu.open).to.be.true;

      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      document.body.dispatchEvent(
        new MouseEvent("click", { bubbles: true, composed: true }),
      );
      await tick();

      expect(menu.open).to.be.false;
    });

    it('positioning="fixed" closes when focus moves outside it (Tab dismiss, no native popover to do it for free)', async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="fixedTrigger3">Open</button>
            <md-menu for="fixedTrigger3" positioning="fixed">
              <md-menu-item id="fixedItem" value="one">One</md-menu-item>
            </md-menu>
            <button id="outsideButton">Outside</button>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const item = /** @type {MdMenuItem} */ (el.querySelector("#fixedItem"));
      const outside = /** @type {HTMLButtonElement} */ (
        el.querySelector("#outsideButton")
      );
      await menu.show();
      await item.updateComplete;
      item.shadowRoot.querySelector(".md-menu-item__interactive").focus();
      expect(menu.open).to.be.true;

      outside.focus();
      await tick();

      expect(menu.open).to.be.false;
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

    it("labels the menu via aria-labelledby pointing at the resolved trigger, generating an id if needed", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger-with-id">Open</button>
            <md-menu for="trigger-with-id">
              <md-menu-item value="one">One</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      await menu.updateComplete;
      expect(menu.getAttribute("aria-labelledby")).to.equal("trigger-with-id");
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
      // APG: disabled menu items are focusable but not activatable — no
      // native `disabled` (which would remove it from focus entirely),
      // `aria-disabled` + a blocked click instead. See the next test for
      // the focusability side of this.
      expect(button.hasAttribute("disabled")).to.be.false;
      expect(button.getAttribute("aria-disabled")).to.equal("true");
      button.click();
      await tick();

      expect(fired).to.be.false;
    });

    it("disabled items stay in the roving tabindex sequence (focusable, not activatable)", async () => {
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

      // Disabled item (i2) is reachable — ArrowDown lands ON it, not past
      // it — so a screen-reader/keyboard user can discover it exists.
      expect(i2.getTabIndex()).to.equal(0);
      expect(i1.getTabIndex()).to.equal(-1);

      // Still not activatable: a click on it does not select.
      const btn2 = /** @type {HTMLButtonElement} */ (
        i2.shadowRoot.querySelector(".md-menu-item__interactive")
      );
      let fired = false;
      menu.addEventListener("select", () => {
        fired = true;
      });
      btn2.click();
      await tick();
      expect(fired).to.be.false;

      // ArrowDown again moves past it normally to i3.
      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await menu.updateComplete;
      expect(i3.getTabIndex()).to.equal(0);
      expect(i2.getTabIndex()).to.equal(-1);
    });
  });

  // ─── Submenu keyboard navigation ────────────────────────────────────────

  describe("submenu keyboard navigation", () => {
    it("Enter on a focused item with a submenu opens it and focuses its first item", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger16">Open</button>
            <md-menu for="trigger16">
              <md-menu-item id="parent" value="parent">
                Parent
                <md-menu slot="submenu">
                  <md-menu-item id="child" value="child">Child</md-menu-item>
                </md-menu>
              </md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger16")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const parent = /** @type {MdMenuItem} */ (el.querySelector("#parent"));
      await parent.updateComplete;
      parent.shadowRoot.querySelector(".md-menu-item__interactive").focus();

      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      await tick();

      expect(parent.submenuEl.open).to.be.true;
      const child = /** @type {MdMenuItem} */ (el.querySelector("#child"));
      expect(child.getTabIndex()).to.equal(0);
      expect(
        child.shadowRoot.querySelector(".md-menu-item__interactive"),
      ).to.equal(child.shadowRoot.activeElement);
    });

    it("Space on a focused item without a submenu does not intercept native activation", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger17">Open</button>
            <md-menu for="trigger17">
              <md-menu-item id="plain" value="plain">Plain</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger17")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const plain = /** @type {MdMenuItem} */ (el.querySelector("#plain"));
      await plain.updateComplete;
      const button = plain.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      button.focus();

      const event = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
        cancelable: true,
      });
      menu.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.false;
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

  // ─── Tab ─────────────────────────────────────────────────────────────────
  //
  // Uses `sendKeys()` from `@web/test-runner-commands`, which drives the
  // browser's real input automation (Playwright, per web-test-runner.config)
  // the same way `page.keyboard.press('Tab')` does — a genuine trusted
  // keypress, not a synthetic `KeyboardEvent` dispatch. This matters here
  // specifically: the menu's dismiss is driven entirely by
  // `PopoverPositionController`'s own `focusout` listener (see
  // `_onSurfaceFocusOut`), not native `popover` light-dismiss (which is
  // pointerdown-driven, not focus-driven, and never catches Tab-out even
  // when it IS used) — only a *real* Tab, which actually moves
  // `document.activeElement` via the browser's own tab order, fires a real
  // `focusout` and proves the menu closes. (A synthetic
  // `dispatchEvent(new KeyboardEvent(...))`, by contrast, never moves focus
  // and so never fires `focusout` either — correct, unrelated platform
  // behavior that a regression test for *this* bug shouldn't conflate with
  // the fix.)
  describe("Tab", () => {
    it("closes the menu on a real Tab keypress and lets focus move on natively", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="tabTrigger">Open</button>
            <md-menu for="tabTrigger">
              <md-menu-item id="tabItem" value="one">One</md-menu-item>
            </md-menu>
            <button id="tabOutside">Outside</button>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tabTrigger")
      );
      const outside = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tabOutside")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();
      expect(menu.open).to.be.true;

      const item = /** @type {MdMenuItem} */ (el.querySelector("#tabItem"));
      await item.updateComplete;
      item.shadowRoot.querySelector(".md-menu-item__interactive").focus();

      await sendKeys({ press: "Tab" });
      await tick();

      expect(menu.open).to.be.false;
      // Focus was allowed to land wherever native Tab order sends it (here,
      // the next focusable sibling) — not forced back to the trigger.
      expect(document.activeElement).to.equal(outside);

      outside.remove();
      trigger.remove();
      menu.remove();
    });

    it("closes the whole open submenu chain, not just the innermost submenu", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="tabTrigger2">Open</button>
            <md-menu for="tabTrigger2">
              <md-menu-item id="tabParent" value="parent">
                Parent
                <md-menu slot="submenu">
                  <md-menu-item id="tabChild" value="child">Child</md-menu-item>
                </md-menu>
              </md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tabTrigger2")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const parent = /** @type {MdMenuItem} */ (el.querySelector("#tabParent"));
      await parent.updateComplete;
      parent.shadowRoot.querySelector(".md-menu-item__interactive").focus();
      parent.expandSubmenu();
      await tick();

      const submenu = parent.submenuEl;
      expect(submenu.open).to.be.true;

      const child = /** @type {MdMenuItem} */ (el.querySelector("#tabChild"));
      await child.updateComplete;
      child.shadowRoot.querySelector(".md-menu-item__interactive").focus();

      await sendKeys({ press: "Tab" });
      await tick();

      expect(submenu.open).to.be.false;
      expect(menu.open).to.be.false;
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

  // ─── Typeahead ───────────────────────────────────────────────────────────

  describe("typeahead", () => {
    /**
     * @param {HTMLElement} el
     * @param {string} key
     */
    function press(el, key) {
      el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    it("a single keypress focuses the first item whose label starts with it", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger18">Open</button>
            <md-menu for="trigger18">
              <md-menu-item id="alpha" value="alpha">Alpha</md-menu-item>
              <md-menu-item id="beta" value="beta">Beta</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger18")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const beta = /** @type {MdMenuItem} */ (el.querySelector("#beta"));
      await beta.updateComplete;

      press(menu, "b");
      await menu.updateComplete;

      expect(beta.getTabIndex()).to.equal(0);
    });

    it("multi-character prefixes still search from the top, not cycling", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger19">Open</button>
            <md-menu for="trigger19">
              <md-menu-item id="settings" value="settings"
                >Settings</md-menu-item
              >
              <md-menu-item id="share" value="share">Share</md-menu-item>
              <md-menu-item id="signout" value="signout">Sign out</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger19")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const share = /** @type {MdMenuItem} */ (el.querySelector("#share"));
      await share.updateComplete;

      press(menu, "s");
      press(menu, "h");
      await menu.updateComplete;

      expect(share.getTabIndex()).to.equal(0);
    });

    it("repeating the same character cycles through every match instead of always landing on the first", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="trigger20">Open</button>
            <md-menu for="trigger20">
              <md-menu-item id="settings" value="settings"
                >Settings</md-menu-item
              >
              <md-menu-item id="share" value="share">Share</md-menu-item>
              <md-menu-item id="signout" value="signout">Sign out</md-menu-item>
            </md-menu>
          </div>
        `)
      );
      const menu = /** @type {MdMenu} */ (el.querySelector("md-menu"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#trigger20")
      );
      await menu.updateComplete;
      trigger.click();
      await tick();

      const settings = /** @type {MdMenuItem} */ (
        el.querySelector("#settings")
      );
      const share = /** @type {MdMenuItem} */ (el.querySelector("#share"));
      const signout = /** @type {MdMenuItem} */ (el.querySelector("#signout"));
      await Promise.all(
        [settings, share, signout].map((i) => i.updateComplete),
      );

      press(menu, "s");
      await menu.updateComplete;
      expect(settings.getTabIndex()).to.equal(0);

      press(menu, "s");
      await menu.updateComplete;
      expect(share.getTabIndex()).to.equal(0);

      press(menu, "s");
      await menu.updateComplete;
      expect(signout.getTabIndex()).to.equal(0);

      // Wraps back to the first match.
      press(menu, "s");
      await menu.updateComplete;
      expect(settings.getTabIndex()).to.equal(0);
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
