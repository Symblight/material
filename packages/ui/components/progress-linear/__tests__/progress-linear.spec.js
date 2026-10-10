import { expect, fixture, html } from "@open-wc/testing";

import MdProgressLinear from "../progress-linear.js";

describe("md-progress-linear", () => {
  describe("rendering — indeterminate (default)", () => {
    it("renders the track element", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      const track = el.shadowRoot.querySelector(".progress-linear__track");
      expect(track).to.exist;
    });

    it("renders two animated bars for indeterminate", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      const primary = el.shadowRoot.querySelector(
        ".progress-linear__bar_primary",
      );
      const secondary = el.shadowRoot.querySelector(
        ".progress-linear__bar_secondary",
      );
      expect(primary).to.exist;
      expect(secondary).to.exist;
    });

    it("does not render the active indicator in indeterminate mode", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      const indicator = el.shadowRoot.querySelector(
        ".progress-linear__active-indicator",
      );
      expect(indicator).to.not.exist;
    });
  });

  describe("rendering — determinate", () => {
    it("renders the active indicator when value is set", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
        )
      );
      const indicator = el.shadowRoot.querySelector(
        ".progress-linear__active-indicator",
      );
      expect(indicator).to.exist;
    });

    it("renders the stop indicator when value is set", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
        )
      );
      const stopIndicator = el.shadowRoot.querySelector(
        ".progress-linear__stop-indicator",
      );
      expect(stopIndicator).to.exist;
    });

    it("does not render indeterminate bars when value is set", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
        )
      );
      const bar = el.shadowRoot.querySelector(".progress-linear__bar");
      expect(bar).to.not.exist;
    });

    it("clamps value above 1 to 1", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${1.5}></md-progress-linear>`,
        )
      );
      const container = /** @type {HTMLElement} */ (
        el.shadowRoot.querySelector(".progress-linear")
      );
      expect(
        container.style.getPropertyValue("--_progress-linear-value"),
      ).to.equal("1");
    });

    it("clamps value below 0 to 0", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${-0.5}></md-progress-linear>`,
        )
      );
      const container = /** @type {HTMLElement} */ (
        el.shadowRoot.querySelector(".progress-linear")
      );
      expect(
        container.style.getPropertyValue("--_progress-linear-value"),
      ).to.equal("0");
    });
  });

  describe("invalid values", () => {
    it("treats a non-numeric value attribute as indeterminate", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear value="abc"></md-progress-linear>`,
        )
      );
      expect(el.shadowRoot.querySelector(".progress-linear__bar_primary")).to
        .exist;
      expect(el.shadowRoot.querySelector(".progress-linear__active-indicator"))
        .to.not.exist;
    });

    it("switches back to indeterminate when the attribute is removed", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear value="0.3"></md-progress-linear>`,
        )
      );
      el.removeAttribute("value");
      await el.updateComplete;
      expect(el.shadowRoot.querySelector(".progress-linear__bar_primary")).to
        .exist;
    });
  });

  describe("styles", () => {
    it("renders the stop indicator as a 4px circle", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear
            .value=${0.5}
            style="--md-progress-linear-track-height: 8px"
          ></md-progress-linear>`,
        )
      );
      const stop = el.shadowRoot.querySelector(
        ".progress-linear__stop-indicator",
      );
      const rect = stop.getBoundingClientRect();
      expect(rect.width).to.equal(4);
      expect(rect.height).to.equal(4);
      expect(getComputedStyle(stop).borderRadius).to.equal("50%");
    });

    it("holds the secondary bar at its first keyframe during the delay", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      const bar = el.shadowRoot.querySelector(
        ".progress-linear__bar_secondary",
      );
      expect(getComputedStyle(bar).animationFillMode).to.equal("backwards");
    });

    it("anchors the active indicator to the inline start in RTL", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear
            dir="rtl"
            .value=${0.25}
            style="width: 200px"
          ></md-progress-linear>`,
        )
      );
      const host = el.getBoundingClientRect();
      const active = el.shadowRoot
        .querySelector(".progress-linear__active-indicator")
        .getBoundingClientRect();
      const stop = el.shadowRoot
        .querySelector(".progress-linear__stop-indicator")
        .getBoundingClientRect();
      expect(active.right).to.equal(host.right);
      expect(stop.left).to.equal(host.left);
    });
  });

  describe("accessibility", () => {
    /** @type {WeakMap<HTMLElement, ElementInternals>} */
    const internalsByElement = new WeakMap();
    const { attachInternals } = HTMLElement.prototype;
    MdProgressLinear.prototype.attachInternals = function () {
      const internals = attachInternals.call(this);
      internalsByElement.set(this, internals);
      return internals;
    };

    it("has role progressbar and is not aria-hidden", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      expect(el.hasAttribute("aria-hidden")).to.be.false;
      expect(internalsByElement.get(el).role).to.equal("progressbar");
    });

    it("exposes value, min and max when determinate", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${0.4}></md-progress-linear>`,
        )
      );
      const internals = internalsByElement.get(el);
      expect(internals.ariaValueNow).to.equal("0.4");
      expect(internals.ariaValueMin).to.equal("0");
      expect(internals.ariaValueMax).to.equal("1");
    });

    it("exposes the clamped value", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear .value=${1.5}></md-progress-linear>`,
        )
      );
      expect(internalsByElement.get(el).ariaValueNow).to.equal("1");
    });

    it("omits value, min and max when indeterminate", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(html`<md-progress-linear></md-progress-linear>`)
      );
      const internals = internalsByElement.get(el);
      expect(internals.ariaValueNow).to.be.null;
      expect(internals.ariaValueMin).to.be.null;
      expect(internals.ariaValueMax).to.be.null;
    });

    it("clears the value when switched back to indeterminate", async () => {
      const el = /** @type {MdProgressLinear} */ (
        await fixture(
          html`<md-progress-linear value="0.5"></md-progress-linear>`,
        )
      );
      el.removeAttribute("value");
      await el.updateComplete;
      expect(internalsByElement.get(el).ariaValueNow).to.be.null;
    });
  });
});
