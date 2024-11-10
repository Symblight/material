import { expect, fixture, html } from "@open-wc/testing";

import "../button";

describe("md-button", () => {
  it("works", async () => {
    const button = await fixture(html` <md-button>Label</md-button> `);

    expect(button).text("Label");
  });
});
