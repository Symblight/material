import { expect, fixture, html } from "@open-wc/testing";

import "../list-item.ts";
import type { MdListItem } from "../list-item.ts";

describe("md-list-item", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el).to.exist;
    });

    it("has the correct tag name", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.tagName.toLowerCase()).to.equal("md-list-item");
    });

    it("renders a shadow root", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot).to.exist;
    });

    it("renders a <li> element inside the shadow root", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("li")).to.exist;
    });

    it("the <li> element has the md-list-item class", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      const li = el.shadowRoot!.querySelector("li")!;
      expect(li.classList.contains("md-list-item")).to.be.true;
    });
  });

  // ─── Static (non-interactive) default ───────────────────────────────────────

  describe("static (non-interactive) default", () => {
    it("does not render a <button> by default", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("button")).to.be.null;
    });

    it("does not render an <a> by default", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("a")).to.be.null;
    });

    it("does not render md-ripple by default", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.be.null;
    });

    it("defaults button property to false", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.button).to.be.false;
    });

    it("defaults href property to undefined", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.href).to.be.undefined;
    });
  });

  // ─── Button mode ─────────────────────────────────────────────────────────────

  describe("button mode", () => {
    it("renders an inner <button> when button attribute is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("button")).to.exist;
    });

    it("the <button> has type='button'", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      const btn = el.shadowRoot!.querySelector("button")!;
      expect(btn.getAttribute("type")).to.equal("button");
    });

    it("the <button> has the md-list-item__interactive class", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      const btn = el.shadowRoot!.querySelector("button")!;
      expect(btn.classList.contains("md-list-item__interactive")).to.be.true;
    });

    it("the <button> has part='interactive'", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      const btn = el.shadowRoot!.querySelector("button")!;
      expect(btn.getAttribute("part")).to.equal("interactive");
    });

    it("the <button> has an initial tabindex of 0", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      const btn = el.shadowRoot!.querySelector("button")!;
      expect(btn.getAttribute("tabindex")).to.equal("0");
    });

    it("renders md-ripple when button is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("does not render an <a> when only button is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("a")).to.be.null;
    });

    it("reflects button as a boolean attribute on the host", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button></md-list-item>`,
      );
      expect(el.hasAttribute("button")).to.be.true;
    });

    it("switches to button mode reactively", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("button")).to.be.null;
      el.button = true;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector("button")).to.exist;
    });
  });

  // ─── Href mode ───────────────────────────────────────────────────────────────

  describe("href mode", () => {
    it("renders an inner <a> when href attribute is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("a")).to.exist;
    });

    it("the <a> has the correct href value", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/settings"></md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.getAttribute("href")).to.equal("/settings");
    });

    it("the <a> has the md-list-item__interactive class", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.classList.contains("md-list-item__interactive")).to.be
        .true;
    });

    it("the <a> has part='interactive'", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.getAttribute("part")).to.equal("interactive");
    });

    it("the <a> has an initial tabindex of 0", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.getAttribute("tabindex")).to.equal("0");
    });

    it("renders md-ripple when href is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("does not render a <button> when only href is set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("button")).to.be.null;
    });

    it("reflects href as an attribute on the host", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page"></md-list-item>`,
      );
      expect(el.getAttribute("href")).to.equal("/page");
    });

    it("switches to href mode reactively", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("a")).to.be.null;
      el.href = "/new-page";
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector("a")).to.exist;
    });

    it("updates the rendered href reactively", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/old"></md-list-item>`,
      );
      el.href = "/new";
      await el.updateComplete;
      const anchor = el.shadowRoot!.querySelector("a") as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).to.equal("/new");
    });
  });

  // ─── Href takes precedence over button ───────────────────────────────────────

  describe("href takes precedence over button", () => {
    it("renders an <a> (not a <button>) when both href and button are set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page" button></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("a")).to.exist;
      expect(el.shadowRoot!.querySelector("button")).to.be.null;
    });

    it("the <a> carries the correct href value when both are set", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/priority" button></md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.getAttribute("href")).to.equal("/priority");
    });
  });

  // ─── Slots — shadow DOM structure ────────────────────────────────────────────

  describe("slot structure in shadow DOM", () => {
    it("renders exactly 5 named/unnamed slots", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      const slots = el.shadowRoot!.querySelectorAll("slot");
      expect(slots.length).to.equal(5);
    });

    it("renders the default (unnamed) slot for label content", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("slot:not([name])")).to.exist;
    });

    it("renders a slot[name='overline']", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector('slot[name="overline"]')).to.exist;
    });

    it("renders a slot[name='supporting-text']", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(
        el.shadowRoot!.querySelector('slot[name="supporting-text"]'),
      ).to.exist;
    });

    it("renders a slot[name='leading']", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector('slot[name="leading"]')).to.exist;
    });

    it("renders a slot[name='trailing']", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item></md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector('slot[name="trailing"]')).to.exist;
    });
  });

  // ─── Slots — content distribution ───────────────────────────────────────────

  describe("slot content distribution", () => {
    it("distributes label text via the default slot", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Inbox</md-list-item>`,
      );
      expect(el.textContent!.trim()).to.equal("Inbox");
    });

    it("distributes content via the overline slot", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          <span id="ov" slot="overline">Folder</span>
          Label
        </md-list-item>
      `);
      expect(el.querySelector("#ov")).to.exist;
      expect(el.querySelector("#ov")!.textContent).to.equal("Folder");
    });

    it("distributes content via the supporting-text slot", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          Label
          <span id="st" slot="supporting-text">3 unread</span>
        </md-list-item>
      `);
      expect(el.querySelector("#st")).to.exist;
      expect(el.querySelector("#st")!.textContent).to.equal("3 unread");
    });

    it("distributes content via the leading slot", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          <span id="lead" slot="leading">icon</span>
          Label
        </md-list-item>
      `);
      expect(el.querySelector("#lead")).to.exist;
      expect(el.querySelector("#lead")!.textContent).to.equal("icon");
    });

    it("distributes content via the trailing slot", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          Label
          <span id="trail" slot="trailing">Jan 6</span>
        </md-list-item>
      `);
      expect(el.querySelector("#trail")).to.exist;
      expect(el.querySelector("#trail")!.textContent).to.equal("Jan 6");
    });
  });

  // ─── Slot presence — has-content class ───────────────────────────────────────

  describe("slot wrapper has-content class", () => {
    it("leading wrapper does not have has-content when slot is empty", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__leading-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.false;
    });

    it("leading wrapper has has-content when leading slot is populated", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          <span slot="leading">icon</span>
          Label
        </md-list-item>
      `);
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__leading-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.true;
    });

    it("trailing wrapper does not have has-content when slot is empty", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__trailing-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.false;
    });

    it("trailing wrapper has has-content when trailing slot is populated", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          Label
          <span slot="trailing">chevron</span>
        </md-list-item>
      `);
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__trailing-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.true;
    });

    it("overline wrapper does not have has-content when slot is empty", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__overline-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.false;
    });

    it("overline wrapper has has-content when slot is populated", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          <span slot="overline">Category</span>
          Label
        </md-list-item>
      `);
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__overline-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.true;
    });

    it("supporting-text wrapper does not have has-content when slot is empty", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__supporting-text-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.false;
    });

    it("supporting-text wrapper has has-content when slot is populated", async () => {
      const el = await fixture<MdListItem>(html`
        <md-list-item>
          Label
          <span slot="supporting-text">Details</span>
        </md-list-item>
      `);
      await el.updateComplete;
      const wrapper = el.shadowRoot!.querySelector(
        ".md-list-item__supporting-text-wrapper",
      )!;
      expect(wrapper.classList.contains("has-content")).to.be.true;
    });
  });

  // ─── md-ripple presence ──────────────────────────────────────────────────────

  describe("md-ripple presence", () => {
    it("no ripple in static mode", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.be.null;
    });

    it("ripple present in button mode", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("ripple present in href mode", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page">Label</md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("ripple for= attribute points to list-item-interactive", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      const ripple = el.shadowRoot!.querySelector("md-ripple")!;
      expect(ripple.getAttribute("for")).to.equal("list-item-interactive");
    });
  });

  // ─── Roving tabindex API ─────────────────────────────────────────────────────

  describe("roving tabindex API", () => {
    it("getTabIndex returns 0 initially for a button item", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      await el.updateComplete;
      expect(el.getTabIndex()).to.equal(0);
    });

    it("setTabIndex updates the inner button tabindex", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      await el.updateComplete;
      el.setTabIndex(-1);
      const btn = el.shadowRoot!.querySelector("button")!;
      expect(btn.getAttribute("tabindex")).to.equal("-1");
    });

    it("getTabIndex reflects the value set by setTabIndex", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      await el.updateComplete;
      el.setTabIndex(-1);
      expect(el.getTabIndex()).to.equal(-1);
    });

    it("setTabIndex updates the inner <a> tabindex for href items", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page">Label</md-list-item>`,
      );
      await el.updateComplete;
      el.setTabIndex(-1);
      const anchor = el.shadowRoot!.querySelector("a")!;
      expect(anchor.getAttribute("tabindex")).to.equal("-1");
    });

    it("focusInteractive focuses the inner button", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      await el.updateComplete;
      el.focusInteractive();
      const btn = el.shadowRoot!.querySelector("button") as HTMLButtonElement;
      expect(el.shadowRoot!.activeElement).to.equal(btn);
    });

    it("focusInteractive focuses the inner <a> for href items", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page">Label</md-list-item>`,
      );
      await el.updateComplete;
      el.focusInteractive();
      const anchor = el.shadowRoot!.querySelector("a") as HTMLAnchorElement;
      expect(el.shadowRoot!.activeElement).to.equal(anchor);
    });
  });

  // ─── Accessibility ───────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("the shadow root contains a <li> for native list-item semantics", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      expect(el.shadowRoot!.querySelector("li")).to.exist;
    });

    it("md-list-item host has no explicit role attribute", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item>Label</md-list-item>`,
      );
      expect(el.getAttribute("role")).to.be.null;
    });

    it("inner <button> is naturally keyboard accessible", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item button>Label</md-list-item>`,
      );
      const btn = el.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      expect(btn.tabIndex).to.be.at.least(0);
    });

    it("inner <a> is naturally keyboard accessible", async () => {
      const el = await fixture<MdListItem>(
        html`<md-list-item href="/page">Label</md-list-item>`,
      );
      const anchor = el.shadowRoot!.querySelector(
        "a",
      ) as HTMLAnchorElement;
      expect(anchor.tabIndex).to.be.at.least(0);
    });
  });
});
