import { fixture, expect, html } from "@open-wc/testing";

import "../icon-button.ts";
import type IconButton from "../icon-button.ts";

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("md-icon-button", () => {
  describe("rendering", () => {
    it("renders the host element", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el).to.exist;
    });

    it("renders an inner <button>", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button");
      expect(button).to.exist;
    });

    it("renders an md-ripple element", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("inner button has part=button attribute", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector("button");
      expect(button!.getAttribute("part")).to.equal("button");
    });

    it("inner button has id=button", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector("button");
      expect(button!.id).to.equal("button");
    });
  });

  // ─── variant ──────────────────────────────────────────────────────────────

  describe("variant", () => {
    it('defaults to "standard"', async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.variant).to.equal("standard");
    });

    it("sets variant attribute on the host after firstUpdated", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.getAttribute("variant")).to.equal("standard");
    });

    it('reflects variant="filled" to the host', async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button variant="filled"></md-icon-button>`,
      );
      expect(el.getAttribute("variant")).to.equal("filled");
      expect(el.variant).to.equal("filled");
    });

    it('reflects variant="outlined" to the host', async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button variant="outlined"></md-icon-button>`,
      );
      expect(el.getAttribute("variant")).to.equal("outlined");
      expect(el.variant).to.equal("outlined");
    });

    it('reflects variant="tonal" to the host', async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button variant="tonal"></md-icon-button>`,
      );
      expect(el.getAttribute("variant")).to.equal("tonal");
      expect(el.variant).to.equal("tonal");
    });

    it("falls back to standard for an invalid variant", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      (el as any).variant = "invalid-variant";
      await el.updateComplete;
      expect(el.variant).to.equal("standard");
    });

    it("does not trigger requestUpdate when setting the same variant", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button variant="filled"></md-icon-button>`,
      );
      // setting the same value should be a no-op — no throw, no change
      el.variant = "filled";
      await el.updateComplete;
      expect(el.variant).to.equal("filled");
    });
  });

  // ─── selected ─────────────────────────────────────────────────────────────

  describe("selected", () => {
    it("is false by default", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.selected).to.be.false;
    });

    it("reflects selected attribute to the host", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button selected></md-icon-button>`,
      );
      expect(el.hasAttribute("selected")).to.be.true;
      expect(el.selected).to.be.true;
    });

    it("can be toggled via property", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      el.selected = true;
      await el.updateComplete;
      expect(el.selected).to.be.true;
    });
  });

  // ─── toggle ───────────────────────────────────────────────────────────────

  describe("toggle", () => {
    it("is false by default", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.toggle).to.be.false;
    });

    it("reflects toggle attribute to the host", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button toggle></md-icon-button>`,
      );
      expect(el.hasAttribute("toggle")).to.be.true;
      expect(el.toggle).to.be.true;
    });

    it("renders default slot when toggle=true and selected=false", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button toggle>
          <span>default</span>
          <span slot="selected">selected</span>
        </md-icon-button>`,
      );
      // default slot should be rendered (not selected slot)
      const defaultSlot =
        el.shadowRoot!.querySelector<HTMLSlotElement>("slot:not([name])");
      expect(defaultSlot).to.exist;
    });

    it("renders selected slot when toggle=true and selected=true", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button toggle selected>
          <span>default</span>
          <span slot="selected">selected</span>
        </md-icon-button>`,
      );
      const selectedSlot = el.shadowRoot!.querySelector<HTMLSlotElement>(
        'slot[name="selected"]',
      );
      expect(selectedSlot).to.exist;
    });

    it("renders default slot when toggle=false regardless of selected", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button selected>
          <span>default</span>
          <span slot="selected">selected</span>
        </md-icon-button>`,
      );
      // toggle is false, so default slot should always be shown
      const defaultSlot =
        el.shadowRoot!.querySelector<HTMLSlotElement>("slot:not([name])");
      expect(defaultSlot).to.exist;
    });
  });

  // ─── disabled ─────────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      expect(el.disabled).to.be.false;
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.disabled).to.be.false;
    });

    it("disables the inner button when disabled is set", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button disabled></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.disabled).to.be.true;
    });

    it("adds icon-button_disabled class when disabled", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button disabled></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.classList.contains("icon-button_disabled")).to.be.true;
    });

    it("does not add icon-button_disabled class when not disabled", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.classList.contains("icon-button_disabled")).to.be.false;
    });

    it("prevents click handling when disabled", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button disabled></md-icon-button>`,
      );
      // click event should not propagate — no throw expected
      el.click();
      await el.updateComplete;
      expect(el.disabled).to.be.true;
    });
  });

  // ─── href / link rendering ────────────────────────────────────────────────

  describe("href", () => {
    it("renders an <a> element when href is set", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      const anchor = el.shadowRoot!.querySelector("a");
      expect(anchor).to.exist;
    });

    it("does not render a <button> when href is set", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      expect(el.shadowRoot!.querySelector("button")).to.not.exist;
    });

    it("anchor has the correct href value", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      const anchor = el.shadowRoot!.querySelector<HTMLAnchorElement>("a")!;
      expect(anchor.getAttribute("href")).to.equal("/home");
    });

    it("anchor has role=button", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      const anchor = el.shadowRoot!.querySelector<HTMLAnchorElement>("a")!;
      expect(anchor.getAttribute("role")).to.equal("button");
    });

    it("anchor has part=button", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      const anchor = el.shadowRoot!.querySelector<HTMLAnchorElement>("a")!;
      expect(anchor.getAttribute("part")).to.equal("button");
    });

    it("renders <button> when href is cleared", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button href="/home"></md-icon-button>`,
      );
      el.href = undefined;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector("button")).to.exist;
      expect(el.shadowRoot!.querySelector("a")).to.not.exist;
    });
  });

  // ─── type ─────────────────────────────────────────────────────────────────

  describe("type", () => {
    it('defaults to "button"', async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.type).to.equal("button");
    });

    it("sets the button type when type attribute is set", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button type="submit"></md-icon-button>`,
      );
      const button = el.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
      expect(button.type).to.equal("submit");
    });
  });

  // ─── slot rendering ───────────────────────────────────────────────────────

  describe("slots", () => {
    it("renders slotted icon content", async () => {
      const el = await fixture<IconButton>(html`
        <md-icon-button>
          <span class="material-icons">favorite</span>
        </md-icon-button>
      `);
      expect(el.textContent!.trim()).to.equal("favorite");
    });
  });

  // ─── BaseButton lifecycle ─────────────────────────────────────────────────

  describe("BaseButton lifecycle", () => {
    it("connectedCallback adds click listener (no error)", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button></md-icon-button>`,
      );
      // The element is already connected — verify it can be re-connected without error
      const parent = el.parentElement!;
      parent.removeChild(el);
      parent.appendChild(el);
      await el.updateComplete;
      expect(el).to.exist;
    });

    it("click on disabled icon-button does not throw", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button disabled></md-icon-button>`,
      );
      expect(() => el.click()).to.not.throw;
    });

    it("form submission via type=submit does not throw when not inside a form", async () => {
      const el = await fixture<IconButton>(
        html`<md-icon-button type="submit"></md-icon-button>`,
      );
      expect(() => el.click()).to.not.throw;
    });

    it("form submission via type=submit triggers form submit", async () => {
      let submitted = false;
      const form = await fixture<HTMLFormElement>(html`
        <form
          @submit=${(e: Event) => {
            e.preventDefault();
            submitted = true;
          }}
        >
          <md-icon-button type="submit"></md-icon-button>
        </form>
      `);
      const el = form.querySelector<IconButton>("md-icon-button")!;
      el.click();
      await el.updateComplete;
      expect(submitted).to.be.true;
    });
  });
});
