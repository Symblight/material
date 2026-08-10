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

  describe("disabled", () => {
    it("reflects disabled and sets aria-disabled + native disabled on the button", async () => {
      const el = /** @type {MdMenuItem} */ (
        await fixture(html`<md-menu-item disabled>A</md-menu-item>`)
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      const button = /** @type {HTMLButtonElement} */ (
        el.shadowRoot.querySelector(".md-menu-item__interactive")
      );
      expect(button.disabled).to.be.true;
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
