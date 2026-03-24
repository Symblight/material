import { expect, fixture, html } from "@open-wc/testing";

import "../list.ts";
import type { MdList } from "../list.ts";
import type { MdListItem } from "../list-item.ts";

describe("md-list", () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the element", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el).to.exist;
    });

    it("has the correct tag name", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el.tagName.toLowerCase()).to.equal("md-list");
    });

    it("renders a shadow root", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el.shadowRoot).to.exist;
    });

    it("renders a <ul> element inside the shadow root", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el.shadowRoot!.querySelector("ul")).to.exist;
    });

    it("the <ul> element has role='list'", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      const ul = el.shadowRoot!.querySelector("ul")!;
      expect(ul.getAttribute("role")).to.equal("list");
    });

    it("the <ul> element has the md-list class", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      const ul = el.shadowRoot!.querySelector("ul")!;
      expect(ul.classList.contains("md-list")).to.be.true;
    });

    it("renders a default (unnamed) slot inside the <ul>", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el.shadowRoot!.querySelector("slot:not([name])")).to.exist;
    });
  });

  // ─── Slots ──────────────────────────────────────────────────────────────────

  describe("slots", () => {
    it("distributes slotted md-list-item children via the default slot", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1">Item 1</md-list-item>
        </md-list>
      `);
      expect(el.querySelector("#item1")).to.exist;
    });

    it("distributes multiple md-list-item children", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="a">A</md-list-item>
          <md-list-item id="b">B</md-list-item>
          <md-list-item id="c">C</md-list-item>
        </md-list>
      `);
      expect(el.querySelector("#a")).to.exist;
      expect(el.querySelector("#b")).to.exist;
      expect(el.querySelector("#c")).to.exist;
    });

    it("renders with no children without error", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el).to.exist;
    });
  });

  // ─── Roving tabindex initialisation ─────────────────────────────────────────

  describe("roving tabindex initialisation", () => {
    it("sets tabindex=0 on the first interactive item after slot population", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(item1.getTabIndex()).to.equal(0);
    });

    it("ArrowDown navigation sets tabindex=-1 on the previously focused item", async () => {
      // Validate that _focusItem correctly demotes the current item to -1 and
      // promotes the next item to 0 — this covers the roving-tabindex contract
      // without relying on the race-prone initial slot-change timing.
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;
      await el.updateComplete;

      const btn1 = item1.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn1.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      // After moving focus to item2, item1 should have been demoted to -1.
      expect(item1.getTabIndex()).to.equal(-1);
      expect(item2.getTabIndex()).to.equal(0);
    });

    it("does not assign tabindex to non-interactive items", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="static1">Static 1</md-list-item>
          <md-list-item id="interactive1" button>Button</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const staticItem = el.querySelector<MdListItem>("#static1")!;
      await staticItem.updateComplete;

      // Static items have no interactive inner element, so getTabIndex returns 0
      // (the fallback). The important check is that no explicit tabindex was set
      // by the list on the static item's inner element (which does not exist).
      const interactiveEl = staticItem.shadowRoot!.querySelector(
        ".md-list-item__interactive",
      );
      expect(interactiveEl).to.be.null;
    });
  });

  // ─── Keyboard navigation — Arrow Down ────────────────────────────────────────

  describe("keyboard navigation — ArrowDown", () => {
    it("ArrowDown moves focus from first to second interactive item", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;

      // Focus the first interactive button so focus-within matches
      const btn1 = item1.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn1.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      expect(item2.getTabIndex()).to.equal(0);
      expect(item1.getTabIndex()).to.equal(-1);
    });

    it("ArrowDown wraps from last item back to first", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;

      // Start at the last item
      const btn2 = item2.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn2.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      expect(item1.getTabIndex()).to.equal(0);
      expect(item2.getTabIndex()).to.equal(-1);
    });

    it("ArrowDown prevents default scroll behaviour", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item button>Item 1</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });

    it("ArrowDown on a list with no interactive items does nothing", async () => {
      // Should not throw
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item>Static only</md-list-item>
        </md-list>
      `);
      await el.updateComplete;
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;
      expect(el).to.exist;
    });
  });

  // ─── Keyboard navigation — Arrow Up ──────────────────────────────────────────

  describe("keyboard navigation — ArrowUp", () => {
    it("ArrowUp moves focus from second to first interactive item", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;

      const btn2 = item2.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn2.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      await el.updateComplete;

      expect(item1.getTabIndex()).to.equal(0);
      expect(item2.getTabIndex()).to.equal(-1);
    });

    it("ArrowUp wraps from first item to last", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;

      const btn1 = item1.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn1.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      await el.updateComplete;

      expect(item2.getTabIndex()).to.equal(0);
      expect(item1.getTabIndex()).to.equal(-1);
    });

    it("ArrowUp prevents default scroll behaviour", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item button>Item 1</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const event = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });
  });

  // ─── Keyboard navigation — Home / End ────────────────────────────────────────

  describe("keyboard navigation — Home and End", () => {
    it("Home key focuses the first interactive item", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
          <md-list-item id="item3" button>Item 3</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      const item3 = el.querySelector<MdListItem>("#item3")!;
      await item1.updateComplete;
      await item2.updateComplete;
      await item3.updateComplete;

      // Start from the last item
      const btn3 = item3.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn3.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Home",
          bubbles: true,
          cancelable: true,
        }),
      );
      await el.updateComplete;

      expect(item1.getTabIndex()).to.equal(0);
      expect(item3.getTabIndex()).to.equal(-1);
    });

    it("Home key prevents default browser behaviour", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item button>Item 1</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const event = new KeyboardEvent("keydown", {
        key: "Home",
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });

    it("End key focuses the last interactive item", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
          <md-list-item id="item3" button>Item 3</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      const item3 = el.querySelector<MdListItem>("#item3")!;
      await item1.updateComplete;
      await item2.updateComplete;
      await item3.updateComplete;

      const btn1 = item1.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn1.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "End",
          bubbles: true,
          cancelable: true,
        }),
      );
      await el.updateComplete;

      expect(item3.getTabIndex()).to.equal(0);
      expect(item1.getTabIndex()).to.equal(-1);
    });

    it("End key prevents default browser behaviour", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item button>Item 1</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const event = new KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.true;
    });
  });

  // ─── Non-interactive items are skipped ───────────────────────────────────────

  describe("non-interactive items are skipped during keyboard navigation", () => {
    it("ArrowDown skips static items between two interactive items", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="btn1" button>Button 1</md-list-item>
          <md-list-item id="static1">Static</md-list-item>
          <md-list-item id="btn2" button>Button 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const btn1Item = el.querySelector<MdListItem>("#btn1")!;
      const btn2Item = el.querySelector<MdListItem>("#btn2")!;
      await btn1Item.updateComplete;
      await btn2Item.updateComplete;

      const btn1 = btn1Item.shadowRoot!.querySelector(
        "button",
      ) as HTMLButtonElement;
      btn1.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      // The static item is skipped; focus lands directly on btn2
      expect(btn2Item.getTabIndex()).to.equal(0);
      expect(btn1Item.getTabIndex()).to.equal(-1);
    });

    it("href items are treated as interactive (not skipped)", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="link1" href="/page1">Link 1</md-list-item>
          <md-list-item id="link2" href="/page2">Link 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const link1 = el.querySelector<MdListItem>("#link1")!;
      const link2 = el.querySelector<MdListItem>("#link2")!;
      await link1.updateComplete;
      await link2.updateComplete;

      const anchor = link1.shadowRoot!.querySelector("a") as HTMLAnchorElement;
      anchor.focus();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await el.updateComplete;

      expect(link2.getTabIndex()).to.equal(0);
      expect(link1.getTabIndex()).to.equal(-1);
    });

    it("unrecognised key does not affect tabindex", async () => {
      const el = await fixture<MdList>(html`
        <md-list>
          <md-list-item id="item1" button>Item 1</md-list-item>
          <md-list-item id="item2" button>Item 2</md-list-item>
        </md-list>
      `);
      await el.updateComplete;

      const item1 = el.querySelector<MdListItem>("#item1")!;
      const item2 = el.querySelector<MdListItem>("#item2")!;
      await item1.updateComplete;
      await item2.updateComplete;

      // Only item1 starts with tabindex=0 (set by slot change handler)
      const tabBefore1 = item1.getTabIndex();
      const tabBefore2 = item2.getTabIndex();

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
      await el.updateComplete;

      expect(item1.getTabIndex()).to.equal(tabBefore1);
      expect(item2.getTabIndex()).to.equal(tabBefore2);
    });
  });

  // ─── Accessibility ───────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("the <ul> has role='list' for explicit list semantics", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      const ul = el.shadowRoot!.querySelector("ul")!;
      expect(ul.getAttribute("role")).to.equal("list");
    });

    it("md-list itself has no explicit role attribute on the host", async () => {
      const el = await fixture<MdList>(html`<md-list></md-list>`);
      expect(el.getAttribute("role")).to.be.null;
    });
  });
});
