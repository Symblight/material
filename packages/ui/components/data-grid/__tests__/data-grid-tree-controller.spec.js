import { expect, fixture, html } from "@open-wc/testing";

import "../index.js";
import {
  DATA_GRID_ROOT_GROUP_ID,
  createEmptyIndexTree,
  TreeController,
} from "../controllers/data-grid-tree-controller.js";
/** @import { MdDataGrid } from "../data-grid.js" */

/** @param {number} count */
function makeRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
  }));
}

/**
 * @param {Record<string, unknown>[]} rows
 * @returns {import("../controllers/data-grid-tree-controller.js").TreeControllerHost}
 */
function makeHost(rows) {
  return {
    rows,
    getRowId: (row) => /** @type {{ id: PropertyKey }} */ (row).id,
  };
}

describe("createEmptyIndexTree", () => {
  it("starts with no children, no parent, and a null key", () => {
    const node = createEmptyIndexTree();
    expect(node.children.size).to.equal(0);
    expect(node.parent).to.equal(null);
    expect(node.key).to.equal(null);
  });

  it("iterates to just itself when it has no children", () => {
    const node = createEmptyIndexTree();
    expect([...node]).to.deep.equal([node]);
    expect(node.size).to.equal(1);
  });

  it("iterates itself before descending into children, pre-order", () => {
    const root = createEmptyIndexTree();
    const child = createEmptyIndexTree();
    child.key = "a";
    child.parent = root;
    root.children.set("a", child);

    expect([...root]).to.deep.equal([root, child]);
    expect(root.size).to.equal(2);
  });

  it("recurses into grandchildren", () => {
    const root = createEmptyIndexTree();
    const child = createEmptyIndexTree();
    child.key = "a";
    child.parent = root;
    root.children.set("a", child);

    const grandchild = createEmptyIndexTree();
    grandchild.key = "b";
    grandchild.parent = child;
    child.children.set("b", grandchild);

    expect([...root]).to.deep.equal([root, child, grandchild]);
    expect(root.size).to.equal(3);
  });
});

describe("TreeController", () => {
  it("builds a root keyed by DATA_GRID_ROOT_GROUP_ID", () => {
    const controller = new TreeController(makeHost([]));
    controller.build();
    expect(controller.tree.key).to.equal(DATA_GRID_ROOT_GROUP_ID);
  });

  it("puts every row directly under the root", () => {
    const rows = makeRows(3);
    const controller = new TreeController(makeHost(rows));
    const root = controller.build();

    expect(root.children.size).to.equal(3);
    expect([...root.children.keys()]).to.deep.equal([0, 1, 2]);
  });

  it("copies each row's own fields onto its node", () => {
    const rows = makeRows(2);
    const controller = new TreeController(makeHost(rows));
    controller.build();

    const node = controller.getNode(1);
    expect(node?.id).to.equal(1);
    expect(node?.name).to.equal("Row 1");
    expect(node?.key).to.equal(1);
    expect(node?.parent).to.equal(controller.tree);
  });

  it("exposes a flat, root-free array of rows via the .rows getter", () => {
    const rows = makeRows(4);
    const controller = new TreeController(makeHost(rows));
    controller.build();

    expect(controller.rows.map((row) => row.id)).to.deep.equal([0, 1, 2, 3]);
    expect(controller.rows.every((row) => row.key !== DATA_GRID_ROOT_GROUP_ID))
      .to.be.true;
  });

  it("[...tree] on the root includes the root sentinel first", () => {
    const rows = makeRows(2);
    const controller = new TreeController(makeHost(rows));
    controller.build();

    const flat = [...controller.tree];
    expect(flat[0]).to.equal(controller.tree);
    expect(flat.length).to.equal(3);
  });

  it("defaults to building from host.rows when called with no argument", () => {
    const host = makeHost(makeRows(2));
    const controller = new TreeController(host);
    controller.build();

    expect(controller.rows.map((row) => row.id)).to.deep.equal([0, 1]);
  });

  it("replaces the previous tree entirely on rebuild", () => {
    const host = makeHost(makeRows(2));
    const controller = new TreeController(host);
    controller.build();
    const firstRoot = controller.tree;

    host.rows = makeRows(1);
    controller.build();

    expect(controller.tree).to.not.equal(firstRoot);
    expect(controller.rows.map((row) => row.id)).to.deep.equal([0]);
  });

  describe("getNode", () => {
    it("finds a direct child of the root by id", () => {
      const controller = new TreeController(makeHost(makeRows(3)));
      controller.build();

      const node = controller.getNode(1);
      expect(node?.id).to.equal(1);
    });

    it("returns undefined for an id that isn't in the tree", () => {
      const controller = new TreeController(makeHost(makeRows(3)));
      controller.build();

      expect(controller.getNode(99)).to.equal(undefined);
    });

    it("finds a node nested arbitrarily deep", () => {
      const controller = new TreeController(makeHost([]));
      controller.build();

      const child = createEmptyIndexTree();
      child.key = "child";
      child.parent = controller.tree;
      controller.tree.children.set("child", child);

      const grandchild = createEmptyIndexTree();
      grandchild.key = "grandchild";
      grandchild.parent = child;
      child.children.set("grandchild", grandchild);

      expect(controller.getNode("grandchild")).to.equal(grandchild);
    });
  });
});

describe("md-data-grid tree wiring", () => {
  it("builds a tree automatically when rows are set", async () => {
    const el = /** @type {MdDataGrid} */ (
      await fixture(html`<md-data-grid></md-data-grid>`)
    );
    el.rows = makeRows(3);
    await el.updateComplete;

    expect(el._tree.tree.key).to.equal(DATA_GRID_ROOT_GROUP_ID);
    expect(el._tree.rows.map((row) => row.id)).to.deep.equal([0, 1, 2]);
  });

  it("rebuilds the tree when getRowId changes", async () => {
    const el = /** @type {MdDataGrid} */ (
      await fixture(html`<md-data-grid></md-data-grid>`)
    );
    el.rows = [{ uid: "a" }, { uid: "b" }];
    el.getRowId = (row) => /** @type {{ uid: string }} */ (row).uid;
    await el.updateComplete;

    expect(el._tree.rows.map((row) => row.key)).to.deep.equal(["a", "b"]);
  });
});
