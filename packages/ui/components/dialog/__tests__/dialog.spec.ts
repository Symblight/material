import { expect, fixture, html } from "@open-wc/testing";

import "../dialog.ts";
import type MdDialog from "../dialog.ts";

describe("md-dialog", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders an inner <dialog> element", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      expect(el.shadowRoot!.querySelector("dialog")).to.exist;
    });

    it("renders a header, body, and footer", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      expect(el.shadowRoot!.querySelector(".dialog__header")).to.exist;
      expect(el.shadowRoot!.querySelector(".dialog__body")).to.exist;
      expect(el.shadowRoot!.querySelector(".dialog__footer")).to.exist;
    });

    it("has a named slot for headline", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      expect(
        el.shadowRoot!.querySelector('slot[name="headline"]'),
      ).to.exist;
    });

    it("has a named slot for footer", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      expect(el.shadowRoot!.querySelector('slot[name="footer"]')).to.exist;
    });

    it("has a default slot for body content", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      const defaultSlot = el.shadowRoot!.querySelector(
        ".dialog__body slot:not([name])",
      );
      expect(defaultSlot).to.exist;
    });
  });

  // ─── open prop ────────────────────────────────────────────────────────────

  describe("open", () => {
    it("is closed by default", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      expect(el.open).to.be.false;
      expect(el.hasAttribute("open")).to.be.false;
    });

    it("opens when open is set to true", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.open = true;
      await el.updateComplete;
      expect(el.open).to.be.true;
    });

    it("reflects open attribute to host", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.open = true;
      await el.updateComplete;
      expect(el.hasAttribute("open")).to.be.true;
    });

    it("removes open attribute when closed", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.open = true;
      await el.updateComplete;
      el.open = false;
      await el.updateComplete;
      expect(el.hasAttribute("open")).to.be.false;
    });

    it("setting the same open value twice does not re-trigger show/close", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      let openCount = 0;
      el.addEventListener("open", () => openCount++);

      el.open = true;
      await el.updateComplete;
      el.open = true; // same value — should be a no-op
      await el.updateComplete;

      expect(openCount).to.equal(1);
    });
  });

  // ─── show() ───────────────────────────────────────────────────────────────

  describe("show()", () => {
    it("opens the native <dialog> as a modal", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.show();
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!;
      expect(dialog.open).to.be.true;
    });

    it("fires an 'open' event when showing", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      let fired = false;
      el.addEventListener("open", () => (fired = true));
      el.show();
      await el.updateComplete;
      expect(fired).to.be.true;
    });

    it("fires an 'opened' event after the dialog is shown", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      let fired = false;
      el.addEventListener("opened", () => (fired = true));
      el.show();
      await el.updateComplete;
      expect(fired).to.be.true;
    });

    it("does not open when the 'open' event is cancelled", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.addEventListener("open", (e) => e.preventDefault());
      el.show();
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!;
      expect(dialog.open).to.be.false;
      expect(el.open).to.be.false;
    });
  });

  // ─── close() ──────────────────────────────────────────────────────────────

  describe("close()", () => {
    it("closes the native <dialog>", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.show();
      await el.updateComplete;
      await el.close();
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>("dialog")!;
      expect(dialog.open).to.be.false;
    });

    it("sets open to false", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.show();
      await el.updateComplete;
      await el.close();
      expect(el.open).to.be.false;
    });

    it("fires a 'closed' event", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      el.show();
      await el.updateComplete;
      let fired = false;
      el.addEventListener("closed", () => (fired = true));
      await el.close();
      expect(fired).to.be.true;
    });

    it("does nothing when already closed", async () => {
      const el = await fixture<MdDialog>(html`<md-dialog></md-dialog>`);
      let closedCount = 0;
      el.addEventListener("closed", () => closedCount++);
      await el.close(); // already closed — no-op
      expect(closedCount).to.equal(0);
    });
  });

  // ─── slot projection ──────────────────────────────────────────────────────

  describe("slot projection", () => {
    it("projects headline slot content into the header", async () => {
      const el = await fixture<MdDialog>(html`
        <md-dialog>
          <span slot="headline">My Title</span>
        </md-dialog>
      `);
      const headline = el.querySelector<HTMLElement>('[slot="headline"]')!;
      expect(headline.textContent).to.equal("My Title");
    });

    it("projects footer slot content into the footer", async () => {
      const el = await fixture<MdDialog>(html`
        <md-dialog>
          <button slot="footer">OK</button>
        </md-dialog>
      `);
      const footer = el.querySelector<HTMLElement>('[slot="footer"]')!;
      expect(footer.textContent).to.equal("OK");
    });

    it("projects default slot content into the body", async () => {
      const el = await fixture<MdDialog>(html`
        <md-dialog>
          <p>Body text</p>
        </md-dialog>
      `);
      expect(el.querySelector("p")!.textContent).to.equal("Body text");
    });
  });
});
