import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";
/** @import { MdDataGrid } from "../data-grid.js" */

/** @param {number} count */
function makeRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
  }));
}

const COLUMNS = [
  { field: "id", headerName: "ID", width: 60 },
  { field: "name", headerName: "Name" },
];

const settle = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

describe("md-data-grid", () => {
  describe("rendering", () => {
    it("renders with no children and no error", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      expect(el).to.exist;
      expect(el.shadowRoot).to.exist;
    });

    it("renders one md-data-column-header per column, in order", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3);
      await el.updateComplete;

      const headers = el.shadowRoot.querySelectorAll("md-data-column-header");
      expect(headers.length).to.equal(2);
      expect(/** @type {any} */ (headers[0]).column.field).to.equal("id");
      expect(/** @type {any} */ (headers[1]).column.field).to.equal("name");
    });

    it("renderCell/valueGetter callbacks receive correct params and their output appears in the cell", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [
        { field: "name", headerName: "Name" },
        {
          field: "id",
          headerName: "ID",
          valueGetter: ({ row }) => `#${row.id}`,
          renderCell: ({ value }) => html`<b>${value}</b>`,
        },
      ];
      el.rows = makeRows(2);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const cell = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-cell")[1]
      );
      await cell.updateComplete;
      expect(cell.shadowRoot.textContent).to.contain("#0");
    });

    it("clips long text to the column's track width instead of blowing out into the next column", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "id", headerName: "ID", width: 60 },
        {
          field: "name",
          headerName: "A Very Long Column Header Label",
          width: 60,
        },
      ];
      el.rows = [
        { id: 1, name: "A Very Long Cell Value That Should Be Clipped" },
      ];
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[1]
      );
      await header.updateComplete;
      expect(header.getBoundingClientRect().width).to.be.at.most(60);

      const cell = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-cell")[1]
      );
      await cell.updateComplete;
      expect(cell.getBoundingClientRect().width).to.be.at.most(60);
    });

    it("wires --height on each row to rowHeight, so cells render at exactly that height", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid row-height="64"></md-data-grid>`)
      );
      el.columns = [{ field: "a" }];
      el.rows = [{ id: 1, a: "x" }];
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const cell = /** @type {any} */ (
        el.shadowRoot.querySelector("md-data-cell")
      );
      await cell.updateComplete;
      expect(getComputedStyle(cell).height).to.equal("64px");
      expect(cell.getBoundingClientRect().height).to.equal(64);
    });

    it("keeps header columns the same width as body columns when squeezed narrow (no header-only blowout)", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 60px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "trader", headerName: "Trader Name" },
        { field: "trade", headerName: "Trade" },
      ];
      el.rows = [{ id: 1, trader: "Mittiford Longname", trade: "zebra-alpha" }];
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const headerRow = el.shadowRoot.querySelector(".data-grid__header");
      const bodyRow = el.shadowRoot.querySelector(".data-grid__row");
      // Padding alone (not text content) sets each grid item's minimum
      // width — if the header's padding is bigger than the cell's, its
      // tracks are forced wider than the body's, overflowing the header
      // row past the grid's own width instead of eliding the label.
      expect(getComputedStyle(headerRow).gridTemplateColumns).to.equal(
        getComputedStyle(bodyRow).gridTemplateColumns,
      );
      expect(headerRow.getBoundingClientRect().width).to.equal(
        bodyRow.getBoundingClientRect().width,
      );
    });
  });

  describe("virtualization", () => {
    it("only renders cells within the visible window + overscan for a large rows array", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display: block; height: 300px;"
          ></md-data-grid>`,
        )
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10000);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const rows = el.shadowRoot.querySelectorAll(".data-grid__row");
      expect(rows.length).to.be.lessThan(50);
    });

    it("getVisibleRows() matches the actually-rendered rows after scrolling", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display: block; height: 300px;"
          ></md-data-grid>`,
        )
      );
      el.columns = COLUMNS;
      el.rows = makeRows(500);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const viewport = el.shadowRoot.querySelector(".data-grid__viewport");
      viewport.scrollTop = 2000;
      viewport.dispatchEvent(new Event("scroll"));
      await settle();
      await el.updateComplete;

      const visible = el.getVisibleRows();
      const renderedRowIndexes = Array.from(
        el.shadowRoot.querySelectorAll("md-data-cell"),
      )
        .filter((/** @type {any} */ cell) => cell.colIndex === 0)
        .map((/** @type {any} */ cell) => cell.rowIndex);

      expect(visible.map((v) => v.rowIndex)).to.deep.equal(renderedRowIndexes);
    });

    it("adds a header gutter matching the viewport's scrollbar width when a scrollbar is present", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display: block; height: 200px; width: 300px;"
          ></md-data-grid>`,
        )
      );
      el.columns = COLUMNS;
      el.rows = makeRows(500); // spacer is way taller than the viewport -> scrollbar appears
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const viewport = el.shadowRoot.querySelector(".data-grid__viewport");
      const scrollbarWidth = viewport.offsetWidth - viewport.clientWidth;
      const gutter = el.shadowRoot.querySelector(".data-grid__header-gutter");

      if (scrollbarWidth > 0) {
        expect(gutter).to.exist;
        const header = el.shadowRoot.querySelector(".data-grid__header");
        expect(header.style.gridTemplateColumns).to.contain(
          `${scrollbarWidth}px`,
        );
      } else {
        // headless environments without a rendered scrollbar (e.g. overlay
        // scrollbars with 0 width) legitimately have no gutter to add
        expect(gutter).to.be.null;
      }
    });

    it("renders no header gutter when the content fits without a scrollbar", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display: block; height: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = COLUMNS;
      el.rows = makeRows(2); // fits comfortably, no scrollbar
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      expect(el.shadowRoot.querySelector(".data-grid__header-gutter")).to.be
        .null;
    });
  });

  describe("events", () => {
    it("dispatches md-data-grid-row-click with the correct detail", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(2);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const rowEl = el.shadowRoot.querySelector(".data-grid__row");
      let detail;
      el.addEventListener("md-data-grid-row-click", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });
      rowEl.dispatchEvent(new Event("click", { bubbles: true }));

      expect(detail.rowIndex).to.equal(0);
      expect(detail.row.id).to.equal(0);
    });
  });

  describe("getRowId", () => {
    it("defaults to row.id", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [{ id: "custom-1", name: "A" }];
      await el.updateComplete;

      expect(el.getRowId(el.rows[0])).to.equal("custom-1");
    });

    it("supports a custom override", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.getRowId = (row) => /** @type {any} */ (row).uuid;
      el.columns = COLUMNS;
      el.rows = [{ uuid: "abc", name: "A" }];
      await el.updateComplete;

      expect(el.getRowId(el.rows[0])).to.equal("abc");
    });
  });

  describe("pagination — client mode", () => {
    it("slices rows to the current page", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 1, pageSize: 4 };
      await el.updateComplete;

      expect(el._effectiveRows.map((r) => r.id)).to.deep.equal([4, 5, 6, 7]);
    });

    it("renders md-data-footer with the correct count text and prev/next disabled state", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 0, pageSize: 4 };
      await el.updateComplete;

      const footer = /** @type {any} */ (
        el.shadowRoot.querySelector("md-data-footer")
      );
      expect(footer).to.exist;
      await footer.updateComplete;

      const prev = footer.shadowRoot.querySelector('[part="footer-prev"]');
      const next = footer.shadowRoot.querySelector('[part="footer-next"]');
      expect(prev.disabled).to.be.true;
      expect(next.disabled).to.be.false;
    });

    it("prev/next disabled state flips at the last page", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 2, pageSize: 4 }; // pages: [0-3][4-7][8-9]
      await el.updateComplete;

      const footer = /** @type {any} */ (
        el.shadowRoot.querySelector("md-data-footer")
      );
      await footer.updateComplete;

      const prev = footer.shadowRoot.querySelector('[part="footer-prev"]');
      const next = footer.shadowRoot.querySelector('[part="footer-next"]');
      expect(prev.disabled).to.be.false;
      expect(next.disabled).to.be.true;
    });
  });

  describe("pagination — server mode", () => {
    it("does not slice rows client-side; rowCount drives pageCount", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.paginationMode = "server";
      el.rows = makeRows(4); // just one page's worth
      el.rowCount = 42;
      el.paginationModel = { page: 0, pageSize: 4 };
      await el.updateComplete;

      expect(el._effectiveRows.length).to.equal(4);
      expect(el._pageCount).to.equal(Math.ceil(42 / 4));
    });

    it("changing pages dispatches md-data-grid-pagination-model-change without mutating rows", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.paginationMode = "server";
      const page0Rows = makeRows(4);
      el.rows = page0Rows;
      el.rowCount = 42;
      el.paginationModel = { page: 0, pageSize: 4 };
      await el.updateComplete;

      let detail;
      el.addEventListener("md-data-grid-pagination-model-change", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });

      el.setPage(1);

      expect(detail).to.deep.equal({ page: 1, pageSize: 4 });
      expect(el.rows).to.equal(page0Rows); // untouched by the grid itself
    });
  });

  describe("setPage / setPageSize", () => {
    it("clamps setPage to [0, pageCount - 1]", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 0, pageSize: 4 }; // pageCount = 3

      el.setPage(99);
      expect(el.paginationModel.page).to.equal(2);

      el.setPage(-5);
      expect(el.paginationModel.page).to.equal(0);
    });

    it("setPageSize resets page to 0", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 2, pageSize: 4 };

      el.setPageSize(5);
      expect(el.paginationModel).to.deep.equal({ page: 0, pageSize: 5 });
    });

    it("does nothing when pagination is not enabled", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);

      el.setPage(1);
      expect(el.paginationModel).to.be.undefined;
    });
  });

  describe("hidePagination", () => {
    it("hides md-data-footer while keeping pagination logic active", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 1, pageSize: 4 };
      el.hidePagination = true;
      await el.updateComplete;

      expect(el.shadowRoot.querySelector("md-data-footer")).to.be.null;
      expect(el._effectiveRows.map((r) => r.id)).to.deep.equal([4, 5, 6, 7]);
    });

    it("setPage still works and still dispatches the event when hidden", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(10);
      el.paginationModel = { page: 0, pageSize: 4 };
      el.hidePagination = true;
      await el.updateComplete;

      let fired = false;
      el.addEventListener("md-data-grid-pagination-model-change", () => {
        fired = true;
      });
      el.setPage(1);

      expect(fired).to.be.true;
      expect(el.paginationModel.page).to.equal(1);
    });
  });

  describe("keyboard navigation", () => {
    it("focusing a cell updates focusedCell and moves tabindex", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const cells = /** @type {any[]} */ (
        Array.from(el.shadowRoot.querySelectorAll("md-data-cell"))
      );
      const secondRowFirstCell = cells.find(
        (c) => c.rowIndex === 1 && c.colIndex === 0,
      );
      await secondRowFirstCell.updateComplete;
      secondRowFirstCell.dispatchEvent(new Event("focus"));
      await el.updateComplete;

      expect(el._gridContextProvider.value.focusedCell).to.deep.equal({
        rowIndex: 1,
        colIndex: 0,
      });
    });

    it("ArrowRight moves focus to the next column", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      const viewport = el.shadowRoot.querySelector(".data-grid__viewport");
      viewport.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await el.updateComplete;

      expect(el._gridContextProvider.value.focusedCell).to.deep.equal({
        rowIndex: 0,
        colIndex: 1,
      });
    });
  });

  describe("updateRows", () => {
    it("deletes a row matching _action: 'delete'", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3);
      await el.updateComplete;

      el.updateRows([{ id: 1, _action: "delete" }]);
      await el.updateComplete;

      expect(el.rows.map((r) => r.id)).to.deep.equal([0, 2]);
    });

    it("shallow-merges an entry without _action onto the matching row", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [{ id: 1, name: "Old", extra: "kept" }];
      await el.updateComplete;

      el.updateRows([{ id: 1, name: "New" }]);
      await el.updateComplete;

      expect(el.rows).to.deep.equal([{ id: 1, name: "New", extra: "kept" }]);
    });

    it("inserts a new row (appended to the end) when no existing row matches", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(2); // ids 0, 1
      await el.updateComplete;

      el.updateRows([{ id: 5, name: "Five" }]);
      await el.updateComplete;

      expect(el.rows.map((r) => r.id)).to.deep.equal([0, 1, 5]);
      expect(el.rows[2]).to.deep.equal({ id: 5, name: "Five" });
    });

    it("does not leak _action into the stored row data", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [];
      await el.updateComplete;

      el.updateRows([{ id: 1, name: "A" }]);
      await el.updateComplete;

      expect(el.rows[0]).to.not.have.property("_action");
    });

    it("applies a mixed batch (delete + update + insert) in a single rows reassignment", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3); // ids 0, 1, 2
      await el.updateComplete;

      el.updateRows([
        { id: 0, _action: "delete" },
        { id: 1, name: "Updated" },
        { id: 9, name: "New" },
      ]);
      await el.updateComplete;

      expect(el.rows).to.deep.equal([
        { id: 1, name: "Updated" },
        { id: 2, name: "Row 2" },
        { id: 9, name: "New" },
      ]);
    });

    it("accepts a single object instead of an array", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(1);
      await el.updateComplete;

      el.updateRows({ id: 0, name: "Solo" });
      await el.updateComplete;

      expect(el.rows[0].name).to.equal("Solo");
    });

    it("matches entries via the grid's configured getRowId, not a literal .id", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.getRowId = (row) => /** @type {any} */ (row).uuid;
      el.rows = [{ uuid: "a", name: "Alpha" }];
      await el.updateComplete;

      el.updateRows([{ uuid: "a", name: "Alpha Updated" }]);
      await el.updateComplete;

      expect(el.rows).to.deep.equal([{ uuid: "a", name: "Alpha Updated" }]);
    });

    it("warns and skips entries with no resolvable id, still applying the rest of the batch", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(1);
      await el.updateComplete;

      const originalWarn = console.warn;
      let warned = false;
      console.warn = () => {
        warned = true;
      };
      try {
        el.updateRows([{ name: "no id here" }, { id: 5, name: "Five" }]);
      } finally {
        console.warn = originalWarn;
      }
      await el.updateComplete;

      expect(warned).to.be.true;
      expect(el.rows.map((r) => r.id)).to.deep.equal([0, 5]);
    });

    it("is a no-op (no rows reassignment) when nothing actually changes", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(2);
      await el.updateComplete;
      const originalRows = el.rows;

      el.updateRows([{ id: 999, _action: "delete" }]); // doesn't exist

      expect(el.rows).to.equal(originalRows);
    });

    it("dispatches md-data-grid-rows-update with added/updated/deleted ids", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(2); // ids 0, 1
      await el.updateComplete;

      let detail;
      el.addEventListener("md-data-grid-rows-update", (e) => {
        detail = /** @type {CustomEvent} */ (e).detail;
      });

      el.updateRows([
        { id: 0, _action: "delete" },
        { id: 1, name: "Updated" },
        { id: 9, name: "New" },
      ]);

      expect(detail).to.deep.equal({ added: [9], updated: [1], deleted: [0] });
    });

    it("clamps paginationModel.page if the change empties the current page (client mode)", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(9);
      el.paginationModel = { page: 2, pageSize: 4 }; // pages: [0-3][4-7][8] -> page 2 has just row 8
      await el.updateComplete;

      el.updateRows([{ id: 8, _action: "delete" }]);
      await el.updateComplete;

      expect(el.paginationModel.page).to.equal(1); // clamped: only 2 pages left now
    });
  });

  describe("column sizing", () => {
    it("uses a fixed px track when width is set, ignoring minWidth/maxWidth", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "id", width: 100, minWidth: 50, maxWidth: 500 }];
      el.rows = [];
      await el.updateComplete;

      const header = el.shadowRoot.querySelector(".data-grid__header");
      expect(header.style.gridTemplateColumns.trim()).to.equal("100px");
    });

    it("stays a bare 1fr track when neither minWidth nor maxWidth is set", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "name" }];
      el.rows = [];
      await el.updateComplete;

      const header = el.shadowRoot.querySelector(".data-grid__header");
      expect(header.style.gridTemplateColumns.trim()).to.equal("1fr");
    });

    it("uses minmax(0, {maxWidth}px) when only maxWidth is set", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "name", maxWidth: 300 }];
      el.rows = [];
      await el.updateComplete;

      const header = el.shadowRoot.querySelector(".data-grid__header");
      // the browser normalizes the unitless 0 we pass in to "0px"
      expect(header.style.gridTemplateColumns.trim()).to.equal(
        "minmax(0px, 300px)",
      );
    });

    it("uses minmax({minWidth}px, 1fr) when only minWidth is set", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "name", minWidth: 120 }];
      el.rows = [];
      await el.updateComplete;

      const header = el.shadowRoot.querySelector(".data-grid__header");
      expect(header.style.gridTemplateColumns.trim()).to.equal(
        "minmax(120px, 1fr)",
      );
    });

    it("combines minWidth and maxWidth into one minmax() track", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "name", minWidth: 120, maxWidth: 300 }];
      el.rows = [];
      await el.updateComplete;

      const header = el.shadowRoot.querySelector(".data-grid__header");
      expect(header.style.gridTemplateColumns.trim()).to.equal(
        "minmax(120px, 300px)",
      );
    });
  });

  describe("header colSpan", () => {
    it("renders one header per column when colSpan is unset", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS; // 2 columns
      el.rows = [];
      await el.updateComplete;

      const headers = el.shadowRoot.querySelectorAll("md-data-column-header");
      expect(headers.length).to.equal(2);
      expect(/** @type {any} */ (headers[0]).colSpan).to.equal(1);
    });

    it("skips the header cells covered by a preceding colSpan", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "a", colSpan: 2 }, { field: "b" }, { field: "c" }];
      el.rows = [];
      await el.updateComplete;

      const headers = /** @type {any[]} */ (
        Array.from(el.shadowRoot.querySelectorAll("md-data-column-header"))
      );
      // "b"'s header cell is covered by "a"'s span and never renders.
      expect(headers.map((h) => h.column.field)).to.deep.equal(["a", "c"]);
      expect(headers[0].colSpan).to.equal(2);
      expect(headers[1].colSpan).to.equal(1);
    });

    it("applies grid-column: span N directly on the spanning header host", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "a", colSpan: 3 }, { field: "b" }, { field: "c" }];
      el.rows = [];
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelector("md-data-column-header")
      );
      await header.updateComplete;
      expect(header.style.gridColumn).to.equal("span 3");
    });

    it("clamps colSpan so it never reaches past the last column", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "a" }, { field: "b", colSpan: 5 }];
      el.rows = [];
      await el.updateComplete;

      const headers = /** @type {any[]} */ (
        Array.from(el.shadowRoot.querySelectorAll("md-data-column-header"))
      );
      expect(headers.map((h) => h.column.field)).to.deep.equal(["a", "b"]);
      expect(headers[1].colSpan).to.equal(1); // clamped from 5 down to the 1 remaining column
    });

    it("still renders every data cell per row regardless of header colSpan", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [{ field: "a", colSpan: 2 }, { field: "b" }, { field: "c" }];
      el.rows = [{ a: 1, b: 2, c: 3 }];
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      expect(el.shadowRoot.querySelectorAll("md-data-cell").length).to.equal(3);
    });
  });

  describe("empty state", () => {
    it("shows 'No rows' centered when there are no rows", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [];
      await el.updateComplete;

      const emptyState = el.shadowRoot.querySelector('[part="empty-state"]');
      expect(emptyState).to.exist;
      expect(emptyState.textContent.trim()).to.equal("No rows");
      expect(el.shadowRoot.querySelector(".data-grid__row")).to.be.null;
    });

    it("hides the empty state once rows are added", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [];
      await el.updateComplete;
      expect(el.shadowRoot.querySelector('[part="empty-state"]')).to.exist;

      el.rows = makeRows(3);
      await el.updateComplete;
      await settle();
      await el.updateComplete;

      expect(el.shadowRoot.querySelector('[part="empty-state"]')).to.be.null;
      expect(el.shadowRoot.querySelectorAll(".data-grid__row").length).to.equal(
        3,
      );
    });

    it("shows the empty state when pagination leaves the current page with zero rows", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [];
      el.paginationModel = { page: 0, pageSize: 10 };
      await el.updateComplete;

      expect(el.shadowRoot.querySelector('[part="empty-state"]')).to.exist;
    });

    it("replaces the default text with slot=empty-label content", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`
          <md-data-grid>
            <span slot="empty-label">Nothing to see here</span>
          </md-data-grid>
        `)
      );
      el.columns = COLUMNS;
      el.rows = [];
      await el.updateComplete;

      // .textContent on a shadow-DOM ancestor of a <slot> only ever reflects
      // the slot's own fallback children (its literal DOM children) — the
      // light-DOM assigned nodes live elsewhere in the tree and are only
      // visually flattened through the slot. assignedElements() is the
      // correct way to check what's actually slotted.
      const slot = /** @type {HTMLSlotElement} */ (
        el.shadowRoot.querySelector('slot[name="empty-label"]')
      );
      const assigned = slot.assignedElements();
      expect(assigned).to.have.lengthOf(1);
      expect(assigned[0].textContent.trim()).to.equal("Nothing to see here");
    });

    it("falls back to the default 'No rows' text when nothing is slotted", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = [];
      await el.updateComplete;

      const slot = /** @type {HTMLSlotElement} */ (
        el.shadowRoot.querySelector('slot[name="empty-label"]')
      );
      expect(slot.assignedElements()).to.have.lengthOf(0);
      expect(slot.textContent.trim()).to.equal("No rows");
    });
  });

  describe("CSS parts", () => {
    it("puts part on the spacer and rows containers", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(3);
      await el.updateComplete;

      expect(el.shadowRoot.querySelector('[part="spacer"]')).to.exist;
      expect(el.shadowRoot.querySelector('[part="rows"]')).to.exist;
    });

    it("forwards nested sub-component parts via exportparts", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = COLUMNS;
      el.rows = makeRows(1);
      el.paginationModel = { page: 0, pageSize: 10 };
      await el.updateComplete;

      // md-data-cell also has no wrapper div — part="cell" lives directly
      // on its own tag, so it needs no exportparts entry either.
      const cell = el.shadowRoot.querySelector("md-data-cell");
      expect(cell.getAttribute("part")).to.equal("cell");
      expect(cell.getAttribute("exportparts")).to.be.null;
      // md-data-column-header has no wrapper div — part="header-cell" lives
      // on its own tag (a light-DOM child of md-data-grid's shadow root),
      // so it's already reachable directly and needs no exportparts entry.
      // "separator" still lives one shadow root deeper (on
      // md-data-column-separator's own tag) and does need forwarding.
      const header = el.shadowRoot.querySelector("md-data-column-header");
      expect(header.getAttribute("part")).to.equal("header-cell");
      expect(header.getAttribute("exportparts")).to.equal("separator, title");
      // md-data-footer also has no wrapper div — part="footer" lives
      // directly on its own tag. The other footer parts (count,
      // prev/next buttons, page-size select) are genuine children inside
      // its shadow root and still need forwarding.
      const footer = el.shadowRoot.querySelector("md-data-footer");
      expect(footer.getAttribute("part")).to.equal("footer");
      const footerExportparts = footer.getAttribute("exportparts");
      expect(footerExportparts).to.not.contain("footer,");
      expect(footerExportparts).to.contain("footer-prev");
    });
  });

  describe("column resize", () => {
    /**
     * md-data-column-separator is itself the interactive hit-area (no
     * wrapper div — pointer listeners and part live directly on the host).
     * @param {any} header
     */
    const getHandle = async (header) => {
      await header.updateComplete;
      const separator = header.shadowRoot.querySelector(
        "md-data-column-separator",
      );
      await separator.updateComplete;
      return separator;
    };

    /** @param {any} handle @param {number} clientX */
    const pointerDown = (handle, clientX) =>
      handle.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 1,
          clientX,
          bubbles: true,
        }),
      );
    /** @param {any} handle @param {number} clientX */
    const pointerMove = (handle, clientX) =>
      handle.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX,
          bubbles: true,
        }),
      );
    /** @param {any} handle @param {number} clientX */
    const pointerUp = (handle, clientX) =>
      handle.dispatchEvent(
        new PointerEvent("pointerup", { pointerId: 1, clientX, bubbles: true }),
      );

    it("drags a column wider, trading width with its right neighbor (total width unchanged)", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);
      expect(handle).to.exist;

      pointerDown(handle, 100);
      pointerMove(handle, 140);
      pointerUp(handle, 140);
      await el.updateComplete;

      expect(el.columns[0].width).to.equal(140);
      expect(el.columns[1].width).to.equal(60);
    });

    it("paints the drag directly onto the DOM without mutating columns until the drag ends", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      const originalColumns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.columns = originalColumns;
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      pointerDown(handle, 100);
      pointerMove(handle, 140);

      // Mid-drag: the DOM already reflects the new (traded) widths...
      const headerRow = el.shadowRoot.querySelector(".data-grid__header");
      const bodyRow = el.shadowRoot.querySelector(".data-grid__row");
      expect(headerRow.style.gridTemplateColumns).to.equal("140px 60px");
      expect(bodyRow.style.gridTemplateColumns).to.equal("140px 60px");
      // ...but columns itself is untouched — no reactive re-render has run.
      expect(el.columns).to.equal(originalColumns);
      expect(el.columns[0].width).to.equal(100);

      pointerUp(handle, 140);
      await el.updateComplete;

      // On release, the real (reactive) commit happens.
      expect(el.columns).to.not.equal(originalColumns);
      expect(el.columns[0].width).to.equal(140);
    });

    it("sets a col-resize cursor on the document body for the duration of the drag", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      expect(document.body.style.cursor).to.not.equal("col-resize");
      pointerDown(handle, 100);
      expect(document.body.style.cursor).to.equal("col-resize");
      pointerMove(handle, 140);
      expect(document.body.style.cursor).to.equal("col-resize");
      pointerUp(handle, 140);
      expect(document.body.style.cursor).to.not.equal("col-resize");
    });

    it("clamps to minWidth/maxWidth, and to a 40px floor when neither is set", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        {
          field: "a",
          headerName: "A",
          width: 100,
          minWidth: 80,
          maxWidth: 150,
        },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      pointerDown(handle, 100);
      pointerMove(handle, 500);
      pointerUp(handle, 500);
      await el.updateComplete;
      expect(el.columns[0].width).to.equal(150);

      el.columns = [
        {
          field: "a",
          headerName: "A",
          width: 100,
          minWidth: 80,
          maxWidth: 150,
        },
        { field: "b", headerName: "B", width: 100 },
      ];
      await el.updateComplete;
      const header2 = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle2 = await getHandle(header2);
      pointerDown(handle2, 100);
      pointerMove(handle2, -500);
      pointerUp(handle2, -500);
      await el.updateComplete;
      expect(el.columns[0].width).to.equal(80);
    });

    it("floors at 40px when neither minWidth nor maxWidth is set", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      pointerDown(handle, 100);
      pointerMove(handle, -500);
      pointerUp(handle, -500);
      await el.updateComplete;
      expect(el.columns[0].width).to.equal(40);
    });

    it("dispatches md-data-grid-column-resize with start/resize/end phases", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      const phases = [];
      el.addEventListener("md-data-grid-column-resize", (e) =>
        phases.push({ ...e.detail }),
      );

      pointerDown(handle, 100);
      pointerMove(handle, 130);
      pointerUp(handle, 130);
      await el.updateComplete;

      expect(phases.map((p) => p.phase)).to.deep.equal([
        "start",
        "resize",
        "end",
      ]);
      expect(phases[0].field).to.equal("a");
      expect(phases[0].colIndex).to.equal(0);
      expect(phases[2].width).to.equal(130);
    });

    it("resizable: false on a column renders a non-interactive separator (no handle)", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100, resizable: false },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      await header.updateComplete;
      const separator = header.shadowRoot.querySelector(
        "md-data-column-separator",
      );
      // The divider itself still renders (every column boundary keeps its
      // line) — only the drag interaction is disabled.
      expect(separator).to.exist;
      expect(separator.resizable).to.be.false;
      const handle = await getHandle(header);
      expect(handle.hasAttribute("resizable")).to.be.false;
    });

    it("disable-column-resize on the grid disables every separator's interactivity", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid disable-column-resize></md-data-grid>`)
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const headers = /** @type {any[]} */ ([
        ...el.shadowRoot.querySelectorAll("md-data-column-header"),
      ]);
      for (const header of headers) {
        const handle = await getHandle(header);
        expect(handle.hasAttribute("resizable")).to.be.false;
      }
    });

    it("the last column's separator is non-interactive (no partner to trade with)", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(html`<md-data-grid></md-data-grid>`)
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const headers = /** @type {any[]} */ ([
        ...el.shadowRoot.querySelectorAll("md-data-column-header"),
      ]);
      const handle = await getHandle(headers[1]);
      expect(handle).to.exist;
      expect(handle.hasAttribute("resizable")).to.be.false;
    });

    it("a colSpan header's handle resizes the last covered column, not its own field", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100, colSpan: 2 },
        { field: "b", headerName: "B", width: 100 },
        { field: "c", headerName: "C", width: 100 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      // colSpan collapses columns[1]'s own header cell, so the spanning
      // header (columns[0]) is the first rendered md-data-column-header.
      const spanningHeader = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      await spanningHeader.updateComplete;
      expect(spanningHeader.resizeColIndex).to.equal(1);

      const handle = await getHandle(spanningHeader);
      pointerDown(handle, 100);
      pointerMove(handle, 150);
      pointerUp(handle, 150);
      await el.updateComplete;

      expect(el.columns[0].width).to.equal(100);
      expect(el.columns[1].width).to.equal(150);
      expect(el.columns[2].width).to.equal(50);
    });

    it("caps the trade at whichever column's own min/max is hit first, keeping the pair's combined width constant", async () => {
      const el = /** @type {MdDataGrid} */ (
        await fixture(
          html`<md-data-grid
            style="display:block; width: 400px;"
          ></md-data-grid>`,
        )
      );
      el.columns = [
        { field: "a", headerName: "A", width: 100 },
        { field: "b", headerName: "B", width: 100, minWidth: 70 },
      ];
      el.rows = makeRows(1);
      await el.updateComplete;

      const header = /** @type {any} */ (
        el.shadowRoot.querySelectorAll("md-data-column-header")[0]
      );
      const handle = await getHandle(header);

      // Drag far to the right — B's own minWidth (70) should cap the trade
      // before A's (unset, 40px-floor) bound ever comes into play.
      pointerDown(handle, 100);
      pointerMove(handle, 200);
      pointerUp(handle, 200);
      await el.updateComplete;

      expect(el.columns[0].width).to.equal(130);
      expect(el.columns[1].width).to.equal(70);
      expect(el.columns[0].width + el.columns[1].width).to.equal(200);
    });
  });
});
