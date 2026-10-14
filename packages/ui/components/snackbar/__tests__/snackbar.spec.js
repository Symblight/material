import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";
import "../../button/button.js";

/** @import { MdSnackbar } from "../snackbar.js" */

const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {MdSnackbar} el */
const surface = (el) => el.shadowRoot.querySelector('[part="surface"]');
/** @param {MdSnackbar} el */
const actionWrapper = (el) => el.shadowRoot.querySelector('[part="action"]');
/** @param {MdSnackbar} el */
const closeButton = (el) => el.shadowRoot.querySelector('[part="close"]');

describe("md-snackbar", () => {
  describe("rendering", () => {
    it("renders the element with a surface", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>Hello</md-snackbar>`)
      );
      expect(el).to.exist;
      expect(surface(el)).to.exist;
    });

    it("renders default slot content inside the text part", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>Hello</md-snackbar>`)
      );
      const slot = el.shadowRoot.querySelector(
        '[part="text"] slot:not([name])',
      );
      expect(slot).to.exist;
      const nodes = /** @type {HTMLSlotElement} */ (slot).assignedNodes();
      expect(
        nodes
          .map((n) => n.textContent)
          .join("")
          .trim(),
      ).to.equal("Hello");
    });

    it("has defaults", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      expect(el.showClose).to.be.false;
      expect(el.multiline).to.be.false;
      expect(el.stacked).to.be.false;
      expect(el.closeLabel).to.equal("Close");
    });

    it("has no host role and no open state", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      expect(el.hasAttribute("role")).to.be.false;
      expect("open" in el).to.be.false;
    });

    it("exposes parts surface, text, action", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      for (const part of ["surface", "text", "action"]) {
        expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.exist;
      }
    });

    it("exposes the close part when show-close is set", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar show-close>x</md-snackbar>`)
      );
      expect(closeButton(el)).to.exist;
    });

    it("parts are stylable from outside via ::part", async () => {
      const wrapper = await fixture(html`
        <div>
          <style>
            md-snackbar::part(text) {
              outline-width: 7px;
              outline-style: solid;
            }
          </style>
          <md-snackbar>x</md-snackbar>
        </div>
      `);
      const el = /** @type {MdSnackbar} */ (
        wrapper.querySelector("md-snackbar")
      );
      const text = el.shadowRoot.querySelector('[part="text"]');
      expect(getComputedStyle(text).outlineWidth).to.equal("7px");
    });
  });

  describe("accessibility", () => {
    it('surface has role="status" and aria-live="polite"', async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      expect(surface(el).getAttribute("role")).to.equal("status");
      expect(surface(el).getAttribute("aria-live")).to.equal("polite");
    });

    it('close button aria-label defaults to "Close"', async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar show-close>x</md-snackbar>`)
      );
      expect(closeButton(el).getAttribute("aria-label")).to.equal("Close");
    });

    it("close button aria-label follows close-label", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(
          html`<md-snackbar show-close close-label="Schließen">x</md-snackbar>`,
        )
      );
      expect(closeButton(el).getAttribute("aria-label")).to.equal("Schließen");
      el.closeLabel = "Dismiss";
      await el.updateComplete;
      expect(closeButton(el).getAttribute("aria-label")).to.equal("Dismiss");
    });
  });

  describe("action slot", () => {
    it("hides the action wrapper when nothing is slotted", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      await tick();
      expect(actionWrapper(el).hasAttribute("hidden")).to.be.true;
      expect(getComputedStyle(actionWrapper(el)).display).to.equal("none");
    });

    it("shows the action wrapper when action content is slotted", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar>
            x
            <md-button slot="action" variant="text">Undo</md-button>
          </md-snackbar>
        `)
      );
      await tick();
      expect(actionWrapper(el).hasAttribute("hidden")).to.be.false;
      expect(getComputedStyle(actionWrapper(el)).display).not.to.equal("none");
    });

    it("shows after dynamic slotting and hides again after removal", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      await tick();
      expect(actionWrapper(el).hasAttribute("hidden")).to.be.true;

      const btn = document.createElement("md-button");
      btn.slot = "action";
      btn.textContent = "Undo";
      el.append(btn);
      await tick();
      expect(actionWrapper(el).hasAttribute("hidden")).to.be.false;

      btn.remove();
      await tick();
      expect(actionWrapper(el).hasAttribute("hidden")).to.be.true;
    });
  });

  describe("show-close and close event", () => {
    it("does not render the close button by default", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      expect(closeButton(el)).to.be.null;
    });

    it("renders the close button when show-close is set and reflects", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      el.showClose = true;
      await el.updateComplete;
      expect(el.hasAttribute("show-close")).to.be.true;
      expect(closeButton(el)).to.exist;
      expect(closeButton(el).querySelector("md-icon")).to.exist;
    });

    it("dispatches a bubbling, composed, cancelable close event on click", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar show-close>x</md-snackbar>`)
      );
      /** @type {Event | undefined} */
      let received;
      el.addEventListener("close", (e) => (received = e));
      closeButton(el).dispatchEvent(
        new MouseEvent("click", { bubbles: true, composed: true }),
      );
      expect(received).to.exist;
      expect(received.bubbles).to.be.true;
      expect(received.composed).to.be.true;
      expect(received.cancelable).to.be.true;
      expect(received.target).to.equal(el);
    });

    it("bubbles to ancestors", async () => {
      const wrapper = await fixture(
        html`<div><md-snackbar show-close>x</md-snackbar></div>`,
      );
      let count = 0;
      wrapper.addEventListener("close", () => count++);
      const el = /** @type {MdSnackbar} */ (
        wrapper.querySelector("md-snackbar")
      );
      /** @type {HTMLElement} */ (closeButton(el)).click();
      expect(count).to.equal(1);
    });

    it("stays in the DOM and visible after close (even if prevented or not)", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar show-close>x</md-snackbar>`)
      );
      el.addEventListener("close", (e) => e.preventDefault());
      /** @type {HTMLElement} */ (closeButton(el)).click();
      await el.updateComplete;
      expect(el.isConnected).to.be.true;
      expect(el.hasAttribute("hidden")).to.be.false;
      expect(getComputedStyle(el).display).not.to.equal("none");
      expect(el.getBoundingClientRect().height).to.be.greaterThan(0);

      const el2 = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar show-close>y</md-snackbar>`)
      );
      /** @type {HTMLElement} */ (closeButton(el2)).click();
      await el2.updateComplete;
      expect(el2.isConnected).to.be.true;
      expect(getComputedStyle(el2).display).not.to.equal("none");
    });

    it("does not dispatch close when clicking a slotted action", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar show-close>
            x <md-button slot="action" variant="text">Undo</md-button>
          </md-snackbar>
        `)
      );
      let fired = false;
      el.addEventListener("close", () => (fired = true));
      /** @type {HTMLElement} */ (el.querySelector("md-button")).click();
      expect(fired).to.be.false;
    });
  });

  describe("layout: multiline and stacked", () => {
    it("reflects multiline and stacked attributes", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      el.multiline = true;
      el.stacked = true;
      await el.updateComplete;
      expect(el.hasAttribute("multiline")).to.be.true;
      expect(el.hasAttribute("stacked")).to.be.true;
      el.multiline = false;
      el.stacked = false;
      await el.updateComplete;
      expect(el.hasAttribute("multiline")).to.be.false;
      expect(el.hasAttribute("stacked")).to.be.false;
    });

    it("single-line min block size is 48px", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      expect(getComputedStyle(surface(el)).minBlockSize).to.equal("48px");
      expect(surface(el).getBoundingClientRect().height).to.equal(48);
    });

    it("multiline raises min block size to 68px", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar multiline>x</md-snackbar>`)
      );
      expect(getComputedStyle(surface(el)).minBlockSize).to.equal("68px");
      expect(surface(el).getBoundingClientRect().height).to.be.at.least(68);
    });

    it("stacked implies the 68px minimum and places action below text", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar stacked show-close>
            x <md-button slot="action" variant="text">Longer action</md-button>
          </md-snackbar>
        `)
      );
      await tick();
      expect(getComputedStyle(surface(el)).minBlockSize).to.equal("68px");
      const text = el.shadowRoot
        .querySelector('[part="text"]')
        .getBoundingClientRect();
      const action = actionWrapper(el).getBoundingClientRect();
      expect(action.top).to.be.at.least(text.bottom - 1);
    });

    it("non-stacked places action beside text", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar>
            x <md-button slot="action" variant="text">Undo</md-button>
          </md-snackbar>
        `)
      );
      await tick();
      const text = el.shadowRoot
        .querySelector('[part="text"]')
        .getBoundingClientRect();
      const action = actionWrapper(el).getBoundingClientRect();
      expect(action.left).to.be.at.least(text.right - 1);
    });
  });

  describe("MD3 tokens", () => {
    it("min and max width are 344px / 672px", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      const cs = getComputedStyle(el);
      expect(cs.minInlineSize).to.equal("344px");
      expect(cs.maxInlineSize).to.equal("672px");
      expect(el.getBoundingClientRect().width).to.be.at.least(344);
    });

    it("padding is 14px block / 16px inline start", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      const cs = getComputedStyle(surface(el));
      expect(cs.paddingTop).to.equal("14px");
      expect(cs.paddingBottom).to.equal("14px");
      expect(cs.paddingLeft).to.equal("16px");
    });

    it("container, text color, shape and elevation use system tokens", async () => {
      const wrapper = await fixture(html`
        <div
          style="
            --md-sys-color-inverse-surface: rgb(10, 20, 30);
            --md-sys-color-inverse-on-surface: rgb(200, 210, 220);
            --md-sys-shape-corner-extra-small: 4px;
          "
        >
          <md-snackbar>x</md-snackbar>
        </div>
      `);
      const el = /** @type {MdSnackbar} */ (
        wrapper.querySelector("md-snackbar")
      );
      const cs = getComputedStyle(surface(el));
      expect(cs.backgroundColor).to.equal("rgb(10, 20, 30)");
      expect(cs.color).to.equal("rgb(200, 210, 220)");
      expect(cs.borderTopLeftRadius).to.equal("4px");
      expect(
        el.shadowRoot.querySelector("md-shadow")?.getAttribute("level"),
      ).to.equal("3");
    });

    it("does not leak its elevation into slotted content", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar>
            x
            <span slot="action" id="action">Undo</span>
          </md-snackbar>
        `)
      );
      const action = /** @type {HTMLElement} */ (el.querySelector("#action"));
      expect(
        getComputedStyle(action).getPropertyValue("--md-elevation-level"),
      ).to.equal("");
    });

    it("typography maps to body-medium (14px/20px)", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`<md-snackbar>x</md-snackbar>`)
      );
      const cs = getComputedStyle(surface(el));
      expect(cs.fontSize).to.equal("14px");
      expect(cs.lineHeight).to.equal("20px");
      expect(cs.fontWeight).to.equal("400");
    });

    it("overriding --md-snackbar-container-color changes the background", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(
          html`<md-snackbar style="--md-snackbar-container-color: rgb(1, 2, 3)"
            >x</md-snackbar
          >`,
        )
      );
      expect(getComputedStyle(surface(el)).backgroundColor).to.equal(
        "rgb(1, 2, 3)",
      );
    });

    it("slotted text button label uses the inverse-primary action color", async () => {
      const wrapper = await fixture(html`
        <div
          style="
            --md-sys-color-inverse-primary: rgb(11, 111, 211);
            --md-sys-color-primary: rgb(250, 0, 0);
          "
        >
          <md-snackbar>
            x <md-button slot="action" variant="text">Undo</md-button>
          </md-snackbar>
        </div>
      `);
      const el = /** @type {MdSnackbar} */ (
        wrapper.querySelector("md-snackbar")
      );
      const btn = /** @type {HTMLElement} */ (el.querySelector("md-button"));
      await tick(60);
      // Resolve the foreground color through the button's own shadow DOM.
      const inner =
        btn.shadowRoot.querySelector("button, a, .md-button") ?? btn;
      const color = getComputedStyle(inner).color;
      expect(color, "button label color").to.equal("rgb(11, 111, 211)");
    });

    it("--md-snackbar-action-color override reaches the slotted button", async () => {
      const el = /** @type {MdSnackbar} */ (
        await fixture(html`
          <md-snackbar style="--md-snackbar-action-color: rgb(9, 99, 199)">
            x <md-button slot="action" variant="text">Undo</md-button>
          </md-snackbar>
        `)
      );
      const btn = /** @type {HTMLElement} */ (el.querySelector("md-button"));
      await tick(60);
      const inner =
        btn.shadowRoot.querySelector("button, a, .md-button") ?? btn;
      expect(getComputedStyle(inner).color).to.equal("rgb(9, 99, 199)");
    });

    it("close icon button receives the icon color", async () => {
      const wrapper = await fixture(html`
        <div style="--md-sys-color-inverse-on-surface: rgb(7, 77, 177)">
          <md-snackbar show-close>x</md-snackbar>
        </div>
      `);
      const el = /** @type {MdSnackbar} */ (
        wrapper.querySelector("md-snackbar")
      );
      await tick(60);
      const btn = /** @type {HTMLElement} */ (closeButton(el));
      const inner = btn.shadowRoot.querySelector("button, a") ?? btn;
      expect(getComputedStyle(inner).color).to.equal("rgb(7, 77, 177)");
    });
  });
});
