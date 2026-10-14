import { expect, fixture, html } from "@open-wc/testing";
import { emulateMedia } from "@web/test-runner-commands";

import "../shadow.js";
/** @import MdShadow from "../shadow.js" */

/**
 * @param {string} [style] inline style for the positioned container
 */
async function setup(style = "") {
  const container = /** @type {HTMLDivElement} */ (
    await fixture(html`
      <div style="position: relative; width: 200px; height: 100px; ${style}">
        <md-shadow></md-shadow>
        <button id="content">Content</button>
      </div>
    `)
  );
  const shadow = /** @type {MdShadow} */ (container.querySelector("md-shadow"));
  await shadow.updateComplete;
  const span = /** @type {HTMLSpanElement} */ (
    shadow.shadowRoot?.querySelector(".shadow")
  );
  return { container, shadow, span };
}

/**
 * MD3 elevation tokens: [key (::before), ambient (::after)] as
 * "y blur spread" in px, both with x = 0.
 * @type {Record<number, [string, string]>}
 */
const MD3_LEVELS = {
  1: ["1px 2px 0px", "1px 3px 1px"],
  2: ["1px 2px 0px", "2px 6px 2px"],
  3: ["1px 3px 0px", "4px 8px 3px"],
  4: ["2px 3px 0px", "6px 10px 4px"],
  5: ["4px 4px 0px", "8px 12px 6px"],
};

describe("md-shadow", () => {
  describe("rendering", () => {
    it("renders a .shadow span", async () => {
      const { span } = await setup();
      expect(span).to.exist;
    });

    it("fills its positioned container", async () => {
      const { container, shadow } = await setup();
      const outer = container.getBoundingClientRect();
      const inner = shadow.getBoundingClientRect();
      expect(inner.width).to.equal(outer.width);
      expect(inner.height).to.equal(outer.height);
    });
  });

  describe("pointer events", () => {
    it("does not intercept clicks on sibling content", async () => {
      const { container } = await setup();
      const button = /** @type {HTMLButtonElement} */ (
        container.querySelector("#content")
      );
      const r = button.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      // Compare tag names: a chai diff of two DOM elements hangs the runner.
      expect(hit?.tagName).to.equal("BUTTON");
    });
  });

  describe("elevation levels", () => {
    for (const [level, [key, ambient]] of Object.entries(MD3_LEVELS)) {
      it(`matches MD3 tokens at level ${level}`, async () => {
        const { span } = await setup(`--md-elevation-level: ${level}`);
        expect(getComputedStyle(span, "::before").boxShadow).to.contain(
          `0px ${key}`,
        );
        expect(getComputedStyle(span, "::after").boxShadow).to.contain(
          `0px ${ambient}`,
        );
      });
    }

    it("renders no visible shadow at level 0", async () => {
      const { span } = await setup("--md-elevation-level: 0");
      expect(getComputedStyle(span, "::after").boxShadow).to.contain(
        "0px 0px 0px 0px",
      );
    });
  });

  describe("level attribute", () => {
    /** @param {MdShadow} shadow */
    function ambient(shadow) {
      const span = /** @type {HTMLSpanElement} */ (
        shadow.shadowRoot?.querySelector(".shadow")
      );
      return getComputedStyle(span, "::after").boxShadow;
    }

    it("reflects the level property to the attribute", async () => {
      const { shadow } = await setup();
      shadow.level = 4;
      await shadow.updateComplete;
      expect(shadow.getAttribute("level")).to.equal("4");
    });

    it("renders the level set by the attribute", async () => {
      const { shadow } = await setup();
      shadow.setAttribute("level", "3");
      await shadow.updateComplete;
      expect(ambient(shadow)).to.contain(`0px ${MD3_LEVELS[3][1]}`);
    });

    it("overrides an inherited --md-elevation-level", async () => {
      const { shadow } = await setup("--md-elevation-level: 5");
      shadow.level = 1;
      await shadow.updateComplete;
      expect(ambient(shadow)).to.contain(`0px ${MD3_LEVELS[1][1]}`);
    });

    it("falls back to --md-elevation-level when removed", async () => {
      const { shadow } = await setup("--md-elevation-level: 2");
      shadow.level = 5;
      await shadow.updateComplete;
      shadow.removeAttribute("level");
      await shadow.updateComplete;
      expect(ambient(shadow)).to.contain(`0px ${MD3_LEVELS[2][1]}`);
    });

    it("ignores an internal override variable set by an ancestor", async () => {
      const { shadow } = await setup(
        "--md-elevation-level: 2; --_shadow-level-attr: 5",
      );
      expect(ambient(shadow)).to.contain(`0px ${MD3_LEVELS[2][1]}`);
    });
  });

  describe("color", () => {
    it("defaults to black without a theme", async () => {
      const { span } = await setup("--md-elevation-level: 1");
      expect(getComputedStyle(span, "::after").boxShadow).to.match(
        /^rgb\(0, 0, 0\)/,
      );
    });

    it("uses --md-sys-color-shadow from the theme", async () => {
      const { span } = await setup(
        "--md-elevation-level: 1; --md-sys-color-shadow: rgb(255, 0, 0)",
      );
      expect(getComputedStyle(span, "::after").boxShadow).to.match(
        /^rgb\(255, 0, 0\)/,
      );
    });

    it("inherits --md-shadow-color from an ancestor over the theme", async () => {
      const { span } = await setup(
        "--md-elevation-level: 1; --md-sys-color-shadow: rgb(255, 0, 0); --md-shadow-color: rgb(0, 0, 255)",
      );
      expect(getComputedStyle(span, "::after").boxShadow).to.match(
        /^rgb\(0, 0, 255\)/,
      );
    });
  });

  describe("transitions", () => {
    afterEach(() => emulateMedia({ reducedMotion: "no-preference" }));

    it("transitions only box-shadow", async () => {
      const { span } = await setup();
      const after = getComputedStyle(span, "::after");
      expect(after.transitionProperty).to.equal("box-shadow");
      expect(after.transitionDuration).to.equal("0.28s");
    });

    it("drops the transition under prefers-reduced-motion", async () => {
      await emulateMedia({ reducedMotion: "reduce" });
      const { span } = await setup();
      expect(getComputedStyle(span, "::after").transitionDuration).to.equal(
        "0s",
      );
    });
  });
});
