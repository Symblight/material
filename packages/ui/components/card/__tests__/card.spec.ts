import { expect, fixture, html } from "@open-wc/testing";

import "../card.ts";
import type { MdCard } from "../card.ts";
import type MdRipple from "../../ripple/ripple.ts";

describe("md-card", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el).to.exist;
    });

    it("has the correct tag name", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.tagName.toLowerCase()).to.equal("md-card");
    });

    it("renders a shadow root", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.shadowRoot).to.exist;
    });

    it("renders an md-shadow element", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.shadowRoot!.querySelector("md-shadow")).to.exist;
    });

    it("renders the inner #card-surface element", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.shadowRoot!.querySelector("#card-surface")).to.exist;
    });
  });

  // ─── Variants ───────────────────────────────────────────────────────────────

  describe("variants", () => {
    it("defaults to the elevated variant", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.variant).to.equal("elevated");
    });

    it("reflects the default elevated variant as an attribute", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.getAttribute("variant")).to.equal("elevated");
    });

    it("accepts the filled variant via attribute", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="filled"></md-card>`,
      );
      expect(el.variant).to.equal("filled");
      expect(el.getAttribute("variant")).to.equal("filled");
    });

    it("accepts the outlined variant via attribute", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="outlined"></md-card>`,
      );
      expect(el.variant).to.equal("outlined");
      expect(el.getAttribute("variant")).to.equal("outlined");
    });

    it("accepts the elevated variant via attribute", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="elevated"></md-card>`,
      );
      expect(el.variant).to.equal("elevated");
      expect(el.getAttribute("variant")).to.equal("elevated");
    });

    it("updates variant property reactively", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      el.variant = "outlined";
      await el.updateComplete;
      expect(el.getAttribute("variant")).to.equal("outlined");
    });
  });

  // ─── Interactive mode ────────────────────────────────────────────────────────

  describe("interactive mode", () => {
    it("defaults to non-interactive", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.interactive).to.be.false;
    });

    it("sets interactive=true via boolean attribute", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      expect(el.interactive).to.be.true;
    });

    it("reflects interactive as an attribute", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      expect(el.hasAttribute("interactive")).to.be.true;
    });

    it("non-interactive card has no role on the surface element", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("role")).to.be.null;
    });

    it("non-interactive card has no tabindex on the surface element", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("tabindex")).to.be.null;
    });

    it("interactive card surface has role=button", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("role")).to.equal("button");
    });

    it("interactive card surface has tabindex=0", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("tabindex")).to.equal("0");
    });

    it("non-interactive card renders no md-ripple", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.shadowRoot!.querySelector("md-ripple")).to.be.null;
    });

    it("interactive card renders an md-ripple", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      expect(el.shadowRoot!.querySelector("md-ripple")).to.exist;
    });

    it("interactive card surface has the card_interactive class", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.classList.contains("card_interactive")).to.be.true;
    });

    it("non-interactive card surface does not have the card_interactive class", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.classList.contains("card_interactive")).to.be.false;
    });

    it("switches to interactive reactively", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      el.interactive = true;
      await el.updateComplete;
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("role")).to.equal("button");
      expect(surface.getAttribute("tabindex")).to.equal("0");
    });
  });

  // ─── Link mode ──────────────────────────────────────────────────────────────

  describe("link mode (interactive + href)", () => {
    it("renders the surface as an <a> when interactive and href are set", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#test"></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector("a#card-surface");
      expect(anchor).to.exist;
    });

    it("the <a> element has the correct href value", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="/path/to/page"></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).to.equal("/path/to/page");
    });

    it("href without interactive does not render an <a> element", async () => {
      const el = await fixture<MdCard>(html`<md-card href="#test"></md-card>`);
      expect(el.shadowRoot!.querySelector("a#card-surface")).to.be.null;
    });

    it("the <a> element has a tabindex of 0 when not disabled", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#test"></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      expect(anchor.getAttribute("tabindex")).to.equal("0");
    });

    it("updates the rendered href reactively", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#first"></md-card>`,
      );
      el.href = "#second";
      await el.updateComplete;
      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).to.equal("#second");
    });
  });

  // ─── Disabled state ──────────────────────────────────────────────────────────

  describe("disabled state", () => {
    it("defaults to disabled=false", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      expect(el.disabled).to.be.false;
    });

    it("reflects disabled as a boolean attribute", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      expect(el.disabled).to.be.true;
      expect(el.hasAttribute("disabled")).to.be.true;
    });

    it("interactive + disabled: surface has aria-disabled=true", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("aria-disabled")).to.equal("true");
    });

    it("interactive + disabled: surface has tabindex=-1", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("tabindex")).to.equal("-1");
    });

    it("interactive + disabled: surface has the card_disabled class", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.classList.contains("card_disabled")).to.be.true;
    });

    it("interactive + disabled: no md-ripple is rendered", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      expect(el.shadowRoot!.querySelector("md-ripple")).to.be.null;
    });

    it("disabled without interactive: surface has no aria-disabled", async () => {
      const el = await fixture<MdCard>(html`<md-card disabled></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("aria-disabled")).to.be.null;
    });

    it("disabled without interactive: surface has no card_disabled class", async () => {
      const el = await fixture<MdCard>(html`<md-card disabled></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.classList.contains("card_disabled")).to.be.false;
    });

    it("link mode + disabled: <a> has aria-disabled=true", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#" disabled></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector("a#card-surface")!;
      expect(anchor.getAttribute("aria-disabled")).to.equal("true");
    });

    it("link mode + disabled: <a> has tabindex=-1", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#" disabled></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector("a#card-surface")!;
      expect(anchor.getAttribute("tabindex")).to.equal("-1");
    });

    it("toggles disabled reactively on an interactive card", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      el.disabled = true;
      await el.updateComplete;
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("aria-disabled")).to.equal("true");
      expect(surface.getAttribute("tabindex")).to.equal("-1");
    });
  });

  // ─── Slots ──────────────────────────────────────────────────────────────────

  describe("slots", () => {
    it("renders slotted content in the default slot", async () => {
      const el = await fixture<MdCard>(
        html`<md-card><p id="body">Body text</p></md-card>`,
      );
      const slotted = el.querySelector("#body") as HTMLElement;
      expect(slotted).to.exist;
      expect(slotted.textContent).to.equal("Body text");
    });

    it("renders slotted content in the header slot", async () => {
      const el = await fixture<MdCard>(
        html`<md-card><div slot="header" id="hdr">Headline</div></md-card>`,
      );
      const slotted = el.querySelector("#hdr") as HTMLElement;
      expect(slotted).to.exist;
      expect(slotted.textContent).to.equal("Headline");
    });

    it("renders slotted content in the media slot", async () => {
      const el = await fixture<MdCard>(
        html`<md-card
          ><img slot="media" id="img" src="" alt="media"
        /></md-card>`,
      );
      const slotted = el.querySelector("#img");
      expect(slotted).to.exist;
    });

    it("renders slotted content in the actions slot", async () => {
      const el = await fixture<MdCard>(
        html`<md-card><div slot="actions" id="acts">Actions</div></md-card>`,
      );
      const slotted = el.querySelector("#acts") as HTMLElement;
      expect(slotted).to.exist;
      expect(slotted.textContent).to.equal("Actions");
    });

    it("shadow root contains named slots: header, media, actions", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const root = el.shadowRoot!;
      expect(root.querySelector('slot[name="header"]')).to.exist;
      expect(root.querySelector('slot[name="media"]')).to.exist;
      expect(root.querySelector('slot[name="actions"]')).to.exist;
    });

    it("shadow root contains the default (unnamed) slot", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const root = el.shadowRoot!;
      expect(root.querySelector("slot:not([name])")).to.exist;
    });

    it("default slot distributes multiple children", async () => {
      const el = await fixture<MdCard>(
        html`<md-card><span id="a">A</span><span id="b">B</span></md-card>`,
      );
      expect(el.querySelector("#a")).to.exist;
      expect(el.querySelector("#b")).to.exist;
    });
  });

  // ─── CSS custom properties ──────────────────────────────────────────────────

  describe("CSS custom properties", () => {
    it("accepts a --md-card-shape override on the host", async () => {
      const el = await fixture<MdCard>(
        html`<md-card style="--md-card-shape: 0.5rem"></md-card>`,
      );
      const value = getComputedStyle(el)
        .getPropertyValue("--md-card-shape")
        .trim();
      expect(value).to.equal("0.5rem");
    });

    it("accepts a --md-elevation-level override on the host", async () => {
      const el = await fixture<MdCard>(
        html`<md-card style="--md-elevation-level: 3"></md-card>`,
      );
      const value = getComputedStyle(el)
        .getPropertyValue("--md-elevation-level")
        .trim();
      expect(value).to.equal("3");
    });

    it("accepts a --md-card-container-color override on the host", async () => {
      const el = await fixture<MdCard>(
        html`<md-card style="--md-card-container-color: #ff0000"></md-card>`,
      );
      const value = getComputedStyle(el)
        .getPropertyValue("--md-card-container-color")
        .trim();
      expect(value).to.equal("#ff0000");
    });

    it("accepts a --md-card-outline-color override on the host", async () => {
      const el = await fixture<MdCard>(
        html`<md-card
          variant="outlined"
          style="--md-card-outline-color: #0000ff"
        ></md-card>`,
      );
      const value = getComputedStyle(el)
        .getPropertyValue("--md-card-outline-color")
        .trim();
      expect(value).to.equal("#0000ff");
    });
  });

  // ─── Accessibility ──────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("non-interactive card surface has no role", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("role")).to.be.null;
    });

    it("non-interactive card surface is not in the tab order", async () => {
      const el = await fixture<MdCard>(html`<md-card></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("tabindex")).to.be.null;
    });

    it("interactive card surface is keyboard accessible (tabindex=0)", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(Number(surface.getAttribute("tabindex"))).to.be.at.least(0);
    });

    it("interactive card surface has role=button for screen readers", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("role")).to.equal("button");
    });

    it("link card surface is an <a> element (native semantics, no explicit role)", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="/page"></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector("a#card-surface");
      expect(anchor).to.exist;
      // Native <a> provides its own link role; no explicit role attribute needed
      expect(anchor!.getAttribute("role")).to.be.null;
    });

    it("disabled interactive card is removed from tab order", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("tabindex")).to.equal("-1");
    });

    it("disabled interactive card announces aria-disabled=true", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive disabled></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("aria-disabled")).to.equal("true");
    });

    it("non-disabled interactive card has no aria-disabled attribute", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector("#card-surface")!;
      expect(surface.getAttribute("aria-disabled")).to.be.null;
    });
  });

  // ─── Regression: Bug 1 — Elevated shadow must not be clipped ────────────────
  //
  // FAILS today because the host has `overflow: hidden`, which clips the
  // box-shadow produced by md-shadow's pseudo-elements so it is invisible.
  // These tests pass once `overflow: hidden` is moved from :host to
  // .md-card__surface.

  describe("Bug 1 — elevated shadow is not clipped by the host", () => {
    it("host computed overflow is not 'hidden' for the elevated variant", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="elevated"></md-card>`,
      );
      const overflow = getComputedStyle(el).overflow;
      // overflow: hidden on the host clips the md-shadow box-shadow.
      // The fix moves overflow: hidden to .md-card__surface.
      expect(overflow).to.not.equal("hidden");
    });

    it("inner surface has overflow: hidden to confine the ripple", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="elevated" interactive></md-card>`,
      );
      const surface = el.shadowRoot!.querySelector(
        ".md-card__surface",
      ) as HTMLElement;
      expect(getComputedStyle(surface).overflow).to.equal("hidden");
    });

    it("md-shadow element is present inside the shadow root for the elevated variant", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="elevated"></md-card>`,
      );
      expect(el.shadowRoot!.querySelector("md-shadow")).to.exist;
    });

    it("md-shadow is hidden for the filled variant", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="filled"></md-card>`,
      );
      const shadow = el.shadowRoot!.querySelector("md-shadow") as HTMLElement;
      expect(getComputedStyle(shadow).display).to.equal("none");
    });

    it("md-shadow is hidden for the outlined variant", async () => {
      const el = await fixture<MdCard>(
        html`<md-card variant="outlined"></md-card>`,
      );
      const shadow = el.shadowRoot!.querySelector("md-shadow") as HTMLElement;
      expect(getComputedStyle(shadow).display).to.equal("none");
    });
  });

  // ─── Regression: Bug 2 — Hover on slotted content keeps card background ─────
  //
  // FAILS today because .md-card__surface inherits the host background-color
  // and paints over the md-ripple state layer, making the hover/press colour
  // invisible.  The fix adds `background-color: transparent` to
  // .md-card__surface so the ripple layer below it is visible.

  describe("Bug 2 — card surface is transparent so ripple layer is visible", () => {
    it("the inner .md-card__surface has a transparent background", async () => {
      const el = await fixture<MdCard>(html`<md-card interactive></md-card>`);
      const surface = el.shadowRoot!.querySelector(
        ".md-card__surface",
      ) as HTMLElement;
      const bg = getComputedStyle(surface).backgroundColor;
      // "transparent" resolves to "rgba(0, 0, 0, 0)" in all browsers.
      expect(bg).to.equal("rgba(0, 0, 0, 0)");
    });

    it("host retains a non-transparent background so the card is visible", async () => {
      // The host must carry the container color; the surface must be clear.
      const el = await fixture<MdCard>(
        html`<md-card
          interactive
          style="--md-card-container-color: rgb(200, 200, 200)"
        ></md-card>`,
      );
      const hostBg = getComputedStyle(el).backgroundColor;
      expect(hostBg).to.not.equal("rgba(0, 0, 0, 0)");
    });
  });

  // ─── Regression: Bug 3 — State layer triggers from slotted children ──────────
  //
  // FAILS today because pointerenter/pointerleave are non-bubbling events.
  // Listeners registered on #card-surface never see events originating on
  // slotted (light-DOM) children.  The fix attaches the ripple or its pointer
  // listeners to the host element instead, where composed-path events from
  // slotted children do surface.

  describe("Bug 3 — interactive states respond to events on slotted children", () => {
    it("pointerenter on a slotted child sets md-ripple to hovered", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive><p id="child">Text</p></md-card>`,
      );
      const child = el.querySelector("#child") as HTMLElement;
      const ripple = el.shadowRoot!.querySelector("md-ripple") as MdRipple;

      child.dispatchEvent(
        new PointerEvent("pointerenter", { bubbles: false, composed: true }),
      );
      // Allow any microtask/Lit update to settle.
      await el.updateComplete;

      // Fails today: ripple.hovered stays false because the listener is on
      // #card-surface which never sees a non-bubbling pointerenter from a
      // slotted child.
      expect(ripple.hovered).to.be.true;
    });

    it("pointerleave on the host sets md-ripple hovered to false", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive><p id="child">Text</p></md-card>`,
      );
      const ripple = el.shadowRoot!.querySelector("md-ripple") as MdRipple;

      // Simulate enter then leave at the host boundary.
      el.dispatchEvent(
        new PointerEvent("pointerenter", { bubbles: false, composed: true }),
      );
      await el.updateComplete;

      el.dispatchEvent(
        new PointerEvent("pointerleave", { bubbles: false, composed: true }),
      );
      await el.updateComplete;

      expect(ripple.hovered).to.be.false;
    });

    it("pointerdown on a slotted child sets md-ripple to pressed", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive><p id="child">Text</p></md-card>`,
      );
      const child = el.querySelector("#child") as HTMLElement;
      const ripple = el.shadowRoot!.querySelector("md-ripple") as MdRipple;

      child.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          composed: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      await el.updateComplete;

      // pointerdown bubbles so this may already work; kept as regression guard.
      expect(ripple.pressed).to.be.true;
    });

    it("pointerup on a slotted child clears md-ripple pressed state", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive><p id="child">Text</p></md-card>`,
      );
      const child = el.querySelector("#child") as HTMLElement;
      const ripple = el.shadowRoot!.querySelector("md-ripple") as MdRipple;

      child.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          composed: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      await el.updateComplete;

      child.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, composed: true }),
      );
      await el.updateComplete;

      expect(ripple.pressed).to.be.false;
    });
  });

  // ─── Regression: Bug 4 — Link card anchor covers the full card surface ───────
  //
  // FAILS today because .md-card__surface uses `height: 100%` against a host
  // with no explicit height, so the <a> only wraps its content children.
  // Padding applied to the host creates a visible card area that is outside the
  // <a>'s hit region.  The fix changes the host to `display: flex` and uses
  // `flex: 1 1 auto` on the surface so the <a> always fills the host.

  describe("Bug 4 — link card anchor covers the full card bounding box", () => {
    it("anchor bounding width matches the host bounding width", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="#test" style="width: 300px;">
          <p>Content</p>
        </md-card>`,
      );
      await el.updateComplete;

      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      const hostRect = el.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();

      // Widths must match — the anchor must fill the host horizontally.
      expect(anchorRect.width).to.equal(hostRect.width);
    });

    it("anchor bounding height matches the host bounding height", async () => {
      const el = await fixture<MdCard>(
        html`<md-card
          interactive
          href="#test"
          style="width: 300px; height: 120px;"
        >
          <p>Content</p>
        </md-card>`,
      );
      await el.updateComplete;

      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      const hostRect = el.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();

      // Heights must match — the anchor must fill the host including padding.
      expect(anchorRect.height).to.equal(hostRect.height);
    });

    it("anchor has text-decoration: none and inherits color", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive href="/page"><p>Link</p></md-card>`,
      );
      const anchor = el.shadowRoot!.querySelector(
        "a#card-surface",
      ) as HTMLAnchorElement;
      // text-decoration-line resolves to "none" when no decoration is applied.
      const decoration = getComputedStyle(anchor).textDecorationLine;
      expect(decoration).to.equal("none");
    });

    it("non-link interactive card surface div also fills the host width", async () => {
      const el = await fixture<MdCard>(
        html`<md-card interactive style="width: 300px; height: 120px;">
          <p>Content</p>
        </md-card>`,
      );
      await el.updateComplete;

      const surface = el.shadowRoot!.querySelector(
        "#card-surface",
      ) as HTMLElement;
      const hostRect = el.getBoundingClientRect();
      const surfaceRect = surface.getBoundingClientRect();

      expect(surfaceRect.width).to.equal(hostRect.width);
      expect(surfaceRect.height).to.equal(hostRect.height);
    });
  });
});
