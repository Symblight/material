import { expect, fixture, html } from "@open-wc/testing";

import "../badge.ts";
import type { MdBadge } from "../badge.ts";

describe("md-badge", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a .badge element", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      expect(el.shadowRoot!.querySelector(".badge")).to.exist;
    });

    it("has role=status on the inner div", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.getAttribute("role")).to.equal("status");
    });
  });

  // ─── Small dot variant ────────────────────────────────────────────────────

  describe("small (dot) variant", () => {
    it("adds badge_small class when value is empty", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_small")).to.be.true;
    });

    it("does not add badge_large class when value is empty", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_large")).to.be.false;
    });

    it("renders no text content when value is empty", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("");
    });
  });

  // ─── Large (label) variant ────────────────────────────────────────────────

  describe("large (label) variant", () => {
    it("adds badge_large class when value is set", async () => {
      const el = await fixture<MdBadge>(html`<md-badge value="3"></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_large")).to.be.true;
    });

    it("does not add badge_small class when value is set", async () => {
      const el = await fixture<MdBadge>(html`<md-badge value="3"></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_small")).to.be.false;
    });

    it("displays the value as text", async () => {
      const el = await fixture<MdBadge>(html`<md-badge value="7"></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("7");
    });

    it("displays a string value", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="new"></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("new");
    });
  });

  // ─── Max truncation ───────────────────────────────────────────────────────

  describe("max truncation", () => {
    it("shows '{max}+' when numeric value exceeds max", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="1200" .max=${999}></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("999+");
    });

    it("shows value as-is when equal to max", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="999" .max=${999}></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("999");
    });

    it("shows value as-is when below max", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="42" .max=${999}></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("42");
    });

    it("respects a custom max value", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="100" .max=${99}></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.textContent!.trim()).to.equal("99+");
    });
  });

  // ─── Reactivity ───────────────────────────────────────────────────────────

  describe("reactivity", () => {
    it("switches from small to large when value is assigned", async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      el.value = "5";
      await el.updateComplete;
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_large")).to.be.true;
      expect(inner.textContent!.trim()).to.equal("5");
    });

    it("switches from large to small when value is cleared", async () => {
      const el = await fixture<MdBadge>(html`<md-badge value="5"></md-badge>`);
      el.value = "";
      await el.updateComplete;
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.classList.contains("badge_small")).to.be.true;
    });
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it('has aria-label="notification" when value is empty', async () => {
      const el = await fixture<MdBadge>(html`<md-badge></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.getAttribute("aria-label")).to.equal("notification");
    });

    it("sets aria-label to the displayed value", async () => {
      const el = await fixture<MdBadge>(html`<md-badge value="3"></md-badge>`);
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.getAttribute("aria-label")).to.equal("3");
    });

    it("sets aria-label to truncated value when overflow", async () => {
      const el = await fixture<MdBadge>(
        html`<md-badge value="1200" .max=${999}></md-badge>`,
      );
      const inner = el.shadowRoot!.querySelector(".badge")!;
      expect(inner.getAttribute("aria-label")).to.equal("999+");
    });
  });
});
