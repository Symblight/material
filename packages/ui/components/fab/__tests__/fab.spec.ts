import { expect, fixture, html } from "@open-wc/testing";

import "../fab.ts";
import type FAB from "../fab.ts";

describe("md-fab", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a <button> element by default", async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      expect(el.shadowRoot!.querySelector("button")).to.exist;
    });

    it("renders an <a> element when href is set", async () => {
      const el = await fixture<FAB>(html`<md-fab href="/home"></md-fab>`);
      const anchor = el.shadowRoot!.querySelector("a");
      expect(anchor).to.exist;
      expect(anchor!.getAttribute("href")).to.equal("/home");
    });

    it("renders md-shadow", async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      expect(el.shadowRoot!.querySelector("md-shadow")).to.exist;
    });
  });

  // ─── variant ──────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "surface"', async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      expect(el.variant).to.equal("surface");
    });

    for (const variant of ["surface", "primary", "secondary", "tertiary"] as const) {
      it(`sets variant="${variant}" attribute`, async () => {
        const el = await fixture<FAB>(html`<md-fab variant=${variant}></md-fab>`);
        expect(el.getAttribute("variant")).to.equal(variant);
      });
    }

    it('falls back to "surface" for an invalid variant', async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      (el as any).variant = "invalid";
      expect(el.variant).to.equal("surface");
    });
  });

  // ─── size ─────────────────────────────────────────────────────────────────

  describe("size", () => {
    it('defaults to "m"', async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      expect(el.size).to.equal("m");
    });

    for (const size of ["s", "m", "l"] as const) {
      it(`sets size="${size}" attribute`, async () => {
        const el = await fixture<FAB>(html`<md-fab size=${size}></md-fab>`);
        expect(el.getAttribute("size")).to.equal(size);
      });
    }

    it('falls back to "m" for an invalid size', async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      (el as any).size = "xl";
      expect(el.size).to.equal("m");
    });
  });

  // ─── label ────────────────────────────────────────────────────────────────

  describe("label", () => {
    it("renders label text inside the button", async () => {
      const el = await fixture<FAB>(html`<md-fab label="Create"></md-fab>`);
      const labelSpan = el.shadowRoot!.querySelector("#label")!;
      expect(labelSpan.textContent!.trim()).to.equal("Create");
    });

    it("adds button_label class when label is set", async () => {
      const el = await fixture<FAB>(html`<md-fab label="Create"></md-fab>`);
      const button = el.shadowRoot!.querySelector("button")!;
      expect(button.classList.contains("button_label")).to.be.true;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<FAB>(html`<md-fab></md-fab>`);
      expect(el.shadowRoot!.querySelector<HTMLButtonElement>("button")!.disabled)
        .to.be.false;
    });

    it("disables the inner button when disabled", async () => {
      const el = await fixture<FAB>(html`<md-fab disabled></md-fab>`);
      expect(el.shadowRoot!.querySelector<HTMLButtonElement>("button")!.disabled)
        .to.be.true;
    });

    it("adds button_disabled class when disabled", async () => {
      const el = await fixture<FAB>(html`<md-fab disabled></md-fab>`);
      const button = el.shadowRoot!.querySelector("button")!;
      expect(button.classList.contains("button_disabled")).to.be.true;
    });
  });
});
