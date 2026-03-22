import { expect, fixture, html } from "@open-wc/testing";

import "../assist-chip.ts";
import "../filter-chip.ts";
import "../input-chip.ts";
import "../suggestion-chip.ts";

import type MdAssistChip from "../assist-chip.ts";
import type MdFilterChip from "../filter-chip.ts";
import type MdInputChip from "../input-chip.ts";
import type MdSuggestionChip from "../suggestion-chip.ts";

// ─── Assist Chip ──────────────────────────────────────────────────────────────

describe("md-assist-chip", () => {
  describe("rendering", () => {
    it("renders an inner <button>", async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip>Add to calendar</md-assist-chip>`,
      );
      expect(el.shadowRoot!.querySelector("button#chip")).to.exist;
    });

    it("renders slot content as the label", async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip>Add to calendar</md-assist-chip>`,
      );
      expect(el).to.have.text("Add to calendar");
    });
  });

  describe("variant", () => {
    it('defaults to "outlined"', async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip>Label</md-assist-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("outlined");
    });

    it('reflects variant="elevated" to the host', async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip variant="elevated">Label</md-assist-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("elevated");
    });
  });

  describe("disabled", () => {
    it("is not disabled by default", async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip>Label</md-assist-chip>`,
      );
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!
          .disabled,
      ).to.be.false;
    });

    it("disables the inner button and reflects attribute", async () => {
      const el = await fixture<MdAssistChip>(
        html`<md-assist-chip disabled>Label</md-assist-chip>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!
          .disabled,
      ).to.be.true;
    });
  });
});

// ─── Filter Chip ──────────────────────────────────────────────────────────────

describe("md-filter-chip", () => {
  describe("rendering", () => {
    it("renders an inner <button>", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip>Clothes</md-filter-chip>`,
      );
      expect(el.shadowRoot!.querySelector("button#chip")).to.exist;
    });

    it("renders slot content as the label", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip>Clothes</md-filter-chip>`,
      );
      expect(el).to.have.text("Clothes");
    });
  });

  describe("variant", () => {
    it('defaults to "outlined"', async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip>Label</md-filter-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("outlined");
    });

    it('reflects variant="elevated" to the host', async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip variant="elevated">Label</md-filter-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("elevated");
    });
  });

  describe("selected", () => {
    it("is not selected by default", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip>Label</md-filter-chip>`,
      );
      expect(el.selected).to.be.false;
      expect(el.hasAttribute("selected")).to.be.false;
    });

    it("reflects selected attribute to the host", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip selected>Label</md-filter-chip>`,
      );
      expect(el.selected).to.be.true;
      expect(el.hasAttribute("selected")).to.be.true;
    });

    it("sets aria-pressed on the inner button", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip selected>Label</md-filter-chip>`,
      );
      expect(
        el
          .shadowRoot!.querySelector("button#chip")!
          .getAttribute("aria-pressed"),
      ).to.equal("true");
    });

    it("toggles selected on click and fires change event", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip>Label</md-filter-chip>`,
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!.click();
      await el.updateComplete;

      expect(el.selected).to.be.true;
      expect(fired).to.be.true;
    });

    it("toggles back to unselected on second click", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip selected>Label</md-filter-chip>`,
      );
      el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!.click();
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });
  });

  describe("disabled", () => {
    it("disables the inner button and reflects attribute", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip disabled>Label</md-filter-chip>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!
          .disabled,
      ).to.be.true;
    });

    it("does not toggle selected when disabled", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip disabled>Label</md-filter-chip>`,
      );
      el.click();
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });

    it("does not fire change when disabled", async () => {
      const el = await fixture<MdFilterChip>(
        html`<md-filter-chip disabled>Label</md-filter-chip>`,
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });
      el.click();
      expect(fired).to.be.false;
    });
  });
});

// ─── Input Chip ───────────────────────────────────────────────────────────────

