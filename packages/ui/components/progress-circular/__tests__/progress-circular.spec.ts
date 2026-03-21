import { expect, fixture, html } from "@open-wc/testing";

import "../progress-circular.ts";
import type MdProgressCircular from "../progress-circular.ts";

describe("md-progress-circular", () => {
  describe("rendering", () => {
    it("renders an SVG with class progress-circular__svg", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular></md-progress-circular>`,
      );
      const svg = el.shadowRoot!.querySelector("svg");
      expect(svg).to.exist;
      expect(svg!.classList.contains("progress-circular__svg")).to.be.true;
    });

    it("renders a circle with class progress-circular__circle", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular></md-progress-circular>`,
      );
      const circle = el.shadowRoot!.querySelector(".progress-circular__circle");
      expect(circle).to.exist;
    });

    it("circle has cx=50, cy=50, r=45", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular></md-progress-circular>`,
      );
      const circle = el.shadowRoot!.querySelector("circle")!;
      expect(circle.getAttribute("cx")).to.equal("50");
      expect(circle.getAttribute("cy")).to.equal("50");
      expect(circle.getAttribute("r")).to.equal("45");
    });
  });

  describe("accessibility", () => {
    it("sets aria-hidden=true on the host after first render", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular></md-progress-circular>`,
      );
      expect(el.getAttribute("aria-hidden")).to.equal("true");
    });

    it("does not override an existing aria-hidden attribute", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular aria-hidden="false"></md-progress-circular>`,
      );
      expect(el.getAttribute("aria-hidden")).to.equal("false");
    });

    it("SVG has focusable=false", async () => {
      const el = await fixture<MdProgressCircular>(
        html`<md-progress-circular></md-progress-circular>`,
      );
      const svg = el.shadowRoot!.querySelector("svg")!;
      expect(svg.getAttribute("focusable")).to.equal("false");
    });
  });
});
