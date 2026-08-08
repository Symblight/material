import { expect, fixture, html } from "@open-wc/testing";

import "../skeleton.js";
/** @import { MdSkeleton } from "../skeleton.js" */

describe("md-skeleton", () => {
  it("renders with no children and no error", async () => {
    const el = /** @type {MdSkeleton} */ (
      await fixture(html`<md-skeleton></md-skeleton>`)
    );
    expect(el).to.exist;
    expect(el.shadowRoot).to.exist;
  });

  it("defaults to the text variant", async () => {
    const el = /** @type {MdSkeleton} */ (
      await fixture(html`<md-skeleton></md-skeleton>`)
    );
    expect(el.variant).to.equal("text");
    expect(el.getAttribute("variant")).to.equal("text");
  });

  it("reflects a set variant as an attribute", async () => {
    const el = /** @type {MdSkeleton} */ (
      await fixture(html`<md-skeleton variant="circular"></md-skeleton>`)
    );
    expect(el.variant).to.equal("circular");
    expect(getComputedStyle(el).borderRadius).to.equal("50%");
  });

  it("is hidden from the accessibility tree", async () => {
    const el = /** @type {MdSkeleton} */ (
      await fixture(html`<md-skeleton></md-skeleton>`)
    );
    expect(el.getAttribute("aria-hidden")).to.equal("true");
  });

  it("is sized via plain CSS on the host, e.g. inline style width", async () => {
    const el = /** @type {MdSkeleton} */ (
      await fixture(
        html`<md-skeleton style="width: 42px; height: 10px;"></md-skeleton>`,
      )
    );
    const rect = el.getBoundingClientRect();
    expect(rect.width).to.equal(42);
    expect(rect.height).to.equal(10);
  });
});
