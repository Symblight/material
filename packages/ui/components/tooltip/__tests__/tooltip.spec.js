import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";

/** @import { MdTooltip } from "../tooltip.js" */

/** @param {number} [ms] */
const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

describe("md-tooltip", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el).to.exist;
    });

    it("is itself the popover=manual surface (dismiss is self-managed)", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.getAttribute("popover")).to.equal("manual");
    });

    it("has role=tooltip", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.getAttribute("role")).to.equal("tooltip");
    });

    it("renders a .md-tooltip__surface wrapping the default slot", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.shadowRoot.querySelector(".md-tooltip__surface")).to.exist;
      expect(el.shadowRoot.querySelector("slot:not([name])")).to.exist;
    });

    it("defaults: placement=top, offset=4, flip=true, positioning=popover", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.placement).to.equal("top");
      expect(el.offset).to.equal(4);
      expect(el.flip).to.be.true;
      expect(el.positioning).to.equal("popover");
    });

    it("defaults showDelay=500 and hideDelay=300", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.showDelay).to.equal(500);
      expect(el.hideDelay).to.equal(300);
    });
  });

  // ─── for-attribute anchor resolution ────────────────────────────────────

  describe("for-attribute anchor resolution", () => {
    it("sets aria-describedby on the resolved trigger, generating an id if needed", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="tt-trigger">Hover me</button>
            <md-tooltip for="tt-trigger">Label</md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tt-trigger")
      );
      await tooltip.updateComplete;

      expect(tooltip.id).to.exist;
      expect(trigger.getAttribute("aria-describedby")).to.equal(tooltip.id);
    });

    it("removes aria-describedby from the trigger on disconnect", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="tt-trigger-remove">Hover me</button>
            <md-tooltip for="tt-trigger-remove">Label</md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tt-trigger-remove")
      );
      await tooltip.updateComplete;
      expect(trigger.hasAttribute("aria-describedby")).to.be.true;

      tooltip.remove();
      expect(trigger.hasAttribute("aria-describedby")).to.be.false;
    });

    it("appends to a pre-existing aria-describedby instead of clobbering it, and removes only its own token on disconnect", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <span id="tt-existing-desc">Existing description</span>
            <button
              id="tt-trigger-existing"
              aria-describedby="tt-existing-desc"
            >
              Hover me
            </button>
            <md-tooltip for="tt-trigger-existing">Label</md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#tt-trigger-existing")
      );
      await tooltip.updateComplete;

      const tokens = trigger.getAttribute("aria-describedby").split(/\s+/);
      expect(tokens).to.include("tt-existing-desc");
      expect(tokens).to.include(tooltip.id);
      expect(tokens.length).to.equal(2);

      tooltip.remove();

      expect(trigger.getAttribute("aria-describedby")).to.equal(
        "tt-existing-desc",
      );
    });
  });

  // ─── show/hide on hover with delay ──────────────────────────────────────

  describe("show/hide on hover with delay", () => {
    it("opens after showDelay on pointerenter and closes after hideDelay on pointerleave", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="hover-trigger">Hover me</button>
            <md-tooltip for="hover-trigger" show-delay="10" hide-delay="10">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#hover-trigger")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(new PointerEvent("pointerenter"));
      expect(tooltip.open).to.be.false;
      await tick();
      expect(tooltip.open).to.be.true;

      trigger.dispatchEvent(new PointerEvent("pointerleave"));
      await tick();
      expect(tooltip.open).to.be.false;
    });

    it("opens on focusin and closes on focusout", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="focus-trigger">Focus me</button>
            <md-tooltip for="focus-trigger" show-delay="10" hide-delay="10">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#focus-trigger")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      await tick();
      expect(tooltip.open).to.be.true;

      trigger.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      await tick();
      expect(tooltip.open).to.be.false;
    });

    it("re-entering before hideDelay elapses cancels the pending close", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="reenter-trigger">Hover me</button>
            <md-tooltip for="reenter-trigger" show-delay="10" hide-delay="40">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#reenter-trigger")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(new PointerEvent("pointerenter"));
      await tick();
      expect(tooltip.open).to.be.true;

      trigger.dispatchEvent(new PointerEvent("pointerleave"));
      await tick(10); // well before the 40ms hideDelay elapses
      trigger.dispatchEvent(new PointerEvent("pointerenter"));
      await tick(60);

      expect(tooltip.open).to.be.true;
    });
  });

  // ─── touch long-press ────────────────────────────────────────────────────

  describe("touch long-press", () => {
    it("a quick tap (pointerdown + pointerup) does not open the tooltip", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="touch-trigger-tap">Tap me</button>
            <md-tooltip for="touch-trigger-tap" show-delay="20">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#touch-trigger-tap")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerType: "touch",
          clientX: 0,
          clientY: 0,
        }),
      );
      trigger.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerType: "touch",
          clientX: 0,
          clientY: 0,
        }),
      );
      // Well past showDelay — proves pointerup actually cancelled the timer,
      // not that we just haven't waited long enough.
      await tick(50);

      expect(tooltip.open).to.be.false;
    });

    it("holding past the long-press threshold opens the tooltip", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="touch-trigger-hold">Press and hold</button>
            <md-tooltip for="touch-trigger-hold" show-delay="10">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#touch-trigger-hold")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerType: "touch",
          clientX: 0,
          clientY: 0,
        }),
      );
      await tick(30);

      expect(tooltip.open).to.be.true;
    });

    it("a drag past the movement tolerance cancels the pending long-press", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="touch-trigger-drag">Press and drag</button>
            <md-tooltip for="touch-trigger-drag" show-delay="10">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#touch-trigger-drag")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerType: "touch",
          clientX: 0,
          clientY: 0,
        }),
      );
      trigger.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerType: "touch",
          clientX: 50,
          clientY: 0,
        }),
      );
      await tick(30);

      expect(tooltip.open).to.be.false;
    });
  });

  // ─── show()/hide() imperative API ───────────────────────────────────────

  describe("show()/hide()", () => {
    it("show() opens immediately, bypassing showDelay", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="show-api-trigger">Anchor</button>
            <md-tooltip for="show-api-trigger" show-delay="10000">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      await tooltip.updateComplete;
      tooltip.show();
      expect(tooltip.open).to.be.true;
    });

    it("hide() closes immediately, bypassing hideDelay", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="hide-api-trigger">Anchor</button>
            <md-tooltip for="hide-api-trigger" hide-delay="10000">
              Label
            </md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      await tooltip.updateComplete;
      tooltip.show();
      expect(tooltip.open).to.be.true;
      tooltip.hide();
      expect(tooltip.open).to.be.false;
    });
  });

  // ─── Escape ──────────────────────────────────────────────────────────────

  describe("Escape", () => {
    it("closes an open tooltip", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="escape-trigger">Anchor</button>
            <md-tooltip for="escape-trigger">Label</md-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdTooltip} */ (el.querySelector("md-tooltip"));
      await tooltip.updateComplete;
      tooltip.show();
      expect(tooltip.open).to.be.true;
      // The window Escape listener is attached from the open-changed branch
      // of updated(), not for the whole connected lifetime (see fix #5) — it
      // isn't wired up until this update cycle completes.
      await tooltip.updateComplete;

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await tooltip.updateComplete;

      expect(tooltip.open).to.be.false;
    });

    it("does nothing when the tooltip is already closed", async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip>Label</md-tooltip>`)
      );
      expect(el.open).to.be.false;

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await el.updateComplete;

      expect(el.open).to.be.false;
    });
  });

  // ─── positioning ─────────────────────────────────────────────────────────

  describe("positioning", () => {
    it('positioning="fixed" does not set the popover attribute', async () => {
      const el = /** @type {MdTooltip} */ (
        await fixture(html`<md-tooltip positioning="fixed">Label</md-tooltip>`)
      );
      expect(el.hasAttribute("popover")).to.be.false;
      expect(getComputedStyle(el).position).to.equal("fixed");
    });
  });
});
