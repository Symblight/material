import { expect, fixture, html } from "@open-wc/testing";

import "../ripple.ts";
import type MdRipple from "../ripple.ts";

async function setupWithFor() {
  const container = await fixture<HTMLDivElement>(html`
    <div>
      <button id="target">Button</button>
      <md-ripple for="target"></md-ripple>
    </div>
  `);
  const ripple = container.querySelector("md-ripple") as MdRipple;
  const target = container.querySelector("#target") as HTMLButtonElement;
  return { ripple, target };
}

describe("md-ripple", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a surface div", async () => {
      const el = await fixture<MdRipple>(html`<md-ripple></md-ripple>`);
      const surface = el.shadowRoot!.querySelector("div.surface");
      expect(surface).to.exist;
    });

    it("has no pressed or hovered classes initially", async () => {
      const el = await fixture<MdRipple>(html`<md-ripple></md-ripple>`);
      const surface = el.shadowRoot!.querySelector("div")!;
      expect(surface.classList.contains("surface_pressed")).to.be.false;
      expect(surface.classList.contains("surface_hovered")).to.be.false;
    });
  });

  // ─── Hover state ──────────────────────────────────────────────────────────

  describe("hover state", () => {
    it("sets hovered=true on pointerenter", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      await ripple.updateComplete;
      expect(ripple.hovered).to.be.true;
    });

    it("sets hovered=false on pointerleave", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      await ripple.updateComplete;
      target.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      await ripple.updateComplete;
      expect(ripple.hovered).to.be.false;
    });

    it("adds surface_hovered class on pointerenter", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      await ripple.updateComplete;
      const surface = ripple.shadowRoot!.querySelector("div")!;
      expect(surface.classList.contains("surface_hovered")).to.be.true;
    });

    it("removes surface_hovered class on pointerleave", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      await ripple.updateComplete;
      target.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      await ripple.updateComplete;
      const surface = ripple.shadowRoot!.querySelector("div")!;
      expect(surface.classList.contains("surface_hovered")).to.be.false;
    });
  });

  // ─── Press state ──────────────────────────────────────────────────────────

  describe("press state", () => {
    it("sets pressed=true on pointerdown", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await ripple.updateComplete;
      expect(ripple.pressed).to.be.true;
    });

    it("sets pressed=false on pointerup", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await ripple.updateComplete;
      target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      await ripple.updateComplete;
      expect(ripple.pressed).to.be.false;
    });

    it("adds surface_pressed class on pointerdown", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await ripple.updateComplete;
      const surface = ripple.shadowRoot!.querySelector("div")!;
      expect(surface.classList.contains("surface_pressed")).to.be.true;
    });

    it("removes surface_pressed class on pointerup", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await ripple.updateComplete;
      target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      await ripple.updateComplete;
      const surface = ripple.shadowRoot!.querySelector("div")!;
      expect(surface.classList.contains("surface_pressed")).to.be.false;
    });

    it("creates rippleAnimation on pointerdown", async () => {
      const { ripple, target } = await setupWithFor();
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await ripple.updateComplete;
      expect(ripple.rippleAnimation).to.not.be.undefined;
    });
  });
});
