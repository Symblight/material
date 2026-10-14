import { expect, fixture, html } from "@open-wc/testing";

import "../ripple.js";
/** @import MdRipple from "../ripple.js" */

/**
 * @param {import("lit").TemplateResult} [template]
 */
async function setupWithFor(
  template = html`
    <div>
      <button id="target">Button</button>
      <md-ripple for="target"></md-ripple>
    </div>
  `,
) {
  const container = /** @type {HTMLDivElement} */ (await fixture(template));
  const ripple = /** @type {MdRipple} */ (container.querySelector("md-ripple"));
  const target = /** @type {HTMLButtonElement} */ (
    container.querySelector("#target")
  );
  await ripple.updateComplete;
  return { container, ripple, target };
}

/** @param {MdRipple} ripple */
function surfaceOf(ripple) {
  return /** @type {HTMLDivElement} */ (
    ripple.shadowRoot?.querySelector("div.surface")
  );
}

/**
 * Scripted (WAAPI) ripple animations — excludes CSS state-layer transitions.
 * @param {MdRipple} ripple
 */
function rippleAnimations(ripple) {
  return surfaceOf(ripple)
    .getAnimations({ subtree: true })
    .filter((a) => !(a instanceof CSSTransition));
}

/** @param {MdRipple} ripple */
function isPressed(ripple) {
  return surfaceOf(ripple).classList.contains("surface_pressed");
}

/** @param {MdRipple} ripple */
function isHovered(ripple) {
  return surfaceOf(ripple).classList.contains("surface_hovered");
}

/**
 * @param {EventTarget} target
 * @param {string} type
 * @param {PointerEventInit} [init]
 */
function pointer(target, type, init = {}) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, button: 0, ...init }),
  );
}

class RippleTestHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `<md-ripple></md-ripple>`;
  }
}
customElements.define("ripple-test-host", RippleTestHost);

describe("md-ripple", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a surface div", async () => {
      const el = /** @type {MdRipple} */ (
        await fixture(html`<md-ripple></md-ripple>`)
      );
      expect(surfaceOf(el)).to.exist;
    });

    it("has no pressed or hovered classes initially", async () => {
      const el = /** @type {MdRipple} */ (
        await fixture(html`<md-ripple></md-ripple>`)
      );
      expect(isPressed(el)).to.be.false;
      expect(isHovered(el)).to.be.false;
    });

    it("does not expose internal state as public properties", async () => {
      const el = /** @type {any} */ (
        await fixture(html`<md-ripple></md-ripple>`)
      );
      for (const name of [
        "pressed",
        "hovered",
        "rippleAnimation",
        "myController",
        "createRipple",
        "endRipple",
        "onControlChange",
        "handleEvent",
      ]) {
        expect(el[name], name).to.be.undefined;
      }
    });
  });

  // ─── Hover state ──────────────────────────────────────────────────────────

  describe("hover state", () => {
    it("adds surface_hovered class on pointerenter", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerenter");
      await ripple.updateComplete;
      expect(isHovered(ripple)).to.be.true;
    });

    it("removes surface_hovered class on pointerleave", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerenter");
      await ripple.updateComplete;
      pointer(target, "pointerleave");
      await ripple.updateComplete;
      expect(isHovered(ripple)).to.be.false;
    });
  });

  // ─── Press state ──────────────────────────────────────────────────────────

  describe("press state", () => {
    it("adds surface_pressed class on pointerdown", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.true;
    });

    it("removes surface_pressed class on pointerup", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      pointer(target, "pointerup");
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
    });

    it("starts a ripple animation on pointerdown", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      expect(rippleAnimations(ripple)).to.have.length(1);
    });

    it("clears pressed on pointercancel", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      pointer(target, "pointercancel");
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
    });

    it("clears pressed when the pointer leaves while held", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerenter");
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      pointer(target, "pointerleave");
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
      expect(isHovered(ripple)).to.be.false;
    });

    it("ignores non-primary mouse buttons", async () => {
      const { ripple, target } = await setupWithFor();
      pointer(target, "pointerdown", { button: 2 });
      pointer(target, "pointerdown", { button: 1 });
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
      expect(rippleAnimations(ripple)).to.have.length(0);
    });

    it("ignores events from a disabled control", async () => {
      const { ripple, target } = await setupWithFor(html`
        <div>
          <button id="target" disabled>Button</button>
          <md-ripple for="target"></md-ripple>
        </div>
      `);
      pointer(target, "pointerenter");
      pointer(target, "pointerdown");
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
      expect(isHovered(ripple)).to.be.false;
    });

    it("keeps the ripple anchored at left in RTL", async () => {
      const { ripple, target } = await setupWithFor(html`
        <div dir="rtl" style="position: relative; width: 200px; height: 100px">
          <button id="target">Button</button>
          <md-ripple for="target"></md-ripple>
        </div>
      `);
      pointer(target, "pointerdown", { clientX: 10, clientY: 10 });
      await ripple.updateComplete;
      const surface = surfaceOf(ripple);
      rippleAnimations(ripple)[0].finish();
      // An over-constrained box (left + right + width all set) drops `left`
      // in RTL and grows from the wrong edge; Chromium then reports the
      // specified right: 0px, so the three no longer add up.
      const after = getComputedStyle(surface, "::after");
      const sum =
        parseFloat(after.left) +
        parseFloat(after.width) +
        parseFloat(after.right);
      expect(after.left).to.equal("0px");
      expect(sum).to.be.closeTo(surface.clientWidth, 0.5);
    });
  });

  // ─── Control resolution ───────────────────────────────────────────────────

  describe("control resolution", () => {
    it("attaches to the parent element when there is no `for`", async () => {
      const parent = /** @type {HTMLDivElement} */ (
        await fixture(html`<div><md-ripple></md-ripple></div>`)
      );
      const ripple = /** @type {MdRipple} */ (
        parent.querySelector("md-ripple")
      );
      pointer(parent, "pointerenter");
      pointer(parent, "pointerdown");
      await ripple.updateComplete;
      expect(isHovered(ripple)).to.be.true;
      expect(isPressed(ripple)).to.be.true;
    });

    it("does not react to events elsewhere in the document", async () => {
      const container = /** @type {HTMLDivElement} */ (
        await fixture(html`
          <div>
            <div><md-ripple></md-ripple></div>
            <button id="other">Other</button>
          </div>
        `)
      );
      const ripple = /** @type {MdRipple} */ (
        container.querySelector("md-ripple")
      );
      pointer(
        /** @type {HTMLElement} */ (container.querySelector("#other")),
        "pointerdown",
      );
      await ripple.updateComplete;
      expect(isPressed(ripple)).to.be.false;
    });

    it("attaches to the shadow host when placed directly in a shadow root", async () => {
      const host = /** @type {RippleTestHost} */ (
        await fixture(html`<ripple-test-host></ripple-test-host>`)
      );
      const ripple = /** @type {MdRipple} */ (
        host.shadowRoot?.querySelector("md-ripple")
      );
      await ripple.updateComplete;
      pointer(host, "pointerenter");
      await ripple.updateComplete;
      expect(isHovered(ripple)).to.be.true;
    });

    it("stops listening after disconnect", async () => {
      const { container, ripple, target } = await setupWithFor();
      ripple.remove();
      pointer(target, "pointerenter");
      pointer(target, "pointerdown");
      container.append(ripple);
      await ripple.updateComplete;
      expect(isHovered(ripple)).to.be.false;
      expect(isPressed(ripple)).to.be.false;
    });
  });
});
