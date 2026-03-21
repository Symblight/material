import { expect, fixture, html } from "@open-wc/testing";

import "../button.ts";
import type Button from "../button.ts";

describe("md-button", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a <button> element by default", async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      const inner = el.shadowRoot!.querySelector("button");
      expect(inner).to.exist;
    });

    it("renders an <a> element when href is set", async () => {
      const el = await fixture<Button>(
        html`<md-button href="/home">Link</md-button>`,
      );
      const anchor = el.shadowRoot!.querySelector("a");
      expect(anchor).to.exist;
      expect(anchor!.getAttribute("href")).to.equal("/home");
    });

    it("renders slot content as the label", async () => {
      const el = await fixture<Button>(html`<md-button>Click me</md-button>`);
      expect(el).to.have.text("Click me");
    });
  });

  // ─── Variants ─────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "filled"', async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      expect(el.getAttribute("variant")).to.equal("filled");
    });

    for (const variant of [
      "filled",
      "outlined",
      "text",
      "elevated",
      "tonal",
    ] as const) {
      it(`sets variant="${variant}" attribute`, async () => {
        const el = await fixture<Button>(
          html`<md-button variant=${variant}>Label</md-button>`,
        );
        expect(el.getAttribute("variant")).to.equal(variant);
      });
    }

    it('falls back to "filled" for an invalid variant', async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      (el as any).variant = "invalid-variant";
      expect(el.getAttribute("variant")).to.equal("filled");
    });
  });

  // ─── Disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      const inner = el.shadowRoot!.querySelector("button")!;
      expect(inner.disabled).to.be.false;
    });

    it("disables the inner button when disabled prop is set", async () => {
      const el = await fixture<Button>(
        html`<md-button disabled>Label</md-button>`,
      );
      const inner = el.shadowRoot!.querySelector("button")!;
      expect(inner.disabled).to.be.true;
    });
  });

  // ─── Loading ──────────────────────────────────────────────────────────────

  describe("loading", () => {
    it("shows md-progress-circular when loading", async () => {
      const el = await fixture<Button>(
        html`<md-button loading>Label</md-button>`,
      );
      const progress = el.shadowRoot!.querySelector("md-progress-circular");
      expect(progress).to.exist;
    });

    it("does not show md-progress-circular when not loading", async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      const progress = el.shadowRoot!.querySelector("md-progress-circular");
      expect(progress).to.not.exist;
    });

    it("sets aria-busy=true on the inner button when loading", async () => {
      const el = await fixture<Button>(
        html`<md-button loading>Label</md-button>`,
      );
      const inner = el.shadowRoot!.querySelector("button")!;
      expect(inner.getAttribute("aria-busy")).to.equal("true");
    });

    it("sets aria-busy=false on the inner button when not loading", async () => {
      const el = await fixture<Button>(html`<md-button>Label</md-button>`);
      const inner = el.shadowRoot!.querySelector("button")!;
      expect(inner.getAttribute("aria-busy")).to.equal("false");
    });
  });

  // ─── Form submission ──────────────────────────────────────────────────────

  describe("form submission", () => {
    it("submits the closest form when type=submit", async () => {
      let submitted = false;
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-button type="submit">Submit</md-button>
        </form>
      `);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitted = true;
      });

      const button = form.querySelector("md-button") as Button;
      button.click();
      expect(submitted).to.be.true;
    });

    it("does not submit the form when type=button", async () => {
      let submitted = false;
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <md-button type="button">Click</md-button>
        </form>
      `);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitted = true;
      });

      const button = form.querySelector("md-button") as Button;
      button.click();
      expect(submitted).to.be.false;
    });
  });
});
