/**
 * Iterating a node (`for...of` / `[...node]`) walks pre-order: itself,
 * then every descendant.
 * @template T
 * @typedef {{
 *   children: Map<PropertyKey, IndexTree<T>>,
 *   parent: IndexTree<T> | null,
 *   key: PropertyKey | null,
 *   readonly size: number,
 *   [Symbol.iterator](): IterableIterator<IndexTree<T>>,
 * }} IndexTree
 */

/**
 * An `IndexTree` node with the row's own fields merged onto it — what
 * `TreeController.build()` actually produces for every row (see
 * `Object.assign(node, row)` below). `createEmptyIndexTree()` itself only
 * returns a plain `IndexTree<T>`, since at that point there's no row to
 * merge in yet.
 * @template T
 * @typedef {IndexTree<T> & T} IndexTreeNode
 */

/**
 * Sentinel key for the tree's root node — never a real row id, so code can
 * always tell "this is the root" apart from "this is a row" by comparing
 * `node.key` against it (mirrors MUI's `GRID_ROOT_GROUP_ID`).
 */
export const DATA_GRID_ROOT_GROUP_ID = "__data_grid_root_group__";

/**
 * Creates an empty tree node. A node doubles as the row it represents once
 * built — `TreeController.build()` copies the row's own fields directly
 * onto the node (`Object.assign(node, row)`), turning it into an
 * `IndexTreeNode<T>`. That's what makes `for...of node` / `[...node]`
 * already a flat array of that node and its descendants, pre-order, with
 * no separate flatten step: iterating a row IS iterating the rows nested
 * under it.
 * @template T
 * @returns {IndexTree<T>}
 */
export function createEmptyIndexTree() {
  return {
    children: new Map(),
    parent: null,
    key: null,
    [Symbol.iterator]: function* iterate() {
      yield this;
      for (const [, child] of this.children) yield* child;
    },
    get size() {
      return [...this[Symbol.iterator]()].length;
    },
  };
}

/**
 * The subset of `md-data-grid` a `TreeController` actually needs — not the
 * full element, just what building a tree out of its rows requires.
 * @typedef {{
 *   rows: Record<string, unknown>[],
 *   getRowId: (row: Record<string, unknown>) => PropertyKey,
 * }} TreeControllerHost
 */

/**
 * Owns the row hierarchy for `md-data-grid` as an `IndexTree` — groundwork
 * for `treeData` (grouped/nested rows, rendered by a future `treeData`
 * attribute) and selection checkboxes (which need parent/child
 * relationships to select descendants and derive indeterminate state).
 * Neither feature is implemented here. The grid builds a tree by default
 * on every `rows`/`getRowId` change (see `data-grid.js`'s `updated()`);
 * until a grouping function exists, `build()` puts every row directly
 * under the root — flat, one level deep — so the tree's membership and
 * order match `host.rows` exactly. Nothing here is wired into rendering
 * yet; `host.rows` (not the tree) still drives sort/pagination/virtualization.
 */
export class TreeController {
  /** @param {TreeControllerHost} host */
  constructor(host) {
    this.host = host;

    /** @type {IndexTree<Record<string, unknown>>} */
    this.tree = createEmptyIndexTree();
    this.tree.key = DATA_GRID_ROOT_GROUP_ID;
  }

  /**
   * (Re)builds the tree from `rows`, replacing whatever tree existed
   * before. Every row becomes a direct child of the root — grouping rows
   * under other rows by some parent relationship is future `treeData`
   * work, not implemented here.
   * @param {Record<string, unknown>[]} [rows]
   * @returns {IndexTree<Record<string, unknown>>} the new root — also
   * available afterwards via `this.tree`
   */
  build(rows = this.host.rows) {
    const root = createEmptyIndexTree();
    root.key = DATA_GRID_ROOT_GROUP_ID;

    for (const row of rows) {
      const id = this.host.getRowId(row);
      const node = createEmptyIndexTree();
      Object.assign(node, row);
      node.parent = root;
      node.key = id;
      root.children.set(id, node);
    }

    this.tree = root;
    return root;
  }

  /**
   * Flat, pre-order array of every row currently in the tree. The root
   * itself is never included — it's the `DATA_GRID_ROOT_GROUP_ID` sentinel
   * with no row fields on it, always the first value `[...this.tree]`
   * yields, so this is that same spread with the sentinel dropped.
   * @returns {IndexTreeNode<Record<string, unknown>>[]}
   */
  get rows() {
    return /** @type {IndexTreeNode<Record<string, unknown>>[]} */ (
      [...this.tree].slice(1)
    );
  }

  /**
   * Finds a node anywhere in the tree by row id (not just direct
   * children of the root) — for `treeData`, a row's id can be nested at
   * any depth.
   * @param {PropertyKey} id
   * @returns {IndexTreeNode<Record<string, unknown>> | undefined}
   */
  getNode(id) {
    for (const node of this.tree) {
      if (node.key === id)
        return /** @type {IndexTreeNode<Record<string, unknown>>} */ (node);
    }
    return undefined;
  }
}
