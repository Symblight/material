import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";
import "../../button/button.js";

/** @import { MdRichTooltip } from "../rich-tooltip.js" */

/** @param {number} [ms] */
const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

describe("md-rich-tooltip", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`<md-rich-tooltip>Body</md-rich-tooltip>`)
      );
      expect(el).to.exist;
    });

    it("is itself the popover=manual surface", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`<md-rich-tooltip>Body</md-rich-tooltip>`)
      );
      expect(el.getAttribute("popover")).to.equal("manual");
    });

    it("has role=tooltip", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`<md-rich-tooltip>Body</md-rich-tooltip>`)
      );
      expect(el.getAttribute("role")).to.equal("tooltip");
    });

    it("renders a .md-rich-tooltip__card containing md-shadow and subhead/body/actions slots", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`<md-rich-tooltip>Body</md-rich-tooltip>`)
      );
      expect(el.shadowRoot.querySelector(".md-rich-tooltip__card")).to.exist;
      expect(el.shadowRoot.querySelector("md-shadow")).to.exist;
      expect(el.shadowRoot.querySelector('slot[name="subhead"]')).to.exist;
      expect(el.shadowRoot.querySelector("slot:not([name])")).to.exist;
      expect(el.shadowRoot.querySelector('slot[name="actions"]')).to.exist;
    });
  });

  // ─── Actions slot ────────────────────────────────────────────────────────

  describe("actions slot", () => {
    it("projects up to two text-button actions", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`
          <md-rich-tooltip>
            <span slot="subhead">Title</span>
            Body text
            <md-button slot="actions" variant="text">Undo</md-button>
            <md-button slot="actions" variant="text">Dismiss</md-button>
          </md-rich-tooltip>
        `)
      );
      await el.updateComplete;

      const actionsSlot = /** @type {HTMLSlotElement} */ (
        el.shadowRoot.querySelector('slot[name="actions"]')
      );
      expect(actionsSlot.assignedElements().length).to.equal(2);

      const subheadSlot = /** @type {HTMLSlotElement} */ (
        el.shadowRoot.querySelector('slot[name="subhead"]')
      );
      expect(subheadSlot.assignedElements().length).to.equal(1);
    });

    it("renders with no actions when none are slotted", async () => {
      const el = /** @type {MdRichTooltip} */ (
        await fixture(html`<md-rich-tooltip>Body only</md-rich-tooltip>`)
      );
      await el.updateComplete;

      const actionsSlot = /** @type {HTMLSlotElement} */ (
        el.shadowRoot.querySelector('slot[name="actions"]')
      );
      expect(actionsSlot.assignedElements().length).to.equal(0);
    });
  });

  // ─── Staying open while hovering the surface ────────────────────────────

  describe("staying open while hovering the surface", () => {
    it("does not close when the pointer moves from the anchor onto the surface", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="rich-trigger">Hover me</button>
            <md-rich-tooltip for="rich-trigger" show-delay="10" hide-delay="10">
              Body
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#rich-trigger")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(new PointerEvent("pointerenter"));
      await tick();
      expect(tooltip.open).to.be.true;

      // Pointer leaves the anchor (schedules a close) and immediately
      // enters the surface itself — the surface's own pointerenter should
      // cancel that pending close.
      trigger.dispatchEvent(new PointerEvent("pointerleave"));
      tooltip.dispatchEvent(new PointerEvent("pointerenter"));
      await tick();

      expect(tooltip.open).to.be.true;
    });

    it("closes once the pointer leaves the surface too", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="rich-trigger2">Hover me</button>
            <md-rich-tooltip
              for="rich-trigger2"
              show-delay="10"
              hide-delay="10"
            >
              Body
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#rich-trigger2")
      );
      await tooltip.updateComplete;

      trigger.dispatchEvent(new PointerEvent("pointerenter"));
      await tick();
      expect(tooltip.open).to.be.true;

      trigger.dispatchEvent(new PointerEvent("pointerleave"));
      tooltip.dispatchEvent(new PointerEvent("pointerenter"));
      await tick();
      expect(tooltip.open).to.be.true;

      tooltip.dispatchEvent(new PointerEvent("pointerleave"));
      await tick();
      expect(tooltip.open).to.be.false;
    });
  });

  // ─── Keyboard focus into action buttons ─────────────────────────────────

  describe("keyboard focus into action buttons", () => {
    it("does not close when focus Tabs from the anchor into an action button", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="kb-trigger">Anchor</button>
            <md-rich-tooltip for="kb-trigger" show-delay="10" hide-delay="10">
              Body
              <md-button slot="actions" variant="text" id="kb-action">
                Undo
              </md-button>
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#kb-trigger")
      );
      const action = /** @type {HTMLElement} */ (
        el.querySelector("#kb-action")
      );
      await tooltip.updateComplete;

      tooltip.show();
      expect(tooltip.open).to.be.true;

      // Tab forward from the anchor into the tooltip's own action button —
      // the anchor's focusout reports the action button as relatedTarget.
      trigger.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: action }),
      );
      // Wait well past hideDelay: before the fix, this scheduled a close
      // that fired here and yanked the surface away from under the focused
      // button.
      await tick(40);

      expect(tooltip.open).to.be.true;
    });

    it("still closes when focus leaves the anchor for something outside the tooltip", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="kb-trigger2">Anchor</button>
            <button id="kb-elsewhere">Elsewhere</button>
            <md-rich-tooltip for="kb-trigger2" show-delay="10" hide-delay="10">
              Body
              <md-button slot="actions" variant="text">Undo</md-button>
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#kb-trigger2")
      );
      const elsewhere = /** @type {HTMLElement} */ (
        el.querySelector("#kb-elsewhere")
      );
      await tooltip.updateComplete;

      tooltip.show();
      expect(tooltip.open).to.be.true;

      trigger.dispatchEvent(
        new FocusEvent("focusout", {
          bubbles: true,
          relatedTarget: elsewhere,
        }),
      );
      await tick(40);

      expect(tooltip.open).to.be.false;
    });
  });

  // ─── Focus return on dismiss ─────────────────────────────────────────────

  describe("focus return on dismiss", () => {
    it("returns focus to the anchor when Escape closes while focus is inside the surface", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="esc-trigger">Anchor</button>
            <md-rich-tooltip for="esc-trigger" show-delay="10" hide-delay="10">
              Body
              <md-button slot="actions" variant="text" id="esc-action">
                Undo
              </md-button>
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const trigger = /** @type {HTMLButtonElement} */ (
        el.querySelector("#esc-trigger")
      );
      const action = /** @type {HTMLElement} */ (
        el.querySelector("#esc-action")
      );
      await tooltip.updateComplete;

      tooltip.show();
      await tooltip.updateComplete;
      action.focus();
      expect(document.activeElement).to.equal(action);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await tooltip.updateComplete;

      expect(tooltip.open).to.be.false;
      expect(document.activeElement).to.equal(trigger);
    });

    it("does not move focus on hide() when focus was not inside the surface", async () => {
      const el = /** @type {HTMLElement} */ (
        await fixture(html`
          <div>
            <button id="hide-trigger">Anchor</button>
            <button id="hide-elsewhere">Elsewhere</button>
            <md-rich-tooltip for="hide-trigger" show-delay="10" hide-delay="10">
              Body
              <md-button slot="actions" variant="text">Undo</md-button>
            </md-rich-tooltip>
          </div>
        `)
      );
      const tooltip = /** @type {MdRichTooltip} */ (
        el.querySelector("md-rich-tooltip")
      );
      const elsewhere = /** @type {HTMLElement} */ (
        el.querySelector("#hide-elsewhere")
      );
      await tooltip.updateComplete;

      tooltip.show();
      elsewhere.focus();
      expect(document.activeElement).to.equal(elsewhere);

      tooltip.hide();

      expect(tooltip.open).to.be.false;
      expect(document.activeElement).to.equal(elsewhere);
    });
  });
});
