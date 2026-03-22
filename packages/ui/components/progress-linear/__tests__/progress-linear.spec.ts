import { expect, fixture, html } from "@open-wc/testing";

import "../progress-linear.ts";
import type MdProgressLinear from "../progress-linear.ts";

describe("md-progress-linear", () => {
  describe("rendering — indeterminate (default)", () => {
    it("renders the track element", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear></md-progress-linear>`,
      );
      const track = el.shadowRoot!.querySelector(".progress-linear__track");
      expect(track).to.exist;
    });

    it("renders two animated bars for indeterminate", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear></md-progress-linear>`,
      );
      const primary = el.shadowRoot!.querySelector(
        ".progress-linear__bar_primary",
      );
      const secondary = el.shadowRoot!.querySelector(
        ".progress-linear__bar_secondary",
      );
      expect(primary).to.exist;
      expect(secondary).to.exist;
    });

    it("does not render the active indicator in indeterminate mode", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear></md-progress-linear>`,
      );
      const indicator = el.shadowRoot!.querySelector(
        ".progress-linear__active-indicator",
      );
      expect(indicator).to.not.exist;
    });
  });

  describe("rendering — determinate", () => {
    it("renders the active indicator when value is set", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
      );
      const indicator = el.shadowRoot!.querySelector(
        ".progress-linear__active-indicator",
      );
      expect(indicator).to.exist;
    });

    it("renders the stop indicator when value is set", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
      );
      const stopIndicator = el.shadowRoot!.querySelector(
        ".progress-linear__stop-indicator",
      );
      expect(stopIndicator).to.exist;
    });

    it("does not render indeterminate bars when value is set", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear .value=${0.5}></md-progress-linear>`,
      );
      const bar = el.shadowRoot!.querySelector(".progress-linear__bar");
      expect(bar).to.not.exist;
    });

    it("clamps value above 1 to 1", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear .value=${1.5}></md-progress-linear>`,
      );
      const container = el.shadowRoot!.querySelector<HTMLElement>(
        ".progress-linear",
      )!;
      expect(container.style.getPropertyValue("--_progress")).to.equal("1");
    });

    it("clamps value below 0 to 0", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear .value=${-0.5}></md-progress-linear>`,
      );
      const container = el.shadowRoot!.querySelector<HTMLElement>(
        ".progress-linear",
      )!;
      expect(container.style.getPropertyValue("--_progress")).to.equal("0");
    });
  });

  describe("accessibility", () => {
    it("sets aria-hidden=true on the host after first render", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear></md-progress-linear>`,
      );
      expect(el.getAttribute("aria-hidden")).to.equal("true");
    });

    it("does not override an existing aria-hidden attribute", async () => {
      const el = await fixture<MdProgressLinear>(
        html`<md-progress-linear aria-hidden="false"></md-progress-linear>`,
      );
      expect(el.getAttribute("aria-hidden")).to.equal("false");
    });
  });
});