describe("md-input-chip", () => {
  describe("rendering", () => {
    it("renders an inner <button>", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      expect(el.shadowRoot!.querySelector("button#chip")).to.exist;
    });

    it("renders slot content as the label", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      expect(el).to.have.text("React");
    });
  });

  describe("selected", () => {
    it("is not selected by default", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      expect(el.selected).to.be.false;
    });

    it("reflects selected attribute to the host", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip selected>React</md-input-chip>`,
      );
      expect(el.hasAttribute("selected")).to.be.true;
    });

    it("toggles selected on chip click and fires change event", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      let fired = false;
      el.addEventListener("change", () => {
        fired = true;
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!.click();
      await el.updateComplete;

      expect(el.selected).to.be.true;
      expect(fired).to.be.true;
    });
  });

  describe("removable", () => {
    it("does not render the remove button by default", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      const removeBtn = el.shadowRoot!.querySelector(".chip__remove");
      // hidden via chip__remove_hidden class when no trailing-icon slot content
      expect(removeBtn!.classList.contains("chip__remove_hidden")).to.be.true;
    });

    it("renders the remove button when removable is set", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip removable>React</md-input-chip>`,
      );
      const removeBtn = el.shadowRoot!.querySelector(".chip__remove");
      expect(removeBtn).to.exist;
      expect(removeBtn!.classList.contains("chip__remove_hidden")).to.be.false;
    });

    it("fires remove event when remove button is clicked", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip removable>React</md-input-chip>`,
      );
      let fired = false;
      el.addEventListener("remove", () => {
        fired = true;
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>(".chip__remove")!.click();
      expect(fired).to.be.true;
    });

    it("does not fire change when the remove button is clicked", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip removable>React</md-input-chip>`,
      );
      let changeFired = false;
      el.addEventListener("change", () => {
        changeFired = true;
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>(".chip__remove")!.click();
      expect(changeFired).to.be.false;
    });

    it("does not fire remove when disabled", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip removable disabled>React</md-input-chip>`,
      );
      let fired = false;
      el.addEventListener("remove", () => {
        fired = true;
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>(".chip__remove")!.click();
      expect(fired).to.be.false;
    });

    it("renders the close SVG inside the remove button", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip removable>React</md-input-chip>`,
      );
      const svg = el.shadowRoot!.querySelector(".chip__remove svg");
      expect(svg).to.exist;
    });
  });

  describe("avatar", () => {
    it("is false by default", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      expect(el.avatar).to.be.false;
    });

    it("renders the avatar wrapper when avatar is set", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip avatar>React</md-input-chip>`,
      );
      expect(el.shadowRoot!.querySelector(".chip__avatar")).to.exist;
    });

    it("does not render avatar wrapper when avatar is not set", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip>React</md-input-chip>`,
      );
      expect(el.shadowRoot!.querySelector(".chip__avatar")).to.not.exist;
    });
  });

  describe("disabled", () => {
    it("disables the inner button and reflects attribute", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip disabled>React</md-input-chip>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!
          .disabled,
      ).to.be.true;
    });

    it("does not toggle selected when disabled", async () => {
      const el = await fixture<MdInputChip>(
        html`<md-input-chip disabled>React</md-input-chip>`,
      );
      el.click();
      await el.updateComplete;
      expect(el.selected).to.be.false;
    });
  });
});

// ─── Suggestion Chip ──────────────────────────────────────────────────────────

describe("md-suggestion-chip", () => {
  describe("rendering", () => {
    it("renders an inner <button>", async () => {
      const el = await fixture<MdSuggestionChip>(
        html`<md-suggestion-chip>Good morning!</md-suggestion-chip>`,
      );
      expect(el.shadowRoot!.querySelector("button#chip")).to.exist;
    });

    it("renders slot content as the label", async () => {
      const el = await fixture<MdSuggestionChip>(
        html`<md-suggestion-chip>Good morning!</md-suggestion-chip>`,
      );
      expect(el).to.have.text("Good morning!");
    });
  });

  describe("variant", () => {
    it('defaults to "outlined"', async () => {
      const el = await fixture<MdSuggestionChip>(
        html`<md-suggestion-chip>Label</md-suggestion-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("outlined");
    });

    it('reflects variant="elevated" to the host', async () => {
      const el = await fixture<MdSuggestionChip>(
        html`<md-suggestion-chip variant="elevated">Label</md-suggestion-chip>`,
      );
      expect(el.getAttribute("variant")).to.equal("elevated");
    });
  });

  describe("disabled", () => {
    it("disables the inner button and reflects attribute", async () => {
      const el = await fixture<MdSuggestionChip>(
        html`<md-suggestion-chip disabled>Label</md-suggestion-chip>`,
      );
      expect(el.hasAttribute("disabled")).to.be.true;
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>("button#chip")!
          .disabled,
      ).to.be.true;
    });
  });
});
