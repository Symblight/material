import { expect, fixture, html } from "@open-wc/testing";

import "../avatar.ts";
import type Avatar from "../avatar.ts";

describe("md-avatar", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an SVG root element", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const svg = el.shadowRoot!.querySelector("svg");
      expect(svg).to.exist;
      expect(svg!.classList.contains("avatar")).to.be.true;
    });

    it("SVG has aria-hidden=true", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const svg = el.shadowRoot!.querySelector("svg")!;
      expect(svg.getAttribute("aria-hidden")).to.equal("true");
    });

    it('SVG has role="none"', async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const svg = el.shadowRoot!.querySelector("svg")!;
      expect(svg.getAttribute("role")).to.equal("none");
    });

    it("renders a <mask> with id md-avatar", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const mask = el.shadowRoot!.querySelector("mask");
      expect(mask).to.exist;
      expect(mask!.id).to.equal("md-avatar");
    });

    it("renders an <image> element", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const image = el.shadowRoot!.querySelector("image");
      expect(image).to.exist;
    });

    it("renders a <circle> element", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const circle = el.shadowRoot!.querySelector(".avatar__circle");
      expect(circle).to.exist;
    });
  });

  // ─── src prop ─────────────────────────────────────────────────────────────

  describe("src", () => {
    it("sets the image href to the src value", async () => {
      const src = "https://example.com/avatar.jpg";
      const el = await fixture<Avatar>(
        html`<md-avatar src=${src}></md-avatar>`,
      );
      const image = el.shadowRoot!.querySelector("image")!;
      expect(image.getAttribute("href")).to.equal(src);
    });

    it("fills the circle with gray when no src is set", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const circle =
        el.shadowRoot!.querySelector<SVGCircleElement>(".avatar__circle")!;
      expect(circle.getAttribute("fill")).to.equal("gray");
    });

    it('fills the circle with "none" when src is set', async () => {
      const el = await fixture<Avatar>(
        html`<md-avatar src="https://example.com/avatar.jpg"></md-avatar>`,
      );
      const circle =
        el.shadowRoot!.querySelector<SVGCircleElement>(".avatar__circle")!;
      expect(circle.getAttribute("fill")).to.equal("none");
    });

    it("updates image href when src changes", async () => {
      const el = await fixture<Avatar>(
        html`<md-avatar src="https://example.com/a.jpg"></md-avatar>`,
      );
      el.src = "https://example.com/b.jpg";
      await el.updateComplete;

      const image = el.shadowRoot!.querySelector("image")!;
      expect(image.getAttribute("href")).to.equal("https://example.com/b.jpg");
    });

    it("switches circle fill from none to gray when src is cleared", async () => {
      const el = await fixture<Avatar>(
        html`<md-avatar src="https://example.com/avatar.jpg"></md-avatar>`,
      );
      el.src = undefined;
      await el.updateComplete;

      const circle =
        el.shadowRoot!.querySelector<SVGCircleElement>(".avatar__circle")!;
      expect(circle.getAttribute("fill")).to.equal("gray");
    });
  });

  // ─── SVG geometry ─────────────────────────────────────────────────────────

  describe("geometry", () => {
    it("circle cx, cy, r derive from --md-avatar-size CSS custom property", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const circle =
        el.shadowRoot!.querySelector<SVGCircleElement>(".avatar__circle")!;
      // Default --md-avatar-size is 26px → cx=cy=r=26
      const cx = Number(circle.getAttribute("cx"));
      const cy = Number(circle.getAttribute("cy"));
      const r = Number(circle.getAttribute("r"));
      expect(cx).to.be.greaterThan(0);
      expect(cy).to.be.greaterThan(0);
      expect(r).to.be.greaterThan(0);
      expect(cx).to.equal(cy);
      expect(cy).to.equal(r);
    });

    it("image preserves aspect ratio with xMidYMid slice", async () => {
      const el = await fixture<Avatar>(html`<md-avatar></md-avatar>`);
      const image = el.shadowRoot!.querySelector("image")!;
      expect(image.getAttribute("preserveAspectRatio")).to.equal(
        "xMidYMid slice",
      );
    });
  });
});
