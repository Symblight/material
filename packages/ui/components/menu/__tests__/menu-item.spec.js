import { expect, fixture, html } from "@open-wc/testing";

import "../menu-item.js";
import "../menu.js";

/** @import { MdMenuItem } from "../menu-item.js" */

describe("md-menu-item", () => {
  describe("rendering", () => {
    it("renders the element with role=menuitem on its interactive control", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a">A</md-menu-item>`)
      );
      const button = el.shadowRoot.querySelector(".md-menu-item__interactive");
      expect(button.getAttribute("role")).to.equal("menuitem");
    });

    it("defaults value to empty string, disabled/selected/keep-open to false", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item></md-menu-item>`)
      );
      expect(el.value).to.equal("");
      expect(el.disabled).to.be.false;
      expect(el.selected).to.be.false;
      expect(el.keepOpen).to.be.false;
    });

    it('defaults type to "menuitem"', async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item></md-menu-item>`)
      );
      expect(el.type).to.equal("menuitem");
    });
  });

  describe('type="option"', () => {
    it("renders role=option on the interactive control instead of role=menuitem", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(
          html`<md-menu-item type="option" value="a">A</md-menu-item>`,
        )
      );
      const button = el.shadowRoot.querySelector(".md-menu-item__interactive");
      expect(button.getAttribute("role")).to.equal("option");
    });

    it("reflects aria-selected from the selected property", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(
          html`<md-menu-item type="option" value="a" selected>A</md-menu-item>`,
        )
      );
      const button = el.shadowRoot.querySelector(".md-menu-item__interactive");
      expect(button.getAttribute("aria-selected")).to.equal("true");

      el.selected = false;
      await el.updateComplete;
      expect(button.getAttribute("aria-selected")).to.equal("false");
    });

    it("does not set aria-selected for the default menuitem type", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a" selected>A</md-menu-item>`)
      );
      const button = el.shadowRoot.querySelector(".md-menu-item__interactive");
      expect(button.hasAttribute("aria-selected")).to.be.false;
    });
  });

  describe("href", () => {
    it("renders an <a href> instead of a <button> when href is set", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(
          html`<md-menu-item value="a" href="/somewhere">A</md-menu-item>`,
        )
      );
      const interactive = el.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(interactive.tagName).to.equal("A");
      expect(interactive.getAttribute("href")).to.equal("/somewhere");
    });

    it("renders a <button> when href is unset", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a">A</md-menu-item>`)
      );
      const interactive = el.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(interactive.tagName).to.equal("BUTTON");
    });

    it("a disabled href item is aria-disabled and does not navigate on click", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(
          html`<md-menu-item value="a" href="/somewhere" disabled
            >A</md-menu-item
          >`,
        )
      );
      const interactive = /** @type {HTMLAnchorElement} */ (
        el.shadowRoot.querySelector(".md-menu-item__interactive")
      );
      expect(interactive.getAttribute("aria-disabled")).to.equal("true");

      let navigated = false;
      interactive.addEventListener("click", (event) => {
        navigated = !event.defaultPrevented;
      });
      interactive.click();
      expect(navigated).to.be.false;
    });

    it("Space activates an href item, matching native <button> Enter/Space activation", async () => {
      // Native <a> only fires `click` on Enter, not Space — without
      // _onInteractiveKeydown, Space would silently do nothing here while
      // activating a <button>-based item. `href="#"` avoids a real page
      // navigation (unlike an absolute path) so the test stays on-page.
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a" href="#">A</md-menu-item>`)
      );
      const interactive = /** @type {HTMLAnchorElement} */ (
        el.shadowRoot.querySelector(".md-menu-item__interactive")
      );

      let fired = false;
      el.addEventListener("select", () => {
        fired = true;
      });

      const event = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
        cancelable: true,
      });
      interactive.dispatchEvent(event);

      expect(event.defaultPrevented).to.be.true;
      expect(fired).to.be.true;
    });
  });

  describe("disabled", () => {
    it("reflects disabled and sets aria-disabled, without native disabled on the button", async () => {
      // No native `disabled` — APG: disabled menu items stay focusable
      // (just not activatable), which native `disabled` would prevent
      // entirely. aria-disabled + a blocked click (see menu.spec.js
      // "disabled items") carries the state instead.
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item disabled>A</md-menu-item>`)
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      const button = /** @type {HTMLButtonElement} */ (
        el.shadowRoot.querySelector(".md-menu-item__interactive")
      );
      expect(button.hasAttribute("disabled")).to.be.false;
      expect(button.getAttribute("aria-disabled")).to.equal("true");
    });
  });

  describe("selected", () => {
    it("reflects the selected attribute", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item selected>A</md-menu-item>`)
      );
      expect(el.hasAttribute("selected")).to.be.true;
    });
  });

  describe("select event", () => {
    it("clicking the interactive control dispatches select with value", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="foo">Foo</md-menu-item>`)
      );
      let detail;
      el.addEventListener("select", (/** @type {CustomEvent} */ e) => {
        detail = e.detail;
      });
      el.shadowRoot.querySelector(".md-menu-item__interactive").click();
      expect(detail).to.exist;
      expect(detail.value).to.equal("foo");
      expect(detail.item).to.equal(el);
    });
  });

  describe("submenu", () => {
    it("auto-renders a trailing chevron icon when a submenu is slotted", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
      expect(el.hasSubmenu).to.be.true;
      expect(el.shadowRoot.querySelector('[part="icon"]')).to.exist;
    });

    it("does not render a chevron icon without a submenu", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a">A</md-menu-item>`)
      );
      expect(el.hasSubmenu).to.be.false;
      expect(el.shadowRoot.querySelector('[part="icon"]')).to.not.exist;
    });

    it("clicking an item with a submenu opens the submenu instead of dispatching select", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      let fired = false;
      el.addEventListener("select", () => {
        fired = true;
      });

      el.shadowRoot.querySelector(".md-menu-item__interactive").click();
      await new Promise((r) => setTimeout(r, 30));

      expect(fired).to.be.false;
      expect(el.submenuEl.open).to.be.true;
    });

    it("hovering an item with a submenu does not open it", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      el.shadowRoot
        .querySelector(".md-menu-item__interactive")
        .dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 250));

      expect(el.submenuEl.open).to.be.false;
    });

    it("defaults an unset submenu placement to right-start", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(el.submenuEl.placement).to.equal("right-start");
    });

    it("preserves an explicitly-authored submenu placement", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu" placement="left-start">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(el.submenuEl.placement).to.equal("left-start");
    });

    it("does not hide the submenu slot with display:none", async () => {
      // Regression test: a top-layer popover (`popover="auto"`) is
      // suppressed and never paints if ANY flat-tree ancestor computes to
      // display:none — even though the popover's own open state is correct.
      // The `submenu` slot must stay visible (its assigned `md-menu` is
      // itself `display:contents` and produces no box, so hiding the slot
      // buys nothing and silently breaks every nested submenu).
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;

      const submenuSlot = el.shadowRoot.querySelector('slot[name="submenu"]');
      expect(getComputedStyle(submenuSlot).display).to.not.equal("none");
    });

    it("renders the submenu slot as a sibling of the interactive element, not nested inside it", async () => {
      // role="menu"'s only valid children are menuitem/menuitemradio/
      // menuitemcheckbox/group — nesting a whole second menu inside this
      // item's own <button> broke the accessibility tree (browsers commonly
      // flatten a button's subtree to its text content) and let submenu
      // clicks bubble through this item's own click handler.
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;

      const interactive = el.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(interactive.querySelector('slot[name="submenu"]')).to.not.exist;
      expect(el.shadowRoot.querySelector('slot[name="submenu"]')).to.exist;
    });

    it("sets aria-haspopup and toggles aria-expanded on the interactive element as the submenu opens/closes", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="parent">
            Parent
            <md-menu slot="submenu">
              <md-menu-item value="child">Child</md-menu-item>
            </md-menu>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const interactive = el.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(interactive.getAttribute("aria-haspopup")).to.equal("menu");
      expect(interactive.getAttribute("aria-expanded")).to.equal("false");

      interactive.click();
      // `_submenuOpen` is set from the submenu's own "opening" event, which
      // fires from the submenu's *own* update cycle (triggered by setting
      // `submenu.open = true`) — a separate, later microtask than `el`'s.
      await el.submenuEl.updateComplete;
      await el.updateComplete;
      expect(interactive.getAttribute("aria-expanded")).to.equal("true");

      await el.submenuEl.close();
      await el.updateComplete;
      expect(interactive.getAttribute("aria-expanded")).to.equal("false");
    });

    it("does not set aria-haspopup/aria-expanded without a submenu", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item value="a">A</md-menu-item>`)
      );
      const interactive = el.shadowRoot.querySelector(
        ".md-menu-item__interactive",
      );
      expect(interactive.hasAttribute("aria-haspopup")).to.be.false;
      expect(interactive.hasAttribute("aria-expanded")).to.be.false;
    });
  });

  describe("label", () => {
    it("returns the default slot's text content, excluding named slots", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`
          <md-menu-item value="a">
            Alpha
            <span slot="trailing">⌘A</span>
          </md-menu-item>
        `)
      );
      await el.updateComplete;
      expect(el.label).to.equal("Alpha");
    });
  });
});
